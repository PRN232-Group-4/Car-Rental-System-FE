"use client";

import { useTransition } from "react";
import { RefreshCw, Download, Calendar, Building2, Car } from "lucide-react";
import { formatDateTime, formatDate, toUtcIso } from "@/lib/time";
import { getPresetDateRange } from "../api";
import { exportToCsv } from "../csv-export";
import type {
  DashboardFilters,
  DashboardDatePreset,
  DashboardKpis,
  RevenuePoint,
  FleetStatus,
  RentalStatusCount,
  TopVehicleRow,
  MaintenanceVsRevenueRow,
  PlanUsageRow,
} from "../types";

export interface DashboardExportData {
  kpis?: DashboardKpis;
  revenue?: RevenuePoint[];
  fleetStatus?: FleetStatus;
  rentalsStatus?: RentalStatusCount[];
  topVehicles?: TopVehicleRow[];
  maintenance?: MaintenanceVsRevenueRow[];
  planUsage?: PlanUsageRow[];
}

interface DashboardFiltersBarProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  lastUpdated: Date;
  exportData?: DashboardExportData;
}

const PRESET_OPTIONS: { id: DashboardDatePreset; label: string }[] = [
  { id: "7d", label: "7 ngày qua" },
  { id: "30d", label: "30 ngày qua" },
  { id: "this_month", label: "Tháng này" },
  { id: "last_month", label: "Tháng trước" },
  { id: "custom", label: "Tùy chọn" },
];

