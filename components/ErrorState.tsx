import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { ScrapeStatus } from "../types";

// --- Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.4,
      bounce: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const ErrorState: React.FC = () => {
  const { error, setError, setStatus } = useAppContext();

  const handleRetry = () => {
    setStatus(ScrapeStatus.IDLE);
    setError(null);
  };

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          key="error-card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="mt-8 p-5 bg-white border border-red-200 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 items-start max-w-2xl mx-auto overflow-hidden"
        >
          {/* Icon Section */}
          <motion.div
            variants={itemVariants}
            className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0"
          >
            <AlertCircle className="h-5 w-5" />
          </motion.div>

          {/* Text Section */}
          <motion.div
            variants={itemVariants}
            className="flex-grow min-w-0 w-full"
          >
            <h3 className="text-sm font-semibold text-zinc-900">
              Extraction Failed
            </h3>
            <p className="text-sm text-zinc-600 mt-1 leading-relaxed break-words">
              {error}
            </p>
          </motion.div>

          {/* Action Button */}
          <motion.button
            variants={itemVariants}
            onClick={handleRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-4 py-2 bg-zinc-900 text-zinc-50 text-xs font-medium rounded-lg hover:bg-black transition-colors shrink-0 flex items-center justify-center gap-2"
          >
            <motion.div
              initial={{ rotate: 0 }}
              whileTap={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <RefreshCw className="h-3 w-3" />
            </motion.div>
            Retry
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorState;
