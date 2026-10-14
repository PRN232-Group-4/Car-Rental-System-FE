"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getFacilities, getStaffById } from "./api";
import {
  Bell,
  Building2,
  CarFront,
  KeyRound,
  LayoutDashboard,
  CircleUserRound,
  Menu,
  ReceiptText,
  Tags,
  WalletCards,
  UsersRound,
} from "lucide-react";
import AppSidebar, { type AppNavItem } from "@/components/layout/AppSidebar";
import { useAuth } from "@/features/auth";
import { usePortalAccess } from "@/features/auth/use-portal-access";
import { initialsFor, isAdminOrStaffAccount } from "@/features/profile/api";

const allNavigation: (AppNavItem & { roles: string[] })[] = [
  {
    href: "/admin/maintenance", label: "Quản lý bảo trì", icon: CarFront,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/dispatch", label: "Điều phối tài xế", icon: UsersRound,
    roles: ["Admin", "Manager", "Staff", "CustomerService"],
  },
  {
    href: "/admin/rentals", label: "Vận hành đơn thuê", icon: ReceiptText,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/inspections", label: "Kiểm tra xe", icon: CarFront,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin",
    label: "Tổng quan",
    icon: LayoutDashboard,
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
    label: "Gói đăng ký",
    icon: WalletCards,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/departments",
    label: "Phòng ban",
    icon: Building2,
    roles: ["Admin"],
  },
  {
    href: "/admin/facilities",
    label: "Chi nhánh",
    icon: Building2,
    roles: ["Admin"],
  },
  {
    href: "/admin/staffs",
    label: "Nhân viên",
    icon: UsersRound,
    roles: ["Admin"],
  },
  {
    href: "/admin/roles",
    label: "Vai trò",
    icon: KeyRound,
    roles: ["Admin"],
  },
  {
    href: "/admin/profile",
    label: "Hồ sơ nhân viên",
    icon: CircleUserRound,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
];

export default function StaffShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { account, checkingAccess, accessError } = usePortalAccess(isAdminOrStaffAccount);
  const [staffRole, setStaffRole] = useState<string | null>(null);
  const [facilityName, setFacilityName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const userRoles = useMemo(
    () => (account?.roles ?? []).map((r) => r.toLowerCase()),
    [account?.roles],
  );

  const navigation = useMemo(() => {
    return allNavigation.filter((item) =>
      item.roles.some((role) => userRoles.includes(role.toLowerCase())),
    );
  }, [userRoles]);

  // usePortalAccess chỉ trả account; chức danh + tên cơ sở lấy an toàn không crash 403
  useEffect(() => {
    if (!account) return;
    let active = true;

    const loadAssignment = async () => {
      try {
        let nextStaffRole: string | null = null;
        let nextFacilityName: string | null = null;

        const isAdmin = userRoles.includes("admin");

        if (isAdmin && account.staffId != null) {
          try {
            const staff = await getStaffById(account.staffId);
            nextStaffRole = staff.staffRole;
            nextFacilityName = staff.facilityName;
          } catch {
            // Không chặn nếu role lookup lỗi
          }
        }

        if (!nextStaffRole) {
          if (userRoles.includes("admin")) nextStaffRole = "Quản trị viên";
          else if (userRoles.includes("manager")) nextStaffRole = "Quản lý";
          else if (userRoles.includes("customerservice")) nextStaffRole = "Chăm sóc khách hàng";
          else if (userRoles.includes("maintenance")) nextStaffRole = "Kỹ thuật / Bảo trì";
          else nextStaffRole = account.departmentName || "Nhân viên";
        }

        if (!nextFacilityName && account.facilityId != null) {
          try {
            const facilities = await getFacilities();
            nextFacilityName =
              facilities.find((facility) => facility.id === account.facilityId)?.name ?? null;
          } catch {
            // Ignore
          }
        }

        if (active) {
          setStaffRole(nextStaffRole);
          setFacilityName(nextFacilityName);
          setProfileError("");
        }
      } catch (error) {
        if (active) {
          setProfileError(
            error instanceof Error ? error.message : "Không thể tải hồ sơ nhân viên.",
          );
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    };

    void loadAssignment();
    return () => {
      active = false;
    };
  }, [account, userRoles]);

  const currentPage =
    navigation.find((item) => item.href === pathname)?.label ??
    (pathname === "/admin/vehicles/new" || pathname.endsWith("/edit")
      ? "Quản lý phương tiện"
      : "Tổng quan");
  const displayName = account?.fullName || "Tài khoản quản trị";
  const initials = useMemo(() => initialsFor(account?.fullName), [account?.fullName]);
  const jobTitle = staffRole || account?.departmentName || "Nhân viên";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const rail = (onNavigate?: () => void) => (
    <AppSidebar
      portalLabel="Khu nhân viên"
      items={navigation}
      pathname={pathname}
      onNavigate={onNavigate}
      user={{
        name: displayName,
        subtitle: profileLoading ? "Đang tải hồ sơ..." : jobTitle,
        initials,
      }}
      profileHref="/admin/profile"
      onLogout={() => void handleLogout()}
      loggingOut={loggingOut}
      notice={profileError || undefined}
    />
  );

  if (checkingAccess) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-canvas p-6">
        <p role="status" className="text-sm font-medium text-ink-3">
          Đang xác thực tài khoản nhân viên...
        </p>
      </div>
    );
  }

  if (accessError || !account) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-canvas p-6">
        <p
          role="alert"
          className="max-w-xl rounded-xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger"
        >
          {accessError || "Tài khoản không có quyền truy cập cổng quản trị."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-line bg-surface lg:flex">
        {rail()}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-scrim"
            aria-label="Đóng menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,300px)] flex-col bg-surface shadow-e2">
            {rail(() => setMobileMenuOpen(false))}
          </aside>
        </div>
      )}

      <div className="min-h-[100dvh] lg:pl-[260px]">
        <header className="glass-admin sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line px-4 sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
              className="rounded-xl border border-line p-2 text-ink-3 hover:bg-sunken lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium text-ink-3">
                Cổng quản trị / Nhân viên
              </p>
              <h1 className="mt-0.5 text-base font-bold text-ink">
                {currentPage}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-line bg-sunken px-3 py-1.5 text-xs font-semibold text-ink sm:inline-flex">
              {profileLoading
                ? "Đang tải chi nhánh..."
                : facilityName || "Chưa phân công chi nhánh"}
            </span>
            <button
              type="button"
              aria-label="Thông báo"
              className="relative rounded-xl border border-line p-2.5 text-ink-3 transition hover:bg-sunken"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            </button>
            <Link
              href="/admin/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
              aria-label="Hồ sơ nhân viên"
            >
              {initials}
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-7 lg:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}
