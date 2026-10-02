import type { Metadata } from "next";
import { ProfileManager } from "@/features/profile";

export const metadata: Metadata = {
  title: "Quản lý hồ sơ | Thong Dong",
  description: "Cập nhật thông tin cá nhân và xác minh giấy phép lái xe.",
};

export default function ProfilePage() {
  return <ProfileManager />;
}
