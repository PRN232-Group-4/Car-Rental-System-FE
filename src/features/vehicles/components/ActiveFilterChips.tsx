"use client";

import React from "react";
import { X, RotateCcw } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { FacilityCatalogItem } from "@/api/mock/mock-catalog";

export interface ActiveFiltersState {
  search?: string;
  category?: string;
  facilityId?: string | number;
  brand?: string;
  seats?: number;
  transmission?: string;
  fuelType?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
  startDate?: string;
  endDate?: string;
  mode?: string;
}

export interface ActiveFilterChipsProps {
  filters: ActiveFiltersState;
  facilities?: FacilityCatalogItem[];
  onRemove: (key: keyof ActiveFiltersState) => void;
  onClearAll: () => void;
  className?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  car: "Ô tô xăng",
  electric_car: "Ô tô điện",
  motorbike: "Xe máy",
  electric_motorbike: "Xe máy điện",
};

const TRANSMISSION_NAMES: Record<string, string> = {
  automatic: "Tự động",
  manual: "Số sàn",
  cvt: "CVT",
};

const FUEL_NAMES: Record<string, string> = {
  electric: "Điện",
  petrol: "Xăng",
  diesel: "Dầu",
};

export function ActiveFilterChips({
  filters,
  facilities = [],
  onRemove,
  onClearAll,
  className = "",
}: ActiveFilterChipsProps) {
  const chips: Array<{ key: keyof ActiveFiltersState; label: string }> = [];

  if (filters.search && filters.search.trim()) {
    chips.push({ key: "search", label: `Từ khóa: "${filters.search.trim()}"` });
  }

  if (filters.category && filters.category !== "all") {
    chips.push({
      key: "category",
      label: `Phân khúc: ${CATEGORY_NAMES[filters.category] || filters.category}`,
    });
  }

  if (filters.facilityId && filters.facilityId !== "all") {
    const fac = facilities.find((f) => String(f.id) === String(filters.facilityId));
    chips.push({
      key: "facilityId",
      label: `Trạm: ${fac?.shortName || filters.facilityId}`,
    });
  }

  if (filters.brand && filters.brand !== "all") {
    chips.push({ key: "brand", label: `Hãng: ${filters.brand}` });
  }

  if (filters.seats && Number(filters.seats) > 0) {
    chips.push({ key: "seats", label: `${filters.seats} chỗ ngồi` });
  }

  if (filters.transmission && filters.transmission !== "all") {
    chips.push({
      key: "transmission",
      label: `Hộp số: ${TRANSMISSION_NAMES[filters.transmission] || filters.transmission}`,
    });
  }

  if (filters.fuelType && filters.fuelType !== "all") {
    chips.push({
      key: "fuelType",
      label: `Nhiên liệu: ${FUEL_NAMES[filters.fuelType] || filters.fuelType}`,
    });
  }

  if (filters.priceMin && Number(filters.priceMin) > 0) {
    chips.push({
      key: "priceMin",
      label: `Từ: ${formatVnd(Number(filters.priceMin))}`,
    });
  }

  if (filters.priceMax && Number(filters.priceMax) > 0) {
    chips.push({
      key: "priceMax",
      label: `Đến: ${formatVnd(Number(filters.priceMax))}`,
    });
  }

  if (filters.mode && filters.mode !== "hourly") {
    chips.push({
      key: "mode",
      label: "Thuê dài hạn",
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-2 ${className}`}>
      <span className="text-xs font-semibold text-td-muted">Đang lọc theo:</span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-td-rule bg-td-white px-3 py-1 text-xs font-medium text-td-ink shadow-xs"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            aria-label={`Xóa bộ lọc ${chip.label}`}
            className="rounded-full p-0.5 text-td-muted hover:bg-td-chalk hover:text-td-ink transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary-tint/60 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Xóa tất cả</span>
      </button>
    </div>
  );
}
