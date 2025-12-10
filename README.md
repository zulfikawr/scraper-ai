<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Web to Markdown Converter

Convert any web page to clean, formatted Markdown with AI-powered processing.

## Features

- 🌐 Convert web pages to Markdown
- 🎨 Clean, modern UI
- 🔌 **Public REST API** for programmatic access
- 🚀 AI-powered content enhancement
- 📝 Export to Markdown
- 🔄 Conversion history

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file with:

   ```
   GEMINI_API_KEY=your_gemini_api_key
   WORKER_URL=your_cloudflare_worker_url
   ```

3. Run the app:

   **Frontend + Backend:**

   ```bash
   npm run dev:both
   ```

   **Frontend only:**

   ```bash
   npm run dev
   ```

   **Backend only:**

   ```bash
   npm run dev:server
   ```

## API Usage

The application exposes a public REST API for converting web pages to Markdown.

**Endpoint:** `POST /api/scrape`

**Example:**

```bash
curl -X POST http://localhost:5000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "title": "Example Domain",
    "markdown": "# Example Domain\n\nThis domain is for use in...",
    "html": "<html>...</html>"
  }
}
```

📚 **Full API Documentation:** [API_DOCS.md](./API_DOCS.md)

## Build for Production

```bash
npm run build
npm start
```

## View in AI Studio

https://ai.studio/apps/drive/133ohtPU7qet4Z6m2gCVC0c_vVkv-fkeA
