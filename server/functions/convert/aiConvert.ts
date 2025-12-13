import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { ScrapeOptions } from "@/types";
import logger from "../../utils/logger";

export type AIProvider = "gemini" | "deepseek";

interface AIConfig {
  provider: AIProvider;
  model?: string;
}

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

const getDeepSeekClient = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not defined");
  }
  return new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey,
  });
};

const buildPrompt = (htmlContent: string, options: ScrapeOptions): string => {
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

  return `Extract and convert the main content from this HTML into clean, well-structured Markdown. Don't rephrase, summarize, or modify the original content.
  
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
};

const systemInstruction =
  "You are an expert HTML-to-Markdown converter specialized in content extraction. Your sole purpose is to identify the main article content within HTML and convert it to clean, professional Markdown. You excel at distinguishing between actual content and web UI noise (navigation, ads, social widgets). You never add explanations or wrap output in code blocks - you return pure Markdown only.";

async function convertWithGemini(
  htmlContent: string,
  options: ScrapeOptions,
  model: string = "gemini-2.5-flash",
): Promise<string> {
  const ai = getGeminiClient();
  const prompt = buildPrompt(htmlContent, options);

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
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
}

async function convertWithDeepSeek(
  htmlContent: string,
  options: ScrapeOptions,
  model: string = "deepseek-chat",
): Promise<string> {
  const client = getDeepSeekClient();
  const prompt = buildPrompt(htmlContent, options);

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
  });

  let markdown = response.choices[0]?.message?.content || "";

  // Cleanup code blocks
  return markdown
    .replace(/^```markdown\n?/i, "")
    .replace(/^```\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
}

/**
 * Dynamic AI conversion supporting multiple providers (Gemini, DeepSeek)
 */
export const aiConvert = async (
  htmlContent: string,
  options: ScrapeOptions,
  config: AIConfig = { provider: "gemini" },
): Promise<string> => {
  try {
    const { provider, model } = config;

    logger.info(`Attempting ${provider.toUpperCase()} AI conversion...`);

    let markdown: string;

    switch (provider) {
      case "deepseek":
        markdown = await convertWithDeepSeek(htmlContent, options, model);
        break;
      case "gemini":
      default:
        markdown = await convertWithGemini(htmlContent, options, model);
        break;
    }

    if (markdown && markdown.trim().length > 0) {
      logger.info(
        `${provider.toUpperCase()} conversion succeeded`,
        `length=${markdown.length}`,
      );
      return markdown;
    }

    logger.warn(
      `${provider.toUpperCase()} returned empty markdown — aborting further fallbacks`,
    );
    return "";
  } catch (error) {
    logger.error(`${config.provider.toUpperCase()} API Error:`, error);
    throw error;
  }
};
