"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Edit2, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { TransitFolio, TransitFolioMetric } from "@/features/admin/transit-desk/TransitFolio";
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
            <div className="font-bold text-td-ink">{row.original.name}</div>
            {row.original.description && (
              <div className="text-xs text-td-muted line-clamp-1 max-w-xs">
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
          <span className="font-mono font-bold text-td-ink text-sm">
            {formatVnd(row.original.price)}
          </span>
        ),
      },
      {
        id: "durationDays",
        header: "Thời hạn",
        cell: ({ row }) => (
          <span className="font-mono text-td-ink text-sm">{row.original.durationDays} ngày</span>
        ),
      },
      {
        id: "includedHours",
        header: "Hạn mức giờ",
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-td-oxide text-sm">
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
            <span className="font-mono text-xs text-td-muted">
              ~{formatVnd(rate)} / giờ
            </span>
          );
        },
      },
      {
        id: "subscribersCount",
        header: "Người dùng",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-td-muted">
            {row.original.subscribersCount ?? 0}
          </span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <AdminStatusBadge domain="activity" status={row.original.isActive ? "active" : "inactive"}>
            {row.original.isActive ? "Đang bán" : "Ngừng bán"}
          </AdminStatusBadge>
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
                className="p-1.5 rounded text-td-ink hover:bg-td-chalk"
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
                className="p-1.5 rounded text-td-ink hover:bg-td-chalk"
                title="Chỉnh sửa thông tin gói"
              >
                <Edit2 className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Chỉnh sửa</span>
              </button>
              <button
                type="button"
                onClick={() => setDeletingPlan(plan)}
                className="p-1.5 rounded text-td-ink hover:text-danger hover:bg-danger-bg/40"
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
        <div className="space-y-6">
          <TransitFolio
            index="06"
            tag="PLC"
            kicker="CHÍNH SÁCH · GÓI THUÊ BAO"
            title={<>Gói thuê bao <em className="italic text-td-teal">di chuyển.</em></>}
            description="Quản lý danh mục các gói thuê bao giờ linh hoạt, thiết lập thời hạn và đơn giá quy đổi cho khách hàng toàn hệ thống."
          >
            <TransitFolioMetric label="DANH MỤC · TỔNG SỐ GÓI" value={isLoading ? <Skeleton className="h-8 w-16" /> : String(plans.length).padStart(2, "0")} />
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded bg-td-oxide px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-td-oxide-hover"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Tạo gói mới</span>
            </button>
          </TransitFolio>

          {/* Bảng danh sách gói */}
          <div className="border-t border-td-ink">
            <DataTable
              className="!border-t-0"
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
    </AuthGate>
  );
}
