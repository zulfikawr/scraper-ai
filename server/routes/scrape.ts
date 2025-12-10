import express, { Request, Response } from "express";
import { scrapeUrlGenerator } from "../services/scraperService";
import logger from "../utils/logger";
import { ScrapeStatus } from "@/types";

const router = express.Router();

router.post("/scrape", async (req: Request, res: Response) => {
  const { url, options } = req.body;

  // 1. Set Headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // 2. Iterate over the generator logic
    const iterator = scrapeUrlGenerator(url, options);

    for await (const update of iterator) {
      // 3. Write data to the stream formatted as SSE
      res.write(`data: ${JSON.stringify(update)}\n\n`);
    }
  } catch (error: any) {
    logger.error("Stream error:", error);
    // Emit an explicit status=ERROR event followed by an error event with the message
    const errMsg = error?.message || "Internal Server Error";
    res.write(
      `data: ${JSON.stringify({ type: "status", status: ScrapeStatus.ERROR })}\n\n`,
    );
    res.write(
      `data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`,
    );
  } finally {
    // 4. Close connection
    res.end();
  }
});

export default router;
