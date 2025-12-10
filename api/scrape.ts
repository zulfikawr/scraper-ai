import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Import compiled server modules from dist
  const { scrapeUrlGenerator } =
    await import("../server/dist/server/services/scraperService.js");
  const loggerMod = await import("../server/dist/server/utils/logger.js");
  const logger = loggerMod.default;
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
    // Use plain string status to avoid importing TS-only enums at runtime
    res.write(
      `data: ${JSON.stringify({ type: "status", status: "ERROR" })}\n\n`,
    );
    res.write(
      `data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`,
    );
    res.end();
  }
}
