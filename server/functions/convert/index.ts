import { geminiConvert } from "./geminiConvert";
import { fallbackConvert } from "./fallbackConvert";
import { cloudflareConvert } from "./cloudflareConvert";
import { ScrapeOptions } from "@/types";
import logger from "../../utils/logger";

/**
 * Convert HTML into Markdown.
 * Preferred pipeline:
 *  1) Gemini AI conversion
 *  2) Cloudflare Browser Rendering /markdown endpoint
 *  3) Local Turndown fallback
 */
export async function convertToMarkdown(
  html: string,
  options: ScrapeOptions,
): Promise<string> {
  // 1) Try Gemini AI conversion first
  try {
    logger.info("Attempting Gemini AI conversion...");
    const gm = await geminiConvert(html, options);
    if (gm && gm.trim().length > 0) {
      logger.info("Gemini conversion succeeded", `length=${gm.length}`);
      return gm;
    }

    // If Gemini returned an empty string (not an exception), treat this as
    // a hard empty result — likely the content couldn't be extracted. Do
    // not continue to Cloudflare in this case; return empty so the caller
    // can surface an explicit error to the user.
    logger.warn("Gemini returned empty markdown — aborting further fallbacks");
    return "";
  } catch (error: any) {
    logger.warn(
      "Gemini failed with error, falling back to Cloudflare:",
      error?.message || error,
    );
  }

  // 2) Try Cloudflare's markdown endpoint
  try {
    logger.info("Attempting Cloudflare Browser Rendering markdown endpoint...");
    const cfMd = await cloudflareConvert(html, options);
    if (cfMd && cfMd.trim().length > 0) {
      logger.info("Cloudflare markdown succeeded", `length=${cfMd.length}`);
      return cfMd;
    }
    logger.warn(
      "Cloudflare returned empty markdown, falling back to local turndown",
    );
  } catch (err: any) {
    logger.warn(
      "Cloudflare markdown failed, falling back to Turndown:",
      err?.message || err,
    );
  }

  // 3) Local turndown fallback
  return await fallbackConvert(html, options);
}
