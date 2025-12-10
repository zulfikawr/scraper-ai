import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Code2,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Table,
} from "lucide-react";
import { SpiderWeb } from "@/components/SpiderWeb";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";

const ApiDocsPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const examples = [
    {
      id: "curl",
      title: "cURL",
      language: "bash",
      code: `curl -N -X POST http://localhost:5000/api/scrape \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`,
    },
    {
      id: "javascript",
      title: "JavaScript (Streaming)",
      language: "javascript",
      code: `const response = await fetch('http://localhost:5000/api/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value));
}`,
    },
    {
      id: "python",
      title: "Python (Streaming)",
      language: "python",
      code: `import requests

url = 'http://localhost:5000/api/scrape'
json_data = {'url': 'https://example.com'}

with requests.post(url, json=json_data, stream=True) as r:
    for line in r.iter_lines():
        if line:
            print(line.decode('utf-8'))`,
    },
  ];

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <SpiderWeb
        lineColor="rgba(120, 120, 120, 0.25)"
        rings={18}
        spokes={24}
        friction={0.9}
        tension={0.01}
      />

      <main className="flex-grow px-4 sm:px-6 py-12 relative z-10">
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
            <p className="text-zinc-500 text-lg leading-relaxed max-w-2xl">
              Convert any web page to clean Markdown using our REST API. Perfect
              for automation, content processing, and integration workflows.
            </p>
          </motion.div>

          {/* Endpoint Card */}
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
                        /api/scrape
                      </code>
                    </div>
                    <p className="text-zinc-600">
                      Initiates a streaming conversion of a web page to
                      Markdown.
                    </p>
                  </div>
                  <Code2 className="h-6 w-6 text-zinc-400 hidden sm:block" />
                </div>

                {/* --- Request Parameters --- */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Table className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-lg font-semibold text-zinc-900">
                      Request Parameters
                    </h3>
                  </div>

                  {/* JSON Example */}
                  <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 overflow-x-auto mb-6">
                    <pre className="language-json text-sm !m-0 !p-0 !bg-transparent">
                      <code className="language-json">{`{
  "url": "https://example.com/article",
  "options": {
    "includeImages": true,
    "includeLinks": true
  }
}`}</code>
                    </pre>
                  </div>

                  {/* Table */}
                  <div className="overflow-hidden rounded-xl border border-zinc-200">
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
                            The full URL of the web page to scrape.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            options.includeImages
                          </td>
                          <td className="px-4 py-3 text-zinc-500">boolean</td>
                          <td className="px-4 py-3 text-zinc-400">No</td>
                          <td className="px-4 py-3 text-zinc-600">
                            Include images in markdown (default: true).
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            options.includeLinks
                          </td>
                          <td className="px-4 py-3 text-zinc-500">boolean</td>
                          <td className="px-4 py-3 text-zinc-400">No</td>
                          <td className="px-4 py-3 text-zinc-600">
                            Include links in markdown (default: true).
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* --- Response Fields --- */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Table className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-lg font-semibold text-zinc-900">
                      Response Format
                    </h3>
                  </div>

                  <p className="text-sm text-zinc-500 mb-4">
                    The API streams{" "}
                    <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">
                      text/event-stream
                    </code>{" "}
                    data. The final event will be of type{" "}
                    <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">
                      result
                    </code>
                    .
                  </p>

                  {/* JSON Example (Success) */}
                  <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 overflow-x-auto mb-6">
                    <pre className="language-json text-sm !m-0 !p-0 !bg-transparent">
                      <code className="language-json">{`// Final Event Data
{
  "type": "result",
  "data": {
    "url": "https://example.com/article",
    "title": "Article Title",
    "markdown": "# Article Title\\n\\nArticle content...",
    "html": "<html>...</html>"
  }
}`}</code>
                    </pre>
                  </div>

                  {/* Table */}
                  <div className="overflow-hidden rounded-xl border border-zinc-200">
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
                            type
                          </td>
                          <td className="px-4 py-3 text-zinc-500">string</td>
                          <td className="px-4 py-3 text-zinc-600">
                            Event type:{" "}
                            <code className="text-xs bg-zinc-100 px-1 rounded">
                              status
                            </code>
                            ,{" "}
                            <code className="text-xs bg-zinc-100 px-1 rounded">
                              result
                            </code>
                            , or{" "}
                            <code className="text-xs bg-zinc-100 px-1 rounded">
                              error
                            </code>
                            .
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            data.url
                          </td>
                          <td className="px-4 py-3 text-zinc-500">string</td>
                          <td className="px-4 py-3 text-zinc-600">
                            The final URL after redirects.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            data.title
                          </td>
                          <td className="px-4 py-3 text-zinc-500">string</td>
                          <td className="px-4 py-3 text-zinc-600">
                            The extracted page title.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            data.markdown
                          </td>
                          <td className="px-4 py-3 text-zinc-500">string</td>
                          <td className="px-4 py-3 text-zinc-600">
                            The converted Markdown content.
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-mono text-zinc-900">
                            data.html
                          </td>
                          <td className="px-4 py-3 text-zinc-500">string</td>
                          <td className="px-4 py-3 text-zinc-600">
                            The original raw HTML content.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rate Limiting Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
            <div className="space-y-6">
              {examples.map((example) => (
                <div key={example.id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative bg-white rounded-xl overflow-hidden shadow-lg border border-zinc-200">
                    <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-200">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
                          <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
                        </div>
                        <span className="text-xs font-medium text-zinc-600 ml-2">
                          {example.title}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(example.code, example.id)
                        }
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white hover:bg-zinc-100 transition-colors border border-zinc-200"
                      >
                        {copiedCode === example.id ? (
                          <>
                            <Check className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">
                              Copied!
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-zinc-600" />
                            <span className="text-xs text-zinc-600 font-medium">
                              Copy
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-4 bg-white overflow-x-auto">
                      <pre
                        className={`language-${example.language} text-sm leading-relaxed !m-0 !p-0 !bg-transparent`}
                      >
                        <code className={`language-${example.language}`}>
                          {example.code}
                        </code>
                      </pre>
                    </div>
                  </div>
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

      <footer className="py-6 text-center text-zinc-400 text-xs font-mono relative z-10">
        <a href="/" className="underline hover:text-zinc-600 transition-colors">
          Back to Home
        </a>
      </footer>
    </div>
  );
};

export default ApiDocsPage;
