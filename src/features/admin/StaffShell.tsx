"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "@/components/navigation/NavigationLink";
import AccountAvatar from "@/components/ui/AccountAvatar";
import { FormSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { usePathname } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { getFacilities, getStaffById } from "./api";
import { useAdminTheme } from "./use-admin-theme";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  X,
} from "lucide-react";
import { getNavigation } from "@/config/navigation";
import type { PortalNavItem } from "@/components/layout/AppPortalShell";
import { useAuth } from "@/features/auth";
import { usePortalAccess } from "@/features/auth/use-portal-access";
import { isAdminOrStaffAccount } from "@/features/profile/api";
import styles from "./StaffShell.module.css";

export default function StaffShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(true);
  const { theme, toggleTheme } = useAdminTheme();
  const pathname = usePathname();
  const [menuAnimated, setMenuAnimated] = useState(false);
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

  const navigation = useMemo<PortalNavItem[]>(() => {
    const items = getNavigation(account?.roles ?? user?.roles, "admin");
    return items.map((item) => ({
      href: item.href,
      label: item.label,
      icon: (item.icon as React.ElementType) || LayoutDashboard,
    }));
  }, [account?.roles, user?.roles]);

  const currentPage =
    navigation.find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.label ?? "Tổng quan";

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
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const sidebar = (
    <>
      <div className={`${styles.brandHeader} flex h-[76px] shrink-0 items-center justify-between border-b border-line px-6`}>
        <Link
          href="/admin"
          className={`${styles.brandLink} flex min-w-0 items-center gap-3`}
          aria-label="Tổng quan Thong Dong"
          title="Tổng quan Thong Dong"
          onClick={() => setMobileMenuOpen(false)}
        >
          <Image
            src="/assets/logo.jpg"
            alt="Logo Thong Dong"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-e1"
          />
          <span className={styles.sidebarText}>
            <span className="block text-lg font-bold tracking-tight text-ink">
              Thong Dong
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Staff portal
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Đóng menu"
          className="rounded-lg p-2 text-ink-3 hover:bg-sunken hover:text-ink lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className={`${styles.navigationScroll} admin-sidebar-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-7`}>
        <p className={`${styles.sectionLabel} whitespace-nowrap px-3 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-2`}>
          Không gian làm việc
        </p>
        <nav aria-label="Điều hướng nhân viên" className="space-y-1.5">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                title={label}
                className={`${styles.navLink} group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? "bg-primary font-semibold text-white shadow-e1"
                    : "text-ink-2 hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-ink-2 group-hover:text-primary"}`}
                />
                <span className={styles.navLabel}>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={`${styles.profileFooter} mt-auto shrink-0 p-4`}>
        <div className={`${styles.profileCard} rounded-2xl border border-line bg-canvas p-4`}>
          <Link href="/admin/profile" onClick={() => setMobileMenuOpen(false)} aria-label={`Hồ sơ ${displayName}`} title={`${displayName} · ${jobTitle}`} className={`${styles.profileIdentity} flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-primary`}>
            <AccountAvatar src={avatarUrl} name={displayName} className="h-10 w-10 rounded-full bg-stage-ink text-sm font-bold text-white" />
            <span className={styles.sidebarText}>
              <span className="block truncate text-sm font-semibold text-ink">
                {displayName}
              </span>
              <span className="block truncate text-xs text-ink-3">
                {profileLoading ? <span role="status" aria-label="Đang tải hồ sơ..."><Skeleton className="h-3 w-24" /></span> : jobTitle}
              </span>
            </span>
          </Link>
          {profileError && (
            <p role="status" className={`${styles.profileError} mt-2 text-xs text-danger`}>
              {profileError}
            </p>
          )}
          <Link
            href="/admin/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`${styles.profileLink} mt-4 block rounded-lg border border-line-strong px-3 py-2 text-center text-xs font-semibold text-ink-2 transition hover:bg-sunken hover:text-ink`}
          >
            Xem hồ sơ nhân viên
          </Link>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              void handleLogout();
            }}
            disabled={loggingOut}
            aria-label={loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            title="Đăng xuất"
            className={`${styles.logoutButton} mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-ink-3 transition hover:bg-sunken hover:text-ink disabled:cursor-wait disabled:opacity-60`}
          >
            <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className={styles.sidebarText}>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          </button>
        </div>
      </div>
    </>
  );

  if (checkingAccess) {
    return (
      <div data-admin-theme={theme} className="flex min-h-[100dvh] items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-3xl"><FormSkeleton label="Đang xác thực tài khoản nhân viên..." /></div>
      </div>
    );
  }

  if (accessError) {
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
    <div className={`${styles.shell} min-h-[100dvh] bg-canvas text-ink`} data-admin-theme={theme} data-menu-collapsed={!desktopMenuOpen} data-menu-animated={menuAnimated}>
      <aside
        id="admin-desktop-navigation"
        className={`${styles.desktopSidebar} ${styles.sidebarSurface} fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line lg:flex`}
      >
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
          <aside
            id="admin-mobile-navigation"
            className={`${styles.sidebarSurface} relative flex h-full w-[min(86vw,300px)] flex-col shadow-e2`}
          >
            {sidebar}
          </aside>
        </div>
      )}

      <div className={`${styles.content} min-h-[100dvh]`}>
        <header className="glass-admin sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line px-4 sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="admin-mobile-navigation"
              className="rounded-xl border border-line p-2 text-ink-3 hover:bg-sunken lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => { setMenuAnimated(true); setDesktopMenuOpen((open) => !open); }}
              aria-label={desktopMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={desktopMenuOpen}
              aria-controls="admin-desktop-navigation"
              title={desktopMenuOpen ? "Đóng menu" : "Mở menu"}
              className="hidden rounded-xl border border-line p-2 text-ink-3 transition hover:bg-sunken lg:inline-flex"
            >
              {desktopMenuOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-3">
                Cổng quản trị / Nhân viên
              </p>
              <h1 className="mt-0.5 truncate text-base font-bold text-ink">
                {currentPage}
              </h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <span className="hidden rounded-full border border-line bg-sunken px-3 py-1.5 text-xs font-semibold text-ink md:inline-flex">
              {profileLoading
                ? <span role="status" aria-label="Đang tải chi nhánh..."><Skeleton className="h-3 w-28" /></span>
                : facilityName || "Chưa phân công chi nhánh"}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Chế độ tối"
              aria-pressed={theme === "dark"}
              title={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-ink-2 transition hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {theme === "dark" ? <Sun aria-hidden="true" className="h-5 w-5" /> : <Moon aria-hidden="true" className="h-5 w-5" />}
            </button>
            <button
              type="button"
              aria-label="Thông báo"
              className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-ink-3 transition hover:bg-sunken"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
            </button>
            <Link
              href="/admin/profile"
              className="rounded-full"
              aria-label="Hồ sơ nhân viên"
            >
              <AccountAvatar src={avatarUrl} name={displayName} className="h-10 w-10 rounded-full bg-primary/10 text-xs font-bold text-primary" />
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
