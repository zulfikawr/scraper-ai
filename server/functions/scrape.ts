import { validateUrl } from "@/function/validateUrl";

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

export async function scrapeRawHtml(url: string): Promise<string> {
  const validUrl = validateUrl(url);
  const WORKER_URL = process.env.WORKER_URL;

  if (!WORKER_URL) {
    throw new Error("WORKER_URL environment variable is not set");
  }

  const proxyUrl = `${WORKER_URL}?url=${encodeURIComponent(validUrl)}`;

  console.log(`Fetching: ${validUrl}`);

  try {
    const response = await fetchWithTimeout(proxyUrl);
    const text = await response.text();

    if (text.length > 50) {
      return text;
    }
    throw new Error("Content too short");
  } catch (e: any) {
    console.error("Proxy failed:", e);
    throw new Error(`Failed to fetch via proxy: ${e.message}`);
  }
}
