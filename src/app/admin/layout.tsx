import type { ReactNode } from "react";
import type { Metadata } from "next";
import TransitDeskShell from "@/features/admin/transit-desk/TransitDeskShell";
import { AuthGate } from "@/features/auth/AuthGate";
import { STAFF_PORTAL_ROLES } from "@/features/auth/roles";
import { AdminShellSkeleton } from "@/components/layout/PortalShellSkeleton";

export const metadata: Metadata = {
  title: "Transit Desk | Thong Dong Operations",
  description: "Không gian làm việc điều hành trạm và quản trị Thong Dong.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate allowedRoles={STAFF_PORTAL_ROLES} fallback={<AdminShellSkeleton />}>
      <TransitDeskShell>{children}</TransitDeskShell>
    </AuthGate>
  );
}
