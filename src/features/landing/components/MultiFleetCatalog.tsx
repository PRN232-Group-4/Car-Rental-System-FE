"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Car, 
  Bike, 
  Zap, 
  Fuel, 
  Users, 
  Gauge, 
  ArrowUpRight, 
  ShieldCheck, 
  UserCheck, 
  SlidersHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import BookingModal from "@/features/rentals/components/BookingModal";
import type { Vehicle, VehicleCategory } from "@/features/vehicles/types";

interface FleetVehicle {
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

const FLEET_DATA: FleetVehicle[] = [
  // 1. Ô tô điện
  {
    id: "vf8-plus",
    name: "VinFast VF 8 Plus",
    brand: "VinFast",
    model: "VF 8",
    category: "electric_car",
    categoryName: "Ô tô điện",
    isElectric: true,
    hasDriverOption: true,
    seats: 5,
    transmission: "Tự động điện tử",
    powerFuel: "Pin 87.7 kWh · 402 hp",
    rangeOrEfficiency: "471 km (WLTP)",
    hourlyPrice: 160000,
    monthlyPrice: 19500000,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop",
    badges: ["100% THUẦN ĐIỆN", "ADAS CẤP 2+", "CÓ TÀI XẾ"],
  },
  {
    id: "taycan-4s",
    name: "Porsche Taycan 4S",
    brand: "Porsche",
    model: "Taycan 4S",
    category: "electric_car",
    categoryName: "Ô tô điện",
    isElectric: true,
    hasDriverOption: true,
    seats: 5,
    transmission: "Tự động 2 cấp",
    powerFuel: "Pin 93.4 kWh · 522 hp",
    rangeOrEfficiency: "450 km (WLTP)",
    hourlyPrice: 380000,
    monthlyPrice: 42000000,
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop",
    badges: ["SIÊU XE ĐIỆN", "TREO KHÍ NÉN", "CÓ TÀI XẾ"],
  },
  // 2. Ô tô xăng cao cấp
  {
    id: "mercedes-c200",
    name: "Mercedes-Benz C200 Avantgarde",
    brand: "Mercedes-Benz",
    model: "C200",
    category: "car",
    categoryName: "Ô tô xăng",
    isElectric: false,
    hasDriverOption: true,
    seats: 5,
    transmission: "Tự động 9G-TRONIC",
    powerFuel: "1.5L Turbo Mild-Hybrid",
    rangeOrEfficiency: "6.5L / 100km",
    hourlyPrice: 180000,
    monthlyPrice: 22000000,
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop",
    badges: ["SEDAN HẠNG SANG", "CHÍNH CHỦ", "CÓ TÀI XẾ"],
  },
  {
    id: "cx5-premium",
    name: "Mazda CX-5 Premium Exclusive",
    brand: "Mazda",
    model: "CX-5",
    category: "car",
    categoryName: "Ô tô xăng",
    isElectric: false,
    hasDriverOption: false,
    seats: 5,
    transmission: "Tự động 6 cấp",
    powerFuel: "2.0L SkyActiv-G",
    rangeOrEfficiency: "7.1L / 100km",
    hourlyPrice: 130000,
    monthlyPrice: 16000000,
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop",
    badges: ["SUV GIA ĐÌNH", "LOA BOSE", "TỰ LÁI"],
  },
  // 3. Xe máy điện thông minh
  {
    id: "datbike-weaver",
    name: "Dat Bike Weaver++ Fast-Charge",
    brand: "Dat Bike",
    model: "Weaver++",
    category: "electric_motorbike",
    categoryName: "Xe máy điện",
    isElectric: true,
    hasDriverOption: false,
    seats: 2,
    transmission: "Tự động điện",
    powerFuel: "Động cơ điện 7000W",
    rangeOrEfficiency: "200 km / lần sạc",
    hourlyPrice: 35000,
    monthlyPrice: 2800000,
    imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop",
    badges: ["SẠC NHANH 20P", "PIN CHỐNG NƯỚC", "TỰ LÁI"],
  },
  // 4. Xe máy xăng đô thị
  {
    id: "sh150i-abs",
    name: "Honda SH 150i ABS Sport",
    brand: "Honda",
    model: "SH 150i",
    category: "motorbike",
    categoryName: "Xe máy xăng",
    isElectric: false,
    hasDriverOption: false,
    seats: 2,
    transmission: "Vô cấp CVT",
    powerFuel: "Động cơ eSP+ 157cc",
    rangeOrEfficiency: "2.2L / 100km",
    hourlyPrice: 40000,
    monthlyPrice: 3200000,
    imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1000&auto=format&fit=crop",
    badges: ["PHANH ABS 2 KÊNH", "SMARTKEY", "TỰ LÁI"],
  },
];

type CategoryFilter = "all" | "electric_car" | "car" | "electric_motorbike" | "motorbike";

export default function MultiFleetCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [onlyDriverOption, setOnlyDriverOption] = useState<boolean>(false);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);

  const filteredVehicles = FLEET_DATA.filter((v) => {
    if (selectedCategory !== "all" && v.category !== selectedCategory) return false;
    if (onlyDriverOption && !v.hasDriverOption) return false;
    return true;
  });

  const handleBookVehicle = (v: FleetVehicle) => {
    const mockVehicle: Vehicle = {
      id: v.id,
      name: v.name,
      category: v.category,
      categoryLabel: v.categoryName,
      brand: v.brand,
      model: v.model,
      year: 2026,
      seats: v.seats,
      transmission: v.transmission,
      fuelType: v.isElectric ? "Thuần điện 100%" : "Xăng cao cấp",
      hourlyPrice: v.hourlyPrice,
      monthlyPrice: v.monthlyPrice,
      supportsSubscription: true,
      facilityId: "fac-q1",
      facilityName: "Smart EV Hub Quận 1",
      imageUrl: v.imageUrl,
      status: "available",
      isAvailable: true,
      badges: v.badges,
    };
    setSelectedVehicleForBooking(mockVehicle);
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫/giờ";
  };

  return (
    <section id="doi-xe" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-600/20 text-[#b45309] text-xs font-mono font-bold tracking-wider uppercase mb-3.5">
            <SlidersHorizontal className="w-4 h-4 text-[#b45309]" />
            <span>ĐỘI XE ĐA PHƯƠNG TIỆN CHÍNH CHỦ</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-ink tracking-tight">
            Danh Mục Phương Tiện Toàn Diện
          </h2>
        </div>
        <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed">
          Đầy đủ 4 nhóm phương tiện đạt tiêu chuẩn kiểm định 2 chiều khắt khe: Ô tô & Xe máy, Xăng & Điện, Tự lái & Kèm tài xế riêng.
        </p>
      </div>

      {/* Filter Tabs & Chauffeur Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-line">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#0f172a] text-white shadow-e2"
                : "bg-surface hover:bg-[#f2f2ee] text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            Tất cả ({FLEET_DATA.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("electric_car")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === "electric_car"
                ? "bg-[#0f172a] text-white shadow-e2"
                : "bg-surface hover:bg-[#f2f2ee] text-ink-2 hover:text-ink border border-line-strong"
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
                ? "bg-[#0f172a] text-white shadow-e2"
                : "bg-surface hover:bg-[#f2f2ee] text-ink-2 hover:text-ink border border-line-strong"
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
                ? "bg-[#0f172a] text-white shadow-e2"
                : "bg-surface hover:bg-[#f2f2ee] text-ink-2 hover:text-ink border border-line-strong"
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
                ? "bg-[#0f172a] text-white shadow-e2"
                : "bg-surface hover:bg-[#f2f2ee] text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Xe máy xăng</span>
          </button>
        </div>

        {/* Chauffeur Toggle */}
        <label className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface border border-line-strong cursor-pointer select-none text-xs sm:text-sm font-bold text-ink">
          <input
            type="checkbox"
            checked={onlyDriverOption}
            onChange={(e) => setOnlyDriverOption(e.target.checked)}
            className="w-4 h-4 rounded text-[#b45309] accent-[#b45309] cursor-pointer"
          />
          <UserCheck className="w-4 h-4 text-[#b45309]" />
          <span>Chỉ xe có tài xế riêng</span>
        </label>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="group rounded-3xl bg-surface border border-line-strong overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] transition-all duration-300"
          >
            {/* Image Container (>= 60% visually balanced) */}
            <div className="relative w-full h-56 overflow-hidden bg-[#f2f2ee]">
              <Image
                src={vehicle.imageUrl}
                alt={vehicle.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-[#0f172a] text-white text-[11px] font-mono font-bold tracking-wider">
                  {vehicle.categoryName}
                </span>

                {vehicle.hasDriverOption && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-mono font-bold tracking-wider shadow-sm">
                    KÈM TÀI XẾ
                  </span>
                )}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-ink mb-1 group-hover:text-[#b45309] transition-colors">
                  {vehicle.name}
                </h3>
                <p className="text-xs text-ink-3 mb-5">
                  {vehicle.brand} {vehicle.model} · Đời 2026
                </p>

                {/* Specs Matrix */}
                <div className="grid grid-cols-2 gap-3 mb-6 p-3.5 rounded-2xl bg-[#f7f7f4] text-xs">
                  <div className="flex items-center gap-2 text-ink-2">
                    <Users className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>{vehicle.seats} Chỗ ngồi</span>
                  </div>

                  <div className="flex items-center gap-2 text-ink-2">
                    <Gauge className="w-3.5 h-3.5 text-[#b45309]" />
                    <span className="truncate">{vehicle.transmission}</span>
                  </div>

                  <div className="flex items-center gap-2 text-ink-2">
                    {vehicle.isElectric ? (
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Fuel className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span className="truncate">{vehicle.powerFuel}</span>
                  </div>

                  <div className="flex items-center gap-2 text-ink-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#b45309]" />
                    <span className="truncate">{vehicle.rangeOrEfficiency}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-line flex items-center justify-between">
                <div>
                  <div className="font-mono text-xl font-black text-ink">
                    {formatVND(vehicle.hourlyPrice)}
                  </div>
                  <div className="text-[11px] text-ink-3">
                    Thuê tháng: {new Intl.NumberFormat("vi-VN").format(vehicle.monthlyPrice)} ₫
                  </div>
                </div>

                <Button
                  onClick={() => handleBookVehicle(vehicle)}
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
