"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { ValidatedForm, InlineTextarea, useInlineValidation } from "@/components/forms/inline-validation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export interface UserLockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  isCurrentlyActive: boolean;
  onConfirm: (reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export function UserLockDialog(props: UserLockDialogProps) {
  if (!props.open) return null;
  return <UserLockForm key={`${props.userId}-${props.isCurrentlyActive}`} {...props} />;
}

function UserLockForm({ onOpenChange, userName, isCurrentlyActive, onConfirm, isLoading = false }: UserLockDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const validation = useInlineValidation();
  const busy = isLoading || submitting;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    setSubmitting(true);
    try {
      await onConfirm(isCurrentlyActive ? reason.trim() : undefined);
      onOpenChange(false);
    } catch (failure) {
      setError(validation.report(failure));
    } finally { setSubmitting(false); }
  };
  return <FormDialog title={isCurrentlyActive ? "Khóa tài khoản người dùng" : "Mở khóa tài khoản"} onClose={() => onOpenChange(false)} busy={busy}>
    <ValidatedForm validation={validation} onSubmit={submit} className="space-y-4">
      <p className="text-sm text-td-muted">{isCurrentlyActive ? `Khóa quyền đăng nhập của tài khoản ${userName} và thu hồi các phiên hiện tại.` : `Khôi phục quyền đăng nhập của tài khoản ${userName}.`}</p>
      {error && <p role="alert" className="pl-3 text-sm text-danger">{error}</p>}
      {isCurrentlyActive && <FormField label="Lý do khóa tài khoản" htmlFor="reason" required helperText="Nhập lý do từ 1 đến 1000 ký tự để lưu vào nhật ký bảo mật.">
        <InlineTextarea id="reason" name="reason" required maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="admin-input" disabled={busy} />
      </FormField>}
      <FormDialogFooter>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => onOpenChange(false)}>Hủy</Button>
        <Button type="submit" isLoading={busy} disabled={busy}>{isCurrentlyActive ? "Xác nhận khóa" : "Xác nhận mở khóa"}</Button>
      </FormDialogFooter>
    </ValidatedForm>
  </FormDialog>;
}
