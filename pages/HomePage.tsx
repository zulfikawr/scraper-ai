import React from "react";
import { AnimatePresence } from "motion/react";
import { useAppContext } from "@/context/AppContext";
import InputSection from "@/components/InputSection";
import ResultsSection from "@/components/ResultsSection";
import HistoryGrid from "@/components/HistoryGrid";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { SpiderWeb } from "@/components/SpiderWeb";
import { convertToMarkdown } from "@/services/api";
import { ScrapeStatus } from "@/types";

export const HomePage: React.FC = () => {
  const {
    loading,
    error,
    status,
    history,
    scrapeOptions,
    scrapeResult,
    setStatus,
    setLoading,
    setError,
    setHistory,
    setScrapeResult,
    setMarkdown,
    setLogMessage,
  } = useAppContext();

  const showHistoryGrid =
    !loading && status !== "SUCCESS" && history.length > 0;

  const handleConvertSubmit = async (url: string) => {
    setStatus(ScrapeStatus.SCRAPING);
    setLoading(true);
    setError(null);
    setScrapeResult(null);
    setMarkdown("");

    try {
      const result = await convertToMarkdown({ url }, scrapeOptions, {
        onStatus: (newStatus) => {
          setStatus(newStatus);
        },
        onLog: (level, message, autoEnableBrowser) => {
          if (autoEnableBrowser) {
            // Logic to auto-enable browser in context could go here if needed
          }
          if (level === "error") {
            setError(message);
          }
          setLogMessage(`[${level.toUpperCase()}] ${message}`);
        },
      });

      if (!result.markdown || result.markdown.trim().length === 0) {
        setStatus(ScrapeStatus.ERROR);
        setError(
          "No content extracted. This might be a CSR website — try toggling Browser mode.",
        );
      } else {
        setScrapeResult({ ...result, mode: "convert" });
        setMarkdown(result.markdown);
        setStatus(ScrapeStatus.SUCCESS);

        setHistory((prev) => [
          {
            id: new Date().toISOString(),
            url: result.url,
            title: result.title,
            markdown: result.markdown,
            timestamp: Date.now(),
            operation: "convert",
          },
          ...prev,
        ]);
      }
    } catch (err: unknown) {
      console.error(err);
      setStatus(ScrapeStatus.ERROR);

      let errorMessage = "An unexpected error occurred.";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
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
          <InputSection onSubmit={handleConvertSubmit} />

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
              <ResultsSection key="results" />
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
