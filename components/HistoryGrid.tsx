import React from "react";
import { Clock, Trash2, ArrowRight, Calendar } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { HistoryItem, ScrapeResult, ScrapeStatus } from "../types";
import { useAppContext } from "../context/AppContext";

// --- Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 },
  },
};

const HistoryGrid: React.FC = () => {
  const {
    history,
    setHistory,
    setScrapeResult,
    setMarkdown,
    setStatus,
    setIsMaximized,
    setSelectedHistoryId,
  } = useAppContext();

  const handleLoadItem = (item: HistoryItem) => {
    const restoredResult: ScrapeResult = {
      url: item.url,
      title: item.title,
      markdown: item.markdown,
      html: item.html || "",
      mode: item.operation,
    };
    setScrapeResult(restoredResult);
    setMarkdown(item.markdown);
    setStatus(ScrapeStatus.SUCCESS);
    setIsMaximized(true);
    setSelectedHistoryId(item.id);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(history.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto mt-16 pb-12"
    >
      <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-2">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-4 w-4" />
          History
        </h2>
        <motion.button
          onClick={handleClearAll}
          whileHover={{ scale: 1.05, color: "#dc2626" }} // Red-600 on hover
          whileTap={{ scale: 0.95 }}
          className="text-xs text-zinc-400 transition-colors flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-50 rounded"
        >
          Clear History
        </motion.button>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        layout
      >
        <AnimatePresence mode="popLayout">
          {history.map((item) => (
            <motion.div
              layout
              key={item.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => handleLoadItem(item)}
              whileHover={{
                y: -4,
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white rounded-xl shadow-sm border border-zinc-200 p-4 cursor-pointer flex flex-col min-h-40"
            >
              {/* Operation Badge */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                  {item.operation || "convert"}
                </span>
              </div>

              <div className="flex-grow">
                <h3
                  className="font-medium text-sm text-zinc-900 line-clamp-2 leading-relaxed"
                  title={item.title}
                >
                  {item.title || "Untitled Page"}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-2 truncate opacity-70">
                  {new URL(item.url).hostname}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center">
                  <motion.button
                    onClick={(e) => handleDeleteItem(e, item.id)}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "#fef2f2",
                      color: "#ef4444",
                    }} // red-50, red-500
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 text-zinc-300 rounded-md transition-colors mr-1"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </motion.button>

                  <motion.div className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-300 transition-colors duration-300 group-hover:bg-zinc-900 group-hover:text-white">
                    <ArrowRight className="h-3 w-3" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default HistoryGrid;
