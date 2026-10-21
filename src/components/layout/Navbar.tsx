"use client";

import { useState, useRef } from "react";
import Link from "@/components/navigation/NavigationLink";
import Image from "next/image";
import { Menu, X, LogOut, ChevronDown, Car, FileCheck, Sun, Moon, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "@/lib/use-theme";
import { isHapticAudioEnabled, setHapticAudioEnabled, playTactileClick } from "@/lib/audio/haptic-audio";
import { useEffect } from "react";
import { useAuth, hasAnyRole, STAFF_PORTAL_ROLES } from "@/features/auth";
import { getNavigation } from "@/config/navigation";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/Button";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mounted = useMounted();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  useEffect(() => {
    setIsAudioEnabled(isHapticAudioEnabled());
    const handleAudioChange = () => setIsAudioEnabled(isHapticAudioEnabled());
    window.addEventListener("thong_dong_haptic_audio_change", handleAudioChange);
    return () => window.removeEventListener("thong_dong_haptic_audio_change", handleAudioChange);
  }, []);

  const navRef = useRef<HTMLElement>(null);

  // GSAP scroll-driven subtle contraction
  useGSAP(
    () => {
      if (typeof window === "undefined" || !navRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const navEl = navRef.current;
      const scrollTrigger = {
        start: "top -30",
        end: "+=150",
        scrub: 0.4,
        onUpdate: (self: { progress: number }) => {
          const p = self.progress;
          gsap.to(navEl, {
            paddingTop: `${Math.max(8, 12 - p * 4)}px`,
            paddingBottom: `${Math.max(8, 12 - p * 4)}px`,
            duration: 0.1,
            overwrite: "auto",
          });
        },
      };

      const trigger = gsap.timeline({
        scrollTrigger,
      });

      return () => {
        trigger.scrollTrigger?.kill();
        trigger.kill();
      };
    },
    { scope: navRef }
  );

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
        if (window.location.hash) {
          window.history.pushState(null, "", "/");
        }
      }
    }
  };

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-e2 font-bold text-xs pointer-events-auto"
      >
        Bỏ qua điều hướng
      </a>
      <nav
        ref={navRef}
        className={`${styles.navbar} glass-1 w-full max-w-6xl rounded-2xl px-5 py-3 pointer-events-auto transition-shadow`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Brand Name & Logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 group whitespace-nowrap py-0.5 select-none"
          >
            <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-ink group-hover:text-primary transition-colors">
              ThongDong.
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 lg:gap-2 whitespace-nowrap">
            <Link
              id="nav-tim-xe"
              href="/find"
              className="px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-semibold text-ink-3 hover:text-primary rounded-lg hover:bg-canvas transition-colors"
            >
              Thuê xe
            </Link>
            <Link
              id="nav-chi-nhanh"
              href="/facilities"
              className="px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-semibold text-ink-3 hover:text-primary rounded-lg hover:bg-canvas transition-colors"
            >
              Chi nhánh
            </Link>
            <Link
              href="/#goi-thue-bao"
              className="px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-semibold text-ink-3 hover:text-primary rounded-lg hover:bg-canvas transition-colors"
            >
              Gói thuê bao
            </Link>
            <Link
              href="/#quy-trinh"
              className="px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-semibold text-ink-3 hover:text-primary rounded-lg hover:bg-canvas transition-colors"
            >
              Hướng dẫn
            </Link>
            <Link
              href="/#kiem-dinh"
              className="px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-semibold text-ink-3 hover:text-primary rounded-lg hover:bg-canvas transition-colors"
            >
              Kiểm định
            </Link>
          </div>

          {/* Right Action buttons */}
          <div className="ml-auto hidden sm:flex items-center gap-2 whitespace-nowrap">
            {/* Global Theme Toggle with Liquid Wave */}
            <button
              type="button"
              id="theme-toggle"
              data-testid="global-theme-toggle"
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-line bg-surface/80 hover:bg-surface text-ink hover:text-primary hover:border-primary/40 transition-colors cursor-pointer shadow-e1"
              aria-label={theme === "dark" ? "Chuyển giao diện sáng" : "Chuyển giao diện tối"}
              title={theme === "dark" ? "Giao diện: Tối" : "Giao diện: Sáng"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-ink-3" />}
            </button>

            {/* Global Web Audio Haptic Toggle */}
            <button
              type="button"
              id="global-audio-toggle"
              data-testid="global-audio-toggle"
              onClick={() => {
                const next = !isAudioEnabled;
                setHapticAudioEnabled(next);
                setIsAudioEnabled(next);
                if (next) playTactileClick();
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-line bg-surface/80 hover:bg-surface text-ink hover:text-primary hover:border-primary/40 transition-colors cursor-pointer shadow-e1"
              aria-label={isAudioEnabled ? "Tắt âm thanh haptic (Đang bật)" : "Bật âm thanh haptic (Đang tắt)"}
              title={isAudioEnabled ? "Âm thanh: Đang bật" : "Âm thanh: Đang tắt"}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-ink-3" />}
            </button>
            {mounted && isAuthenticated && user ? (
              <div>
                <button
                  type="button"
                  aria-expanded={userMenuOpen}
                  aria-controls="landing-account-menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-raised border border-line text-sm font-medium text-ink transition-all cursor-pointer shadow-e1"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName}
                      width={24}
                      height={24}
                      unoptimized
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-primary/40"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary-tint text-primary flex items-center justify-center text-xs font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate font-semibold text-xs sm:text-sm">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-3" />
                </button>

                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div id="landing-account-menu" className={`${styles.accountMenu} glass-1`}>
                    <div className="px-3 py-2 border-b border-line mb-1">
                      <p className="text-xs font-bold text-ink truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-ink-3 truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                          {hasRole("admin")
                            ? "Quản trị viên"
                            : hasRole("manager")
                              ? "Quản lý"
                              : hasRole("driver")
                                ? "Tài xế"
                                : hasRole("customerservice")
                                  ? "Chăm sóc khách hàng"
                                  : hasRole("maintenance")
                                    ? "Kỹ thuật viên"
                                    : hasRole("staff")
                                      ? "Nhân viên"
                                      : "Khách hàng"}
                        </span>
                      </div>
                    </div>

                    <div className="py-1 border-b border-line mb-1 space-y-0.5">
                      {hasAnyRole(user?.roles, STAFF_PORTAL_ROLES) && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Car className="size-3.5 text-primary" />
                          <span>Cổng quản trị</span>
                        </Link>
                      )}

                      {hasRole("driver") && (
                        <Link
                          href="/staff"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Car className="size-3.5 text-primary" />
                          <span>Cổng tài xế</span>
                        </Link>
                      )}

                      {/* Customer Hub Links */}
                      {(hasRole("customer") || !hasAnyRole(user?.roles, STAFF_PORTAL_ROLES)) &&
                        getNavigation(user?.roles, "customer").map(({ href, label, icon: Icon }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                          >
                            {Icon && <Icon className="size-3.5" />}
                            <span>{label}</span>
                          </Link>
                        ))}

                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                      >
                        <FileCheck className="size-3.5 opacity-0" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger-bg rounded-lg transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-ink-3 hover:text-ink transition-colors cursor-pointer"
                >
                  Đăng nhập
                </Link>
                <Button as={Link} href="/register" variant="sticky-morph" size="sm">
                  Đăng ký
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-line bg-surface/80 text-ink hover:text-primary transition-colors cursor-pointer"
              aria-label="Chuyển đổi giao diện"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-ink-3" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-ink hover:text-primary rounded-lg hover:bg-canvas transition-colors cursor-pointer"
              aria-label="Mở menu điều hướng"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div id="mobile-nav-menu" className={`${styles.mobileMenu} lg:hidden pt-4 pb-2 border-t border-line mt-3 space-y-1`}>
            <Link
              href="/find"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-ink rounded-lg hover:bg-canvas"
            >
              Thuê xe
            </Link>
            <Link
              href="/facilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-ink rounded-lg hover:bg-canvas"
            >
              Chi nhánh
            </Link>
            <Link
              href="/#goi-thue-bao"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-ink rounded-lg hover:bg-canvas"
            >
              Gói thuê bao
            </Link>
            <Link
              href="/#quy-trinh"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-ink rounded-lg hover:bg-canvas"
            >
              Hướng dẫn
            </Link>
            <Link
              href="/#kiem-dinh"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-ink rounded-lg hover:bg-canvas"
            >
              Phiếu kiểm định xe
            </Link>
            <div className="pt-3 border-t border-line flex flex-col gap-2">
              {mounted && isAuthenticated && user ? (
                <div className="p-3 border-t border-line">
                  <div className="flex items-center gap-2.5 mb-2">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.fullName}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {user.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-ink">{user.fullName}</div>
                      <div className="text-xs text-ink-3">{user.email}</div>
                    </div>
                  </div>

                  <div className="py-2 border-y border-line my-2 space-y-1">
                    {hasAnyRole(user?.roles, STAFF_PORTAL_ROLES) && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-1.5 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        Cổng quản trị
                      </Link>
                    )}

                    {hasRole("driver") && (
                      <Link
                        href="/staff"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-1.5 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        Cổng tài xế
                      </Link>
                    )}

                    {(hasRole("customer") || !hasAnyRole(user?.roles, STAFF_PORTAL_ROLES)) &&
                      getNavigation(user?.roles, "customer").map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                        >
                          {label}
                        </Link>
                      ))}

                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-1.5 text-xs font-semibold text-ink hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                    >
                      Hồ sơ cá nhân
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 text-xs font-semibold text-danger bg-danger-bg hover:bg-danger-bg rounded-lg transition-colors cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-sm font-semibold text-center text-ink bg-canvas rounded-lg block"
                  >
                    Đăng nhập
                  </Link>
                  <Button
                    as={Link}
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    Đăng ký tài khoản
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
