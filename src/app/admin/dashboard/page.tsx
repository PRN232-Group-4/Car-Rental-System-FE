"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
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
import { RentalsVolumeChart } from "@/features/admin/dashboard/components/RentalsVolumeChart";
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
          <TransitFolio
            index="01"
            tag="OPS"
            kicker="TRẠM VẬN HÀNH · DASHBOARD BIỂU ĐỒ"
            title={<>Chỉ huy điều hành & <em className="italic text-td-teal">doanh thu.</em></>}
            description="Giám sát dòng tiền thực thu, hiệu suất khai thác đội xe, tỷ lệ đơn hàng và rủi ro chi phí theo múi giờ GMT+7."
          >
            <span className="inline-flex items-center gap-1.5 border-l border-td-rule pl-4 text-[11px] font-semibold text-td-muted">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
              Thời gian thực (FR-030)
            </span>
          </TransitFolio>

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
            <div className="flex items-center justify-between border-b border-td-ink pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-td-oxide" aria-hidden="true" />
                <h2 id="cashflow-heading" className="font-mono text-[11px] font-bold uppercase tracking-wider text-td-ink sm:text-xs">
                  Phân khu 1: Dòng tiền & Cân đối Đội xe
                </h2>
              </div>
              <span className="font-mono text-[11px] text-td-muted">OPS.TELEMETRY // CASHFLOW</span>
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
            {/* Cùng nguồn revenue-series: số lượt thuê thực tế bắt đầu theo từng ngày. */}
            <div className="grid grid-cols-1 gap-6">
              <RentalsVolumeChart
                data={revenueQuery.data}
                isLoading={revenueQuery.isLoading}
                isError={revenueQuery.isError}
                onRetry={() => revenueQuery.refetch()}
              />
            </div>
          </section>

          {/* Phân khu 2: Năng suất Phương tiện & Phân bổ Đơn thuê */}
          <section aria-labelledby="productivity-heading" className="space-y-4">
            <div className="flex items-center justify-between border-b border-td-ink pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-td-oxide" aria-hidden="true" />
                <h2 id="productivity-heading" className="font-mono text-[11px] font-bold uppercase tracking-wider text-td-ink sm:text-xs">
                  Phân khu 2: Năng suất Phương tiện & Phân bổ Đơn thuê
                </h2>
              </div>
              <span className="font-mono text-[11px] text-td-muted">OPS.TELEMETRY // ASSET_YIELD</span>
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
            <div className="flex items-center justify-between border-b border-td-ink pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-warning" aria-hidden="true" />
                <h2 id="risk-heading" className="font-mono text-[11px] font-bold uppercase tracking-wider text-td-ink sm:text-xs">
                  Phân khu 3: Kiểm soát Chi phí Bảo dưỡng & Hội viên Thuê bao
                </h2>
              </div>
              <span className="font-mono text-[11px] text-td-muted">OPS.TELEMETRY // RISK_ANALYSIS</span>
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
