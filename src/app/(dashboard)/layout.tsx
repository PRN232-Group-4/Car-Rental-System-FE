"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "@/components/navigation/NavigationLink";
import { usePathname } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { useMounted } from "@/hooks/use-mounted";
import { Car, Menu } from "lucide-react";
import AppSidebar, { type AppNavItem } from "@/components/layout/AppSidebar";
import { getLoginPortalPath } from "@/features/auth/portal-routing";
import { useSession, AuthGate } from "@/features/auth";
import { getNavigation } from "@/config/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useMounted();

  const navItems = useMemo<AppNavItem[]>(() => {
    return (getNavigation(user?.roles, "customer") as AppNavItem[]) || [];
  }, [user?.roles]);

  useEffect(() => {
    if (!mounted || isLoading || !isAuthenticated) return;

    // Chặn tài khoản nội bộ (Admin/Manager/Staff/Driver) vào nhầm khu vực khách hàng
    if (user?.roles && user.roles.length > 0) {
      const targetPortal = getLoginPortalPath(user.roles);
      if (targetPortal !== "/") {
        router.replace(targetPortal);
      }
    }
  }, [mounted, isLoading, isAuthenticated, user, router]);

  return (
    <AuthGate requireAuth={true}>
      <div className="min-h-dvh bg-canvas text-ink flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-[260px] shrink-0 flex-col bg-surface border-r border-line sticky top-0 h-dvh z-30">
          <AppSidebar
            portalLabel="Khu khách hàng"
            items={navItems}
            pathname={pathname}
            user={{
              name: user?.fullName || "Khách hàng",
              subtitle: user?.email || "Chưa có email",
              initials: (user?.fullName || user?.email || "U").charAt(0).toLocaleUpperCase(),
            }}
            profileHref="/profile"
            onLogout={() => void logout()}
          />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar for Mobile & Desktop Status */}
          <header className="sticky top-0 z-20 bg-surface border-b border-line px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-ink-3 hover:bg-sunken transition-colors"
                aria-label="Mở menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <span className="font-bold text-ink">Thong Dong</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/booking"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-e1 transition-all"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Đặt xe mới</span>
              </Link>

              <div className="h-6 w-px bg-line hidden sm:block" />

              <div className="flex items-center gap-2 text-xs text-ink-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="hidden md:inline">Hệ thống sẵn sàng</span>
              </div>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-scrim"
                aria-label="Đóng menu"
                onClick={() => setMobileMenuOpen(false)}
              />
              <aside className="relative flex h-full w-[min(86vw,300px)] flex-col bg-surface shadow-e2">
                <AppSidebar
                  portalLabel="Khu khách hàng"
                  items={navItems}
                  pathname={pathname}
                  onNavigate={() => setMobileMenuOpen(false)}
                  user={{
                    name: user?.fullName || "Khách hàng",
                    subtitle: user?.email || "Chưa có email",
                    initials: (user?.fullName || user?.email || "U").charAt(0).toLocaleUpperCase(),
                  }}
                  profileHref="/profile"
                  onLogout={() => void logout()}
                />
              </aside>
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </AuthGate>
  );
}
