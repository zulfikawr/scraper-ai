import DOMPurify from "dompurify";
import { Readability } from "@mozilla/readability";
import { ScrapeResult, ScrapeOptions } from "../types";

const FETCH_TIMEOUT_MS = 60000; // 60 seconds timeout for slow websites

/**
 * Utility to pause execution for a given duration.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wrapper around fetch with a timeout signal.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Tries to fetch a URL multiple times with a delay between attempts.
 */
async function fetchWithRetry(
  url: string,
  retries = 2,
  delayTime = 2000,
): Promise<Response> {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetchWithTimeout(url, { cache: "no-store" });
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}`);
    } catch (e: any) {
      console.warn(`Attempt ${i + 1} failed for ${url}: ${e.message}`);
      lastError = e;
      if (i < retries) {
        await delay(delayTime);
      }
    }
  }
  throw lastError;
}

/**
 * Fetches HTML content using Cloudflare Worker.
 */
async function fetchHtmlContent(targetUrl: string): Promise<string> {
  // REPLACE THIS WITH YOUR WORKER URL
  const WORKER_URL = "https://scraper-ai.zulfikar6556.workers.dev";

  const proxyUrl = `${WORKER_URL}?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetchWithRetry(proxyUrl);
    const text = await response.text();

    if (text.length > 50) {
      return text;
    }
    throw new Error("Content too short");
  } catch (e: any) {
    console.error("Custom Proxy failed:", e);
    throw new Error(`Failed to fetch via proxy: ${e.message}`);
  }
}

/**
 * Step 1: Fetch the raw HTML from the URL
 */
export const fetchPage = async (
  url: string,
): Promise<{ rawHtml: string; url: string }> => {
  // Validate URL
  let validUrl = url;
  try {
    new URL(url);
  } catch {
    try {
      const withProto = "https://" + url;
      new URL(withProto);
      validUrl = withProto;
    } catch {
      throw new Error("Invalid URL format. Please include https://");
    }
  }

  const rawHtml = await fetchHtmlContent(validUrl);
  return { rawHtml, url: validUrl };
};

/**
 * Step 2: Clean and sanitize the HTML using Browser Native APIs
 */
export const processContent = async (
  html: string,
  url: string,
  options: ScrapeOptions,
): Promise<ScrapeResult> => {
  // 1. Parse HTML using the Browser's built-in DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 2. PRE-PROCESS: Fix Images & Links
  const imgs = doc.querySelectorAll("img");
  imgs.forEach((img) => {
    // A. Fix Lazy Loading
    const realSrc =
      img.getAttribute("data-src") ||
      img.getAttribute("data-original") ||
      img.getAttribute("data-lazy-src") ||
      img.getAttribute("srcset")?.split(" ")[0]; // Fallback to first srcset

    if (realSrc) {
      img.setAttribute("src", realSrc);
    }

    // B. Fix Relative URLs
    // We use the URL API to fix paths like "/image.png" -> "https://site.com/image.png"
    if (img.getAttribute("src")) {
      try {
        const fixedUrl = new URL(img.getAttribute("src")!, url).href;
        img.setAttribute("src", fixedUrl);
      } catch (e) {
        // If URL is invalid, ignore
      }
    }

    // C. Remove 1x1 tracking pixels
    if (
      img.getAttribute("width") === "1" &&
      img.getAttribute("height") === "1"
    ) {
      img.remove();
    }
  });

  // Fix relative links for anchors <a>
  const links = doc.querySelectorAll("a");
  links.forEach((a) => {
    if (a.getAttribute("href")) {
      try {
        const fixedUrl = new URL(a.getAttribute("href")!, url).href;
        a.setAttribute("href", fixedUrl);
        a.setAttribute("target", "_blank"); // Force new tab
      } catch (e) {}
    }
  });

  // 3. EXTRACT MAIN CONTENT
  const reader = new Readability(doc.cloneNode(true) as Document);
  const article = reader.parse();

  // Fallback if Readability fails
  const rawContentHtml = article?.content || doc.body.innerHTML;
  const title = article?.title || doc.title || "Untitled Page";

  // 4. SANITIZE (Using DOMPurify)

  // Define allowed tags
  const allowedTags = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "p",
    "ul",
    "ol",
    "nl",
    "li",
    "b",
    "i",
    "strong",
    "em",
    "code",
    "hr",
    "br",
    "div",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "pre",
    "span",
  ];

  if (options.includeImages) {
    allowedTags.push("img", "figure", "figcaption");
  }

  if (options.includeLinks) {
    allowedTags.push("a");
  }

  const cleanHtml = DOMPurify.sanitize(rawContentHtml, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: [
      "href",
      "title",
      "target",
      "src",
      "alt",
      "width",
      "height",
      "border",
      "colspan",
      "rowspan",
    ],
    ADD_ATTR: ["target"], // Ensures new links open in new tabs
  });

  if (cleanHtml.length < 50) {
    throw new Error("Extracted content is too short or empty.");
  }

  return {
    url: url,
    title: title,
    rawHtml: html,
    cleanText: cleanHtml,
  };
};
