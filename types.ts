export interface ScrapeResult {
  url: string;
  title: string;
  rawHtml: string;
  cleanText: string;
}

export interface AiProcessResult {
  markdown: string;
}

export enum ScrapeStatus {
  IDLE = "IDLE",
  SCRAPING = "SCRAPING",
  CLEANING = "CLEANING",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export type TabType = "preview" | "markdown" | "raw";

export interface ScrapeOptions {
  includeImages: boolean;
  includeLinks: boolean;
  cleanNoise: boolean; // Removes ads, navs, comments, etc.
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  markdown: string;
  timestamp: number;
}
