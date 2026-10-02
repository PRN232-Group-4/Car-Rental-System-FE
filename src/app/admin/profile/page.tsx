import type { Metadata } from "next";
import StaffProfileForm from "@/features/admin/StaffProfileForm";

export const metadata: Metadata = {
  title: "Hồ sơ nhân viên | Cổng quản trị Thong Dong",
};

export default function StaffProfilePage() {
  return <StaffProfileForm />;
}
