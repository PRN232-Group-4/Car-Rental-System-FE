"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VehicleImage from "@/components/ui/VehicleImage";
import { BookingModal } from "@/features/rentals";
import { getVehicles, getInitialVehicles } from "@/features/vehicles/api";
import type { Vehicle } from "@/features/vehicles/types";
import { getFacilities, getInitialFacilities } from "@/features/facilities/api";
import type { Facility } from "@/features/facilities/types";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Search,
  MapPin,
  Car,
  Zap,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

export default function FindPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-canvas text-ink flex items-center justify-center p-6">
          <p className="text-sm font-semibold text-ink-3">Đang tải danh sách phương tiện...</p>
        </div>
      }
    >
      <FindContent />
    </Suspense>
  );
}

function FindContent() {
  const searchParams = useSearchParams();

  const initialMode = searchParams.get("mode") === "longterm" ? "longterm" : "hourly";
  const initialFacility = searchParams.get("facilityId") || "all";
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
  const initialStartDate = searchParams.get("startDate") || "";
  const initialStartTime = searchParams.get("startTime") || "";
  const initialEndDate = searchParams.get("endDate") || "";
  const initialEndTime = searchParams.get("endTime") || "";

  const [mode, setMode] = useState<"hourly" | "longterm">(initialMode);
  const [selectedFacility, setSelectedFacility] = useState<string>(initialFacility);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [keyword, setKeyword] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<"recommended" | "price-asc" | "price-desc" | "newest">("recommended");

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getInitialVehicles());
  const [facilities, setFacilities] = useState<Facility[]>(() => getInitialFacilities());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    getFacilities()
      .then(setFacilities)
      .catch(() => {});
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVehicles({
        facilityId: selectedFacility !== "all" ? selectedFacility : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: keyword.trim() || undefined,
      });
      setVehicles(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách phương tiện.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [selectedFacility, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadData();
  };

  const handleResetFilters = () => {
    setSelectedFacility("all");
    setSelectedCategory("all");
    setKeyword("");
    setSortBy("recommended");
  };

  const filteredAndSortedVehicles = useMemo(() => {
    let list = [...vehicles];

    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.brand?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q) ||
          v.categoryLabel.toLowerCase().includes(q) ||
          v.facilityName.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => (mode === "hourly" ? a.hourlyPrice - b.hourlyPrice : a.monthlyPrice - b.monthlyPrice));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (mode === "hourly" ? b.hourlyPrice - a.hourlyPrice : b.monthlyPrice - a.monthlyPrice));
    } else if (sortBy === "newest") {
      list.sort((a, b) => b.year - a.year);
    }

    return list;
  }, [vehicles, keyword, sortBy, mode]);

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val) + " ₫";
  };

  const buildDetailUrl = (v: Vehicle) => {
    const params = new URLSearchParams();
    params.set("id", String(v.id));
    if (mode) params.set("mode", mode);
    if (selectedFacility && selectedFacility !== "all") params.set("facilityId", selectedFacility);
    if (initialStartDate) params.set("startDate", initialStartDate);
    if (initialStartTime) params.set("startTime", initialStartTime);
    if (initialEndDate) params.set("endDate", initialEndDate);
    if (initialEndTime) params.set("endTime", initialEndTime);
    return `/vehicles/detail?${params.toString()}`;
  };

  const buildBookingUrl = (v: Vehicle) => {
    const params = new URLSearchParams();
    params.set("vehicleId", String(v.id));
    params.set("mode", mode);
    if (selectedFacility && selectedFacility !== "all") params.set("facilityId", selectedFacility);
    if (initialStartDate && initialStartTime) {
      params.set("startTime", `${initialStartDate}T${initialStartTime}`);
    }
    if (initialEndDate && initialEndTime) {
      params.set("endTime", `${initialEndDate}T${initialEndTime}`);
    }
    return `/booking?${params.toString()}`;
  };

  return (
    <div className="min-h-dvh bg-canvas text-ink flex flex-col selection:bg-primary/20 selection:text-warning">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Hero */}
        <div className="mb-8 border-b border-line pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-ink tracking-tight text-balance">
                Tìm Xe & Khám Phá Phương Tiện
              </h1>
              <p className="mt-1 text-sm text-ink-3 text-pretty">
                100% xe kiểm định chính chủ, bàn giao nhanh chóng và hoàn cọc minh bạch.
              </p>
            </div>

            {/* Hourly vs Longterm Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-line shrink-0">
              <button
                type="button"
                onClick={() => setMode("hourly")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === "hourly"
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-3 hover:text-ink hover:bg-sunken"
                }`}
              >
                Thuê theo giờ
              </button>
              <button
                type="button"
                onClick={() => setMode("longterm")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === "longterm"
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-3 hover:text-ink hover:bg-sunken"
                }`}
              >
                Thuê dài hạn
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-line shadow-e1 mb-8 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên xe, hãng, dòng xe..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-sunken text-base sm:text-xs font-semibold text-ink border border-line outline-none focus:border-primary focus:bg-surface transition-all"
              />
            </div>

            {/* Branch Filter */}
            <div className="sm:col-span-4 relative">
              <MapPin className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-sunken text-xs font-semibold text-ink border border-line outline-none focus:border-primary focus:bg-surface transition-all appearance-none cursor-pointer"
              >
                <option value="all">Tất cả chi nhánh</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-ink-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Submit & Reset Buttons */}
            <div className="sm:col-span-3 flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="flex-1 min-h-[38px] text-xs font-bold"
              >
                <Search className="w-3.5 h-3.5 mr-1" />
                <span>Tìm kiếm</span>
              </Button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 min-h-[38px] rounded-xl bg-sunken hover:bg-canvas text-ink-3 hover:text-ink text-xs font-semibold border border-line transition-colors cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                Đặt lại
              </button>
            </div>
          </form>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line">
            {[
              { id: "all", label: "Tất cả loại xe" },
              { id: "car", label: "Ô tô xăng" },
              { id: "electric_car", label: "Ô tô điện" },
              { id: "motorbike", label: "Xe máy xăng" },
              { id: "electric_motorbike", label: "Xe máy điện" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-stage-ink text-white shadow-sm"
                    : "bg-sunken hover:bg-canvas text-ink-2 hover:text-ink border border-line"
                }`}
              >
                {cat.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2 text-xs text-ink-3 font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>Sắp xếp:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-sunken pl-2.5 pr-7 py-1 rounded-lg text-xs font-bold text-ink border border-line outline-none cursor-pointer appearance-none"
                >
                  <option value="recommended">Đề xuất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="newest">Đời xe mới nhất</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-ink-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Results State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-surface border border-line space-y-4">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-2 flex justify-between">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-8 w-1/4 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-danger-bg border border-danger/30 text-center space-y-3">
            <p className="text-sm font-semibold text-danger">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => void loadData()}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Thử lại</span>
            </Button>
          </div>
        ) : filteredAndSortedVehicles.length === 0 ? (
          <div className="p-12 rounded-2xl bg-surface border border-line text-center space-y-4 max-w-lg mx-auto">
            <Car className="w-12 h-12 text-ink-3 mx-auto" />
            <h3 className="text-base font-bold text-ink">Không tìm thấy phương tiện phù hợp</h3>
            <p className="text-xs text-ink-3 leading-relaxed">
              Hãy thử chọn chi nhánh khác, đổi loại xe hoặc tìm kiếm bằng từ khóa chung hơn.
            </p>
            <Button variant="primary" size="sm" onClick={handleResetFilters}>
              <span>Xóa bộ lọc & xem tất cả xe</span>
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 px-1 text-xs text-ink-3 font-semibold">
              <span>Tìm thấy {filteredAndSortedVehicles.length} phương tiện khả dụng</span>
              {selectedFacility !== "all" && (
                <span>
                  Tại chi nhánh: {facilities.find((f) => f.id === selectedFacility)?.name || selectedFacility}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedVehicles.map((vehicle) => {
                const isElectric = vehicle.category.includes("electric");
                return (
                  <article
                    key={vehicle.id}
                    className="flex flex-col justify-between rounded-2xl bg-surface border border-line overflow-hidden shadow-e1 hover:shadow-e2 hover:border-primary/40 transition-all duration-200 group"
                  >
                    <div>
                      {/* Vehicle Image Container */}
                      <div className="relative h-48 w-full bg-sunken overflow-hidden">
                        <VehicleImage
                          src={vehicle.imageUrl}
                          alt={vehicle.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-stage-ink text-white border border-white/20 shadow-xs">
                            {vehicle.categoryLabel}
                          </span>
                          {isElectric && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-primary text-white shadow-sm flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              <span>100% ĐIỆN</span>
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-md text-[11px] font-bold bg-surface text-ink border border-line shadow-xs">
                          Đời {vehicle.year}
                        </div>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-5">
                        <h2 className="text-base font-bold text-ink group-hover:text-primary transition-colors leading-snug text-balance">
                          {vehicle.name}
                        </h2>

                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-ink-3">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{vehicle.facilityName}</span>
                        </div>

                        {/* Specs Pills */}
                        <div className="mt-3.5 pt-3.5 border-t border-line grid grid-cols-3 gap-2 text-center text-xs">
                          {vehicle.seats ? (
                            <div className="p-2 rounded-xl bg-sunken">
                              <span className="text-[10px] text-ink-3 block font-medium">Chỗ ngồi</span>
                              <span className="font-bold text-ink">{vehicle.seats} chỗ</span>
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-sunken">
                              <span className="text-[10px] text-ink-3 block font-medium">Truyền động</span>
                              <span className="font-bold text-ink">{vehicle.transmission}</span>
                            </div>
                          )}

                          <div className="p-2 rounded-xl bg-sunken">
                            <span className="text-[10px] text-ink-3 block font-medium">Năng lượng</span>
                            <span className="font-bold text-ink truncate block">
                              {vehicle.batteryCapacity || vehicle.fuelType || "Tiêu chuẩn"}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-sunken">
                            <span className="text-[10px] text-ink-3 block font-medium">Kiểm định</span>
                            <span className="font-bold text-primary">ĐẠT CHUẨN</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing & CTAs */}
                    <div className="p-5 pt-0 mt-3 border-t border-line/60">
                      <div className="flex items-baseline justify-between py-3">
                        <span className="text-xs font-semibold text-ink-3">Giá niêm yết:</span>
                        <div className="text-right">
                          <span className="font-mono text-lg font-black text-primary tabular-nums">
                            {formatVND(mode === "hourly" ? vehicle.hourlyPrice : vehicle.monthlyPrice)}
                          </span>
                          <span className="text-xs text-ink-3 font-semibold">
                            {mode === "hourly" ? " / giờ" : " / tháng"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href={buildDetailUrl(vehicle)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sunken hover:bg-canvas text-ink text-xs font-bold border border-line transition-all text-center"
                        >
                          <span>Xem chi tiết</span>
                        </Link>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setBookingVehicle(vehicle)}
                          className="flex items-center justify-center gap-1 text-xs font-bold shadow-sm"
                        >
                          <span>Đặt xe ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingVehicle && (
        <BookingModal
          vehicle={bookingVehicle}
          onClose={() => setBookingVehicle(null)}
        />
      )}

      <Footer />
    </div>
  );
}
