import type { AccountProfile } from "@/features/profile/api";
import { isDriverStaffAccount } from "@/features/driver-portal/api";

export function getLoginPortalPath(
  roles: string[],
  staffAccount: AccountProfile | null = null,
): string {
  const normalizedRoles = roles.map((role) => role.toLocaleLowerCase());
  if (normalizedRoles.includes("admin") || normalizedRoles.includes("manager")) return "/admin";
  if (
    normalizedRoles.some((role) => role === "staff" || role === "driver") &&
    staffAccount &&
    isDriverStaffAccount(staffAccount)
  ) {
    return "/staff";
  }
  if (
    normalizedRoles.some((role) =>
      ["staff", "customerservice", "maintenance"].includes(role),
    )
  ) {
    return "/admin";
  }
  return "/";
}
