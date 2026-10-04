import type { Metadata } from "next";
import DriverVehicles from "@/features/driver-portal/DriverVehicles";

export const metadata: Metadata = {
  title: "Phương tiện của tôi | Cổng tài xế Thong Dong",
};

export default function DriverVehiclesPage() {
  return <DriverVehicles />;
}
