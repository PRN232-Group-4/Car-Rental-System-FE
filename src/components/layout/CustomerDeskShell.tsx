"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { useAuth } from "@/features/auth";
import { initialsFor } from "@/features/profile/api";
import { LogOut, UserRound } from "lucide-react";
import styles from "@/features/admin/transit-desk/transit-desk.module.css";

interface CustomerRoute {
  href: string;
  label: string;
}

interface CustomerChapter {
  chapter: string;
  routes: CustomerRoute[];
}

/**
 * Các chương điều hướng của cổng khách hàng. Thứ tự này cũng là thứ tự trên masthead.
 * Thêm route mới thì thêm vào đúng chương để dải route ngữ cảnh hiển thị đúng.
 */
const CUSTOMER_CHAPTERS: CustomerChapter[] = [
  {
    chapter: "Chuyến đi",
    routes: [
      { href: "/account/trips", label: "Chuyến của tôi" },
      { href: "/booking", label: "Đặt xe" },
      { href: "/my-rentals", label: "Đơn thuê" },
      { href: "/rental-contract", label: "Hợp đồng dài hạn" },
    ],
  },
  {
    chapter: "Gói & GPLX",
    routes: [
      { href: "/my-subscriptions", label: "Gói của tôi" },
      { href: "/driver-license", label: "Giấy phép lái xe" },
    ],
  },
  {
    chapter: "Tài chính",
    routes: [
      { href: "/invoices", label: "Hoá đơn" },
      { href: "/payment-history", label: "Lịch sử thanh toán" },
    ],
  },
  {
    chapter: "Hỗ trợ",
    routes: [{ href: "/report-incident", label: "Báo cáo sự cố" }],
  },
  {
    chapter: "Cá nhân",
    routes: [{ href: "/profile", label: "Hồ sơ cá nhân" }],
  },
];

const isRouteActive = (pathname: string | null, href: string) =>
  pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

export interface CustomerDeskShellProps {
  children: ReactNode;
}

export function CustomerDeskShell({ children }: CustomerDeskShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const activeChapter = useMemo(() => {
    return (
      CUSTOMER_CHAPTERS.find((entry) => entry.routes.some((route) => isRouteActive(pathname, route.href))) ??
      CUSTOMER_CHAPTERS[0]
    );
  }, [pathname]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      delete document.documentElement.dataset.adminTheme;
      document.documentElement.removeAttribute("data-admin-theme");
    }
  }, []);

  const displayName = user?.fullName || "Khách hàng";
  const displayEmail = user?.email || "Chưa cập nhật email";
  const totalRoutes = CUSTOMER_CHAPTERS.reduce((total, entry) => total + entry.routes.length, 0);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className={styles.container} data-portal="customer">
      <div className={styles.topBar}>
        <header className={styles.masthead}>
          <Link href="/" className={styles.logoZone} aria-label="Thong Dong">
            <div className={styles.tdMark}>
              t<span className={styles.tdMarkSlash}>/</span>d
            </div>
            <div>
              <div className={styles.brandName}>Thong Dong</div>
              <div className={styles.brandKicker}>CUSTOMER DESK</div>
            </div>
          </Link>

          <nav className={styles.chapters} aria-label="Nhóm chức năng khách hàng">
            {CUSTOMER_CHAPTERS.map((entry) => {
              const isActive = entry.chapter === activeChapter.chapter;
              return (
                <Link
                  key={entry.chapter}
                  href={entry.routes[0].href}
                  className={styles.chapterBtn}
                  aria-current={isActive ? "true" : undefined}
                >
                  {entry.chapter}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-4 right-4 h-[3px] rounded-t bg-[var(--color-td-oxide)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className={styles.utilities}>
            <div className={styles.utilityMeta}>
              <div className="font-bold text-td-ink">{displayName}</div>
              <div className="text-[10px] text-td-muted">{displayEmail}</div>
            </div>

            <Link
              href="/profile"
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-td-rule text-td-ink transition-colors hover:bg-td-chalk"
              aria-label="Hồ sơ cá nhân"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className={styles.themeToggle}
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>

            <Link
              href="/profile"
              aria-label={`Tài khoản ${displayName}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-td-rule bg-td-chalk font-mono text-xs font-bold text-td-oxide"
            >
              {initialsFor(user?.fullName ?? user?.email ?? "") || "K"}
            </Link>
          </div>
        </header>

        <div className={styles.contextStrip}>
          <span className={styles.contextLabel}>{activeChapter.chapter.toUpperCase()}</span>
          <nav
            className={styles.contextLinks}
            aria-label={`Các trang thuộc nhóm ${activeChapter.chapter}`}
          >
            {activeChapter.routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={styles.contextLink}
                aria-current={isRouteActive(pathname, route.href) ? "page" : undefined}
              >
                {route.label}
              </Link>
            ))}
          </nav>
          <span className={styles.contextTotal}>{totalRoutes} CHỨC NĂNG KHẢ DỤNG</span>
        </div>
      </div>

      <main className={styles.mainContent}>
        <div key={activeChapter.chapter} className={styles.chapterPageTransition}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default CustomerDeskShell;
