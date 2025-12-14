import { aiConvert } from "./aiConvert";
import { fallbackConvert } from "./fallbackConvert";
import { cloudflareConvert } from "./cloudflareConvert";
import { convertWithWorkerAI } from "./workerAIConvert";
import { ScrapeOptions } from "@/types";
import logger from "../../utils/logger";

/**
 * Convert HTML into Markdown.
 * Preferred pipeline:
 * 1) User-chosen AI (Gemini or DeepSeek)
 * 2) Alternative AI (if primary fails)
 * 3) Cloudflare Browser Rendering /markdown endpoint
 * 4) Local Turndown fallback
 */

export async function convertToMarkdown(
  html: string,
  options: ScrapeOptions,
): Promise<string> {
  const primaryProvider = options.aiProvider || "gemini";
  const fallbackProvider = primaryProvider === "gemini" ? "deepseek" : "gemini";

  // 0) Try Worker AI (Primary)
  try {
    const result = await convertWithWorkerAI(html, options);
    if (result && result.trim().length > 0) {
      return result;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(
      `Worker AI failed with error, falling back to ${primaryProvider.toUpperCase()}:`,
      errorMessage,
    );
  }

  // 1) Try primary AI provider
  try {
    const result = await aiConvert(html, options, {
      provider: primaryProvider,
    });
    if (result && result.trim().length > 0) {
      return result;
    }
    logger.warn(
      `${primaryProvider.toUpperCase()} returned empty markdown, trying ${fallbackProvider.toUpperCase()}...`,
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(
      `${primaryProvider.toUpperCase()} failed with error, falling back to ${fallbackProvider.toUpperCase()}:`,
      errorMessage,
    );
  }

  // 2) Try fallback AI provider
  try {
    const result = await aiConvert(html, options, {
      provider: fallbackProvider,
    });
    if (result && result.trim().length > 0) {
      return result;
    }
    logger.warn(
      `${fallbackProvider.toUpperCase()} returned empty markdown, trying Cloudflare...`,
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(
      `${fallbackProvider.toUpperCase()} failed with error, falling back to Cloudflare:`,
      errorMessage,
    );
  }

  // 3) Try Cloudflare's markdown endpoint
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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.warn(
      "Cloudflare markdown failed, falling back to Turndown:",
      errorMessage,
    );
  }

  // 4) Local turndown fallback
  return await fallbackConvert(html, options);
}
