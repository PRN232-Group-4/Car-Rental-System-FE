"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Role, ROLES } from "@/features/auth/roles";
import { ShieldAlert, Plus } from "lucide-react";

export interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  currentRoles: Role[];
  onAssignRole: (role: Role) => Promise<void>;
  isLoading?: boolean;
}

export function UserRoleDialog({
  open,
  onOpenChange,
  userName,
  currentRoles,
  onAssignRole,
  isLoading = false,
}: UserRoleDialogProps) {
  const availableRoles = ROLES.filter((r) => !currentRoles.includes(r));
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleStartAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setConfirmOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedRole) return;
    await onAssignRole(selectedRole as Role);
    setConfirmOpen(false);
    setSelectedRole("");
    onOpenChange(false);
  };

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Gán vai trò bổ sung"
        description={`Phân quyền hạn truy cập cho người dùng ${userName}`}
        size="md"
      >
        <form onSubmit={handleStartAssign} className="space-y-5">
          <div className="rounded border border-td-rule bg-td-paper p-3.5 space-y-2">
            <span className="text-xs font-semibold text-td-muted">Vai trò hiện tại:</span>
            <div className="flex flex-wrap gap-1.5">
              {currentRoles.map((role) => (
                <span
                  key={role}
                  className="rounded-md border border-td-rule bg-td-white px-2.5 py-1 font-mono text-xs font-bold text-td-ink"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <FormField label="Chọn vai trò mới" required>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="flex h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm font-medium text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              disabled={availableRoles.length === 0}
            >
              <option value="">-- Chọn vai trò cần phân bổ --</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </FormField>

          {availableRoles.length === 0 && (
            <p className="text-xs text-td-muted">
              Tài khoản này đã sở hữu toàn bộ các vai trò trong hệ thống.
            </p>
          )}

          {selectedRole === "Admin" && (
            <div className="flex items-start gap-2 rounded border border-warning/30 bg-warning-bg/40 p-3 text-xs text-warning">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Cảnh báo quan trọng:</strong> Vai trò Admin cho phép toàn quyền cấu hình,
                xóa dữ liệu và quản trị nhân sự trên hệ thống.
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-td-rule">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedRole || isLoading}
              isLoading={isLoading}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Tiếp tục gán quyền</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Trước -> Sau */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Xác nhận cấp quyền truy cập"
        description={`Bạn có chắc chắn muốn cấp thêm vai trò ${selectedRole} cho người dùng ${userName}? Thay đổi sẽ có hiệu lực ngay trong phiên kế tiếp của người dùng.`}
        confirmLabel="Xác nhận cấp vai trò"
        cancelLabel="Quay lại"
        variant="primary"
        isPending={isLoading}
        onConfirm={handleConfirmAssign}
      />
    </>
  );
}
