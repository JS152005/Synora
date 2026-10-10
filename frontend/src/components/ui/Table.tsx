import type { ReactNode } from "react";

export interface Column<T> {
  header: ReactNode;
  accessor?: keyof T;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
  emptyText?: string;
}

function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  className = "",
  emptyText = "No data available",
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-200/80 bg-white ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className={`px-4 py-3 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-400 italic"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`
                  transition-colors
                  ${onRowClick ? "hover:bg-indigo-50/40 cursor-pointer" : "hover:bg-slate-50/50"}
                `.trim()}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-4 py-3 ${col.className || ""}`}>
                    {col.render
                      ? col.render(row)
                      : col.accessor
                      ? String(row[col.accessor] ?? "")
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
