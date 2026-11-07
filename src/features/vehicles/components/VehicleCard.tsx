"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Settings2, Zap, Fuel, Gauge, CheckCircle2, MapPin, ArrowRight } from "lucide-react";
import { Vehicle } from "../types";
import { formatVnd } from "@/lib/format";
import { vehicleDetailHref, type VehicleBookingContext } from "../booking-context";
import { VehicleLicenseRequirement } from "./VehicleLicenseRequirement";

export interface VehicleCardProps {
  vehicle: Vehicle;
  priority?: boolean;
  className?: string;
  bookingContext?: VehicleBookingContext;
}

export function VehicleCard({ vehicle, priority = false, className = "", bookingContext }: VehicleCardProps) {
  const isElectric = vehicle.category.includes("electric");

  return (
    <article
      data-vehicle-id={vehicle.id}
      data-testid="vehicle-card"
      className={`group relative flex flex-col justify-between overflow-hidden border border-td-rule bg-td-white glass-lift transition-all duration-300 ${className}`}
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
              <span className="bg-stage-ink px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white">
                THUẦN ĐIỆN
              </span>
            )}
            {vehicle.categoryLabel && (
              <span className="bg-td-white/90 px-2 py-0.5 text-[11px] font-semibold text-td-ink border border-td-rule">
                {vehicle.categoryLabel}
              </span>
            )}
          </div>

          <div>
            {vehicle.isAvailable ? (
              <span className="flex items-center gap-1 bg-success-bg px-2.5 py-0.5 text-[11px] font-bold text-success border border-success/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Sẵn sàng</span>
              </span>
            ) : (
              <span className="bg-td-chalk px-2.5 py-0.5 text-[11px] font-bold text-td-ink border border-td-rule">
                Đang thuê
              </span>
            )}
          </div>
        </div>

        {/* Trạm cơ sở ở góc dưới ảnh */}
        {vehicle.facilityName && (
          <div className="absolute bottom-2.5 left-3 pointer-events-none">
            <span className="flex items-center gap-1 bg-stage-ink/85 px-2 py-0.5 text-[11px] font-medium text-white">
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
                {vehicle.year ? `Đời ${vehicle.year}` : "Chưa có năm sản xuất"} {vehicle.brand ? `• ${vehicle.brand}` : ""}
              </p>
            </div>
          </div>

          {/* Lưới 4 chip thông số kỹ thuật chuẩn A6 */}
          <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs text-td-ink bg-td-paper p-2.5 border border-td-rule">
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{vehicle.seats ? `${vehicle.seats} chỗ` : "Tiêu chuẩn"}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Settings2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{vehicle.transmission || "Chưa có hộp số"}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              {isElectric ? (
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
              ) : (
                <Fuel className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
              <span className="truncate">
                {isElectric
                  ? (vehicle.batteryCapacity || "Chưa có thông số pin")
                  : (vehicle.fuelType || "Xăng")}
              </span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Gauge className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">
                {vehicle.maxRange || vehicle.storageCapacity || (vehicle.trunkCapacity ? `${vehicle.trunkCapacity}L` : "Chưa có thông số")}
              </span>
            </div>
          </div>

          <VehicleLicenseRequirement allowedLicenseTypes={vehicle.allowedLicenseTypes} className="mt-3.5" />
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
            href={vehicleDetailHref(vehicle, bookingContext)}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 bg-primary px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-primary-hover cursor-pointer"
          >
            <span>Chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
