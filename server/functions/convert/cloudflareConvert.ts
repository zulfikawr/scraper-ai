import Cloudflare from "cloudflare";
import type { ScrapeOptions } from "@/types";
import logger from "../../utils/logger";

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;

const client = new Cloudflare({
  apiToken: CLOUDFLARE_API_KEY,
});

export async function cloudflareConvert(
  htmlContent: string,
  _options: ScrapeOptions,
): Promise<string> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_KEY) {
    throw new Error("Cloudflare account ID or API key not configured");
  }

  try {
    const markdown = await client.browserRendering.markdown.create({
      account_id: CLOUDFLARE_ACCOUNT_ID,
      html: htmlContent,
    });

    return markdown;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (err instanceof Cloudflare.APIError) {
      logger.error("Cloudflare API Error:", {
        message: err.message,
        errors: err.errors,
        status: err.status,
      });
    }

    logger.error("Cloudflare markdown conversion failed:", errorMessage);
    throw err;
  }
}
