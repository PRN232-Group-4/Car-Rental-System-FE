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
  CheckCircle2,
  CalendarCheck,
  IdCard
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CadCard } from "@/components/ui/CadCard";
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

/**
 * MultiFleetCatalog (Awwwards SOTD v4.0):
 * Ma trận Triển lãm Hạm đội Bất đối xứng (Asymmetric Interactive Fleet Exhibition Matrix - 12 Cột).
 * Loại bỏ 100% dải cuộn ngang bị xén mép; thay thế bằng Sân khấu Tiêu điểm Flagship 7 cột (trái)
 * và Bảng điều khiển chọn xe CAD 5 cột (phải) với tương tác Click-to-Select mượt mà.
 */
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
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

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

  // Ensure selectedVehicleId is always valid in the filtered list
  useEffect(() => {
    if (filteredVehicles.length > 0) {
      if (!selectedVehicleId || !filteredVehicles.some((v) => v.id === selectedVehicleId)) {
        setSelectedVehicleId(filteredVehicles[0].id);
      }
    }
  }, [filteredVehicles, selectedVehicleId]);

  const featuredVehicle = filteredVehicles.find((v) => v.id === selectedVehicleId) || filteredVehicles[0];

  const handleSelectVehicle = (vehicleId: string) => {
    if (vehicleId === selectedVehicleId) return;
    playTactileClick();
    setSelectedVehicleId(vehicleId);

    // Smooth subtle crossfade in Spotlight Stage
    if (spotlightRef.current) {
      gsap.fromTo(
        spotlightRef.current,
        { opacity: 0.72, scale: 0.985 },
        { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  };

  const handleBookVehicle = (entry: FleetVehicle) => setSelectedVehicleForBooking(entry.vehicle);

  return (
    <section 
      id="danh-muc-xe" 
      ref={sectionRef} 
      className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-12 w-full max-w-[1480px] xl:max-w-[1600px] mx-auto scroll-mt-24 overflow-hidden"
    >
      {/* Monumental Chapter Numeral */}
      <span 
        aria-hidden="true" 
        className="font-display font-black text-[clamp(4.5rem,7vw,8rem)] leading-none text-ink/5 dark:text-ink/10 select-none pointer-events-none absolute right-6 top-8"
      >
        03
      </span>

      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase block mb-2">
            HẠM ĐỘI XE CAO CẤP // THẨM ĐỊNH KỸ THUẬT 100%
          </span>
          <h2 data-kinetic-skew="true" className="font-display text-3xl sm:text-5xl font-black text-ink tracking-tight text-balance">
            Bộ sưu tập xe sẵn&#160;sàng vận&#160;hành
          </h2>
        </div>
        <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed text-balance">
          Hạm đội siêu xe thể thao, SUV hạng sang và xe thuần điện hàng đầu. Minh bạch giá niêm yết, hợp đồng điện tử và nhận xe ngay.
        </p>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              playTactileClick();
            }}
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
            onClick={() => {
              setSelectedCategory("supercar");
              playTactileClick();
            }}
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
            onClick={() => {
              setSelectedCategory("suv_gt");
              playTactileClick();
            }}
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
            onClick={() => {
              setSelectedCategory("electric");
              playTactileClick();
            }}
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

        <Button as="a" href="/find" variant="secondary" size="sm" className="min-h-11 shrink-0 rounded-xl">
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
          containerClassName="rounded-xl border border-line-strong bg-surface" 
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

      {/* Asymmetric Interactive Fleet Exhibition Matrix (12 Columns) */}
      {!fleet.isPending && !fleet.isError && filteredVehicles.length > 0 && featuredVehicle && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Top Featured Spotlight Stage (7 Columns on lg:, Sticky while browsing) */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <CadCard
              interactive={false}
              headerLeft={
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>TIÊU ĐIỂM HẠM ĐỘI // SPOTLIGHT STAGE</span>
                </span>
              }
              headerRight={
                <span className="text-primary font-semibold">
                  {featuredVehicle.categoryName}
                </span>
              }
              className="p-6 sm:p-8"
            >
              <div ref={spotlightRef} className="space-y-6">
                {/* 16:10 Showcase Vehicle Visual Stage */}
                <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-sunken/60 flex items-center justify-center p-4">
                  <VehicleImage
                    src={featuredVehicle.imageUrl}
                    alt={featuredVehicle.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.18)]"
                  />
                  <div className="absolute bottom-3 left-3 bg-surface/90 border border-line px-2.5 py-1 rounded text-[11px] font-mono text-ink-2">
                    ID: {featuredVehicle.id} // 360° VERIFIED
                  </div>
                </div>

                {/* Title & Category Row */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-line pb-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-ink-3 font-semibold">
                      {featuredVehicle.brand} {featuredVehicle.model}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-black text-ink tracking-tight mt-0.5">
                      {featuredVehicle.name}
                    </h3>
                  </div>

                  {/* Hourly & Monthly Rates */}
                  <div className="text-left sm:text-right">
                    <div className="font-mono text-2xl sm:text-3xl font-black text-ink tabular-nums">
                      {formatVnd(featuredVehicle.hourlyPrice)}
                      <span className="text-xs font-sans text-ink-3 font-normal ml-1">/ giờ</span>
                    </div>
                    {featuredVehicle.monthlyPrice > 0 && (
                      <div className="text-xs font-mono text-ink-3 tabular-nums mt-0.5">
                        hoặc {formatVnd(featuredVehicle.monthlyPrice)} / tháng
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Telemetry Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-sunken border border-line flex flex-col justify-between">
                    <span className="font-mono text-[10px] uppercase text-ink-3 flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-primary" />
                      Chỗ ngồi
                    </span>
                    <span className="font-mono text-xs font-bold text-ink mt-1">
                      {featuredVehicle.seats} ghế thể thao
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-sunken border border-line flex flex-col justify-between">
                    <span className="font-mono text-[10px] uppercase text-ink-3 flex items-center gap-1.5">
                      <Gauge className="w-3 h-3 text-primary" />
                      Hộp số
                    </span>
                    <span className="font-mono text-xs font-bold text-ink mt-1 truncate" title={featuredVehicle.transmission}>
                      {featuredVehicle.transmission}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-sunken border border-line flex flex-col justify-between">
                    <span className="font-mono text-[10px] uppercase text-ink-3 flex items-center gap-1.5">
                      <Fuel className="w-3 h-3 text-primary" />
                      Nhiên liệu
                    </span>
                    <span className="font-mono text-xs font-bold text-ink mt-1 truncate" title={featuredVehicle.powerFuel}>
                      {featuredVehicle.powerFuel}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-sunken border border-line flex flex-col justify-between">
                    <span className="font-mono text-[10px] uppercase text-ink-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-primary" />
                      Kiểm định
                    </span>
                    <span className="font-mono text-xs font-bold text-ink mt-1 truncate" title={featuredVehicle.rangeOrEfficiency}>
                      {featuredVehicle.rangeOrEfficiency}
                    </span>
                  </div>
                </div>

                {/* License Tier Badge & Primary CTA Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs leading-relaxed text-ink-2">
                    <IdCard aria-hidden="true" className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold text-ink">
                      {featuredVehicle.vehicle.allowedLicenseTypes?.length
                        ? `Tự lái: GPLX ${[...new Set(featuredVehicle.vehicle.allowedLicenseTypes.map((t) => t.trim().toUpperCase()).filter(Boolean))].join(" hoặc ")}`
                        : "Tự lái: đang cập nhật yêu cầu GPLX"}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleBookVehicle(featuredVehicle)}
                    className="w-full sm:w-auto font-bold rounded-xl"
                  >
                    <span>Đặt lịch trải nghiệm xe này</span>
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CadCard>
          </div>

          {/* Right Interactive Fleet Selector Matrix (5 Columns on lg:) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 mb-1 font-mono text-xs text-ink-3 uppercase tracking-wider">
              <span>Hạm đội chọn lọc ({filteredVehicles.length} xe)</span>
              <span>Nhấp chọn để hoán đổi ↗</span>
            </div>

            {/* Compact 2-Column Responsive CAD Instrument Rack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredVehicles.map((vehicle) => {
                const isSelected = vehicle.id === featuredVehicle.id;
                return (
                  <CadCard
                    key={vehicle.id}
                    active={isSelected}
                    onClick={() => handleSelectVehicle(vehicle.id)}
                    className="p-4 cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Compact Image */}
                      <div className="relative aspect-[16/10] w-full rounded-md overflow-hidden bg-sunken/40 flex items-center justify-center p-2 mb-3">
                        <VehicleImage
                          src={vehicle.imageUrl}
                          alt={vehicle.name}
                          className="w-full h-full object-contain filter drop-shadow-sm"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Name & Brand */}
                      <div className="mb-2">
                        <span className="font-mono text-[10px] text-ink-3 uppercase block">
                          {vehicle.brand}
                        </span>
                        <h4 className="font-display text-sm font-bold text-ink leading-tight line-clamp-1">
                          {vehicle.name}
                        </h4>
                      </div>
                    </div>

                    {/* Price & License Tier */}
                    <div className="pt-2 border-t border-line flex items-center justify-between gap-2 mt-auto">
                      <div className="font-mono text-xs font-bold text-ink tabular-nums">
                        {formatVnd(vehicle.hourlyPrice)}
                        <span className="text-[10px] font-sans text-ink-3 font-normal ml-0.5">/h</span>
                      </div>
                      <VehicleLicenseRequirement allowedLicenseTypes={vehicle.vehicle.allowedLicenseTypes || []} />
                    </div>
                  </CadCard>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {selectedVehicleForBooking && (
        <BookingModal
          vehicle={selectedVehicleForBooking}
          onClose={() => setSelectedVehicleForBooking(null)}
        />
      )}
    </section>
  );
}
