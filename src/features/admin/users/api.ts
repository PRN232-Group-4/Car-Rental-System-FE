import { backendApiClient } from "@/api/backend-api-client";
import { unsupportedApi } from "@/api/unsupported";
import type { Role } from "@/features/auth/roles";
import type { AdminUserDetail, UserFilterParams, UserPageResult } from "./types";

const SENSITIVE_PATTERNS = [/password/i, /token/i, /secret/i, /otp/i, /salt/i, /ticket/i];

export function sanitizeUserRecord<T extends object>(record: T): T {
  const sanitized = { ...record } as Record<string, unknown>;
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) delete sanitized[key];
  }
  return sanitized as T;
}

// The deployed API exposes customer/staff profiles, but no system-wide users/roles/session admin API.
export async function getAdminUsers(params: UserFilterParams = {}): Promise<UserPageResult> {
  void params;
  return unsupportedApi("danh sách tài khoản toàn hệ thống (cần GET /api/users; hiện chỉ có /api/staff và /api/customers)");
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
