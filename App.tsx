import React from "react";
import { useAppContext } from "./context/AppContext";

// Components
import InputSection from "./components/InputSection";
import ResultsSection from "./components/ResultsSection";
import HistoryGrid from "./components/HistoryGrid";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import { SpiderWeb } from "./components/SpiderWeb";

const App: React.FC = () => {
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
          {status === "ERROR" && error && <ErrorState />}

          {/* Loading State */}
          {loading && <LoadingState />}

          {/* Results Section */}
          {status === "SUCCESS" && scrapeResult && <ResultsSection />}

          {showHistoryGrid && <HistoryGrid />}
        </div>
      </main>

      <footer className="py-6 text-center text-zinc-400 text-xs font-mono">
        <a
          href="https://github.com/zulfikawr/scraper-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-600 transition-colors"
        >
          Source code
        </a>
      </footer>
    </div>
  );
};

export default App;
