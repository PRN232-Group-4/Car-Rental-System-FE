import type { Role } from "./roles";

/**
 * Kiểm tra xem danh sách vai trò của người dùng có chứa vai trò yêu cầu không.
 * So khớp không phân biệt hoa/thường, phòng thủ tuyệt đối trước null/undefined/non-string.
 */
export function hasRole(
  userRoles: readonly (Role | string | unknown)[] | null | undefined,
  requiredRole: Role | string | unknown,
): boolean {
  if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) return false;
  if (!requiredRole || typeof requiredRole !== "string" || !requiredRole.trim()) return false;

  const target = requiredRole.trim().toLowerCase();
  return userRoles.some(
    (r) => typeof r === "string" && r.trim().length > 0 && r.trim().toLowerCase() === target,
  );
}

/**
 * Kiểm tra xem người dùng có sở hữu ít nhất một vai trò trong danh sách cho phép không.
 * So khớp không phân biệt hoa/thường, phòng thủ tuyệt đối trước null/undefined/non-string.
 */
export function hasAnyRole(
  userRoles: readonly (Role | string | unknown)[] | null | undefined,
  allowedRoles: readonly (Role | string | unknown)[] | null | undefined,
): boolean {
  if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) return false;
  if (!allowedRoles || !Array.isArray(allowedRoles) || allowedRoles.length === 0) return false;

  const normalizedUserRoles = new Set<string>();
  for (const r of userRoles) {
    if (typeof r === "string") {
      const trimmed = r.trim().toLowerCase();
      if (trimmed.length > 0) {
        normalizedUserRoles.add(trimmed);
      }
    }
  }

  if (normalizedUserRoles.size === 0) return false;

  return allowedRoles.some((ar) => {
    if (typeof ar !== "string") return false;
    const target = ar.trim().toLowerCase();
    return target.length > 0 && normalizedUserRoles.has(target);
  });
}

/** Cấu hình phân quyền truy cập cho từng tuyến đường */
export interface RouteAccessRule {
  /** Tiền tố đường dẫn URL cần bảo vệ (ví dụ: "/admin/users") */
  pattern: string;
  /** Danh sách vai trò được phép truy cập (nếu rỗng/undefined, cho phép mọi user thoả mãn authenticated) */
  roles?: readonly Role[];
  /** Bắt buộc phải đăng nhập (true) hoặc cho phép khách vãng lai (false) */
  authenticated?: boolean;
}

/**
 * Bản đồ phân quyền tập trung đối chiếu với backend snapshot:
 * - Admin-only: users, roles, departments, facilities
 * - Admin + Manager: staffs, policies, reviews, dashboard
 * - Admin + Manager + Staff + CustomerService: dispatch
 * - Admin + Manager + Staff: drivers
 * - All Staff Portal Roles (Admin, Manager, Staff, CustomerService, Maintenance):
 *   rentals, inspections, maintenance, vehicles, vehicle-types, subscription-plans, reports, profile, /admin root
 * - Driver Portal: /staff (Driver, Admin, Manager, Staff)
 * - Customer Portal: /driver-license, /my-subscriptions, /rental-contract
 * - Authenticated: /booking, /invoices, /payment-history, /report-incident, /profile
 */
