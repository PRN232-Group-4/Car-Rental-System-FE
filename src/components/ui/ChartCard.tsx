"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { BarChart3, Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ChartTableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface ChartCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  tableData?: ChartTableData;
  className?: string;
}

export const CHART_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export function ChartCard({
  title,
  description,
  actions,
  children,
  tableData,
  className,
}: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <article
      className={cn(
        "flex flex-col border-t border-td-ink pt-4",
        className,
      )}
    >
      <div className="flex flex-col justify-between gap-4 border-b border-td-rule pb-3 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-sm font-bold text-td-ink">{title}</h3>
          {description && (
            <p className="mt-1 font-mono text-[11px] text-td-muted">{description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actions}

          {tableData && (
            <button
              type="button"
              onClick={() => setShowTable((prev) => !prev)}
              aria-pressed={showTable}
              aria-label={showTable ? "Chuyển sang xem biểu đồ" : "Chuyển sang xem dạng bảng"}
              className="inline-flex items-center gap-1.5 rounded border border-td-rule px-2.5 py-1 text-[11px] font-bold text-td-ink transition hover:bg-td-chalk"
            >
              {showTable ? (
                <>
                  <BarChart3 className="h-3.5 w-3.5 text-td-oxide" aria-hidden="true" />
                  <span>Xem biểu đồ</span>
                </>
              ) : (
                <>
                  <TableIcon className="h-3.5 w-3.5 text-td-muted" aria-hidden="true" />
                  <span>Xem dạng bảng</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 min-h-[260px] flex-1">
        {showTable && tableData ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <caption className="sr-only">Bảng số liệu cho {title}</caption>
              <thead>
                <tr className="border-b border-td-ink font-mono text-[11px] uppercase tracking-wider text-td-muted">
                  {tableData.headers.map((h, i) => (
                    <th key={i} scope="col" className="px-2 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-td-rule">
                {tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-td-chalk/50">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={cn(
                          "px-2 py-2",
                          typeof cell === "number" && "font-mono tabular-nums text-td-ink",
                          typeof cell !== "number" && "text-td-muted",
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </article>
  );
}

export default ChartCard;
