import React from "react";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import CodeBlock from "../components/CodeBlock";
import Table, { Column } from "../components/Table";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const renderTable = (
  tokens: any[],
  startIndex: number,
  mdInstance: MarkdownIt,
): { element: React.ReactNode; endIndex: number } => {
  const headers: string[] = [];
  const data: Record<string, string>[] = [];
  let currentRow: Record<string, string> = {};
  let colIndex = 0;
  let inBody = false;
  let i = startIndex;

  // Advance to find headers and rows
  while (i < tokens.length && tokens[i].type !== "table_close") {
    i++;
    const t = tokens[i];

    if (t.type === "tbody_open") inBody = true;
    if (t.type === "tbody_close") inBody = false;

    if (t.type === "tr_open") {
      currentRow = {};
      colIndex = 0;
    }
    if (t.type === "tr_close") {
      if (inBody) {
        data.push(currentRow);
      }
    }

    if (t.type === "th_open") {
      // Found header cell
      // The content is in the next inline token
      if (tokens[i + 1] && tokens[i + 1].type === "inline") {
        headers.push(tokens[i + 1].content);
      }
    }

    if (t.type === "td_open") {
      // Found body cell
      if (tokens[i + 1] && tokens[i + 1].type === "inline") {
        const cellContent = mdInstance.renderer.render(
          [tokens[i + 1]],
          mdInstance.options,
          {},
        );
        currentRow[`col${colIndex}`] = cellContent;
      } else {
        currentRow[`col${colIndex}`] = "";
      }
      colIndex++;
    }
  }

  // Construct Columns
  const columns: Column<any>[] = headers.map((header, idx) => ({
    header,
    accessorKey: `col${idx}`,
    cell: (row: any) => (
      <span dangerouslySetInnerHTML={{ __html: row[`col${idx}`] }} />
    ),
  }));

  const element = (
    <div key={`table-${startIndex}`} className="not-prose">
      <Table data={data} columns={columns} />
    </div>
  );

  return { element, endIndex: i };
};

const renderBlockCode = (token: any, index: number): React.ReactNode => {
  const language = token.info || "text";
  const code = token.content;

  return (
    <CodeBlock key={`code-${index}`} code={code.trim()} language={language} />
  );
};

export const renderMarkdown = (markdownText: string): React.ReactNode => {
  const tokens = md.parse(markdownText, {});
  const elements: React.ReactNode[] = [];
  let contentTokensBuffer: any[] = [];

  const flushBuffer = () => {
    if (contentTokensBuffer.length > 0) {
      const html = md.renderer.render(contentTokensBuffer, md.options, {});
      const sanitized = DOMPurify.sanitize(html);
      elements.push(
        <div
          key={`chunk-${elements.length}`}
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />,
      );
      contentTokensBuffer = [];
    }
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "fence") {
      flushBuffer();
      elements.push(renderBlockCode(token, i));
    } else if (token.type === "table_open") {
      flushBuffer();
      const { element, endIndex } = renderTable(tokens, i, md);
      elements.push(element);
      i = endIndex; // Advance loop to end of table
    } else {
      contentTokensBuffer.push(token);
    }
  }

  flushBuffer();

  return <>{elements}</>;
};
