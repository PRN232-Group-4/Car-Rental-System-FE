"use client";

import { Star } from "lucide-react";
import type { RatingSummary } from "../types";

interface RatingDistributionProps {
  summary: RatingSummary;
  selectedStar?: number;
  onSelectStar?: (star: number | undefined) => void;
}

export function RatingDistribution({
  summary,
  selectedStar,
  onSelectStar,
}: RatingDistributionProps) {
  const total = summary.count || 0;
  const stars: ("5" | "4" | "3" | "2" | "1")[] = ["5", "4", "3", "2", "1"];

  return (
    <div className="flex flex-col gap-3 border-t border-td-ink pt-4">
      <div className="flex items-center justify-between border-b border-td-rule pb-3">
        <h3 className="text-xs font-bold text-td-muted">
          Phân bố đánh giá
        </h3>
        {selectedStar && (
          <button
            type="button"
            onClick={() => onSelectStar?.(undefined)}
            className="text-xs font-semibold text-td-oxide hover:underline"
          >
            Xóa lọc {selectedStar} sao
          </button>
        )}
      </div>

      {/* Screen-reader accessible table */}
      <div className="sr-only">
        <table>
          <caption>Bảng phân bố số lượng đánh giá theo mức sao</caption>
          <thead>
            <tr>
              <th scope="col">Mức sao</th>
              <th scope="col">Số lượng</th>
              <th scope="col">Tỉ lệ</th>
            </tr>
          </thead>
          <tbody>
            {stars.map((s) => {
              const count = summary.distribution[s] || 0;
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
              return (
                <tr key={s}>
                  <td>{s} sao</td>
                  <td>{count}</td>
                  <td>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Interactive Visual bars */}
      <div className="flex flex-col gap-2 pt-1" role="group" aria-label="Lọc đánh giá theo số sao">
        {stars.map((s) => {
          const numStar = Number(s);
          const count = summary.distribution[s] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const isSelected = selectedStar === numStar;

          return (
            <button
              key={s}
              type="button"
              onClick={() => onSelectStar?.(isSelected ? undefined : numStar)}
              aria-pressed={isSelected}
              className={`group flex items-center gap-3 rounded p-1.5 transition ${
                isSelected
                  ? "bg-td-chalk ring-1 ring-td-oxide"
                  : "hover:bg-td-chalk"
              }`}
            >
              {/* Star label */}
              <div className="flex w-12 items-center gap-1 font-mono text-xs font-bold text-td-ink">
                <span>{s}</span>
                <Star className="h-3.5 w-3.5 fill-td-oxide text-td-oxide" />
              </div>

              {/* Progress Bar */}
              <div className="relative h-2.5 flex-1 overflow-hidden bg-td-chalk">
                <div
                  className="h-full bg-td-oxide transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Count and percent */}
              <div className="flex w-16 items-center justify-end gap-1 font-mono text-xs tabular-nums text-td-muted">
                <span className="font-semibold text-td-ink">{count}</span>
                <span className="text-[11px]">({pct.toFixed(0)}%)</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
