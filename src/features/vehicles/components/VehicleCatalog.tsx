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
  Car,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getVehicles, getInitialVehicles } from "../api";
import type { Vehicle } from "../types";
import { BookingModal } from "@/features/rentals";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

interface VehicleCatalogProps {
  filterFacilityId?: string;
}

export default function VehicleCatalog({ filterFacilityId = "all" }: VehicleCatalogProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(getInitialVehicles());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);

  useEffect(() => {
    let ignore = false;
    getVehicles()
      .then((data) => {
        if (!ignore) {
          setVehicles(data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Không thể tải danh sách xe");
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    getVehicles()
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Không thể tải danh sách xe");
        setLoading(false);
      });
  };

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

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  return (
    <section id="danh-sach-xe" className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <SectionHeading
          kicker="ALL-ELECTRIC FLEET"
          title="Khám phá phương tiện cho mọi cung đường"
          subtitle="100% xe thuần điện chính chủ hệ thống, kiểm định pin và thân vỏ 2 chiều chi tiết trước khi lăn bánh."
        />
      </div>

      {/* Category Tabs with Bilingual Tech Micro-Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-line pb-4">
        {[
          { id: "all", label: "Tất cả phương tiện", tag: "ALL" },
          { id: "car", label: "Ô tô tiêu chuẩn", tag: "STANDARD" },
          { id: "electric_car", label: "Ô tô điện", tag: "EV CAR" },
          { id: "motorbike", label: "Xe máy tiêu chuẩn", tag: "MOTO" },
          { id: "electric_motorbike", label: "Xe máy điện", tag: "EV MOTO" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none active:scale-[0.98] flex items-center gap-2 ${
              selectedCategory === tab.id
                ? "bg-primary text-white shadow-e1"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-xs uppercase font-mono tracking-wider px-1.5 py-0.5 rounded ${
                selectedCategory === tab.id
                  ? "bg-surface/20 text-white"
                  : "bg-sunken text-ink-3"
              }`}
            >
              {tab.tag}
            </span>
          </button>
        ))}

        <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-ink-2 font-medium bg-surface border border-line px-3.5 py-1.5 rounded-full shadow-e1">
          <Filter className="w-3.5 h-3.5 text-primary" />
          <span>
            Hiển thị <strong className="font-mono text-ink">{filteredVehicles.length}</strong> xe khả dụng
          </span>
        </div>
      </div>

      {/* Loading Skeleton state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="glass-lite rounded-3xl overflow-hidden flex flex-col border border-line animate-pulse"
            >
              <div className="h-64 w-full bg-sunken" />
              <div className="p-6 space-y-4">
                <div className="h-4 bg-sunken rounded w-1/3" />
                <div className="h-6 bg-sunken rounded w-3/4" />
                <div className="h-10 bg-sunken rounded w-full" />
                <div className="h-10 bg-sunken rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-8 rounded-2xl bg-danger-bg border border-danger/30 text-center max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <h4 className="text-base font-bold text-ink">Không thể tải danh sách phương tiện</h4>
          <p className="text-xs text-ink-2">{error}</p>
          <Button onClick={handleRetry} variant="secondary" size="sm">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredVehicles.length === 0 && (
        <div className="p-12 rounded-3xl bg-surface border border-line text-center max-w-md mx-auto space-y-4">
          <Car className="w-12 h-12 text-ink-3 mx-auto stroke-1" />
          <h4 className="text-lg font-bold text-ink">Không tìm thấy xe phù hợp</h4>
          <p className="text-xs sm:text-sm text-ink-2">
            Vui lòng thử chọn phân khúc hoặc chi nhánh nhận xe khác.
          </p>
          <Button onClick={() => setSelectedCategory("all")} variant="secondary" size="sm">
            Xem tất cả xe
          </Button>
        </div>
      )}

      {/* Vehicle Grid - Strictly .glass-lite (NO BLUR per budget) */}
      {!loading && !error && filteredVehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="glass-lite glass-lift rounded-3xl overflow-hidden flex flex-col group border border-line shadow-e1 hover:shadow-e2 transition-all duration-300"
            >
              {/* Image Container with height >= 60% of card per spec */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stage-ink">
                <Image
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Badges - Solid Stage Ink, no blur per budget */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {vehicle.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stage-ink/90 text-white border border-white/10"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1.5 bg-stage-ink/90 px-3 py-1 rounded-full border border-white/10 shadow-e1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{vehicle.facilityName}</span>
                </div>
              </div>

              {/* Vehicle Card Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between bg-surface">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">
                      {vehicle.categoryLabel} · Đời {vehicle.year}
                    </span>
                    <span className="text-xs text-primary font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sẵn sàng</span>
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-ink group-hover:text-primary transition-colors mb-3.5 line-clamp-1">
                    {vehicle.name}
                  </h3>

                  {/* Technical specifications */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-ink-2 py-3 mb-4 bg-canvas rounded-xl px-3 border border-line">
                    {vehicle.seats && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-ink-3" />
                        <span>{vehicle.seats} chỗ ngồi</span>
                      </div>
                    )}

                    {vehicle.transmission && (
                      <div className="flex items-center gap-1.5">
                        <Cog className="w-3.5 h-3.5 text-ink-3" />
                        <span className="truncate">{vehicle.transmission}</span>
                      </div>
                    )}

                    {vehicle.fuelType && (
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-ink-3" />
                        <span>{vehicle.fuelType}</span>
                      </div>
                    )}

                    {vehicle.batteryCapacity && (
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        <span>{vehicle.batteryCapacity}</span>
                      </div>
                    )}

                    {vehicle.maxRange && (
                      <div className="flex items-center gap-1.5">
                        <BatteryCharging className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate">{vehicle.maxRange}</span>
                      </div>
                    )}

                    {vehicle.storageCapacity && (
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-ink-3" />
                        <span>Cốp {vehicle.storageCapacity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-3 border-t border-line">
                  <div className="flex items-baseline justify-between mb-3.5">
                    <div>
                      <span className="font-mono text-2xl font-black text-primary tracking-tight">
                        {formatVND(vehicle.hourlyPrice)}
                      </span>
                      <span className="text-xs font-semibold text-ink-3"> / giờ</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-ink-2">
                        {formatVND(vehicle.monthlyPrice)}
                      </span>
                      <span className="text-xs text-ink-3 block">/ tháng</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setSelectedVehicleForBooking(vehicle)}
                    variant="primary"
                    className="w-full justify-center group"
                  >
                    <span>Đặt xe ngay</span>
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
