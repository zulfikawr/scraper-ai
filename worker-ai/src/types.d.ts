import "@cloudflare/workers-types";

declare global {
  interface AiModels {
    "@cf/meta/llama-3.1-8b-instruct": {
      messages: { role: string; content: string }[];
    };
  }
}
