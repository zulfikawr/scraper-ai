import TurndownService from "turndown";
import { ScrapeOptions } from "@/types";
import logger from "../../utils/logger";

export async function fallbackConvert(
  htmlContent: string,
  options: ScrapeOptions,
): Promise<string> {
  try {
    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      hr: "---",
      bulletListMarker: "-",
    });

    // Dynamic import for GFM plugin
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const turndownPluginGfm = require("turndown-plugin-gfm");
      const gfm = turndownPluginGfm.gfm || turndownPluginGfm;
      turndownService.use(gfm);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      logger.warn(
        "Failed to load Turndown GFM plugin, continuing without it.",
        errorMessage,
      );
    }

    // --- Option Handling ---

    // Remove images if requested
    if (!options.includeImages) {
      turndownService.remove("img");
    }

    // Remove links if requested (keep text, remove <a> tag)
    if (!options.includeLinks) {
      turndownService.addRule("removeLinks", {
        filter: "a",
        replacement: (content) => content,
      });
    }

    // Custom Rule: Remove empty links
    turndownService.addRule("removeEmptyLinks", {
      filter: (node) => {
        return (
          node.nodeName === "A" &&
          (!node.getAttribute("href") || !node.textContent?.trim())
        );
      },
      replacement: () => "",
    });

    return turndownService.turndown(htmlContent);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Turndown conversion failed:", errorMessage);

    // Ultimate fallback: Just return the raw text if markdown conversion fails
    return htmlContent.replace(/<[^>]*>?/gm, "");
  }
}
