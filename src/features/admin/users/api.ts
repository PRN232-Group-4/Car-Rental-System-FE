import { Role, ROLES } from "@/features/auth/roles";
import { backendApiClient } from "@/api/backend-api-client";
import { ApiProblemError } from "@/api/api-client";
import type { PagedResult, StaffDto } from "@/features/admin/api";
import type { AdminUserDetail, UserFilterParams, UserPageResult } from "./types";

const SENSITIVE_PATTERNS = [/password/i, /token/i, /secret/i, /otp/i, /salt/i, /ticket/i];

export function sanitizeUserRecord<T extends object>(record: T): T {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !SENSITIVE_PATTERNS.some((pattern) => pattern.test(key)))) as T;
}

export interface AdministrativeUser {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  gender: string | null;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  customerId: number | null;
  staffId: number | null;
}

interface CustomerDetail {
  id: number;
  userId: number;
  license: { number: string | null; type: string | null; expiryDate: string | null; imageUrl: string | null; status: "pending" | "approved" | "rejected" };
  loyalty: { points: number };
}

// Explicit allowlist: backend fields outside the user-directory contract never reach the UI.
export function mapAdministrativeUser(user: AdministrativeUser): AdminUserDetail {
  return {
    id: user.id, email: user.email, fullName: user.fullName || user.email,
    phone: user.phone ?? undefined, avatarUrl: user.avatarUrl ?? undefined, gender: user.gender ?? undefined,
    roles: (user.roles ?? []).filter((role): role is Role => ROLES.includes(role as Role)),
    isActive: user.isActive, createdAt: user.createdAt,
    hasStaffProfile: user.staffId != null, hasCustomerProfile: user.customerId != null,
    staff: user.staffId == null ? null : { id: user.staffId, isDriver: user.roles.includes("Driver") },
    customer: user.customerId == null ? null : { id: user.customerId },
  };
}

function problem(status: number, detail: string): ApiProblemError {
  return new ApiProblemError(status, "Yêu cầu không hợp lệ", { detail });
}

export async function getAdminUsers(params: UserFilterParams = {}): Promise<UserPageResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw problem(400, "Trang phải từ 1 và số bản ghi mỗi trang phải từ 1 đến 100.");
  }
  const role = params.role && params.role !== "all" ? params.role : undefined;
  if (role && !ROLES.includes(role as Role)) throw problem(400, "Vai trò không tồn tại trong danh mục hệ thống.");
  const records: AdminUserDetail[] = [];
  // Profile filter and sort are UI features; collect real server pages before applying them.
  for (let apiPage = 1; ; apiPage += 1) {
    const result = await backendApiClient.get<PagedResult<AdministrativeUser>>("users", {
      search: params.search?.trim() || undefined, role,
      isActive: params.isActive && params.isActive !== "all" ? params.isActive === "active" : undefined,
      page: apiPage, pageSize: 100,
    });
    const items = result.items ?? [];
    records.push(...items.map(mapAdministrativeUser));
    if (!items.length || records.length >= result.totalCount) break;
  }
  const filtered = records.filter((user) => params.profile === "customer" ? user.hasCustomerProfile
    : params.profile === "staff" ? user.hasStaffProfile
    : params.profile === "none" ? !user.hasCustomerProfile && !user.hasStaffProfile : true);
  filtered.sort((a, b) => {
    const order = params.sortBy === "email" ? a.email.localeCompare(b.email)
      : params.sortBy === "fullName" ? a.fullName.localeCompare(b.fullName, "vi")
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return (params.sortOrder === "asc" ? order : -order) || b.id - a.id;
  });
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), page, pageSize, totalCount: filtered.length };
}

export async function getAdminUserById(id: number): Promise<AdminUserDetail | null> {
  let record: AdministrativeUser;
  try { record = await backendApiClient.get<AdministrativeUser>(`users/${id}`); }
  catch (error) {
    if (error instanceof ApiProblemError && error.status === 404) return null;
    throw error;
  }
  const user = mapAdministrativeUser(record);
  // Optional profile requests cannot hide the account's status and security actions.
  await Promise.allSettled([
    record.staffId == null ? Promise.resolve() : backendApiClient.get<StaffDto>(`staff/${record.staffId}`).then((staff) => {
      user.staff = { id: staff.id, department: staff.departmentName ?? undefined, facility: staff.facilityName ?? undefined,
        isDriver: user.roles.includes("Driver"), licenseExpiry: staff.licenseExpiryDate ?? undefined, rating: staff.rating ?? undefined };
    }),
    record.customerId == null ? Promise.resolve() : backendApiClient.get<CustomerDetail>(`customers/${record.customerId}`).then((customer) => {
      user.customer = { id: customer.id, licenseStatus: customer.license.status,
        licenseNumber: customer.license.number ?? undefined, licenseType: customer.license.type ?? undefined,
        licenseExpiry: customer.license.expiryDate ?? undefined, licenseImgUrl: customer.license.imageUrl ?? undefined,
        loyaltyPoint: customer.loyalty.points };
    }),
  ]);
  return user;
}

