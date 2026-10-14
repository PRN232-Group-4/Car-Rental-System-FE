"use client";

import { useState, useRef } from "react";
import Link from "@/components/navigation/NavigationLink";
import Image from "next/image";
import { Menu, X, LogOut, ChevronDown, Car, Package, FileText, CreditCard, FileCheck } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/Button";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mounted = useMounted();
  const { user, isAuthenticated, logout, hasRole } = useAuth();

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
      <nav
        ref={navRef}
        className="glass-1 w-full max-w-6xl rounded-2xl px-5 py-3 pointer-events-auto transition-shadow"
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
              href="/#tim-xe"
              className="px-3 py-1.5 text-sm font-semibold text-ink-3 hover:text-primary rounded-lg hover:bg-canvas transition-colors"
            >
              Thuê xe
            </Link>
            <Link
              href="/#chi-nhanh"
              className="px-3 py-1.5 text-sm font-semibold text-ink-3 hover:text-primary rounded-lg hover:bg-canvas transition-colors"
            >
              Chi nhánh
            </Link>
            <Link
              href="/#goi-thue-bao"
              className="px-3 py-1.5 text-sm font-semibold text-ink-3 hover:text-primary rounded-lg hover:bg-canvas transition-colors"
            >
              Gói thuê bao
            </Link>
            <Link
              href="/#quy-trinh"
              className="px-3 py-1.5 text-sm font-semibold text-ink-3 hover:text-primary rounded-lg hover:bg-canvas transition-colors"
            >
              Hướng dẫn
            </Link>
            <Link
              href="/#kiem-dinh"
              className="px-3 py-1.5 text-sm font-semibold text-ink-3 hover:text-primary rounded-lg hover:bg-canvas transition-colors"
            >
              Kiểm định
            </Link>
          </div>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-2.5 whitespace-nowrap">
            {mounted && isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
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
                  <ChevronDown className="w-3.5 h-3.5 text-ink-subtle" />
                </button>

                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl p-2 bg-surface border border-line shadow-e2 z-50">
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
                      {(hasRole("admin") ||
                        hasRole("manager") ||
                        hasRole("staff") ||
                        hasRole("customerservice") ||
                        hasRole("maintenance")) && (
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
                      {(hasRole("customer") ||
                        (!hasRole("admin") &&
                          !hasRole("manager") &&
                          !hasRole("staff") &&
                          !hasRole("driver"))) && (
                        <>
                          <Link
                            href="/booking"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                          >
                            <Car className="size-3.5" />
                            <span>Đặt xe mới</span>
                          </Link>
                          <Link
                            href="/my-subscriptions"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                          >
                            <Package className="size-3.5" />
                            <span>Gói thuê của tôi</span>
                          </Link>
                          <Link
                            href="/invoices"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                          >
                            <FileText className="size-3.5" />
                            <span>Danh sách hoá đơn</span>
                          </Link>
                          <Link
                            href="/payment-history"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                          >
                            <CreditCard className="size-3.5" />
                            <span>Lịch sử thanh toán</span>
                          </Link>
                          <Link
                            href="/driver-license"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                          >
                            <FileCheck className="size-3.5" />
                            <span>Giấy phép lái xe (GPLX)</span>
                          </Link>
                        </>
                      )}

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
          <div id="mobile-nav-menu" className="lg:hidden pt-4 pb-2 border-t border-line mt-3 space-y-1">
            <Link
              href="/#tim-xe"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-ink rounded-lg hover:bg-canvas"
            >
              Thuê xe
            </Link>
            <Link
              href="/#chi-nhanh"
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
                <div className="p-3 bg-surface rounded-xl border border-line">
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
                    {(hasRole("admin") ||
                      hasRole("manager") ||
                      hasRole("staff") ||
                      hasRole("customerservice") ||
                      hasRole("maintenance")) && (
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

                    {(hasRole("customer") ||
                      (!hasRole("admin") &&
                        !hasRole("manager") &&
                        !hasRole("staff") &&
                        !hasRole("driver"))) && (
                      <>
                        <Link
                          href="/booking"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                        >
                          Đặt xe mới
                        </Link>
                        <Link
                          href="/my-subscriptions"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                        >
                          Gói thuê của tôi
                        </Link>
                        <Link
                          href="/invoices"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                        >
                          Danh sách hoá đơn
                        </Link>
                        <Link
                          href="/payment-history"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                        >
                          Lịch sử thanh toán
                        </Link>
                        <Link
                          href="/driver-license"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-1.5 text-xs font-semibold text-ink-3 hover:text-primary hover:bg-canvas rounded-lg transition-colors"
                        >
                          Giấy phép lái xe (GPLX)
                        </Link>
                      </>
                    )}

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
