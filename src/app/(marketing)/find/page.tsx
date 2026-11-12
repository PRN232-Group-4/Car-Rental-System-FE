"use client";

import React, { Suspense, useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { VehicleCard } from "@/features/vehicles/components/VehicleCard";
import { VehicleCardSkeleton } from "@/features/vehicles/components/VehicleCardSkeleton";
import {
  VehicleFilters,
  CATEGORY_OPTIONS,
  SEAT_OPTIONS,
  TRANSMISSION_OPTIONS,
  PRICE_PRESETS,
  LONGTERM_PRICE_PRESETS,
} from "@/features/vehicles/components/VehicleFilters";
import { ActiveFilterChips } from "@/features/vehicles/components/ActiveFilterChips";
import { DateTimeRangePicker } from "@/components/ui/DateTimeRangePicker";
import { Select } from "@/components/ui/Select";
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
import { Search, SlidersHorizontal, RotateCcw, MapPin } from "lucide-react";
import { gsap } from "@/lib/motion/register";

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

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

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
    pageSize: 12,
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
    } else if (key === "startDate" || key === "endDate") {
      updateFilters({ startDate: undefined, endDate: undefined, startTime: undefined, endTime: undefined });
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
    if (filters.startDate && filters.endDate) count++;
    return count;
  }, [filters]);

  const pricePresets = filters.mode === "longterm" ? LONGTERM_PRICE_PRESETS : PRICE_PRESETS;
  const priceValue = `${Number(filters.priceMin || 0)}-${Number(filters.priceMax || 0)}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-10">
      <h1 className="sr-only">Tìm và thuê xe ô tô</h1>

      {/* 1. Chuyến đi: chi nhánh nhận xe, thời gian thuê, tìm theo tên */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,15rem)_minmax(0,22rem)_minmax(0,1fr)]">
        <Select
          aria-label="Chi nhánh giao nhận"
          menuLabel="Trạm tiếp nhận"
          icon={<MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
          value={filters.facilityId || "all"}
          onValueChange={(v) => updateFilters({ facilityId: v })}
          options={[{ value: "all", label: "Tất cả chi nhánh" }, ...facilities.map((fac) => ({ value: String(fac.id), label: fac.name }))]}
          className="h-12 px-4 font-medium"
        />

        <DateTimeRangePicker
          value={{
            from: filters.startDate ?? null,
            to: filters.endDate ?? null,
            startTime: filters.startTime,
            endTime: filters.endTime,
          }}
          rentalMode={filters.mode}
          onChange={(val) => {
            updateFilters({
              startDate: val.from ?? undefined,
              endDate: val.to ?? undefined,
              startTime: val.startTime,
              endTime: val.endTime,
            });
          }}
        />

        <form onSubmit={handleSearchSubmit} className="relative md:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tên xe, hãng xe hoặc đời xe"
            aria-label="Tìm xe theo tên, hãng hoặc đời xe"
            className="h-12 w-full border border-line bg-surface pl-10 pr-20 text-sm text-ink placeholder:text-ink-3 transition-colors hover:border-line-strong focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover cursor-pointer"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* 2. Bộ lọc ngang: loại xe, số chỗ, hộp số, giá; phần còn lại trong "Bộ lọc" */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto border-y border-line py-3 scrollbar-none">
        {CATEGORY_OPTIONS.map((cat) => {
          const isSelected = filters.category === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => updateFilters({ category: cat.value as FindFilterState["category"] })}
              className={`h-9 shrink-0 whitespace-nowrap px-3.5 text-xs font-semibold transition-colors cursor-pointer ${
                isSelected
                  ? "bg-ink-950 text-bone-100"
                  : "border border-line bg-surface text-ink hover:border-line-strong"
              }`}
            >
              {cat.label}
            </button>
          );
        })}

        <span className="mx-1 h-6 w-px shrink-0 bg-line" aria-hidden="true" />

        <FilterSelect
          label="Số chỗ"
          value={String(Number(filters.seats || 0))}
          options={[
            { value: "0", label: "Số chỗ" },
            ...SEAT_OPTIONS.filter((o) => o.value > 0).map((o) => ({ value: String(o.value), label: `Từ ${o.label}` })),
          ]}
          onChange={(v) => updateFilters({ seats: Number(v) })}
        />
        <FilterSelect
          label="Hộp số"
          value={filters.transmission || "all"}
          options={[
            { value: "all", label: "Hộp số" },
            ...TRANSMISSION_OPTIONS.filter((o) => o.value !== "all"),
          ]}
          onChange={(v) => updateFilters({ transmission: v as FindFilterState["transmission"] })}
        />
        <FilterSelect
          label="Mức giá"
          value={priceValue}
          options={[
            { value: "0-0", label: filters.mode === "longterm" ? "Giá thuê tháng" : "Giá thuê giờ" },
            ...pricePresets.map((p) => ({ value: `${p.min}-${p.max}`, label: p.label })),
          ]}
          onChange={(v) => {
            const [min, max] = v.split("-").map(Number);
            updateFilters({ priceMin: min, priceMax: max });
          }}
        />

        <button
          type="button"
          onClick={() => setFilterDrawerOpen(true)}
          className="ml-auto flex h-9 shrink-0 items-center gap-2 border border-line bg-surface px-3.5 text-xs font-semibold text-ink hover:border-line-strong cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Bộ lọc</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold tabular-nums text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. Kết quả & sắp xếp */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-3" aria-live="polite">
          {loading ? "Đang tải..." : <><span className="font-semibold tabular-nums text-ink">{pageData.totalCount}</span> xe phù hợp</>}
        </p>
        <Select
          aria-label="Sắp xếp danh sách xe"
          menuLabel="Sắp xếp"
          value={filters.sort}
          onValueChange={(v) => updateFilters({ sort: v as FindFilterState["sort"] })}
          options={SORT_OPTIONS}
          className="h-9 w-auto text-xs font-semibold"
          contentClassName="min-w-48"
        />
      </div>

      <ActiveFilterChips
        filters={filters}
        facilities={facilities}
        onRemove={handleRemoveChip}
        onClearAll={handleClearAll}
      />

      {/* 4. Lưới xe 4 cột */}
      <section aria-label="Danh sách xe" className="mt-5">
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
          <div data-testid="find-skeleton-grid" className={GRID}>
            {Array.from({ length: 8 }).map((_, i) => (
              <VehicleCardSkeleton key={`skel-${i}`} />
            ))}
          </div>
        ) : pageData.items.length === 0 ? (
          <EmptyState
            title="Không tìm thấy xe phù hợp"
            description="Hãy thử nới lỏng các tiêu chí lọc, đổi khoảng giá hoặc tìm theo từ khóa khác."
            action={
              <Button variant="primary" onClick={handleClearAll} className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Đặt lại toàn bộ bộ lọc</span>
              </Button>
            }
            className="my-12 border border-line bg-surface"
          />
        ) : (
          <div ref={gridContainerRef} data-testid="vehicle-grid" className={GRID}>
            {pageData.items.map((vehicle, idx) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                priority={idx < 4}
                bookingContext={{
                  from: filters.startDate,
                  to: filters.endDate,
                  rentalType: filters.mode,
                  mode: searchParams.get("mode") === "driver" ? "driver" : searchParams.get("mode") === "subscription" ? "subscription" : "self",
                }}
              />
            ))}
          </div>
        )}
      </section>

      {!loading && pageData.totalCount > pageData.pageSize && (
        <div className="mt-10 border-t border-line pt-6">
          <Pagination
            page={pageData.page}
            pageSize={pageData.pageSize}
            totalCount={pageData.totalCount}
            pageSizeOptions={[8, 12, 16, 24]}
            itemName="xe"
            onPageChange={(nextPage) => updateFilters({ page: nextPage })}
            onPageSizeChange={(nextSize) => updateFilters({ pageSize: nextSize, page: 1 })}
          />
        </div>
      )}

      {/* Bộ lọc đầy đủ (chi nhánh, hãng, nhiên liệu...) */}
      <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen} title="Bộ lọc" side="right">
        <div className="p-5 overflow-y-auto max-h-[100dvh]">
          <VehicleFilters
            filters={filters}
            facilities={facilities}
            onChange={updateFilters}
            onReset={handleClearAll}
            onApplyMobile={() => setFilterDrawerOpen(false)}
            isMobileDrawer
          />
        </div>
      </Drawer>
    </div>
  );
}

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/** Filter chip on the shared Select; highlighted once it leaves its default (first) option. */
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const active = value !== options[0]?.value;
  return (
    <Select
      aria-label={label}
      menuLabel={label}
      value={value}
      onValueChange={onChange}
      options={options}
      className={`h-9 w-auto shrink-0 px-3.5 text-xs font-semibold ${active ? "border-primary bg-primary-tint text-primary" : ""}`}
      contentClassName="min-w-48"
    />
  );
}

function FindPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="h-12 w-full bg-sunken" />
      <div className="mt-3 h-9 w-2/3 bg-sunken/60" />
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-80 bg-sunken" />
        ))}
      </div>
    </div>
  );
}

export default function FindPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-canvas text-ink">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-16 focus:outline-none">
        <Suspense fallback={<FindPageSkeleton />}>
          <FindCatalogContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
