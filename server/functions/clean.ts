import { JSDOM } from "jsdom";

interface CleanedResult {
  title: string;
  cleanedHtml: string;
}

export function cleanHtml(rawHtml: string, url: string): CleanedResult {
  const dom = new JSDOM(rawHtml, { url });
  const doc = dom.window.document;

  // 1. Extract Title
  const title = doc.title || "Untitled Page";

  // 2. Fix Images (Lazy loading & Absolute URLs)
  doc.querySelectorAll("img").forEach((img) => {
    // Handle lazy loading attributes
    const realSrc =
      img.getAttribute("data-src") ||
      img.getAttribute("data-original") ||
      img.getAttribute("srcset")?.split(" ")[0];

    if (realSrc) img.setAttribute("src", realSrc);

    // Ensure absolute URLs
    const src = img.getAttribute("src");
    if (src) {
      try {
        img.setAttribute("src", new URL(src, url).href);
      } catch {
        img.remove(); // Remove broken images
      }
    }

    // Remove tracking pixels
    if (img.width === 1 && img.height === 1) img.remove();
  });

  // 3. Fix Links (Absolute URLs)
  doc.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href) {
      try {
        a.setAttribute("href", new URL(href, url).href);
      } catch {
        // Leave invalid links alone
      }
    }
  });

  // 4. Remove Junk Elements (Reduces token usage for AI)
  const junkSelectors = [
    "script",
    "style",
    "noscript",
    "iframe",
    "svg",
    "form",
    "nav",
    "footer",
    "header",
    "aside",
    ".ad",
    ".ads",
    ".advertisement",
    ".social-share",
    ".cookie-consent",
    ".breadcrumb",
    "#sidebar",
    "#comments",
  ];

  junkSelectors.forEach((selector) => {
    try {
      doc.querySelectorAll(selector).forEach((el) => el.remove());
    } catch (e) {
      console.warn(`Cleanup error for selector ${selector}:`, e);
    }
  });

  return {
    title,
    cleanedHtml: doc.body.innerHTML,
  };
}
