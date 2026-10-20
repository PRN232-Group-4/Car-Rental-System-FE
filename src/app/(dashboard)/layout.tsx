"use client";

import React, { useEffect } from "react";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { useMounted } from "@/hooks/use-mounted";
import CustomerDeskShell from "@/components/layout/CustomerDeskShell";
import { getLoginPortalPath } from "@/features/auth/portal-routing";
import { useSession, AuthGate } from "@/features/auth";

/**
 * Cổng khách hàng dùng chung khung Transit Desk với admin (masthead + dải route ngang),
 * thay cho layout sidebar trước đây.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useSession();
  const router = useRouter();
  const mounted = useMounted();

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
      <CustomerDeskShell>{children}</CustomerDeskShell>
    </AuthGate>
  );
}
