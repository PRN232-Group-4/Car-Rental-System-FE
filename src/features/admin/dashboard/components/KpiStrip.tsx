"use client";

import { DollarSign, CheckCircle2, Car, Activity, Wrench, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { SkeletonStat } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { calculatePercentageChange } from "../api";
import type { DashboardKpis } from "../types";

interface KpiStripProps {
  data?: DashboardKpis;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function formatVndCompact(amount: number | null): string {
  if (amount === null || amount === undefined) return "—";
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ đ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} tr đ`;
  }
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export function KpiStrip({ data, isLoading, isError, onRetry }: KpiStripProps) {
  if (isLoading) {
    return (
      <section aria-label="Đang tải chỉ số KPI" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </section>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        message="Không thể tải dữ liệu chỉ số KPI điều hành."
        onRetry={onRetry}
      />
    );
  }

  const revenueTrend = calculatePercentageChange(data.revenue.value, data.revenue.previous);
  const rentalsTrend = calculatePercentageChange(data.completedRentals.value, data.completedRentals.previous);
  const rentingVehiclesTrend = calculatePercentageChange(data.rentingVehicles.value, data.rentingVehicles.previous);
  const utilizationTrend = calculatePercentageChange(data.utilizationRate.value, data.utilizationRate.previous);
  const maintenanceTrend = calculatePercentageChange(data.maintenanceCost.value, data.maintenanceCost.previous);
  const subsTrend = calculatePercentageChange(data.activeSubscriptions.value, data.activeSubscriptions.previous);

  return (
    <section aria-label="Các chỉ số hiệu suất chính (KPI)" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      <StatCard
        icon={DollarSign}
        label="Doanh thu"
        value={formatVndCompact(data.revenue.value)}
        trend={{
          value: revenueTrend.text,
          direction: revenueTrend.direction,
          label: "so với kỳ trước",
        }}
        subtext="Tổng thanh toán đã thu"
      />

      <StatCard
        icon={CheckCircle2}
        label="Đơn hoàn tất"
        value={data.completedRentals.value ?? "—"}
        trend={{
          value: rentalsTrend.text,
          direction: rentalsTrend.direction,
          label: "so với kỳ trước",
        }}
        subtext="Chuyến đi kết thúc hợp lệ"
      />

      <StatCard
        icon={Car}
        label="Xe đang thuê / Tổng xe"
        value={`${data.rentingVehicles.value ?? 0} / ${data.totalVehicles.value ?? 0}`}
        trend={{
          value: rentingVehiclesTrend.text,
          direction: rentingVehiclesTrend.direction,
          label: "so với kỳ trước",
        }}
        subtext="Tỉ lệ đội xe lăn bánh"
      />

      <StatCard
        icon={Activity}
        label="Tỉ lệ khai thác"
        value={data.utilizationRate.value !== null ? `${data.utilizationRate.value}%` : "—"}
        trend={{
          value: utilizationTrend.text,
          direction: utilizationTrend.direction,
          label: "so với kỳ trước",
        }}
        subtext="Hiệu suất khai thác đội xe"
      />

      <StatCard
        icon={Wrench}
        label="Chi phí bảo dưỡng"
        value={formatVndCompact(data.maintenanceCost.value)}
        trend={{
          value: maintenanceTrend.text,
          direction: maintenanceTrend.direction === "up" ? "down" : maintenanceTrend.direction === "down" ? "up" : "neutral",
          label: "so với kỳ trước",
        }}
        subtext="Phí sửa chữa & bảo dưỡng"
      />

      <StatCard
        icon={ShieldCheck}
        label="Gói thuê bao active"
        value={data.activeSubscriptions.value ?? "—"}
        trend={{
          value: subsTrend.text,
          direction: subsTrend.direction,
          label: "so với kỳ trước",
        }}
        subtext="Hội viên đang duy trì gói"
      />
    </section>
  );
}
