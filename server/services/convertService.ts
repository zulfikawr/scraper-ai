import {
  scrapeRawHtml,
  cloudflareFetchRenderedHtml,
} from "../functions/scrape";
import { cleanHtml } from "../functions/clean";
import { convertToMarkdown } from "../functions/convert";
import { ScrapeOptions, ScrapeStatus, ScrapeYield } from "@/types";
import logger from "../utils/logger";

// Define strict type for the metadata returned by scrapeRawHtml
interface ScrapeMetadata {
  source?: "cloudflare" | "proxy";
  proxyUrl?: string;
  fetchedChars?: number;
  html?: string;
}

/**
 * Orchestrates the scraping flow using a Generator.
 * Yields status updates so the client can track progress (SCRAPING -> CLEANING -> CONVERTING).
 * Accepts either a URL or raw HTML as input.
 */
export async function* convertGenerator(
  url: string | null,
  options: ScrapeOptions = {},
  rawHtmlInput?: string,
): AsyncGenerator<ScrapeYield> {
  try {
    // 1. SCRAPING (skip if rawHtmlInput provided)
    let rawHtml: string;
    let fetchedMetadata: ScrapeMetadata = {};

    if (rawHtmlInput) {
      // If HTML is provided directly, skip scraping
      rawHtml = rawHtmlInput;
      logger.info("Using provided HTML, skipping scrape step");
    } else {
      if (!url) {
        throw new Error("Either url or html must be provided");
      }

      yield { type: "status", status: ScrapeStatus.SCRAPING };
      yield {
        type: "log",
        level: "info",
        message: `Scraping: ${url} (useBrowser=${!!options.useBrowser})`,
      };

      const fetched = await scrapeRawHtml(url, options);
      rawHtml = fetched.html;
      fetchedMetadata = fetched;

      // Emit source-specific logs
      if (fetchedMetadata.source === "proxy") {
        yield {
          type: "log",
          level: "info",
          message: `Worker proxy: fetching ${url} via ${fetchedMetadata.proxyUrl}`,
        };
        yield {
          type: "log",
          level: "info",
          message: `Worker proxy: fetched HTML (${fetchedMetadata.fetchedChars} chars)`,
        };
      } else if (fetchedMetadata.source === "cloudflare") {
        yield {
          type: "log",
          level: "info",
          message: `Cloudflare: fetched rendered HTML (${fetchedMetadata.fetchedChars} chars)`,
        };
        // Suggest that browser was used
        yield {
          type: "log",
          level: "info",
          message: `Fetched raw HTML url=${url} chars=${fetchedMetadata.fetchedChars}`,
          autoEnableBrowser: true,
        };
      } else {
        yield {
          type: "log",
          level: "info",
          message: `Fetched raw HTML url=${url} chars=${rawHtml.length}`,
        };
      }
    }

    // 2. CLEANING
    yield { type: "status", status: ScrapeStatus.CLEANING };
    const { title, cleanedHtml } = await cleanHtml(rawHtml, url || "", options);
    logger.info(
      "Cleaned HTML",
      `title=${title}`,
      `cleanedChars=${cleanedHtml.length}`,
    );

    // 3. CONVERTING
    yield { type: "status", status: ScrapeStatus.CONVERTING };
    yield { type: "log", level: "info", message: `Converting with AI...` };

    // Pass the cleaned HTML to save tokens and improve focus for the AI
    let markdown = await convertToMarkdown(cleanedHtml, options);

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
        // Only retry with Cloudflare if we have a URL (not for HTML-only inputs)
        if (url) {
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
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.warn("Cloudflare retry failed", errorMessage);
        yield {
          type: "log",
          level: "error",
          message: `Cloudflare retry failed: ${errorMessage}`,
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
        url: url || "",
        title,
        html: rawHtml,
        markdown,
      },
    };
  } catch (error: unknown) {
    yield { type: "status", status: ScrapeStatus.ERROR };

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    yield { type: "error", message: errorMessage };
  }
}
