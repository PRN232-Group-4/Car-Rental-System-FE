"use client";

import React from "react";
import Link from "@/components/navigation/NavigationLink";
import {
  Car,
  Package,
  FileText,
  CreditCard,
  FileCheck,
} from "lucide-react";
import AppPortalShell, { type PortalNavItem } from "@/components/layout/AppPortalShell";
import { useAuth } from "@/features/auth";

const NAV_ITEMS: PortalNavItem[] = [
  { label: "Đặt xe", href: "/booking", icon: Car },
  { label: "Giấy phép lái xe (GPLX)", href: "/driver-license", icon: FileCheck },
  { label: "Hợp đồng dài hạn", href: "/rental-contract", icon: FileText },
  { label: "Gói của tôi", href: "/my-subscriptions", icon: Package },
  { label: "Hóa đơn", href: "/invoices", icon: FileText },
  { label: "Lịch sử thanh toán", href: "/payment-history", icon: CreditCard },
  { label: "Báo cáo sự cố", href: "/report-incident", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();

  const displayName = user?.fullName || (isAuthenticated ? "Khách hàng" : "Khách hàng");
  const email = user?.email || (isAuthenticated ? "customer@thongdong.vn" : "Khách hàng Thong Dong");

  return (
    <AppPortalShell
      portalLabel="Khu khách hàng"
      portalSubLabel="Cổng khách hàng"
      brandHref="/"
      navItems={NAV_ITEMS}
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
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-e1 transition-all"
        >
          <Car className="w-3.5 h-3.5" />
          <span>Đặt xe mới</span>
        </Link>
      }
      onLogout={() => void logout()}
    >
      {children}
    </AppPortalShell>
  );
}
