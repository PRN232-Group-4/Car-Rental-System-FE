"use client";

import React, { useEffect, useMemo } from "react";
import Link from "@/components/navigation/NavigationLink";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { useMounted } from "@/hooks/use-mounted";
import {
  Car,
  Package,
  FileText,
  CreditCard,
  FileCheck,
  Compass,
} from "lucide-react";
import AppPortalShell, { type PortalNavItem } from "@/components/layout/AppPortalShell";
import { getLoginPortalPath } from "@/features/auth/portal-routing";
import { useSession, AuthGate } from "@/features/auth";
import { getNavigation } from "@/config/navigation";

const FALLBACK_NAV_ITEMS: PortalNavItem[] = [
  { label: "Chuyến của tôi", href: "/account/trips", icon: Compass },
  { label: "Đặt xe", href: "/booking", icon: Car },
  { label: "Đơn thuê của tôi", href: "/my-rentals", icon: Car },
  { label: "Giấy phép lái xe (GPLX)", href: "/driver-license", icon: FileCheck },
  { label: "Hợp đồng dài hạn", href: "/rental-contract", icon: FileText },
  { label: "Gói của tôi", href: "/my-subscriptions", icon: Package },
  { label: "Hóa đơn", href: "/invoices", icon: FileText },
  { label: "Lịch sử thanh toán", href: "/payment-history", icon: CreditCard },
  { label: "Báo cáo sự cố", href: "/report-incident", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useSession();
  const router = useRouter();
  const mounted = useMounted();

  const navItems = useMemo<PortalNavItem[]>(() => {
    const configNav = getNavigation(user?.roles, "customer");
    if (configNav && configNav.length > 0) {
      return configNav.map((item) => ({
        href: item.href,
        label: item.label,
        icon: (item.icon as React.ElementType) || Compass,
      }));
    }
    return FALLBACK_NAV_ITEMS;
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

  const displayName = user?.fullName || (isAuthenticated ? "Khách hàng" : "Khách hàng");
  const email = user?.email || (isAuthenticated ? "customer@thongdong.vn" : "Khách hàng Thong Dong");

  return (
    <AuthGate requireAuth={true}>
      <AppPortalShell
        portalLabel="Khu khách hàng"
        portalSubLabel="Cổng khách hàng"
        brandHref="/"
        navItems={navItems}
        user={{
          name: displayName,
          subtitle: email,
          avatarUrl: user?.avatarUrl,
          initials: (displayName || "K").charAt(0).toUpperCase(),
        }}
        profileHref="/profile"
        profileButtonText="Hồ sơ cá nhân"
        rightHeaderActions={
          <Link
            href="/booking"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold bg-primary text-white hover:bg-primary-hover transition-all"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Đặt xe mới</span>
          </Link>
        }
        onLogout={() => void logout()}
      >
        {children}
      </AppPortalShell>
    </AuthGate>
  );
}
