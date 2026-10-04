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

  return (
    <section id="danh-sach-xe" className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <SectionHeading
          kicker="Đội xe được yêu thích"
          title="Khám phá phương tiện cho mọi cung đường"
          subtitle="100% xe do hệ thống sở hữu, bảo dưỡng chính hãng, kèm biên bản kiểm định 2 chiều chi tiết trước khi lăn bánh."
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-border pb-4">
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
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? "bg-primary text-white shadow-elevation-1"
                : "bg-surface hover:bg-surface-elevated text-ink-muted hover:text-ink border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-ink-muted font-medium bg-surface border border-border px-3 py-1 rounded-full">
          <Filter className="w-3.5 h-3.5 text-primary" />
          <span>Hiển thị {filteredVehicles.length} xe khả dụng</span>
        </div>
      </div>

      {/* Loading Skeleton state (opacity pulse, strictly no shimmer gradient per A11) */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="glass-lite rounded-3xl overflow-hidden flex flex-col border border-border animate-pulse"
            >
              <div className="h-64 w-full bg-border-dim" />
              <div className="p-6 space-y-4">
                <div className="h-4 bg-border-dim rounded w-1/3" />
                <div className="h-6 bg-border-dim rounded w-3/4" />
                <div className="h-10 bg-border-dim rounded w-full" />
                <div className="h-10 bg-border-dim rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h4 className="text-base font-bold text-ink">Không thể tải danh sách phương tiện</h4>
          <p className="text-xs text-ink-muted">{error}</p>
          <Button onClick={handleRetry} variant="secondary" size="sm">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredVehicles.length === 0 && (
        <div className="p-12 rounded-3xl bg-surface border border-border text-center max-w-md mx-auto space-y-4">
          <Car className="w-12 h-12 text-ink-subtle mx-auto stroke-1" />
          <h4 className="text-lg font-bold text-ink">Không tìm thấy xe phù hợp</h4>
          <p className="text-xs sm:text-sm text-ink-muted">
            Vui lòng thử chọn phân khúc hoặc chi nhánh nhận xe khác.
          </p>
          <Button onClick={() => setSelectedCategory("all")} variant="secondary" size="sm">
            Xem tất cả xe
          </Button>
        </div>
      )}

      {/* Vehicle Grid - Strictly .glass-lite (NO BLUR per A4.4 budget) */}
      {!loading && !error && filteredVehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="glass-lite rounded-3xl overflow-hidden flex flex-col group border border-border shadow-elevation-1 hover:shadow-elevation-2 transition-shadow"
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
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stage-ink/85 text-white border border-border-dim"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1.5 bg-stage-ink/85 px-3 py-1 rounded-full border border-border-dim">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{vehicle.facilityName}</span>
                </div>
              </div>

              {/* Vehicle Card Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between bg-surface">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-primary">
                      {vehicle.categoryLabel} · Đời {vehicle.year}
                    </span>
                    <span className="text-xs text-primary font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sẵn sàng</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-ink group-hover:text-primary transition-colors mb-3 line-clamp-1">
                    {vehicle.name}
                  </h3>

                  {/* Technical specifications */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted py-2.5 mb-4 bg-canvas rounded-xl px-3 border border-border">
                    {vehicle.seats && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-ink-subtle" />
                        <span>{vehicle.seats} chỗ ngồi</span>
                      </div>
                    )}

                    {vehicle.transmission && (
                      <div className="flex items-center gap-1.5">
                        <Cog className="w-3.5 h-3.5 text-ink-subtle" />
                        <span className="truncate">{vehicle.transmission}</span>
                      </div>
                    )}

                    {vehicle.fuelType && (
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-ink-subtle" />
                        <span>{vehicle.fuelType}</span>
                      </div>
                    )}

                    {vehicle.batteryCapacity && (
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
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
                        <Gauge className="w-3.5 h-3.5 text-ink-subtle" />
                        <span>Cốp {vehicle.storageCapacity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-xl font-extrabold text-primary">
                        {vehicle.hourlyPrice.toLocaleString("vi-VN")} đ
                      </span>
                      <span className="text-xs text-ink-subtle"> / giờ</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-ink-muted">
                        {vehicle.monthlyPrice.toLocaleString("vi-VN")} đ
                      </span>
                      <span className="text-xs text-ink-subtle block">/ tháng</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setSelectedVehicleForBooking(vehicle)}
                    variant="primary"
                    className="w-full justify-center"
                  >
                    <span>Đặt xe ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
