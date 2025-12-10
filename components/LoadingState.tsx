import React from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { ScrapeStatus } from "../types";
import { useAppContext } from "../context/AppContext";

// --- Variants ---
const textVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const LoadingState: React.FC = () => {
  const { status } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-12 flex flex-col items-center justify-center max-w-md mx-auto text-center"
    >
      {/* 1. Loader with Organic Pulse */}
      <div className="relative">
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

      {/* 2. Text Content (Smooth Crossfade) */}
      <div className="mt-6 h-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
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
      </div>

      {/* 3. Visual Progress Flow */}
      <div className="mt-8 flex items-center gap-2 text-xs font-mono">
        <StepBadge
          label="1. SCRAPE"
          state={status === ScrapeStatus.SCRAPING ? "active" : "completed"}
        />

        {/* Connector Line 1 */}
        <motion.div
          className="w-8 h-px"
          animate={{
            backgroundColor:
              status !== ScrapeStatus.SCRAPING ? "#22c55e" : "#e4e4e7", // green-500 : zinc-200
          }}
        />

        <StepBadge
          label="2. CLEAN"
          state={
            status === ScrapeStatus.CLEANING
              ? "active"
              : status === ScrapeStatus.CONVERTING ||
                  status === ScrapeStatus.SUCCESS
                ? "completed"
                : "inactive"
          }
        />

        {/* Connector Line 2 */}
        <motion.div
          className="w-8 h-px"
          animate={{
            backgroundColor:
              status === ScrapeStatus.CONVERTING ||
              status === ScrapeStatus.SUCCESS
                ? "#22c55e"
                : "#e4e4e7",
          }}
        />

        <StepBadge
          label="3. CONVERT"
          state={status === ScrapeStatus.CONVERTING ? "active" : "inactive"}
        />
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
  // Determine styles based on state
  const isActive = state === "active";
  const isCompleted = state === "completed";

  return (
    <motion.div
      layout
      className="px-3 py-1 rounded-full border"
      initial={false}
      animate={{
        backgroundColor: isActive
          ? "#18181b" // zinc-900
          : isCompleted
            ? "#22c55e" // green-500
            : "#f4f4f5", // zinc-100
        borderColor: isActive ? "#18181b" : isCompleted ? "#22c55e" : "#e4e4e7", // zinc-200
        color: isActive || isCompleted ? "#ffffff" : "#a1a1aa", // zinc-400
        scale: isActive ? 1.05 : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      {label}
    </motion.div>
  );
};

export default LoadingState;
