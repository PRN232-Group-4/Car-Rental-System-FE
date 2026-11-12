"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { ValidatedForm, InlineSelect, useInlineValidation } from "@/components/forms/inline-validation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Role, ROLES } from "@/features/auth/roles";

export const ROLES_REQUIRING_STAFF_PROFILE: readonly Role[] = [
  "Staff",
  "Manager",
  "CustomerService",
  "Maintenance",
  "Driver",
];

export interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  currentRoles: Role[];
  hasStaffProfile?: boolean;
  isSelf?: boolean;
  onAssignRole: (role: Role) => Promise<void>;
  isLoading?: boolean;
}

export function UserRoleDialog(props: UserRoleDialogProps) {
  if (!props.open) return null;
  return <UserRoleForm key={props.userId} {...props} />;
}

function UserRoleForm({
  onOpenChange,
  userId,
  userName,
  currentRoles,
  hasStaffProfile = false,
  isSelf = false,
  onAssignRole,
  isLoading = false,
}: UserRoleDialogProps) {
  const availableRoles = ROLES.filter((role) => !currentRoles.includes(role));
  const [role, setRole] = useState<Role | "">("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const validation = useInlineValidation();
  const busy = isLoading || submitting;

  const isRoleRequiringStaff = Boolean(role && ROLES_REQUIRING_STAFF_PROFILE.includes(role));
  const isBlockedByMissingStaff = isRoleRequiringStaff && !hasStaffProfile;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!role || busy) return;
    if (isSelf) {
      setError("Bạn không thể tự gán thêm vai trò cho chính mình. Thao tác này cần được thực hiện bởi quản trị viên khác.");
      return;
    }
    if (isBlockedByMissingStaff) {
      setError(`Vai trò '${role}' yêu cầu tài khoản phải có hồ sơ nhân viên trước khi được cấp quyền.`);
      return;
    }
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onAssignRole(role);
      onOpenChange(false);
    } catch (failure) {
      setError(validation.report(failure));
    } finally {
      setSubmitting(false);
    }
  };

  const isEmployeeProfileError = Boolean(
    error && /hồ sơ nhân sự|hồ sơ nhân viên|employee profile/i.test(error),
  );

  return (
    <FormDialog
      title={confirming ? "Xác nhận cấp quyền truy cập" : "Gán vai trò bổ sung"}
      onClose={() => onOpenChange(false)}
      busy={busy}
    >
      <ValidatedForm validation={validation} onSubmit={submit} className="space-y-5">
        <p className="text-sm text-td-muted">
          Phân quyền cho {userName}. Vai trò hiện tại: {currentRoles.join(", ") || "Chưa có"}.
        </p>

        {isSelf && (
          <div role="alert" className="border-l-2 border-warning pl-3 text-xs text-warning">
            Bạn đang xem tài khoản của chính mình. Quản trị viên không thể tự gán thêm vai trò cho chính mình để đảm bảo nguyên tắc kiểm soát chéo.
          </div>
        )}

        {error && (
          <div role="alert" className="pl-3 text-sm text-danger space-y-1.5">
            <p>{error}</p>
            {isEmployeeProfileError && (
              <div className="pt-1">
                <Link
                  href={`/admin/staffs/new?userId=${userId}`}
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-td-oxide hover:underline"
                >
                  <span>Đi tới trang Tạo hồ sơ nhân viên</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        <FormField label="Chọn vai trò mới" htmlFor="role" required>
          <InlineSelect
            id="role"
            name="role"
            required
            value={role}
            disabled={busy || confirming || !availableRoles.length}
            onChange={(event) => {
              setRole(event.target.value as Role);
              setError("");
            }}
            className="admin-input"
          >
            <option value="">Chọn vai trò cần phân bổ</option>
            {availableRoles.map((value) => {
              const requiresStaff = ROLES_REQUIRING_STAFF_PROFILE.includes(value);
              const note = requiresStaff && !hasStaffProfile ? " (Yêu cầu hồ sơ nhân viên)" : "";
              return (
                <option key={value} value={value}>
                  {value}{note}
                </option>
              );
            })}
          </InlineSelect>
        </FormField>

        {isBlockedByMissingStaff && (
          <div
            role="status"
            className="space-y-2 rounded border border-warning/40 bg-warning/10 p-3.5 text-xs text-td-ink"
          >
            <p className="font-bold text-warning flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Cần tạo hồ sơ nhân viên trước</span>
            </p>
            <p className="text-td-muted">
              Vai trò <strong className="text-td-ink">{role}</strong> yêu cầu người dùng phải có hồ sơ nhân sự (thuộc phòng ban, cơ sở làm việc). Tài khoản <strong className="text-td-ink">{userName}</strong> hiện chưa có hồ sơ nhân viên nội bộ.
            </p>
            <div className="pt-1">
              <Link
                href={`/admin/staffs/new?userId=${userId}`}
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-1.5 rounded bg-td-ink px-3 py-1.5 font-bold text-td-white hover:bg-td-teal transition-colors"
              >
                <span>Tạo hồ sơ nhân viên cho {userName}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {confirming && !isBlockedByMissingStaff && (
          <p className="pl-3 text-sm text-td-ink">
            Cấp thêm vai trò {role} cho {userName}. Các phiên đăng nhập hiện tại sẽ bị thu hồi để áp dụng quyền mới.
          </p>
        )}
        {role === "Admin" && (
          <p className="text-sm text-td-muted">
            Vai trò Admin có toàn quyền quản trị hệ thống.
          </p>
        )}
        {!availableRoles.length && (
          <p className="text-sm text-td-muted">Tài khoản đã có tất cả vai trò.</p>
        )}

        <FormDialogFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => (confirming ? setConfirming(false) : onOpenChange(false))}
          >
            {confirming ? "Quay lại" : "Hủy"}
          </Button>
          <Button
            type="submit"
            disabled={busy || !availableRoles.length || isBlockedByMissingStaff || isSelf}
            isLoading={busy}
          >
            {isSelf
              ? "Không thể tự cấp vai trò"
              : isBlockedByMissingStaff
              ? "Cần tạo hồ sơ nhân viên trước"
              : confirming
              ? "Xác nhận cấp vai trò"
              : "Tiếp tục gán quyền"}
          </Button>
        </FormDialogFooter>
      </ValidatedForm>
    </FormDialog>
  );
}
