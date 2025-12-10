import type { ScrapeOptions } from "@/types";
import logger from "../../utils/logger";

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;

export async function cloudflareConvert(
  htmlContent: string,
  options: ScrapeOptions,
): Promise<string> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_KEY) {
    throw new Error("Cloudflare account ID or API key not configured");
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/browser-rendering/markdown`;

  const body: any = { html: htmlContent };

  // Allow users to pass some basic Cloudflare options via ScrapeOptions in future
  // (not used now but kept for extensibility)
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(
        `Cloudflare markdown API error: ${json?.errors?.[0]?.message || res.statusText}`,
      );
    }

    if (!json || json.success !== true) {
      throw new Error("Cloudflare markdown API returned unsuccessful response");
    }

    // The API returns result as a string containing the markdown
    return String(json.result || "");
  } catch (err: any) {
    logger.error("Cloudflare markdown conversion failed:", err?.message || err);
    throw err;
  }
}
