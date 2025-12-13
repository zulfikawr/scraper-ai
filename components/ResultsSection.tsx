import React, { useState, useEffect } from "react";
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
import { renderMarkdown } from "../function/renderMarkdown";
import { EditMarkdown } from "../function/editMarkdown";

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
  // localMarkdown is now managed in EditMarkdown for the editor,
  // but we still pass markdown from context and a setter.
  // Actually, EditMarkdown needs the base state to be able to update parent.
  // The 'localMarkdown' state in ResultsSection was primarily for the editor.
  // We can pass setMarkdown directly to EditMarkdown/onBlur,
  // but better to keep the pattern 'EditMarkdown' handles its own local state and syncs on blur?
  // Yes, EditMarkdown takes 'markdown' (initial) and 'setMarkdown' (on commit).

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

  const handleCopy = () => {
    if (!scrapeResult) return;

    const textToCopy =
      activeTab === "preview" || activeTab === "markdown"
        ? markdown // Copy the current markdown state
        : scrapeResult.html;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!scrapeResult) return null;

  const effectiveMode = scrapeResult.mode || mode;
  const shouldShowPreview = effectiveMode === "convert";
  const shouldShowMarkdown = effectiveMode === "convert";
  const shouldShowRaw = effectiveMode === "scrape" || effectiveMode === "clean";

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
              <div className="prose max-w-none">{renderMarkdown(markdown)}</div>
            </div>
          </div>
        )}

        {activeTab === "markdown" && (
          <EditMarkdown markdown={markdown} setMarkdown={setMarkdown} />
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
