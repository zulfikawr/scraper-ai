import React, { useState, useEffect, useMemo } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-markdown";
interface EditMarkdownProps {
  markdown: string;
  setMarkdown: (markdown: string) => void;
}
export const EditMarkdown: React.FC<EditMarkdownProps> = ({
  markdown,
  setMarkdown,
}) => {
  const [localMarkdown, setLocalMarkdown] = useState(markdown);
  useEffect(() => {
    setLocalMarkdown(markdown);
  }, [markdown]);
  const highlightedCode = useMemo(() => {
    if (
      typeof Prism !== "undefined" &&
      Prism.languages &&
      Prism.languages.markdown
    ) {
      return Prism.highlight(
        localMarkdown,
        Prism.languages.markdown,
        "markdown",
      );
    }
    return localMarkdown;
  }, [localMarkdown]);
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div
        className="relative flex-grow overflow-y-auto custom-scrollbar cursor-text bg-white"
        onClick={(e) => {
          const textarea = e.currentTarget.querySelector("textarea");
          textarea?.focus();
        }}
      >
        <div className="grid grid-cols-1 grid-rows-1 min-h-full">
          <pre
            className="col-start-1 row-start-1 w-full h-full !p-6 !m-0 !bg-transparent !border-0 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words pointer-events-none text-zinc-800 z-0"
            style={{ tabSize: 2 }}
            aria-hidden="true"
            dangerouslySetInnerHTML={{
              __html: highlightedCode + "<br/>",
            }}
          />
          <textarea
            className="col-start-1 row-start-1 w-full h-full !p-6 !m-0 !bg-transparent !border-0 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words text-transparent caret-zinc-900 resize-none outline-none z-10 overflow-hidden"
            style={{ tabSize: 2 }}
            value={localMarkdown}
            onChange={(e) => setLocalMarkdown(e.target.value)}
            onBlur={() => setMarkdown(localMarkdown)}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
      </div>
      <div className="bg-zinc-50 text-zinc-500 text-xs py-1.5 px-4 border-t border-zinc-100 flex justify-between items-center shrink-0 z-20">
        <span>Markdown Mode</span>
        <span>{localMarkdown.length} chars</span>
      </div>
    </div>
  );
};
