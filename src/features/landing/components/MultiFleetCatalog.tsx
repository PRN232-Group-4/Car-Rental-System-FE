"use client";

import { useState, useRef, useEffect } from "react";
import VehicleImage from "@/components/ui/VehicleImage";
import { 
  Users, 
  Fuel, 
  Gauge, 
  BatteryCharging, 
  ArrowUpRight, 
  Sparkles, 
  Compass, 
  ShieldCheck,
  IdCard,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import BookingModal from "@/features/rentals/components/BookingModal";
import { formatVnd } from "@/lib/format";
import { useFleetVehicles } from "../use-fleet-vehicles";
import { ErrorState } from "@/components/ui/ErrorState";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import type { Vehicle, VehicleCategory } from "@/features/vehicles/types";
import { VehicleLicenseRequirement } from "@/features/vehicles/components/VehicleLicenseRequirement";
import { playTactileClick } from "@/lib/audio/haptic-audio";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

interface FleetVehicle {
  vehicle: Vehicle;
  id: string;
  name: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  categoryName: string;
  isElectric: boolean;
  hasDriverOption: boolean;
  seats: number;
  transmission: string;
  powerFuel: string;
  rangeOrEfficiency: string;
  hourlyPrice: number;
  monthlyPrice: number;
  imageUrl: string;
  badges: string[];
}

type CategoryFilter = "all" | "supercar" | "suv_gt" | "electric";

function formatTransmission(raw?: string): string {
  if (!raw || raw === "Chưa có dữ liệu") return "Tự động / PDK";
  const lower = raw.toLowerCase();
  if (lower === "automatic" || lower === "tự động") return "Tự động / PDK";
  if (lower === "manual" || lower === "số sàn") return "Số sàn 6 cấp";
  return raw;
}

function formatPowerFuel(raw?: string, isElectric?: boolean): string {
  if (isElectric) return "Thuần điện";
  if (!raw || raw === "Chưa có dữ liệu") return "Động cơ Xăng";
  const lower = raw.toLowerCase();
  if (lower.includes("gasoline") || lower.includes("xăng")) return "Động cơ Xăng";
  if (lower.includes("electric") || lower.includes("điện")) return "Thuần điện";
  if (lower.includes("hybrid")) return "Plug-in Hybrid";
  return raw;
}

function formatRangeOrEfficiency(raw?: string): string {
  if (!raw || raw === "Chưa có dữ liệu" || raw.includes("Kiểm định")) return "Kiểm định 2 chiều";
  return raw;
}

export interface MultiFleetCatalogProps {
  activeSearchCriteria?: {
    mode?: string;
    facilityId?: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
  } | null;
  onClearSearchCriteria?: () => void;
}

export default function MultiFleetCatalog({
  activeSearchCriteria,
  onClearSearchCriteria,
}: MultiFleetCatalogProps = {}) {
  const fleet = useFleetVehicles();
  const fleetData: FleetVehicle[] = (fleet.data ?? []).map((vehicle) => {
    const isElectric = vehicle.category.includes("electric") || (vehicle.name || "").toLowerCase().includes("taycan");
    return {
      vehicle,
      id: String(vehicle.id),
      name: vehicle.name,
      brand: vehicle.brand ?? "",
      model: vehicle.model ?? "",
      category: vehicle.category,
      categoryName: vehicle.categoryLabel,
      isElectric,
      hasDriverOption: vehicle.hasDriverOption === true,
      seats: vehicle.seats ?? 2,
      transmission: formatTransmission(vehicle.transmission),
      powerFuel: formatPowerFuel(vehicle.batteryCapacity || vehicle.fuelType, isElectric),
      rangeOrEfficiency: formatRangeOrEfficiency(vehicle.maxRange),
      hourlyPrice: vehicle.hourlyPrice,
      monthlyPrice: vehicle.monthlyPrice,
      imageUrl: vehicle.imageUrl,
      badges: vehicle.badges,
    };
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(0);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const filteredVehicles = fleetData.filter((v) => {
    if (selectedCategory === "all") return true;
    const name = (v.name + " " + v.brand + " " + v.model).toLowerCase();
    if (selectedCategory === "supercar") {
      return (
        name.includes("ferrari") ||
        name.includes("lamborghini") ||
        name.includes("porsche") ||
        name.includes("458") ||
        name.includes("488") ||
        name.includes("812") ||
        name.includes("huracán")
      );
    }
    if (selectedCategory === "suv_gt") {
      return (
        name.includes("bentley") ||
        name.includes("aston martin") ||
        name.includes("mercedes") ||
        name.includes("g63") ||
        name.includes("continental") ||
        name.includes("db12") ||
        v.seats >= 4
      );
    }
    if (selectedCategory === "electric") {
      return v.isElectric || name.includes("taycan") || name.includes("296") || v.category.includes("electric");
    }
    return true;
  });

  // Clamp index when list changes
  useEffect(() => {
    if (selectedCarIndex >= filteredVehicles.length) {
      setSelectedCarIndex(0);
    }
  }, [filteredVehicles.length, selectedCarIndex]);

  const activeCar = filteredVehicles[selectedCarIndex] || filteredVehicles[0];

  const handleCategorySwitch = (cat: CategoryFilter) => {
    if (cat === selectedCategory) return;
    playTactileClick();
    setSelectedCategory(cat);
    setSelectedCarIndex(0);
  };

  const handleSelectCar = (index: number) => {
    if (index === selectedCarIndex) return;
    playTactileClick();
    setSelectedCarIndex(index);
    if (stageRef.current) {
      gsap.fromTo(
        stageRef.current,
        { opacity: 0.6, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  };

  const handlePrevCar = () => {
    if (filteredVehicles.length <= 1) return;
    playTactileClick();
    const nextIdx = selectedCarIndex === 0 ? filteredVehicles.length - 1 : selectedCarIndex - 1;
    handleSelectCar(nextIdx);
  };

  const handleNextCar = () => {
    if (filteredVehicles.length <= 1) return;
    playTactileClick();
    const nextIdx = selectedCarIndex === filteredVehicles.length - 1 ? 0 : selectedCarIndex + 1;
    handleSelectCar(nextIdx);
  };

  const handleBookVehicle = (entry: FleetVehicle) => {
    playTactileClick();
    setSelectedVehicleForBooking(entry.vehicle);
  };

  return (
    <section 
      id="danh-muc-xe" 
      ref={sectionRef} 
      className="relative w-full py-12 lg:py-16 px-4 sm:px-6 lg:px-12 bg-canvas scroll-mt-24 overflow-hidden"
    >
      {/* Monumental Chapter Numeral */}
      <span 
        aria-hidden="true" 
        className="font-display font-black text-[clamp(4.5rem,7vw,8rem)] leading-none text-ink/5 dark:text-ink/10 select-none pointer-events-none absolute right-8 top-2 z-0 opacity-40"
      >
        02
      </span>

      <div className="relative z-10 w-full max-w-[1680px] mx-auto">
        {/* ============================================================== */}
        {/* TẦNG 1: HEADER, FILTER TABS & SHOWROOM NAVIGATION DOCK         */}
        {/* ============================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-line pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
                BỘ SƯU TẬP PHƯƠNG TIỆN // SHOWROOM KỸ THUẬT SỐ
              </span>
            </div>
            <h2 data-kinetic-skew="true" className="font-display text-2xl sm:text-4xl xl:text-5xl font-black text-ink tracking-tight text-balance">
              Bộ sưu tập xe sẵn sàng vận hành
            </h2>
          </div>

          {/* Action Row: Category Filter Pills + Quick Navigation + All Fleet Link */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-surface border border-line">
              <button
                type="button"
                onClick={() => handleCategorySwitch("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  selectedCategory === "all"
                    ? "bg-stage-ink text-white shadow-sm"
                    : "text-ink-2 hover:text-ink hover:bg-canvas"
                }`}
              >
                Tất cả ({fleetData.length})
              </button>

              <button
                type="button"
                onClick={() => handleCategorySwitch("supercar")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  selectedCategory === "supercar"
                    ? "bg-stage-ink text-white shadow-sm"
                    : "text-ink-2 hover:text-ink hover:bg-canvas"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Siêu xe</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySwitch("suv_gt")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  selectedCategory === "suv_gt"
                    ? "bg-stage-ink text-white shadow-sm"
                    : "text-ink-2 hover:text-ink hover:bg-canvas"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-primary" />
                <span>SUV &amp; Grand Tourer</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySwitch("electric")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  selectedCategory === "electric"
                    ? "bg-stage-ink text-white shadow-sm"
                    : "text-ink-2 hover:text-ink hover:bg-canvas"
                }`}
              >
                <BatteryCharging className="w-3.5 h-3.5 text-primary" />
                <span>Thuần điện</span>
              </button>
            </div>

            {/* Quick Car Stepper Navigation: < 01 / 06 > */}
            {filteredVehicles.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-line">
                <button
                  type="button"
                  onClick={handlePrevCar}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-ink hover:bg-canvas hover:text-primary transition-colors cursor-pointer"
                  aria-label="Xem xe trước đó"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold px-2 text-ink tabular-nums">
                  {String(selectedCarIndex + 1).padStart(2, "0")} / {String(filteredVehicles.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={handleNextCar}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-ink hover:bg-canvas hover:text-primary transition-colors cursor-pointer"
                  aria-label="Xem xe tiếp theo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* All Fleet Direct Link */}
            <Button as="a" href="/find" variant="secondary" size="sm" className="rounded-2xl text-xs font-bold py-2">
              <span>Xem toàn bộ danh mục</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Loading & Error States */}
        {fleet.isPending && (
          <CardGridSkeleton 
            label="Đang tải danh mục xe" 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 my-8" 
            count={3} 
            mediaClassName="h-52 w-full rounded-none" 
            lines={4} 
            containerClassName="rounded-2xl border border-line bg-surface" 
          />
        )}
        
        {fleet.isError && (
          <div className="my-8">
            <ErrorState message={fleet.error.message} onRetry={() => { void fleet.refetch(); }} />
          </div>
        )}
        
        {!fleet.isPending && !fleet.isError && !filteredVehicles.length && (
          <p role="status" className="my-12 text-center text-sm text-ink-2">
            Không có phương tiện phù hợp trong danh mục được chọn.
          </p>
        )}

        {/* ============================================================== */}
        {/* TẦNG 2: MAIN SHOWROOM STAGE (12 CỘT TĨNH KHÔNG CUỘN NGANG)      */}
        {/* ============================================================== */}
        {!fleet.isPending && !fleet.isError && activeCar && (
          <div 
            ref={stageRef}
            className="w-full rounded-3xl bg-surface border border-line p-6 lg:p-8 xl:p-10 mb-8 shadow-sm transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center">
              {/* CỘT TRÁI (7 CỘT): KHUNG ẢNH LỚN STUDIO BÊ TÔNG 16/10 */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-sunken/40 flex items-center justify-center p-4 sm:p-6 border border-line group">
                  <VehicleImage
                    src={activeCar.imageUrl}
                    alt={activeCar.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.22)] transition-transform duration-500 group-hover:scale-102"
                  />

                  {/* 2 Nhãn An Tâm Kỹ Thuật Số */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
                    <span className="px-3 py-1 rounded-lg glass-2 text-[11px] font-mono font-bold text-ink border border-line">
                      Kiểm định 128 hạng mục &amp; Bàn giao 60s
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
                    <span className="px-3 py-1 rounded-lg glass-2 text-[11px] font-mono font-semibold text-ink-2 border border-line">
                      Bảo hiểm thân vỏ toàn diện PVI
                    </span>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI (5 CỘT): THÔNG SỐ, GIÁ VÀ ĐẶT GIỮ XE */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  {/* Category Tag & Index */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
                      {activeCar.brand} // {activeCar.categoryName}
                    </span>
                    <span className="font-mono text-xs font-bold text-ink-3 px-2 py-0.5 rounded bg-sunken border border-line">
                      Mẫu xe {String(selectedCarIndex + 1).padStart(2, "0")} / {String(filteredVehicles.length).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Car Name */}
                  <h3 className="font-display text-3xl sm:text-4xl font-black text-ink tracking-tight mb-3">
                    {activeCar.name}
                  </h3>

                  {/* Price Block */}
                  <div className="p-4 rounded-2xl bg-surface-raised border border-line flex items-baseline justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-ink-3 block mb-0.5">
                        Giá thuê theo giờ
                      </span>
                      <div className="font-mono text-2xl sm:text-3xl font-black text-ink tabular-nums">
                        {formatVnd(activeCar.hourlyPrice)}
                        <span className="text-xs font-sans text-ink-3 font-normal ml-1">/ giờ</span>
                      </div>
                    </div>

                    {activeCar.monthlyPrice > 0 && (
                      <div className="text-right">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-3 block mb-0.5">
                          Thuê theo tháng
                        </span>
                        <div className="font-mono text-lg font-bold text-ink-2 tabular-nums">
                          {formatVnd(activeCar.monthlyPrice)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bảng 4 thông số kỹ thuật kẻ vạch chuẩn Luxury */}
                <div className="divide-y divide-line border-y border-line">
                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-sans text-ink-3 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      Số chỗ ngồi
                    </span>
                    <span className="font-mono font-bold text-ink">
                      {activeCar.seats} ghế thể thao
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-sans text-ink-3 flex items-center gap-2">
                      <Gauge className="w-3.5 h-3.5 text-primary" />
                      Hộp số
                    </span>
                    <span className="font-mono font-bold text-ink">
                      {activeCar.transmission}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-sans text-ink-3 flex items-center gap-2">
                      <Fuel className="w-3.5 h-3.5 text-primary" />
                      Động cơ / Nhiên liệu
                    </span>
                    <span className="font-mono font-bold text-ink">
                      {activeCar.powerFuel}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-sans text-ink-3 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      Kiểm định bàn giao
                    </span>
                    <span className="font-mono font-bold text-ink">
                      {activeCar.rangeOrEfficiency}
                    </span>
                  </div>
                </div>

                {/* Yêu cầu GPLX & CTA Booking */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-ink-2">
                    <IdCard aria-hidden="true" className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold text-ink">
                      {activeCar.vehicle.allowedLicenseTypes?.length
                        ? `Yêu cầu GPLX: Hạng ${[...new Set(activeCar.vehicle.allowedLicenseTypes.map((t) => t.trim().toUpperCase()).filter(Boolean))].join(" / ")}`
                        : "Yêu cầu GPLX B2 / Hạng tương đương"}
                    </span>
                  </div>

                  <Button
                    variant="marketing-cta"
                    size="lg"
                    onClick={() => handleBookVehicle(activeCar)}
                    className="w-full font-bold rounded-2xl py-3.5 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
                  >
                    <span>Đặt giữ mẫu xe này ngay</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>

                  <p className="text-center font-mono text-[11px] text-ink-3">
                    Lưu trữ mã hóa bất biến · Giải phóng cọc PayOS trong 15 phút
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TẦNG 3: FILMSTRIP DOCK 6 XE (GRID NGANG 6 CỘT TĨNH)            */}
        {/* ============================================================== */}
        {!fleet.isPending && !fleet.isError && filteredVehicles.length > 0 && (
          <div className="w-full pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-3">
                CHỌN NHANH DÒNG XE TRONG BỘ SƯU TẬP
              </span>
              <span className="text-xs font-mono text-ink-3">
                Nhấp để chuyển đổi hiển thị trên sân khấu
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {filteredVehicles.slice(0, 6).map((vehicle, idx) => {
                const isActive = idx === selectedCarIndex;
                return (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => handleSelectCar(idx)}
                    className={`group text-left rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? "bg-surface-raised border-primary ring-2 ring-primary/30 shadow-md"
                        : "bg-surface hover:bg-sunken border-line hover:border-line-strong"
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-sunken/40 flex items-center justify-center p-2 mb-2">
                      <VehicleImage
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-ink-3 mb-0.5">
                        <span className="truncate">{vehicle.brand}</span>
                        <span>0{idx + 1}</span>
                      </div>
                      <h4 className={`text-xs font-bold leading-tight truncate mb-1 ${isActive ? "text-primary" : "text-ink"}`}>
                        {vehicle.name}
                      </h4>
                      <div className="font-mono text-xs font-bold text-ink tabular-nums">
                        {formatVnd(vehicle.hourlyPrice)}
                        <span className="text-[10px] font-normal text-ink-3 font-sans ml-0.5">/h</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal Integration */}
      {selectedVehicleForBooking && (
        <BookingModal
          vehicle={selectedVehicleForBooking}
          onClose={() => setSelectedVehicleForBooking(null)}
        />
      )}
    </section>
  );
}
