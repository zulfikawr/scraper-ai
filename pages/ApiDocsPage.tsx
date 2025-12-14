import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Code2,
  Terminal,
  ExternalLink,
  Table as TableIcon,
  Copy,
  Check,
} from "lucide-react";
import { SpiderWeb } from "@/components/SpiderWeb";
import CodeBlock from "@/components/CodeBlock";
import Table, { Column } from "@/components/Table";
import {
  API_DOCS_DATA,
  EndpointDoc,
  ApiParam,
  ApiField,
} from "@/constants/apiDocsData";

const ApiDocsPage: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState("http://localhost:5000");
  const [copiedLLM, setCopiedLLM] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleCopyToLLM = () => {
    const lines = ["# API Documentation\n"];
    lines.push(`Base URL: ${baseUrl}\n`);

    API_DOCS_DATA.forEach((doc) => {
      lines.push(`## ${doc.method} ${doc.path}`);
      lines.push(`${doc.description}\n`);

      lines.push("### Request Parameters");
      doc.requestParams.forEach((p) => {
        lines.push(
          `- ${p.name} (${p.type}, ${p.required ? "Required" : "Optional"}): ${p.description}`,
        );
      });
      lines.push("");

      lines.push("### Response Fields");
      doc.responseFormat.forEach((f) => {
        lines.push(`- ${f.name} (${f.type}): ${f.description}`);
      });
      lines.push("");
    });

    const markdown = lines.join("\n");
    navigator.clipboard.writeText(markdown);
    setCopiedLLM(true);
    setTimeout(() => setCopiedLLM(false), 2000);
  };

  const paramColumns: Column<ApiParam>[] = [
    {
      header: "Field",
      accessorKey: "name",
      className: "font-mono text-zinc-900",
      cell: (item) => <span className="pl-0">{item.name}</span>,
    },
    { header: "Type", accessorKey: "type", className: "text-zinc-500" },
    {
      header: "Required",
      accessorKey: "required",
      cell: (item) => (
        <span
          className={
            item.required === "Yes" || item.required === true
              ? "text-emerald-600 font-medium"
              : "text-zinc-400"
          }
        >
          {item.required === true ? "Yes" : item.required || "No"}
        </span>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      className: "text-zinc-600",
    },
  ];

  const responseColumns: Column<ApiField>[] = [
    {
      header: "Field",
      accessorKey: "name",
      className: "font-mono text-zinc-900",
    },
    { header: "Type", accessorKey: "type", className: "text-zinc-500" },
    {
      header: "Description",
      accessorKey: "description",
      className: "text-zinc-600",
    },
  ];

  const generateCurl = (doc: EndpointDoc, baseUrl: string) => {
    return `curl -X ${doc.method} ${baseUrl}${doc.path} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(doc.requestExample, null, 2)}'`;
  };

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
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
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
                Convert any web page to clean Markdown using our REST API.
                Perfect for automation, content processing, and LLM workflows.
              </p>
            </div>

            <button
              onClick={handleCopyToLLM}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-zinc-200 hover:shadow-zinc-300 transform hover:-translate-y-0.5 active:translate-y-0 w-fit"
            >
              {copiedLLM ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedLLM ? "Copied!" : "Copy for LLM"}
            </button>
          </motion.div>

          {/* Dynamic Sections */}
          {API_DOCS_DATA.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="mb-12"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-md">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-md border border-emerald-200">
                          {doc.method}
                        </span>
                        <code className="text-base font-mono text-zinc-900 bg-zinc-100 px-2 py-1 rounded">
                          {doc.path}
                        </code>
                      </div>
                      <p className="text-zinc-600">
                        <strong>{doc.title}:</strong> {doc.description}
                      </p>
                    </div>
                    <Code2 className="h-6 w-6 text-zinc-400 hidden sm:block" />
                  </div>

                  {/* Request */}
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <TableIcon className="h-4 w-4 text-zinc-500" />
                      <h3 className="text-lg font-semibold text-zinc-900">
                        Request Parameters
                      </h3>
                    </div>

                    <div className="mb-6">
                      <CodeBlock
                        code={generateCurl(doc, baseUrl)}
                        language="bash"
                      />
                    </div>

                    <Table<ApiParam>
                      data={doc.requestParams}
                      columns={paramColumns}
                    />
                  </div>

                  {/* Response */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <TableIcon className="h-4 w-4 text-zinc-500" />
                      <h3 className="text-lg font-semibold text-zinc-900">
                        Response Format
                      </h3>
                    </div>

                    <div className="mb-6">
                      <CodeBlock
                        code={JSON.stringify(doc.responseExample, null, 2)}
                        language="json"
                      />
                    </div>

                    <Table<ApiField>
                      data={doc.responseFormat}
                      columns={responseColumns}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Rate Limiting Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mb-12 bg-amber-50 border border-amber-200 rounded-xl p-4"
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
                  exceed this limit, you&apos;ll receive a 429 response.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
