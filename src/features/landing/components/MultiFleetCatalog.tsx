"use client";

import { useState, useRef } from "react";
import VehicleImage from "@/components/ui/VehicleImage";
import { 
  Car, 
  Sparkles, 
  BatteryCharging, 
  Fuel, 
  Users, 
  Gauge, 
  ArrowUpRight, 
  ShieldCheck, 
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import BookingModal from "@/features/rentals/components/BookingModal";
import { formatVnd } from "@/lib/format";
import { useFleetVehicles } from "../use-fleet-vehicles";
import { ErrorState } from "@/components/ui/ErrorState";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import type { Vehicle, VehicleCategory } from "@/features/vehicles/types";
import { VehicleLicenseRequirement } from "@/features/vehicles/components/VehicleLicenseRequirement";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/register";

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
  if (isElectric) return "Pin EV Công Suất Cao";
  if (!raw || raw === "Chưa có dữ liệu") return "Động cơ Xăng V8/V12";
  const lower = raw.toLowerCase();
  if (lower === "gasoline" || lower === "xăng") return "Động cơ Xăng Twin-Turbo";
  if (lower === "electric" || lower === "điện") return "Thuần điện Dual-Motor";
  return raw;
}

function formatRangeOrEfficiency(raw?: string): string {
  if (!raw || raw === "Chưa có dữ liệu") return "Kiểm định 100% đạt chuẩn";
  return raw;
}

