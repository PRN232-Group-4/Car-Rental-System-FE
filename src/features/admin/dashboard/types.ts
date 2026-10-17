export type DashboardDatePreset = "7d" | "30d" | "this_month" | "last_month" | "custom";

export interface DashboardFilters {
  from: string; // ISO UTC
  to: string; // ISO UTC
  preset: DashboardDatePreset;
  facilityId?: number;
  vehicleTypeId?: number;
}

export interface KpiValue {
  value: number | null;
  previous: number | null;
  unit?: string;
  format?: "currency" | "number" | "percentage";
}

export interface DashboardKpis {
  revenue: KpiValue;
  completedRentals: KpiValue;
  rentingVehicles: KpiValue;
  totalVehicles: KpiValue;
  utilizationRate: KpiValue;
  maintenanceCost: KpiValue;
  activeSubscriptions: KpiValue;
}

export interface RevenuePoint {
  bucket: string; // Nhãn ngày GMT+7: "dd/MM"
  dateIso: string;
  total: number;
  byGroup?: Record<string, number>;
}

export type FleetStatusKey = "available" | "renting" | "maintenance" | "inactive";
export type FleetStatus = Record<FleetStatusKey, number>;

export interface RentalStatusCount {
  status: string;
  label: string;
  count: number;
}

export interface TopVehicleRow {
  vehicleId: number;
  name: string;
  category: string;
  revenue: number;
  rentals: number;
  hours: number;
  utilization: number; // 0 - 100%
}

export interface MaintenanceVsRevenueRow {
  vehicleId: number;
  name: string;
  maintenanceCost: number;
  revenue: number;
  isHighCost: boolean; // maintenanceCost > revenue
}

export interface PlanUsageRow {
  planId: number;
  name: string;
  usedHours: number;
  includedHours: number;
  activeSubscribers: number;
  usagePercentage: number;
}
