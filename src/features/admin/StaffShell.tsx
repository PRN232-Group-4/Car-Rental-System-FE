"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "@/components/navigation/NavigationLink";
import AccountAvatar from "@/components/ui/AccountAvatar";
import { usePathname } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { getFacilities, getStaffById } from "./api";
import {
  Bell,
  Building2,
  CarFront,
  ChevronLeft,
  CircleUserRound,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Tags,
  WalletCards,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { usePortalAccess } from "@/features/auth/use-portal-access";
import { isAdminOrStaffAccount } from "@/features/profile/api";
import styles from "./StaffShell.module.css";

const allNavigation = [
  {
    href: "/admin",
    label: "Tổng quan",
    icon: LayoutDashboard,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
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
    label: "Gói Đăng Ký",
    icon: WalletCards,
    roles: ["Admin", "Manager", "Staff", "CustomerService", "Maintenance"],
  },
  {
    href: "/admin/departments",
    label: "Phòng Ban",
    icon: Building2,
    roles: ["Admin"],
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
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(true);
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
  const displayName = user?.fullName || account?.fullName || "Tài khoản quản trị";
  const avatarUrl = user ? user.avatarUrl : account?.avatarUrl;
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

  const sidebar = (
    <>
      <div className={`${styles.brandHeader} flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-6`}>
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
            <span className="block text-lg font-bold tracking-tight text-white">
              Thong Dong
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-ink-3">
              Staff portal
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

      <div className={`${styles.navigationScroll} admin-sidebar-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-7`}>
        <p className={`${styles.sectionLabel} whitespace-nowrap px-3 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-3`}>
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
                aria-label={label}
                title={label}
                className={`${styles.navLink} group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? "bg-primary font-semibold text-white shadow-e1"
                    : "text-ink-3 hover:bg-surface/[0.07] hover:text-white"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-ink-3 group-hover:text-primary"}`}
                />
                <span className={styles.navLabel}>{label}</span>
                {active && (
                  <ChevronLeft aria-hidden="true" className={`${styles.activeChevron} ml-auto h-4 w-4 shrink-0 rotate-180 text-white`} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={`${styles.profileFooter} mt-auto shrink-0 p-4`}>
        <div className={`${styles.profileCard} rounded-2xl border border-white/10 bg-surface/[0.04] p-4`}>
          <Link href="/admin/profile" onClick={() => setMobileMenuOpen(false)} aria-label={`Hồ sơ ${displayName}`} title={`${displayName} · ${jobTitle}`} className={`${styles.profileIdentity} flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-primary`}>
            <AccountAvatar src={avatarUrl} name={displayName} className="h-10 w-10 rounded-full bg-stage-ink text-sm font-bold text-white" />
            <span className={styles.sidebarText}>
              <span className="block truncate text-sm font-semibold text-white">
                {displayName}
              </span>
              <span className="block truncate text-xs text-ink-3">
                {profileLoading ? "Đang tải hồ sơ..." : jobTitle}
              </span>
            </span>
          </Link>
          {profileError && (
            <p role="status" className={`${styles.profileError} mt-2 text-xs text-primary-tint`}>
              {profileError}
            </p>
          )}
          <Link
            href="/admin/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`${styles.profileLink} mt-4 block rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-semibold text-ink-3 transition hover:border-primary/40 hover:text-primary`}
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
            className={`${styles.logoutButton} mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-ink-3 transition hover:border-primary/40 hover:text-primary disabled:cursor-wait disabled:opacity-60`}
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
    <div className={`${styles.shell} min-h-[100dvh] bg-canvas text-ink`} data-menu-collapsed={!desktopMenuOpen} data-menu-animated={menuAnimated}>
      <aside
        id="admin-desktop-navigation"
        className={`${styles.desktopSidebar} fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/10 bg-stage-ink lg:flex`}
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
            className="relative flex h-full w-[min(86vw,300px)] flex-col bg-stage-ink shadow-e2"
          >
            {sidebar}
          </aside>
        </div>
      )}

      <div className={`${styles.content} min-h-[100dvh]`}>
        <header className="glass-admin sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line px-4 sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
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
