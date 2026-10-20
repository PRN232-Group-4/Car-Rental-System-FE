"use client";

import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import { ArrowLeft } from "lucide-react";
import { AuthGate } from "@/features/auth/AuthGate";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useReview } from "@/features/admin/reviews/hooks";
import { ReviewDetailView } from "@/features/admin/reviews/components/ReviewDetailView";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";

export default function ReviewDetailPage() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const reviewId = idParam ? Number(idParam) : null;

  const { data: review, isLoading, isError, refetch } = useReview(reviewId);

  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
        <div className="space-y-6">
          {/* Breadcrumb / Back button */}
          <div>
            <Link
              href="/admin/reviews"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-td-muted transition hover:text-td-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại danh sách đánh giá</span>
            </Link>
          </div>

          {!reviewId && (
            <EmptyState
              title="Không có mã đánh giá"
              description="Vui lòng cung cấp tham số ?id= để xem chi tiết đánh giá nhân sự."
            />
          )}

          <TransitFolio
            index="03"
            tag="TRI"
            kicker="CHĂM SÓC & SỰ CỐ · HỒ SƠ ĐÁNH GIÁ"
            title={<>Chi tiết <em className="italic text-td-teal">đánh giá.</em></>}
            description="Nội dung nhận xét, bằng chứng chuyến đi và thao tác kiểm duyệt."
          />

          {reviewId && isLoading && (
            <div className="flex h-64 animate-pulse items-center justify-center rounded border border-td-rule bg-td-white font-mono text-xs text-td-muted">
              Đang tải chi tiết đánh giá #{reviewId}...
            </div>
          )}

          {reviewId && isError && (
            <ErrorState
              message={`Không thể tìm thấy hoặc tải thông tin đánh giá #${reviewId}.`}
              onRetry={() => refetch()}
            />
          )}

          {reviewId && review && (
            <div className="rounded border border-td-rule bg-td-white p-6">
              <ReviewDetailView review={review} onRefresh={() => refetch()} />
            </div>
          )}
        </div>
    </AuthGate>
  );
}
