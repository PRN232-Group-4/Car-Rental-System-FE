import type { Metadata } from "next";
import StaffProfileForm from "@/features/admin/StaffProfileForm";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi | Cổng tài xế Thong Dong",
};

export default function DriverProfilePage() {
  return <StaffProfileForm />;
}
