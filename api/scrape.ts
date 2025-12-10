import { VercelRequest, VercelResponse } from "@vercel/node";
import { scrapeUrlGenerator } from "../server/services/scraperService";
import logger from "../server/utils/logger";
import { ScrapeStatus } from "../types";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, options } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const iterator = scrapeUrlGenerator(url, options);

    for await (const update of iterator) {
      res.write(`data: ${JSON.stringify(update)}\n\n`);
    }

    res.end();
  } catch (error: any) {
    logger.error("Stream error:", error);
    const errMsg = error?.message || "Internal Server Error";
    res.write(
      `data: ${JSON.stringify({ type: "status", status: ScrapeStatus.ERROR })}\n\n`,
    );
    res.write(`data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`);
    res.end();
  }
}
