import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Command,
  Link2,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Settings2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { ScrapeOptions, ScrapeStatus } from "../types";
import { useAppContext } from "../context/AppContext";
import { fetchPage, processContent } from "../services/scraperService";
import { convertToMarkdown } from "../services/geminiService";

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const InputSection: React.FC = () => {
  const {
    status,
    setStatus,
    setLoading,
    setError,
    setHistory,
    setScrapeResult,
    setMarkdown,
  } = useAppContext();
  const [url, setUrl] = useState("");
  const [options, setOptions] = useState<ScrapeOptions>({
    includeImages: true,
    includeLinks: true,
    cleanNoise: true,
  });

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const pastedData = e.clipboardData?.getData("text");
      if (pastedData) {
        if (pastedData.trim().length > 0) {
          setUrl(pastedData.trim());
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      setStatus(ScrapeStatus.SCRAPING);
      setLoading(true);
      setError(null);
      setScrapeResult(null);
      setMarkdown("");

      try {
        const { rawHtml, url: validUrl } = await fetchPage(url);

        setStatus(ScrapeStatus.CLEANING);
        await new Promise((r) => setTimeout(r, 500)); // UX Delay

        const result = await processContent(rawHtml, validUrl, options);
        setScrapeResult(result);

        setStatus(ScrapeStatus.PROCESSING);
        const md = await convertToMarkdown(
          result.cleanText,
          result.url,
          options,
        );
        setMarkdown(md);

        setHistory((prevHistory) => [
          {
            id: new Date().toISOString(),
            url: result.url,
            title: result.title,
            markdown: md,
            timestamp: Date.now(),
          },
          ...prevHistory,
        ]);
        setStatus(ScrapeStatus.SUCCESS);
      } catch (err: any) {
        console.error(err);
        setStatus(ScrapeStatus.ERROR);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleOption = (key: keyof ScrapeOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLoading =
    status === ScrapeStatus.SCRAPING ||
    status === ScrapeStatus.CLEANING ||
    status === ScrapeStatus.PROCESSING;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto flex flex-col items-center pt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <div className="text-center mb-12 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-zinc-200/50 blur-[80px] -z-10 rounded-full"></div>

        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
          </span>
          <span className="text-xs font-semibold text-zinc-600 tracking-wide uppercase">
            Universal Parser
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 pb-2"
        >
          Web to Markdown
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-2 text-zinc-400 text-lg md:text-xl max-w-lg mx-auto font-medium leading-relaxed"
        >
          Extract, clean, and format web content instantly.
        </motion.p>
      </div>

      {/* Main Input Card */}
      <motion.div
        variants={itemVariants}
        className="relative w-full max-w-2xl mx-auto group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 rounded-2xl blur opacity-20 sm:opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-bg-pan group-hover:blur-md"></div>
        <div className="absolute -bottom-2 left-2 right-2 h-full bg-zinc-900/5 rounded-2xl blur-lg -z-10 opacity-70 group-hover:opacity-100 transition-all duration-300"></div>
        <div className="w-full bg-white p-2 rounded-2xl shadow-md border border-zinc-200 transition-all duration-300 relative z-10">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-2"
          >
            <div className="absolute left-2 sm:left-4 text-zinc-400 pointer-events-none transition-colors group-hover:text-zinc-600 z-10">
              <Link2 className="h-5 w-5" />
            </div>

            <input
              type="url"
              placeholder="Paste article URL..."
              className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-transparent text-zinc-900 placeholder-zinc-400 focus:outline-none text-base font-medium font-sans h-10 border-none ring-0"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />

            <motion.button
              type="submit"
              disabled={isLoading || !url}
              layout
              className="shrink-0 relative flex items-center justify-center h-10 w-10 md:w-auto md:min-w-[120px] md:px-6 bg-zinc-900 hover:bg-black text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-200 hover:shadow-zinc-400 overflow-hidden transition-all duration-300"
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="hidden md:inline animate-pulse">
                      Processing
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <span className="hidden md:inline">Extract</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <div className="border border-zinc-100 my-2" />

          <div className="px-1 sm:px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider select-none">
              <Settings2 className="h-3 w-3" />
              <span>Options</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <OptionButton
                isActive={options.includeImages}
                onClick={() => toggleOption("includeImages")}
                icon={ImageIcon}
                label="Images"
              />
              <OptionButton
                isActive={options.includeLinks}
                onClick={() => toggleOption("includeLinks")}
                icon={LinkIcon}
                label="Links"
              />
              <OptionButton
                isActive={options.cleanNoise}
                onClick={() => toggleOption("cleanNoise")}
                icon={Sparkles}
                label="Clean"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-6 hidden md:flex items-center gap-4 text-xs text-zinc-400 font-mono transition-opacity opacity-50 hover:opacity-100"
      >
        <span className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded border border-zinc-200">
          <Command className="h-3 w-3" /> V
        </span>
        <span>Paste URL anywhere</span>
      </motion.div>
    </motion.div>
  );
};

// Helper component
const OptionButton = ({ isActive, onClick, icon: Icon, label }: any) => (
  <motion.button
    type="button"
    onClick={onClick}
    animate={{
      backgroundColor: isActive ? "rgb(244 244 245)" : "transparent", // zinc-100 vs transparent
      color: isActive ? "rgb(24 24 27)" : "rgb(161 161 170)", // zinc-900 vs zinc-400
      borderColor: isActive ? "rgb(228 228 231)" : "transparent", // zinc-200 vs transparent
      boxShadow: isActive ? "0 1px 2px 0 rgb(0 0 0 / 0.05)" : "none",
    }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </motion.button>
);

export default InputSection;
