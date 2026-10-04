import type { Metadata } from "next";
import VehicleManagement from "@/features/admin/VehicleManagement";

export const metadata: Metadata = {
  title: "Quản lý phương tiện | Cổng quản trị Thong Dong",
};

export default function VehiclesPage() {
  return <VehicleManagement />;
}
