# Web to Markdown Converter

![screenshot](/screenshot.png)

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

   ```env
   GEMINI_API_KEY=
   DEEPSEEK_API_KEY=
   WORKER_URL=
   CLOUDFLARE_API_KEY=
   CLOUDFLARE_ACCOUNT_ID=
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

## Build for Production

```bash
npm run build
npm start
```
