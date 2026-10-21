"use client";

import { useState } from "react";
import VehicleImage from "@/components/ui/VehicleImage";
import { 
  Car, 
  Bike, 
  BatteryCharging, 
  Fuel, 
  Users, 
  Gauge, 
  ArrowUpRight, 
  ShieldCheck, 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import BookingModal from "@/features/rentals/components/BookingModal";
import { formatVnd } from "@/lib/format";
import { useFleetVehicles } from "../use-fleet-vehicles";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonBlock, Skeleton } from "@/components/ui/Skeleton";
import type { Vehicle, VehicleCategory } from "@/features/vehicles/types";

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

type CategoryFilter = "all" | "electric_car" | "car" | "electric_motorbike" | "motorbike";

export default function MultiFleetCatalog() {
  const fleet = useFleetVehicles();
  const fleetData: FleetVehicle[] = (fleet.data ?? []).map((vehicle) => ({
    vehicle, id: String(vehicle.id), name: vehicle.name, brand: vehicle.brand ?? "", model: vehicle.model ?? "",
    category: vehicle.category, categoryName: vehicle.categoryLabel,
    isElectric: vehicle.category.includes("electric"), hasDriverOption: vehicle.hasDriverOption === true,
    seats: vehicle.seats ?? 0, transmission: vehicle.transmission || "Chưa có dữ liệu",
    powerFuel: vehicle.batteryCapacity || vehicle.fuelType || "Chưa có dữ liệu",
    rangeOrEfficiency: vehicle.maxRange || "Chưa có dữ liệu",
    hourlyPrice: vehicle.hourlyPrice, monthlyPrice: vehicle.monthlyPrice, imageUrl: vehicle.imageUrl, badges: vehicle.badges,
  }));
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);

  const filteredVehicles = fleetData.filter((v) => selectedCategory === "all" || v.category === selectedCategory);

  const handleBookVehicle = (entry: FleetVehicle) => setSelectedVehicleForBooking(entry.vehicle);

  return (
    <section id="doi-xe" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 overflow-hidden">
      {/* Background Automotive Blueprint Vectors (Flat Chassis Cutaway & Wind-Tunnel Streamlines) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg 
          className="w-full h-full opacity-[0.06]" 
          viewBox="0 0 1280 1200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin slice"
        >
          {/* Engineering Boundary Marks */}
          <line x1="0" y1="40" x2="1280" y2="40" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="6 6" />
          <line x1="0" y1="120" x2="1280" y2="120" stroke="#b45309" strokeWidth="0.8" />
          
          {/* Section Blueprint Stamp */}
          <g stroke="#0f172a" strokeWidth="0.8">
            <line x1="40" y1="110" x2="40" y2="130" />
            <line x1="280" y1="110" x2="280" y2="130" />
            <text x="160" y="116" fill="#0f172a" fontSize="10" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
              FLEET PLATFORM: SKATEBOARD CHASSIS 1:1
            </text>
          </g>

          {/* Wind-Tunnel Aerodynamic Streamlines */}
          <path d="M -40 240 C 300 200, 680 160, 980 230 C 1140 270, 1240 310, 1320 340" stroke="#b45309" strokeWidth="1.2" strokeDasharray="8 6" />
          <path d="M -20 320 C 320 280, 720 230, 1020 300 C 1180 340, 1260 380, 1340 410" stroke="#0f172a" strokeWidth="1" />
          <path d="M 0 420 C 360 380, 760 340, 1060 390 C 1200 420, 1280 460, 1360 490" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="4 4" />
          <path d="M 20 780 C 380 730, 740 680, 1040 740 C 1180 770, 1260 820, 1340 850" stroke="#b45309" strokeWidth="1" strokeDasharray="6 6" />
          <path d="M -40 920 C 340 880, 780 840, 1080 890 C 1220 920, 1300 960, 1380 990" stroke="#0f172a" strokeWidth="1.2" />

          {/* Center Skateboard Chassis & Battery Pack Structural Perimeter */}
          <g transform="translate(340, 360)">
            {/* Outer Chassis Frame */}
            <rect x="0" y="0" width="600" height="520" rx="28" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="8 4" />
            <rect x="24" y="24" width="552" height="472" rx="16" stroke="#b45309" strokeWidth="1" />
            
            {/* Battery Cell Structural Baffles */}
            <line x1="24" y1="140" x2="576" y2="140" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="24" y1="260" x2="576" y2="260" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="24" y1="380" x2="576" y2="380" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="160" y1="24" x2="160" y2="496" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="300" y1="24" x2="300" y2="496" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="440" y1="24" x2="440" y2="496" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="4 4" />

            {/* Front & Rear e-AWD Drive Unit Cylinders */}
            <circle cx="300" cy="80" r="32" stroke="#b45309" strokeWidth="1.2" />
            <circle cx="300" cy="80" r="4" fill="#b45309" />
            <circle cx="300" cy="440" r="36" stroke="#b45309" strokeWidth="1.2" />
            <circle cx="300" cy="440" r="5" fill="#b45309" />

            {/* Front Suspension Wishbone Arms */}
            <path d="M 240 80 L 120 40 M 360 80 L 480 40" stroke="#0f172a" strokeWidth="1.2" />
            <path d="M 240 80 L 120 120 M 360 80 L 480 120" stroke="#0f172a" strokeWidth="1.2" />

            {/* Rear Suspension Multi-Link Geometry */}
            <path d="M 230 440 L 110 400 M 370 440 L 490 400" stroke="#0f172a" strokeWidth="1.2" />
            <path d="M 230 440 L 110 480 M 370 440 L 490 480" stroke="#0f172a" strokeWidth="1.2" />

            {/* Chassis Telemetry Spec Label */}
            <text x="300" y="255" fill="#0f172a" fontSize="11" fontFamily="monospace" textAnchor="middle" letterSpacing="1.5">
              800V HIGH-VOLTAGE ARCHITECTURE // CATL CELL-TO-PACK
            </text>
            <text x="300" y="275" fill="#b45309" fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
              MAX TORQUE DUAL-MOTOR TORQUE VECTORING
            </text>
          </g>

          {/* Precision Alignment Crosshairs */}
          <g stroke="#0f172a" strokeWidth="0.8">
            <line x1="80" y1="560" x2="100" y2="560" /><line x1="90" y1="550" x2="90" y2="570" />
            <text x="110" y="564" fill="#0f172a" fontSize="9" fontFamily="monospace">DATUM: F-AXLE</text>

            <line x1="1180" y1="560" x2="1200" y2="560" /><line x1="1190" y1="550" x2="1190" y2="570" />
            <text x="1090" y="564" fill="#0f172a" fontSize="9" fontFamily="monospace">TRACK 1,640 MM</text>
          </g>
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-ink tracking-tight text-balance">
            Danh Mục Phương Tiện Toàn Diện
          </h2>
        </div>
        <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed text-pretty">
          Đầy đủ 4 nhóm phương tiện đạt tiêu chuẩn kiểm định 2 chiều khắt khe: Ô tô & Xe máy, Xăng & Điện, Tự lái & Kèm tài xế riêng.
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
                ? "bg-stage-ink text-white shadow-e2"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            Tất cả ({fleetData.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("electric_car")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === "electric_car"
                ? "bg-stage-ink text-white shadow-e2"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Ô tô điện</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("car")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === "car"
                ? "bg-stage-ink text-white shadow-e2"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Ô tô xăng</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("electric_motorbike")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === "electric_motorbike"
                ? "bg-stage-ink text-white shadow-e2"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Xe máy điện</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("motorbike")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === "motorbike"
                ? "bg-stage-ink text-white shadow-e2"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Xe máy xăng</span>
          </button>
        </div>

        <Button as="a" href="/find" variant="secondary" size="sm" className="min-h-11 shrink-0 self-start sm:self-auto">
          <span>Xem thêm</span>
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

      {fleet.isPending && <SkeletonBlock label="Đang tải danh mục xe" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((key) => <Skeleton key={key} className="h-96 w-full" />)}</SkeletonBlock>}
      {fleet.isError && <ErrorState message={fleet.error.message} onRetry={() => { void fleet.refetch(); }} />}
      {!fleet.isPending && !fleet.isError && !filteredVehicles.length && <p role="status" className="py-8 text-center text-sm text-ink-2">Không có phương tiện phù hợp trong danh sách gợi ý.</p>}
      {/* Vehicles Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="group rounded-3xl bg-surface border border-line-strong overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] transition-all duration-300"
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
                <span className="px-2.5 py-1 rounded-lg bg-stage-ink text-white text-xs font-mono font-bold tracking-wider">
                  {vehicle.categoryName}
                </span>

                {vehicle.hasDriverOption && (
                  <span className="px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-mono font-bold tracking-wider shadow-sm">
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
                <p className="text-xs text-ink-3 mb-5">
                  {vehicle.brand} {vehicle.model}{vehicle.vehicle.year ? ` · Đời ${vehicle.vehicle.year}` : ""}
                </p>

                {/* Specs Matrix */}
                <div className="grid grid-cols-2 gap-3 mb-6 p-3.5 rounded-2xl bg-surface-raised text-xs">
                  <div className="flex items-center gap-2 text-ink-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span>{vehicle.seats ? `${vehicle.seats} Chỗ ngồi` : "Chưa có số chỗ"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-ink-2">
                    <Gauge className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">{vehicle.transmission}</span>
                  </div>

                  <div className="flex items-center gap-2 text-ink-2">
                    {vehicle.isElectric ? (
                      <BatteryCharging className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Fuel className="w-3.5 h-3.5 text-primary-graphic" />
                    )}
                    <span className="truncate">{vehicle.powerFuel}</span>
                  </div>

                  <div className="flex items-center gap-2 text-ink-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
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
                  variant="amber-hero"
                  size="sm"
                  className="px-4 py-2 font-bold flex items-center gap-1.5"
                >
                  <span>Đặt xe</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
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
