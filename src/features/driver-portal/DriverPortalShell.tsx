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
import { initialsFor } from "@/features/profile/api";
import type { DriverPortalAccount } from "./api";
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

export default function DriverPortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const activeAccount: DriverPortalAccount = useMemo(() => ({
    email: user?.email || "driver@thongdong.vn",
    fullName: user?.fullName || "Tài xế Thong Dong",
    gender: "Nam",
    phone: "0901 234 567",
    avatarUrl: user?.avatarUrl || null,
    roles: ["Driver", "Staff"],
    staffId: 1,
    departmentId: 1,
    departmentName: "Đội xe & Tài xế",
    facilityId: 1,
  }), [user]);

  const initials = useMemo(
    () => initialsFor(activeAccount.fullName),
    [activeAccount.fullName],
  );

  return (
    <DriverPortalContext.Provider value={activeAccount}>
      <AppPortalShell
        portalLabel="Driver portal"
        portalSubLabel="Cổng tài xế / Nhân viên"
        brandHref="/staff"
        navItems={navigation}
        user={{
          name: activeAccount.fullName ?? "Tài xế",
          subtitle: activeAccount.departmentName ?? "Phòng ban tài xế",
          initials,
          badge: activeAccount.facilityId ? `Cơ sở #${activeAccount.facilityId}` : null,
        }}
        profileHref="/staff/profile"
        profileButtonText="Hồ sơ của tôi"
        rightHeaderActions={
          activeAccount.facilityId !== null ? (
            <span className="hidden rounded-full border border-line bg-sunken px-3 py-1.5 text-xs font-semibold text-ink sm:inline-flex">
              Cơ sở #{activeAccount.facilityId}
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
