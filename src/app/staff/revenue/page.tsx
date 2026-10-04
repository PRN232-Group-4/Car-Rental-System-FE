import type { Metadata } from "next";
import DriverRevenueDashboard from "@/features/driver-portal/DriverRevenueDashboard";

export const metadata: Metadata = {
  title: "Doanh thu tài xế | Cổng tài xế Thong Dong",
};

export default function DriverRevenuePage() {
  return <DriverRevenueDashboard />;
}
