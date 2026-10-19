"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { BarChart3 } from "lucide-react";
import { AuthGate } from "@/features/auth/AuthGate";
import { getPresetDateRange } from "@/features/admin/dashboard/api";
import {
  useDashboardKpis,
  useRevenueSeries,
  useFleetStatus,
  useRentalsByStatus,
  useTopVehicles,
  useMaintenanceVsRevenue,
  usePlanUsage,
  useRefreshAllDashboard,
} from "@/features/admin/dashboard/hooks";
import { DashboardFiltersBar } from "@/features/admin/dashboard/components/DashboardFiltersBar";
import { KpiStrip } from "@/features/admin/dashboard/components/KpiStrip";
import { RevenueChart } from "@/features/admin/dashboard/components/RevenueChart";
import { FleetStatusChart } from "@/features/admin/dashboard/components/FleetStatusChart";
import { RentalsStatusChart } from "@/features/admin/dashboard/components/RentalsStatusChart";
import { TopVehiclesTable } from "@/features/admin/dashboard/components/TopVehiclesTable";
import { MaintenanceVsRevenueChart } from "@/features/admin/dashboard/components/MaintenanceVsRevenueChart";
import { PlanUsageChart } from "@/features/admin/dashboard/components/PlanUsageChart";
import type { DashboardFilters, DashboardDatePreset } from "@/features/admin/dashboard/types";

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refreshAll = useRefreshAllDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());

  // Đọc bộ lọc từ URL hoặc mặc định 30 ngày qua
  const defaultRange = useMemo(() => getPresetDateRange("30d"), []);

  const filters: DashboardFilters = useMemo(() => {
    const preset = (searchParams.get("preset") as DashboardDatePreset) || "30d";
    const from = searchParams.get("from") || defaultRange.from;
    const to = searchParams.get("to") || defaultRange.to;
    const facilityId = searchParams.get("facilityId") ? Number(searchParams.get("facilityId")) : undefined;
    const vehicleTypeId = searchParams.get("vehicleTypeId") ? Number(searchParams.get("vehicleTypeId")) : undefined;

    return {
      preset,
      from,
      to,
      facilityId,
      vehicleTypeId,
    };
  }, [searchParams, defaultRange]);

  const handleFiltersChange = useCallback(
    (newFilters: DashboardFilters) => {
      const params = new URLSearchParams();
      params.set("preset", newFilters.preset);
      params.set("from", newFilters.from);
      params.set("to", newFilters.to);
      if (newFilters.facilityId) params.set("facilityId", String(newFilters.facilityId));
      if (newFilters.vehicleTypeId) params.set("vehicleTypeId", String(newFilters.vehicleTypeId));

      router.replace(`/admin/dashboard?${params.toString()}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAll]);

  // Từng widget có query độc lập
  const kpisQuery = useDashboardKpis(filters);
  const revenueQuery = useRevenueSeries(filters);
  const fleetQuery = useFleetStatus(filters);
  const rentalsQuery = useRentalsByStatus(filters);
  const topVehiclesQuery = useTopVehicles(filters);
  const maintenanceQuery = useMaintenanceVsRevenue(filters);
  const planUsageQuery = usePlanUsage(filters);

  const exportData = useMemo(
    () => ({
      kpis: kpisQuery.data,
      revenue: revenueQuery.data,
      fleetStatus: fleetQuery.data,
      rentalsStatus: rentalsQuery.data,
      topVehicles: topVehiclesQuery.data,
      maintenance: maintenanceQuery.data,
      planUsage: planUsageQuery.data,
    }),
    [
      kpisQuery.data,
      revenueQuery.data,
      fleetQuery.data,
      rentalsQuery.data,
      topVehiclesQuery.data,
      maintenanceQuery.data,
      planUsageQuery.data,
    ]
  );

  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Trung tâm Chỉ huy Điều hành & Doanh thu
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-ink-3">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
                  Thời gian thực (FR-030)
                </span>
              </div>
              <p className="mt-1.5 text-xs text-ink-3 sm:text-sm">
                Giám sát dòng tiền thực thu, hiệu suất khai thác đội xe, tỷ lệ đơn hàng và rủi ro chi phí theo múi giờ GMT+7.
              </p>
            </div>
          </div>

          {/* Thanh bộ lọc và xuất CSV */}
          <DashboardFiltersBar
            filters={filters}
            onChange={handleFiltersChange}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            exportData={exportData}
          />

          {/* Dải chỉ số Hero Telemetry */}
          <KpiStrip
            data={kpisQuery.data}
            isLoading={kpisQuery.isLoading}
            isError={kpisQuery.isError}
            onRetry={() => kpisQuery.refetch()}
          />

          {/* Phân khu 1: Dòng tiền & Cân đối Đội xe */}
          <section aria-labelledby="cashflow-heading" className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                <h2 id="cashflow-heading" className="text-xs font-bold uppercase tracking-wider text-ink sm:text-sm">
                  Phân khu 1: Dòng tiền & Cân đối Đội xe
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-3">OPS.TELEMETRY // CASHFLOW</span>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <RevenueChart
                data={revenueQuery.data}
                isLoading={revenueQuery.isLoading}
                isError={revenueQuery.isError}
                onRetry={() => revenueQuery.refetch()}
              />
              <FleetStatusChart
                data={fleetQuery.data}
                isLoading={fleetQuery.isLoading}
                isError={fleetQuery.isError}
                onRetry={() => fleetQuery.refetch()}
              />
            </div>
          </section>

          {/* Phân khu 2: Năng suất Phương tiện & Phân bổ Đơn thuê */}
          <section aria-labelledby="productivity-heading" className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                <h2 id="productivity-heading" className="text-xs font-bold uppercase tracking-wider text-ink sm:text-sm">
                  Phân khu 2: Năng suất Phương tiện & Phân bổ Đơn thuê
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-3">OPS.TELEMETRY // ASSET_YIELD</span>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <TopVehiclesTable
                data={topVehiclesQuery.data}
                isLoading={topVehiclesQuery.isLoading}
                isError={topVehiclesQuery.isError}
                onRetry={() => topVehiclesQuery.refetch()}
              />
              <RentalsStatusChart
                data={rentalsQuery.data}
                isLoading={rentalsQuery.isLoading}
                isError={rentalsQuery.isError}
                onRetry={() => rentalsQuery.refetch()}
              />
            </div>
          </section>

          {/* Phân khu 3: Rủi ro Bảo dưỡng & Hội viên Thuê bao */}
          <section aria-labelledby="risk-heading" className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
                <h2 id="risk-heading" className="text-xs font-bold uppercase tracking-wider text-ink sm:text-sm">
                  Phân khu 3: Kiểm soát Chi phí Bảo dưỡng & Hội viên Thuê bao
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-3">OPS.TELEMETRY // RISK_ANALYSIS</span>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <MaintenanceVsRevenueChart
                data={maintenanceQuery.data}
                isLoading={maintenanceQuery.isLoading}
                isError={maintenanceQuery.isError}
                onRetry={() => maintenanceQuery.refetch()}
              />
              <PlanUsageChart
                data={planUsageQuery.data}
                isLoading={planUsageQuery.isLoading}
                isError={planUsageQuery.isError}
                onRetry={() => planUsageQuery.refetch()}
              />
            </div>
          </section>
        </div>
    </AuthGate>
  );
}
