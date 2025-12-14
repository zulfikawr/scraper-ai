import * as cheerio from "cheerio";
import { Element } from "domhandler";
import * as prettier from "prettier";
import type { ScrapeOptions } from "@/types";

interface CleanedResult {
  title: string;
  cleanedHtml: string;
}

export async function cleanHtml(
  rawHtml: string,
  url?: string,
  options: ScrapeOptions = {},
): Promise<CleanedResult> {
  const includeImages = options.includeImages ?? true;
  const includeLinks = options.includeLinks ?? true;

  const $ = cheerio.load(rawHtml);

  // =========================================================================
  // 0. TITLE EXTRACTION & CLEANING
  // =========================================================================
  let title = $("title").text().trim();
  const h1 = $("h1").first().text().trim();

  if (
    title.length > 150 ||
    title.includes("Dropdown") ||
    title.includes("Navigation") ||
    title.includes("Search")
  ) {
    if (h1 && h1.length > 5) {
      title = h1;
    } else {
      title = title.split(/[|\-–—]/)[0].trim();
    }
  }
  if (!title) title = "Untitled Page";

  // =========================================================================
  // 1. SELECTOR-BASED CLEANING
  // =========================================================================
  const DELETE_SELECTORS = [
    "script",
    "style",
    "link",
    "meta",
    "noscript",
    "template",
    "head",
    "button",
    "input",
    "select",
    "textarea",
    "option",
    "optgroup",
    "svg",
    "canvas",
    "map",
    "iframe",
    "embed",
    "object",
    "video",
    "audio",
    "frame",
    "frameset",
    "dialog",
    "[role='img']:not(img)",
    "nav",
    "footer",
    "aside",
    ".nav",
    ".navbar",
    ".footer",
    "[class*='ad-']",
    "[class*='ads-']",
    "[id*='ad-']",
    "[class*='share']",
    "[class*='social']",
    "[class*='subscribe']",
    "[class*='cookie']",
    "[class*='popup']",
    "[class*='modal']",
    "[class*='comment']",
    "[class*='sidebar']",
    ".notion-collection-header",
    ".notion-property-list",
    ".notion-topbar",
    ".notion-sidebar-container",
    ".meta",
    ".metadata",
    ".post-meta",
    ".entry-meta",
    ".properties-table",
  ].join(",");

  $(DELETE_SELECTORS).remove();

  // =========================================================================
  // 1.5. CODE BLOCK CLEANING (Fixes Line Numbers)
  // =========================================================================
  $("pre, code").each((_, el) => {
    const $el = $(el);

    // 1. Remove elements with specific "line number" class names
    $el
      .find(
        "[class*='line-numbers'], [class*='lineno'], [class*='gutter'], .ln",
      )
      .remove();

    // 2. Heuristic: Detect and remove purely numeric containers
    // This targets structures like <pre><code><code>1</code>npm ...</code></pre>
    // or columns of numbers like "1\n2\n3\n"
    $el.find("code, span, div, td").each((_, child) => {
      const $child = $(child);
      const text = $child.text();

      // Regex matches: strictly digits and whitespace/newlines
      if (/^[\d\s]+$/.test(text)) {
        // A. If it's a multi-line column of numbers (e.g. "1\n2\n3"), remove it
        const lineCount = text
          .split("\n")
          .filter((t) => t.trim().length > 0).length;
        if (lineCount > 1) {
          $child.remove();
          return;
        }

        // B. If it's a single number (e.g. "1"), checks if it is the VERY FIRST element
        // inside the code block. This prevents removing numbers that are part of the code (e.g. "const a = 1;")
        const firstChild = $el.contents().first()[0];
        // We look for elements that are the first child and are short (likely an index)
        if (child === firstChild && text.trim().length < 4) {
          $child.remove();
        }
      }
    });
  });

  // =========================================================================
  // 2. ALGORITHMIC CLEANING
  // =========================================================================

  // A. Link Density Check
  $("p, div, li, ul, ol").each((_, el) => {
    const $el = $(el);
    const textLength = $el.text().trim().length;
    if (textLength < 5 || textLength > 500) return;

    const linkTextLength = $el.find("a").text().length;
    const linkDensity = linkTextLength / textLength;

    if (linkDensity > 0.6) {
      $el.remove();
    }
  });

  // B. Symbol/Noise Check
  $("p, div, span").each((_, el) => {
    const $el = $(el);
    if ($el.find("img").length > 0) return;

    const text = $el.text().trim();
    if (text.length === 0) {
      $el.remove();
      return;
    }

    if (text.length < 20 && /^[^a-zA-Z0-9]+$/.test(text)) {
      $el.remove();
    }
  });

  // =========================================================================
  // 3. SMART UNWRAP
  // =========================================================================
  const BLOCK_UNWRAP = [
    "div",
    "section",
    "article",
    "main",
    "header",
    "fieldset",
    "form",
    "hgroup",
    "figure",
    "figcaption",
  ].join(",");

  $(BLOCK_UNWRAP).each((_, el) => {
    const $el = $(el);
    const parentTag = $el.parent()[0]?.name;
    const isInsideInline = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "a",
      "li",
      "button",
    ].includes(parentTag || "");

    if (!isInsideInline) {
      $el.before("\n");
      $el.after("\n");
    } else {
      $el.after(" ");
    }
    $el.replaceWith($el.contents());
  });

  const INLINE_UNWRAP = [
    "span",
    "font",
    "center",
    "big",
    "small",
    "u",
    "ins",
    "slot",
    "label",
    "legend",
    "picture",
  ].join(",");

  $(INLINE_UNWRAP).each((_, el) => {
    const $el = $(el);
    $el.replaceWith($el.contents());
  });

  // =========================================================================
  // 4. ATTRIBUTE & EMPTY TAG PROCESSING
  // =========================================================================
  $("*").each((_, el) => {
    if (el.type !== "tag") return;
    const element = el as Element;
    const $el = $(element);
    const tagName = element.tagName.toLowerCase();

    // --- LINKS ---
    if (tagName === "a") {
      if (!includeLinks) {
        $el.replaceWith($el.contents());
        return;
      }
      const href = $el.attr("href");
      if ($el.text().trim().length === 0 && $el.find("img").length === 0) {
        $el.remove();
        return;
      }
      if (!href) {
        $el.replaceWith($el.contents());
        return;
      }
      // Unwrap Self-Linking Images
      const childImg = $el.find("img");
      if (childImg.length === 1 && $el.text().trim() === "") {
        const imgUrl = childImg.attr("src");
        if (
          imgUrl &&
          (href === imgUrl || href.includes(imgUrl) || imgUrl.includes(href))
        ) {
          $el.replaceWith($el.contents());
          return;
        }
      }
      if (url) {
        try {
          $el.attr("href", new URL(href, url).href);
        } catch (e) {}
      }
    }

    // --- IMAGES ---
    if (tagName === "img") {
      if (!includeImages) {
        $el.remove();
        return;
      }
      const src = $el.attr("src") || $el.attr("data-src") || $el.attr("srcset");
      if (!src || src.trim() === "") {
        $el.remove();
        return;
      }
      const finalSrc = src.split(" ")[0];
      $el.attr("src", finalSrc);
      if (url) {
        try {
          $el.attr("src", new URL(finalSrc, url).href);
        } catch (e) {}
      }
    }

    // --- ATTRIBUTES ---
    const attribs = element.attribs;
    if (!attribs) return;
    Object.keys(attribs).forEach((attr) => {
      if (attr === "colspan" || attr === "rowspan") return;
      if (tagName === "a" && (attr === "href" || attr === "title")) return;
      if (
        tagName === "img" &&
        (attr === "src" || attr === "alt" || attr === "title")
      )
        return;
      if (/^h[1-6]$/.test(tagName) && attr === "id") return;
      $el.removeAttr(attr);
    });
  });

  // =========================================================================
  // 5. FINAL POLISH
  // =========================================================================
  let cleanedHtml = $("body").html() || "";

  cleanedHtml = cleanedHtml.replace(
    /<(h[1-6])>\s+(.*?)(\s+)?<\/\1>/gi,
    "<$1>$2</$1>",
  );
  cleanedHtml = cleanedHtml.replace(/\n\s*\n\s*\n/g, "\n\n");
  cleanedHtml = cleanedHtml.replace(/^\s+$/gm, "");
  cleanedHtml = cleanedHtml.replace(/<p>\s*<\/p>/gi, "");

  const rawOutput = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
</head>
<body>
${cleanedHtml.trim()}
</body>
</html>`;

  try {
    const prettyHtml = await prettier.format(rawOutput, {
      parser: "html",
      tabWidth: 2,
      printWidth: 120,
      htmlWhitespaceSensitivity: "css",
      endOfLine: "lf",
    });
    return { title, cleanedHtml: prettyHtml };
  } catch (e) {
    return { title, cleanedHtml: rawOutput };
  }
}
