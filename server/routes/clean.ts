import express, { Request, Response } from "express";
import { scrapeRawHtml } from "../functions/scrape";
import { cleanHtml } from "../functions/clean";
import { validateUrl } from "@/function/validateUrl";
import logger from "../utils/logger";
import type { ScrapeOptions } from "@/types";

const router = express.Router();

// Define the expected request body structure
interface CleanRequestBody {
  html?: string;
  url?: string;
  options?: ScrapeOptions;
}

/**
 * POST /api/clean
 * Accept HTML or URL, clean it, and return sanitized HTML fragment.
 *
 * Request: { html?: string, url?: string, options?: { includeImages, includeLinks } }
 * Response: { success: boolean, data: { url, title, cleanedHtml, chars } }
 */
router.post(
  "/clean",
  async (req: Request<object, object, CleanRequestBody>, res: Response) => {
    try {
      const { html, url, options } = req.body;

      // Validate input: either html or url must be provided
      if (
        (!html && !url) ||
        (html && typeof html !== "string") ||
        (url && typeof url !== "string")
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid parameters: Either 'html' string or 'url' string must be provided",
        });
      }

      let rawHtml: string = html || "";
      let validatedUrl = "";

      // If URL provided, validate and scrape (overrides raw HTML input if both exist)
      if (url) {
        // Validate and normalize URL
        validatedUrl = validateUrl(url);
        logger.info("Clean request", `url=${validatedUrl}`);

        // Fetch raw HTML
        const result = await scrapeRawHtml(validatedUrl, options || {});
        rawHtml = result.html;
      } else {
        logger.info("Clean request", "source=raw_html");
      }

      // Clean the HTML
      const { title, cleanedHtml } = await cleanHtml(
        rawHtml,
        validatedUrl,
        options,
      );
      const chars = cleanedHtml.length;

      logger.info(
        "Clean succeeded",
        `url=${validatedUrl || "raw-input"}`,
        `chars=${chars}`,
        `title=${title}`,
      );

      res.json({
        success: true,
        data: {
          url: validatedUrl || null,
          title,
          cleanedHtml,
          chars,
        },
      });
    } catch (error: unknown) {
      logger.error("Clean error:", error);

      const message =
        error instanceof Error ? error.message : "Failed to clean HTML";

      res.status(500).json({
        success: false,
        error: message,
      });
    }
  },
);

export default router;
