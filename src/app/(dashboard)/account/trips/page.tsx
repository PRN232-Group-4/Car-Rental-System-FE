"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass, Car, RefreshCw } from "lucide-react";
import { AuthGate } from "@/features/auth/AuthGate";
import { useMyTrips } from "@/features/account/trips/hooks";
import { TripCard } from "@/features/account/trips/components/TripCard";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import type { TripTab } from "@/features/account/trips/types";

const TABS: { key: TripTab; label: string }[] = [
  { key: "upcoming", label: "Sắp tới" },
  { key: "ongoing", label: "Đang diễn ra" },
  { key: "completed", label: "Đã hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

function TripsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get("tab") as TripTab) || "upcoming";
  const currentPage = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;

  const { data, isLoading, error, refetch, isFetching } = useMyTrips({
    tab: currentTab,
    page: currentPage,
    pageSize: 12,
  });

  const handleTabChange = (newTab: TripTab) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("tab", newTab);
    sp.set("page", "1");
    router.push(`/account/trips?${sp.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(newPage));
    router.push(`/account/trips?${sp.toString()}`);
  };

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const getEmptyMessage = () => {
    switch (currentTab) {
      case "upcoming":
        return {
          title: "Bạn chưa có chuyến đi nào sắp tới",
          desc: "Hãy khám phá dàn xe đa dạng của Thong Dong và đặt chuyến xe phù hợp với nhu cầu của bạn ngay hôm nay.",
        };
      case "ongoing":
        return {
          title: "Không có chuyến đi đang diễn ra",
          desc: "Hiện tại bạn không có xe nào đang trong hành trình di chuyển.",
        };
      case "completed":
        return {
          title: "Chưa có lịch sử chuyến đi hoàn tất",
          desc: "Các chuyến đi sau khi trả xe và quyết toán sẽ được lưu trữ tại đây.",
        };
      case "cancelled":
        return {
          title: "Không có chuyến đi bị hủy",
          desc: "Bạn chưa có đơn thuê nào bị hủy.",
        };
    }
  };

  const emptyMsg = getEmptyMessage();

  return (
    <div className="space-y-6">
      {/* Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Compass className="w-4 h-4" />
            <span>Hành Trình Của Bạn</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink mt-1">
            Chuyến của tôi
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Theo dõi hành trình, kiểm tra biên bản bàn giao xe và quản lý các đơn thuê xe của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <span className="text-xs text-ink-3 flex items-center gap-1 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Đang đồng bộ...</span>
            </span>
          )}
          <Link href="/find">
            <Button variant="primary" className="flex items-center gap-1.5">
              <Car className="w-4 h-4" />
              <span>Đặt xe mới</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs thanh điều hướng */}
      <div className="flex items-center gap-2 border-b border-line overflow-x-auto pb-px" role="tablist">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab.key)}
              className={`h-11 px-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-ink-3 hover:text-ink hover:border-line-strong"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Nội dung danh sách */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-line p-5 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="pt-3 border-t border-line flex justify-between items-center">
                <Skeleton className="h-6 w-24 rounded" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Không thể tải danh sách chuyến đi"
          message={error instanceof Error ? error.message : "Không thể tải dữ liệu. Vui lòng thử lại."}
          onRetry={() => refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={emptyMsg.title}
          description={emptyMsg.desc}
          action={
            <Link href="/find">
              <Button variant="primary" className="flex items-center gap-1.5 mt-2">
                <Car className="w-4 h-4" />
                <span>Khám phá và đặt xe</span>
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </ul>

          {totalCount > 12 && (
            <div className="pt-6 border-t border-line flex justify-center">
              <Pagination
                page={currentPage}
                pageSize={12}
                totalCount={totalCount}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MyTripsPage() {
  return (
    <AuthGate allowedRoles={["Customer"]}>
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-ink-3">
            Đang tải dữ liệu chuyến đi...
          </div>
        }
      >
        <TripsListContent />
      </Suspense>
    </AuthGate>
  );
}
