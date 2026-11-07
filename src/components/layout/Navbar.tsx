"use client";

import { useState, useRef } from "react";
import Link from "@/components/navigation/NavigationLink";
import Image from "next/image";
import { Menu, X, LogOut, ChevronDown, Car, FileCheck, KeyRound, Sun, Moon, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "@/lib/use-theme";
import { isHapticAudioEnabled, setHapticAudioEnabled, playTactileClick } from "@/lib/audio/haptic-audio";
import { useEffect } from "react";
import { useAuth, hasAnyRole, STAFF_PORTAL_ROLES } from "@/features/auth";
import { getNavigation } from "@/config/navigation";
import { useMounted } from "@/hooks/use-mounted";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, Flip } from "@/lib/motion/register";
import styles from "./Navbar.module.css";

// Marketing chrome follows the landing surface (DESIGN.md A14.7): ink bar, square corners, sun accent.
const DESKTOP_LINK = "px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-semibold text-bone-100/75 hover:text-sun-400 transition-colors";
const MOBILE_LINK = "block px-3 py-2 text-sm font-semibold text-bone-100 hover:text-sun-400 hover:bg-bone-100/5 transition-colors";
const ICON_BUTTON = "w-9 h-9 flex items-center justify-center rounded-full border border-bone-100/20 text-bone-100/75 hover:text-sun-400 hover:border-sun-400 transition-colors cursor-pointer";
const MENU_ITEM = "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-bone-100/75 hover:text-sun-400 hover:bg-bone-100/5 transition-colors";
const MENU_ITEM_ACCENT = "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-sun-400 hover:bg-bone-100/5 transition-colors";
const CTA = "inline-flex items-center justify-center font-bold bg-sun-600 text-white hover:bg-sun-400 transition-colors";

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

  const passwordProfile = hasRole("admin") || hasRole("manager")
    ? "/admin/profile"
    : hasRole("driver") ? "/staff/profile"
    : hasAnyRole(user?.roles, STAFF_PORTAL_ROLES) ? "/admin/profile" : "/profile";
  const passwordHref = `${passwordProfile}#change-password`;

  const navRef = useRef<HTMLElement>(null);

  // Giữ ngữ cảnh và thương hiệu mà không che khuất nội dung đọc khi người dùng cuộn xuống.
  useGSAP(
    () => {
      const navEl = navRef.current;
      if (!navEl || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(navEl, { yPercent: 0, scale: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const trigger = ScrollTrigger.create({
          start: "top -40",
          onUpdate: (self) => {
            const currentScrollY = self.scroll();
            const scrollingDown = self.direction === 1;
            // Ẩn thanh bar khi cuộn xuống quá 100px, hiện lại ngay khi cuộn ngược lên
            if (scrollingDown && currentScrollY > 100) {
              gsap.to(navEl, {
                yPercent: -120,
                duration: 0.32,
                ease: "power2.inOut",
                overwrite: "auto",
              });
            } else if (!scrollingDown) {
              gsap.to(navEl, {
                yPercent: 0,
                duration: 0.32,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
          },
        });

        return () => trigger.kill();
      });

      return () => mm.revert();
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
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-sun-600 focus:text-white font-bold text-xs pointer-events-auto"
      >
        Bỏ qua điều hướng
      </a>
      <nav
        ref={navRef}
        className={`${styles.navbar} w-full bg-ink-950 text-bone-100 border-b border-bone-100/15 px-6 sm:px-12 py-4 pointer-events-auto`}
      >
        <div className="relative max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center whitespace-nowrap py-0.5 select-none font-display text-xl sm:text-2xl font-black tracking-tight text-bone-100 hover:text-sun-400 transition-colors"
          >
            ThongDong<span className="text-sun-600">.</span>
          </Link>

          {/* Desktop Navigation Links — Căn giữa tuyệt đối & Xếp chuẩn theo thứ tự scroll landing page */}
          <div className="hidden lg:flex items-center justify-center gap-1 lg:gap-2 whitespace-nowrap absolute left-1/2 -translate-x-1/2">
            <Link id="nav-tim-xe" href="/find" className={DESKTOP_LINK}>
              Thuê xe
            </Link>
            <Link id="nav-chi-nhanh" href="/facilities" className={DESKTOP_LINK}>
              Chi nhánh
            </Link>
            <Link href="/inspection" className={DESKTOP_LINK}>
              Kiểm định
            </Link>
            <Link href="/#quy-trinh" className={DESKTOP_LINK}>
              Hướng dẫn
            </Link>
            <Link href="/subscriptions" className={DESKTOP_LINK}>
              Gói thuê bao
            </Link>
          </div>

          {/* Right Action buttons */}
          <div className="ml-auto hidden lg:flex items-center gap-2 whitespace-nowrap">
            <button
              type="button"
              id="theme-toggle"
              data-testid="global-theme-toggle"
              onClick={toggleTheme}
              className={ICON_BUTTON}
              aria-label={theme === "dark" ? "Chuyển giao diện sáng" : "Chuyển giao diện tối"}
              title={theme === "dark" ? "Giao diện: Tối" : "Giao diện: Sáng"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-sun-400" /> : <Moon className="w-4 h-4" />}
            </button>

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
              className={ICON_BUTTON}
              aria-label={isAudioEnabled ? "Tắt âm thanh haptic (Đang bật)" : "Bật âm thanh haptic (Đang tắt)"}
              title={isAudioEnabled ? "Âm thanh: Đang bật" : "Âm thanh: Đang tắt"}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4 text-sun-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {mounted && isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={userMenuOpen}
                  aria-controls="landing-account-menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-bone-100/20 hover:border-sun-400 text-sm font-medium text-bone-100 transition-colors cursor-pointer"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user?.fullName || "Tài khoản"}
                      width={24}
                      height={24}
                      unoptimized
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-sun-400/60"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-sun-600 text-white flex items-center justify-center text-xs font-bold">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate font-semibold text-xs sm:text-sm">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-bone-100/60" />
                </button>

                {userMenuOpen && (
                  <div id="landing-account-menu" className={styles.accountMenu}>
                    <div className="px-3 py-2 border-b border-bone-100/15 mb-1">
                      <p className="text-xs font-bold text-bone-100 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-bone-100/60 truncate mt-0.5">
                        {user.email}
                      </p>
                      <span className="block mt-1.5 text-[10px] tracking-[0.22em] uppercase font-bold text-sun-400">
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

                    <div className="py-1 border-b border-bone-100/15 mb-1 space-y-0.5">
                      {hasAnyRole(user?.roles, STAFF_PORTAL_ROLES) && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className={MENU_ITEM_ACCENT}>
                          <Car className="size-3.5" />
                          <span>Cổng quản trị</span>
                        </Link>
                      )}

                      {hasRole("driver") && (
                        <Link href="/staff" onClick={() => setUserMenuOpen(false)} className={MENU_ITEM_ACCENT}>
                          <Car className="size-3.5" />
                          <span>Cổng tài xế</span>
                        </Link>
                      )}

                      {/* Customer Hub Links */}
                      {(hasRole("customer") || !hasAnyRole(user?.roles, STAFF_PORTAL_ROLES)) &&
                        getNavigation(user?.roles, "customer").map(({ href, label, icon: Icon }) => (
                          <Link key={href} href={href} onClick={() => setUserMenuOpen(false)} className={MENU_ITEM}>
                            {Icon && <Icon className="size-3.5" />}
                            <span>{label}</span>
                          </Link>
                        ))}

                      <Link href="/profile" onClick={() => setUserMenuOpen(false)} className={MENU_ITEM}>
                        <FileCheck className="size-3.5 opacity-0" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                      <Link href={passwordHref} onClick={() => setUserMenuOpen(false)} className={MENU_ITEM}>
                        <KeyRound className="size-3.5" aria-hidden="true" />
                        <span>Đổi mật khẩu</span>
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className={`${MENU_ITEM} w-full py-2 cursor-pointer text-left`}
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
                  className="px-3.5 py-2 text-sm font-semibold text-bone-100/75 hover:text-bone-100 transition-colors cursor-pointer"
                >
                  Đăng nhập
                </Link>
                <Link href="/register" className={`${CTA} min-h-9 px-4 text-xs`}>
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile secondary controls & menu toggle */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              id="mobile-theme-toggle"
              data-testid="mobile-theme-toggle"
              onClick={toggleTheme}
              className={ICON_BUTTON}
              aria-label={theme === "dark" ? "Chuyển giao diện sáng" : "Chuyển giao diện tối"}
              title={theme === "dark" ? "Giao diện: Tối" : "Giao diện: Sáng"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-sun-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              id="mobile-audio-toggle"
              data-testid="mobile-audio-toggle"
              onClick={() => {
                const next = !isAudioEnabled;
                setHapticAudioEnabled(next);
                setIsAudioEnabled(next);
                if (next) playTactileClick();
              }}
              className={ICON_BUTTON}
              aria-label={isAudioEnabled ? "Tắt âm thanh haptic" : "Bật âm thanh haptic"}
              title={isAudioEnabled ? "Âm thanh: Đang bật" : "Âm thanh: Đang tắt"}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4 text-sun-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-bone-100 hover:text-sun-400 transition-colors cursor-pointer ml-0.5"
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
          <div id="mobile-nav-menu" className={`${styles.mobileMenu} lg:hidden max-w-7xl mx-auto pt-4 pb-2 border-t border-bone-100/15 mt-3 space-y-1`}>
            <Link href="/find" onClick={() => setMobileMenuOpen(false)} className={MOBILE_LINK}>
              Thuê xe
            </Link>
            <Link href="/facilities" onClick={() => setMobileMenuOpen(false)} className={MOBILE_LINK}>
              Chi nhánh
            </Link>
            <Link href="/inspection" onClick={() => setMobileMenuOpen(false)} className={MOBILE_LINK}>
              Kiểm định
            </Link>
            <Link href="/#quy-trinh" onClick={() => setMobileMenuOpen(false)} className={MOBILE_LINK}>
              Hướng dẫn
            </Link>
            <Link href="/subscriptions" onClick={() => setMobileMenuOpen(false)} className={MOBILE_LINK}>
              Gói thuê bao
            </Link>
            <div className="pt-3 border-t border-bone-100/15 flex flex-col gap-2">
              {mounted && isAuthenticated && user ? (
                <div className="p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user?.fullName || "Tài khoản"}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-sun-600 text-white flex items-center justify-center font-bold text-xs">
                        {user?.fullName?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-bone-100">{user.fullName}</div>
                      <div className="text-xs text-bone-100/60">{user.email}</div>
                    </div>
                  </div>

                  <div className="py-2 border-y border-bone-100/15 my-2 space-y-1">
                    {hasAnyRole(user?.roles, STAFF_PORTAL_ROLES) && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={MENU_ITEM_ACCENT}>
                        Cổng quản trị
                      </Link>
                    )}

                    {hasRole("driver") && (
                      <Link href="/staff" onClick={() => setMobileMenuOpen(false)} className={MENU_ITEM_ACCENT}>
                        Cổng tài xế
                      </Link>
                    )}

                    {(hasRole("customer") || !hasAnyRole(user?.roles, STAFF_PORTAL_ROLES)) &&
                      getNavigation(user?.roles, "customer").map(({ href, label }) => (
                        <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={MENU_ITEM}>
                          {label}
                        </Link>
                      ))}

                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className={MENU_ITEM}>
                      Hồ sơ cá nhân
                    </Link>
                    <Link href={passwordHref} onClick={() => setMobileMenuOpen(false)} className={MENU_ITEM}>
                      Đổi mật khẩu
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 text-xs font-semibold text-bone-100 border border-bone-100/20 hover:border-sun-400 hover:text-sun-400 transition-colors cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-sm font-semibold text-center text-bone-100 border border-bone-100/20 hover:border-sun-400 transition-colors block"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${CTA} w-full min-h-10 px-4 text-[13px]`}
                  >
                    Đăng ký tài khoản
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
