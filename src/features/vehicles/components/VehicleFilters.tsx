"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import type { Facility } from "@/features/facilities/types";
import { Select } from "@/components/ui/Select";
import { FindFilterState } from "../findFilterSchema";

export interface VehicleFiltersProps {
  filters: FindFilterState;
  facilities?: Facility[];
  brands?: string[];
  onChange: (patch: Partial<FindFilterState>) => void;
  onReset: () => void;
  onApplyMobile?: () => void;
  className?: string;
  isMobileDrawer?: boolean;
}

// Thong Dong rents cars only.
export const CATEGORY_OPTIONS = [
  { value: "all", label: "Tất cả ô tô" },
  { value: "electric_car", label: "Ô tô điện" },
  { value: "car", label: "Ô tô xăng" },
];

export const SEAT_OPTIONS = [
  { value: 0, label: "Tất cả" },
  { value: 2, label: "2 chỗ" },
  { value: 4, label: "4 chỗ" },
  { value: 5, label: "5 chỗ" },
  { value: 7, label: "7 chỗ" },
];

export const TRANSMISSION_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "automatic", label: "Tự động" },
  { value: "manual", label: "Số sàn" },
  { value: "cvt", label: "CVT" },
];

const FUEL_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "electric", label: "Thuần điện" },
  { value: "petrol", label: "Xăng" },
];

export const PRICE_PRESETS = [
  { label: "Dưới 50.000đ/h", min: 0, max: 50000 },
  { label: "50.000đ – 150.000đ/h", min: 50000, max: 150000 },
  { label: "150.000đ – 300.000đ/h", min: 150000, max: 300000 },
  { label: "Trên 300.000đ/h", min: 300000, max: 0 },
];

export const LONGTERM_PRICE_PRESETS = [
  { label: "Dưới 10.000.000đ/tháng", min: 0, max: 10000000 },
  { label: "10.000.000đ – 20.000.000đ/tháng", min: 10000000, max: 20000000 },
  { label: "Trên 20.000.000đ/tháng", min: 20000000, max: 0 },
];

