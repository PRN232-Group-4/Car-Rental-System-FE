import { backendApiClient } from "@/api/backend-api-client";
import { unsupportedApi } from "@/api/unsupported";
import { normalizeRole, type Role } from "@/features/auth/roles";
import type { PagedResult } from "../api";
import type { AdminUserDetail, AdminUserListItem, UserFilterParams, UserPageResult } from "./types";

const SENSITIVE_PATTERNS = [/password/i, /token/i, /secret/i, /otp/i, /salt/i, /ticket/i];

export function sanitizeUserRecord<T extends object>(record: T): T {
  const sanitized = { ...record } as Record<string, unknown>;
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) delete sanitized[key];
  }
  return sanitized as T;
}

type UserListDto = {
  id: number; email: string | null; fullName: string | null; phone?: string | null; avatarUrl?: string | null;
  roles: string[] | null; isActive: boolean; createdAt: string; customerId?: number | null; staffId?: number | null;
};

function mapUserListItem(record: UserListDto): AdminUserListItem {
  if (!record || !Number.isSafeInteger(record.id) || record.id <= 0 || typeof record.isActive !== "boolean" || typeof record.createdAt !== "string" || (record.roles !== null && !Array.isArray(record.roles))) {
    throw new Error("Dữ liệu tài khoản không hợp lệ. Vui lòng thử lại.");
  }
  return {
    id: record.id, email: record.email ?? "", fullName: record.fullName ?? "Chưa cập nhật tên",
    phone: record.phone ?? undefined, avatarUrl: record.avatarUrl ?? undefined,
    roles: (record.roles ?? []).map(normalizeRole).filter((role): role is Role => role !== null),
    isActive: record.isActive, createdAt: record.createdAt,
    hasCustomerProfile: record.customerId != null && record.customerId > 0,
    hasStaffProfile: record.staffId != null && record.staffId > 0,
  };
}

export async function getAdminUsers(params: UserFilterParams = {}): Promise<UserPageResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new Error("Trang phải từ 1 và số tài khoản mỗi trang phải từ 1 đến 100. Vui lòng chọn lại.");
  }
  const readPage = async (current: number, size: number) => {
    const result = await backendApiClient.get<PagedResult<UserListDto>>("users", {
      search: params.search?.trim() || undefined,
      role: params.role && params.role !== "all" ? normalizeRole(params.role) ?? params.role : undefined,
      isActive: params.isActive === "active" ? true : params.isActive === "locked" ? false : undefined,
      page: current, pageSize: size,
    });
    if (!result || !Array.isArray(result.items) || result.page !== current || !Number.isSafeInteger(result.totalCount) || result.totalCount < 0) {
      throw new Error("Dữ liệu danh sách tài khoản không hợp lệ. Vui lòng thử lại.");
    }
    return { ...result, items: result.items.map(mapUserListItem) };
  };
  const filterProfile = params.profile && params.profile !== "all";
  if (!filterProfile && !params.sortBy) return readPage(page, pageSize);

  // Profile filtering and sorting are not supported by the API; apply them before local pagination.
  const first = await readPage(1, 100);
  let items = first.items;
  let current = 1;
  while (items.length < first.totalCount) {
    if (!items.length) throw new Error("Chưa tải đủ danh sách tài khoản. Vui lòng thử lại.");
    const next = await readPage(++current, 100);
    if (!next.items.length) throw new Error("Chưa tải đủ danh sách tài khoản. Vui lòng thử lại.");
    items.push(...next.items);
  }
  if (params.profile === "customer") items = items.filter((user) => user.hasCustomerProfile);
  else if (params.profile === "staff") items = items.filter((user) => user.hasStaffProfile);
  else if (params.profile === "none") items = items.filter((user) => !user.hasCustomerProfile && !user.hasStaffProfile);
  const sortBy = params.sortBy;
  if (sortBy) items.sort((a, b) => (params.sortOrder === "asc" ? 1 : -1) * (sortBy === "createdAt" ? Date.parse(a.createdAt) - Date.parse(b.createdAt) : a[sortBy].localeCompare(b[sortBy], "vi")));
  return { items: items.slice((page - 1) * pageSize, page * pageSize), totalCount: items.length, page, pageSize };
}
export async function getAdminUserById(id: number): Promise<AdminUserDetail> {
  void id;
  return unsupportedApi("chi tiết tài khoản theo User ID (cần GET /api/users/{id})");
}
export async function setUserActiveStatus(input: { userId: number; isActive: boolean; reason?: string; currentActorId?: number; currentActorEmail?: string }): Promise<AdminUserDetail> {
  void input;
  return unsupportedApi("khóa/mở khóa tài khoản (cần PATCH /api/users/{id}/status)");
}
export async function assignUserRole(input: { userId: number; role: Role }): Promise<AdminUserDetail> {
  void input;
  return unsupportedApi("gán vai trò tài khoản (cần POST /api/users/{id}/roles)");
}
export async function removeUserRole(input: { userId: number; role: Role; currentActorId?: number; currentActorEmail?: string }): Promise<AdminUserDetail> {
  void input;
  return unsupportedApi("gỡ vai trò tài khoản (cần DELETE /api/users/{id}/roles)");
}
export async function revokeUserSessions(userId: number): Promise<{ success: boolean }> {
  void userId;
  return unsupportedApi("thu hồi phiên của tài khoản khác (cần POST /api/users/{id}/sessions/revoke)");
}
export async function reviewCustomerLicense(input: { customerId: number; status: "approved" | "rejected" }): Promise<void> {
  await backendApiClient.put(`customers/${input.customerId}/license-status`, { status: input.status });
}
export async function adjustCustomerLoyalty(input: { customerId: number; points: number; reason: string; idempotencyKey: string }): Promise<{ balanceAfter: number }> {
  return backendApiClient.post(`customers/${input.customerId}/loyalty/adjustments`, {
    points: input.points, reason: input.reason, idempotencyKey: input.idempotencyKey,
  });
}
