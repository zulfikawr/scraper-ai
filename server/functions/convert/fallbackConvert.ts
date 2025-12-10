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

    // Dynamic ESM import for GFM plugin to avoid `require` in ESM runtime
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const turndownPluginGfm = require("turndown-plugin-gfm");
      const gfm = turndownPluginGfm.gfm || turndownPluginGfm;
      turndownService.use(gfm);
    } catch (e: any) {
      logger.warn(
        "Failed to load Turndown GFM plugin, continuing without it.",
        e?.message || e,
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
  } catch (error: any) {
    logger.error("Turndown conversion failed:", error?.message || error);
    // Ultimate fallback: Just return the raw text if markdown conversion fails
    return htmlContent.replace(/<[^>]*>?/gm, "");
  }
}
