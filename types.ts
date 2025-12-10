export interface ScrapeResult {
  url: string;
  title: string;
  markdown: string;
  html: string;
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
}

export type ScrapeYield =
  | { type: "status"; status: ScrapeStatus }
  | { type: "result"; data: ScrapeResult }
  | { type: "error"; message: string };

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  markdown: string;
  timestamp: number;
}
