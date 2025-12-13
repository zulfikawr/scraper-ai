import React, { useState, useMemo, useEffect } from "react";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import {
  Eye,
  Code2,
  FileJson2,
  Copy,
  Check,
  ExternalLink,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { TabType, ScrapeStatus } from "../types";
import { useAppContext } from "../context/AppContext";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-markdown";
import CodeBlock from "./CodeBlock";

type ResultsMode = "convert" | "scrape" | "clean";

interface ResultsSectionProps {
  mode?: ResultsMode;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  mode = "convert",
}) => {
  const {
    scrapeResult,
    markdown,
    isMaximized,
    status,
    setStatus,
    setScrapeResult,
    setMarkdown,
    setIsMaximized,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<TabType>("preview");
  const [copied, setCopied] = useState(false);
  const [localMarkdown, setLocalMarkdown] = useState(markdown);

  useEffect(() => {
    setLocalMarkdown(markdown);
  }, [markdown]);

  useEffect(() => {
    if (status === ScrapeStatus.SUCCESS && scrapeResult) {
      setIsMaximized(true);
      // Set initial tab based on mode
      const effectiveMode = scrapeResult.mode || mode;
      if (effectiveMode === "scrape") {
        setActiveTab("raw");
      } else if (effectiveMode === "clean") {
        setActiveTab("raw");
      } else {
        setActiveTab("preview");
      }
    }
  }, [status, scrapeResult, setIsMaximized, mode]);

  const handleClose = () => {
    setStatus(ScrapeStatus.IDLE);
    setScrapeResult(null);
    setMarkdown("");
    setIsMaximized(false);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const md = useMemo(
    () =>
      new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        highlight: (code: string, lang: string) => {
          // Return a data attribute so we can identify code blocks later
          return `<div data-code-block="${btoa(code)}" data-language="${lang}"></div>`;
        },
      }),
    [],
  );

  const handleCopy = () => {
    if (!scrapeResult) return;

    const textToCopy =
      activeTab === "preview" || activeTab === "markdown"
        ? localMarkdown
        : scrapeResult.html;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedCode = useMemo(() => {
    if (
      typeof Prism !== "undefined" &&
      Prism.languages &&
      Prism.languages.markdown
    ) {
      return Prism.highlight(
        localMarkdown,
        Prism.languages.markdown,
        "markdown",
      );
    }

    return localMarkdown;
  }, [localMarkdown]);

  if (!scrapeResult) return null;

  // Helper function to parse markdown and render code blocks with CodeBlock component
  const renderMarkdownWithCodeBlocks = (
    markdownText: string,
    mdInstance: MarkdownIt,
  ) => {
    // Split markdown by code fence markers
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(markdownText)) !== null) {
      const language = match[1] || "text";
      const code = match[2];

      // Render markdown before this code block
      if (match.index > lastIndex) {
        const beforeCode = markdownText.slice(lastIndex, match.index);
        const html = mdInstance.render(beforeCode);
        const sanitized = DOMPurify.sanitize(html);
        elements.push(
          <div
            key={`before-${match.index}`}
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />,
        );
      }

      // Add the code block component
      elements.push(
        <CodeBlock
          key={`code-${match.index}`}
          code={code.trim()}
          language={language}
        />,
      );

      lastIndex = match.index + match[0].length;
    }

    // Render remaining markdown after last code block
    if (lastIndex < markdownText.length) {
      const remaining = markdownText.slice(lastIndex);
      const html = mdInstance.render(remaining);
      const sanitized = DOMPurify.sanitize(html);
      elements.push(
        <div key="remaining" dangerouslySetInnerHTML={{ __html: sanitized }} />,
      );
    }

    // If no code blocks found, render entire markdown normally
    if (elements.length === 0) {
      const html = mdInstance.render(markdownText);
      const sanitized = DOMPurify.sanitize(html);
      return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
    }

    return elements;
  };

  // Determine which tabs to show based on mode
  const effectiveMode = scrapeResult.mode || mode;
  const shouldShowPreview = effectiveMode === "convert";
  const shouldShowMarkdown = effectiveMode === "convert";
  const shouldShowRaw = effectiveMode === "scrape" || effectiveMode === "clean";

  // Guard against missing scrapeResult
  if (!scrapeResult) {
    return null;
  }

  return (
    <div
      className={`w-full bg-white flex flex-col overflow-hidden ${
        isMaximized
          ? "fixed inset-0 z-50 rounded-none h-full"
          : "relative h-[calc(100vh-4rem)] min-h-[500px] rounded-xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-zinc-200 mt-8"
      }`}
    >
      <div className="flex flex-col border-b border-zinc-100 shrink-0 bg-white z-20">
        <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-start justify-between gap-4">
          <div className="overflow-hidden flex-grow min-w-0">
            <h2
              className="text-base font-semibold text-zinc-900 truncate pr-4"
              title={scrapeResult.title}
            >
              {scrapeResult.title}
            </h2>

            <a
              href={scrapeResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1 mt-1 truncate font-mono transition-colors w-fit"
            >
              {(() => {
                try {
                  return new URL(scrapeResult.url).hostname;
                } catch {
                  return scrapeResult.url;
                }
              })()}{" "}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 h-9 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-medium rounded-lg transition-colors mr-2"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}

              {copied ? "Copied" : "Copy"}
            </button>

            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 p-1 h-9 rounded-lg border border-zinc-100">
              <button
                onClick={handleMaximize}
                className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded-md transition-all"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={handleClose}
                className="p-1.5 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex px-4 sm:px-6 gap-6 overflow-x-auto no-scrollbar">
          {shouldShowPreview && (
            <TabButton
              active={activeTab === "preview"}
              onClick={() => setActiveTab("preview")}
              icon={<Eye className="h-4 w-4" />}
              label="Preview"
            />
          )}

          {shouldShowMarkdown && (
            <TabButton
              active={activeTab === "markdown"}
              onClick={() => setActiveTab("markdown")}
              icon={<FileJson2 className="h-4 w-4" />}
              label="Editor"
            />
          )}

          {shouldShowRaw && (
            <TabButton
              active={activeTab === "raw"}
              onClick={() => setActiveTab("raw")}
              icon={<Code2 className="h-4 w-4" />}
              label={effectiveMode === "scrape" ? "HTML" : "Cleaned HTML"}
            />
          )}
        </div>
      </div>

      <div className="relative flex-grow bg-zinc-50/50 overflow-hidden flex flex-col">
        {activeTab === "preview" && (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto p-6 sm:p-8">
              <div className="prose max-w-none">
                {renderMarkdownWithCodeBlocks(localMarkdown, md)}
              </div>
            </div>
          </div>
        )}

        {activeTab === "markdown" && (
          <div className="absolute inset-0 flex flex-col bg-white">
            <div
              className="relative flex-grow overflow-y-auto custom-scrollbar cursor-text bg-white"
              onClick={(e) => {
                const textarea = e.currentTarget.querySelector("textarea");
                textarea?.focus();
              }}
            >
              <div className="grid grid-cols-1 grid-rows-1 min-h-full">
                <pre
                  className="col-start-1 row-start-1 w-full h-full !p-6 !m-0 !bg-transparent !border-0 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words pointer-events-none text-zinc-800 z-0"
                  style={{ tabSize: 2 }}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{
                    __html: highlightedCode + "<br/>",
                  }}
                />

                <textarea
                  className="col-start-1 row-start-1 w-full h-full !p-6 !m-0 !bg-transparent !border-0 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words text-transparent caret-zinc-900 resize-none outline-none z-10 overflow-hidden"
                  style={{ tabSize: 2 }}
                  value={localMarkdown}
                  onChange={(e) => setLocalMarkdown(e.target.value)}
                  onBlur={() => setMarkdown(localMarkdown)}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                />
              </div>
            </div>

            <div className="bg-zinc-50 text-zinc-500 text-xs py-1.5 px-4 border-t border-zinc-100 flex justify-between items-center shrink-0 z-20">
              <span>Markdown Mode</span>
              <span>{localMarkdown.length} chars</span>
            </div>
          </div>
        )}

        {activeTab === "raw" && (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            <pre className="p-6 text-xs font-mono text-zinc-500 leading-relaxed whitespace-pre-wrap break-all">
              {scrapeResult.html}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}> = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all ${
      active
        ? "border-zinc-900 text-zinc-900"
        : "border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-200"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default ResultsSection;
