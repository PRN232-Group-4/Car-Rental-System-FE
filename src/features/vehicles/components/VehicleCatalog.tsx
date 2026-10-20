"use client";

import { useState, useEffect } from "react";
import VehicleImage from "@/components/ui/VehicleImage";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
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
  const [loading, setLoading] = useState<boolean>(() => getInitialVehicles().length === 0);
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
      })
      .finally(() => { if (!ignore) setLoading(false); });
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
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-td-rule pb-4">
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
            className={`px-4 py-2.5 rounded text-xs sm:text-sm font-bold transition-all cursor-pointer select-none active:scale-[0.98] flex items-center gap-2 ${
              selectedCategory === tab.id
                ? "bg-primary text-white"
                : "bg-td-white hover:bg-td-chalk text-td-ink hover:text-td-ink border border-td-rule"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-xs uppercase font-mono tracking-wider px-1.5 py-0.5 rounded ${
                selectedCategory === tab.id
                  ? "bg-td-white/20 text-white"
                  : "bg-td-chalk text-td-muted"
              }`}
            >
              {tab.tag}
            </span>
          </button>
        ))}

        <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-td-ink font-medium bg-td-white border border-td-rule px-3.5 py-1.5 rounded-full">
          <Filter className="w-3.5 h-3.5 text-primary" />
          <span>
            Hiển thị <strong className="font-mono text-td-ink">{filteredVehicles.length}</strong> xe khả dụng
          </span>
        </div>
      </div>

      {/* Loading Skeleton state */}
      {loading && (
        <SkeletonBlock label="Đang tải danh sách phương tiện" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="glass-lite rounded overflow-hidden flex flex-col border border-td-rule"
            >
              <Skeleton className="h-64 w-full rounded-none" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </SkeletonBlock>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-8 rounded bg-danger-bg border border-danger/30 text-center max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <h4 className="text-base font-bold text-td-ink">Không thể tải danh sách phương tiện</h4>
          <p className="text-xs text-td-ink">{error}</p>
          <Button onClick={handleRetry} variant="secondary" size="sm">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredVehicles.length === 0 && (
        <div className="p-12 rounded bg-td-white border border-td-rule text-center max-w-md mx-auto space-y-4">
          <Car className="w-12 h-12 text-td-muted mx-auto stroke-1" />
          <h4 className="text-lg font-bold text-td-ink">Không tìm thấy xe phù hợp</h4>
          <p className="text-xs sm:text-sm text-td-ink">
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
              className="glass-lite glass-lift rounded overflow-hidden flex flex-col group border border-td-rule hover:shadow-e2 transition-all duration-300"
            >
              {/* Image Container with height >= 60% of card per spec */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stage-ink">
                <VehicleImage
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="h-full w-full"
                  imageClassName="group-hover:scale-105 transition-transform duration-700 ease-out"
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

                <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1.5 bg-stage-ink/90 px-3 py-1 rounded-full border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{vehicle.facilityName}</span>
                </div>
              </div>

              {/* Vehicle Card Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between bg-td-white">
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

                  <h3 className="font-display text-xl font-bold text-td-ink group-hover:text-primary transition-colors mb-3.5 line-clamp-1">
                    {vehicle.name}
                  </h3>

                  {/* Technical specifications */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-td-ink py-3 mb-4 bg-td-paper rounded px-3 border border-td-rule">
                    {vehicle.seats && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-td-muted" />
                        <span>{vehicle.seats} chỗ ngồi</span>
                      </div>
                    )}

                    {vehicle.transmission && (
                      <div className="flex items-center gap-1.5">
                        <Cog className="w-3.5 h-3.5 text-td-muted" />
                        <span className="truncate">{vehicle.transmission}</span>
                      </div>
                    )}

                    {vehicle.fuelType && (
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-td-muted" />
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
                        <Gauge className="w-3.5 h-3.5 text-td-muted" />
                        <span>Cốp {vehicle.storageCapacity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-3 border-t border-td-rule">
                  <div className="flex items-baseline justify-between mb-3.5">
                    <div>
                      <span className="font-mono text-2xl font-black text-primary tracking-tight">
                        {formatVND(vehicle.hourlyPrice)}
                      </span>
                      <span className="text-xs font-semibold text-td-muted"> / giờ</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-td-ink">
                        {formatVND(vehicle.monthlyPrice)}
                      </span>
                      <span className="text-xs text-td-muted block">/ tháng</span>
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
