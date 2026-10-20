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
  Star,
} from "lucide-react";
import type { Role } from "@/features/auth/roles";
import { hasAnyRole } from "@/features/auth/access";

export interface NavItem {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  roles?: readonly Role[];
  badge?: string;
  description?: string;
  external?: boolean;
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
  "/admin/inspections": "Vận hành",
  "/admin/maintenance": "Vận hành",
  "/admin/dispatch": "Điều phối",
  "/admin/drivers/schedule": "Điều phối",
  "/admin/reports": "Chăm sóc & Sự cố",
  "/admin/reports/detail": "Chăm sóc & Sự cố",
  "/admin/reviews": "Chăm sóc & Sự cố",
  "/admin/reviews/detail": "Chăm sóc & Sự cố",
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
    roles: ["Admin", "Manager"],
  },
  {
    href: "/admin/maintenance",
    label: "Quản lý bảo trì",
    icon: CarFront,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/dispatch",
    label: "Điều phối tài xế",
    icon: UsersRound,
    roles: ["Admin", "Manager", "Staff", "CustomerService"],
  },
  {
    href: "/admin/rentals",
    label: "Vận hành đơn thuê",
    icon: ReceiptText,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/reports",
    label: "Báo cáo sự cố",
    icon: MessageSquareWarning,
    roles: ["Admin", "Manager", "Staff", "CustomerService"],
  },
  {
    href: "/admin/reviews",
    label: "Đánh giá nhân sự",
    icon: Star,
    roles: ["Admin", "Manager"],
  },
  {
    href: "/admin/inspections",
    label: "Kiểm tra xe",
    icon: CarFront,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/vehicles",
    label: "Quản lý phương tiện",
    icon: CarFront,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/vehicle-types",
    label: "Loại phương tiện",
    icon: Tags,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/policies",
    label: "Chính sách thuê xe",
    icon: ReceiptText,
    roles: ["Admin", "Manager"],
  },
  {
    href: "/admin/subscription-plans",
    label: "Gói Đăng Ký",
    icon: WalletCards,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
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
    roles: ["Admin"],
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
    roles: ["Admin", "Manager", "Staff", "CustomerService"],
  },
  {
    href: "/admin/users",
    label: "Người dùng",
    icon: UsersRound,
    roles: ["Admin", "Manager"],
  },
  {
    href: "/admin/roles",
    label: "Vai Trò",
    icon: KeyRound,
    roles: ["Admin"],
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
    if (!item.roles || item.roles.length === 0) return true;
    return hasAnyRole(roles, item.roles);
  });
}
