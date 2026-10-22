import type { ComponentType } from "react";
import {
  LayoutDashboard,
  CarFront,
  UsersRound,
  ReceiptText,
  Tags,
  WalletCards,
  Building2,
  KeyRound,
  CircleUserRound,
  Car,
  Package,
  FileText,
  CreditCard,
  FileCheck,
  Calendar,
  Compass,
  MessageSquareWarning,
  MapPin,
  ShieldAlert,
  Star,
} from "lucide-react";
import type { Role } from "@/features/auth/roles";
import { canAccessRoute, hasAnyRole } from "@/features/auth/access";

export interface NavItem {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  roles?: readonly Role[];
  badge?: string;
  description?: string;
  external?: boolean;
  defaultQuery?: string;
}

export type NavigationArea = "public" | "customer" | "admin" | "driver";

/** Danh mục điều hướng trang chủ và công khai */
export const PUBLIC_NAV_ITEMS: readonly NavItem[] = [
  { href: "/#tim-xe", label: "Thuê xe" },
  { href: "/#chi-nhanh", label: "Điểm đón & Cơ sở" },
  { href: "/#bang-gia", label: "Gói hội viên" },
  { href: "/#ve-chung-toi", label: "Về Thong Dong" },
] as const;

/** Chương điều hướng của từng route Admin (dùng cho masthead + command palette). */
export const ROUTE_CHAPTER_MAP: Record<string, string> = {
  "/admin": "Ca trực",
  "/admin/dashboard": "Ca trực",
  "/admin/vehicles": "Đội xe",
  "/admin/vehicles/new": "Đội xe",
  "/admin/vehicles/edit": "Đội xe",
  "/admin/vehicle-types": "Đội xe",
  "/admin/rentals": "Vận hành",
  "/admin/handovers": "Vận hành",
  "/admin/vehicle-license": "Chăm sóc & Sự cố",
  "/admin/tracking": "Điều phối",
  "/admin/inspections": "Vận hành",
  "/admin/maintenance": "Vận hành",
  "/admin/dispatch": "Điều phối",
  "/admin/drivers/schedule": "Điều phối",
  "/admin/reports": "Chăm sóc & Sự cố",
  "/admin/reports/detail": "Chăm sóc & Sự cố",
  "/admin/reviews": "Chăm sóc & Sự cố",
  "/admin/reviews/detail": "Chăm sóc & Sự cố",
  "/admin/customers": "Chăm sóc & Sự cố",
  "/admin/policies": "Chính sách",
  "/admin/subscription-plans": "Chính sách",
  "/admin/users": "Tổ chức",
  "/admin/users/detail": "Tổ chức",
  "/admin/staffs": "Tổ chức",
  "/admin/staffs/new": "Tổ chức",
  "/admin/staffs/detail": "Tổ chức",
  "/admin/departments": "Tổ chức",
  "/admin/facilities": "Tổ chức",
  "/admin/roles": "Tổ chức",
  "/admin/audit-logs": "Tổ chức",
  "/admin/profile": "Cá nhân",
};

/** Danh mục điều hướng cổng khách hàng cá nhân */
export const CUSTOMER_NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/account/trips",
    label: "Chuyến của tôi",
    icon: Compass,
    roles: ["Customer"],
  },
  { href: "/booking", label: "Đặt xe", icon: Car },
  { href: "/nearby-vehicles", label: "Xe gần đây", icon: MapPin },
  {
    href: "/driver-license",
    label: "Giấy phép lái xe (GPLX)",
    icon: FileCheck,
    roles: ["Customer"],
  },
  {
    href: "/rental-contract",
    label: "Hợp đồng dài hạn",
    icon: FileText,
    roles: ["Customer"],
  },
  {
    href: "/my-subscriptions",
    label: "Gói của tôi",
    icon: Package,
    roles: ["Customer"],
  },
  { href: "/invoices", label: "Hóa đơn", icon: FileText },
  { href: "/payment-history", label: "Lịch sử thanh toán", icon: CreditCard },
  { href: "/report-incident", label: "Báo cáo sự cố", icon: FileText },
] as const;

