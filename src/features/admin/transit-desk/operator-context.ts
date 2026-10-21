import type { AccountProfile } from "@/features/profile/api";

export function operatorContext(account: AccountProfile | null) {
  const roles = (account?.roles ?? []).map((role) => role.toLowerCase());
  const title = roles.includes("admin") ? "Quản trị viên"
    : roles.includes("manager") ? "Quản lý"
    : roles.includes("maintenance") ? "Kỹ thuật viên"
    : roles.includes("customerservice") ? "Chăm sóc khách hàng"
    : roles.includes("driver") ? "Tài xế"
    : "Nhân sự vận hành";
  return {
    jobTitle: [title, account?.departmentName?.trim()].filter(Boolean).join(" · "),
    facility: account?.facilityId == null ? "Chưa phân công cơ sở"
      : account.facilityName?.trim() || "Chưa tải được tên cơ sở",
  };
}