export function DashboardFiltersBar({
  filters,
  onChange,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
  exportData,
}: DashboardFiltersBarProps) {
  const [isPending, startTransition] = useTransition();

  const handleSelectPreset = (preset: DashboardDatePreset) => {
    if (preset === "custom") {
      onChange({ ...filters, preset: "custom" });
      return;
    }
    const range = getPresetDateRange(preset);
    startTransition(() => {
      onChange({
        ...filters,
        preset,
        from: range.from,
        to: range.to,
      });
    });
  };

  const handleCustomDateChange = (field: "from" | "to", dateString: string) => {
    if (!dateString) return;
    const parts = dateString.split("-").map(Number);
    if (parts.length !== 3) return;
    const date =
      field === "from"
        ? new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0)
        : new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);

    onChange({
      ...filters,
      preset: "custom",
      [field]: toUtcIso(date),
    });
  };

  const handleExportCsv = () => {
    const fromStr = formatDate(new Date(filters.from), "yyyyMMdd");
    const toStr = formatDate(new Date(filters.to), "yyyyMMdd");
    const filename = `thong-dong-dashboard-${fromStr}-${toStr}`;

    const headers = ["Phân loại", "Chỉ số / Tên", "Giá trị kỳ này", "Giá trị kỳ trước / Ghi chú"];
    const rows: (string | number)[][] = [];

    // KPI Rows
    if (exportData?.kpis) {
      const k = exportData.kpis;
      rows.push(["KPI", "Doanh thu (VND)", k.revenue.value ?? 0, k.revenue.previous ?? "—"]);
      rows.push(["KPI", "Số đơn hoàn tất", k.completedRentals.value ?? 0, k.completedRentals.previous ?? "—"]);
      rows.push(["KPI", "Xe đang thuê", k.rentingVehicles.value ?? 0, k.rentingVehicles.previous ?? "—"]);
      rows.push(["KPI", "Tổng xe", k.totalVehicles.value ?? 0, k.totalVehicles.previous ?? "—"]);
      rows.push(["KPI", "Tỉ lệ khai thác (%)", `${k.utilizationRate.value ?? 0}%`, `${k.utilizationRate.previous ?? 0}%`]);
      rows.push(["KPI", "Chi phí bảo dưỡng (VND)", k.maintenanceCost.value ?? 0, k.maintenanceCost.previous ?? "—"]);
      rows.push(["KPI", "Gói đang hoạt động", k.activeSubscriptions.value ?? 0, k.activeSubscriptions.previous ?? "—"]);
    }

    // Top Vehicles Rows
    if (exportData?.topVehicles) {
      exportData.topVehicles.forEach((v) => {
        rows.push(["Top Xe", v.name, `${v.revenue.toLocaleString("vi-VN")} đ`, `${v.rentals} lượt (${v.utilization}%)`]);
      });
    }

    // Maintenance vs Revenue
    if (exportData?.maintenance) {
      exportData.maintenance.forEach((m) => {
        rows.push([
          "Bảo dưỡng vs Doanh thu",
          m.name,
          `Bảo dưỡng: ${m.maintenanceCost.toLocaleString("vi-VN")} đ`,
          `Doanh thu: ${m.revenue.toLocaleString("vi-VN")} đ ${m.isHighCost ? "[CẢNH BÁO CHI PHÍ CAO]" : ""}`,
        ]);
      });
    }

    // Plan Usage
    if (exportData?.planUsage) {
      exportData.planUsage.forEach((p) => {
        rows.push([
          "Gói thuê bao",
          p.name,
          `${p.usedHours} / ${p.includedHours === null ? "Không giới hạn" : p.includedHours} giờ (${p.usagePercentage === null ? "Không áp dụng" : `${p.usagePercentage}%`})`,
          `${p.activeSubscribers} người dùng`,
        ]);
      });
    }

    exportToCsv({ filename, headers, rows });
  };

  const fromDateFormatted = formatDate(new Date(filters.from), "yyyy-MM-dd");
  const toDateFormatted = formatDate(new Date(filters.to), "yyyy-MM-dd");

  return (
    <div className="flex flex-col gap-4 border-t border-td-ink pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Nhóm nút preset */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Khoảng thời gian báo cáo">
          {PRESET_OPTIONS.map((p) => {
            const isSelected = filters.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`rounded px-2.5 py-1 text-[11px] font-bold transition ${
                  isSelected
                    ? "bg-td-oxide text-white"
                    : "border border-td-rule text-td-ink hover:bg-td-chalk"
                }`}
                aria-pressed={isSelected}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Nút tác vụ Refresh & CSV */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-td-muted">
            Dữ liệu tính đến {formatDateTime(lastUpdated, "HH:mm")} (GMT+7)
          </span>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing || isPending}
            className="inline-flex items-center gap-1.5 rounded border border-td-rule px-2.5 py-1 text-xs font-semibold text-td-ink transition hover:bg-td-chalk active:bg-td-chalk disabled:opacity-50"
            aria-label="Làm mới dữ liệu dashboard"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-td-oxide" : "text-td-muted"}`} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded border border-td-rule px-2.5 py-1 text-xs font-semibold text-td-ink transition hover:bg-td-chalk active:bg-td-chalk"
            aria-label="Xuất dữ liệu bảng ra file CSV"
          >
            <Download className="h-3.5 w-3.5 text-td-muted" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Dòng bộ lọc chi tiết: Tùy chỉnh ngày, Chi nhánh, Loại xe */}
      <div className="grid grid-cols-1 gap-3 border-t border-td-rule pt-3 sm:grid-cols-2 lg:grid-cols-4">
        {filters.preset === "custom" && (
          <>
            <div>
              <label htmlFor="filter-from-date" className="block text-xs font-medium text-td-muted">
                Từ ngày (GMT+7)
              </label>
              <div className="mt-1 flex items-center gap-2 rounded border border-td-rule px-2.5 py-1">
                <Calendar className="h-4 w-4 text-td-muted" />
                <input
                  id="filter-from-date"
                  type="date"
                  value={fromDateFormatted}
                  onChange={(e) => handleCustomDateChange("from", e.target.value)}
                  className="w-full bg-transparent text-xs text-td-ink focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="filter-to-date" className="block text-xs font-medium text-td-muted">
                Đến ngày (GMT+7)
              </label>
              <div className="mt-1 flex items-center gap-2 rounded border border-td-rule px-2.5 py-1">
                <Calendar className="h-4 w-4 text-td-muted" />
                <input
                  id="filter-to-date"
                  type="date"
                  value={toDateFormatted}
                  onChange={(e) => handleCustomDateChange("to", e.target.value)}
                  className="w-full bg-transparent text-xs text-td-ink focus:outline-none"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label htmlFor="filter-facility" className="block text-xs font-medium text-td-muted">
            Chi nhánh hoạt động
          </label>
          <div className="mt-1 flex items-center gap-2 rounded border border-td-rule px-2.5 py-1">
            <Building2 className="h-4 w-4 text-td-muted" />
            <select
              id="filter-facility"
              value={filters.facilityId ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  facilityId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full bg-transparent text-xs text-td-ink focus:outline-none"
            >
              <option value="">Tất cả chi nhánh</option>
              <option value="1">Chi nhánh Quận 1 (Trụ sở chính)</option>
              <option value="2">Chi nhánh Sân bay Tân Sơn Nhất</option>
              <option value="3">Chi nhánh TP. Thủ Đức</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="filter-vehicle-type" className="block text-xs font-medium text-td-muted">
            Loại phương tiện
          </label>
          <div className="mt-1 flex items-center gap-2 rounded border border-td-rule px-2.5 py-1">
            <Car className="h-4 w-4 text-td-muted" />
            <select
              id="filter-vehicle-type"
              value={filters.vehicleTypeId ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  vehicleTypeId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full bg-transparent text-xs text-td-ink focus:outline-none"
            >
              <option value="">Tất cả loại xe</option>
              <option value="1">Ô tô điện cao cấp</option>
              <option value="2">Ô tô xăng gia đình</option>
              <option value="3">Xe máy điện đô thị</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
