import { ScrapeOptions, ScrapeResult, ScrapeStatus } from "@/types";

interface ScrapeStreamCallbacks {
  onStatus: (status: ScrapeStatus) => void;
  onLog?: (
    level: "info" | "warn" | "error" | "debug",
    message: string,
    autoEnableBrowser?: boolean,
  ) => void;
}

/**
 * Convert HTML to Markdown using the full pipeline (SSE streaming)
 * Accepts URL or HTML input
 */
export async function convertToMarkdown(
  input: { url?: string; html?: string },
  options: ScrapeOptions,
  callbacks: ScrapeStreamCallbacks,
): Promise<ScrapeResult> {
  const response = await fetch("/api/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, options }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let resultData: ScrapeResult | null = null;

  if (!reader) throw new Error("Browser does not support streaming");

  // Buffer incoming chunks to handle SSE messages split across reads
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE messages delimited by double newline
    let boundaryIndex: number;
    while ((boundaryIndex = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, boundaryIndex).trim();
      buffer = buffer.slice(boundaryIndex + 2);

      if (!raw) continue;
      // Lines could contain multiple `data:` lines; keep only those starting with data:
      const lines = raw.split(/\r?\n/).map((l) => l.trim());

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.replace("data: ", "");
        try {
          const data = JSON.parse(jsonStr);

          if (data.type === "status") {
            callbacks.onStatus(data.status); // Update UI Status
          } else if (data.type === "log") {
            callbacks.onLog?.(data.level, data.message, data.autoEnableBrowser);
          } else if (data.type === "result") {
            resultData = data.data;
          } else if (data.type === "error") {
            throw new Error(data.message);
          }
        } catch (e) {
          console.error("Error parsing stream chunk", e);
        }
      }
    }
  }

  // If there's leftover data in buffer, try to parse it one last time
  if (buffer.trim()) {
    const lines = buffer.split(/\r?\n/).map((l) => l.trim());
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.replace("data: ", "");
      try {
        const data = JSON.parse(jsonStr);

        if (data.type === "status") {
          callbacks.onStatus(data.status);
        } else if (data.type === "log") {
          callbacks.onLog?.(data.level, data.message, data.autoEnableBrowser);
        } else if (data.type === "result") {
          resultData = data.data;
        } else if (data.type === "error") {
          throw new Error(data.message);
        }
      } catch (e) {
        console.error("Error parsing final stream chunk", e);
      }
    }
  }

  if (!resultData) throw new Error("Stream ended without result");
  return resultData;
}

/**
 * Scrape a URL and get raw HTML
 */
export async function scrapeUrl(
  url: string,
  options?: ScrapeOptions,
): Promise<{
  url: string;
  title: string;
  html: string;
  source: string;
  chars: number;
}> {
  const response = await fetch("/api/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, options }),
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If we can't parse JSON, use the status text
      errorMessage = `Server error: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to scrape URL");
  }

  return data.data;
}

/**
 * Clean HTML (either from raw HTML or from a URL)
 */
export async function cleanHtml(input: {
  html?: string;
  url?: string;
  options?: ScrapeOptions;
}): Promise<{
  title: string;
  cleanedHtml: string;
  chars: number;
}> {
  const response = await fetch("/api/clean", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If we can't parse JSON, use the status text
      errorMessage = `Server error: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to clean HTML");
  }

  return data.data;
}

/**
 * @deprecated Use convertToMarkdown instead
 * Scrape a URL and convert to Markdown using the full pipeline
 */
export async function scrapeUrlStream(
  url: string,
  options: ScrapeOptions,
  callbacks: ScrapeStreamCallbacks,
): Promise<ScrapeResult> {
  return convertToMarkdown({ url }, options, callbacks);
}
