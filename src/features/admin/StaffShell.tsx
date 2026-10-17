"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FormSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { getFacilities, getStaffById } from "./api";
import { useAdminTheme } from "./use-admin-theme";
import { LayoutDashboard } from "lucide-react";
import { getNavigation } from "@/config/navigation";
import { useAuth } from "@/features/auth";
import { usePortalAccess } from "@/features/auth/use-portal-access";
import { isAdminOrStaffAccount } from "@/features/profile/api";
import AppPortalShell, { type PortalNavItem } from "@/components/layout/AppPortalShell";

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

  const navigation = useMemo<PortalNavItem[]>(() => {
    const items = getNavigation(account?.roles ?? user?.roles, "admin");
    return items.map((item) => ({
      href: item.href,
      label: item.label,
      icon: (item.icon as React.ElementType) || LayoutDashboard,
    }));
  }, [account?.roles, user?.roles]);

  // Chức danh + tên cơ sở lấy an toàn không crash 403
  useEffect(() => {
    if (!account) return;
    let active = true;

    const loadAssignment = async () => {
      try {
        let nextStaffRole: string | null = null;
        let nextFacilityName: string | null = null;

        const isAdmin = userRoles.includes("admin");

        if (account.staffId) {
          try {
            const staff = await getStaffById(account.staffId);
            if (active && staff) {
              nextStaffRole = staff.isDriver ? "Tài xế" : "Nhân viên vận hành";
              if (staff.departmentName) {
                nextStaffRole = `${nextStaffRole} • ${staff.departmentName}`;
              }
              if (staff.facilityName) {
                nextFacilityName = staff.facilityName;
              }
            }
          } catch {
            // bỏ qua lỗi nếu không đọc được staff detail
          }
        }

        if (!nextFacilityName && account.facilityId && isAdmin) {
          try {
            const facilities = await getFacilities();
            const facility = facilities.find((f) => f.id === account.facilityId);
            if (active && facility) {
              nextFacilityName = facility.name;
            }
          } catch {
            // bỏ qua lỗi nếu không có quyền đọc danh sách cơ sở
          }
        }

        if (active) {
          setStaffRole(nextStaffRole);
          setFacilityName(nextFacilityName);
          setProfileError("");
        }
      } catch {
        if (active) {
          setProfileError("Không thể tải thông tin chi nhánh.");
        }
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    };

    void loadAssignment();

    return () => {
      active = false;
    };
  }, [account, userRoles]);

  const displayName = account?.fullName || user?.fullName || "Quản trị viên";
  const jobTitle =
    staffRole ||
    (userRoles.includes("admin")
      ? "Quản trị viên hệ thống"
      : userRoles.includes("manager")
        ? "Quản lý vận hành"
        : userRoles.includes("customerservice")
          ? "Chăm sóc khách hàng"
          : userRoles.includes("maintenance")
            ? "Kỹ thuật bảo trì"
            : userRoles.includes("driver")
              ? "Tài xế"
              : "Nhân viên");

  const avatarUrl = account?.avatarUrl || user?.avatarUrl;

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (checkingAccess) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-e2">
          <FormSkeleton label="Đang kiểm tra quyền truy cập..." fields={3} />
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-e2 text-center space-y-4">
          <p className="text-sm font-semibold text-danger">{accessError}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-e1 hover:bg-primary-hover"
          >
            Đăng nhập lại
          </button>
        </div>
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
