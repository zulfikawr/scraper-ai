import React, { useState, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { useAppContext } from "@/context/AppContext";
import InputSection from "@/components/InputSection";
import ResultsSection from "@/components/ResultsSection";
import HistoryGrid from "@/components/HistoryGrid";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { SpiderWeb } from "@/components/SpiderWeb";
import { cleanHtml } from "@/services/api";
import { ScrapeOptions, ScrapeStatus, ScrapeResult } from "@/types";
import { motion } from "motion/react";
import { Upload, X } from "lucide-react";

export const CleanPage: React.FC = () => {
  const {
    loading,
    error,
    status,
    history,
    scrapeResult,
    setStatus,
    setLoading,
    setError,
    setScrapeResult,
    setMarkdown,
    setLogMessage,
    setHistory,
  } = useAppContext();

  const showHistoryGrid =
    !loading && status !== "SUCCESS" && history.length > 0;

  const [htmlInput, setHtmlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCleanSubmit = async (url: string, _options: ScrapeOptions) => {
    if (!htmlInput && !url) {
      setError("Please provide HTML or a URL");
      return;
    }

    setStatus(ScrapeStatus.CLEANING);
    setLoading(true);
    setError(null);
    setScrapeResult(null);
    setMarkdown("");

    try {
      setLogMessage("Cleaning HTML...");

      const result = await cleanHtml({
        html: htmlInput || undefined,
        url: url || undefined,
        options: _options,
      });

      const cleanResult: ScrapeResult = {
        url: url || "",
        title: result.title,
        html: result.cleanedHtml,
        markdown: "", // No markdown for clean-only
        mode: "clean",
      };

      setScrapeResult(cleanResult);
      setStatus(ScrapeStatus.SUCCESS);
      setLogMessage(`Successfully cleaned ${result.chars} characters`);
      setHtmlInput("");

      // Save to history
      setHistory((prev) => [
        {
          id: new Date().toISOString(),
          url: url || "",
          title: result.title,
          markdown: "",
          html: result.cleanedHtml,
          timestamp: Date.now(),
          operation: "clean",
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      console.error(err);
      setStatus(ScrapeStatus.ERROR);

      let errorMessage = "Failed to clean HTML";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      setLogMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "text/html" || file.name.endsWith(".html")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setHtmlInput(content);
        };
        reader.readAsText(file);
      } else {
        setError("Please drop an HTML file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setHtmlInput(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Spider Web */}
      <SpiderWeb
        lineColor="rgba(120, 120, 120, 0.25)"
        rings={18}
        spokes={24}
        friction={0.9}
        tension={0.01}
      />
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-5xl">
          <InputSection
            title="Clean HTML"
            subtitle="Remove noise and sanitize HTML content."
            placeholder="Paste URL or HTML..."
            showOptions={true}
            browserOptionBehavior="detect-url"
            onSubmit={handleCleanSubmit}
          />

          {/* HTML Drop Zone */}
          {!htmlInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 w-full max-w-2xl mx-auto"
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-zinc-400 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Drop HTML file or click to select
                </h3>
                <p className="text-sm text-zinc-500">
                  or paste HTML directly in the input above
                </p>
              </div>
            </motion.div>
          )}

          {/* HTML Preview */}
          {htmlInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 w-full max-w-2xl mx-auto"
            >
              <div className="bg-white border border-zinc-200 rounded-xl p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    HTML Content
                  </h3>
                  <button
                    onClick={() => setHtmlInput("")}
                    className="p-1 hover:bg-zinc-100 rounded transition-colors"
                  >
                    <X className="h-4 w-4 text-zinc-400" />
                  </button>
                </div>
                <div className="bg-zinc-50 rounded p-3 max-h-48 overflow-auto font-mono text-xs text-zinc-600 break-words whitespace-pre-wrap">
                  {htmlInput.slice(0, 500)}
                  {htmlInput.length > 500 && "..."}
                </div>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          <AnimatePresence mode="wait">
            {status === "ERROR" && error && <ErrorState key="error" />}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence mode="wait">
            {loading && <LoadingState key="loading" />}
          </AnimatePresence>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {status === "SUCCESS" && scrapeResult && (
              <ResultsSection key="results" mode="clean" />
            )}
          </AnimatePresence>

          {/* History Grid */}
          <AnimatePresence mode="wait">
            {showHistoryGrid && <HistoryGrid key="history" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
