"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ChevronRight,
  CheckCircle2,
  Rotate3d,
  Calendar,
  Image as ImageIcon,
  Building2,
} from "lucide-react";
import { Vehicle, RentalPolicy, BusySlot } from "../types";
import { VehicleGallery } from "./VehicleGallery";
import { VehicleSpecs } from "./VehicleSpecs";
import { RentalPolicyPanel } from "./RentalPolicyPanel";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { StickyBookingCard } from "./StickyBookingCard";
import { VehicleCard } from "./VehicleCard";

const DynamicVehicle3DViewer = dynamic(
  () => import("./Vehicle3DViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[16/10] w-full rounded-2xl sm:rounded-3xl bg-sunken flex items-center justify-center animate-pulse text-xs font-semibold text-ink-3 border border-line">
        Đang khởi tạo WebGL 3D Studio...
      </div>
    ),
  }
);

export interface VehicleDetailViewProps {
  vehicle: Vehicle;
  policy?: RentalPolicy | null;
  busySlots?: BusySlot[];
  similarVehicles?: Vehicle[];
  initialFrom?: string;
  initialTo?: string;
  initialMode?: "self" | "driver" | "subscription";
  className?: string;
}

export function VehicleDetailView({
  vehicle,
  policy,
  busySlots = [],
  similarVehicles = [],
  initialFrom,
  initialTo,
  initialMode = "self",
  className = "",
}: VehicleDetailViewProps) {
  // Tab chuyển đổi phương tiện hiển thị (Ảnh thực tế / Mô hình 3D / Lịch trống)
  const [activeMediaTab, setActiveMediaTab] = useState<"gallery" | "3d" | "calendar">("gallery");

  const [bookingFrom, setBookingFrom] = useState<string | undefined>(initialFrom);
  const [bookingTo, setBookingTo] = useState<string | undefined>(initialTo);

  const handleSelectSlotRange = (range: { from: string; to: string }) => {
    setBookingFrom(range.from);
    setBookingTo(range.to);
  };

  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 ${className}`}>
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-ink-3">
        <Link href="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-ink-3" />
        <Link href="/find" className="hover:text-primary transition-colors">
          Tìm xe
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-ink-3" />
        <span className="font-semibold text-ink truncate max-w-[240px]">{vehicle.name}</span>
      </nav>

      {/* 2. Tiêu đề xe & Thông tin tổng quát */}
      <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {vehicle.category.includes("electric") && (
              <span className="rounded-md bg-stage-ink px-2.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-xs">
                THUẦN ĐIỆN
              </span>
            )}
            <span className="rounded-md bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink border border-line shadow-xs">
              {vehicle.categoryLabel}
            </span>
            <span className="rounded-md bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink border border-line shadow-xs">
              Đời {vehicle.year}
            </span>
            {vehicle.isAvailable ? (
              <span className="flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-bold text-success border border-success/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Sẵn sàng giao xe</span>
              </span>
            ) : (
              <span className="rounded-full bg-sunken px-2.5 py-0.5 text-xs font-bold text-ink-3 border border-line">
                Đang có đơn thuê
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-ink tracking-tight">
            {vehicle.name}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-xs text-ink-3 font-medium">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span>Địa điểm nhận xe: <strong>{vehicle.facilityName}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Bố cục chính 2 cột: Cột trái (Chi tiết) & Cột phải (Sticky Booking Card) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* CỘT TRÁI */}
        <div className="space-y-8 min-w-0">
          {/* Media Switcher Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-line pb-2">
              <button
                type="button"
                onClick={() => setActiveMediaTab("gallery")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeMediaTab === "gallery"
                    ? "bg-primary text-white shadow-xs"
                    : "text-ink-2 hover:bg-surface-raised border border-line bg-surface"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Ảnh chụp thực tế</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab("3d")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeMediaTab === "3d"
                    ? "bg-primary text-white shadow-xs"
                    : "text-ink-2 hover:bg-surface-raised border border-line bg-surface"
                }`}
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span>Xem 3D tương tác</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab("calendar")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeMediaTab === "calendar"
                    ? "bg-primary text-white shadow-xs"
                    : "text-ink-2 hover:bg-surface-raised border border-line bg-surface"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Lịch trống xe</span>
              </button>
            </div>

            {/* Khung nội dung media */}
            <div>
              {activeMediaTab === "gallery" && (
                <VehicleGallery
                  mainImageUrl={vehicle.imageUrl}
                  galleryImages={vehicle.galleryImages}
                  vehicleName={vehicle.name}
                  vehicleColor={vehicle.color}
                />
              )}

              {activeMediaTab === "3d" && (
                <DynamicVehicle3DViewer
                  modelUrl={vehicle.modelUrl}
                  posterUrl={vehicle.imageUrl}
                  vehicleName={vehicle.name}
                  defaultColor={vehicle.color}
                />
              )}

              {activeMediaTab === "calendar" && (
                <AvailabilityCalendar
                  vehicleId={vehicle.id}
                  busySlots={busySlots}
                  onSelectSlotRange={handleSelectSlotRange}
                />
              )}
            </div>
          </div>

          {/* Mô tả xe & Cam kết chất lượng Thong Dong */}
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-e1 space-y-4">
            <h2 className="text-base font-bold text-ink">Mô tả phương tiện & Cam kết kiểm định</h2>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              {vehicle.description ||
                `${vehicle.name} là mẫu xe thuộc đội xe trực tiếp của Thong Dong, đáp ứng tiêu chuẩn kiểm định 12 hạng mục kỹ thuật an toàn trước mỗi chuyến đi. Xe được bảo trì định kỳ tại các xưởng chính hãng.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-line pt-4">
              <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Kiểm định 12 hạng mục</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Khử khuẩn & Vệ sinh sạch</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Đổi xe tương đương nếu sự cố</span>
              </div>
            </div>
          </div>

          {/* Thông số kỹ thuật Bento Grid */}
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-e1">
            <VehicleSpecs
              category={vehicle.category}
              year={vehicle.year}
              seats={vehicle.seats}
              transmission={vehicle.transmission}
              fuelType={vehicle.fuelType}
              batteryCapacity={vehicle.batteryCapacity}
              chargingType={vehicle.chargingType}
              chargingTimeHours={vehicle.chargingTimeHours}
              maxRange={vehicle.maxRange}
              storageCapacity={vehicle.storageCapacity}
              trunkCapacity={vehicle.trunkCapacity}
              bikeType={vehicle.bikeType}
              color={vehicle.color}
              features={vehicle.features}
            />
          </div>

          {/* Chính sách thuê xe & Bảo hiểm */}
          <RentalPolicyPanel
            policy={policy}
            isElectric={vehicle.category.includes("electric")}
            category={vehicle.category}
          />

          {/* Gợi ý các xe tương tự cùng chi nhánh */}
          {similarVehicles.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-line">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-ink">Các xe tương tự tại trạm</h3>
                <Link
                  href={`/find?facilityId=${vehicle.facilityId}`}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarVehicles.slice(0, 2).map((item) => (
                  <VehicleCard key={item.id} vehicle={item} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: Sticky Booking Card */}
        <div className="w-full">
          <StickyBookingCard
            vehicle={vehicle}
            policy={policy}
            initialFrom={bookingFrom}
            initialTo={bookingTo}
            initialMode={initialMode}
          />
        </div>
      </div>
    </div>
  );
}
