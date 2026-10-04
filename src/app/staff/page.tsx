import type { Metadata } from "next";
import DriverPortalOverview from "@/features/driver-portal/DriverPortalOverview";

export const metadata: Metadata = {
  title: "Tổng quan tài xế | Cổng Thong Dong",
};

export default function DriverDashboardPage() {
  return <DriverPortalOverview />;
}
