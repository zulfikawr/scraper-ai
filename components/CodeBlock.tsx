import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-xml-doc";
import "prismjs/components/prism-css";
import "prismjs/components/prism-sql";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = "text" }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let highlightedCode = code;
  try {
    if (Prism.languages[language]) {
      highlightedCode = Prism.highlight(
        code,
        Prism.languages[language],
        language,
      );
    } else {
      // Fallback: try to highlight as generic code if language is not available
      highlightedCode = Prism.highlight(
        code,
        Prism.languages.clike || Prism.languages.markup,
        "text",
      );
    }
  } catch (e) {
    console.warn(`Failed to highlight code for language: ${language}`, e);
  }

  return (
    <div className="relative group bg-white rounded-xl overflow-hidden shadow-md border border-zinc-200 my-4 not-prose">
      {/* Header: Title Bar with Language and Copy Button */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
          </div>
          <span className="text-xs font-medium text-zinc-600 ml-2 uppercase tracking-wide">
            {language}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white hover:bg-zinc-100 transition-colors border border-zinc-200"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                Copied!
              </span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-zinc-500" />
              <span className="text-xs text-zinc-600 font-medium">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Block */}
      <pre className="!m-0 !p-4 !bg-zinc-50 !border-0 text-sm overflow-x-auto">
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

export default CodeBlock;
