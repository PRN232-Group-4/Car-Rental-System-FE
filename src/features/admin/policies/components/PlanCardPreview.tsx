"use client";

import { ShieldCheck, Tag } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { calculateHourlyRate } from "../pricing-calculator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { SubscriptionPlan, PlanFormValues } from "../types";

interface PlanCardPreviewProps {
  plan: Partial<SubscriptionPlan | PlanFormValues>;
  subscribersCount?: number;
}

export function PlanCardPreview({ plan, subscribersCount }: PlanCardPreviewProps) {
  const name = plan.name || "Tên gói thuê bao xem trước";
  const price = typeof plan.price === "number" ? plan.price : 0;
  const hours = typeof plan.includedHours === "number" ? plan.includedHours : 1;
  const days = typeof plan.durationDays === "number" ? plan.durationDays : 30;
  const description =
    plan.description || "Mô tả gói sẽ hiển thị tại đây khi khách hàng xem danh sách gói thuê bao.";
  const isActive = plan.isActive ?? true;
  const hourlyRate = calculateHourlyRate(price, hours);

  return (
    <div className="bg-surface rounded-2xl border border-line p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3 block mb-1">
            Xem trước giao diện thẻ gói
          </span>
          <h4 className="font-display text-lg font-bold text-ink">{name}</h4>
          <div className="flex items-center gap-2 text-xs text-ink-3 mt-1">
            <span className="font-bold text-primary font-mono">{hours} giờ</span>
            <span>·</span>
            <span className="font-mono">{days} ngày</span>
          </div>
        </div>
        <StatusBadge
          status={isActive ? "active" : "draft"}
          label={isActive ? "Đang mở bán" : "Tạm ngừng"}
        />
      </div>

      <div className="py-2 border-y border-line/60">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-ink-3">Giá trọn gói</span>
          <span className="font-mono text-2xl font-black text-ink">{formatVnd(price)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-ink-3 mt-1">
          <span>Đơn giá quy đổi</span>
          <span className="font-mono font-bold text-primary">
            ~{formatVnd(hourlyRate)} / giờ
          </span>
        </div>
      </div>

      <p className="text-xs text-ink-2 leading-relaxed min-h-[36px]">{description}</p>

      <div className="pt-2 flex items-center justify-between text-[11px] text-ink-3">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span>Kích hoạt tự động sau thanh toán</span>
        </div>
        {typeof subscribersCount === "number" && (
          <div className="flex items-center gap-1 font-mono">
            <Tag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{subscribersCount} người dùng</span>
          </div>
        )}
      </div>
    </div>
  );
}