/** Danh mục điều hướng cổng quản trị và nhân viên (/admin) */
export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/admin",
    label: "Tổng quan",
    icon: LayoutDashboard,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/dashboard",
    label: "Dashboard biểu đồ",
    icon: LayoutDashboard,
    roles: ["Manager"],
  },
  {
    href: "/admin/maintenance",
    label: "Quản lý bảo trì",
    icon: CarFront,
    roles: ["Maintenance", "Manager"],
  },
  {
    href: "/admin/customers",
    label: "Khách hàng & GPLX",
    icon: FileCheck,
    roles: ["CustomerService", "Staff", "Manager"],
    defaultQuery: "?licenseStatus=pending",
  },
  {
    href: "/admin/dispatch",
    label: "Điều phối tài xế",
    icon: UsersRound,
    roles: ["Staff", "Manager"],
  },
  {
    href: "/admin/rentals",
    label: "Vận hành đơn thuê",
    icon: ReceiptText,
    roles: ["Staff", "CustomerService", "Manager"],
  },
  { href: "/admin/handovers", label: "Bàn giao xe", icon: KeyRound, roles: ["Staff", "Manager"] },
  { href: "/admin/tracking", label: "Vùng địa lý và cảnh báo", icon: ShieldAlert, roles: ["Staff", "Manager"] },
  {
    href: "/admin/reports",
    label: "Báo cáo sự cố",
    icon: MessageSquareWarning,
    roles: ["Staff", "CustomerService", "Maintenance", "Manager"],
  },
  {
    href: "/admin/reviews",
    label: "Đánh giá nhân sự",
    icon: Star,
    roles: ["Manager"],
  },
  {
    href: "/admin/inspections",
    label: "Kiểm tra xe",
    icon: CarFront,
    roles: ["Staff", "Maintenance", "Manager"],
  },
  {
    href: "/admin/vehicles",
    label: "Quản lý phương tiện",
    icon: CarFront,
    roles: ["Staff", "Maintenance", "Manager"],
  },
  {
    href: "/admin/vehicle-types",
    label: "Loại phương tiện",
    icon: Tags,
    roles: ["Manager"],
  },
  {
    href: "/admin/policies",
    label: "Chính sách thuê xe",
    icon: ReceiptText,
    roles: ["Manager"],
  },
  {
    href: "/admin/subscription-plans",
    label: "Gói Đăng Ký",
    icon: WalletCards,
    roles: ["Manager"],
  },
  {
    href: "/admin/departments",
    label: "Phòng Ban",
    icon: Building2,
    roles: ["Admin"],
  },
  {
    href: "/admin/facilities",
    label: "Cơ Sở",
    icon: Building2,
    roles: ["Admin", "Manager"],
  },
  {
    href: "/admin/staffs",
    label: "Nhân Viên",
    icon: UsersRound,
    roles: ["Admin", "Manager"],
  },
  {
    href: "/admin/drivers/schedule",
    label: "Lịch Trình Tài Xế",
    icon: Calendar,
    roles: ["Staff", "Manager"],
  },
  {
    href: "/admin/users",
    label: "Người dùng",
    icon: UsersRound,
    roles: ["Admin"],
  },
  {
    href: "/admin/roles",
    label: "Vai Trò",
    icon: KeyRound,
    roles: ["Admin"],
  },
  {
    href: "/admin/audit-logs",
    label: "Nhật ký kiểm toán",
    icon: ShieldAlert,
    roles: ["Admin", "Manager"],
  },
  {
    href: "/admin/profile",
    label: "Hồ sơ nhân viên",
    icon: CircleUserRound,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
] as const;

/** Danh mục điều hướng cổng tài xế (/staff) */
export const DRIVER_NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/staff",
    label: "Nhiệm vụ chuyến đi",
    icon: Car,
    roles: ["Driver", "Admin", "Manager", "Staff"],
  },
] as const;

/**
 * Lấy danh sách các mục điều hướng phù hợp với phân quyền vai trò người dùng trong từng phân vùng.
 * Vùng admin yêu cầu mục vừa đạt role hiển thị vừa qua canAccessRoute: quyền route chỉ thu hẹp menu,
 * không bao giờ nới rộng tập role hiển thị.
 *
 * @param roles Danh sách vai trò của người dùng hiện tại
 * @param area Phân vùng giao diện ("public" | "customer" | "admin" | "driver")
 * @returns Danh sách NavItem đã được lọc quyền
 */
export function getNavigation(
  roles: readonly string[] | null | undefined,
  area: NavigationArea,
): NavItem[] {
  let items: readonly NavItem[];
  switch (area) {
    case "admin":
      items = ADMIN_NAV_ITEMS;
      break;
    case "customer":
      items = CUSTOMER_NAV_ITEMS;
      break;
    case "driver":
      items = DRIVER_NAV_ITEMS;
      break;
    case "public":
    default:
      return [...PUBLIC_NAV_ITEMS];
  }

  return items.filter((item) => {
    if (item.roles && item.roles.length > 0 && !hasAnyRole(roles, item.roles)) return false;
    if (area !== "admin") return true;
    return canAccessRoute(item.href, roles);
  });
}
