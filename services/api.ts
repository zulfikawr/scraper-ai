import { ScrapeOptions, ScrapeResult, ScrapeStatus } from "@/types";

interface ScrapeStreamCallbacks {
  onStatus: (status: ScrapeStatus) => void;
}

export async function scrapeUrlStream(
  url: string,
  options: ScrapeOptions,
  callbacks: ScrapeStreamCallbacks,
): Promise<ScrapeResult> {
  const response = await fetch("/api/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, options }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let resultData: ScrapeResult | null = null;

  if (!reader) throw new Error("Browser does not support streaming");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    // SSE streams might send multiple lines at once, split them
    const lines = chunk
      .split("\n\n")
      .filter((line) => line.trim().startsWith("data: "));

    for (const line of lines) {
      const jsonStr = line.replace("data: ", "");
      try {
        const data = JSON.parse(jsonStr);

        if (data.type === "status") {
          callbacks.onStatus(data.status); // Update UI Status
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

  if (!resultData) throw new Error("Stream ended without result");
  return resultData;
}
