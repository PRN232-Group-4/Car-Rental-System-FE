"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMounted } from "@/hooks/use-mounted";
import {
  Car,
  Package,
  FileText,
  CreditCard,
  FileCheck,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Home,
} from "lucide-react";
import { useAuth } from "@/features/auth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Đặt xe", href: "/booking", icon: Car },
  { name: "Gói của tôi", href: "/my-subscriptions", icon: Package },
  { name: "Hóa đơn", href: "/invoices", icon: FileText },
  { name: "Lịch sử thanh toán", href: "/payment-history", icon: CreditCard },
  { name: "Giấy phép lái xe (GPLX)", href: "/driver-license", icon: FileCheck },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      const next = encodeURIComponent(pathname || "/booking");
      router.replace(`/login?next=${next}`);
    }
  }, [mounted, isLoading, isAuthenticated, pathname, router]);

  // Loading skeleton while verifying session on SSR or initial mount
  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-dvh bg-canvas flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-spin">
            <Car className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-ink">Đang đồng bộ hồ sơ...</h3>
            <p className="text-xs text-ink-muted">Đang kết nối phiên bảo mật với hệ thống Thong Dong</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas text-ink flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col bg-surface border-r border-border sticky top-0 h-dvh z-30">
        {/* Brand Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-elevation-1">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-ink">Thong Dong</span>
              <span className="block text-xs font-semibold text-primary uppercase tracking-widest -mt-0.5">
                Member Hub
              </span>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-canvas border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-elevation-1">
            {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-ink truncate">
              {user?.fullName || "Khách hàng"}
            </div>
            <div className="text-xs text-ink-muted truncate">{user?.email}</div>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary">
            {user?.roles?.[0] || "Member"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20 font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-canvas"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-ink-muted"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-border mt-4 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Về trang chủ</span>
            </Link>
            <Link
              href="/subscriptions"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Gói cước ưu đãi</span>
            </Link>
          </div>
        </nav>

        {/* Logout Bottom */}
        <div className="p-4 border-t border-neutral-100">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar for Mobile & Desktop Status */}
        <header className="sticky top-0 z-20 bg-surface border-b border-border px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <span className="font-bold text-neutral-900">Thong Dong</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/booking"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-elevation-1 transition-all"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Đặt xe mới</span>
            </Link>

            <div className="h-6 w-px bg-border hidden sm:block" />

            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="hidden md:inline">Hệ thống sẵn sàng</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-[var(--scrim-modal)]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-surface p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    <span className="font-bold text-ink">Thong Dong Hub</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-ink-muted hover:text-ink"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="mt-6 space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                          isActive
                            ? "bg-primary text-white font-bold"
                            : "text-ink-muted hover:text-ink hover:bg-canvas"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-border">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
