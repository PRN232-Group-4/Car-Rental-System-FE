import React from "react";
import { Search, X } from "lucide-react";
import type { StaffFilterParams, StaffDepartment, StaffFacility } from "../types";

export interface StaffFiltersProps {
  filters: StaffFilterParams;
  departments: StaffDepartment[];
  facilities: StaffFacility[];
  onChange: (patch: Partial<StaffFilterParams>) => void;
  onReset: () => void;
}

export function StaffFilters({
  filters,
  departments,
  facilities,
  onChange,
  onReset,
}: StaffFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.departmentId && filters.departmentId !== "all") ||
      (filters.facilityId && filters.facilityId !== "all") ||
      (filters.isDriver && filters.isDriver !== "all") ||
      (filters.isActive && filters.isActive !== "all") ||
      (filters.licenseStatus && filters.licenseStatus !== "all")
  );

  return (
    <div className="border-t border-td-ink pt-3 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Tìm kiếm */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-td-muted" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            placeholder="Tìm theo tên, email hoặc số GPLX..."
            className="h-9 w-full rounded border border-td-rule bg-transparent pl-9 pr-3 text-xs text-td-ink placeholder:text-td-muted focus:border-td-ink focus:outline-none"
          />
        </div>

        {/* Lọc phòng ban */}
        <div className="w-full md:w-52">
          <select
            value={filters.departmentId || "all"}
            onChange={(e) => onChange({ departmentId: e.target.value, page: 1 })}
            className="h-8 w-full rounded border border-td-rule bg-transparent px-2 text-xs font-medium text-td-ink focus:border-td-ink focus:outline-none"
          >
            <option value="all">Tất cả phòng ban</option>
            {departments.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lọc chi nhánh / cơ sở */}
        <div className="w-full md:w-56">
          <select
            value={filters.facilityId || "all"}
            onChange={(e) => onChange({ facilityId: e.target.value, page: 1 })}
            className="h-8 w-full rounded border border-td-rule bg-transparent px-2 text-xs font-medium text-td-ink focus:border-td-ink focus:outline-none"
          >
            <option value="all">Tất cả trạm / cơ sở</option>
            {facilities.map((f) => (
              <option key={f.id} value={String(f.id)}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-td-rule/60">
        {/* Lọc vai trò tài xế */}
        <div className="w-full sm:w-44">
          <select
            value={filters.isDriver || "all"}
            onChange={(e) => onChange({ isDriver: e.target.value, page: 1 })}
            className="h-9 w-full rounded border border-td-rule bg-td-white px-2.5 text-xs font-medium text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
          >
            <option value="all">Mọi nhân sự</option>
            <option value="driver">Chỉ tài xế</option>
            <option value="staff">Nhân viên văn phòng</option>
          </select>
        </div>

        {/* Lọc trạng thái hoạt động */}
        <div className="w-full sm:w-44">
          <select
            value={filters.isActive || "all"}
            onChange={(e) => onChange({ isActive: e.target.value, page: 1 })}
            className="h-9 w-full rounded border border-td-rule bg-td-white px-2.5 text-xs font-medium text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="active">Đang làm việc</option>
            <option value="locked">Tạm ngừng hoạt động</option>
          </select>
        </div>

        {/* Lọc trạng thái giấy phép lái xe */}
        <div className="w-full sm:w-56">
          <select
            value={filters.licenseStatus || "all"}
            onChange={(e) => onChange({ licenseStatus: e.target.value, page: 1 })}
            className="h-9 w-full rounded border border-td-rule bg-td-white px-2.5 text-xs font-medium text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
          >
            <option value="all">Mọi tình trạng GPLX</option>
            <option value="valid">Còn hạn (&gt; 30 ngày)</option>
            <option value="expiring">Sắp hết hạn (≤ 30 ngày)</option>
            <option value="expired">Đã hết hạn</option>
            <option value="missing">Chưa có GPLX</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded border border-td-rule bg-td-chalk px-3 py-1.5 text-xs font-medium text-td-ink hover:bg-td-chalk hover:text-td-ink transition-colors cursor-pointer ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
}
