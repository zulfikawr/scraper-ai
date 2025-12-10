import TurndownService from "turndown";
import { ScrapeOptions } from "@/types";

export function fallbackConvert(
  htmlContent: string,
  options: ScrapeOptions,
): string {
  try {
    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      hr: "---",
      bulletListMarker: "-",
    });

    // Safe import for GFM plugin to prevent crashes
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const turndownPluginGfm = require("turndown-plugin-gfm");
      const gfm = turndownPluginGfm.gfm || turndownPluginGfm;
      turndownService.use(gfm);
    } catch (e) {
      console.warn(
        "Failed to load Turndown GFM plugin, continuing without it.",
        e,
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
  } catch (error) {
    console.error("Turndown conversion failed:", error);
    // Ultimate fallback: Just return the raw text if markdown conversion fails
    return htmlContent.replace(/<[^>]*>?/gm, "");
  }
}
