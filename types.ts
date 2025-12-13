export interface ScrapeResult {
  url: string;
  title: string;
  markdown: string;
  html: string;
  mode?: "convert" | "scrape" | "clean";
}

export enum ScrapeStatus {
  IDLE = "IDLE",
  SCRAPING = "SCRAPING",
  CLEANING = "CLEANING",
  CONVERTING = "CONVERTING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export type TabType = "preview" | "markdown" | "raw";

export interface ScrapeOptions {
  includeImages?: boolean;
  includeLinks?: boolean;
  // When true, the server will use a headless browser to render the page
  // before extracting HTML. Useful for client-side rendered sites.
  useBrowser?: boolean;
  // Choose the AI provider for markdown conversion: "gemini" | "deepseek"
  // Falls back through the chain if the primary provider fails
  aiProvider?: "gemini" | "deepseek";
}

export type ScrapeYield =
  | { type: "status"; status: ScrapeStatus }
  | {
      type: "log";
      level: "info" | "warn" | "error" | "debug";
      message: string;
      autoEnableBrowser?: boolean;
    }
  | { type: "result"; data: ScrapeResult }
  | { type: "error"; message: string };

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  markdown: string;
  timestamp: number;
  operation: "convert" | "scrape" | "clean"; // Track which operation created this item
  html?: string;
}
