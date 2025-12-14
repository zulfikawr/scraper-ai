import { VercelRequest, VercelResponse } from "@vercel/node";

// Define the expected request body structure
interface ScrapeRequestBody {
  url?: string;
  options?: Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Import compiled server modules from dist
  const { scrapeRawHtml } =
    await import("../server/dist/server/functions/scrape.js");
  const { cleanHtml } =
    await import("../server/dist/server/functions/clean.js");
  const { validateUrl } =
    await import("../server/dist/function/validateUrl.js");
  const loggerMod = await import("../server/dist/server/utils/logger.js");
  const logger = loggerMod.default;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as ScrapeRequestBody;
    const { url, options } = body;

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
    const { title } = await cleanHtml(result.html, validatedUrl);

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
}
