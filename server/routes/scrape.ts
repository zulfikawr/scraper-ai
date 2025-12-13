import express, { Request, Response } from "express";
import { scrapeRawHtml } from "../functions/scrape";
import { cleanHtml } from "../functions/clean";
import { validateUrl } from "@/function/validateUrl";
import logger from "../utils/logger";
import type { ScrapeOptions } from "@/types";

const router = express.Router();

// Define the expected request body structure
interface ScrapeRequestBody {
  url?: string;
  options?: ScrapeOptions;
}

/**
 * POST /api/scrape
 * Fetch raw HTML from a URL without cleaning or converting.
 *
 * Request: { url: string, options?: ScrapeOptions }
 * Response: { success: boolean, data: { url, title, html, source, chars } }
 */
router.post(
  "/scrape",
  async (req: Request<object, object, ScrapeRequestBody>, res: Response) => {
    try {
      const { url, options } = req.body;

      // Validate input
      if (!url || typeof url !== "string") {
        return res.status(400).json({
          success: false,
          error: "Missing or invalid 'url' parameter",
        });
      }

      // Validate and normalize URL
      const validatedUrl = validateUrl(url);
      logger.info("Scrape request", `url=${validatedUrl}`);

      // Fetch raw HTML
      const result = await scrapeRawHtml(validatedUrl, options || {});
      const chars = result.html.length;

      // Extract title from HTML (using cleanHtml just for metadata extraction here)
      const { title } = cleanHtml(result.html, validatedUrl);

      logger.info(
        "Scrape succeeded",
        `url=${validatedUrl}`,
        `chars=${chars}`,
        `title=${title}`,
      );

      res.json({
        success: true,
        data: {
          url: validatedUrl,
          title,
          html: result.html,
          source: result.source,
          chars,
        },
      });
    } catch (error: unknown) {
      logger.error("Scrape error:", error);

      const message =
        error instanceof Error ? error.message : "Failed to scrape URL";

      res.status(500).json({
        success: false,
        error: message,
      });
    }
  },
);

export default router;
