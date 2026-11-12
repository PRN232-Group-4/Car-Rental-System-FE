"use client";

import { useId } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { InlineSelect } from "@/components/forms/inline-validation";

export interface PaginationProps {
  page: number; // 1-indexed
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  loading?: boolean;
  itemName?: string;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  loading = false,
  itemName = "mục",
  className,
}: PaginationProps) {
  const pageSizeSelectId = useId();
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), pageCount);

  const firstResult = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastResult = Math.min(currentPage * pageSize, totalCount);

  const getPageItems = (): (number | "ellipsis")[] => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", pageCount];
    }

    if (currentPage >= pageCount - 3) {
      return [
        1,
        "ellipsis",
        pageCount - 4,
        pageCount - 3,
        pageCount - 2,
        pageCount - 1,
        pageCount,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      pageCount,
    ];
  };

  const pageItems = getPageItems();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-td-rule py-3 text-xs sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-td-muted">
        <span>
          Hiển thị{" "}
          <strong className="font-semibold text-td-ink tabular-nums">
            {firstResult}
          </strong>
          –
          <strong className="font-semibold text-td-ink tabular-nums">
            {lastResult}
          </strong>{" "}
          trong{" "}
          <strong className="font-semibold text-td-ink tabular-nums">
            {totalCount}
          </strong>{" "}
          {itemName}
        </span>

        {onPageSizeChange && pageSizeOptions.length > 0 && (
          <label htmlFor={pageSizeSelectId} className="flex items-center gap-2">
            <span>Hiển thị:</span>
            <InlineSelect
              id={pageSizeSelectId}
              value={pageSize}
              disabled={loading}
              onChange={(e) => {
                onPageSizeChange(Number(e.currentTarget.value));
              }}
              className="border border-td-rule bg-transparent px-2 py-1 text-[11px] text-td-ink outline-none transition focus:border-primary disabled:opacity-50"
              aria-label={`Số ${itemName} mỗi trang`}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </InlineSelect>
          </label>
        )}
      </div>

      <nav
        aria-label={`Phân trang ${itemName}`}
        className="flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || loading}
          aria-label="Trang trước"
          className="border border-td-rule p-1.5 text-td-ink transition hover:bg-td-chalk disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {pageItems.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center text-td-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }

          const isCurrent = currentPage === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              disabled={loading}
              aria-label={`Trang ${item}`}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "h-8 min-w-8 px-2 text-[11px] font-bold tabular-nums transition",
                isCurrent
                  ? "bg-primary text-white"
                  : "border border-td-rule text-td-ink hover:bg-td-chalk",
                loading && "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
          disabled={currentPage >= pageCount || loading}
          aria-label="Trang tiếp theo"
          className="border border-td-rule p-1.5 text-td-ink transition hover:bg-td-chalk disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;
