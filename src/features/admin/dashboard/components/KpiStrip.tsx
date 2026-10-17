"use client";

import {
  DollarSign,
  CheckCircle2,
  Car,
  Activity,
  Wrench,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
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
      <section aria-label="Đang tải chỉ số KPI" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-e1 md:col-span-2 lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-10 w-48" />
          <Skeleton className="mt-3 h-3 w-64" />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-e1 md:col-span-2 lg:col-span-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-10 w-36" />
          <Skeleton className="mt-3 h-3 w-full" />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-e1 md:col-span-1 lg:col-span-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-8 w-28" />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-e1 md:col-span-1 lg:col-span-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-8 w-28" />
        </div>
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

  const rentingCount = data.rentingVehicles.value ?? 0;
  const totalVehicles = data.totalVehicles.value ?? 0;
  const utilizationDisplay = data.utilizationRate.value !== null ? `${data.utilizationRate.value}%` : "—";
  const idleCount = Math.max(0, totalVehicles - rentingCount);

  // Maintenance ratio over revenue
  const revenueVal = data.revenue.value || 0;
  const maintenanceVal = data.maintenanceCost.value || 0;
  const maintenanceRatio = revenueVal > 0 ? ((maintenanceVal / revenueVal) * 100).toFixed(1) : "0";
  const isMaintenanceAlert = Number(maintenanceRatio) > 20;

  return (
    <section aria-label="Trung tâm chỉ huy telemetry KPI điều hành" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
      {/* 1. HERO OPS METRIC: Doanh thu thực thu kỳ này (2 cột) */}
      <article className="relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-e1 transition-all md:col-span-2 lg:col-span-2">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                Doanh thu
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ${
                revenueTrend.direction === "up"
                  ? "bg-success-bg text-success"
                  : revenueTrend.direction === "down"
                  ? "bg-danger-bg text-danger"
                  : "bg-sunken text-ink-3"
              }`}
            >
              {revenueTrend.direction === "up" && <TrendingUp className="h-3 w-3" aria-hidden="true" />}
              {revenueTrend.direction === "down" && <TrendingDown className="h-3 w-3" aria-hidden="true" />}
              <span>{revenueTrend.text}</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="font-mono text-3xl font-extrabold tracking-tight text-ink tabular-nums sm:text-4xl">
              {formatVndCompact(data.revenue.value)}
            </p>
            <p className="mt-1 text-xs text-ink-3">
              Tổng thanh toán đã thu (chưa khấu trừ hoàn cọc).
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-line/70 pt-3 flex items-center justify-between text-xs">
          <span className="text-ink-3">Kỳ trước:</span>
          <span className="font-mono font-semibold text-ink-2 tabular-nums">
            {formatVndCompact(data.revenue.previous)}
          </span>
        </div>
      </article>

      {/* 2. FLEET READINESS TELEMETRY: Trực chiến đội xe & Khai thác (2 cột) */}
      <article className="relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-e1 transition-all md:col-span-2 lg:col-span-2">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Activity className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                Trực chiến đội xe & Tỉ lệ khai thác
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2 py-0.5 font-mono text-xs font-semibold text-ink-2 tabular-nums">
              <Car className="h-3 w-3 text-primary" />
              <span>{rentingCount} / {totalVehicles}</span>
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-ink tabular-nums">
              {utilizationDisplay}
            </span>
            <span className="text-xs text-ink-3">
              Tỉ lệ khai thác đội xe ({utilizationTrend.text} so với kỳ trước)
            </span>
          </div>

          {/* Stacked Telemetry Bar */}
          <div className="mt-3">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-sunken">
              <div
                style={{ width: `${Math.min(Number(data.utilizationRate.value || 0), 100)}%` }}
                className="bg-primary transition-all duration-500"
                title={`Đang lăn bánh: ${rentingCount} xe`}
              />
              <div
                style={{ width: `${Math.max(0, 100 - Number(data.utilizationRate.value || 0))}%` }}
                className="bg-sunken border-l border-line transition-all duration-500"
                title={`Sẵn sàng / Lưu bãi: ${idleCount} xe`}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-ink-3">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Lăn bánh: {rentingCount} xe
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-sunken border border-line" />
                Tại bãi: {idleCount} xe
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 border-t border-line/70 pt-3 flex items-center justify-between text-xs">
          <span className="text-ink-3">Xu hướng lăn bánh:</span>
          <span className="font-mono font-semibold text-ink-2 tabular-nums">
            {rentingVehiclesTrend.text}
          </span>
        </div>
      </article>

      {/* 3. MAINTENANCE RISK & HEALTH (1 cột) */}
      <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-e1 md:col-span-1 lg:col-span-1">
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning-bg text-warning">
              <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            {isMaintenanceAlert && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-danger-bg px-1.5 py-0.5 text-[10px] font-bold text-danger">
                <AlertCircle className="h-2.5 w-2.5" />
                {maintenanceRatio}%
              </span>
            )}
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ink">
            Chi phí bảo dưỡng
          </p>
          <p className="mt-1 font-mono text-xl font-bold tracking-tight text-ink tabular-nums">
            {formatVndCompact(data.maintenanceCost.value)}
          </p>
        </div>

        <div className="mt-3 border-t border-line/70 pt-2 text-[11px] text-ink-3">
          <span>Tỉ trọng/doanh thu: </span>
          <span className="font-mono font-semibold text-ink-2 tabular-nums">{maintenanceRatio}%</span>
        </div>
      </article>

      {/* 4. ORDERS & SUBSCRIBERS (1 cột) */}
      <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-e1 md:col-span-1 lg:col-span-1">
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-1.5 py-0.5 text-[10px] font-bold text-success font-mono">
              <Zap className="h-2.5 w-2.5" />
              {rentalsTrend.text}
            </span>
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ink">
            Đơn hoàn tất
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="font-mono text-xl font-bold tracking-tight text-ink tabular-nums">
              {data.completedRentals.value ?? "—"}
            </p>
            <span className="text-[11px] text-ink-3">
              ({data.activeSubscriptions.value ?? "—"} hội viên)
            </span>
          </div>
        </div>

        <div className="mt-3 border-t border-line/70 pt-2 text-[11px] text-ink-3">
          <span>Hội viên active: </span>
          <span className="font-mono font-semibold text-ink-2 tabular-nums">
            {data.activeSubscriptions.value ?? "—"}
          </span>
        </div>
      </article>
    </section>
  );
}

export default KpiStrip;
