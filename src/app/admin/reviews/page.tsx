"use client";

import { useState, useMemo } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthGate } from "@/features/auth/AuthGate";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { TransitFolio, TransitFolioMetric } from "@/features/admin/transit-desk/TransitFolio";
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-td-chalk text-xs font-bold text-td-oxide">
              {row.original.staff.fullName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-td-ink">{row.original.staff.fullName}</span>
              <span className="text-[11px] text-td-muted">
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
          <p className="line-clamp-2 max-w-sm text-xs text-td-muted">
            {row.original.commentPreview}
          </p>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Khách hàng",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-td-ink">
            {row.original.customerName}
          </span>
        ),
      },
      {
        accessorKey: "rentalId",
        header: "Đơn thuê",
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded border border-td-rule bg-td-chalk px-2 py-0.5 font-mono text-[11px] text-td-ink">
            #{row.original.rentalId}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const meta = getReviewStatusMeta(row.original.status);
          return (
            <AdminStatusBadge domain="review" status={row.original.status}>
              {meta.label}
            </AdminStatusBadge>
          );
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
            <span className="text-[11px] text-td-muted">Chưa phản hồi</span>
          ),
      },
      {
        accessorKey: "createdAt",
        header: "Thời gian",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-td-muted">
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
            className="text-xs text-td-oxide hover:text-td-oxide-hover"
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
        <div className="space-y-6">
          {/* Header */}
          <TransitFolio
            index="03"
            tag="TRI"
            kicker="CHĂM SÓC & SỰ CỐ · CHẤT LƯỢNG DỊCH VỤ"
            title={<>Đánh giá <em className="italic text-td-teal">nhân sự & tài xế.</em></>}
            description="Kiểm duyệt nhận xét và theo dõi chất lượng dịch vụ của đội ngũ nhân sự Thong Dong (FE-25)."
          >
            <TransitFolioMetric
              label="ĐIỂM TRUNG BÌNH HỆ THỐNG"
              value={summary?.average !== null && summary?.average !== undefined ? summary.average.toFixed(2) : "—"}
            />
          </TransitFolio>

          {/* Dải tổng quan */}
          <section aria-label="Tổng quan đánh giá" className="border-y-2 border-td-ink py-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "01 · Điểm trung bình", value: summary?.average !== null && summary?.average !== undefined ? `${summary.average.toFixed(2)} / 5.0` : "—", note: "Thang điểm 5 sao toàn hệ thống" },
                { label: "02 · Lượt đánh giá", value: summary?.count ?? 0, note: "Nhận xét hợp lệ đã ghi nhận" },
                { label: "03 · Tỉ lệ hài lòng", value: stats.positivePct, note: "Nhận xét từ 4 sao trở lên" },
                { label: "04 · Bị báo cáo", value: stats.reportedCount, note: "Cần kiểm duyệt lại" },
              ].map((metric, index) => (
                <div key={metric.label} className={`relative pl-5 ${index === 0 ? "" : "border-l border-td-rule"}`}>
                  <span className="block font-mono text-[11px] font-semibold uppercase text-td-muted">
                    {metric.label}
                  </span>
                  <strong className="mt-2 block font-sans text-4xl font-bold tracking-tight text-td-ink">
                    {metric.value}
                  </strong>
                  <span className="mt-2 block font-mono text-xs text-td-muted">
                    {metric.note}
                  </span>
                </div>
              ))}
            </div>
          </section>

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

          {/* Bảng dữ liệu */}
          <div className="border-t border-td-ink">
            <DataTable
              className="!border-t-0"
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
    </AuthGate>
  );
}
