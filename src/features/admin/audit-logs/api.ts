import { backendApiClient } from "@/api/backend-api-client";
import type { PagedResult } from "@/features/admin/api";

/**
 * Bản ghi nhật ký quản trị — khớp `AuditLogItem` của backend
 * (`GET /api/audit-logs`, policy Management: Admin/Manager).
 */
export interface AuditLogDto {
  /** Mã công khai dạng `AUD-<id>` do backend sinh. */
  id: string;
  timestamp: string;
  actorId?: number | null;
  actorEmail?: string | null;
  actorName?: string | null;
  action: string;
  targetUserId?: number | null;
  /** Email của tài khoản bị tác động (backend trả `target_email`). */
  targetUser?: string | null;
  /** Lý do nghiệp vụ đã lưu cùng thao tác. */
  details?: string | null;
  ipAddress?: string | null;
  status?: string | null;
}

export interface AuditLogFilterParams {
  search?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Backend chuẩn hoá 5 action ghi vào `user_administration_audit` thành tên công khai.
 * Bộ lọc chỉ được dùng đúng 5 giá trị này: gửi giá trị khác sẽ không khớp bản ghi nào.
 */
export const AUDIT_ACTIONS = [
  { value: "role_assigned", label: "Gán vai trò" },
  { value: "role_removed", label: "Gỡ vai trò" },
  { value: "account_locked", label: "Khóa tài khoản" },
  { value: "account_unlocked", label: "Mở khóa tài khoản" },
  { value: "session_revoked", label: "Thu hồi phiên" },
] as const;

const ACTION_LABELS: Record<string, string> = Object.fromEntries(
  AUDIT_ACTIONS.map((item) => [item.value, item.label]),
);

/** Nhãn tiếng Việt cho action; giá trị lạ (backend thêm mới) hiển thị nguyên văn thay vì bịa nhãn. */
export function auditActionLabel(action: string | null | undefined): string {
  const key = action?.trim() ?? "";
  if (!key) return "—";
  return ACTION_LABELS[key] ?? key;
}

/** Trạng thái: backend mặc định `success`; giá trị khác hiển thị nguyên văn, không tự đoán là "cảnh báo". */
export function auditStatusLabel(status: string | null | undefined): string {
  const key = status?.trim().toLowerCase() ?? "";
  if (key === "success") return "Thành công";
  if (key === "blocked") return "Bị chặn";
  if (!key) return "—";
  return key;
}

export function toAuditLogQuery(params: AuditLogFilterParams = {}) {
  return {
    search: params.search?.trim() || undefined,
    // "all" nghĩa là không lọc; chỉ gửi action khi nằm trong tập backend hỗ trợ.
    action: params.action && params.action !== "all" ? params.action : undefined,
    page: params.page && params.page > 0 ? params.page : 1,
    pageSize: params.pageSize && params.pageSize > 0 ? params.pageSize : 20,
  };
}

export async function getAuditLogs(params: AuditLogFilterParams = {}): Promise<PagedResult<AuditLogDto>> {
  const result = await backendApiClient.get<PagedResult<AuditLogDto>>("audit-logs", toAuditLogQuery(params));
  // Backend luôn trả items/page/pageSize/totalCount; giữ nguyên giá trị server để phân trang không lệch.
  return {
    items: Array.isArray(result?.items) ? result.items : [],
    page: result?.page ?? 1,
    pageSize: result?.pageSize ?? 20,
    totalCount: Number.isSafeInteger(result?.totalCount) ? result.totalCount : 0,
  };
}
