"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CarFront,
  CircleDollarSign,
  CircleUserRound,
  LayoutDashboard,
  Menu,
  CalendarClock,
} from "lucide-react";
import AppSidebar, { type AppNavItem } from "@/components/layout/AppSidebar";
import { useAuth } from "@/features/auth";
import { usePortalAccess } from "@/features/auth/use-portal-access";
import { initialsFor } from "@/features/profile/api";
import { isDriverStaffAccount } from "./api";
import type { DriverPortalAccount } from "./api";

const navigation: AppNavItem[] = [
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
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { account, checkingAccess, accessError } = usePortalAccess<DriverPortalAccount>(
    isDriverStaffAccount,
  );

  const currentPage =
    navigation.find((item) => item.href === pathname)?.label ?? "Cổng tài xế";
  const initials = useMemo(
    () => initialsFor(account?.fullName ?? user?.fullName),
    [account?.fullName, user?.fullName],
  );

  const rail = (onNavigate?: () => void) => (
    <AppSidebar
      portalLabel="Khu tài xế"
      items={navigation}
      pathname={pathname}
      onNavigate={onNavigate}
      user={{
        name: account?.fullName ?? user?.fullName ?? "Tài xế",
        subtitle: account?.departmentName ?? "Phòng ban tài xế",
        initials,
      }}
      profileHref="/staff/profile"
      onLogout={() => {
        void logout().finally(() => router.replace("/login"));
      }}
    />
  );

  if (checkingAccess) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-canvas p-6">
        <p role="status" className="text-sm font-medium text-ink-3">
          Đang xác thực tài khoản tài xế...
        </p>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-canvas p-6">
        <p role="alert" className="max-w-xl rounded-xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          {accessError}
        </p>
      </div>
    );
  }

  if (!account) return null;

  return (
    <DriverPortalContext.Provider value={account}>
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
                  Cổng tài xế / Nhân viên
                </p>
                <h1 className="mt-0.5 text-base font-bold text-ink">
                  {currentPage}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {account.facilityId !== null && (
                <span className="hidden rounded-full border border-line bg-sunken px-3 py-1.5 text-xs font-semibold text-ink sm:inline-flex">
                  Cơ sở #{account.facilityId}
                </span>
              )}
                <span
                aria-hidden="true"
                className="relative rounded-xl border border-line p-2.5 text-ink-3"
              >
                <Bell className="h-[18px] w-[18px]" />
              </span>
              <Link
                href="/staff/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                aria-label="Hồ sơ của tôi"
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
    </DriverPortalContext.Provider>
  );
}
