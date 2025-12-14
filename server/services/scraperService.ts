import {
  scrapeRawHtml,
  cloudflareFetchRenderedHtml,
} from "../functions/scrape";
import { cleanHtml } from "../functions/clean";
import { convertToMarkdown } from "../functions/convert";
import { ScrapeOptions, ScrapeStatus, ScrapeYield } from "@/types";
import logger from "../utils/logger";

/**
 * Orchestrates the scraping flow using a Generator.
 * Yields status updates so the client can track progress (SCRAPING -> CLEANING -> CONVERTING).
 */
export async function* scrapeUrlGenerator(
  url: string,
  options: ScrapeOptions = {},
): AsyncGenerator<ScrapeYield> {
  try {
    // 1. SCRAPING
    yield { type: "status", status: ScrapeStatus.SCRAPING };
    yield {
      type: "log",
      level: "info",
      message: `Scraping: ${url} (useBrowser=${!!options.useBrowser})`,
    };

    const fetched = await scrapeRawHtml(url, options as any);
    const rawHtml = fetched.html;
    // Emit source-specific logs
    if (fetched.source === "proxy") {
      yield {
        type: "log",
        level: "info",
        message: `Worker proxy: fetching ${url} via ${fetched.proxyUrl}`,
      };
      yield {
        type: "log",
        level: "info",
        message: `Worker proxy: fetched HTML (${fetched.fetchedChars} chars)`,
      };
    } else if (fetched.source === "cloudflare") {
      yield {
        type: "log",
        level: "info",
        message: `Cloudflare: fetched rendered HTML (${fetched.fetchedChars} chars)`,
      };
      // Suggest that browser was used
      yield {
        type: "log",
        level: "info",
        message: `Fetched raw HTML url=${url} chars=${fetched.fetchedChars}`,
        autoEnableBrowser: true,
      };
    } else {
      yield {
        type: "log",
        level: "info",
        message: `Fetched raw HTML url=${url} chars=${rawHtml.length}`,
      };
    }

    // 2. CLEANING
    yield { type: "status", status: ScrapeStatus.CLEANING };
    const { title, cleanedHtml } = await cleanHtml(rawHtml, url);
    logger.info(
      "Cleaned HTML",
      `title=${title}`,
      `cleanedChars=${cleanedHtml.length}`,
    );

    // 3. CONVERTING
    yield { type: "status", status: ScrapeStatus.CONVERTING };
    yield { type: "log", level: "info", message: `Converting with Gemini...` };
    // Pass the full raw HTML to the converter (Cloudflare can process full HTML better)
    let markdown = await convertToMarkdown(rawHtml, options);

    // If markdown is empty, attempt automatic Cloudflare browser-rendered fetch and retry
    if (!markdown || markdown.trim().length === 0) {
      logger.warn(
        "Conversion produced empty markdown, attempting Cloudflare browser render and retry",
        `url=${url}`,
      );
      yield {
        type: "log",
        level: "warn",
        message:
          "Conversion produced empty markdown — retrying with Cloudflare Browser Rendering...",
        autoEnableBrowser: true,
      };

      try {
        const rendered = await cloudflareFetchRenderedHtml(url);
        yield {
          type: "log",
          level: "info",
          message: `Cloudflare: fetched rendered HTML (${rendered.length} chars)`,
        };
        // Retry conversion with rendered HTML
        markdown = await convertToMarkdown(rendered, {
          ...options,
          useBrowser: true,
        });
      } catch (err: any) {
        logger.warn("Cloudflare retry failed", (err as any)?.message || err);
        yield {
          type: "log",
          level: "error",
          message: `Cloudflare retry failed: ${(err as any)?.message || err}`,
        };
      }

      // If still empty, surface error
      if (!markdown || markdown.trim().length === 0) {
        const msg =
          "Content too short or empty after Cloudflare retry. Possible unsupported content.";
        logger.warn("Conversion empty after Cloudflare retry", `url=${url}`);
        throw new Error(msg);
      }
    }

    // 4. SUCCESS
    logger.info("Conversion succeeded", `markdownChars=${markdown.length}`);
    yield { type: "status", status: ScrapeStatus.SUCCESS };
    yield {
      type: "result",
      data: {
        url,
        title,
        html: rawHtml,
        markdown,
      },
    };
  } catch (error: any) {
    yield { type: "status", status: ScrapeStatus.ERROR };
    yield { type: "error", message: error.message || "Unknown error occurred" };
  }
}
