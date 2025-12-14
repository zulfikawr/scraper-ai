import { ScrapeOptions } from "@/types";
import logger from "../../utils/logger";

const WORKER_URL = "https://web-to-md.zulfikar6556.workers.dev/";

export async function convertWithWorkerAI(
  htmlContent: string,
  options: ScrapeOptions,
): Promise<string> {
  try {
    logger.info("Attempting Worker AI conversion...");

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          includeImages: options.includeImages,
          includeLinks: options.includeLinks,
        },
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Worker returned status ${response.status}: ${await response.text()}`,
      );
    }
    const data = (await response.json()) as { markdown: string };

    if (data.markdown && data.markdown.trim().length > 0) {
      logger.info(
        "Worker AI conversion succeeded",
        `length=${data.markdown.length}`,
      );
      return data.markdown;
    }
    logger.warn("Worker AI returned empty markdown");
    return "";
  } catch (error) {
    logger.error("Worker AI API Error:", error);
    throw error;
  }
}
