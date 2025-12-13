import { VercelRequest, VercelResponse } from "@vercel/node";

// Define the expected request body structure
interface CleanRequestBody {
  html?: string;
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
    const body = req.body as CleanRequestBody;
    const { html, url, options } = body;

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
    const { title, cleanedHtml } = cleanHtml(rawHtml, validatedUrl);
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
}
