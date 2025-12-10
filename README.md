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
   GEMINI_API_KEY=
   WORKER_URL=
   CLOUDFLARE_API_KEY=
   CLOUDFLARE_ACCOUNT_ID=
   ```

# (Optional) Cloudflare Browser Rendering

CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_KEY=your_cloudflare_api_key

````

3. Run the app:

**Frontend + Backend:**

```bash
npm run dev:both
````

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

## Deploy to Vercel

Recommended approach: push your repository to GitHub and import it into Vercel. Then configure environment variables in the Vercel project settings.

1. Commit and push your changes to GitHub:

```bash
git add .
git commit -m "Add Cloudflare retry logs and codeblock docs"
git push origin main
```

2. In Vercel:

- Click "New Project" → Import Git Repository (select `zulfikawr/scraper-ai`).
- For a standard Vite + Node setup, use the default build settings. If your backend runs as a separate Express server, consider deploying the server to a Node host (Render, Fly, Railway) and set `WORKER_URL` and the API base URL accordingly.

3. Add Environment Variables in Vercel Dashboard → Project → Settings → Environment Variables:

- `GEMINI_API_KEY` = your Gemini API key
- `WORKER_URL` = your Cloudflare worker URL (proxy fetch)
- `CLOUDFLARE_ACCOUNT_ID` = your Cloudflare account id (if using Cloudflare Browser Rendering)
- `CLOUDFLARE_API_KEY` = your Cloudflare API token with Browser Rendering permissions

4. (Optional) If you prefer to host both frontend and backend on Vercel:

- Move the Express server into Vercel Serverless Functions (`/api` routes) or rewrite server endpoints as serverless handlers. This may require some adjustments to file paths and local filesystem usage.

5. After deploy, check logs in Vercel and ensure the environment variables are set. If Cloudflare Browser Rendering is used, ensure the account & key are valid and the Cloudflare plan supports the endpoint.

Notes:

- Cloudflare Browser Rendering may have usage limits or costs; verify your account plan.
- If you need help converting the Express server into Vercel serverless functions, I can prepare a minimal `api/` handler scaffold to make deployment smoother.
