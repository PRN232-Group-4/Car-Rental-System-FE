"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import {
  CarFront,
  CircleDollarSign,
  CircleUserRound,
  LayoutDashboard,
  CalendarClock,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { usePortalAccess } from "@/features/auth/use-portal-access";
import { DriverShellSkeleton } from "@/components/layout/PortalShellSkeleton";
import { initialsFor } from "@/features/profile/api";
import { isDriverStaffAccount, type DriverPortalAccount } from "./api";
import AppPortalShell, { type PortalNavItem } from "@/components/layout/AppPortalShell";

const navigation: PortalNavItem[] = [
  { href: "/staff", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/staff/vehicles", label: "Phương tiện của tôi", icon: CarFront },
  { href: "/staff/shifts", label: "Ca làm việc", icon: CalendarClock },
  { href: "/staff/revenue", label: "Doanh thu", icon: CircleDollarSign },
  { href: "/staff/profile", label: "Hồ sơ của tôi", icon: CircleUserRound },
];

const DriverPortalContext = createContext<DriverPortalAccount | null>(null);

export function useDriverPortalAccount(): DriverPortalAccount {
  const account = useContext(DriverPortalContext);
  if (!account) {
    throw new Error("useDriverPortalAccount must be used within DriverPortalShell");
  }
  return account;
}

/**
 * Cổng tài xế chỉ chạy trên hồ sơ nhân sự thật: `usePortalAccess` xác thực hồ sơ
 * (Staff/Driver + staffId) trước khi render, nên không còn danh tính/SĐT/cơ sở bịa và
 * không có chuyện gọi API bằng staffId giả khi chưa đăng nhập.
 */
export default function DriverPortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();
  const { account, checkingAccess, accessError } = usePortalAccess<DriverPortalAccount>(isDriverStaffAccount);

  const initials = useMemo(() => (account ? initialsFor(account.fullName ?? account.email ?? "TD") : "TD"), [account]);

  if (checkingAccess) return <DriverShellSkeleton />;

  if (!account) {
    return <div role="alert" className="mx-auto max-w-xl space-y-4 px-4 py-16 text-sm text-td-ink">
      <p className="font-bold">Không mở được cổng tài xế.</p>
      <p className="text-td-muted">
        {accessError || "Tài khoản này chưa có hồ sơ nhân sự tài xế. Vui lòng liên hệ quản trị viên để được gán vai trò Tài xế."}
      </p>
      <button
        type="button"
        onClick={() => router.replace("/login")}
        className="rounded border border-td-rule px-4 py-2.5 font-bold"
      >
        Về trang đăng nhập
      </button>
    </div>;
  }

  return (
    <DriverPortalContext.Provider value={account}>
      <AppPortalShell
        portalLabel="Driver portal"
        portalSubLabel="Cổng tài xế / Nhân viên"
        brandHref="/staff"
        navItems={navigation}
        user={{
          name: account.fullName?.trim() || account.email || "Tài xế Thong Dong",
          subtitle: account.departmentName?.trim() || "Chưa cập nhật phòng ban",
          initials,
          badge: account.facilityId !== null ? `Cơ sở #${account.facilityId}` : null,
        }}
        profileHref="/staff/profile"
        profileButtonText="Hồ sơ của tôi"
        rightHeaderActions={
          account.facilityId !== null ? (
            <span className="hidden border border-td-rule bg-td-chalk px-3 py-1.5 text-xs font-semibold text-td-ink sm:inline-flex">
              Cơ sở #{account.facilityId}
            </span>
          ) : null
        }
        onLogout={async () => {
          await logout();
          router.replace("/login");
        }}
      >
        {children}
      </AppPortalShell>
    </DriverPortalContext.Provider>
  );
}
