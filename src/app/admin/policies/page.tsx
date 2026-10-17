"use client";

import { useState, useMemo } from "react";
import { Plus, ShieldAlert, AlertTriangle, HelpCircle, Shield } from "lucide-react";
import StaffShell from "@/features/admin/StaffShell";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { AuthGate } from "@/features/auth/AuthGate";
import { formatDateTime } from "@/lib/time";
import {
  usePolicies,
  useVehicleTypes,
} from "@/features/admin/policies/hooks";
import {
  auditPoliciesByVehicleType,
} from "@/features/admin/policies/pricing-calculator";
import { PolicyDrawer } from "@/features/admin/policies/components/PolicyDrawer";
import type { RentalPolicy } from "@/features/admin/policies/types";

export default function PoliciesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVehicleTypeFilter, setSelectedVehicleTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: policies = [], isLoading: policiesLoading } = usePolicies();
  const { data: vehicleTypes = [], isLoading: typesLoading } = useVehicleTypes();

  // Kiểm tra xung đột hoặc thiếu chính sách theo từng loại xe
  const audits = useMemo(() => {
    return auditPoliciesByVehicleType(policies, vehicleTypes);
  }, [policies, vehicleTypes]);

  const conflicts = audits.filter((a) => a.hasConflict);
  const missings = audits.filter((a) => a.isMissing);

  // Lọc dữ liệu hiển thị
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      if (
        selectedVehicleTypeFilter !== "ALL" &&
        p.vehicleTypeId !== Number(selectedVehicleTypeFilter)
      ) {
        return false;
      }
      if (statusFilter === "ACTIVE" && !p.isActive) return false;
      if (statusFilter === "INACTIVE" && p.isActive) return false;
      return true;
    });
  }, [policies, selectedVehicleTypeFilter, statusFilter]);

  const activePoliciesList = useMemo(() => {
    return policies.filter((p) => p.isActive);
  }, [policies]);

  const columns = useMemo<ColumnDef<RentalPolicy>[]>(
    () => [
      {
        id: "vehicleType",
        header: "Loại xe áp dụng",
        cell: ({ row }) => (
          <div className="font-semibold text-ink">
            {row.original.vehicleTypeName || `Loại xe #${row.original.vehicleTypeId}`}
          </div>
        ),
      },
      {
        id: "name",
        header: "Tên phiên bản",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-ink">{row.original.name}</div>
            <div className="text-[11px] text-ink-3 font-mono">Mã bản: #{row.original.id}</div>
          </div>
        ),
      },
      {
        id: "vatRate",
        header: "Thuế VAT",
        cell: ({ row }) => (
          <span className="font-mono font-medium text-ink">{row.original.vatRate}%</span>
        ),
      },
      {
        id: "depositPercentage",
        header: "Đặt cọc",
        cell: ({ row }) => (
          <span className="font-mono font-medium text-ink">
            {row.original.depositPercentage}%
          </span>
        ),
      },
      {
        id: "overtimeFeeRate",
        header: "Phí trễ",
        cell: ({ row }) => (
          <span className="font-mono font-medium text-ink">
            {row.original.overtimeFeeRate}% / giờ
          </span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.isActive ? "active" : "draft"}
            label={row.original.isActive ? "Đang áp dụng" : "Đã ngừng"}
          />
        ),
      },
      {
        id: "createdAt",
        header: "Thời gian tạo (GMT+7)",
        cell: ({ row }) => (
          <span className="text-xs text-ink-3 font-mono">
            {row.original.createdAt ? formatDateTime(row.original.createdAt) : "—"}
          </span>
        ),
      },
      {
        id: "managedBy",
        header: "Người lập",
        cell: ({ row }) => (
          <span className="text-xs text-ink-2">{row.original.managedBy || "Hệ thống"}</span>
        ),
      },
    ],
    []
  );

  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
      <StaffShell>
        <div className="space-y-6">
          {/* Header với tooltip bất biến */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Shield className="w-4 h-4" />
                <span>Điều Khoản & Pháp Lý</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink mt-1">
                Chính sách thuê & Đặt cọc
              </h1>
              <p className="text-sm text-ink-3 mt-1 max-w-2xl">
                Chính sách thuê là bất biến theo phiên bản nhằm bảo vệ tính toàn vẹn của hợp đồng đã ký. Để điều chỉnh điều khoản, vui lòng tạo một phiên bản mới.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="hidden sm:flex items-center gap-1.5 text-xs text-ink-3 bg-surface border border-line px-3 py-1.5 rounded-lg"
                title="Quy tắc hệ thống: Không có chức năng Sửa hoặc Xóa chính sách đã ban hành"
              >
                <HelpCircle className="w-4 h-4 text-ink-3" aria-hidden="true" />
                <span>Chính sách bất biến</span>
              </div>
              <Button
                variant="primary"
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Tạo phiên bản mới</span>
              </Button>
            </div>
          </div>

          {/* Banner cảnh báo xung đột (nhiều policy active) */}
          {conflicts.map((c) => (
            <div
              key={c.vehicleTypeId}
              className="flex items-start gap-3 p-4 rounded-xl bg-warning-bg/40 border border-warning/20 text-ink text-sm"
            >
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-semibold text-ink">
                  Cảnh báo: Có {c.activeCount} chính sách cùng đang áp dụng cho loại xe &quot;{c.vehicleTypeName}&quot;
                </p>
                <p className="text-xs text-ink-2">
                  Hệ thống theo quy tắc sẽ tự động áp dụng phiên bản mới nhất (&quot;
                  {c.latestActivePolicy?.name}&quot; #{c.latestActivePolicy?.id}) cho các đơn thuê mới.
                </p>
              </div>
            </div>
          ))}

          {/* Banner lỗi chặn (không có policy active) */}
          {missings.map((m) => (
            <div
              key={m.vehicleTypeId}
              className="flex items-start gap-3 p-4 rounded-xl bg-danger-bg/40 border border-danger/20 text-ink text-sm"
            >
              <ShieldAlert className="w-5 h-5 text-danger shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-semibold text-danger">
                  Chặn nghiệp vụ: Loại xe &quot;{m.vehicleTypeName}&quot; chưa có chính sách đang áp dụng
                </p>
                <p className="text-xs text-ink-2">
                  Khách hàng sẽ không thể đặt xe thuộc loại này cho đến khi có ít nhất một chính sách được kích hoạt.
                </p>
              </div>
            </div>
          ))}

          {/* Bộ lọc loại xe và trạng thái */}
          <div className="bg-surface rounded-xl border border-line p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label htmlFor="filter-vehicle-type" className="sr-only">
                  Lọc theo loại xe
                </label>
                <select
                  id="filter-vehicle-type"
                  value={selectedVehicleTypeFilter}
                  onChange={(e) => setSelectedVehicleTypeFilter(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-line bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ALL">Tất cả loại xe ({vehicleTypes.length})</option>
                  {vehicleTypes.map((vt) => (
                    <option key={vt.id} value={vt.id}>
                      {vt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-status" className="sr-only">
                  Lọc theo trạng thái
                </label>
                <select
                  id="filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-line bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang áp dụng</option>
                  <option value="INACTIVE">Đã ngừng</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-ink-3 font-mono">
              Hiển thị {filteredPolicies.length} phiên bản chính sách
            </div>
          </div>

          {/* Danh sách bảng chính sách */}
          <div className="bg-surface rounded-2xl border border-line shadow-sm overflow-hidden">
            <DataTable
              caption="Danh sách các phiên bản chính sách thuê và đặt cọc"
              columns={columns}
              data={filteredPolicies}
              loading={policiesLoading || typesLoading}
              emptyTitle="Chưa có chính sách thuê nào"
              emptyDescription="Nhấn vào nút 'Tạo phiên bản mới' ở góc trên để thiết lập điều khoản thuê đầu tiên."
            />
          </div>

          {/* Drawer tạo phiên bản mới */}
          <PolicyDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            vehicleTypes={vehicleTypes}
            activePolicies={activePoliciesList}
          />
        </div>
      </StaffShell>
    </AuthGate>
  );
}
