import React from "react";
import { Loader2, Terminal } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { ScrapeStatus } from "../types";
import { useAppContext } from "../context/AppContext";

const textVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const logVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const LoadingState: React.FC = () => {
  const { status, logMessage } = useAppContext();

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-12 flex flex-col items-center justify-center max-w-lg mx-auto text-center"
    >
      <div className="relative mb-6">
        <motion.div
          className="absolute inset-0 bg-zinc-200 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <div className="relative p-4 bg-white rounded-full border border-zinc-100 shadow-xl">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-zinc-900" />
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            <h3 className="text-lg font-medium text-zinc-900">
              {status === ScrapeStatus.SCRAPING && "Fetching Content"}
              {status === ScrapeStatus.CLEANING && "Cleaning Noise"}
              {status === ScrapeStatus.CONVERTING && "Converting into Markdown"}
            </h3>

            <p className="mt-2 text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
              {status === ScrapeStatus.SCRAPING &&
                "Accessing the URL and retrieving raw HTML structure..."}
              {status === ScrapeStatus.CLEANING &&
                "Removing ads, navigation, and unnecessary scripts..."}
              {status === ScrapeStatus.CONVERTING &&
                "Organizing the content into structured Markdown..."}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="w-full flex justify-center min-h-[40px]">
          <AnimatePresence mode="wait">
            {logMessage && (
              <motion.div
                key={logMessage}
                layout
                variants={logVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex items-start gap-3 px-4 py-2 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-sm max-w-full"
              >
                <Terminal className="w-3.5 h-3.5 mt-0.5 text-zinc-400 shrink-0" />
                <p className="text-xs text-zinc-600 font-mono text-left break-words leading-tight">
                  {logMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs font-mono">
        {status === ScrapeStatus.SCRAPING && (
          <>
            <StepBadge label="SCRAPE" state="active" />
          </>
        )}

        {status === ScrapeStatus.CLEANING && (
          <>
            <StepBadge label="CLEAN" state="active" />
          </>
        )}

        {status === ScrapeStatus.CONVERTING && (
          <>
            <StepBadge label="CONVERT" state="active" />
          </>
        )}
      </div>
    </motion.div>
  );
};

const StepBadge = ({
  label,
  state,
}: {
  label: string;
  state: "inactive" | "active" | "completed";
}) => {
  const isActive = state === "active";
  const isCompleted = state === "completed";

  return (
    <motion.div
      layout
      className="px-3 py-1 rounded-full border whitespace-nowrap"
      initial={false}
      animate={{
        backgroundColor: isActive
          ? "#18181b"
          : isCompleted
            ? "#22c55e"
            : "#f4f4f5",
        borderColor: isActive ? "#18181b" : isCompleted ? "#22c55e" : "#e4e4e7",
        color: isActive || isCompleted ? "#ffffff" : "#a1a1aa",
        scale: isActive ? 1.05 : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      {label}
    </motion.div>
  );
};

export default LoadingState;
