import express, { Request, Response } from "express";
import { scrapeUrlGenerator } from "../services/scraperService";

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
  } catch (error) {
    console.error("Stream error:", error);
    res.write(
      `data: ${JSON.stringify({ type: "error", message: "Internal Server Error" })}\n\n`,
    );
  } finally {
    // 4. Close connection
    res.end();
  }
});

export default router;
