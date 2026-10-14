"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "@/components/navigation/NavigationLink";
import { usePathname } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import {
  Bell,
  CarFront,
  ChevronLeft,
  CircleDollarSign,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Menu,
  CalendarClock,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { usePortalAccess } from "@/features/auth/use-portal-access";
import { initialsFor } from "@/features/profile/api";
import { isDriverStaffAccount } from "./api";
import type { DriverPortalAccount } from "./api";

const navigation = [
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

  const sidebar = (
    <>
      <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
        <Link
          href="/staff"
          className="flex items-center gap-3"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-e1">
            <CarFront className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight text-white">
              Thong Dong
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-ink-3">
              Driver portal
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Đóng menu"
          className="rounded-lg p-2 text-ink-3 hover:bg-surface/10 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="admin-sidebar-scroll flex-1 overflow-y-auto px-4 pt-7">
        <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-3">
          Không gian làm việc
        </p>
        <nav aria-label="Điều hướng tài xế" className="space-y-1.5">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-primary font-semibold text-white shadow-e1"
                    : "text-ink-3 hover:bg-surface/[0.07] hover:text-white"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] ${active ? "text-white" : "text-ink-3 group-hover:text-primary"}`}
                />
                {label}
                {active && (
                  <ChevronLeft className="ml-auto h-4 w-4 rotate-180 text-white" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-white/10 bg-surface/[0.04] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stage-ink text-sm font-bold text-white">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">
                {account?.fullName ?? "Tài xế"}
              </span>
              <span className="block truncate text-xs text-ink-3">
                {account?.departmentName ?? "Phòng ban tài xế"}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              void logout().finally(() => router.replace("/login"));
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-ink-3 transition hover:border-primary/40 hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </>
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
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-stage-ink border-r border-white/10 lg:flex">
          {sidebar}
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-scrim"
              aria-label="Đóng menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative flex h-full w-[min(86vw,300px)] flex-col bg-stage-ink shadow-e2">
              {sidebar}
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
          <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-7 lg:p-9">
            {children}
          </main>
        </div>
      </div>
    </DriverPortalContext.Provider>
  );
}
