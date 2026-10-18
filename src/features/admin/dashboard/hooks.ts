import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { DashboardFilters } from "./types";
import {
  fetchDashboardKpis,
  fetchRevenueSeries,
  fetchFleetStatus,
  fetchRentalsByStatus,
  fetchTopVehicles,
  fetchMaintenanceVsRevenue,
  fetchPlanUsage,
} from "./api";

export const DASHBOARD_QUERY_KEYS = {
  all: ["admin-dashboard"] as const,
  kpis: (filters: DashboardFilters) => ["admin-dashboard", "kpis", filters] as const,
  revenue: (filters: DashboardFilters) => ["admin-dashboard", "revenue", filters] as const,
  fleetStatus: (filters: DashboardFilters) => ["admin-dashboard", "fleet-status", filters] as const,
  rentalsStatus: (filters: DashboardFilters) => ["admin-dashboard", "rentals-status", filters] as const,
  topVehicles: (filters: DashboardFilters) => ["admin-dashboard", "top-vehicles", filters] as const,
  maintenanceVsRevenue: (filters: DashboardFilters) => ["admin-dashboard", "maintenance-vs-revenue", filters] as const,
  planUsage: (filters: DashboardFilters) => ["admin-dashboard", "plan-usage", filters] as const,
};

function isRangeIncludingToday(toUtc: string): boolean {
  if (!toUtc) return false;
  const to = new Date(toUtc);
  const now = new Date();
  // Nếu mốc to lớn hơn hoặc bằng đầu ngày hôm nay
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  return to.getTime() >= startOfToday.getTime();
}

export function useDashboardKpis(filters: DashboardFilters) {
  const shouldAutoRefetch = isRangeIncludingToday(filters.to);
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.kpis(filters),
    queryFn: () => fetchDashboardKpis(filters),
    staleTime: 30 * 1000,
    refetchInterval: shouldAutoRefetch ? 60 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useRevenueSeries(filters: DashboardFilters) {
  const shouldAutoRefetch = isRangeIncludingToday(filters.to);
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.revenue(filters),
    queryFn: () => fetchRevenueSeries(filters),
    staleTime: 30 * 1000,
    refetchInterval: shouldAutoRefetch ? 60 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useFleetStatus(filters: DashboardFilters) {
  const shouldAutoRefetch = isRangeIncludingToday(filters.to);
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.fleetStatus(filters),
    queryFn: () => fetchFleetStatus(filters),
    staleTime: 30 * 1000,
    refetchInterval: shouldAutoRefetch ? 60 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useRentalsByStatus(filters: DashboardFilters) {
  const shouldAutoRefetch = isRangeIncludingToday(filters.to);
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.rentalsStatus(filters),
    queryFn: () => fetchRentalsByStatus(filters),
    staleTime: 30 * 1000,
    refetchInterval: shouldAutoRefetch ? 60 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useTopVehicles(filters: DashboardFilters) {
  const shouldAutoRefetch = isRangeIncludingToday(filters.to);
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.topVehicles(filters),
    queryFn: () => fetchTopVehicles(filters),
    staleTime: 30 * 1000,
    refetchInterval: shouldAutoRefetch ? 60 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useMaintenanceVsRevenue(filters: DashboardFilters) {
  const shouldAutoRefetch = isRangeIncludingToday(filters.to);
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.maintenanceVsRevenue(filters),
    queryFn: () => fetchMaintenanceVsRevenue(filters),
    staleTime: 30 * 1000,
    refetchInterval: shouldAutoRefetch ? 60 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}

export function usePlanUsage(filters: DashboardFilters) {
  const shouldAutoRefetch = isRangeIncludingToday(filters.to);
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.planUsage(filters),
    queryFn: () => fetchPlanUsage(filters),
    staleTime: 30 * 1000,
    refetchInterval: shouldAutoRefetch ? 60 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useRefreshAllDashboard() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
  }, [queryClient]);
}
