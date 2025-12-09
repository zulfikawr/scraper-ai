import React, { useState, useMemo, useEffect } from "react";
import markdownit from "markdown-it";
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

// Declare Prism global
declare const Prism: any;

const ResultsSection: React.FC = () => {
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
    }
  }, [status, scrapeResult, setIsMaximized]);

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
      markdownit({
        html: true,
        linkify: true,
        typographer: true,
      }),

    [],
  );

  const renderedContent = useMemo(() => {
    const rawHtml = md.render(localMarkdown);

    return DOMPurify.sanitize(rawHtml);
  }, [localMarkdown, md]);

  const handleCopy = () => {
    if (!scrapeResult) return;

    const textToCopy =
      activeTab === "preview" || activeTab === "markdown"
        ? localMarkdown
        : scrapeResult.rawHtml;

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
              {new URL(scrapeResult.url).hostname}{" "}
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
          <TabButton
            active={activeTab === "preview"}
            onClick={() => setActiveTab("preview")}
            icon={<Eye className="h-4 w-4" />}
            label="Preview"
          />

          <TabButton
            active={activeTab === "markdown"}
            onClick={() => setActiveTab("markdown")}
            icon={<FileJson2 className="h-4 w-4" />}
            label="Editor"
          />

          <TabButton
            active={activeTab === "raw"}
            onClick={() => setActiveTab("raw")}
            icon={<Code2 className="h-4 w-4" />}
            label="HTML"
          />
        </div>
      </div>

      <div className="relative flex-grow bg-zinc-50/50 overflow-hidden flex flex-col">
        {activeTab === "preview" && (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto p-6 sm:p-8">
              <article
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
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
              {scrapeResult.rawHtml}
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
