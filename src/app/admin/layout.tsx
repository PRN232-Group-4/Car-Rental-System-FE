import type { ReactNode } from "react";
import type { Metadata } from "next";
import StaffShell from "@/features/admin/StaffShell";

export const metadata: Metadata = {
  title: "Cổng quản trị | Thong Dong",
  description: "Không gian làm việc dành cho nhân viên và quản trị viên Thong Dong.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <StaffShell>{children}</StaffShell>;
}
