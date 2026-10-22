"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { useAuth } from "@/features/auth";
import { initialsFor } from "@/features/profile/api";
import { CarFront, LogOut, Moon, Sun, User, KeyRound } from "lucide-react";
import { useTheme } from "@/lib/use-theme";
import { CommandPalette, CommandTrigger, type CommandRoute } from "@/components/navigation/CommandPalette";
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
  const { theme, toggleTheme } = useTheme();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Đóng menu tài khoản khi bấm ra ngoài hoặc nhấn Escape
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserMenuOpen]);

  // Ctrl/⌘ + K mở bảng tìm kiếm, giống cổng quản trị
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commandRoutes = useMemo<CommandRoute[]>(
    () =>
      CUSTOMER_CHAPTERS.flatMap((entry) =>
        entry.routes.map((route) => ({
          chapter: entry.chapter,
          href: route.href,
          label: route.label,
        })),
      ),
    [],
  );

  const activeChapter = useMemo(() => {
    return (
      CUSTOMER_CHAPTERS.find((entry) => entry.routes.some((route) => isRouteActive(pathname, route.href))) ??
      CUSTOMER_CHAPTERS[0]
    );
  }, [pathname]);

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
            {/* Cùng vị trí với "Trạm / Nhân sự vận hành" của admin: nơi đang đứng + tư cách tài khoản */}
            <div className={styles.utilityMeta}>
              <div className="font-bold text-td-ink">Khu khách hàng</div>
              <div className="text-[10px] text-td-muted">Thành viên Thong Dong</div>
            </div>

            <CommandTrigger onClick={() => setIsCommandOpen(true)} />

            <button
              type="button"
              onClick={toggleTheme}
              className={styles.themeToggle}
              aria-label={theme === "dark" ? "Chuyển giao diện sáng" : "Chuyển giao diện tối"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            {/* Menu tài khoản: thông tin + hồ sơ + đăng xuất nằm trong avatar */}
            <div ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-label="Tài khoản cá nhân"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-td-rule bg-td-white text-xs font-bold text-td-ink hover:border-td-ink"
              >
                {initialsFor(user?.fullName ?? user?.email ?? "") || "K"}
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className={styles.accountMenu}
                >
                  <div className="mb-1 border-b border-td-rule px-3 py-2">
                    <div className="font-bold text-td-ink">{displayName}</div>
                    <div className="text-[11px] text-td-muted">{displayEmail}</div>
                  </div>
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded px-3 py-2 text-td-ink hover:bg-td-chalk"
                  >
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <Link href="/profile#change-password" role="menuitem" onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded px-3 py-2 text-td-ink hover:bg-td-chalk">
                    <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Đổi mật khẩu</span>
                  </Link>
                  <Link href="/my-rentals" role="menuitem" onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded px-3 py-2 text-td-ink hover:bg-td-chalk">
                    <CarFront className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Theo dõi tiến trình thuê xe</span>
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      void handleLogout();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left text-td-oxide hover:bg-td-chalk"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
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

      {isCommandOpen && (
        <CommandPalette
          isOpen
          onClose={() => setIsCommandOpen(false)}
          routes={commandRoutes}
          storageKey="thong_dong_customer_recent_routes"
          title="Tìm chức năng khách hàng"
          placeholder="Gõ tên trang hoặc đường dẫn (ví dụ: hoá đơn, gplx, /invoices)..."
          emptyHint="Không tìm thấy trang phù hợp trong cổng khách hàng."
        />
      )}
    </div>
  );
}

export default CustomerDeskShell;
