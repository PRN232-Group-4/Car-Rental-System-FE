"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { BarChart3, Database } from "lucide-react";
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
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Dashboard điều hành & Biểu đồ
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-ink-3">
                  <Database className="h-3 w-3 text-primary" />
                  Dữ liệu mẫu BE-28
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-3">
                Theo dõi doanh thu, hiệu suất khai thác đội xe, chi phí bảo trì và gói hội viên theo thời gian thực (FR-030).
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

          {/* Dải chỉ số KPI */}
          <KpiStrip
            data={kpisQuery.data}
            isLoading={kpisQuery.isLoading}
            isError={kpisQuery.isError}
            onRetry={() => kpisQuery.refetch()}
          />

          {/* Lưới biểu đồ điều hành */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Hàng 1: Doanh thu theo thời gian + Hiện trạng đội xe */}
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

            {/* Hàng 2: Top phương tiện + Phân bổ đơn theo trạng thái */}
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

            {/* Hàng 3: Bảo dưỡng vs Doanh thu + Hiệu quả gói thuê bao */}
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
        </div>
    </AuthGate>
  );
}
