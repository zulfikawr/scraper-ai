import { geminiConvert } from "./geminiConvert";
import { fallbackConvert } from "./fallbackConvert";
import { ScrapeOptions } from "@/types";

export async function convertToMarkdown(
  html: string,
  options: ScrapeOptions,
): Promise<string> {
  try {
    console.log("Attempting Gemini AI conversion...");
    return await geminiConvert(html, options);
  } catch (error: any) {
    console.warn("Gemini failed, switching to fallback:", error.message);
    return fallbackConvert(html, options);
  }
}
