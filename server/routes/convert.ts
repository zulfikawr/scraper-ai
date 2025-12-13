import express, { Request, Response } from "express";
import { convertGenerator } from "../services/convertService";
import { validateUrl } from "@/function/validateUrl";
import logger from "../utils/logger";
import { ScrapeStatus } from "@/types";
import type { ScrapeOptions } from "@/types";

const router = express.Router();

// Define the expected request body structure
interface ConvertRequestBody {
  url?: string;
  html?: string;
  options?: ScrapeOptions;
}

/**
 * POST /api/convert
 * Full pipeline: Accept URL or HTML, clean it, and convert to Markdown.
 * Uses Server-Sent Events (SSE) for streaming progress updates.
 *
 * Request: { url?: string, html?: string, options?: { includeImages, includeLinks } }
 * Response: SSE stream with status updates, logs, and final result
 */
router.post(
  "/convert",
  async (req: Request<object, object, ConvertRequestBody>, res: Response) => {
    const { url, html, options } = req.body;

    // Validate input: either url or html must be provided, and types must be correct
    if (
      (!url && !html) ||
      (url && typeof url !== "string") ||
      (html && typeof html !== "string")
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid parameters: Either 'url' string or 'html' string must be provided",
      });
    }

    // 1. Set Headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      let validatedUrl: string | null = null;

      // 2. Validate and normalize URL if provided
      if (url) {
        validatedUrl = validateUrl(url);
        logger.info("Convert request", `url=${validatedUrl}`, "type=stream");
      } else {
        logger.info("Convert request", "source=raw_html", "type=stream");
      }

      // 3. Iterate over the generator logic
      // Pass validatedUrl (may be null) and html (may be undefined) to the generator
      const iterator = convertGenerator(validatedUrl, options, html);

      for await (const update of iterator) {
        // 4. Write data to the stream formatted as SSE
        res.write(`data: ${JSON.stringify(update)}\n\n`);
      }
    } catch (error: unknown) {
      logger.error("Convert stream error:", error);

      // Emit an explicit status=ERROR event followed by an error event with the message
      const errMsg =
        error instanceof Error ? error.message : "Internal Server Error";

      res.write(
        `data: ${JSON.stringify({
          type: "status",
          status: ScrapeStatus.ERROR,
        })}\n\n`,
      );
      res.write(
        `data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`,
      );
    } finally {
      // 5. Close connection
      res.end();
    }
  },
);

export default router;
