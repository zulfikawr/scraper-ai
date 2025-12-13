import React from "react";
import { motion } from "motion/react";
import { Code2, Terminal, ExternalLink, Table } from "lucide-react";
import { SpiderWeb } from "@/components/SpiderWeb";
import CodeBlock from "@/components/CodeBlock";

const ApiDocsPage: React.FC = () => {
  const examples = [
    {
      id: "curl-example",
      title: "cURL (Bash)",
      language: "bash",
      code: `curl -X POST http://localhost:5000/api/convert \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/article", "options": {"includeImages": true}}'`,
    },
    {
      id: "python-example",
      title: "Python (Requests)",
      language: "python",
      code: `import requests

url = "http://localhost:5000/api/convert"
payload = {
    "url": "https://example.com/article",
    "options": {
        "includeImages": True,
        "includeLinks": True
    }
}

response = requests.post(url, json=payload)
print(response.json())`,
    },
    {
      id: "node-example",
      title: "Node.js (Fetch)",
      language: "javascript",
      code: `const convertPage = async () => {
  const response = await fetch('http://localhost:5000/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://example.com/article',
      options: { includeImages: true }
    })
  });

  const data = await response.json();
  console.log(data);
};

convertPage();`,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <SpiderWeb
        lineColor="rgba(120, 120, 120, 0.25)"
        rings={18}
        spokes={24}
        friction={0.9}
        tension={0.01}
      />

      <main className="flex-grow px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm mb-6">
              <Terminal className="h-3 w-3 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-600 tracking-wide uppercase">
                Developer API
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 mb-4">
              API Documentation
            </h1>
            <p className="text-zinc-500 text-md md:text-lg leading-relaxed max-w-2xl">
              Convert any web page to clean Markdown using our REST API. Perfect
              for automation, content processing, and LLM workflows.
            </p>
          </motion.div>

          {/* 1. CONVERT Endpoint (Top Priority) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-md">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-md border border-emerald-200">
                        POST
                      </span>
                      <code className="text-base font-mono text-zinc-900 bg-zinc-100 px-2 py-1 rounded">
                        /api/convert
                      </code>
                    </div>
                    <p className="text-zinc-600">
                      <strong>Full Pipeline:</strong> Accepts a URL or raw HTML,
                      cleans it, and converts it to Markdown in one go.
                    </p>
                  </div>
                  <Code2 className="h-6 w-6 text-zinc-400 hidden sm:block" />
                </div>

                {/* --- Convert: Request --- */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Table className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-lg font-semibold text-zinc-900">
                      Request Parameters
                    </h3>
                  </div>

                  <div className="mb-6">
                    <CodeBlock
                      code={`{
  "url": "https://example.com/article",
  // OR
  "html": "<html>...</html>",
  "options": {
    "includeImages": true,
    "includeLinks": true,
    "useBrowser": false
  }
}`}
                      language="json"
                    />
                  </div>

                  <div className="overflow-x-scroll rounded-xl border border-zinc-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-zinc-700">
                            Field
                          </th>
                          <th className="px-4 py-3 font-semibold text-zinc-700">
                            Type
                          </th>
                          <th className="px-4 py-3 font-semibold text-zinc-700">
                            Required
                          </th>
                          <th className="px-4 py-3 font-semibold text-zinc-700">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            url
                          </td>
                          <td className="px-4 py-3 text-zinc-500">string</td>
                          <td className="px-4 py-3 text-emerald-600 font-medium">
                            One of
                          </td>
                          <td className="px-4 py-3 text-zinc-600">
                            The URL to scrape and convert.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            html
                          </td>
                          <td className="px-4 py-3 text-zinc-500">string</td>
                          <td className="px-4 py-3 text-emerald-600 font-medium">
                            One of
                          </td>
                          <td className="px-4 py-3 text-zinc-600">
                            Raw HTML to convert directly.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            options
                          </td>
                          <td className="px-4 py-3 text-zinc-500">object</td>
                          <td className="px-4 py-3 text-zinc-400">No</td>
                          <td className="px-4 py-3 text-zinc-600">
                            Configuration object.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900 pl-8">
                            options.includeImages
                          </td>
                          <td className="px-4 py-3 text-zinc-500">boolean</td>
                          <td className="px-4 py-3 text-zinc-400">No</td>
                          <td className="px-4 py-3 text-zinc-600">
                            Include images in the output.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900 pl-8">
                            options.includeLinks
                          </td>
                          <td className="px-4 py-3 text-zinc-500">boolean</td>
                          <td className="px-4 py-3 text-zinc-400">No</td>
                          <td className="px-4 py-3 text-zinc-600">
                            Format linked text as markdown links.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900 pl-8">
                            options.useBrowser
                          </td>
                          <td className="px-4 py-3 text-zinc-500">boolean</td>
                          <td className="px-4 py-3 text-zinc-400">No</td>
                          <td className="px-4 py-3 text-zinc-600">
                            Enable client-side rendering mode.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* --- Convert: Response --- */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Table className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-lg font-semibold text-zinc-900">
                      Response Format
                    </h3>
                  </div>

                  <div className="mb-6">
                    <CodeBlock
                      code={`{
  "success": true,
  "data": {
    "title": "Article Title",
    "markdown": "# Article Title\\n\\nContent...",
    "chars": 12345
  }
}`}
                      language="json"
                    />
                  </div>

                  <div className="overflow-x-scroll rounded-xl border border-zinc-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-zinc-700">
                            Field
                          </th>
                          <th className="px-4 py-3 font-semibold text-zinc-700">
                            Type
                          </th>
                          <th className="px-4 py-3 font-semibold text-zinc-700">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            success
                          </td>
                          <td className="px-4 py-3 text-zinc-500">boolean</td>
                          <td className="px-4 py-3 text-zinc-600">
                            Indicates success.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            data.title
                          </td>
                          <td className="px-4 py-3 text-zinc-500">string</td>
                          <td className="px-4 py-3 text-zinc-600">
                            Extracted page title.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            data.markdown
                          </td>
                          <td className="px-4 py-3 text-zinc-500">string</td>
                          <td className="px-4 py-3 text-zinc-600">
                            The resulting Markdown content.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            data.chars
                          </td>
                          <td className="px-4 py-3 text-zinc-500">number</td>
                          <td className="px-4 py-3 text-zinc-600">
                            Character count of markdown.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. SCRAPE Endpoint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-12"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-md border border-emerald-200">
                        POST
                      </span>
                      <code className="text-base font-mono text-zinc-900 bg-zinc-100 px-2 py-1 rounded">
                        /api/scrape
                      </code>
                    </div>
                    <p className="text-zinc-600">
                      Fetches raw HTML from a URL. Does not clean or convert.
                    </p>
                  </div>
                </div>

                {/* Scrape: Request */}
                <div className="flex items-center gap-2 mb-4">
                  <Table className="h-4 w-4 text-zinc-500" />
                  <h3 className="text-lg font-semibold text-zinc-900">
                    Request Parameters
                  </h3>
                </div>

                <div className="mb-6">
                  <CodeBlock
                    code={`{
  "url": "https://example.com/article",
  "options": {
    "useBrowser": false
  }
}`}
                    language="json"
                  />
                </div>

                <div className="overflow-x-scroll rounded-xl border border-zinc-200 mb-6">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-zinc-700">
                          Field
                        </th>
                        <th className="px-4 py-3 font-semibold text-zinc-700">
                          Type
                        </th>
                        <th className="px-4 py-3 font-semibold text-zinc-700">
                          Required
                        </th>
                        <th className="px-4 py-3 font-semibold text-zinc-700">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      <tr className="bg-white hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-mono text-zinc-900">
                          url
                        </td>
                        <td className="px-4 py-3 text-zinc-500">string</td>
                        <td className="px-4 py-3 text-emerald-600 font-medium">
                          Yes
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          The URL to scrape.
                        </td>
                      </tr>
                      <tr className="bg-white hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-mono text-zinc-900">
                          options
                        </td>
                        <td className="px-4 py-3 text-zinc-500">object</td>
                        <td className="px-4 py-3 text-zinc-400">No</td>
                        <td className="px-4 py-3 text-zinc-600">
                          Configuration object.
                        </td>
                      </tr>
                      <tr className="bg-white hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-mono text-zinc-900 pl-8">
                          options.useBrowser
                        </td>
                        <td className="px-4 py-3 text-zinc-500">boolean</td>
                        <td className="px-4 py-3 text-zinc-400">No</td>
                        <td className="px-4 py-3 text-zinc-600">
                          Enable client-side rendering mode.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Scrape: Response */}
                <div className="flex items-center gap-2 mb-4">
                  <Table className="h-4 w-4 text-zinc-500" />
                  <h3 className="text-lg font-semibold text-zinc-900">
                    Response Format
                  </h3>
                </div>

                <div className="mb-6">
                  <CodeBlock
                    code={`{
  "success": true,
  "data": {
    "url": "https://example.com/article",
    "html": "<html>...</html>",
    "source": "proxy",
    "chars": 12345
  }
}`}
                    language="json"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. CLEAN Endpoint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-md border border-emerald-200">
                        POST
                      </span>
                      <code className="text-base font-mono text-zinc-900 bg-zinc-100 px-2 py-1 rounded">
                        /api/clean
                      </code>
                    </div>
                    <p className="text-zinc-600">
                      Accepts HTML or URL, scrapes/cleans it, and returns a
                      sanitized HTML fragment.
                    </p>
                  </div>
                </div>

                {/* Clean: Request */}
                <div className="flex items-center gap-2 mb-4">
                  <Table className="h-4 w-4 text-zinc-500" />
                  <h3 className="text-lg font-semibold text-zinc-900">
                    Request Parameters
                  </h3>
                </div>

                <div className="mb-6">
                  <CodeBlock
                    code={`{
  "html": "<html>...</html>",
  "url": "https://example.com (optional)",
  "options": {
    "includeImages": true,
    "includeLinks": true,
    "useBrowser": false
  }
}`}
                    language="json"
                  />
                </div>

                <div className="overflow-x-scroll rounded-xl border border-zinc-200 mb-6">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-zinc-700">
                          Field
                        </th>
                        <th className="px-4 py-3 font-semibold text-zinc-700">
                          Type
                        </th>
                        <th className="px-4 py-3 font-semibold text-zinc-700">
                          Required
                        </th>
                        <th className="px-4 py-3 font-semibold text-zinc-700">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      <tr className="bg-white hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-mono text-zinc-900">
                          html
                        </td>
                        <td className="px-4 py-3 text-zinc-500">string</td>
                        <td className="px-4 py-3 text-emerald-600 font-medium">
                          One of
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          Raw HTML to be cleaned.
                        </td>
                      </tr>
                      <tr className="bg-white hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-mono text-zinc-900">
                          url
                        </td>
                        <td className="px-4 py-3 text-zinc-500">string</td>
                        <td className="px-4 py-3 text-emerald-600 font-medium">
                          One of
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          URL to scrape and clean.
                        </td>
                      </tr>
                      <tr className="bg-white hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-mono text-zinc-900">
                          options
                        </td>
                        <td className="px-4 py-3 text-zinc-500">object</td>
                        <td className="px-4 py-3 text-zinc-400">No</td>
                        <td className="px-4 py-3 text-zinc-600">
                          Configuration object.
                        </td>
                      </tr>
                      <tr className="bg-white hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-mono text-zinc-900 pl-8">
                          options.includeImages
                        </td>
                        <td className="px-4 py-3 text-zinc-500">boolean</td>
                        <td className="px-4 py-3 text-zinc-400">No</td>
                        <td className="px-4 py-3 text-zinc-600">
                          Include images in the output.
                        </td>
                      </tr>
                      <tr className="bg-white hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-mono text-zinc-900 pl-8">
                          options.includeLinks
                        </td>
                        <td className="px-4 py-3 text-zinc-500">boolean</td>
                        <td className="px-4 py-3 text-zinc-400">No</td>
                        <td className="px-4 py-3 text-zinc-600">
                          Format linked text as markdown links.
                        </td>
                      </tr>
                      <tr className="bg-white hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-mono text-zinc-900 pl-8">
                          options.useBrowser
                        </td>
                        <td className="px-4 py-3 text-zinc-500">boolean</td>
                        <td className="px-4 py-3 text-zinc-400">No</td>
                        <td className="px-4 py-3 text-zinc-600">
                          Enable client-side rendering mode.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Clean: Response */}
                <div className="flex items-center gap-2 mb-4">
                  <Table className="h-4 w-4 text-zinc-500" />
                  <h3 className="text-lg font-semibold text-zinc-900">
                    Response Format
                  </h3>
                </div>

                <div className="mb-6">
                  <CodeBlock
                    code={`{
  "success": true,
  "data": {
    "title": "Article Title",
    "cleanedHtml": "<article>...</article>",
    "chars": 12345
  }
}`}
                    language="json"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rate Limiting Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-12 bg-amber-50 border border-amber-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-700 text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  Rate Limiting
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  The API is rate-limited to{" "}
                  <strong>10 requests per minute</strong> per IP address. If you
                  exceed this limit, you'll receive a 429 response.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Code Examples */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">
              Integration Examples
            </h2>
            <div className="relative bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-md space-y-8">
              {examples.map((example) => (
                <div key={example.id} className="relative group">
                  <CodeBlock code={example.code} language={example.language} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Additional Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <a
              href="https://github.com/zulfikawr/scraper-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white rounded-xl border border-zinc-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-zinc-900">Source Code</h3>
                  <ExternalLink className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                </div>
                <p className="text-sm text-zinc-600">
                  View the complete source code on GitHub
                </p>
              </div>
            </a>

            <a href="/" className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white rounded-xl border border-zinc-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-zinc-900">Try It Out</h3>
                  <Code2 className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                </div>
                <p className="text-sm text-zinc-600">
                  Test the converter in your browser
                </p>
              </div>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ApiDocsPage;
