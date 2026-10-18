"use client";

import React, { useState, useEffect } from "react";
import { Search, RotateCcw } from "lucide-react";
import { UserFilterParams } from "../types";
import { ROLES } from "@/features/auth/roles";
import { Button } from "@/components/ui/Button";

export interface UserFiltersProps {
  filters: UserFilterParams;
  onChange: (patch: Partial<UserFilterParams>) => void;
  onReset: () => void;
}

export function UserFilters({ filters, onChange, onReset }: UserFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Đồng bộ search input khi URL query thay đổi
  const [prevSearch, setPrevSearch] = useState(filters.search);
  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search);
    setSearchInput(filters.search || "");
  }

  // Debounce 300ms cho ô tìm kiếm
  useEffect(() => {
    const handler = setTimeout(() => {
      if ((filters.search || "") !== searchInput.trim()) {
        onChange({ search: searchInput.trim(), page: 1 });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, filters.search, onChange]);

  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.role && filters.role !== "all") ||
      (filters.isActive && filters.isActive !== "all") ||
      (filters.profile && filters.profile !== "all")
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-e1">
      <div className="flex flex-col md:flex-row gap-3">
        {/* 1. Ô tìm kiếm đa trường */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo họ tên, email hoặc số điện thoại..."
            className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-ink-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 2. Lọc theo Vai trò */}
        <div className="w-full md:w-48">
          <select
            value={filters.role || "all"}
            onChange={(e) => onChange({ role: e.target.value, page: 1 })}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tất cả vai trò</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Lọc theo Trạng thái */}
        <div className="w-full md:w-44">
          <select
            value={filters.isActive || "all"}
            onChange={(e) => onChange({ isActive: e.target.value, page: 1 })}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã bị khóa</option>
          </select>
        </div>

        {/* 4. Lọc theo Loại hồ sơ */}
        <div className="w-full md:w-44">
          <select
            value={filters.profile || "all"}
            onChange={(e) => onChange({ profile: e.target.value, page: 1 })}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Mọi loại hồ sơ</option>
            <option value="customer">Hồ sơ khách hàng</option>
            <option value="staff">Hồ sơ nhân viên</option>
            <option value="none">Chưa có hồ sơ</option>
          </select>
        </div>

        {/* 5. Nút Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="md"
            onClick={onReset}
            className="text-ink-3 hover:text-ink shrink-0"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            <span>Xóa lọc</span>
          </Button>
        )}
      </div>
    </div>
  );
}
