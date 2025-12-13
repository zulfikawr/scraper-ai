import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Command,
  Link2,
  Image as ImageIcon,
  Link as LinkIcon,
  Settings2,
  Loader2,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { ScrapeOptions, ScrapeStatus } from "../types";
import { useAppContext } from "../context/AppContext";

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

interface InputSectionProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  showOptions?: boolean;
  onSubmit: (url: string, options: ScrapeOptions) => Promise<void>;
  onOptionsChange?: (options: ScrapeOptions) => void;
  browserOptionBehavior?: "always" | "detect-url";
}

const InputSection: React.FC<InputSectionProps> = ({
  title = "Web to Markdown",
  subtitle = "Extract, clean, and format web content instantly.",
  placeholder = "Paste article URL...",
  showOptions = true,
  onSubmit,
  onOptionsChange,
  browserOptionBehavior = "always",
}) => {
  const { status, setError } = useAppContext();
  const [url, setUrl] = useState("");
  const [options, setOptions] = useState<ScrapeOptions>({
    includeImages: true,
    includeLinks: true,
    useBrowser: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we should show browser option
  const showBrowserOption =
    browserOptionBehavior === "always" ||
    (browserOptionBehavior === "detect-url" && url.trim().length > 0);

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
      if (pastedData && pastedData.trim().length > 0) {
        e.preventDefault();
        setUrl(pastedData.trim());
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (url.trim()) {
      setIsSubmitting(true);
      setError(null);

      try {
        await onSubmit(url, options);
        setUrl("");
      } catch (err: unknown) {
        console.error(err);

        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === "string") {
          setError(err);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleOption = (key: keyof ScrapeOptions) => {
    const newOptions = { ...options, [key]: !options[key] };
    setOptions(newOptions);
    onOptionsChange?.(newOptions);
  };

  const isLoading =
    status === ScrapeStatus.SCRAPING ||
    status === ScrapeStatus.CLEANING ||
    status === ScrapeStatus.CONVERTING;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto flex flex-col items-center pt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center mb-12 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-zinc-200/50 blur-[80px] -z-10 rounded-full"></div>

        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <a
            href="/docs"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all group"
          >
            <BookOpen className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-800" />
            <span className="text-xs font-semibold text-zinc-600 tracking-wide uppercase group-hover:text-zinc-900">
              API Documentation
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600" />
          </a>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 pb-2"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-2 text-zinc-400 text-lg md:text-xl max-w-lg mx-auto font-medium leading-relaxed"
        >
          {subtitle}
        </motion.p>
      </div>

      <motion.div
        layoutId="input-section"
        variants={itemVariants}
        className="relative w-full max-w-2xl mx-auto group z-50"
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
              type="text"
              placeholder={placeholder}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-transparent text-zinc-900 placeholder-zinc-400 focus:outline-none text-base font-medium font-sans h-10 border-none ring-0"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading || isSubmitting}
              required
              autoFocus
            />

            <motion.button
              type="submit"
              disabled={isLoading || isSubmitting || !url}
              layout
              className="shrink-0 relative flex items-center justify-center h-10 w-10 md:w-auto md:min-w-[120px] md:px-6 bg-zinc-900 hover:bg-black text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-200 hover:shadow-zinc-400 overflow-hidden transition-all duration-300"
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isLoading || isSubmitting ? (
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

          {showOptions && (
            <>
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
                    tooltip="Include images"
                  />
                  <OptionButton
                    isActive={options.includeLinks}
                    onClick={() => toggleOption("includeLinks")}
                    icon={LinkIcon}
                    label="Links"
                    tooltip="Format linked text as markdown links"
                  />
                  {showBrowserOption && (
                    <OptionButton
                      isActive={options.useBrowser}
                      onClick={() => toggleOption("useBrowser")}
                      icon={Command}
                      label="Browser"
                      tooltip="Enable client-side rendering mode"
                    />
                  )}
                </div>
              </div>
            </>
          )}
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

interface OptionButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType<{ className?: string }>;
  label: string;
  tooltip: string;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  isActive,
  onClick,
  icon: Icon,
  label,
  tooltip,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full mb-2.5 px-3 py-1.5 bg-zinc-800 text-zinc-50 text-[10px] font-medium rounded-lg whitespace-nowrap shadow-xl z-50"
          >
            {tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          backgroundColor: isActive ? "rgb(244 244 245)" : "transparent",
          color: isActive ? "rgb(24 24 27)" : "rgb(161 161 170)",
          borderColor: isActive ? "rgb(228 228 231)" : "transparent",
          boxShadow: isActive ? "0 1px 2px 0 rgb(0 0 0 / 0.05)" : "none",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border relative"
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </motion.button>
    </div>
  );
};

export default InputSection;