export async function setUserActiveStatus(input: {
  userId: number; isActive: boolean; reason?: string; currentActorId?: number; currentActorEmail?: string;
}): Promise<AdminUserDetail> {
  if (!input.isActive && input.currentActorId === input.userId) throw problem(409, "Bạn không thể tự khóa tài khoản quản trị của chính mình.");
  const reason = input.reason?.trim() || (input.isActive ? "Mở khóa tài khoản theo xác nhận của quản trị viên." : "");
  if (!reason || reason.length > 1000) throw problem(400, "Vui lòng nhập lý do khóa tài khoản từ 1 đến 1000 ký tự.");
  return mapAdministrativeUser(await backendApiClient.patch<AdministrativeUser>(`users/${input.userId}/status`, { isActive: input.isActive, reason }));
}

export async function assignUserRole({
  userId,
  role,
  currentActorId,
}: {
  userId: number;
  role: Role;
  currentActorId?: number;
}): Promise<AdminUserDetail> {
  if (!ROLES.includes(role)) throw problem(400, `Vai trò '${role}' không tồn tại trong danh mục hệ thống.`);
  if (currentActorId != null && userId === currentActorId) {
    throw problem(409, "Bạn không thể tự gán thêm vai trò cho chính mình. Thao tác này yêu cầu kiểm soát chéo từ quản trị viên khác.");
  }
  try {
    return mapAdministrativeUser(await backendApiClient.post<AdministrativeUser>(`users/${userId}/roles`, { role }));
  } catch (error) {
    if (error instanceof ApiProblemError && error.detail && /employee profile is required/i.test(error.detail)) {
      throw new ApiProblemError(error.status, "Yêu cầu hồ sơ nhân viên", {
        detail: `Vai trò '${role}' yêu cầu tài khoản phải có hồ sơ nhân viên nội bộ (phòng ban và cơ sở công tác). Vui lòng tạo hồ sơ nhân viên trước khi gán vai trò này.`,
        errors: error.data && typeof error.data === "object" && "errors" in error.data ? (error.data as { errors?: Record<string, string[]> }).errors : undefined,
      });
    }
    throw error;
  }
}

export async function removeUserRole(input: { userId: number; role: Role; currentActorId?: number; currentActorEmail?: string }): Promise<AdminUserDetail> {
  if (!ROLES.includes(input.role)) throw problem(400, `Vai trò '${input.role}' không tồn tại trong danh mục hệ thống.`);
  if (input.role === "Admin" && input.userId === input.currentActorId) throw problem(409, "Bạn không thể tự gỡ vai trò Quản trị viên (Admin) của chính mình.");
  return mapAdministrativeUser(await backendApiClient.delete<AdministrativeUser>(`users/${input.userId}/roles`, { body: JSON.stringify({ role: input.role }) }));
}

export async function revokeUserSessions(userId: number): Promise<{ success: boolean }> {
  await backendApiClient.post(`users/${userId}/sessions/revoke`);
  return { success: true };
}

export async function reviewCustomerLicense({ customerId, status }: { customerId: number; status: "approved" | "rejected" }): Promise<{ fullName: string }> {
  await backendApiClient.put(`customers/${customerId}/license-status`, { status });
  return { fullName: "khách hàng" };
}

export async function adjustCustomerLoyalty({ customerId, points, reason, idempotencyKey }: { customerId: number; points: number; reason: string; idempotencyKey: string }): Promise<{ fullName: string }> {
  if (!Number.isInteger(points) || points === 0) throw problem(400, "Số điểm điều chỉnh phải là số nguyên khác 0.");
  await backendApiClient.post(`customers/${customerId}/loyalty/adjustments`, { points, reason: reason.trim(), idempotencyKey });
  return { fullName: "khách hàng" };
}
