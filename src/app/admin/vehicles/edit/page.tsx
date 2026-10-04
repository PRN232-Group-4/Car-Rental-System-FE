import type { Metadata } from "next";
import VehicleForm from "@/features/admin/VehicleForm";

export const metadata: Metadata = {
  title: "Chỉnh sửa phương tiện | Cổng quản trị Thong Dong",
};

export default function EditVehiclePage() {
  return <VehicleForm />;
}
