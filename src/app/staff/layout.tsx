import type { Metadata } from "next";
import type { ReactNode } from "react";
import DriverPortalShell from "@/features/driver-portal/DriverPortalShell";
import { AuthGate } from "@/features/auth/AuthGate";
import { DRIVER_PORTAL_ROLES } from "@/features/auth/roles";
import { DriverShellSkeleton } from "@/components/layout/PortalShellSkeleton";

export const metadata: Metadata = {
  title: "Cổng tài xế | Thong Dong",
  description: "Không gian làm việc dành cho nhân viên tài xế Thong Dong.",
};

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate allowedRoles={DRIVER_PORTAL_ROLES} fallback={<DriverShellSkeleton />}>
      <DriverPortalShell>{children}</DriverPortalShell>
    </AuthGate>
  );
}
