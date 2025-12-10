import React from "react";
import { AnimatePresence } from "motion/react";
import { useAppContext } from "@/context/AppContext";
import InputSection from "@/components/InputSection";
import ResultsSection from "@/components/ResultsSection";
import HistoryGrid from "@/components/HistoryGrid";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { SpiderWeb } from "@/components/SpiderWeb";

export const HomePage: React.FC = () => {
  const { loading, error, status, history, scrapeResult } = useAppContext();

  const showHistoryGrid =
    !loading && status !== "SUCCESS" && history.length > 0;

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
          <InputSection />

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
