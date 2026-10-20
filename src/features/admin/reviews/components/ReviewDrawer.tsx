"use client";

import { Drawer } from "@/components/ui/Drawer";
import { ErrorState } from "@/components/ui/ErrorState";
import { useReview } from "../hooks";
import { ReviewDetailView } from "./ReviewDetailView";

interface ReviewDrawerProps {
  reviewId: number | null;
  onClose: () => void;
}

export function ReviewDrawer({ reviewId, onClose }: ReviewDrawerProps) {
  const { data: review, isLoading, isError, refetch } = useReview(reviewId);

  return (
    <Drawer
      open={Boolean(reviewId)}
      onOpenChange={(open) => !open && onClose()}
      side="right"
      className="w-[min(95vw,680px)]"
      title={`Chi tiết & Kiểm duyệt Đánh giá #${reviewId ?? ""}`}
    >
      <div className="p-5">
        {isLoading && (
          <div className="flex h-64 animate-pulse items-center justify-center rounded bg-td-chalk text-xs text-td-muted">
            Đang tải dữ liệu chi tiết đánh giá...
          </div>
        )}

        {isError && (
          <ErrorState
            message="Không thể tải thông tin chi tiết đánh giá."
            onRetry={() => refetch()}
          />
        )}

        {review && (
          <ReviewDetailView review={review} onRefresh={() => refetch()} />
        )}
      </div>
    </Drawer>
  );
}
