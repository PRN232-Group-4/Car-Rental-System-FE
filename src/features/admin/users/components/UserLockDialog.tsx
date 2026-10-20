"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Lock, Unlock, AlertTriangle } from "lucide-react";

export interface UserLockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  isCurrentlyActive: boolean;
  onConfirm: (reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export function UserLockDialog({
  open,
  onOpenChange,
  userName,
  isCurrentlyActive,
  onConfirm,
  isLoading = false,
}: UserLockDialogProps) {
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCurrentlyActive) {
      if (!reason.trim() || reason.trim().length < 5) {
        setValidationError("Vui lòng nhập lý do khóa tài khoản cụ thể (tối thiểu 5 ký tự).");
        return;
      }
    }

    setValidationError(null);
    await onConfirm(isCurrentlyActive ? reason.trim() : undefined);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isCurrentlyActive ? "Khóa tài khoản người dùng" : "Mở khóa tài khoản"}
      description={
        isCurrentlyActive
          ? `Tài khoản ${userName} sẽ bị vô hiệu hóa quyền đăng nhập vào toàn bộ hệ thống.`
          : `Khôi phục quyền truy cập bình thường cho tài khoản ${userName}.`
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isCurrentlyActive ? (
          <>
            <div className="flex items-start gap-2.5 rounded border border-danger/20 bg-danger-bg/40 p-3 text-xs text-danger">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Người dùng này sẽ bị hủy các phiên đăng nhập hiện tại và không thể thao tác trên ứng dụng di động cũng như cổng web.
              </span>
            </div>

            <FormField
              label="Lý do khóa tài khoản"
              required
              error={validationError || undefined}
              helperText="Lý do này sẽ được ghi nhận vào nhật ký bảo mật của hệ thống."
            >
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                rows={3}
                placeholder="Ví dụ: Vi phạm quy định thuê xe, nghi vấn gian lận thông tin giấy tờ..."
                className="w-full rounded border border-td-rule bg-td-white p-3 text-sm text-td-ink focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/20"
              />
            </FormField>
          </>
        ) : (
          <p className="text-sm text-td-ink py-2">
            Sau khi mở khóa, người dùng có thể đăng nhập và tiếp tục sử dụng dịch vụ của Thong Dong.
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-td-rule">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant={isCurrentlyActive ? "danger" : "primary"}
            isLoading={isLoading}
          >
            {isCurrentlyActive ? (
              <>
                <Lock className="w-4 h-4 mr-1.5" />
                <span>Xác nhận khóa</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-1.5" />
                <span>Xác nhận mở khóa</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
