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
        "flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-e1 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold text-ink">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-ink-3">{description}</p>
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-2 transition hover:bg-canvas active:bg-sunken"
            >
              {showTable ? (
                <>
                  <BarChart3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span>Xem biểu đồ</span>
                </>
              ) : (
                <>
                  <TableIcon className="h-3.5 w-3.5 text-ink-3" aria-hidden="true" />
                  <span>Xem dạng bảng</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 min-h-[260px] flex-1">
        {showTable && tableData ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <caption className="sr-only">Bảng số liệu cho {title}</caption>
              <thead>
                <tr className="border-b border-line bg-sunken font-bold uppercase tracking-wider text-ink-3">
                  {tableData.headers.map((h, i) => (
                    <th key={i} scope="col" className="px-3 py-2.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-surface-raised">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={cn(
                          "px-3 py-2.5",
                          typeof cell === "number" && "font-mono tabular-nums text-ink",
                          typeof cell !== "number" && "text-ink-2",
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
