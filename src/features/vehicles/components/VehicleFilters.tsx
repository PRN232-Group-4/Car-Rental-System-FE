"use client";

import React from "react";
import { SlidersHorizontal, RotateCcw, Car, Fuel, Building2, Users, Settings2, DollarSign } from "lucide-react";
import type { Facility } from "@/features/facilities/types";
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

const CATEGORY_OPTIONS = [
  { value: "all", label: "Tất cả phân khúc" },
  { value: "electric_car", label: "Ô tô điện" },
  { value: "car", label: "Ô tô xăng" },
  { value: "electric_motorbike", label: "Xe máy điện" },
  { value: "motorbike", label: "Xe máy xăng" },
];

const SEAT_OPTIONS = [
  { value: 0, label: "Tất cả" },
  { value: 2, label: "2 chỗ" },
  { value: 4, label: "4 chỗ" },
  { value: 5, label: "5 chỗ" },
  { value: 7, label: "7 chỗ" },
];

const TRANSMISSION_OPTIONS = [
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

const PRICE_PRESETS = [
  { label: "Dưới 50.000đ/h", min: 0, max: 50000 },
  { label: "50.000đ – 150.000đ/h", min: 50000, max: 150000 },
  { label: "150.000đ – 300.000đ/h", min: 150000, max: 300000 },
  { label: "Trên 300.000đ/h", min: 300000, max: 0 },
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
            <SlidersHorizontal className="w-4 h-4 text-primary" />
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
          <Car className="w-3.5 h-3.5 text-primary" />
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
                className={`flex w-full items-center justify-between rounded px-3 py-2 text-xs font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white font-bold shadow-xs"
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
          <Building2 className="w-3.5 h-3.5 text-primary" />
          <span>Chi nhánh giao nhận</span>
        </label>
        <select
          value={filters.facilityId || "all"}
          onChange={(e) => onChange({ facilityId: e.target.value })}
          aria-label="Chi nhánh giao nhận"
          className="w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs font-medium text-td-ink transition-colors focus:border-primary focus:outline-none"
        >
          <option value="all">Tất cả chi nhánh</option>
          {facilities.map((fac) => (
            <option key={fac.id} value={fac.id}>
              {fac.name} ({fac.city})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Thương hiệu xe */}
      <div className="space-y-2 border-t border-td-rule pt-4">
        <label htmlFor={brandInputId} className="text-xs font-bold text-td-ink">Thương hiệu</label>
        <input id={brandInputId} type="text" value={filters.brand === "all" ? "" : filters.brand || ""} onChange={event => onChange({ brand: event.target.value || "all" })} placeholder="Nhập thương hiệu cần tìm" className="w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink" />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ brand: "all" })}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
              filters.brand === "all" || !filters.brand
                ? "bg-primary text-white font-bold shadow-xs"
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
                    ? "bg-primary text-white font-bold shadow-xs"
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
          <Users className="w-3.5 h-3.5 text-primary" />
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
                    ? "bg-primary text-white font-bold shadow-xs"
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
            <Settings2 className="w-3.5 h-3.5 text-primary" />
            <span>Hộp số</span>
          </label>
          <select
            value={filters.transmission || "all"}
            onChange={(e) => onChange({ transmission: e.target.value as FindFilterState["transmission"] })}
            aria-label="Loại hộp số"
            className="w-full rounded border border-td-rule bg-td-white px-2.5 py-2 text-xs font-medium text-td-ink transition-colors focus:border-primary focus:outline-none"
          >
            {TRANSMISSION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-td-ink">
            <Fuel className="w-3.5 h-3.5 text-primary" />
            <span>Nhiên liệu</span>
          </label>
          <select
            value={filters.fuelType || "all"}
            onChange={(e) => onChange({ fuelType: e.target.value as FindFilterState["fuelType"] })}
            aria-label="Loại nhiên liệu"
            className="w-full rounded border border-td-rule bg-td-white px-2.5 py-2 text-xs font-medium text-td-ink transition-colors focus:border-primary focus:outline-none"
          >
            {FUEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6. Mức giá thuê theo giờ */}
      <div className="space-y-2 border-t border-td-rule pt-4">
        <label className="flex items-center gap-1.5 text-xs font-bold text-td-ink">
          <DollarSign className="w-3.5 h-3.5 text-primary" />
          <span>Khoảng giá thuê / {filters.mode === "longterm" ? "tháng" : "giờ"}</span>
        </label>
        <div className="space-y-1">
          {(filters.mode === "longterm" ? [
            { label: "Dưới 10.000.000đ/tháng", min: 0, max: 10000000 },
            { label: "10.000.000đ – 20.000.000đ/tháng", min: 10000000, max: 20000000 },
            { label: "Trên 20.000.000đ/tháng", min: 20000000, max: 0 },
          ] : PRICE_PRESETS).map((p, idx) => {
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
                className={`flex w-full items-center justify-between rounded px-3 py-1.5 text-xs transition-colors text-left cursor-pointer ${
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
            className="flex-1 rounded border border-td-rule py-2.5 text-xs font-bold text-td-ink hover:bg-td-chalk transition-colors cursor-pointer"
          >
            Đặt lại
          </button>
          <button
            type="button"
            onClick={onApplyMobile}
            className="flex-2 rounded bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Xem kết quả
          </button>
        </div>
      )}
    </div>
  );
}
