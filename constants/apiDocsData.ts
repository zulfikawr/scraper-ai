export interface ApiParam {
  name: string;
  type: string;
  required: boolean | string; // "Yes", "No", "One of"
  description: string;
}

export interface ApiField {
  name: string;
  type: string;
  description: string;
}

export interface EndpointDoc {
  id: string;
  method: "POST" | "GET";
  path: string;
  title?: string;
  description: string;
  requestParams: ApiParam[];
  responseFormat: ApiField[]; // For the table
  requestExample: object; // For the code block
  responseExample: object; // For the code block
}

export const API_DOCS_DATA: EndpointDoc[] = [
  {
    id: "convert",
    method: "POST",
    path: "/api/convert",
    title: "Full Pipeline (Convert)",
    description:
      "Accepts a URL or raw HTML, cleans it, and converts it to Markdown in one go.",
    requestParams: [
      {
        name: "url",
        type: "string",
        required: "One of",
        description: "The URL to scrape and convert.",
      },
      {
        name: "html",
        type: "string",
        required: "One of",
        description: "Raw HTML to convert directly.",
      },
      {
        name: "options",
        type: "object",
        required: "No",
        description: "Configuration object.",
      },
      {
        name: "options.includeImages",
        type: "boolean",
        required: "No",
        description: "Include images in the output.",
      },
      {
        name: "options.includeLinks",
        type: "boolean",
        required: "No",
        description: "Format linked text as markdown links.",
      },
      {
        name: "options.useBrowser",
        type: "boolean",
        required: "No",
        description: "Enable client-side rendering mode.",
      },
    ],
    responseFormat: [
      {
        name: "success",
        type: "boolean",
        description: "Indicates success.",
      },
      {
        name: "data.title",
        type: "string",
        description: "Extracted page title.",
      },
      {
        name: "data.markdown",
        type: "string",
        description: "The resulting Markdown content.",
      },
      {
        name: "data.chars",
        type: "number",
        description: "Character count of markdown.",
      },
    ],
    requestExample: {
      url: "https://example.com/article",
      // OR
      html: "<html>...</html>",
      options: {
        includeImages: true,
        includeLinks: true,
        useBrowser: false,
      },
    },
    responseExample: {
      success: true,
      data: {
        title: "Article Title",
        markdown: "# Article Title\n\nContent...",
        chars: 12345,
      },
    },
  },
  {
    id: "scrape",
    method: "POST",
    path: "/api/scrape",
    title: "Scrape Only",
    description: "Fetches raw HTML from a URL. Does not clean or convert.",
    requestParams: [
      {
        name: "url",
        type: "string",
        required: "Yes",
        description: "The URL to scrape.",
      },
      {
        name: "options",
        type: "object",
        required: "No",
        description: "Configuration object.",
      },
      {
        name: "options.useBrowser",
        type: "boolean",
        required: "No",
        description: "Enable client-side rendering mode.",
      },
    ],
    responseFormat: [
      {
        name: "success",
        type: "boolean",
        description: "Indicates success.",
      },
      {
        name: "data.url",
        type: "string",
        description: "The scraped URL.",
      },
      {
        name: "data.html",
        type: "string",
        description: "Raw HTML content.",
      },
      {
        name: "data.source",
        type: "string",
        description: "Source of scrape (e.g. 'proxy').",
      },
      {
        name: "data.chars",
        type: "number",
        description: "Character count of HTML.",
      },
    ],
    requestExample: {
      url: "https://example.com/article",
      options: {
        useBrowser: false,
      },
    },
    responseExample: {
      success: true,
      data: {
        url: "https://example.com/article",
        html: "<html>...</html>",
        source: "proxy",
        chars: 12345,
      },
    },
  },
  {
    id: "clean",
    method: "POST",
    path: "/api/clean",
    title: "Clean HTML",
    description:
      "Accepts HTML or URL, scrapes/cleans it, and returns a sanitized HTML fragment.",
    requestParams: [
      {
        name: "html",
        type: "string",
        required: "One of",
        description: "Raw HTML to be cleaned.",
      },
      {
        name: "url",
        type: "string",
        required: "One of",
        description: "URL to scrape and clean.",
      },
      {
        name: "options",
        type: "object",
        required: "No",
        description: "Configuration object.",
      },
      {
        name: "options.includeImages",
        type: "boolean",
        required: "No",
        description: "Include images in the output.",
      },
      {
        name: "options.includeLinks",
        type: "boolean",
        required: "No",
        description: "Format linked text as markdown links.",
      },
      {
        name: "options.useBrowser",
        type: "boolean",
        required: "No",
        description: "Enable client-side rendering mode.",
      },
    ],
    responseFormat: [
      {
        name: "success",
        type: "boolean",
        description: "Indicates success.",
      },
      {
        name: "data.title",
        type: "string",
        description: "Article title.",
      },
      {
        name: "data.cleanedHtml",
        type: "string",
        description: "The sanitized HTML content.",
      },
      {
        name: "data.chars",
        type: "number",
        description: "Character count of cleaned HTML.",
      },
    ],
    requestExample: {
      html: "<html>...</html>",
      url: "https://example.com (optional)",
      options: {
        includeImages: true,
        includeLinks: true,
        useBrowser: false,
      },
    },
    responseExample: {
      success: true,
      data: {
        title: "Article Title",
        cleanedHtml: "<article>...</article>",
        chars: 12345,
      },
    },
  },
];
