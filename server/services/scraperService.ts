import { scrapeRawHtml } from "../functions/scrape";
import { cleanHtml } from "../functions/clean";
import { convertToMarkdown } from "../functions/convert";
import { ScrapeOptions, ScrapeStatus, ScrapeYield } from "@/types";

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
    const rawHtml = await scrapeRawHtml(url);

    // 2. CLEANING
    yield { type: "status", status: ScrapeStatus.CLEANING };
    const { title, cleanedHtml } = cleanHtml(rawHtml, url);

    // 3. CONVERTING
    yield { type: "status", status: ScrapeStatus.CONVERTING };
    const markdown = await convertToMarkdown(cleanedHtml, options);

    // 4. SUCCESS
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
