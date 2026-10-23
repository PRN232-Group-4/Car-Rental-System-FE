"use client";

import { useState } from "react";
import VehicleImage from "@/components/ui/VehicleImage";
import { Zap, Gauge, BatteryCharging, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BookingModal } from "@/features/rentals";
import type { Vehicle } from "@/features/vehicles/types";
import { VehicleLicenseRequirement } from "@/features/vehicles/components/VehicleLicenseRequirement";

import { useFleetVehicles } from "../use-fleet-vehicles";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonBlock, Skeleton } from "@/components/ui/Skeleton";

interface EVModel {
  vehicle: Vehicle;
  id: string;
  name: string;
  tagline: string;
  category: string;
  classTag: string;
  hourlyPrice: number;
  monthlyPrice: number;
  imageUrl: string;
  rangeKm: string;
  acceleration: string;
  powerKw: string;
  batteryKwh: string;
  healthSoh: string;
  highlights: string[];
}

export default function SpatialFleetShowcase({
  initialFacilityFilter,
}: {
  initialFacilityFilter?: string;
} = {}) {
  const fleet = useFleetVehicles();
  const fleetModels: EVModel[] = (fleet.data ?? []).filter((vehicle) =>
    vehicle.category === "electric_car" && (!initialFacilityFilter || initialFacilityFilter === "all" || String(vehicle.facilityId) === initialFacilityFilter)
  ).map((vehicle) => ({
    vehicle, id: String(vehicle.id), name: vehicle.name, tagline: vehicle.description ?? "",
    category: vehicle.categoryLabel, classTag: vehicle.categoryLabel,
    hourlyPrice: vehicle.hourlyPrice, monthlyPrice: vehicle.monthlyPrice, imageUrl: vehicle.imageUrl,
    rangeKm: vehicle.maxRange ?? "—", acceleration: "Chưa có dữ liệu", powerKw: "—",
    batteryKwh: vehicle.batteryCapacity ?? "—", healthSoh: "Chưa có dữ liệu", highlights: vehicle.features ?? [],
  }));
  const [activeModelId, setActiveModelId] = useState<string>("");
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);

  const activeModel = fleetModels.find((m) => m.id === activeModelId) || fleetModels[0];

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val) + "đ";
  };

  const handleBookCurrentModel = () => {
    if (activeModel?.vehicle.isAvailable) setSelectedVehicleForBooking(activeModel.vehicle);
  };

  if (fleet.isPending) return <SkeletonBlock label="Đang tải đội xe điện" className="mx-auto max-w-7xl px-6 py-24"><Skeleton className="h-96 w-full" /></SkeletonBlock>;
  if (fleet.isError) return <ErrorState message={fleet.error.message} onRetry={() => { void fleet.refetch(); }} />;
  if (!activeModel) return <p role="status" className="py-24 text-center">Chưa có xe điện phù hợp tại cơ sở này.</p>;

  return (
    <section id="trien-lam-xe" className="py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-28">
      {/* Section Header with Spatial Typography */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.08]">
            Đội Xe Thuần Điện Đẳng Cấp
          </h2>
        </div>
        <p className="max-w-md text-sm sm:text-base text-white/70 font-normal leading-relaxed">
          100% phương tiện do hệ thống trực tiếp sở hữu. Khám phá các thông số kỹ thuật thực tế và chọn dòng xe phù hợp cho hành trình của bạn.
        </p>
      </div>

      {/* Segmented Model Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-10 pb-4 border-b border-white/10 overflow-x-auto no-scrollbar">
        {fleetModels.map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => setActiveModelId(model.id)}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none active:scale-[0.98] flex items-center gap-2.5 ${
              activeModelId === model.id
                ? "bg-primary text-white shadow-e2 border border-white/20"
                : "bg-stage-ink hover:bg-stage-ink/90 text-white/80 hover:text-white border border-white/10"
            }`}
          >
            <span>{model.name}</span>
            <span
              className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                activeModelId === model.id
                  ? "bg-surface/20 text-white"
                  : "bg-surface/10 text-white/60"
              }`}
            >
              {model.classTag}
            </span>
          </button>
        ))}
      </div>

      {/* Spatial 3D Vehicle Presentation Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface rounded-[var(--r-panel)] p-6 sm:p-10 border border-line shadow-e3 relative overflow-hidden">
        {/* Left Column: Visual Stage with 3D Perspective */}
        <div className="lg:col-span-7 relative group">
          <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-stage-ink shadow-e2 [perspective:1200px]">
            <VehicleImage
              src={activeModel.imageUrl}
              alt={activeModel.name}
              className="h-full w-full"
              imageClassName="group-hover:scale-105 group-hover:rotate-1 transition-transform duration-700 ease-out"
            />
            {/* Flat dark scrim per A4.1 */}
            <div className="absolute inset-0 bg-stage-ink/40 pointer-events-none" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="glass-1 px-3 py-1 rounded-full text-white text-xs font-mono font-bold border border-white/20 shadow-e1">
                {activeModel.classTag}
              </span>
              <span className="inline-flex items-center gap-1 bg-primary/20 text-primary-tint text-xs font-mono font-bold px-3 py-1 rounded-full border border-primary/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeModel.vehicle.isAvailable ? "SẴN SÀNG" : "CHƯA SẴN SÀNG"}</span>
              </span>
            </div>

            {/* Telemetry Floating Glass HUD on Image */}
            <div className="absolute bottom-4 inset-x-4 glass-ink p-4 rounded-2xl border border-white/15 flex items-center justify-between shadow-e2">
              <div>
                <span className="text-xs text-white/60 font-mono block">PHẠM VI DI CHUYỂN</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-primary-tint">
                  {activeModel.rangeKm}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-white/60 font-mono block">TÌNH TRẠNG PIN SoH</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-white">
                  {activeModel.healthSoh}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Deep Telemetry Specs & Direct Booking Action */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-2xl sm:text-3xl font-black text-ink tracking-tight text-balance">
                {activeModel.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-tint text-primary border border-primary/20">
                {activeModel.category}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-2 font-normal leading-relaxed mb-6 text-pretty">
              {activeModel.tagline}
            </p>

            <VehicleLicenseRequirement allowedLicenseTypes={activeModel.vehicle.allowedLicenseTypes} className="mb-6" />

            {/* 4-Grid Telemetry Telematics */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 bg-canvas rounded-2xl border border-line shadow-e1">
                <div className="flex items-center gap-1.5 text-xs text-ink-3 mb-1 font-semibold">
                  <Gauge className="w-4 h-4 text-primary" />
                  <span>Tăng tốc 0–100 km/h</span>
                </div>
                <span className="font-mono text-lg font-black text-ink">{activeModel.acceleration}</span>
              </div>

              <div className="p-3.5 bg-canvas rounded-2xl border border-line shadow-e1">
                <div className="flex items-center gap-1.5 text-xs text-ink-3 mb-1 font-semibold">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Công suất cực đại</span>
                </div>
                <span className="font-mono text-lg font-black text-ink">{activeModel.powerKw}</span>
              </div>

              <div className="p-3.5 bg-canvas rounded-2xl border border-line shadow-e1">
                <div className="flex items-center gap-1.5 text-xs text-ink-3 mb-1 font-semibold">
                  <BatteryCharging className="w-4 h-4 text-primary" />
                  <span>Dung lượng pin</span>
                </div>
                <span className="font-mono text-lg font-black text-primary">{activeModel.batteryKwh}</span>
              </div>

              <div className="p-3.5 bg-canvas rounded-2xl border border-line shadow-e1">
                <div className="flex items-center gap-1.5 text-xs text-ink-3 mb-1 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Kiểm định 2 chiều</span>
                </div>
                <span className="font-mono text-lg font-black text-primary">Chưa có dữ liệu</span>
              </div>
            </div>

            {/* Key Feature Bullets */}
            <div className="space-y-2 mb-6">
              {activeModel.highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-ink-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="pt-5 border-t border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl sm:text-3xl font-black text-primary tracking-tight">
                  {formatVND(activeModel.hourlyPrice)}
                </span>
                <span className="text-xs text-ink-3 font-semibold"> / giờ</span>
              </div>
              <span className="text-xs text-ink-3 font-mono block">
                Gói tháng: {formatVND(activeModel.monthlyPrice)}
              </span>
            </div>

            <Button
              type="button"
              onClick={handleBookCurrentModel}
              disabled={!activeModel.vehicle.isAvailable}
              variant="primary"
              size="lg"
              className="group shadow-e2 px-7"
            >
              <span>Đặt xe ngay</span>
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Transparent Cost Booking Modal */}
      {selectedVehicleForBooking && (
        <BookingModal
          vehicle={selectedVehicleForBooking}
          onClose={() => setSelectedVehicleForBooking(null)}
        />
      )}
    </section>
  );
}
