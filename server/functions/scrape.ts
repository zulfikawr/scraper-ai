import { validateUrl } from "@/function/validateUrl";
import type { ScrapeOptions } from "@/types";
import logger from "../utils/logger";

const FETCH_TIMEOUT_MS = 60000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function renderWithBrowser(url: string): Promise<string> {
  // This function was previously implemented with Playwright. Playwright
  // has been removed in favor of Cloudflare Browser Rendering. Keep this
  // placeholder to preserve function signature in case older code calls it.
  throw new Error(
    "local browser rendering removed; use Cloudflare Browser Rendering instead",
  );
}

export async function cloudflareFetchRenderedHtml(
  url: string,
): Promise<string> {
  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_KEY) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_KEY is not set");
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/browser-rendering/content`;

  logger.info(`Cloudflare: fetching rendered HTML for ${url}`);
  const response = await fetchWithTimeout(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
    },
    body: JSON.stringify({ url }),
  });

  const json = await response.json();
  if (!response.ok || json?.success !== true) {
    throw new Error(json?.errors?.[0]?.message || response.statusText);
  }

  logger.info(
    `Cloudflare: fetched rendered HTML (${String(json.result || "").length} chars)`,
  );
  return String(json.result || "");
}

/**
 * Fetches raw HTML for a URL. If `options.useBrowser` is true, attempts
 * to render the page with a headless browser (Playwright) and falls back
 * to the existing proxy fetch if browser rendering fails.
 */
export async function scrapeRawHtml(
  url: string,
  options: ScrapeOptions = {},
): Promise<{
  html: string;
  source: "cloudflare" | "proxy";
  proxyUrl?: string;
  fetchedChars: number;
}> {
  const validUrl = validateUrl(url);
  const WORKER_URL = process.env.WORKER_URL;

  logger.info(`Scraping: ${validUrl} (useBrowser=${!!options.useBrowser})`);

  // If browser rendering is requested, prefer Cloudflare's content endpoint
  if (options.useBrowser) {
    try {
      const rendered = await cloudflareFetchRenderedHtml(validUrl);
      if (rendered && rendered.length > 50)
        return {
          html: rendered,
          source: "cloudflare",
          fetchedChars: rendered.length,
        };
    } catch (err) {
      logger.warn(
        "Falling back to proxy fetch after Cloudflare render error",
        (err as any)?.message || err,
      );
    }
  }

  if (!WORKER_URL) {
    throw new Error("WORKER_URL environment variable is not set");
  }

  const proxyUrl = `${WORKER_URL}?url=${encodeURIComponent(validUrl)}`;

  try {
    logger.info(`Worker proxy: fetching ${validUrl} via ${WORKER_URL}`);
    const response = await fetchWithTimeout(proxyUrl);
    const text = await response.text();

    if (text.length > 50) {
      logger.info(`Worker proxy: fetched HTML (${text.length} chars)`);
      return {
        html: text,
        source: "proxy",
        proxyUrl,
        fetchedChars: text.length,
      };
    }
    throw new Error("Content too short");
  } catch (e: any) {
    logger.error("Proxy failed:", e);
    throw new Error(`Failed to fetch via proxy: ${(e as any).message}`);
  }
}