export function VehicleFilters({
  filters,
  facilities = [],
  brands = [],
  onChange,
  onReset,
  onApplyMobile,
  className = "",
  isMobileDrawer = false,
}: VehicleFiltersProps) {
  const brandInputId = React.useId();
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tiêu đề sidebar */}
      {!isMobileDrawer && (
        <div className="flex items-center justify-between border-b border-td-rule pb-3.5">
          <div className="flex items-center gap-2 font-bold text-td-ink">
            <h2 className="text-base">Bộ lọc tìm xe</h2>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-td-muted hover:text-primary transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        </div>
      )}

      {/* 1. Phân khúc xe */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-td-ink">
          <span>Phân khúc phương tiện</span>
        </label>
        <div className="space-y-1">
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = filters.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onChange({ category: cat.value as FindFilterState["category"] })}
                className={`flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white font-bold"
                    : "text-td-ink hover:bg-td-chalk"
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Chi nhánh / Trạm đón xe */}
      <div className="space-y-2 border-t border-td-rule pt-4">
        <label className="flex items-center gap-1.5 text-xs font-bold text-td-ink">
          <span>Chi nhánh giao nhận</span>
        </label>
        <Select
          aria-label="Chi nhánh giao nhận"
          menuLabel="Trạm tiếp nhận"
          value={filters.facilityId || "all"}
          onValueChange={(v) => onChange({ facilityId: v })}
          options={[{ value: "all", label: "Tất cả chi nhánh" }, ...facilities.map((fac) => ({ value: String(fac.id), label: `${fac.name} (${fac.city})` }))]}
          className="text-xs font-medium"
        />
      </div>

      {/* 3. Thương hiệu xe */}
      <div className="space-y-2 border-t border-td-rule pt-4">
        <label htmlFor={brandInputId} className="text-xs font-bold text-td-ink">Thương hiệu</label>
        <input id={brandInputId} type="text" value={filters.brand === "all" ? "" : filters.brand || ""} onChange={event => onChange({ brand: event.target.value || "all" })} placeholder="Nhập thương hiệu cần tìm" className="w-full border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink" />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ brand: "all" })}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
              filters.brand === "all" || !filters.brand
                ? "bg-primary text-white font-bold"
                : "border border-td-rule bg-td-white text-td-ink hover:bg-td-chalk"
            }`}
          >
            Tất cả
          </button>
          {brands.map((b) => {
            const isSelected = filters.brand === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => onChange({ brand: isSelected ? "all" : b })}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white font-bold"
                    : "border border-td-rule bg-td-white text-td-ink hover:bg-td-chalk"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Số chỗ ngồi */}
      <div className="space-y-2 border-t border-td-rule pt-4">
        <label className="flex items-center gap-1.5 text-xs font-bold text-td-ink">
          <span>Số chỗ tối thiểu (ô tô)</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {SEAT_OPTIONS.map((seat) => {
            const isSelected = Number(filters.seats || 0) === seat.value;
            return (
              <button
                key={seat.value}
                type="button"
                onClick={() => onChange({ seats: seat.value })}
                className={`rounded py-1.5 text-xs font-medium transition-all text-center cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white font-bold"
                    : "border border-td-rule bg-td-white text-td-ink hover:bg-td-chalk"
                }`}
              >
                {seat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Loại hộp số & Nhiên liệu */}
      <div className="grid grid-cols-2 gap-3 border-t border-td-rule pt-4">
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-td-ink">
            <span>Hộp số</span>
          </label>
          <Select
            aria-label="Loại hộp số"
            menuLabel="Hộp số"
            value={filters.transmission || "all"}
            onValueChange={(v) => onChange({ transmission: v as FindFilterState["transmission"] })}
            options={TRANSMISSION_OPTIONS}
            className="text-xs font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-td-ink">
            <span>Nhiên liệu</span>
          </label>
          <Select
            aria-label="Loại nhiên liệu"
            menuLabel="Nhiên liệu"
            value={filters.fuelType || "all"}
            onValueChange={(v) => onChange({ fuelType: v as FindFilterState["fuelType"] })}
            options={FUEL_OPTIONS}
            className="text-xs font-medium"
          />
        </div>
      </div>

      {/* 6. Mức giá thuê theo giờ */}
      <div className="space-y-2 border-t border-td-rule pt-4">
        <label className="flex items-center gap-1.5 text-xs font-bold text-td-ink">
          <span>Khoảng giá thuê / {filters.mode === "longterm" ? "tháng" : "giờ"}</span>
        </label>
        <div className="space-y-1">
          {(filters.mode === "longterm" ? LONGTERM_PRICE_PRESETS : PRICE_PRESETS).map((p, idx) => {
            const isMatch =
              Number(filters.priceMin || 0) === p.min &&
              Number(filters.priceMax || 0) === p.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isMatch) {
                    onChange({ priceMin: 0, priceMax: 0 });
                  } else {
                    onChange({ priceMin: p.min, priceMax: p.max });
                  }
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors text-left cursor-pointer ${
                  isMatch
                    ? "bg-primary-tint font-bold text-primary border border-primary/20"
                    : "text-td-ink hover:bg-td-chalk"
                }`}
              >
                <span>{p.label}</span>
                {isMatch && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nút Áp dụng trên Mobile Bottom Sheet */}
      {isMobileDrawer && (
        <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-td-rule bg-td-white p-4 flex gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 border border-td-rule py-2.5 text-xs font-bold text-td-ink hover:bg-td-chalk transition-colors cursor-pointer"
          >
            Đặt lại
          </button>
          <button
            type="button"
            onClick={onApplyMobile}
            className="flex-2 bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Xem kết quả
          </button>
        </div>
      )}
    </div>
  );
}
