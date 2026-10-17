"use client";

import { useState, useMemo } from "react";
import { Star, ShieldAlert, CheckCircle2, MessageSquare, ArrowRight } from "lucide-react";
import StaffShell from "@/features/admin/StaffShell";
import { AuthGate } from "@/features/auth/AuthGate";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { formatDateTime } from "@/lib/time";
import { RatingStars } from "@/features/admin/reviews/components/RatingStars";
import { RatingDistribution } from "@/features/admin/reviews/components/RatingDistribution";
import { ReviewFilterBar } from "@/features/admin/reviews/components/ReviewFilterBar";
import { ReviewDrawer } from "@/features/admin/reviews/components/ReviewDrawer";
import { getReviewStatusMeta } from "@/features/admin/reviews/review-status";
import { useReviews, useRatingSummary } from "@/features/admin/reviews/hooks";
import type { ReviewListItem, ReviewFilterParams } from "@/features/admin/reviews/types";

export default function AdminReviewsPage() {
  const [filters, setFilters] = useState<ReviewFilterParams>({});
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const { data: reviewsData, isLoading } = useReviews(filters);
  const { data: summary } = useRatingSummary();

  // Thống kê % >= 4 sao và số lượng bị báo cáo
  const stats = useMemo(() => {
    if (!summary || summary.count === 0) {
      return { positivePct: "0%", reportedCount: 0 };
    }
    const positiveCount =
      (summary.distribution["5"] || 0) + (summary.distribution["4"] || 0);
    const positivePct = `${((positiveCount / summary.count) * 100).toFixed(1)}%`;
    const reportedCount =
      reviewsData?.items.filter((r) => r.status === "reported").length ?? 0;

    return { positivePct, reportedCount };
  }, [summary, reviewsData]);

  const columns: ColumnDef<ReviewListItem>[] = useMemo(
    () => [
      {
        accessorKey: "staff",
        header: "Nhân sự được đánh giá",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5 py-0.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              {row.original.staff.fullName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-ink">{row.original.staff.fullName}</span>
              <span className="text-[11px] text-ink-3">
                {row.original.staff.isDriver ? "Tài xế" : "Nhân viên"}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "rating",
        header: "Điểm số",
        cell: ({ row }) => (
          <RatingStars rating={row.original.rating} size="sm" showNumber={true} />
        ),
      },
      {
        accessorKey: "commentPreview",
        header: "Nội dung nhận xét",
        cell: ({ row }) => (
          <p className="line-clamp-2 max-w-sm text-xs text-ink-2">
            {row.original.commentPreview}
          </p>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Khách hàng",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-ink">
            {row.original.customerName}
          </span>
        ),
      },
      {
        accessorKey: "rentalId",
        header: "Đơn thuê",
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-lg border border-line bg-sunken px-2 py-0.5 font-mono text-xs text-ink-2">
            #{row.original.rentalId}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const meta = getReviewStatusMeta(row.original.status);
          return <StatusBadge status={meta.statusType}>{meta.label}</StatusBadge>;
        },
      },
      {
        accessorKey: "hasReply",
        header: "Phản hồi",
        cell: ({ row }) =>
          row.original.hasReply ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
              <CheckCircle2 className="h-3 w-3" />
              <span>Đã phản hồi</span>
            </span>
          ) : (
            <span className="text-[11px] text-ink-3">Chưa phản hồi</span>
          ),
      },
      {
        accessorKey: "createdAt",
        header: "Thời gian",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-ink-3">
            {formatDateTime(row.original.createdAt, "dd/MM/yyyy HH:mm")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReviewId(row.original.id);
            }}
            className="text-xs text-primary hover:text-primary-hover"
          >
            <span>Chi tiết</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
      <StaffShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Star className="h-5 w-5 fill-primary" aria-hidden="true" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Đánh giá nhân sự & Tài xế
                </h1>
              </div>
              <p className="mt-1 text-sm text-ink-3">
                Kiểm duyệt nhận xét và theo dõi chất lượng dịch vụ của đội ngũ nhân sự Thong Dong (FE-25).
              </p>
            </div>
          </div>

          {/* Dải tổng quan StatCards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Điểm trung bình toàn hệ thống"
              value={summary?.average !== null && summary?.average !== undefined ? `${summary.average.toFixed(2)} / 5.0` : "—"}
              icon={Star}
            />
            <StatCard
              label="Tổng lượt đánh giá hợp lệ"
              value={summary?.count ?? 0}
              icon={MessageSquare}
            />
            <StatCard
              label="Tỉ lệ hài lòng (>= 4 sao)"
              value={stats.positivePct}
              icon={CheckCircle2}
            />
            <StatCard
              label="Đánh giá bị báo cáo"
              value={stats.reportedCount}
              icon={ShieldAlert}
            />
          </div>

          {/* Phân bố đánh giá & Bộ lọc */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              {summary && (
                <RatingDistribution
                  summary={summary}
                  selectedStar={filters.rating}
                  onSelectStar={(star) =>
                    setFilters((prev) => ({ ...prev, rating: star }))
                  }
                />
              )}
            </div>
            <div className="lg:col-span-2">
              <ReviewFilterBar filters={filters} onChange={setFilters} />
            </div>
          </div>

          {/* Bảng dữ liệu DataTable */}
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
            <DataTable
              caption="Danh sách đánh giá nhân viên và tài xế từ khách hàng"
              columns={columns}
              data={reviewsData?.items ?? []}
              loading={isLoading}
              onRowClick={(row) => setSelectedReviewId(row.id)}
              emptyTitle="Chưa có đánh giá nào"
              emptyDescription="Hiện không có đánh giá nào khớp với tiêu chí tìm kiếm."
            />
          </div>

          {/* Drawer chi tiết & kiểm duyệt */}
          <ReviewDrawer
            reviewId={selectedReviewId}
            onClose={() => setSelectedReviewId(null)}
          />
        </div>
      </StaffShell>
    </AuthGate>
  );
}
