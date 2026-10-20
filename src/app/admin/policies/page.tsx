"use client";

import { useState, useMemo } from "react";
import { Plus, ShieldAlert, AlertTriangle, HelpCircle } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { TransitFolio, TransitFolioMetric } from "@/features/admin/transit-desk/TransitFolio";
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
          <div className="font-semibold text-td-ink">
            {row.original.vehicleTypeName || `Loại xe #${row.original.vehicleTypeId}`}
          </div>
        ),
      },
      {
        id: "name",
        header: "Tên phiên bản",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-td-ink">{row.original.name}</div>
            <div className="text-[11px] text-td-muted font-mono">Mã bản: #{row.original.id}</div>
          </div>
        ),
      },
      {
        id: "vatRate",
        header: "Thuế VAT",
        cell: ({ row }) => (
          <span className="font-mono font-medium text-td-ink">{row.original.vatRate}%</span>
        ),
      },
      {
        id: "depositPercentage",
        header: "Đặt cọc",
        cell: ({ row }) => (
          <span className="font-mono font-medium text-td-ink">
            {row.original.depositPercentage}%
          </span>
        ),
      },
      {
        id: "overtimeFeeRate",
        header: "Phí trễ",
        cell: ({ row }) => (
          <span className="font-mono font-medium text-td-ink">
            {row.original.overtimeFeeRate}% / giờ
          </span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <AdminStatusBadge domain="activity" status={row.original.isActive ? "active" : "inactive"}>
            {row.original.isActive ? "Đang áp dụng" : "Đã ngừng"}
          </AdminStatusBadge>
        ),
      },
      {
        id: "createdAt",
        header: "Thời gian tạo (GMT+7)",
        cell: ({ row }) => (
          <span className="text-xs text-td-muted font-mono">
            {row.original.createdAt ? formatDateTime(row.original.createdAt) : "—"}
          </span>
        ),
      },
      {
        id: "managedBy",
        header: "Người lập",
        cell: ({ row }) => (
          <span className="text-xs text-td-ink">{row.original.managedBy || "Hệ thống"}</span>
        ),
      },
    ],
    []
  );

  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
        <div className="space-y-6">
          {/* Header */}
          <TransitFolio
            index="06"
            tag="PLC"
            kicker="CHÍNH SÁCH · ĐIỀU KHOẢN & PHÁP LÝ"
            title={<>Chính sách thuê & <em className="italic text-td-teal">đặt cọc.</em></>}
            description="Chính sách thuê là bất biến theo phiên bản nhằm bảo vệ tính toàn vẹn của hợp đồng đã ký. Để điều chỉnh điều khoản, vui lòng tạo một phiên bản mới."
          >
            <TransitFolioMetric label="PHIÊN BẢN · ĐANG HIỂN THỊ" value={String(filteredPolicies.length).padStart(2, "0")} />
            <span
              className="hidden items-center gap-1.5 border-l border-td-rule pl-4 text-[11px] text-td-muted sm:flex"
              title="Quy tắc hệ thống: Không có chức năng Sửa hoặc Xóa chính sách đã ban hành"
            >
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Chính sách bất biến</span>
            </span>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded bg-td-oxide px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-td-oxide-hover"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Tạo phiên bản mới</span>
            </button>
          </TransitFolio>

          {/* Banner cảnh báo xung đột (nhiều policy active) */}
          {conflicts.map((c) => (
            <div
              key={c.vehicleTypeId}
              className="flex items-start gap-3 border-l-2 border-warning bg-warning-bg/40 px-4 py-3 text-sm text-td-ink"
            >
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-semibold text-td-ink">
                  Cảnh báo: Có {c.activeCount} chính sách cùng đang áp dụng cho loại xe &quot;{c.vehicleTypeName}&quot;
                </p>
                <p className="text-xs text-td-ink">
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
              className="flex items-start gap-3 border-l-2 border-danger bg-danger-bg/40 px-4 py-3 text-sm text-td-ink"
            >
              <ShieldAlert className="w-5 h-5 text-danger shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-semibold text-danger">
                  Chặn nghiệp vụ: Loại xe &quot;{m.vehicleTypeName}&quot; chưa có chính sách đang áp dụng
                </p>
                <p className="text-xs text-td-ink">
                  Khách hàng sẽ không thể đặt xe thuộc loại này cho đến khi có ít nhất một chính sách được kích hoạt.
                </p>
              </div>
            </div>
          ))}

          {/* Bộ lọc loại xe và trạng thái */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-td-rule py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label htmlFor="filter-vehicle-type" className="sr-only">
                  Lọc theo loại xe
                </label>
                <select
                  id="filter-vehicle-type"
                  value={selectedVehicleTypeFilter}
                  onChange={(e) => setSelectedVehicleTypeFilter(e.target.value)}
                  className="h-8 rounded border border-td-rule bg-transparent px-2 font-mono text-xs text-td-ink focus:border-td-ink focus:outline-none"
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
                  className="h-8 rounded border border-td-rule bg-transparent px-2 font-mono text-xs text-td-ink focus:border-td-ink focus:outline-none"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang áp dụng</option>
                  <option value="INACTIVE">Đã ngừng</option>
                </select>
              </div>
            </div>

            <div className="font-mono text-[11px] text-td-muted">
              Hiển thị {filteredPolicies.length} phiên bản chính sách
            </div>
          </div>

          {/* Danh sách bảng chính sách */}
          <div className="border-t border-td-ink">
            <DataTable
              className="!border-t-0"
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
    </AuthGate>
  );
}
