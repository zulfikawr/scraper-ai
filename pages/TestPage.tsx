import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TestTube2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  FileCode,
  Loader2,
  Terminal,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { SpiderWeb } from "@/components/SpiderWeb";

type TestStatus = "pass" | "fail" | "running" | "pending";

interface TestResult {
  name: string;
  status: TestStatus;
  duration?: number;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
}

interface LogEntry {
  timestamp: number;
  type: "info" | "success" | "error" | "test";
  message: string;
  testName?: string;
}

interface TestFunction {
  id: string;
  name: string;
  description: string;
  category: string;
  params: TestParam[];
  execute: (params: Record<string, string>) => void;
}

interface TestParam {
  name: string;
  type: "string" | "number" | "boolean";
  default: string;
  description: string;
}

const TestPage: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [summary, setSummary] = useState({
    passed: 0,
    failed: 0,
    total: 0,
    duration: 0,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testParams, setTestParams] = useState<
    Record<string, Record<string, string>>
  >({});
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(300);
  const [consoleMaximized, setConsoleMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});
  const logEndRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Handle console resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && consoleRef.current) {
        const newHeight = window.innerHeight - e.clientY;
        setConsoleHeight(
          Math.max(150, Math.min(newHeight, window.innerHeight - 200)),
        );
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const addLog = (
    type: LogEntry["type"],
    message: string,
    testName?: string,
  ) => {
    setLogs((prev) => [
      ...prev,
      { timestamp: Date.now(), type, message, testName },
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Browser-compatible validateUrl test
  const testValidateUrl = (input: string): string => {
    if (!input || !input.trim()) {
      throw new Error("URL cannot be empty");
    }

    let url = input.trim();

    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url)) {
      url = `https://${url}`;
    }

    try {
      const urlObj = new URL(url);

      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        throw new Error("Only HTTP and HTTPS protocols are allowed.");
      }

      return urlObj.href;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("protocols are allowed")
      ) {
        throw error;
      }
      throw new Error("Invalid URL format.");
    }
  };

  // Browser-compatible HTML cleaning test
  const testCleanHtml = (
    html: string,
  ): { title: string; hasScript: boolean; hasAd: boolean } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    return {
      title: doc.title || "Untitled",
      hasScript: doc.querySelector("script") !== null,
      hasAd: doc.querySelector(".ad") !== null,
    };
  };

  // Initialize test params with defaults
  const initializeTestParams = (test: TestFunction) => {
    if (!testParams[test.id]) {
      const defaultParams = test.params.reduce<Record<string, string>>(
        (acc, param) => {
          acc[param.name] = param.default;
          return acc;
        },
        {},
      );
      setTestParams((prev) => ({ ...prev, [test.id]: defaultParams }));
    }
  };

  // Define all available test functions with their parameters
  const availableTests: TestFunction[] = [
    {
      id: "validate-url-normalize",
      name: "URL Normalization",
      category: "URL Validation",
      description: "Tests URL normalization with https:// protocol",
      params: [
        {
          name: "url",
          type: "string",
          default: "https://example.com",
          description: "URL to validate",
        },
      ],
      execute: (params) => {
        const result = testValidateUrl(params.url);
        addLog("info", `Input: ${params.url}`, "URL Normalization");
        addLog("success", `Output: ${result}`, "URL Normalization");
        if (!result.startsWith("https://") && !result.startsWith("http://")) {
          throw new Error("URL must start with http:// or https://");
        }
      },
    },
    {
      id: "validate-url-add-protocol",
      name: "Auto-add Protocol",
      category: "URL Validation",
      description: "Tests automatic https:// addition",
      params: [
        {
          name: "url",
          type: "string",
          default: "example.com",
          description: "URL without protocol",
        },
      ],
      execute: (params) => {
        const result = testValidateUrl(params.url);
        addLog("info", `Input: ${params.url}`, "Auto-add Protocol");
        addLog("success", `Output: ${result}`, "Auto-add Protocol");
        if (result !== `https://${params.url}/`) {
          throw new Error(`Expected https://${params.url}/, got ${result}`);
        }
      },
    },
    {
      id: "validate-url-reject-empty",
      name: "Reject Empty URLs",
      category: "URL Validation",
      description: "Tests error handling for empty URLs",
      params: [],
      execute: () => {
        try {
          testValidateUrl("");
          throw new Error("Should have thrown error for empty URL");
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("cannot be empty")
          ) {
            addLog(
              "success",
              "Correctly rejected empty URL",
              "Reject Empty URLs",
            );
          } else {
            throw error;
          }
        }
      },
    },
    {
      id: "validate-url-unsafe-protocol",
      name: "Reject Unsafe Protocols",
      category: "URL Validation",
      description: "Tests rejection of non-HTTP(S) protocols",
      params: [
        {
          name: "protocol",
          type: "string",
          default: "ftp",
          description: "Unsafe protocol to test",
        },
      ],
      execute: (params) => {
        try {
          testValidateUrl(`${params.protocol}://example.com`);
          throw new Error("Should have thrown error for unsafe protocol");
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("HTTP and HTTPS")
          ) {
            addLog(
              "success",
              `Correctly rejected ${params.protocol}:// protocol`,
              "Reject Unsafe Protocols",
            );
          } else {
            throw error;
          }
        }
      },
    },

    // API Scrape Tests
    {
      id: "api-scrape-worker",
      name: "Scrape with Worker",
      category: "API - Scrape",
      description: "Tests scraping via Cloudflare Worker proxy",
      params: [
        {
          name: "url",
          type: "string",
          default: "https://example.com",
          description: "URL to scrape",
        },
      ],
      execute: async (params) => {
        addLog(
          "info",
          `Scraping via worker: ${params.url}`,
          "Scrape with Worker",
        );
        const response = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: params.url,
            options: { useBrowser: false },
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = (await response.json()) as {
          success: boolean;
          data?: { html: string; title: string; chars: number; source: string };
        };

        if (!data.success || !data.data) {
          throw new Error("API returned unsuccessful response");
        }

        addLog(
          "success",
          `Scraped ${data.data.chars} characters`,
          "Scrape with Worker",
        );
        addLog("info", `Title: ${data.data.title}`, "Scrape with Worker");
        addLog("info", `Source: ${data.data.source}`, "Scrape with Worker");
      },
    },
    {
      id: "api-scrape-browser",
      name: "Scrape with Browser",
      category: "API - Scrape",
      description: "Tests scraping with Cloudflare Browser Rendering",
      params: [
        {
          name: "url",
          type: "string",
          default: "https://example.com",
          description: "URL to scrape",
        },
      ],
      execute: async (params) => {
        addLog(
          "info",
          `Scraping via browser: ${params.url}`,
          "Scrape with Cloudflare Browser Rendering",
        );
        const response = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: params.url,
            options: { useBrowser: true },
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = (await response.json()) as {
          success: boolean;
          data?: { html: string; title: string; chars: number; source: string };
        };

        if (!data.success || !data.data) {
          throw new Error("API returned unsuccessful response");
        }

        addLog(
          "success",
          `Scraped ${data.data.chars} characters`,
          "Scrape with Browser",
        );
        addLog("info", `Title: ${data.data.title}`, "Scrape with Browser");
      },
    },

    // API Clean Tests
    {
      id: "api-clean-url",
      name: "Clean from URL",
      category: "API - Clean",
      description: "Tests cleaning HTML from a URL",
      params: [
        {
          name: "url",
          type: "string",
          default: "https://example.com",
          description: "URL to clean",
        },
      ],
      execute: async (params) => {
        addLog("info", `Cleaning URL: ${params.url}`, "Clean from URL");
        const response = await fetch("/api/clean", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: params.url }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = (await response.json()) as {
          success: boolean;
          data?: { cleanedHtml: string; title: string; chars: number };
        };

        if (!data.success || !data.data) {
          throw new Error("API returned unsuccessful response");
        }

        addLog(
          "success",
          `Cleaned to ${data.data.chars} characters`,
          "Clean from URL",
        );
        addLog("info", `Title: ${data.data.title}`, "Clean from URL");
      },
    },
    {
      id: "api-clean-html",
      name: "Clean Raw HTML",
      category: "API - Clean",
      description: "Tests cleaning raw HTML content",
      params: [
        {
          name: "html",
          type: "string",
          default:
            "<html><head><title>Test</title></head><body><script>alert('xss')</script><p>Content</p></body></html>",
          description: "HTML to clean",
        },
      ],
      execute: async (params) => {
        addLog(
          "info",
          `Cleaning raw HTML (${params.html.length} chars)`,
          "Clean Raw HTML",
        );
        const response = await fetch("/api/clean", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: params.html }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = (await response.json()) as {
          success: boolean;
          data?: { cleanedHtml: string; title: string; chars: number };
        };

        if (!data.success || !data.data) {
          throw new Error("API returned unsuccessful response");
        }

        addLog(
          "success",
          `Cleaned to ${data.data.chars} characters`,
          "Clean Raw HTML",
        );
        addLog("info", `Title: ${data.data.title}`, "Clean Raw HTML");

        if (data.data.cleanedHtml.includes("<script")) {
          throw new Error("Script tag not removed");
        }
        addLog("success", "Script tags removed", "Clean Raw HTML");
      },
    },

    // API Convert Tests
    {
      id: "api-convert-url",
      name: "Convert URL to Markdown",
      category: "API - Convert",
      description: "Tests converting URL to Markdown via SSE",
      params: [
        {
          name: "url",
          type: "string",
          default: "https://example.com",
          description: "URL to convert",
        },
      ],
      execute: async (params) => {
        addLog("info", `Converting: ${params.url}`, "Convert URL to Markdown");

        const response = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: params.url }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let markdown = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = JSON.parse(line.slice(6)) as {
                  type: string;
                  status?: string;
                  message?: string;
                  data?: { markdown?: string };
                };

                if (data.type === "status") {
                  addLog(
                    "info",
                    `Status: ${data.status}`,
                    "Convert URL to Markdown",
                  );
                } else if (data.type === "log") {
                  addLog("info", data.message || "", "Convert URL to Markdown");
                } else if (data.type === "result" && data.data?.markdown) {
                  markdown = data.data.markdown;
                  addLog(
                    "success",
                    `Converted to ${markdown.length} chars`,
                    "Convert URL to Markdown",
                  );
                } else if (data.type === "error") {
                  throw new Error(data.message || "Conversion failed");
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        if (!markdown) {
          throw new Error("No markdown received");
        }
      },
    },
    {
      id: "api-convert-url-gemini",
      name: "Convert with Gemini AI",
      category: "API - Convert",
      description: "Tests converting URL to Markdown using Gemini AI",
      params: [
        {
          name: "url",
          type: "string",
          default: "https://example.com",
          description: "URL to convert",
        },
      ],
      execute: async (params) => {
        addLog(
          "info",
          `Converting with Gemini: ${params.url}`,
          "Convert with Gemini AI",
        );

        const response = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: params.url,
            options: { aiProvider: "gemini" },
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let markdown = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = JSON.parse(line.slice(6)) as {
                  type: string;
                  status?: string;
                  message?: string;
                  data?: { markdown?: string };
                };

                if (data.type === "status") {
                  addLog(
                    "info",
                    `Status: ${data.status}`,
                    "Convert with Gemini AI",
                  );
                } else if (data.type === "log") {
                  addLog("info", data.message || "", "Convert with Gemini AI");
                } else if (data.type === "result" && data.data?.markdown) {
                  markdown = data.data.markdown;
                  addLog(
                    "success",
                    `Gemini converted to ${markdown.length} chars`,
                    "Convert with Gemini AI",
                  );
                } else if (data.type === "error") {
                  throw new Error(data.message || "Conversion failed");
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        if (!markdown) {
          throw new Error("No markdown received");
        }
      },
    },
    {
      id: "api-convert-url-deepseek",
      name: "Convert with DeepSeek AI",
      category: "API - Convert",
      description: "Tests converting URL to Markdown using DeepSeek AI",
      params: [
        {
          name: "url",
          type: "string",
          default: "https://example.com",
          description: "URL to convert",
        },
      ],
      execute: async (params) => {
        addLog(
          "info",
          `Converting with DeepSeek: ${params.url}`,
          "Convert with DeepSeek AI",
        );

        const response = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: params.url,
            options: { aiProvider: "deepseek" },
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let markdown = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = JSON.parse(line.slice(6)) as {
                  type: string;
                  status?: string;
                  message?: string;
                  data?: { markdown?: string };
                };

                if (data.type === "status") {
                  addLog(
                    "info",
                    `Status: ${data.status}`,
                    "Convert with DeepSeek AI",
                  );
                } else if (data.type === "log") {
                  addLog(
                    "info",
                    data.message || "",
                    "Convert with DeepSeek AI",
                  );
                } else if (data.type === "result" && data.data?.markdown) {
                  markdown = data.data.markdown;
                  addLog(
                    "success",
                    `DeepSeek converted to ${markdown.length} chars`,
                    "Convert with DeepSeek AI",
                  );
                } else if (data.type === "error") {
                  throw new Error(data.message || "Conversion failed");
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        if (!markdown) {
          throw new Error("No markdown received");
        }
      },
    },
    {
      id: "html-extract-title",
      name: "Extract HTML Title",
      category: "HTML Parsing",
      description: "Tests title extraction from HTML",
      params: [
        {
          name: "html",
          type: "string",
          default:
            "<html><head><title>Test Page</title></head><body></body></html>",
          description: "HTML to parse",
        },
        {
          name: "expectedTitle",
          type: "string",
          default: "Test Page",
          description: "Expected title",
        },
      ],
      execute: (params) => {
        const result = testCleanHtml(params.html);
        addLog("info", `Parsing HTML...`, "Extract HTML Title");
        addLog(
          "success",
          `Extracted title: "${result.title}"`,
          "Extract HTML Title",
        );
        if (result.title !== params.expectedTitle) {
          throw new Error(
            `Expected "${params.expectedTitle}", got "${result.title}"`,
          );
        }
      },
    },
    {
      id: "html-detect-script",
      name: "Detect Script Tags",
      category: "HTML Parsing",
      description: "Tests detection of script tags in HTML",
      params: [
        {
          name: "html",
          type: "string",
          default: '<body><script>alert("xss")</script><p>Content</p></body>',
          description: "HTML with script tag",
        },
      ],
      execute: (params) => {
        const result = testCleanHtml(params.html);
        addLog("info", `Checking for script tags...`, "Detect Script Tags");
        if (!result.hasScript) {
          throw new Error("Script tag not detected");
        }
        addLog(
          "success",
          "Script tag detected successfully",
          "Detect Script Tags",
        );
      },
    },
    {
      id: "html-detect-ads",
      name: "Detect Ad Elements",
      category: "HTML Parsing",
      description: "Tests detection of ad elements in HTML",
      params: [
        {
          name: "html",
          type: "string",
          default: '<body><div class="ad">Ad</div><p>Content</p></body>',
          description: "HTML with ad element",
        },
      ],
      execute: (params) => {
        const result = testCleanHtml(params.html);
        addLog("info", `Checking for ad elements...`, "Detect Ad Elements");
        if (!result.hasAd) {
          throw new Error("Ad element not detected");
        }
        addLog(
          "success",
          "Ad element detected successfully",
          "Detect Ad Elements",
        );
      },
    },
    {
      id: "string-trim",
      name: "Trim Whitespace",
      category: "String Utils",
      description: "Tests string trimming",
      params: [
        {
          name: "input",
          type: "string",
          default: "  hello world  ",
          description: "String to trim",
        },
      ],
      execute: (params) => {
        const result = params.input.trim();
        addLog("info", `Input: "${params.input}"`, "Trim Whitespace");
        addLog("success", `Output: "${result}"`, "Trim Whitespace");
        if (result !== params.input.trim()) {
          throw new Error("Trim failed");
        }
      },
    },
    {
      id: "string-lowercase",
      name: "Convert to Lowercase",
      category: "String Utils",
      description: "Tests lowercase conversion",
      params: [
        {
          name: "input",
          type: "string",
          default: "HELLO WORLD",
          description: "String to convert",
        },
      ],
      execute: (params) => {
        const result = params.input.toLowerCase();
        addLog("info", `Input: "${params.input}"`, "Convert to Lowercase");
        addLog("success", `Output: "${result}"`, "Convert to Lowercase");
        if (result !== params.input.toLowerCase()) {
          throw new Error("Lowercase conversion failed");
        }
      },
    },
  ];

  // Group tests by category
  const testsByCategory = availableTests.reduce<Record<string, TestFunction[]>>(
    (acc, test) => {
      if (!acc[test.category]) {
        acc[test.category] = [];
      }
      acc[test.category].push(test);
      return acc;
    },
    {},
  );

  const runAllTests = async () => {
    setConsoleOpen(true);
    setRunning(true);
    clearLogs();
    addLog("info", "Starting test suite execution...");

    const suites: TestSuite[] = [];
    let totalPassed = 0;
    let totalFailed = 0;
    const startTime = Date.now();

    for (const test of availableTests) {
      initializeTestParams(test);
      const testResult = await runSingleTest(test, testParams[test.id]);

      let suite = suites.find((s) => s.name === test.category);
      if (!suite) {
        suite = { name: test.category, tests: [] };
        suites.push(suite);
      }

      suite.tests.push(testResult);
      setTestSuites([...suites]);

      if (testResult.status === "pass") totalPassed++;
      if (testResult.status === "fail") totalFailed++;

      await delay(200);
    }

    setSummary({
      passed: totalPassed,
      failed: totalFailed,
      total: availableTests.length,
      duration: Date.now() - startTime,
    });

    addLog(
      "info",
      `Test suite completed: ${totalPassed} passed, ${totalFailed} failed`,
    );
    setRunning(false);
  };

  const runIndividualTest = async (test: TestFunction) => {
    setConsoleOpen(true);
    addLog("info", `Running individual test: ${test.name}`);

    const params = testParams[test.id] || {};
    const result = await runSingleTest(test, params);

    // Update the test suite with this result
    setTestSuites((prev) => {
      const newSuites = [...prev];
      let suite = newSuites.find((s) => s.name === test.category);
      if (!suite) {
        suite = { name: test.category, tests: [] };
        newSuites.push(suite);
      }

      const existingIndex = suite.tests.findIndex((t) => t.name === test.name);
      if (existingIndex >= 0) {
        suite.tests[existingIndex] = result;
      } else {
        suite.tests.push(result);
      }

      return newSuites;
    });
  };

  const runSingleTest = async (
    test: TestFunction,
    customParams?: Record<string, string>,
  ): Promise<TestResult> => {
    const params =
      customParams ||
      test.params.reduce<Record<string, string>>((acc, param) => {
        acc[param.name] = param.default;
        return acc;
      }, {});

    const start = Date.now();
    try {
      test.execute(params);
      return { name: test.name, status: "pass", duration: Date.now() - start };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Test failed";
      addLog("error", errorMessage, test.name);
      return {
        name: test.name,
        status: "fail",
        duration: Date.now() - start,
        error: errorMessage,
      };
    }
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-emerald-400";
      case "error":
        return "text-red-400";
      case "test":
        return "text-blue-400";
      default:
        return "text-zinc-400";
    }
  };

  const toggleSection = (category: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
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

      <main
        className="flex-grow px-4 sm:px-6 py-12 mb-12"
        style={{
          paddingBottom: consoleOpen ? `${consoleHeight + 20}px` : "20px",
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm mb-6">
              <TestTube2 className="h-3 w-3 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-600 tracking-wide uppercase">
                Interactive Tests
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 mb-4">
              Unit Testing Dashboard
            </h1>
            <p className="text-zinc-500 text-md md:text-lg leading-relaxed max-w-2xl mb-6">
              Run and monitor unit tests in real-time with customizable
              parameters and live console logging.
            </p>

            <button
              onClick={runAllTests}
              disabled={running}
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Run All Tests</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Summary Stats */}
          {summary.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <div className="relative bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-zinc-500 uppercase">
                  Passed
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {summary.passed}
                </p>
              </div>
              <div className="relative bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-zinc-500 uppercase">
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {summary.failed}
                </p>
              </div>
              <div className="relative bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-zinc-500 uppercase">
                  Total
                </p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">
                  {summary.total}
                </p>
              </div>
              <div className="relative bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-zinc-500 uppercase">
                  Duration
                </p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">
                  {(summary.duration / 1000).toFixed(2)}s
                </p>
              </div>
            </motion.div>
          )}

          {/* Test Suites */}
          <div className="space-y-6 mb-8">
            <AnimatePresence>
              {testSuites.map((suite, suiteIndex) => (
                <motion.div
                  key={suite.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: suiteIndex * 0.1 }}
                >
                  <div className="relative bg-white rounded-2xl border border-zinc-200 p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <FileCode className="h-5 w-5 text-zinc-500" />
                      <h2 className="text-xl font-bold text-zinc-900">
                        {suite.name}
                      </h2>
                      <span className="ml-auto text-sm text-zinc-500">
                        {suite.tests.filter((t) => t.status === "pass").length}{" "}
                        / {suite.tests.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {suite.tests.map((test, testIndex) => (
                        <motion.div
                          key={testIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: testIndex * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors"
                        >
                          {getStatusIcon(test.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900">
                              {test.name}
                            </p>
                            {test.error && (
                              <p className="text-xs text-red-600 mt-1 font-mono">
                                {test.error}
                              </p>
                            )}
                          </div>
                          {test.duration !== undefined && (
                            <span className="text-xs text-zinc-400">
                              {test.duration}ms
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Individual Test Controls by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {Object.entries(testsByCategory).map(([category, tests]) => {
              const isCollapsed = collapsedSections[category] ?? true; // Default to collapsed

              return (
                <div
                  key={category}
                  className="relative bg-white rounded-2xl border border-zinc-200 shadow-md overflow-hidden"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleSection(category)}
                    className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-zinc-500" />
                      <h2 className="text-xl font-bold text-zinc-900">
                        {category}
                      </h2>
                      <span className="text-sm text-zinc-500">
                        ({tests.length} tests)
                      </span>
                    </div>
                    {isCollapsed ? (
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-zinc-500" />
                    )}
                  </button>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-4 border-t border-zinc-200 pt-4">
                          {tests.map((test) => {
                            initializeTestParams(test);
                            return (
                              <div
                                key={test.id}
                                className="border border-zinc-200 rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-semibold text-zinc-900">
                                      {test.name}
                                    </h3>
                                    <p className="text-sm text-zinc-500">
                                      {test.description}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => runIndividualTest(test)}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-700 transition-colors flex-shrink-0"
                                  >
                                    <Play className="h-3.5 w-3.5" />
                                    Run
                                  </button>
                                </div>

                                {test.params.length > 0 && (
                                  <div className="space-y-2 mt-3">
                                    {test.params.map((param) => (
                                      <div key={param.name}>
                                        <label className="block text-xs font-medium text-zinc-700 mb-1">
                                          {param.description}
                                        </label>
                                        <input
                                          type="text"
                                          value={
                                            testParams[test.id]?.[param.name] ||
                                            param.default
                                          }
                                          onChange={(e) =>
                                            setTestParams((prev) => ({
                                              ...prev,
                                              [test.id]: {
                                                ...prev[test.id],
                                                [param.name]: e.target.value,
                                              },
                                            }))
                                          }
                                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                          placeholder={param.default}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>
      </main>

      {/* VS Code-style Bottom Console */}
      <div
        ref={consoleRef}
        className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 shadow-2xl"
        style={{
          height: consoleOpen
            ? consoleMaximized
              ? "100vh"
              : `${consoleHeight}px`
            : "auto",
          transition: isDragging ? "none" : "height 0.2s ease",
        }}
      >
        {/* Resize Handle */}
        {consoleOpen && !consoleMaximized && (
          <div
            className="h-1 w-full cursor-ns-resize hover:bg-blue-500 transition-colors"
            onMouseDown={() => setIsDragging(true)}
          />
        )}

        {/* Console Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Console</h3>
            <span className="text-xs text-zinc-500">
              ({logs.length} entries)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearLogs}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
              title="Clear logs"
            >
              <Trash2 className="h-4 w-4 text-zinc-400" />
            </button>
            <button
              onClick={() => setConsoleMaximized(!consoleMaximized)}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
              title={consoleMaximized ? "Restore" : "Maximize"}
            >
              {consoleMaximized ? (
                <Minimize2 className="h-4 w-4 text-zinc-400" />
              ) : (
                <Maximize2 className="h-4 w-4 text-zinc-400" />
              )}
            </button>
            <button
              onClick={() => setConsoleOpen(!consoleOpen)}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
              title={consoleOpen ? "Collapse" : "Expand"}
            >
              {consoleOpen ? (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronUp className="h-4 w-4 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        {/* Console Content */}
        {consoleOpen && (
          <div
            className="overflow-y-auto p-4 font-mono text-xs space-y-1"
            style={{
              height: consoleMaximized
                ? "calc(100vh - 40px)"
                : `${consoleHeight - 40}px`,
            }}
          >
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-zinc-500 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={getLogColor(log.type)}>
                  {log.testName && `[${log.testName}] `}
                  {log.message}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-zinc-600 italic">
                No logs yet. Run tests to see console output.
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
