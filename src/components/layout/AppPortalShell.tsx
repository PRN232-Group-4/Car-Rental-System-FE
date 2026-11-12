"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "@/components/navigation/NavigationLink";
import AccountAvatar from "@/components/ui/AccountAvatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePathname } from "next/navigation";
import {
  Bell,
  CarFront,
  ChevronDown,
  CircleUserRound,
  LogOut,
  KeyRound,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import styles from "./AppPortalShell.module.css";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export interface AppPortalShellProps {
  portalLabel: string; // "Staff portal" | "Khu khách hàng" | "Driver portal"
  portalSubLabel?: string; // "Cổng quản trị / Nhân viên" | "Cổng khách hàng" | "Cổng tài xế"
  brandHref?: string; // "/admin" | "/" | "/staff"
  navItems: PortalNavItem[];
  user: {
    name: string;
    subtitle: string;
    avatarUrl?: string | null;
    initials: string;
    badge?: string | null;
  };
  profileHref: string;
  profileButtonText?: string;
  profileLoading?: boolean;
  profileError?: string;
  rightHeaderActions?: ReactNode;
  onLogout: () => Promise<void> | void;
  children: ReactNode;
}

export default function AppPortalShell({
  portalLabel,
  portalSubLabel = "Hệ thống Thong Dong",
  brandHref = "/",
  navItems,
  user,
  profileHref,
  profileButtonText = "Xem hồ sơ",
  profileLoading = false,
  profileError,
  rightHeaderActions,
  onLogout,
  children,
}: AppPortalShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(true);
  const [menuAnimated, setMenuAnimated] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [headerProfileOpen, setHeaderProfileOpen] = useState(false);
  const headerProfileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerProfileRef.current && !headerProfileRef.current.contains(event.target as Node)) {
        setHeaderProfileOpen(false);
      }
    }
    if (headerProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [headerProfileOpen]);

  // Các mục gốc của portal chỉ khớp chính xác, nếu không "/staff" sẽ sáng cùng mọi trang con.
  const isActiveHref = (href: string) =>
    href === "/" || href === "/admin" || href === "/staff"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const currentPage =
    navItems.find((item) => isActiveHref(item.href))?.label ?? portalLabel;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  };

  const sidebarContent = (
    <>
      {/* Brand Header: Exactly h-16 (64px) with border-b border-td-rule */}
      <div className={`${styles.brandHeader} flex h-16 shrink-0 items-center justify-between border-b border-td-rule px-6 bg-td-white`}>
        <Link
          href={brandHref}
          className={`${styles.brandLink} flex min-w-0 items-center justify-center py-1 group select-none`}
          aria-label={`ThongDong. ${portalLabel}`}
          title="ThongDong."
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Expanded: text only */}
          <div className={`${styles.brandExpanded} flex flex-col`}>
            <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-td-ink group-hover:text-sun-400 transition-colors">
              ThongDong.
            </span>
            <span className={`${styles.sidebarText} block text-[10px] font-bold text-sun-400 mt-0.5`}>
              {portalLabel}
            </span>
          </div>

          {/* Collapsed: small car logo */}
          <div className={`${styles.brandCollapsed} items-center justify-center`}>
            <span className="flex h-9 w-9 items-center justify-center rounded bg-primary text-white">
              <CarFront className="h-5 w-5" />
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Đóng menu"
          className="rounded p-2 text-td-muted hover:bg-td-chalk hover:text-td-ink lg:hidden cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Scroll Container */}
      <div className={`${styles.navigationScroll} min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-6`}>
        <nav aria-label={`Điều hướng ${portalLabel.toLowerCase()}`} className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActiveHref(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                title={label}
                className={`${styles.navLink} group flex items-center gap-3 rounded px-3.5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? "bg-primary font-bold text-white"
                    : "text-td-muted hover:bg-td-paper hover:text-td-ink"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-td-muted group-hover:text-primary"}`}
                />
                <span className={styles.navLabel}>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Footer Card */}
      <div className={`${styles.profileFooter} mt-auto shrink-0 p-4`}>
        <div className={`${styles.profileCard} rounded border border-td-rule bg-td-paper p-4`}>
          <Link
            href={profileHref}
            onClick={() => setMobileMenuOpen(false)}
            aria-label={`Hồ sơ ${user.name}`}
            title={`${user.name} · ${user.subtitle}`}
            className={`${styles.profileIdentity} flex items-center gap-3 rounded focus-visible:outline-2 focus-visible:outline-primary`}
          >
            <AccountAvatar
              src={user.avatarUrl}
              name={user.name}
              className="h-10 w-10 shrink-0 rounded-full bg-stage-ink text-sm font-bold text-white"
            />
            <span className={styles.sidebarText}>
              <span className="block truncate text-sm font-bold text-td-ink">
                {user.name}
              </span>
              <span className="block truncate text-xs text-td-muted">
                {profileLoading ? (
                  <span role="status" aria-label="Đang tải hồ sơ...">
                    <Skeleton className="h-3 w-24" />
                  </span>
                ) : (
                  user.subtitle
                )}
              </span>
            </span>
          </Link>
          {profileError && (
            <p role="status" className={`${styles.profileError} mt-2 text-xs text-danger`}>
              {profileError}
            </p>
          )}
          <Link
            href={profileHref}
            onClick={() => setMobileMenuOpen(false)}
            className={`${styles.profileLink} mt-3 block rounded border border-td-rule px-3 py-2 text-center text-xs font-semibold text-td-ink transition hover:bg-td-chalk hover:text-td-ink`}
          >
            {profileButtonText}
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
            className={`${styles.logoutButton} mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded px-3 py-2 text-xs font-semibold text-td-muted transition hover:bg-td-chalk hover:text-td-ink disabled:cursor-wait disabled:opacity-60 cursor-pointer`}
          >
            <LogOut aria-hidden="true" className="h-4 w-4 shrink-0 text-danger" />
            <span className={styles.sidebarText}>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={`${styles.shell} min-h-[100dvh] bg-td-paper text-td-ink`}
      data-menu-collapsed={!desktopMenuOpen}
      data-menu-animated={menuAnimated}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:shadow-e2 font-bold text-xs"
      >
        Bỏ qua điều hướng
      </a>
      {/* Desktop Sidebar: Fixed inset-y-0 left-0 */}
      <aside
        id="portal-desktop-navigation"
        className={`${styles.desktopSidebar} ${styles.sidebarSurface} fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-td-rule lg:flex bg-td-white`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-scrim"
            aria-label="Đóng menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            id="portal-mobile-navigation"
            className={`${styles.sidebarSurface} relative flex h-full w-[min(86vw,300px)] flex-col bg-td-white`}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Content Area */}
      <div className={`${styles.content} min-h-[100dvh]`}>
        {/* Top Header: Exactly h-16 (64px) with border-b border-td-rule - 100% aligned with sidebar brand header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-td-rule px-4 sm:px-7 lg:px-9 bg-td-white">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="portal-mobile-navigation"
              className="rounded border border-td-rule p-2 text-td-muted hover:bg-td-chalk lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setMenuAnimated(true);
                setDesktopMenuOpen((open) => !open);
              }}
              aria-label={desktopMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={desktopMenuOpen}
              aria-controls="portal-desktop-navigation"
              title={desktopMenuOpen ? "Đóng menu" : "Mở menu"}
              className="hidden rounded border border-td-rule p-2 text-td-muted transition hover:bg-td-chalk lg:inline-flex cursor-pointer"
            >
              {desktopMenuOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>

            {/* Page Title & Breadcrumb */}
            <div className="min-w-0">
              <p className="text-xs font-medium text-td-muted truncate">
                {portalSubLabel}
              </p>
              <p className="mt-0.5 truncate text-base font-bold text-td-ink">
                {currentPage}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {rightHeaderActions}

            <span
              aria-hidden="true"
              className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-td-rule text-td-muted transition hover:bg-td-chalk cursor-pointer"
              title="Thông báo"
            >
              <Bell className="h-4 w-4" />
            </span>

            {/* User Profile Header Popover */}
            <div ref={headerProfileRef} className="relative">
              <button
                type="button"
                onClick={() => setHeaderProfileOpen((open) => !open)}
                aria-label="Menu tài khoản"
                aria-expanded={headerProfileOpen}
                className="flex items-center gap-2 rounded border border-td-rule p-1 hover:bg-td-chalk transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
              >
                <AccountAvatar
                  src={user.avatarUrl}
                  name={user.name}
                  className="h-8 w-8 rounded-full bg-primary-tint text-xs font-bold text-primary"
                />
                <span className="hidden xl:block max-w-[120px] truncate text-xs font-bold text-td-ink text-left">
                  {user.name}
                </span>
                <ChevronDown
                  className={`hidden xl:block h-3.5 w-3.5 text-td-muted transition-transform duration-200 ${
                    headerProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {headerProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded border border-td-rule bg-td-white p-3 shadow-e2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                  aria-label="Tuỳ chọn tài khoản"
                >
                  <div className="flex items-center gap-3 border-b border-td-rule px-2 pb-3 mb-2">
                    <AccountAvatar
                      src={user.avatarUrl}
                      name={user.name}
                      className="h-10 w-10 shrink-0 rounded-full bg-stage-ink text-xs font-bold text-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-td-ink">{user.name}</p>
                      <p className="truncate text-[11px] text-td-muted">{user.subtitle}</p>
                      {user.badge && (
                        <p className="truncate text-[10px] text-primary font-medium mt-0.5">
                          {user.badge}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={profileHref}
                      onClick={() => setHeaderProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded px-2.5 py-2 text-xs font-semibold text-td-ink hover:bg-td-paper hover:text-td-ink transition-colors"
                    >
                      <CircleUserRound className="h-4 w-4 text-primary" />
                      <span>{profileButtonText}</span>
                    </Link>
                    <Link href={`${profileHref}#change-password`} onClick={() => setHeaderProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded px-2.5 py-2 text-xs font-semibold text-td-ink hover:bg-td-paper transition-colors">
                      <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>Đổi mật khẩu</span>
                    </Link>
                  </div>

                  <div className="border-t border-td-rule mt-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderProfileOpen(false);
                        void handleLogout();
                      }}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-xs font-semibold text-danger hover:bg-danger-bg transition-colors cursor-pointer text-left disabled:opacity-60"
                    >
                      <LogOut className="h-4 w-4 text-danger shrink-0" />
                      <span>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1500px] p-4 sm:p-7 lg:p-9 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
