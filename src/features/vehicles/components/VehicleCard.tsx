"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Settings2, Zap, Fuel, Gauge, CheckCircle2, MapPin, ArrowRight } from "lucide-react";
import { Vehicle } from "../types";
import { formatVnd } from "@/lib/format";

export interface VehicleCardProps {
  vehicle: Vehicle;
  priority?: boolean;
  className?: string;
}

export function VehicleCard({ vehicle, priority = false, className = "" }: VehicleCardProps) {
  const isElectric = vehicle.category.includes("electric");

  return (
    <article
      data-vehicle-id={vehicle.id}
      data-testid="vehicle-card"
      className={`group relative flex flex-col justify-between overflow-hidden rounded border border-td-rule bg-td-white glass-lift transition-all duration-300 ${className}`}
    >
      {/* 1. Khung ảnh tỷ lệ 4:3 (>=60% diện tích trực quan), zoom 1.04 khi hover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-td-chalk">
        <Image
          src={vehicle.imageUrl}
          alt={vehicle.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {/* Huy hiệu phân khúc & tình trạng ở góc trên */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            {isElectric && (
              <span className="rounded-md bg-stage-ink px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white shadow-xs">
                THUẦN ĐIỆN
              </span>
            )}
            {vehicle.categoryLabel && (
              <span className="rounded-md bg-td-white/90 px-2 py-0.5 text-[11px] font-semibold text-td-ink shadow-xs border border-td-rule">
                {vehicle.categoryLabel}
              </span>
            )}
          </div>

          <div>
            {vehicle.isAvailable ? (
              <span className="flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-[11px] font-bold text-success border border-success/20 shadow-xs">
                <CheckCircle2 className="w-3 h-3" />
                <span>Sẵn sàng</span>
              </span>
            ) : (
              <span className="rounded-full bg-td-chalk px-2.5 py-0.5 text-[11px] font-bold text-td-ink border border-td-rule shadow-xs">
                Đang thuê
              </span>
            )}
          </div>
        </div>

        {/* Trạm cơ sở ở góc dưới ảnh */}
        {vehicle.facilityName && (
          <div className="absolute bottom-2.5 left-3 pointer-events-none">
            <span className="flex items-center gap-1 rounded-md bg-stage-ink/85 px-2 py-0.5 text-[11px] font-medium text-white shadow-xs">
              <MapPin className="w-3 h-3 text-primary-tint" />
              <span className="truncate max-w-[180px]">{vehicle.facilityName}</span>
            </span>
          </div>
        )}
      </div>

      {/* 2. Thân thẻ thông tin */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Tên xe & Đời xe (TUYỆT ĐỐI KHÔNG HIỂN THỊ BIỂN SỐ XE) */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-td-ink line-clamp-1 group-hover:text-primary transition-colors">
                {vehicle.name}
              </h3>
              <p className="text-xs text-td-muted mt-0.5">
                Đời {vehicle.year} {vehicle.brand ? `• ${vehicle.brand}` : ""}
              </p>
            </div>
          </div>

          {/* Lưới 4 chip thông số kỹ thuật chuẩn A6 */}
          <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs text-td-ink bg-td-paper rounded p-2.5 border border-td-rule">
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{vehicle.seats ? `${vehicle.seats} chỗ` : "Tiêu chuẩn"}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Settings2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{vehicle.transmission || "Tự động"}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              {isElectric ? (
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
              ) : (
                <Fuel className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
              <span className="truncate">
                {isElectric
                  ? (vehicle.batteryCapacity || "Pin Lithium")
                  : (vehicle.fuelType || "Xăng")}
              </span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Gauge className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">
                {vehicle.maxRange || vehicle.storageCapacity || (vehicle.trunkCapacity ? `${vehicle.trunkCapacity}L` : "Cốp rộng")}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Giá & CTA điều hướng */}
        <div className="mt-4 flex items-center justify-between border-t border-td-rule pt-3.5">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-lg font-black tabular-nums text-primary">
                {formatVnd(vehicle.hourlyPrice)}
              </span>
              <span className="text-xs font-semibold text-td-muted">/giờ</span>
            </div>
            {vehicle.monthlyPrice > 0 && (
              <p className="text-[11px] font-mono tabular-nums text-td-muted">
                {formatVnd(vehicle.monthlyPrice)}/tháng
              </p>
            )}
          </div>

          <Link
            href={`/vehicles/detail?id=${vehicle.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-primary-hover group-hover:shadow-e1 cursor-pointer"
          >
            <span>Chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
