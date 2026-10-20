"use client";

import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { useAuth } from "@/features/auth";
import { usePortalAccess } from "@/features/auth/use-portal-access";
import { isAdminOrStaffAccount } from "@/features/profile/api";
import { useAdminTheme } from "@/features/admin/use-admin-theme";
import { getFacilities, getStaffById } from "@/features/admin/api";
import { ADMIN_NAV_ITEMS, ROUTE_CHAPTER_MAP, type NavItem } from "@/config/navigation";
import { hasAnyRole } from "@/features/auth/access";
import type { Role } from "@/features/auth/roles";
import { CommandPalette, CommandTrigger, type CommandRoute } from "@/components/navigation/CommandPalette";
import styles from "./transit-desk.module.css";
import RentalLiquidTransition from "./RentalLiquidTransition";
import { FormSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { gsap } from "@/lib/motion/register";

export interface TransitDeskShellProps {
  children: ReactNode;
}

export function TransitDeskShell({ children }: TransitDeskShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useAdminTheme();
  const { account, checkingAccess, accessError } = usePortalAccess(
    isAdminOrStaffAccount,
  );

  const [staffRole, setStaffRole] = useState<string | null>(null);
  const [facilityName, setFacilityName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isRouteIndexOpen, setIsRouteIndexOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userRoles = useMemo<Role[]>(() => {
    return (account?.roles ?? user?.roles ?? []) as Role[];
  }, [account?.roles, user?.roles]);

  // Clean up data-admin-theme when navigating away from Admin portal
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        delete document.documentElement.dataset.adminTheme;
        document.documentElement.removeAttribute("data-admin-theme");
      }
    };
  }, []);

  // Load operator assignment details safely
  useEffect(() => {
    if (!account) return;
    let active = true;

    const loadAssignment = async () => {
      try {
        let nextStaffRole: string | null = null;
        let nextFacilityName: string | null = null;
        const isAdmin = userRoles.some((r) => r.toLowerCase() === "admin");

        if (account.staffId) {
          try {
            const staff = await getStaffById(account.staffId);
            if (active && staff) {
              nextStaffRole = staff.isDriver ? "Tài xế trạm" : "Điều phối viên";
              if (staff.departmentName) {
                nextStaffRole = `${nextStaffRole} · ${staff.departmentName}`;
              }
              if (staff.facilityName) {
                nextFacilityName = staff.facilityName;
              }
            }
          } catch {
            // Staff details may not exist for pure admins
          }
        }

        if (!nextFacilityName && account.facilityId && isAdmin) {
          try {
            const facilities = await getFacilities();
            const facility = facilities.find(
              (f) => f.id === account.facilityId,
            );
            if (active && facility) {
              nextFacilityName = facility.name;
            }
          } catch {
            // Ignore if forbidden
          }
        }

        if (active) {
          setStaffRole(nextStaffRole);
          setFacilityName(nextFacilityName);
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

  // Global hotkey for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsRouteIndexOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter allowed navigation items by user roles
  const permittedItems = useMemo(() => {
    return ADMIN_NAV_ITEMS.filter((item: NavItem) => {
      if (!item.roles || item.roles.length === 0) return true;
      return hasAnyRole(userRoles, item.roles);
    });
  }, [userRoles]);

  // Group permitted items into chapters
  const chaptersWithRoutes = useMemo(() => {
    const map = new Map<string, NavItem[]>();
    for (const item of permittedItems) {
      const chapter = ROUTE_CHAPTER_MAP[item.href] || "Khác";
      if (!map.has(chapter)) {
        map.set(chapter, []);
      }
      map.get(chapter)!.push(item);
    }
    return map;
  }, [permittedItems]);

  // Route cho bảng tìm kiếm (Ctrl+K) — đã lọc theo quyền như masthead
  const commandRoutes = useMemo<CommandRoute[]>(
    () =>
      permittedItems.map((item) => ({
        chapter: ROUTE_CHAPTER_MAP[item.href] || "Hệ thống",
        href: item.href,
        label: item.label,
        description: item.description,
      })),
    [permittedItems],
  );

  // Determine active chapter
  const activeChapter = useMemo(() => {
    for (const [chapter, routes] of chaptersWithRoutes.entries()) {
      const matched = routes.some((r) =>
        r.href === "/admin"
          ? pathname === "/admin"
          : pathname === r.href || pathname.startsWith(`${r.href}/`),
      );
      if (matched) return chapter;
    }
    return chaptersWithRoutes.keys().next().value || "Ca trực";
  }, [chaptersWithRoutes, pathname]);

  // Sub-routes for current active chapter
  const currentChapterRoutes = useMemo(() => {
    return chaptersWithRoutes.get(activeChapter) || [];
  }, [chaptersWithRoutes, activeChapter]);

  const chaptersNavRef = useRef<HTMLElement>(null);
  const gliderRef = useRef<HTMLDivElement>(null);

  // Smooth floating glider physics for active chapter wayfinding
  useEffect(() => {
    const updateGlider = (immediate = false) => {
      if (!chaptersNavRef.current || !gliderRef.current) return;
      const activeBtn = chaptersNavRef.current.querySelector<HTMLElement>('[aria-current="true"]');
      if (activeBtn) {
        const navRect = chaptersNavRef.current.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        const targetX = btnRect.left - navRect.left + chaptersNavRef.current.scrollLeft + 16;
        const targetWidth = Math.max(0, btnRect.width - 32);

        if (immediate) {
          gsap.set(gliderRef.current, { x: targetX, width: targetWidth, opacity: 1 });
        } else {
          gsap.to(gliderRef.current, {
            x: targetX,
            width: targetWidth,
            opacity: 1,
            duration: 0.32,
            ease: "expo.out",
            overwrite: "auto",
          });
        }
      } else {
        gsap.to(gliderRef.current, { opacity: 0, duration: 0.2 });
      }
    };

    // Defer one frame to ensure DOM layout has settled
    const raf = requestAnimationFrame(() => updateGlider());
    const handleResize = () => updateGlider(true);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeChapter]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (checkingAccess) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-td-paper p-6">
        <div className="w-full max-w-md rounded border border-td-rule bg-td-white p-8 shadow-md">
          <FormSkeleton
            label="Đang kiểm tra quyền truy cập hệ thống..."
            fields={3}
          />
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-td-paper p-6">
        <div className="w-full max-w-md rounded border border-td-rule bg-td-white p-8 shadow-md text-center space-y-4">
          <p className="text-sm font-semibold text-td-oxide">{accessError}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded bg-td-ink px-4 py-2 text-xs font-bold text-td-white hover:bg-td-teal cursor-pointer"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  const displayName = account?.fullName || user?.fullName || "Quản trị viên";
  const jobTitle = staffRole || "Nhân sự vận hành";

  return (
    <div
      data-portal="admin"
      data-admin-theme={theme}
      data-subportal={
        pathname?.startsWith("/admin/rentals") ? "rental-v4" : undefined
      }
      className={styles.container}
    >
      {/* Masthead + Context Strip: dính đỉnh cùng nhau khi cuộn */}
      <div className={styles.topBar}>
      <header className={styles.masthead}>
        {/* Monogram / Brand Block */}
        <Link
          href="/admin"
          className={styles.logoZone}
          aria-label="Thong Dong Transit Desk"
        >
          <div className={styles.tdMark}>
            t<span className={styles.tdMarkSlash}>/</span>d
          </div>
          <div>
            <div className={styles.brandName}>Thong Dong</div>
            <div className={styles.brandKicker}>TRANSIT DESK · OPERATIONS</div>
          </div>
        </Link>

        {/* Chapter Index (Wayfinding Segments) */}
        <nav ref={chaptersNavRef} className={styles.chapters} aria-label="Nhóm chức năng">
          <div ref={gliderRef} className={styles.chapterGlider} aria-hidden="true" />
          {Array.from(chaptersWithRoutes.entries()).map(([chapter, routes]) => {
            const isActive = chapter === activeChapter;
            const primaryHref = routes[0]?.href || "/admin";
            return (
              <Link
                key={chapter}
                href={primaryHref}
                className={styles.chapterBtn}
                aria-current={isActive ? "true" : undefined}
              >
                {chapter}
              </Link>
            );
          })}
        </nav>

        {/* Utilities */}
        <div className={styles.utilities}>
          <div className={styles.utilityMeta}>
            <div className="font-bold text-td-ink">
              {profileLoading ? (
                <Skeleton className="h-3 w-20" />
              ) : (
                facilityName || "Trạm Trung Tâm"
              )}
            </div>
            <div className="text-[10px] text-td-muted">{jobTitle}</div>
          </div>

          <CommandTrigger onClick={() => setIsRouteIndexOpen(true)} />

          <button
            type="button"
            id="admin-theme-toggle"
            data-testid="admin-theme-toggle"
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={
              theme === "dark"
                ? "Chuyển giao diện sáng"
                : "Chuyển giao diện tối"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* User Account Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              aria-label="Tài khoản cá nhân"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-td-rule bg-td-white text-xs font-bold text-td-ink hover:border-td-ink cursor-pointer"
            >
              {displayName.charAt(0).toUpperCase()}
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-md border border-td-rule bg-td-white p-2 shadow-xl z-40 text-xs"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-td-rule mb-1">
                  <div className="font-bold text-td-ink">{displayName}</div>
                  <div className="text-[11px] text-td-muted">
                    {account?.email || user?.email}
                  </div>
                </div>
                <Link
                  href="/admin/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 rounded px-3 py-2 text-td-ink hover:bg-td-chalk cursor-pointer"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    void handleLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-td-oxide hover:bg-td-chalk cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contextual Route Strip */}
      <div className={styles.contextStrip}>
        <span className={styles.contextLabel}>
          {activeChapter.toUpperCase()}
        </span>
        <nav
          className={styles.contextLinks}
          aria-label={`Các route thuộc nhóm ${activeChapter}`}
        >
          {currentChapterRoutes.map((route) => {
            const isCurrent =
              route.href === "/admin"
                ? pathname === "/admin"
                : pathname === route.href ||
                  pathname.startsWith(`${route.href}/`);
            return (
              <Link
                key={route.href}
                href={route.href}
                className={styles.contextLink}
                aria-current={isCurrent ? "page" : undefined}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>
        <span className={styles.contextTotal}>
          {permittedItems.length} CHỨC NĂNG KHẢ DỤNG
        </span>
      </div>
      </div>

      {/* Main Work Area */}
      <main className={styles.mainContent}>
        <div key={activeChapter} className={styles.chapterPageTransition}>
          {children}
        </div>
      </main>

      {/* Route Index Command Dialog — mount lại mỗi lần mở để state (query, chọn) tự reset */}
      {isRouteIndexOpen && (
        <CommandPalette
          isOpen
          onClose={() => setIsRouteIndexOpen(false)}
          routes={commandRoutes}
          storageKey="thong_dong_admin_recent_routes"
          title="Tìm chức năng vận hành"
          placeholder="Gõ tên nghiệp vụ, nhóm hoặc đường dẫn (ví dụ: xe, sự cố, /admin/rentals)..."
        />
      )}

      {/* Global A1.1 Organic Liquid Flood Transition */}
      <RentalLiquidTransition />
    </div>
  );
}

export default TransitDeskShell;
