"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Edit2, Trash2, Power, Layers } from "lucide-react";
import { toast } from "sonner";
import StaffShell from "@/features/admin/StaffShell";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AuthGate } from "@/features/auth/AuthGate";
import { formatVnd } from "@/lib/format";
import {
  usePlans,
  useUpdatePlan,
  useDeletePlan,
} from "@/features/admin/policies/hooks";
import { calculateHourlyRate } from "@/features/admin/policies/pricing-calculator";
import { PlanDrawer } from "@/features/admin/policies/components/PlanDrawer";
import type { SubscriptionPlan } from "@/features/admin/policies/types";
import { ApiProblemError } from "@/api";

export default function SubscriptionPlansPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);
  const [conflictPrompt, setConflictPrompt] = useState<{
    plan: SubscriptionPlan;
    detail: string;
  } | null>(null);

  const { data: plans = [], isLoading } = usePlans(true);
  const updateMutation = useUpdatePlan();
  const deleteMutation = useDeletePlan();

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setDrawerOpen(true);
  };

  const handleToggleActive = useCallback(
    async (plan: SubscriptionPlan) => {
      try {
        await updateMutation.mutateAsync({
          id: plan.id,
          input: {
            name: plan.name,
            description: plan.description ?? "",
            price: plan.price,
            durationDays: plan.durationDays,
            includedHours: plan.includedHours,
            isActive: !plan.isActive,
          },
        });
        toast.success(
          plan.isActive
            ? `Đã ngừng mở bán gói "${plan.name}"`
            : `Đã mở bán lại gói "${plan.name}"`
        );
      } catch {
        toast.error("Không thể thay đổi trạng thái mở bán");
      }
    },
    [updateMutation]
  );

  const executeDelete = async (plan: SubscriptionPlan) => {
    try {
      await deleteMutation.mutateAsync(plan.id);
      toast.success(`Đã xóa gói "${plan.name}"`);
      setDeletingPlan(null);
    } catch (err: unknown) {
      setDeletingPlan(null);
      if (err instanceof ApiProblemError && err.status === 409) {
        setConflictPrompt({
          plan,
          detail: err.detail || "Gói này đã có người đăng ký, không thể xóa.",
        });
      } else {
        toast.error("Không thể xóa gói thuê bao này");
      }
    }
  };

  const columns = useMemo<ColumnDef<SubscriptionPlan>[]>(
    () => [
      {
        id: "name",
        header: "Tên gói & Mô tả",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-bold text-ink">{row.original.name}</div>
            {row.original.description && (
              <div className="text-xs text-ink-3 line-clamp-1 max-w-xs">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "price",
        header: "Giá trọn gói",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-ink text-sm">
            {formatVnd(row.original.price)}
          </span>
        ),
      },
      {
        id: "durationDays",
        header: "Thời hạn",
        cell: ({ row }) => (
          <span className="font-mono text-ink text-sm">{row.original.durationDays} ngày</span>
        ),
      },
      {
        id: "includedHours",
        header: "Hạn mức giờ",
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-primary text-sm">
            {row.original.includedHours} giờ
          </span>
        ),
      },
      {
        id: "hourlyRate",
        header: "Đơn giá quy đổi",
        cell: ({ row }) => {
          const rate = calculateHourlyRate(row.original.price, row.original.includedHours);
          return (
            <span className="font-mono text-xs text-ink-2">
              ~{formatVnd(rate)} / giờ
            </span>
          );
        },
      },
      {
        id: "subscribersCount",
        header: "Người dùng",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-ink-3">
            {row.original.subscribersCount ?? 0}
          </span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.isActive ? "active" : "draft"}
            label={row.original.isActive ? "Đang bán" : "Ngừng bán"}
          />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const plan = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => handleToggleActive(plan)}
                className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-sunken"
                title={plan.isActive ? "Ngừng bán gói này" : "Mở bán lại gói này"}
              >
                <Power className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">
                  {plan.isActive ? "Ngừng bán" : "Mở bán lại"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(plan)}
                className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-sunken"
                title="Chỉnh sửa thông tin gói"
              >
                <Edit2 className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Chỉnh sửa</span>
              </button>
              <button
                type="button"
                onClick={() => setDeletingPlan(plan)}
                className="p-1.5 rounded-lg text-ink-3 hover:text-danger hover:bg-danger-bg/40"
                title="Xóa gói thuê bao"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Xóa</span>
              </button>
            </div>
          );
        },
      },
    ],
    [handleToggleActive]
  );

  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
      <StaffShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Layers className="w-4 h-4" />
                <span>Sản Phẩm & Dịch Vụ</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink mt-1">
                Gói thuê bao di chuyển
              </h1>
              <p className="text-sm text-ink-3 mt-1 max-w-2xl">
                Quản lý danh mục các gói thuê bao giờ linh hoạt, thiết lập thời hạn và đơn giá quy đổi cho khách hàng toàn hệ thống.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Tạo gói mới</span>
            </Button>
          </div>

          {/* Bảng danh sách gói */}
          <div className="bg-surface rounded-2xl border border-line shadow-sm overflow-hidden">
            <DataTable
              caption="Danh sách các gói thuê bao di chuyển trả trước"
              columns={columns}
              data={plans}
              loading={isLoading}
              emptyTitle="Chưa có gói thuê bao nào"
              emptyDescription="Nhấn vào nút 'Tạo gói mới' để thiết lập gói thuê bao đầu tiên."
            />
          </div>

          {/* Drawer Tạo / Sửa gói */}
          <PlanDrawer
            open={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
              setEditingPlan(null);
            }}
            planToEdit={editingPlan}
          />

          {/* ConfirmDialog khi xóa gói */}
          {deletingPlan && (
            <ConfirmDialog
              open={Boolean(deletingPlan)}
              onOpenChange={(isOpen) => !isOpen && setDeletingPlan(null)}
              title={`Xác nhận xóa gói "${deletingPlan.name}"`}
              description="Lưu ý: Chỉ những gói chưa từng có khách hàng đăng ký mới có thể xóa hoàn toàn khỏi cơ sở dữ liệu."
              confirmLabel="Xác nhận xóa"
              cancelLabel="Hủy"
              variant="danger"
              onConfirm={() => executeDelete(deletingPlan)}
            />
          )}

          {/* Hộp thoại gợi ý khi gặp lỗi 409 (đã có người mua) */}
          {conflictPrompt && (
            <ConfirmDialog
              open={Boolean(conflictPrompt)}
              onOpenChange={(isOpen) => !isOpen && setConflictPrompt(null)}
              title="Không thể xóa gói đã có người đăng ký"
              description={`${conflictPrompt.detail}\n\nBạn có muốn chuyển trạng thái gói này sang 'Ngừng bán' để ẩn khỏi ứng dụng mà vẫn giữ nguyên lịch sử giao dịch không?`}
              confirmLabel="Ngừng bán gói này"
              cancelLabel="Đóng"
              variant="primary"
              onConfirm={async () => {
                await handleToggleActive(conflictPrompt.plan);
                setConflictPrompt(null);
              }}
            />
          )}
        </div>
      </StaffShell>
    </AuthGate>
  );
}
