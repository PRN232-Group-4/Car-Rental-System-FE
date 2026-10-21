"use client";

import React, { Suspense, useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { VehicleCard } from "@/features/vehicles/components/VehicleCard";
import { VehicleCardSkeleton } from "@/features/vehicles/components/VehicleCardSkeleton";
import { VehicleFilters } from "@/features/vehicles/components/VehicleFilters";
import { ActiveFilterChips } from "@/features/vehicles/components/ActiveFilterChips";
import { DateTimeRangePicker } from "@/components/ui/DateTimeRangePicker";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { parseSearchParams, serializeSearchParams } from "@/lib/url";
import { findFilterSchema, FindFilterState } from "./findFilterSchema";
import { getVehiclesPaginated } from "@/features/vehicles/api";
import { getFacilities } from "@/features/facilities/api";
import { useQuery } from "@tanstack/react-query";
import { VehiclePage } from "@/features/vehicles/types";
import { Search, SlidersHorizontal, ArrowUpDown, Car, RotateCcw } from "lucide-react";
import { gsap } from "@/lib/motion/register";

const CATEGORY_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "electric_car", label: "Ô tô điện" },
  { value: "car", label: "Ô tô xăng" },
  { value: "electric_motorbike", label: "Xe máy điện" },
  { value: "motorbike", label: "Xe máy xăng" },
];

const SORT_OPTIONS = [
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "year_desc", label: "Đời xe mới nhất" },
  { value: "name_asc", label: "Tên xe A — Z" },
];

function FindCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Phân tích trạng thái bộ lọc từ URL (Single Source of Truth)
  const filters: FindFilterState = useMemo(() => {
    return parseSearchParams(findFilterSchema, searchParams);
  }, [searchParams]);

  // State cục bộ cho ô tìm kiếm (để gõ mượt mà trước khi sync URL)
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [prevSearch, setPrevSearch] = useState(filters.search);
  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search);
    setSearchInput(filters.search || "");
  }

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Danh sách chi nhánh thật cho bộ lọc (không dùng dữ liệu tĩnh)
  const facilitiesQuery = useQuery({
    queryKey: ["public-facilities"],
    queryFn: getFacilities,
    staleTime: 5 * 60 * 1000,
  });
  const facilities = useMemo(() => facilitiesQuery.data ?? [], [facilitiesQuery.data]);

  // 2. Fetch danh sách xe theo bộ lọc
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<VehiclePage>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 9,
  });
  const [retryTrigger, setRetryTrigger] = useState(0);

  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setLoading(true);
    setError(null);
  }

  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const runFetch = async () => {
      try {
        const res = await getVehiclesPaginated({
          category: filters.category,
          facilityId: filters.facilityId,
          brand: filters.brand,
          seats: filters.seats,
          transmission: filters.transmission,
          fuelType: filters.fuelType,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          search: filters.search,
          sort: filters.sort,
          page: filters.page,
          pageSize: filters.pageSize,
          from: filters.startDate,
          to: filters.endDate,
          mode: filters.mode,
        });
        if (active) {
          setPageData(res);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Không thể tải danh sách phương tiện");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void runFetch();
    return () => {
      active = false;
    };
  }, [filters, retryTrigger]);

  // Hiệu ứng GSAP chuyển động mượt mà khi đổi danh sách
  useEffect(() => {
    if (loading || !gridContainerRef.current) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.fromTo(
      gridContainerRef.current.children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
    );
  }, [pageData.items, loading]);

  // 3. Hàm cập nhật bộ lọc ghi vào URL
  const updateFilters = (patch: Partial<FindFilterState>) => {
    const next: FindFilterState = { ...filters, ...patch };
    // Khi thay đổi bất kỳ tiêu chí nào khác ngoài page, tự động nhảy về trang 1
    if (!("page" in patch)) {
      next.page = 1;
    }
    const queryString = serializeSearchParams(next as unknown as Record<string, unknown>);
    router.push(`/find${queryString}`, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const handleClearAll = () => {
    setSearchInput("");
    router.push("/find", { scroll: false });
  };

  const handleRemoveChip = (key: keyof FindFilterState) => {
    if (key === "search") {
      setSearchInput("");
      updateFilters({ search: "" });
    } else if (key === "seats" || key === "priceMin" || key === "priceMax") {
      updateFilters({ [key]: 0 });
    } else if (key === "mode") {
      updateFilters({ mode: "hourly" });
    } else {
      updateFilters({ [key]: "all" });
    }
  };

  // Đếm số lượng bộ lọc đang kích hoạt ngoài mặc định
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search && filters.search.trim()) count++;
    if (filters.category && filters.category !== "all") count++;
    if (filters.facilityId && filters.facilityId !== "all") count++;
    if (filters.brand && filters.brand !== "all") count++;
    if (filters.seats && Number(filters.seats) > 0) count++;
    if (filters.transmission && filters.transmission !== "all") count++;
    if (filters.fuelType && filters.fuelType !== "all") count++;
    if (filters.priceMin && Number(filters.priceMin) > 0) count++;
    if (filters.priceMax && Number(filters.priceMax) > 0) count++;
    if (filters.mode && filters.mode !== "hourly") count++;
    return count;
  }, [filters]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. Header Trang & Bộ chọn thời gian nhận/trả xe */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Car className="w-4 h-4" />
            <span>Danh mục phương tiện</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Tìm & Thuê Xe Thong Dong
          </h1>
          <p className="mt-1.5 text-sm text-ink-3 max-w-xl">
            Đội xe sở hữu trực tiếp 100%, kiểm định 12 hạng mục nghiêm ngặt, minh bạch giá cả và hỗ trợ đổi xe linh hoạt.
          </p>
        </div>

        {/* Thanh chọn lịch trình GMT+7 */}
        <div className="w-full md:w-80 shrink-0">
          <label className="block text-xs font-bold text-ink mb-1.5">
            Lịch trình thuê xe dự kiến:
          </label>
          <DateTimeRangePicker
            value={{
              from: filters.startDate ?? null,
              to: filters.endDate ?? null,
              startTime: filters.startTime,
              endTime: filters.endTime,
            }}
            rentalMode={filters.mode === "longterm" ? "longterm" : "daily"}
            onChange={(val) => {
              updateFilters({
                startDate: val.from ?? undefined,
                endDate: val.to ?? undefined,
                startTime: val.startTime,
                endTime: val.endTime,
              });
            }}
          />
        </div>
      </div>

      {/* 2. Dải Tab Phân Khúc Nhanh (Category Quick Tabs) */}
      <div className="mt-6 flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = filters.category === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => updateFilters({ category: tab.value as FindFilterState["category"] })}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "border border-line bg-surface text-ink-2 hover:bg-surface-raised"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Nút mở Drawer trên Mobile (< 1024px) */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="lg:hidden flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-bold text-ink shadow-xs hover:bg-sunken shrink-0 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
          <span>Bộ lọc</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. Bố cục 2 cột (Desktop Sidebar + Catalog Grid) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Desktop Sidebar (>= 1024px) */}
        <aside className="hidden lg:block sticky top-28 rounded-2xl border border-line bg-surface p-5 shadow-e1">
          <VehicleFilters
            filters={filters}
            facilities={facilities}
            onChange={updateFilters}
            onReset={handleClearAll}
          />
        </aside>

        {/* Main Content Area */}
        <main className="w-full flex flex-col min-w-0">
          {/* Thanh Tìm kiếm văn bản, Đếm kết quả & Sắp xếp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 shadow-e1">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm theo tên xe, hãng xe, đời xe hoặc trạm..."
                className="w-full rounded-xl border border-line bg-canvas pl-9 pr-20 py-2 text-xs font-medium text-ink transition-colors focus:border-primary focus:bg-surface focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-primary hover:bg-primary-hover px-3 py-1 text-[11px] font-bold text-white transition-colors cursor-pointer"
              >
                Tìm
              </button>
            </form>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <span className="text-xs font-semibold text-ink-3">
                {loading ? "Đang tải..." : `Tìm thấy ${pageData.totalCount} xe`}
              </span>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value as FindFilterState["sort"] })}
                  aria-label="Sắp xếp danh sách xe"
                  className="rounded-xl border border-line bg-canvas px-2.5 py-1.5 text-xs font-bold text-ink transition-colors focus:border-primary focus:outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dải Chips bộ lọc đang áp dụng */}
          <ActiveFilterChips
            filters={filters}
            facilities={facilities}
            onRemove={handleRemoveChip}
            onClearAll={handleClearAll}
          />

          {/* Trạng thái Lưới xe: Loading / Error / Empty / Grid */}
          <div className="mt-6">
            {error ? (
              <ErrorState
                title="Không thể tải dữ liệu xe"
                message={error}
                onRetry={() => {
                  setLoading(true);
                  setError(null);
                  setRetryTrigger((c) => c + 1);
                }}
                className="my-8"
              />
            ) : loading ? (
              <div
                data-testid="find-skeleton-grid"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <VehicleCardSkeleton key={`skel-${i}`} />
                ))}
              </div>
            ) : pageData.items.length === 0 ? (
              <EmptyState
                title="Không tìm thấy phương tiện phù hợp"
                description="Hãy thử nới lỏng các tiêu chí lọc, đổi khoảng giá hoặc tìm kiếm theo từ khóa khác."
                action={
                  <Button
                    variant="primary"
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại toàn bộ bộ lọc</span>
                  </Button>
                }
                className="my-12 rounded-2xl border border-line bg-surface shadow-e1"
              />
            ) : (
              <div
                ref={gridContainerRef}
                data-testid="vehicle-grid"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {pageData.items.map((vehicle, idx) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    priority={idx < 3}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Phân trang */}
          {!loading && pageData.totalCount > pageData.pageSize && (
            <div className="mt-10 border-t border-line pt-6">
              <Pagination
                page={pageData.page}
                pageSize={pageData.pageSize}
                totalCount={pageData.totalCount}
                pageSizeOptions={[6, 9, 12, 18]}
                itemName="xe"
                onPageChange={(nextPage) => updateFilters({ page: nextPage })}
                onPageSizeChange={(nextSize) => updateFilters({ pageSize: nextSize, page: 1 })}
              />
            </div>
          )}
        </main>
      </div>

      {/* Drawer Bộ lọc trên Mobile */}
      <Drawer
        open={mobileDrawerOpen}
        onOpenChange={setMobileDrawerOpen}
        title="Bộ lọc chi tiết"
        side="bottom"
      >
        <div className="p-5 overflow-y-auto max-h-[75vh]">
          <VehicleFilters
            filters={filters}
            facilities={facilities}
            onChange={updateFilters}
            onReset={handleClearAll}
            onApplyMobile={() => setMobileDrawerOpen(false)}
            isMobileDrawer
          />
        </div>
      </Drawer>
    </div>
  );
}

function FindPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="h-10 w-64 rounded-xl bg-sunken" />
      <div className="mt-3 h-4 w-96 rounded bg-sunken/60" />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl bg-sunken" />
        ))}
      </div>
    </div>
  );
}

export default function FindPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-canvas text-ink">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-20 focus:outline-none">
        <Suspense fallback={<FindPageSkeleton />}>
          <FindCatalogContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
