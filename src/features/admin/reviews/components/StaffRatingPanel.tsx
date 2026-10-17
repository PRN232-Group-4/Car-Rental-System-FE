"use client";

import Link from "@/components/navigation/NavigationLink";
import { ArrowRight, MessageSquare } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { RatingDistribution } from "./RatingDistribution";
import { formatDateTime } from "@/lib/time";
import type { RatingSummary, ReviewListItem } from "../types";

interface StaffRatingPanelProps {
  staffId: number;
  staffName: string;
  summary: RatingSummary;
  recentReviews?: ReviewListItem[];
}

export function StaffRatingPanel({
  staffId,
  staffName,
  summary,
  recentReviews = [],
}: StaffRatingPanelProps) {
  return (
    <div className="space-y-6">
      {/* Tóm tắt điểm số & Phân bố */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Điểm trung bình Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface p-6 text-center shadow-e1">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
            Điểm đánh giá trung bình
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-5xl font-black text-ink">
              {summary.average !== null ? summary.average.toFixed(2) : "—"}
            </span>
            <span className="font-mono text-base text-ink-3">/ 5.0</span>
          </div>

          <div className="mt-3">
            <RatingStars
              rating={summary.average ?? 0}
              size="lg"
              showNumber={false}
            />
          </div>

          <p className="mt-2 text-xs text-ink-3">
            Dựa trên <strong>{summary.count}</strong> lượt đánh giá hợp lệ từ khách hàng
          </p>
        </div>

        {/* Bảng phân bố 5 sao */}
        <RatingDistribution summary={summary} />
      </div>

      {/* 5 Đánh giá gần nhất */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-e1">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-ink">Đánh giá gần đây của {staffName}</h3>
          </div>

          <Link
            href={`/admin/reviews?staffId=${staffId}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:underline"
          >
            <span>Xem tất cả ({summary.count})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentReviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-3">
            Chưa có đánh giá nào cho nhân sự này.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {recentReviews.slice(0, 5).map((rev) => (
              <div key={rev.id} className="py-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{rev.customerName}</span>
                  <span className="font-mono text-ink-3">
                    {formatDateTime(rev.createdAt, "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
                <div className="mt-1">
                  <RatingStars rating={rev.rating} size="sm" />
                </div>
                <p className="mt-2 text-ink-2 line-clamp-2">{rev.commentPreview}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
