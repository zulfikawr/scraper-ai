import { VercelRequest, VercelResponse } from "@vercel/node";

// Define the expected request body structure
interface ConvertRequestBody {
  url?: string;
  options?: Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Import compiled server modules from dist
  const { convertGenerator } =
    await import("../server/dist/server/services/convertService.js");
  const loggerMod = await import("../server/dist/server/utils/logger.js");
  const logger = loggerMod.default;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as ConvertRequestBody;
  const { url, options } = body;

  if (!url || typeof url !== "string") {
    return res
      .status(400)
      .json({ error: "URL is required and must be a string" });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const iterator = convertGenerator(url, options);

    for await (const update of iterator) {
      res.write(`data: ${JSON.stringify(update)}\n\n`);
    }

    res.end();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("Stream error:", errorMessage);

    res.write(
      `data: ${JSON.stringify({ type: "status", status: "ERROR" })}\n\n`,
    );
    res.write(
      `data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`,
    );
    res.end();
  }
}
