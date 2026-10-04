import type { Metadata } from "next";
import type { ReactNode } from "react";
import DriverPortalShell from "@/features/driver-portal/DriverPortalShell";

export const metadata: Metadata = {
  title: "Cổng tài xế | Thong Dong",
  description: "Không gian làm việc dành cho nhân viên tài xế Thong Dong.",
};

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <DriverPortalShell>{children}</DriverPortalShell>;
}
