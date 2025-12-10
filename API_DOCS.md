# Web to Markdown API Documentation

## Overview

The Web to Markdown API allows you to convert any web page to clean, formatted Markdown. Simply send a POST request with a URL, and receive structured Markdown content in the response.

**Base URL:** `http://localhost:5000/api` (development)

## Endpoints

### POST /api/scrape

Convert a web page to Markdown format.

**Request:**

```json
{
  "url": "https://example.com/article",
  "options": {
    "includeImages": true,
    "includeLinks": true
  }
}
```

**Parameters:**

| Field                   | Type    | Required | Description                                    |
| ----------------------- | ------- | -------- | ---------------------------------------------- |
| `url`                   | string  | Yes      | The URL of the web page to scrape              |
| `options.includeImages` | boolean | No       | Include images in the markdown (default: true) |
| `options.includeLinks`  | boolean | No       | Include links in the markdown (default: true)  |

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "url": "https://example.com/article",
    "title": "Article Title",
    "markdown": "# Article Title\n\nArticle content...",
    "html": "<html>...</html>"
  }
}
```

**Response Fields:**

| Field           | Type    | Description                             |
| --------------- | ------- | --------------------------------------- |
| `success`       | boolean | Indicates if the request was successful |
| `data.url`      | string  | The final URL after any redirects       |
| `data.title`    | string  | The extracted page title                |
| `data.markdown` | string  | The content converted to Markdown       |
| `data.html`     | string  | The original HTML content               |

**Response (Error):**

```json
{
  "success": false,
  "error": "Failed to fetch via proxy: Invalid URL"
}
```

### GET /api/health

Check the health status of the API.

**Response:**

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-12-10T03:30:00.000Z"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit:** 10 requests per minute per IP address
- **Headers:** Rate limit info is included in response headers
- **Exceeded:** Returns HTTP 429 with error message

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:5000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "options": {
      "includeImages": true,
      "includeLinks": true
    }
  }'
```

### JavaScript (Fetch API)

```javascript
const response = await fetch("http://localhost:5000/api/scrape", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://example.com",
    options: {
      includeImages: true,
      includeLinks: true,
    },
  }),
});

const result = await response.json();

if (result.success) {
  console.log("Markdown:", result.data.markdown);
} else {
  console.error("Error:", result.error);
}
```

### Python (requests)

```python
import requests

url = "http://localhost:5000/api/scrape"
payload = {
    "url": "https://example.com",
    "options": {
        "includeImages": True,
        "includeLinks": True
    }
}

response = requests.post(url, json=payload)
data = response.json()

if data["success"]:
    print("Markdown:", data["data"]["markdown"])
else:
    print("Error:", data["error"])
```

### Node.js (axios)

```javascript
const axios = require("axios");

async function scrapeUrl(targetUrl) {
  try {
    const response = await axios.post("http://localhost:5000/api/scrape", {
      url: targetUrl,
      options: {
        includeImages: true,
        includeLinks: true,
      },
    });

    if (response.data.success) {
      return response.data.data.markdown;
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.error("Scraping failed:", error.message);
    throw error;
  }
}

// Usage
scrapeUrl("https://example.com")
  .then((markdown) => console.log(markdown))
  .catch((err) => console.error(err));
```

## Error Codes

| HTTP Status | Error Message          | Description                       |
| ----------- | ---------------------- | --------------------------------- |
| 400         | "URL is required"      | No URL provided in request        |
| 400         | "URL must be a string" | Invalid URL type                  |
| 429         | "Too many requests..." | Rate limit exceeded               |
| 500         | "Failed to scrape URL" | Server-side error during scraping |

## Best Practices

1. **Error Handling:** Always check the `success` field before accessing `data`
2. **Rate Limits:** Implement exponential backoff if you hit rate limits
3. **Timeouts:** Set appropriate timeouts for your requests (scraping can take 10-60 seconds)
4. **URL Validation:** Validate URLs before sending to avoid unnecessary API calls
5. **Options:** Only set `includeImages` or `includeLinks` to `false` if you specifically need to exclude them

## Production Deployment

When deploying to production:

1. Set `NODE_ENV=production`
2. Set `WORKER_URL` environment variable to your Cloudflare Worker URL
3. Configure your domain and SSL certificates
4. Update the base URL in your API calls
5. Consider adding authentication/API keys for production use

## Support

For issues or questions, please visit the [GitHub repository](https://github.com/zulfikawr/scraper-ai).
