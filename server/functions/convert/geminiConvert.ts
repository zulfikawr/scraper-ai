import { GoogleGenAI } from "@google/genai";
import { ScrapeOptions } from "@/types";
import logger from "../../utils/logger";

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

export const geminiConvert = async (
  htmlContent: string,
  options: ScrapeOptions,
): Promise<string> => {
  const ai = getClient();

  // Truncate if still too long after cleaning
  const truncatedContent =
    htmlContent.length > 150000
      ? htmlContent.substring(0, 150000) + "...[content truncated]"
      : htmlContent;

  const imageRule = options.includeImages
    ? "Include images using ![alt text](url) syntax. Extract meaningful alt text from the HTML or describe the image context. If inside <figure>, use the <figcaption> as alt text or caption."
    : "Remove all images and image references completely.";

  const linkRule = options.includeLinks
    ? "Preserve meaningful hyperlinks using [text](url) syntax. Keep links that add value (references, sources, related content)."
    : "Remove all hyperlinks but preserve the link text inline.";

  const prompt = `Extract and convert the main content from this HTML into clean, well-structured Markdown. Don't rephrase, summarize, or modify the original content.
  
    == PRIMARY OBJECTIVES ==
    1. Extract ONLY the main article/content body
    2. Remove all navigation, UI elements, and promotional content
    3. Preserve the content's logical structure and hierarchy
    4. Produce professional, readable Markdown
    
    == REMOVAL RULES (Apply Strictly) ==
    Remove these elements completely:
    - Navigation menus, headers, footers, sidebars
    - Social sharing buttons ("Share on...", "Follow us", "Tweet this")
    - Call-to-action buttons ("Subscribe", "Sign up", "Download")
    - Advertisement placeholders and promotional boxes
    - "Related Articles", "You May Also Like", "Trending Now" sections
    - Article metadata (publish date, author byline, read time, view counts)
    - Comment sections and user interaction prompts
    - Cookie notices, newsletter popups, modal overlays
    - Breadcrumb trails and pagination ("Page 1 of 3", "Next article")
    - Image carousel counters ("1/10", "Slide 2 of 5")
    - Copyright footers and legal disclaimers (unless part of main content)
    
    == MARKDOWN FORMATTING ==
    Structure:
    - Use # for the main title (H1) - should appear only once
    - Use ## for major sections (H2)
    - Use ### for subsections (H3)
    
    Content:
    - ${imageRule}
    - ${linkRule}
    - Preserve code blocks with proper language tags: \`\`\`language
    - Use > for blockquotes, replacing the quotes ""
    - Format tables using proper Markdown table syntax
    - Use - or * for unordered lists, 1. 2. 3. for ordered lists
    - Use **bold** for emphasis, *italic* for subtle emphasis
    - Preserve line breaks between paragraphs
    
    == QUALITY CHECKS ==
    Before outputting, ensure:
    ✓ The title is clear and appears once at the top
    ✓ Headers follow a logical hierarchy (no jumping from # to ###)
    ✓ Lists are properly formatted and not broken
    ✓ No UI fragments remain ("Click here", "Read more", etc.)
    ✓ The text flows naturally as a standalone document
    ✓ No code block markers or artifact syntax in output
    
    == HTML INPUT ==
    ${truncatedContent}
    
    == OUTPUT INSTRUCTIONS ==
    Return ONLY the Markdown content. Start immediately with the title. No preamble, no explanations, no wrapping in code blocks.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert HTML-to-Markdown converter specialized in content extraction. Your sole purpose is to identify the main article content within HTML and convert it to clean, professional Markdown. You excel at distinguishing between actual content and web UI noise (navigation, ads, social widgets). You never add explanations or wrap output in code blocks - you return pure Markdown only.",
        temperature: 0.1,
      },
    });

    let markdown = response.text || "";

    // Cleanup code blocks
    return markdown
      .replace(/^```markdown\n?/i, "")
      .replace(/^```\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();
  } catch (error) {
    logger.error("Gemini API Error:", error);
    throw error;
  }
};