export const ROUTE_ACCESS_RULES: readonly RouteAccessRule[] = [
  // Cấp cao nhất - Admin chỉ định quản trị hệ thống
  { pattern: "/admin/users", roles: ["Admin"] },
  { pattern: "/admin/roles", roles: ["Admin"] },
  { pattern: "/admin/departments", roles: ["Admin"] },
  { pattern: "/admin/facilities", roles: ["Admin", "Manager"] },
  { pattern: "/admin/audit-logs", roles: ["Admin", "Manager"] },

  // Cấp Quản lý điều hành & Chiến lược
  { pattern: "/admin/dashboard", roles: ["Admin", "Manager"] },
  { pattern: "/admin/policies", roles: ["Admin", "Manager"] },
  { pattern: "/admin/reviews", roles: ["Admin", "Manager"] },
  { pattern: "/admin/subscription-plans", roles: ["Admin", "Manager"] },
  { pattern: "/admin/vehicle-types", roles: ["Admin", "Manager"] },
  { pattern: "/admin/staffs", roles: ["Admin", "Manager"] },

  // Chăm sóc khách hàng & Giấy phép lái xe
  { pattern: "/admin/vehicle-license", roles: ["CustomerService", "Staff", "Manager"] },
  { pattern: "/admin/customers", roles: ["CustomerService", "Staff", "Manager"] },
  { pattern: "/admin/reports", roles: ["Staff", "CustomerService", "Maintenance", "Manager"] },

  // Điều phối & Lịch trình
  { pattern: "/admin/dispatch", roles: ["Admin", "Manager", "Staff", "CustomerService"] },
  { pattern: "/admin/drivers", roles: ["Admin", "Manager", "Staff"] },
  { pattern: "/admin/tracking", roles: ["Admin", "Manager", "Staff"] },

  // Vận hành đơn thuê & Bàn giao xe
  { pattern: "/admin/rentals", roles: ["Staff", "CustomerService", "Manager"] },
  { pattern: "/admin/handovers", roles: ["Staff", "Manager"] },

  // Kỹ thuật & Bảo dưỡng
  { pattern: "/admin/inspections", roles: ["Staff", "Maintenance", "Manager"] },
  { pattern: "/admin/maintenance", roles: ["Maintenance", "Manager"] },
  { pattern: "/admin/vehicles", roles: ["Staff", "Maintenance", "Manager"] },

  // Dùng chung toàn bộ nhân sự cổng quản trị
  { pattern: "/admin/profile", roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"] },
  { pattern: "/admin", roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"] },

  // Cổng Tài xế
  { pattern: "/staff", roles: ["Driver", "Admin", "Manager", "Staff"] },

  // Cổng Khách hàng (Dashboard cá nhân)
  { pattern: "/driver-license", roles: ["Customer"] },
  { pattern: "/account/trips", roles: ["Customer"] },
  { pattern: "/my-rentals", roles: ["Customer"] },
  { pattern: "/nearby-vehicles", authenticated: true },
  { pattern: "/my-subscriptions", roles: ["Customer"] },
  { pattern: "/rental-contract", roles: ["Customer"] },
  { pattern: "/booking", authenticated: true },
  { pattern: "/invoices", authenticated: true },
  { pattern: "/payment-history", authenticated: true },
  { pattern: "/report-incident", authenticated: true },
  { pattern: "/profile", authenticated: true },
] as const;

/**
 * Chuẩn hóa pathname:
 * - Validate chuỗi đầu vào: if (!path || typeof path !== "string") return "/";
 * - Loại bỏ search params (?) và hash (#), cắt khoảng trắng, chuyển chữ thường (.toLowerCase())
 * - Chuẩn hóa dấu gạch chéo ngược (\) thành gạch chéo xuôi (/)
 * - Đảm bảo bắt đầu bằng dấu gạch chéo (/)
 * - Thu gọn nhiều dấu gạch chéo liên tiếp (//+) thành gạch chéo đơn (/)
 * - Khử các phân đoạn điểm dừng lặp lại (/./) và điểm dừng cuối (/.)
 * - Loại bỏ toàn bộ dấu gạch chéo ở cuối (trailing slashes) trừ gốc '/'
 */
export function normalizePathname(path: string): string {
  if (!path || typeof path !== "string") return "/";

  let cleaned = path.split("?")[0].split("#")[0].trim().replace(/\\/g, "/");
  if (!cleaned.startsWith("/")) {
    cleaned = "/" + cleaned;
  }

  cleaned = cleaned.toLowerCase().replace(/\/+/g, "/");

  while (cleaned.includes("/./")) {
    cleaned = cleaned.replace(/\/\.\//g, "/");
  }
  if (cleaned.endsWith("/.")) {
    cleaned = cleaned.slice(0, -1);
  }
  cleaned = cleaned.replace(/\/+$/, "") || "/";

  return cleaned;
}

/**
 * Kiểm tra xem người dùng có danh sách vai trò cho trước có quyền truy cập vào đường dẫn không.
 * Áp dụng thuật toán so khớp tiền tố dài nhất (Longest Prefix Match):
 * Tuyến đường con chi tiết hơn (như /admin/users) sẽ ghi đè quy tắc của tuyến cha (/admin).
 *
 * @param pathname Đường dẫn cần kiểm tra (ví dụ: "/admin/users/123")
 * @param userRoles Danh sách vai trò của người dùng hiện tại (null/undefined nếu chưa đăng nhập)
 * @returns boolean true nếu được phép truy cập, false nếu bị từ chối
 */
export function canAccessRoute(
  pathname: string,
  userRoles?: readonly (Role | string | unknown)[] | null,
): boolean {
  const normalized = normalizePathname(pathname);

  // Tìm tất cả các quy tắc khớp với đường dẫn hiện tại
  const matchingRules = ROUTE_ACCESS_RULES.filter((rule) => {
    if (normalized === rule.pattern) return true;
    if (normalized.startsWith(rule.pattern + "/")) return true;
    return false;
  });

  // Nếu không có quy tắc nào khớp, mặc định là trang công khai (public)
  if (matchingRules.length === 0) {
    return true;
  }

  // Sắp xếp giảm dần theo độ dài của pattern để lấy tiền tố dài nhất
  matchingRules.sort((a, b) => b.pattern.length - a.pattern.length);
  const bestRule = matchingRules[0];

  // Nếu quy tắc chỉ định danh sách vai trò cụ thể
  if (bestRule.roles && bestRule.roles.length > 0) {
    return hasAnyRole(userRoles, bestRule.roles);
  }

  // Nếu quy tắc chỉ yêu cầu đăng nhập
  if (bestRule.authenticated) {
    if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) return false;
    return userRoles.some((r) => typeof r === "string" && r.trim().length > 0);
  }

  return true;
}
