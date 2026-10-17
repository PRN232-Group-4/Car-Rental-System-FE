"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FormSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { usePathname } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { getFacilities, getStaffById } from "./api";
import { useAdminTheme } from "./use-admin-theme";
import {
  Building2,
  CarFront,
  CircleUserRound,
  KeyRound,
  LayoutDashboard,
  ReceiptText,
  Tags,
  WalletCards,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { usePortalAccess } from "@/features/auth/use-portal-access";
import { isAdminOrStaffAccount } from "@/features/profile/api";
import AppPortalShell, { type PortalNavItem } from "@/components/layout/AppPortalShell";

const allNavigation: (PortalNavItem & { roles: string[] })[] = [
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
    href: "/admin/rentals",
    label: "Vận hành đơn thuê",
    icon: ReceiptText,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/inspections",
    label: "Kiểm tra xe",
    icon: CarFront,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
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
    href: "/admin/subscription-plans",
    label: "Gói Đăng Ký",
    icon: WalletCards,
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
    href: "/admin/facilities",
    label: "Cơ Sở",
    icon: Building2,
    roles: ["Admin"],
  },
  {
    href: "/admin/staffs",
    label: "Nhân Viên",
    icon: UsersRound,
    roles: ["Admin"],
  },
  {
    href: "/admin/departments",
    label: "Phòng Ban",
    icon: Building2,
    roles: ["Admin"],
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
];

export default function StaffShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useAdminTheme();
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

  // Chức danh + tên cơ sở lấy an toàn không crash 403
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

  const displayName = user?.fullName || account?.fullName || "Tài khoản quản trị";
  const avatarUrl = user ? user.avatarUrl : account?.avatarUrl;
  const jobTitle = staffRole || account?.departmentName || "Nhân viên";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (checkingAccess) {
    return (
      <div data-admin-theme={theme} className="flex min-h-[100dvh] items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-3xl"><FormSkeleton label="Đang xác thực tài khoản nhân viên..." /></div>
      </div>
    );
  }

  if (accessError || !account) {
    return (
      <div data-admin-theme={theme} className="flex min-h-[100dvh] items-center justify-center bg-canvas p-6">
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
    <AppPortalShell
      portalLabel="Staff portal"
      portalSubLabel="Cổng quản trị / Nhân viên"
      brandHref="/admin"
      navItems={navigation}
      user={{
        name: displayName,
        subtitle: jobTitle,
        avatarUrl,
        initials: (displayName || "A").charAt(0).toUpperCase(),
        badge: facilityName,
      }}
      profileHref="/admin/profile"
      profileButtonText="Xem hồ sơ nhân viên"
      profileLoading={profileLoading}
      profileError={profileError}
      theme={theme}
      onToggleTheme={toggleTheme}
      rightHeaderActions={
        facilityName ? (
          <span className="hidden rounded-full border border-line bg-sunken px-3 py-1.5 text-xs font-semibold text-ink md:inline-flex">
            {profileLoading ? (
              <span role="status" aria-label="Đang tải chi nhánh...">
                <Skeleton className="h-3 w-28" />
              </span>
            ) : (
              facilityName
            )}
          </span>
        ) : null
      }
      onLogout={handleLogout}
    >
      {children}
    </AppPortalShell>
  );
}