export default function MultiFleetCatalog() {
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

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

  const handleBookVehicle = (entry: FleetVehicle) => setSelectedVehicleForBooking(entry.vehicle);

  // Cho phép duyệt qua toàn bộ dải sản phẩm theo chiều ngang mà không làm dài trang.
  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(track, { x: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
        const getScrollDistance = () => track.scrollWidth - track.clientWidth;
        if (getScrollDistance() <= 0) return;

        gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 80px",
            end: () => `+=${getScrollDistance() + 300}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.set(track, { x: 0 });
      });

      let resizeTimer: NodeJS.Timeout | null = null;
      let ro: ResizeObserver | null = null;

      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => {
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
          }, 120);
        });

        ro.observe(track);
        if (section) ro.observe(section);
      }

      return () => {
        if (ro) ro.disconnect();
        if (resizeTimer) clearTimeout(resizeTimer);
        mm.revert();
      };
    },
    { scope: sectionRef, dependencies: [filteredVehicles.length] }
  );

  return (
    <section 
      id="danh-muc-xe" 
      ref={sectionRef} 
      className="relative py-24 px-4 sm:px-6 lg:px-8 pr-14 md:pr-16 max-w-7xl mx-auto scroll-mt-24 overflow-hidden"
    >
      {/* Background Automotive Blueprint Vectors */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg 
          className="w-full h-full opacity-[0.05]" 
          viewBox="0 0 1280 1200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin slice"
        >
          <line x1="0" y1="40" x2="1280" y2="40" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 6" className="text-ink" />
          <line x1="0" y1="120" x2="1280" y2="120" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
          
          <g stroke="currentColor" strokeWidth="0.8" className="text-ink">
            <line x1="40" y1="110" x2="40" y2="130" />
            <line x1="280" y1="110" x2="280" y2="130" />
          </g>

          {/* Wind-Tunnel Aerodynamic Streamlines */}
          <path d="M -40 240 C 300 200, 680 160, 980 230 C 1140 270, 1240 310, 1320 340" stroke="currentColor" strokeWidth="1.2" strokeDasharray="8 6" className="text-primary" />
          <path d="M -20 320 C 320 280, 720 230, 1020 300 C 1180 340, 1260 380, 1340 410" stroke="currentColor" strokeWidth="1" className="text-ink" />
          <path d="M 0 420 C 360 380, 760 340, 1060 390 C 1200 420, 1280 460, 1360 490" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" className="text-ink" />

          {/* Center Skateboard Chassis */}
          <g transform="translate(340, 360)" className="text-ink">
            <rect x="0" y="0" width="600" height="520" rx="28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 4" />
            <rect x="24" y="24" width="552" height="472" rx="16" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="24" y1="140" x2="576" y2="140" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="24" y1="260" x2="576" y2="260" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="24" y1="380" x2="576" y2="380" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" />
          </g>
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase block mb-2">
            ĐỘI XE VẬN HÀNH TRỰC TIẾP // 100% SỞ HỮU CHÍNH CHỦ
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-ink tracking-tight text-balance">
            Bộ sưu&#160;tập xe cao&#160;cấp &amp; thể&#160;thao siêu&#160;sang
          </h2>
        </div>
        <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed text-balance">
          Toàn bộ đội xe được bảo dưỡng và kiểm định hai chiều khắt khe trước mỗi hành trình. Tự lái hoặc kèm tài xế chuyên nghiệp.
        </p>
      </div>

      {/* Category Tabs & Browse Link */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-line">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-stage-ink text-white shadow-sm"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            Tất cả đội xe ({fleetData.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("supercar")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === "supercar"
                ? "bg-stage-ink text-white shadow-sm"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Siêu xe Thể thao</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("suv_gt")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === "suv_gt"
                ? "bg-stage-ink text-white shadow-sm"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            <Compass className="w-4 h-4 text-primary" />
            <span>SUV &amp; Grand Tourer</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("electric")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === "electric"
                ? "bg-stage-ink text-white shadow-sm"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            <BatteryCharging className="w-4 h-4 text-primary" />
            <span>Thuần điện &amp; Hybrid</span>
          </button>
        </div>

        <Button as="a" href="/find" variant="secondary" size="sm" className="min-h-11 shrink-0 self-start sm:self-auto rounded-xl">
          <span>Xem tất cả chi tiết</span>
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

      {fleet.isPending && (
        <CardGridSkeleton 
          label="Đang tải danh mục xe" 
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" 
          count={3} 
          mediaClassName="h-56 w-full rounded-none" 
          lines={4} 
          containerClassName="rounded-3xl border border-line-strong bg-surface" 
        />
      )}
      
      {fleet.isError && (
        <ErrorState message={fleet.error.message} onRetry={() => { void fleet.refetch(); }} />
      )}
      
      {!fleet.isPending && !fleet.isError && !filteredVehicles.length && (
        <p role="status" className="py-8 text-center text-sm text-ink-2">
          Không có phương tiện phù hợp trong danh mục được chọn.
        </p>
      )}

      {/* Vehicles Grid / Desktop Horizontal Reel */}
      <div className="relative z-10 w-full overflow-hidden">
        <div
          ref={trackRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-nowrap gap-8 will-change-transform"
        >
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="group rounded-3xl bg-surface border border-line-strong overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 lg:w-[380px] lg:shrink-0"
            >
              {/* Image Container (>= 60% visually balanced) */}
              <div className="relative w-full h-56 overflow-hidden bg-sunken">
                <VehicleImage
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="h-full w-full"
                  imageClassName="group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-lg bg-stage-ink text-white text-xs font-semibold">
                    {vehicle.categoryName}
                  </span>

                  {vehicle.hasDriverOption && (
                    <span className="px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-semibold shadow-sm">
                      KÈM TÀI XẾ
                    </span>
                  )}
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-ink mb-1 group-hover:text-primary transition-colors">
                    {vehicle.name}
                  </h3>
                  <p className="text-xs text-primary font-mono font-semibold mb-4">
                    Kiểm định 2 chiều · Đời {vehicle.vehicle.year || "2026"}
                  </p>

                  <VehicleLicenseRequirement allowedLicenseTypes={vehicle.vehicle.allowedLicenseTypes} className="mb-4" />

                  {/* Specs Matrix */}
                  <div className="grid grid-cols-2 gap-3 mb-6 p-3.5 rounded-2xl bg-surface-raised text-xs">
                    <div className="flex items-center gap-2 text-ink-2">
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{vehicle.seats ? `${vehicle.seats} Chỗ ngồi` : "2 Chỗ ngồi"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-ink-2">
                      <Gauge className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{vehicle.transmission}</span>
                    </div>

                    <div className="flex items-center gap-2 text-ink-2">
                      {vehicle.isElectric ? (
                        <BatteryCharging className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <Fuel className="w-3.5 h-3.5 text-primary-graphic shrink-0" />
                      )}
                      <span className="truncate">{vehicle.powerFuel}</span>
                    </div>

                    <div className="flex items-center gap-2 text-ink-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{vehicle.rangeOrEfficiency}</span>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-4 border-t border-line flex items-center justify-between">
                  <div>
                    <div
                      className="font-mono text-xl font-black text-ink tabular-nums"
                      suppressHydrationWarning
                    >
                      {formatVnd(vehicle.hourlyPrice)}/giờ
                    </div>
                    <div
                      className="text-xs text-ink-3 tabular-nums font-mono"
                      suppressHydrationWarning
                    >
                      Thuê tháng: {formatVnd(vehicle.monthlyPrice)}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleBookVehicle(vehicle)}
                    disabled={!vehicle.vehicle.isAvailable}
                    variant="marketing-cta"
                    size="sm"
                    className="px-4 py-2 font-bold flex items-center gap-1.5 rounded-xl"
                  >
                    <span>Đặt xe</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
