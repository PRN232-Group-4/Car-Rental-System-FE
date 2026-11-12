"use client";

import { Search, AlertTriangle, Car, Wrench } from "lucide-react";
import { REPORT_TYPE_MAP } from "../report-status";
import type { ReportFilterParams } from "../types";
import { InlineSelect } from "@/components/forms/inline-validation";

interface ReportFilterBarProps {
  filters: ReportFilterParams;
  onChange: (filters: ReportFilterParams) => void;
}

export function ReportFilterBar({ filters, onChange }: ReportFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded border border-td-rule bg-td-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tìm kiếm */}
        <div className="relative">
          <label htmlFor="report-search" className="sr-only">
            Tìm kiếm báo cáo
          </label>
          <div className="flex items-center gap-2 rounded border border-td-rule bg-td-white px-3 py-2">
            <Search className="h-4 w-4 text-td-muted" aria-hidden="true" />
            <input
              id="report-search"
              type="text"
              placeholder="Tìm theo mã, tên khách, nội dung..."
              value={filters.search ?? ""}
              onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
              className="w-full bg-transparent text-xs text-td-ink placeholder:text-td-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Lọc loại sự cố */}
        <div>
          <label htmlFor="report-type" className="sr-only">
            Loại phản ánh
          </label>
          <InlineSelect
            id="report-type"
            value={filters.type ?? ""}
            onChange={(e) => onChange({ ...filters, type: e.target.value || undefined })}
            className="w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink focus:outline-none"
          >
            <option value="">Tất cả phân loại</option>
            {Object.entries(REPORT_TYPE_MAP).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </InlineSelect>
        </div>

        {/* Nút lọc nhanh: Gắn đơn thuê / Gắn bảo dưỡng */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                hasRental: filters.hasRental ? undefined : true,
              })
            }
            className={`flex flex-1 items-center justify-center gap-1.5 rounded border px-3 py-2 text-xs font-semibold transition ${
              filters.hasRental
                ? "border-td-oxide bg-td-chalk text-td-oxide"
                : "border-td-rule bg-td-white text-td-ink hover:bg-td-paper"
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            <span>Có đơn thuê</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                hasMaintenance: filters.hasMaintenance ? undefined : true,
              })
            }
            className={`flex flex-1 items-center justify-center gap-1.5 rounded border px-3 py-2 text-xs font-semibold transition ${
              filters.hasMaintenance
                ? "border-td-oxide bg-td-chalk text-td-oxide"
                : "border-td-rule bg-td-white text-td-ink hover:bg-td-paper"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Có bảo dưỡng</span>
          </button>
        </div>

        {/* Checkbox quá hạn SLA 24h */}
        <div className="flex items-center">
          <label className="flex cursor-pointer select-none items-center gap-2 text-xs font-semibold text-danger">
            <input
              type="checkbox"
              checked={Boolean(filters.isOverdueSla)}
              onChange={(e) =>
                onChange({
                  ...filters,
                  isOverdueSla: e.target.checked ? true : undefined,
                })
              }
              className="h-4 w-4 rounded border-td-rule text-danger accent-danger focus:ring-danger"
            />
            <AlertTriangle className="h-4 w-4 text-danger" />
            <span>Chỉ xem quá hạn SLA (24h)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
