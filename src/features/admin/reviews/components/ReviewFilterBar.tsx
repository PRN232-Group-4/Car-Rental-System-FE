"use client";

import { Search, MessageSquare } from "lucide-react";
import type { ReviewFilterParams, ReviewStatus } from "../types";
import { InlineSelect } from "@/components/forms/inline-validation";

interface ReviewFilterBarProps {
  filters: ReviewFilterParams;
  onChange: (filters: ReviewFilterParams) => void;
}

export function ReviewFilterBar({ filters, onChange }: ReviewFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-td-ink pt-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tìm kiếm */}
        <div className="relative">
          <label htmlFor="review-search" className="sr-only">
            Tìm kiếm đánh giá
          </label>
          <div className="flex items-center gap-2 rounded border border-td-rule bg-transparent px-2 py-1.5">
            <Search className="h-4 w-4 text-td-muted" aria-hidden="true" />
            <input
              id="review-search"
              type="text"
              placeholder="Tìm theo nhân viên hoặc nhận xét..."
              value={filters.search ?? ""}
              onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
              className="w-full bg-transparent text-xs text-td-ink placeholder:text-td-muted focus:border-td-ink focus:outline-none"
            />
          </div>
        </div>

        {/* Lọc theo số sao */}
        <div>
          <label htmlFor="review-star" className="sr-only">
            Mức sao
          </label>
          <InlineSelect
            id="review-star"
            value={filters.rating ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                rating: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded border border-td-rule bg-transparent px-2 py-1.5 text-xs text-td-ink focus:border-td-ink focus:outline-none"
          >
            <option value="">Tất cả mức sao (1 - 5 sao)</option>
            <option value="5">5 sao - Rất hài lòng</option>
            <option value="4">4 sao - Hài lòng</option>
            <option value="3">3 sao - Bình thường</option>
            <option value="2">2 sao - Chưa hài lòng</option>
            <option value="1">1 sao - Kém / Bất bình</option>
          </InlineSelect>
        </div>

        {/* Lọc theo trạng thái kiểm duyệt */}
        <div>
          <label htmlFor="review-status" className="sr-only">
            Trạng thái kiểm duyệt
          </label>
          <InlineSelect
            id="review-status"
            disabled title="API chưa cung cấp trạng thái kiểm duyệt"
            value={filters.status ?? "all"}
            onChange={(e) =>
              onChange({
                ...filters,
                status: (e.target.value as ReviewStatus | "all") || "all",
              })
            }
            className="w-full rounded border border-td-rule bg-transparent px-2 py-1.5 text-xs text-td-ink focus:border-td-ink focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="visible">Hiển thị công khai</option>
            <option value="reported">Bị báo cáo (Cần duyệt)</option>
            <option value="hidden">Đã ẩn kiểm duyệt</option>
          </InlineSelect>
        </div>

        {/* Lọc có/chưa phản hồi */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled title="API chưa hỗ trợ phản hồi đánh giá"
            onClick={() =>
              onChange({
                ...filters,
                hasReply: filters.hasReply === undefined ? true : filters.hasReply ? false : undefined,
              })
            }
            className={`flex flex-1 items-center justify-center gap-1.5 rounded border px-3 py-2 text-xs font-semibold transition ${
              filters.hasReply === true
                ? "border-td-oxide bg-td-chalk text-td-oxide"
                : filters.hasReply === false
                  ? "border-warning bg-warning-bg text-warning"
                  : "border-td-rule bg-td-white text-td-ink hover:bg-td-chalk"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>
              {filters.hasReply === true
                ? "Đã có phản hồi"
                : filters.hasReply === false
                  ? "Chưa có phản hồi"
                  : "Tất cả phản hồi"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
