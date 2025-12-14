export interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { html, options } = (await request.json()) as {
        html: string;
        options?: any;
      };

      if (!html) {
        return new Response("Missing html content", { status: 400 });
      }

      let contentToProcess = html;
      if (contentToProcess.length > 25000) {
        // Try to find the last paragraph closure before the limit
        const lastP = contentToProcess.lastIndexOf("</p>", 25000);
        if (lastP > 0) {
          contentToProcess =
            contentToProcess.substring(0, lastP + 4) +
            "\n\n...[Content Truncated]";
        } else {
          // Fallback: hard cut
          contentToProcess = contentToProcess.substring(0, 25000) + "...";
        }
      }

      const imageRule = options?.includeImages
        ? "Include images using ![alt text](url) syntax. Extract meaningful alt text from the HTML or describe the image context. If inside <figure>, use the <figcaption> as alt text or caption."
        : "Remove all images and image references completely.";

      const linkRule = options?.includeLinks
        ? "Preserve meaningful hyperlinks using [text](url) syntax. Keep links that add value (references, sources, related content)."
        : "Remove all hyperlinks but preserve the link text inline.";

      const prompt = `You are a highly precise HTML-to-Markdown converter.
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

      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          {
            role: "system",
            content:
              "You are a precise coding assistant specialized in data serialization. Your task is to convert HTML strings into Markdown format with high fidelity, strictly following the provided rules.",
          },
          { role: "user", content: prompt },
        ],
      });

      // @ts-ignore
      let markdown = response.response || "";

      // Cleanup code blocks if present (sometimes models wrap output)
      markdown = markdown
        .replace(/^```markdown\n?/i, "")
        .replace(/^```\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();

      return new Response(JSON.stringify({ markdown }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
