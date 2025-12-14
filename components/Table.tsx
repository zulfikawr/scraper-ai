import React, { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
}

export function Table<T>({ data, columns, className = "" }: TableProps<T>) {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-zinc-200 shadow-md ${className}`}
    >
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`px-4 py-3 font-semibold text-zinc-900 ${col.headerClassName || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-zinc-50/50 transition-colors"
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-4 py-3 ${col.className || "text-zinc-600"}`}
                >
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                      ? (row[col.accessorKey] as ReactNode)
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
