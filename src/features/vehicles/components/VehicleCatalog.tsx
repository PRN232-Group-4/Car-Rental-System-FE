"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Cog,
  Fuel,
  Zap,
  BatteryCharging,
  Gauge,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { getVehicles, getInitialVehicles } from "../api";
import type { Vehicle } from "../types";
import { BookingModal } from "@/features/rentals";
import RevealText from "@/components/ui/RevealText";

interface VehicleCatalogProps {
  filterFacilityId?: string;
}

export default function VehicleCatalog({ filterFacilityId = "all" }: VehicleCatalogProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(getInitialVehicles());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);

  useEffect(() => {
    getVehicles().then(setVehicles);
  }, []);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesCategory =
      selectedCategory === "all" || vehicle.category === selectedCategory;
    const matchesFacility =
      filterFacilityId === "all" ||
      filterFacilityId === "delivery" ||
      vehicle.facilityId === filterFacilityId;
    return matchesCategory && matchesFacility;
  });

  return (
    <section id="danh-sach-xe" className="py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#059669] mb-2 block">
            Đội xe được yêu thích
          </span>
          <RevealText
            as="h2"
            text="Khám phá phương tiện cho mọi cung đường"
            className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight"
          />
        </div>
        <p className="max-w-md text-sm sm:text-base text-neutral-600 leading-relaxed">
          100% xe do hệ thống sở hữu, bảo dưỡng chính hãng, kèm biên bản kiểm định 2 chiều chi tiết trước khi lăn bánh.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-10 border-b border-white/60 pb-4">
        {[
          { id: "all", label: "Tất cả phương tiện" },
          { id: "car", label: "Ô tô xăng" },
          { id: "electric_car", label: "Ô tô điện" },
          { id: "motorbike", label: "Xe máy xăng" },
          { id: "electric_motorbike", label: "Xe máy điện" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              selectedCategory === tab.id
                ? "bg-[#059669] text-white shadow-md shadow-[#059669]/30 border border-emerald-400/30"
                : "glass-pill text-neutral-700 hover:text-neutral-900 hover:bg-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-neutral-600 font-medium glass-pill px-3 py-1 rounded-full">
          <Filter className="w-3.5 h-3.5 text-[#059669]" />
          <span>Hiển thị {filteredVehicles.length} xe khả dụng</span>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="reveal-group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="glass-card glass-hover specular-border rounded-3xl overflow-hidden flex flex-col group"
          >
            {/* Image Container with Hover Scale */}
            <div className="relative h-56 w-full overflow-hidden bg-emerald-950/20">
              <Image
                src={vehicle.imageUrl}
                alt={vehicle.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {vehicle.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-xl text-white border border-white/20 shadow-xs"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1.5 bg-black/45 backdrop-blur-xl px-3 py-1 rounded-full border border-white/20">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{vehicle.facilityName}</span>
              </div>
            </div>

            {/* Vehicle Card Body */}
            <div className="p-6 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-[#059669]">
                    {vehicle.categoryLabel} · Đời {vehicle.year}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sẵn sàng</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#059669] transition-colors mb-3 line-clamp-1">
                  {vehicle.name}
                </h3>

                {/* Technical Specifications with Frosted Glass background */}
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700 py-3 mb-4 glass-sub rounded-2xl px-3.5 shadow-xs">
                  {vehicle.seats && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{vehicle.seats} chỗ ngồi</span>
                    </div>
                  )}

                  {vehicle.transmission && (
                    <div className="flex items-center gap-1.5">
                      <Cog className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="truncate">{vehicle.transmission}</span>
                    </div>
                  )}

                  {vehicle.fuelType && (
                    <div className="flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{vehicle.fuelType}</span>
                    </div>
                  )}

                  {vehicle.batteryCapacity && (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{vehicle.batteryCapacity}</span>
                    </div>
                  )}

                  {vehicle.maxRange && (
                    <div className="flex items-center gap-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="truncate">{vehicle.maxRange}</span>
                    </div>
                  )}

                  {vehicle.storageCapacity && (
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Cốp {vehicle.storageCapacity}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="pt-2">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-xl font-extrabold text-[#059669]">
                      {vehicle.hourlyPrice.toLocaleString("vi-VN")} đ
                    </span>
                    <span className="text-xs text-neutral-500"> / giờ</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-neutral-700">
                      {vehicle.monthlyPrice.toLocaleString("vi-VN")} đ
                    </span>
                    <span className="text-[11px] text-neutral-400 block">/ tháng</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVehicleForBooking(vehicle)}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-[#059669] text-white text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer shadow-sm hover:shadow-md hover:shadow-[#059669]/20"
                >
                  <span>Đặt xe ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for transparent booking calculation */}
      {selectedVehicleForBooking && (
        <BookingModal
          vehicle={selectedVehicleForBooking}
          onClose={() => setSelectedVehicleForBooking(null)}
        />
      )}
    </section>
  );
}
