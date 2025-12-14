import React, { useState, useEffect, useMemo, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: "markdown" | "html";
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  language,
  readOnly = false,
}) => {
  const [localCode, setLocalCode] = useState(code);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Sync external changes
  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  // Syntax Highlighting
  const highlightedCode = useMemo(() => {
    const grammar = Prism.languages[language] || Prism.languages.markup;

    if (typeof Prism !== "undefined" && grammar) {
      // Add a safe space at the end to ensure the last line renders correctly if empty
      return Prism.highlight(localCode, grammar, language) + "<br/>";
    }
    return localCode;
  }, [localCode, language]);

  // Handle Scroll Sync (Line numbers + Textarea + Pre)
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Generate Line Numbers
  const lineNumbers = useMemo(() => {
    const lines = localCode.split("\n").length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  }, [localCode]);

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="relative flex-grow flex overflow-hidden">
        {/* Line Numbers Gutter */}
        <div
          className="flex flex-col text-right bg-zinc-50 border-r border-zinc-100 text-zinc-400 select-none py-6 font-mono text-xs leading-relaxed overflow-hidden shrink-0"
          style={{
            width: "3.5rem",
            // This mimics the scroll of the textarea roughly for static content,
            // but real syncing requires the textarea scroll event to transform this container
          }}
        >
          <div
            className="w-full px-2"
            style={{
              transform: `translateY(-${textareaRef.current?.scrollTop || 0}px)`,
            }}
          >
            {lineNumbers.map((num) => (
              <div key={num} className="h-6 leading-6">
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div
          className="relative flex-grow h-full bg-white cursor-text"
          onClick={() => textareaRef.current?.focus()}
        >
          {/* Highlighted Layer (Visual) */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full p-6 !m-0 !bg-transparent !border-0 text-sm font-mono leading-6 whitespace-pre pointer-events-none text-zinc-800 z-0 overflow-hidden"
            style={{ tabSize: 2 }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />

          {/* Editable Layer (Logic) */}
          <textarea
            ref={textareaRef}
            className="absolute inset-0 w-full h-full p-6 !m-0 !bg-transparent !border-0 text-sm font-mono leading-6 whitespace-pre text-transparent caret-zinc-900 resize-none outline-none z-10 overflow-auto custom-scrollbar"
            style={{ tabSize: 2 }}
            value={localCode}
            onChange={(e) => {
              setLocalCode(e.target.value);
              // Force update for line numbers scroll sync immediately
            }}
            onScroll={(e) => {
              // Sync the pre tag
              if (preRef.current) {
                preRef.current.scrollTop = e.currentTarget.scrollTop;
                preRef.current.scrollLeft = e.currentTarget.scrollLeft;
              }
              // Sync the line numbers (by forcing a re-render or updating DOM manually)
              // Using a simple state update might be laggy, direct DOM manipulation is better for scroll
              const gutter = e.currentTarget.parentElement
                ?.previousElementSibling?.firstElementChild as HTMLElement;
              if (gutter) {
                gutter.style.transform = `translateY(-${e.currentTarget.scrollTop}px)`;
              }
            }}
            onBlur={() => setCode(localCode)}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-zinc-50 text-zinc-500 text-xs py-1.5 px-4 border-t border-zinc-100 flex justify-between items-center shrink-0 z-20">
        <span className="uppercase font-medium tracking-wider">{language}</span>
        <div className="flex gap-4">
          <span>{lineNumbers.length} lines</span>
          <span>{localCode.length} chars</span>
        </div>
      </div>
    </div>
  );
};
