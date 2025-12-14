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

const systemInstruction =
  "You are a precise coding assistant specialized in data serialization. Your task is to convert HTML strings into Markdown format with high fidelity, strictly following the provided rules.";

const buildPrompt = (htmlContent: string, options: ScrapeOptions): string => {
  let contentToProcess = htmlContent;
  const MAX_LENGTH = 150000;

  if (contentToProcess.length > MAX_LENGTH) {
    const lastP = contentToProcess.lastIndexOf("</p>", MAX_LENGTH);
    if (lastP > 0) {
      contentToProcess =
        contentToProcess.substring(0, lastP + 4) +
        "\n\n...[content truncated due to length]";
    } else {
      contentToProcess = contentToProcess.substring(0, MAX_LENGTH) + "...";
    }
  }

  const imageRule = options.includeImages
    ? "Include images using ![alt text](url) syntax. Extract meaningful alt text from the HTML or describe the image context. If inside <figure>, use the <figcaption> as alt text or caption."
    : "Remove all images and image references completely.";

  const linkRule = options.includeLinks
    ? "Preserve meaningful hyperlinks using [text](url) syntax. Keep links that add value (references, sources, related content)."
    : "Remove all hyperlinks but preserve the link text inline.";

  return `You are a highly precise HTML-to-Markdown converter.
You are receiving PRE-CLEANED HTML content. Your job is not to summarize or extract, but to faithfully transpile the existing structure into valid Markdown.

== TRANSFORMATION RULES ==
1.  **Headings:** map <h1>-<h6> to # through ######.
2.  **Text:** Preserve all bold, italic, and inline styles using Markdown syntax (**bold**, *italic*).
3.  **Lists:** strictly preserve nesting levels. Use "-" for unordered and "1." for ordered lists. Ensure indented sub-lists use 4 spaces.
4.  **Code:** Convert <pre><code> blocks to \`\`\`language blocks. Detect the language if possible.
5.  **Blockquotes:** Use > for <blockquote>.
6.  **Tables:** Convert HTML tables to Markdown tables. If a table is too complex for Markdown (nested), preserve the content as a list.
7.  **Escaping:** If the original text contains Markdown characters (like *, _, [, ]), escape them with a backslash if they are part of the literal text.

== DYNAMIC RULES ==
- ${imageRule}
- ${linkRule}

== STRICT CONSTRAINTS ==
- DO NOT add a preamble (e.g., "Here is the markdown").
- DO NOT wrap the output in a code block (\`\`\`).
- DO NOT output the Title twice if it's already the first line of the body.
- Return ONLY the raw Markdown string.

== INPUT HTML ==
${contentToProcess}`;
};

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
      temperature: 0.1, // Low temp for precision
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
