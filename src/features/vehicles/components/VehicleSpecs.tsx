"use client";

import React from "react";
import {
  Users,
  Settings2,
  Zap,
  Fuel,
  Gauge,
  Luggage,
  Calendar,
  Timer,
  CheckCircle2,
  Shield,
  Palette,
  Bike,
} from "lucide-react";
import { VehicleCategory } from "../types";

export interface VehicleSpecsProps {
  category: VehicleCategory;
  year: number;
  seats?: number;
  transmission?: string;
  fuelType?: string;
  batteryCapacity?: string;
  chargingType?: string;
  chargingTimeHours?: string;
  maxRange?: string;
  storageCapacity?: string;
  trunkCapacity?: number;
  bikeType?: string;
  color?: string;
  features?: string[];
  className?: string;
}

export function VehicleSpecs({
  category,
  year,
  seats,
  transmission,
  fuelType,
  batteryCapacity,
  chargingType,
  chargingTimeHours,
  maxRange,
  storageCapacity,
  trunkCapacity,
  bikeType,
  color,
  features = [],
  className = "",
}: VehicleSpecsProps) {
  const isElectric = category.includes("electric");
  const isMotorbike = category.includes("motorbike");

  // Xây dựng danh sách thông số hợp lệ (loại bỏ giá trị rỗng/undefined)
  const specItems: Array<{ icon: React.ReactNode; label: string; value: string }> = [];

  // Năm sản xuất
  if (year) {
    specItems.push({
      icon: <Calendar className="w-4 h-4 text-primary" />,
      label: "Năm sản xuất",
      value: `Đời ${year}`,
    });
  }

  // Chỗ ngồi (ô tô)
  if (!isMotorbike && seats && seats > 0) {
    specItems.push({
      icon: <Users className="w-4 h-4 text-primary" />,
      label: "Số chỗ ngồi",
      value: `${seats} chỗ`,
    });
  }

  // Loại xe máy
  if (isMotorbike && bikeType) {
    specItems.push({
      icon: <Bike className="w-4 h-4 text-primary" />,
      label: "Dòng xe máy",
      value: bikeType,
    });
  }

  // Hộp số
  if (transmission) {
    specItems.push({
      icon: <Settings2 className="w-4 h-4 text-primary" />,
      label: "Hộp số",
      value: transmission,
    });
  }

  // Pin & Nhiên liệu
  if (isElectric && batteryCapacity) {
    specItems.push({
      icon: <Zap className="w-4 h-4 text-primary" />,
      label: "Dung lượng pin",
      value: batteryCapacity,
    });
  } else if (!isElectric && fuelType) {
    specItems.push({
      icon: <Fuel className="w-4 h-4 text-primary" />,
      label: "Nhiên liệu tiêu thụ",
      value: fuelType,
    });
  }

  // Cổng sạc (xe điện)
  if (isElectric && chargingType) {
    specItems.push({
      icon: <Zap className="w-4 h-4 text-primary" />,
      label: "Chuẩn cổng sạc",
      value: chargingType,
    });
  }

  // Thời gian sạc (xe điện)
  if (isElectric && chargingTimeHours) {
    specItems.push({
      icon: <Timer className="w-4 h-4 text-primary" />,
      label: "Thời gian sạc",
      value: chargingTimeHours,
    });
  }

  // Tầm xa (xe điện)
  if (maxRange) {
    specItems.push({
      icon: <Gauge className="w-4 h-4 text-primary" />,
      label: "Tầm hoạt động tối đa",
      value: maxRange,
    });
  }

  // Dung tích cốp / Khoang chứa hành lý
  if (trunkCapacity && trunkCapacity > 0) {
    specItems.push({
      icon: <Luggage className="w-4 h-4 text-primary" />,
      label: "Dung tích cốp xe",
      value: `${trunkCapacity} lít`,
    });
  } else if (storageCapacity) {
    specItems.push({
      icon: <Luggage className="w-4 h-4 text-primary" />,
      label: "Khoang chứa đồ",
      value: storageCapacity,
    });
  }

  // Màu sắc ngoại thất
  if (color) {
    specItems.push({
      icon: <Palette className="w-4 h-4 text-primary" />,
      label: "Màu ngoại thất",
      value: color,
    });
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Bento Grid thông số kỹ thuật */}
      <div>
        <h3 className="text-base font-bold text-ink mb-3">Thông số kỹ thuật</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {specItems.map((spec, idx) => (
            <div
              key={`spec-${idx}`}
              className="flex flex-col justify-between rounded-xl border border-line bg-sunken p-3 transition-colors hover:border-line-strong"
            >
              <div className="flex items-center gap-2 text-ink-3">
                {spec.icon}
                <span className="text-[11px] font-medium truncate">{spec.label}</span>
              </div>
              <p className="mt-2 text-sm font-bold text-ink truncate font-mono tabular-nums">
                {spec.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Danh sách trang bị & tiện nghi nổi bật (Features) */}
      {features.length > 0 && (
        <div className="border-t border-line pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-ink">Trang bị & Tiện nghi đi kèm</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {features.map((feat, idx) => (
              <div
                key={`feat-${idx}`}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5 text-xs font-medium text-ink shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
