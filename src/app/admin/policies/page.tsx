"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { TransitFolio, TransitFolioMetric } from "@/features/admin/transit-desk/TransitFolio";
import { AuthGate } from "@/features/auth/AuthGate";
import { formatDateTime } from "@/lib/time";
import {
  useDeletePolicy,
  usePolicies,
  useVehicleTypes,
} from "@/features/admin/policies/hooks";
import { PolicyModal } from "@/features/admin/policies/components/PolicyModal";
import { PolicyDetailDrawer } from "@/features/admin/policies/components/PolicyDetailDrawer";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { notifyApiError, notifySuccess } from "@/components/ui/Toaster";
import type { RentalPolicy } from "@/features/admin/policies/types";
import { InlineSelect } from "@/components/forms/inline-validation";

export default function PoliciesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVehicleTypeFilter, setSelectedVehicleTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [detailPolicy, setDetailPolicy] = useState<RentalPolicy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RentalPolicy | null>(null);
  const deleteMutation = useDeletePolicy();

  const { data: policies = [], isLoading: policiesLoading } = usePolicies();
  const { data: vehicleTypes = [], isLoading: typesLoading } = useVehicleTypes();

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
      {
        id: "actions",
        header: () => <span className="sr-only">Thao tác</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <AdminRowAction
              action="view"
              label={`Xem chi tiết ${row.original.name}`}
              onClick={() => setDetailPolicy(row.original)}
            />
            <AdminRowAction
              action="delete"
              label={`Xóa ${row.original.name}`}
              onClick={() => setDeleteTarget(row.original)}
            />
          </div>
        ),
      },
    ],
    []
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      notifySuccess(`Đã xóa phiên bản "${deleteTarget.name}".`);
      if (detailPolicy?.id === deleteTarget.id) setDetailPolicy(null);
      setDeleteTarget(null);
    } catch (error) {
      notifyApiError(error, "Không thể xóa phiên bản chính sách. Vui lòng thử lại.");
      setDeleteTarget(null);
    }
  };

  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
        <div className="space-y-6">
          {/* Header */}
          <TransitFolio
            title="Chính sách thuê & đặt cọc"
            description="Chính sách thuê là bất biến theo phiên bản nhằm bảo vệ tính toàn vẹn của hợp đồng đã ký. Để điều chỉnh điều khoản, vui lòng tạo một phiên bản mới."
          >
            <TransitFolioMetric label="Phiên bản đang hiển thị" value={String(filteredPolicies.length)} />
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded bg-td-oxide px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-td-oxide-hover"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Tạo phiên bản mới</span>
            </button>
          </TransitFolio>

          {/* Bộ lọc loại xe và trạng thái */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-td-rule py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label htmlFor="filter-vehicle-type" className="sr-only">
                  Lọc theo loại xe
                </label>
                <InlineSelect
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
                </InlineSelect>
              </div>

              <div>
                <label htmlFor="filter-status" className="sr-only">
                  Lọc theo trạng thái
                </label>
                <InlineSelect
                  id="filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 rounded border border-td-rule bg-transparent px-2 font-mono text-xs text-td-ink focus:border-td-ink focus:outline-none"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang áp dụng</option>
                  <option value="INACTIVE">Đã ngừng</option>
                </InlineSelect>
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

          {/* Modal tạo phiên bản mới */}
          <PolicyModal
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            vehicleTypes={vehicleTypes}
            activePolicies={activePoliciesList}
          />

          <PolicyDetailDrawer policy={detailPolicy} onClose={() => setDetailPolicy(null)} />

          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}
            title="Xóa phiên bản chính sách"
            description={
              deleteTarget
                ? `Xóa phiên bản "${deleteTarget.name}" (#${deleteTarget.id})? Chỉ xóa được khi chưa có đơn thuê nào dùng phiên bản này; nếu đã có đơn, hãy tạm ngưng thay vì xóa. Thao tác không thể hoàn tác.`
                : ""
            }
            confirmLabel="Xóa phiên bản"
            variant="danger"
            isPending={deleteMutation.isPending}
            onConfirm={confirmDelete}
          />
        </div>
    </AuthGate>
  );
}
