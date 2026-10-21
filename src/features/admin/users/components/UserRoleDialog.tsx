"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { ValidatedForm, InlineSelect, useInlineValidation } from "@/components/forms/inline-validation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Role, ROLES } from "@/features/auth/roles";

export interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  currentRoles: Role[];
  onAssignRole: (role: Role) => Promise<void>;
  isLoading?: boolean;
}

export function UserRoleDialog(props: UserRoleDialogProps) {
  if (!props.open) return null;
  return <UserRoleForm key={props.userId} {...props} />;
}

function UserRoleForm({ onOpenChange, userName, currentRoles, onAssignRole, isLoading = false }: UserRoleDialogProps) {
  const availableRoles = ROLES.filter((role) => !currentRoles.includes(role));
  const [role, setRole] = useState<Role | "">("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const validation = useInlineValidation();
  const busy = isLoading || submitting;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!role || busy) return;
    if (!confirming) { setConfirming(true); return; }
    setError("");
    setSubmitting(true);
    try {
      await onAssignRole(role);
      onOpenChange(false);
    } catch (failure) {
      setError(validation.report(failure));
    } finally { setSubmitting(false); }
  };
  return <FormDialog title={confirming ? "Xác nhận cấp quyền truy cập" : "Gán vai trò bổ sung"} onClose={() => onOpenChange(false)} busy={busy}>
    <ValidatedForm validation={validation} onSubmit={submit} className="space-y-5">
      <p className="text-sm text-td-muted">Phân quyền cho {userName}. Vai trò hiện tại: {currentRoles.join(", ") || "Chưa có"}.</p>
      {error && <p role="alert" className="border-l-2 border-danger pl-3 text-sm text-danger">{error}</p>}
      <FormField label="Chọn vai trò mới" htmlFor="role" required>
        <InlineSelect id="role" name="role" required value={role} disabled={busy || confirming || !availableRoles.length} onChange={(event) => setRole(event.target.value as Role)} className="admin-input">
          <option value="">Chọn vai trò cần phân bổ</option>
          {availableRoles.map((value) => <option key={value} value={value}>{value}</option>)}
        </InlineSelect>
      </FormField>
      {confirming && <p className="border-l-2 border-td-oxide pl-3 text-sm text-td-ink">Cấp thêm vai trò {role} cho {userName}. Các phiên đăng nhập hiện tại sẽ bị thu hồi để áp dụng quyền mới.</p>}
      {role === "Admin" && <p className="text-sm text-td-muted">Vai trò Admin có toàn quyền quản trị hệ thống.</p>}
      {!availableRoles.length && <p className="text-sm text-td-muted">Tài khoản đã có tất cả vai trò.</p>}
      <FormDialogFooter>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => confirming ? setConfirming(false) : onOpenChange(false)}>{confirming ? "Quay lại" : "Hủy"}</Button>
        <Button type="submit" disabled={busy || !availableRoles.length} isLoading={busy}>{confirming ? "Xác nhận cấp vai trò" : "Tiếp tục gán quyền"}</Button>
      </FormDialogFooter>
    </ValidatedForm>
  </FormDialog>;
}
