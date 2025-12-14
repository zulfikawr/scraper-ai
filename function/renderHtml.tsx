import React from "react";
import DOMPurify from "dompurify";

export const renderHtml = (htmlContent: string): React.ReactNode => {
  if (!htmlContent) {
    return (
      <div className="text-zinc-400 text-sm italic p-4 text-center">
        No HTML content to preview.
      </div>
    );
  }

  // Sanitize the HTML to prevent XSS attacks while allowing safe tags
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    USE_PROFILES: { html: true },
    ADD_TAGS: [
      "iframe",
      "img",
      "table",
      "tbody",
      "tr",
      "td",
      "th",
      "div",
      "span",
    ],
    ADD_ATTR: [
      "src",
      "alt",
      "width",
      "height",
      "frameborder",
      "allowfullscreen",
      "class",
      "style",
      "href",
      "target",
    ],
  });

  return (
    <div
      className="rendered-html-wrapper w-full overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
