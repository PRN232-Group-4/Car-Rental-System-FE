/**
 * Phân quyền vai trò (RBAC) - Thong Dong Vehicle Rental System
 * Căn cứ: docs/api/contract-snapshot.md §1.4 & Database Schema
 *
 * 7 vai trò chính thức trong hệ thống:
 * 1. Customer: Khách hàng thuê xe, quản lý hợp đồng và đơn đặt.
 * 2. Staff: Nhân viên vận hành cơ bản tại chi nhánh.
 * 3. Admin: Quản trị viên toàn quyền hệ thống.
 * 4. Driver: Tài xế nhận chuyến và thực hiện ca trực (staffs.is_driver = true).
 * 5. Maintenance: Kỹ thuật viên bảo trì và kiểm định phương tiện.
 * 6. Manager: Quản lý vận hành đội xe, duyệt chính sách và lịch ca trực.
 * 7. CustomerService: Chăm sóc khách hàng, duyệt GPLX, đổi xe/tài xế, hỗ trợ hoàn tiền.
 */

export const ROLES = [
  "Customer",
  "Staff",
  "Admin",
  "Driver",
  "Maintenance",
  "Manager",
  "CustomerService",
] as const;

export type Role = (typeof ROLES)[number];

/** Nhãn hiển thị tiếng Việt cho từng vai trò */
export const ROLE_LABELS: Record<Role, string> = {
  Customer: "Khách hàng",
  Staff: "Nhân viên vận hành",
  Admin: "Quản trị viên",
  Driver: "Tài xế",
  Maintenance: "Kỹ thuật viên",
  Manager: "Quản lý vận hành",
  CustomerService: "Chăm sóc khách hàng",
};

/** Nhóm phân loại vai trò */
export type RoleCategory =
  | "customer"
  | "operations"
  | "management"
  | "technical"
  | "driver";

export const ROLE_CATEGORIES: Record<Role, RoleCategory> = {
  Customer: "customer",
  Staff: "operations",
  CustomerService: "operations",
  Manager: "management",
  Admin: "management",
  Maintenance: "technical",
  Driver: "driver",
};

export const ROLE_CATEGORY_LABELS: Record<RoleCategory, string> = {
  customer: "Khách hàng",
  operations: "Vận hành & Dịch vụ",
  management: "Ban Quản lý",
  technical: "Kỹ thuật & Bảo dưỡng",
  driver: "Đội ngũ Tài xế",
};

/** Danh sách vai trò được phép truy cập Cổng Quản trị / Nhân viên (/admin) */
export const STAFF_PORTAL_ROLES: readonly Role[] = [
  "Admin",
  "Manager",
  "Staff",
  "CustomerService",
  "Maintenance",
] as const;

/** Danh sách vai trò được phép truy cập Cổng Tài xế (/staff) */
export const DRIVER_PORTAL_ROLES: readonly Role[] = [
  "Driver",
  "Admin",
  "Manager",
  "Staff",
] as const;

/** Cấp quản lý cao nhất */
export const MANAGEMENT_ROLES: readonly Role[] = [
  "Admin",
  "Manager",
] as const;

/** Cấp khách hàng */
export const CUSTOMER_ROLES: readonly Role[] = [
  "Customer",
] as const;

/** Type guard kiểm tra giá trị có phải là Role hợp lệ (không phân biệt hoa thường) */
export function isRole(value: unknown): value is Role {
  return normalizeRole(value) !== null;
}

/**
 * Chuẩn hóa giá trị vai trò về dạng Role chuẩn (PascalCase) hoặc null nếu không hợp lệ.
 * Phòng thủ an toàn trước null, undefined, non-string hoặc chuỗi khoảng trắng.
 */
export function normalizeRole(role: unknown): Role | null {
  if (typeof role !== "string" || !role.trim()) return null;
  const lower = role.trim().toLowerCase();
  const match = ROLES.find((r) => r.toLowerCase() === lower);
  return match ?? null;
}

/** Kiểm tra vai trò có thuộc quyền vào cổng /admin không (an toàn trước null/undefined/non-string) */
export function isStaffPortalRole(role: unknown): boolean {
  const normalized = normalizeRole(role);
  return normalized !== null && (STAFF_PORTAL_ROLES as readonly Role[]).includes(normalized);
}

/** Kiểm tra vai trò có phải là Tài xế không (an toàn trước null/undefined/non-string) */
export function isDriverRole(role: unknown): boolean {
  const normalized = normalizeRole(role);
  return normalized === "Driver";
}

/** Kiểm tra vai trò có phải là Khách hàng không (an toàn trước null/undefined/non-string) */
export function isCustomerRole(role: unknown): boolean {
  const normalized = normalizeRole(role);
  return normalized === "Customer";
}

/** Kiểm tra vai trò có thuộc ban quản lý (Admin / Manager) không (an toàn trước null/undefined/non-string) */
export function isManagementRole(role: unknown): boolean {
  const normalized = normalizeRole(role);
  return normalized !== null && (MANAGEMENT_ROLES as readonly Role[]).includes(normalized);
}
