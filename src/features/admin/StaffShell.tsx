"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { getAccountProfile } from "@/features/profile/api";
import type { AccountProfile } from "@/features/profile/api";
import { getFacilities, getStaffById } from "./api";
import type { StaffDto } from "./api";
import {
  Bell,
  Building2,
  CarFront,
  ChevronLeft,
  CircleUserRound,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ReceiptText,
  Tags,
  WalletCards,
  UsersRound,
  X,
} from "lucide-react";

const navigation = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/vehicles", label: "Quản lý phương tiện", icon: CarFront },
  { href: "/admin/vehicle-types", label: "Loại phương tiện", icon: Tags },
  { href: "/admin/policies", label: "Chính sách thuê xe", icon: ReceiptText },
  {
    href: "/admin/subscription-plans",
    label: "Gói Đăng Ký",
    icon: WalletCards,
  },
  { href: "/admin/departments", label: "Phòng Ban", icon: Building2 },
  { href: "/admin/facilities", label: "Cơ Sở", icon: Building2 },
  { href: "/admin/staffs", label: "Nhân Viên", icon: UsersRound },
  { href: "/admin/roles", label: "Vai Trò", icon: KeyRound },
  { href: "/admin/profile", label: "Hồ sơ nhân viên", icon: CircleUserRound },
];

export default function StaffShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [staff, setStaff] = useState<StaffDto | null>(null);
  const [facilityName, setFacilityName] = useState<string | null>(null);
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let active = true;
    const loadProfile = async () => {
      try {
        const profile = await getAccountProfile();
        let staffProfile: StaffDto | null = null;
        let assignedFacilityName: string | null = null;

        if (profile.staffId != null) {
          staffProfile = await getStaffById(profile.staffId);
          assignedFacilityName = staffProfile.facilityName;
        }

        if (!assignedFacilityName && profile.facilityId != null) {
          const facilities = await getFacilities();
          assignedFacilityName =
            facilities.find((facility) => facility.id === profile.facilityId)?.name ?? null;
        }

        if (active) {
          setAccount(profile);
          setStaff(staffProfile);
          setFacilityName(assignedFacilityName);
          setProfileError("");
        }
      } catch (error) {
        if (active) {
          setProfileError(
            error instanceof Error ? error.message : "Không thể tải hồ sơ nhân viên.",
          );
        }
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated]);

  const currentPage =
    navigation.find((item) => item.href === pathname)?.label ??
    (pathname === "/admin/vehicles/new" || pathname.endsWith("/edit")
      ? "Quản lý phương tiện"
      : "Tổng quan");
  const displayName = isAuthenticated
    ? account?.fullName || staff?.fullName || "Tài khoản quản trị"
    : "Chưa đăng nhập";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase();
  const jobTitle =
    isAuthenticated
      ? staff?.staffRole ||
        account?.departmentName ||
        account?.roles?.filter(Boolean).join(", ") ||
        "Nhân viên"
      : "Đăng nhập để tiếp tục";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/");
    } finally {
      setLoggingOut(false);
    }
  };

  const sidebar = (
    <>
      <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
        <Link
          href="/admin"
          className="flex items-center gap-3"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-emerald-950">
            <CarFront className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight text-white">
              Thong Dong
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Staff portal
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Đóng menu"
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="admin-sidebar-scroll flex-1 overflow-y-auto px-4 pt-7">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Không gian làm việc
        </p>
        <nav aria-label="Điều hướng nhân viên" className="space-y-1.5">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href === "/admin/vehicles" &&
                pathname.startsWith("/admin/vehicles/"));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-400 font-semibold text-emerald-950 shadow-lg shadow-emerald-950/10"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] ${active ? "text-emerald-950" : "text-slate-400 group-hover:text-emerald-300"}`}
                />
                {label}
                {active && (
                  <ChevronLeft className="ml-auto h-4 w-4 rotate-180" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
              {initials || "AD"}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">
                {displayName}
              </span>
              <span className="block text-xs text-slate-400">
                {profileLoading ? "Đang tải hồ sơ..." : jobTitle}
              </span>
            </span>
          </div>
          {isAuthenticated && profileError && (
            <p role="status" className="mt-2 text-xs text-amber-200">
              {profileError}
            </p>
          )}
          <Link
            href="/admin/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-4 block rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-semibold text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-200"
          >
            Xem hồ sơ cá nhân
          </Link>
          {authLoading ? (
            <p role="status" className="mt-2 px-3 py-2 text-center text-xs text-slate-400">
              Đang kiểm tra đăng nhập...
            </p>
          ) : isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                void handleLogout();
              }}
              disabled={loggingOut}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-300/20 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:border-rose-300/40 hover:bg-rose-400/10 disabled:cursor-wait disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/20 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-300/40 hover:bg-emerald-400/10"
            >
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-[#10231f] lg:flex">
        {sidebar}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            aria-label="Đóng menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,300px)] flex-col bg-[#10231f] shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium text-slate-400">
                Cổng quản trị / Nhân viên
              </p>
              <h1 className="mt-0.5 text-base font-bold text-slate-900">
                {currentPage}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:inline-flex">
              {authLoading || (isAuthenticated && profileLoading)
                ? "Đang tải chi nhánh..."
                : isAuthenticated
                  ? facilityName || "Chưa phân công chi nhánh"
                  : "Chưa đăng nhập"}
            </span>
            <button
              type="button"
              aria-label="Thông báo"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
            </button>
            <Link
              href="/admin/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-900"
              aria-label="Hồ sơ nhân viên"
            >
              {initials || "AD"}
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-7 lg:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}
