import React from "react";
import { AnimatePresence } from "motion/react";
import { useAppContext } from "@/context/AppContext";
import InputSection from "@/components/InputSection";
import ResultsSection from "@/components/ResultsSection";
import HistoryGrid from "@/components/HistoryGrid";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { SpiderWeb } from "@/components/SpiderWeb";
import { scrapeUrl } from "@/services/api";
import { ScrapeOptions, ScrapeStatus, ScrapeResult } from "@/types";

export const ScrapePage: React.FC = () => {
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

  const handleScrapeSubmit = async (url: string, _options: ScrapeOptions) => {
    setStatus(ScrapeStatus.SCRAPING);
    setLoading(true);
    setError(null);
    setScrapeResult(null);
    setMarkdown("");

    try {
      setLogMessage("Fetching raw HTML...");

      const result = await scrapeUrl(url, _options);

      const scrapeResult: ScrapeResult = {
        url: result.url,
        title: result.title,
        html: result.html,
        markdown: "", // No markdown for scrape-only
        mode: "scrape",
      };

      setScrapeResult(scrapeResult);
      setStatus(ScrapeStatus.SUCCESS);
      setLogMessage(`Successfully scraped ${result.chars} characters`);

      // Save to history
      setHistory((prev) => [
        {
          id: new Date().toISOString(),
          url: result.url,
          title: result.title,
          markdown: "",
          html: result.html,
          timestamp: Date.now(),
          operation: "scrape",
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      console.error(err);
      setStatus(ScrapeStatus.ERROR);

      let errorMessage = "Failed to scrape URL";

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
            title="Scrape to HTML"
            subtitle="Extract raw HTML from any URL."
            placeholder="Paste URL to scrape..."
            showOptions={true}
            browserOptionBehavior="always"
            onSubmit={handleScrapeSubmit}
          />

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
              <ResultsSection key="results" mode="scrape" />
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
