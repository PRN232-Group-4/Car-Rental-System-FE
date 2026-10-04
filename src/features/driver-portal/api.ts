import { backendApiClient } from "@/api/backend-api-client";
import type { AccountProfile } from "@/features/profile/api";

export interface DriverScheduleEntry {
  assignmentId?: number;
  rentalId?: number;
  vehicleId?: number;
  driverStaffId?: number;
  startTime?: string;
  endTime?: string;
  rentalStatus?: string | null;
}

export interface DriverRentalDto {
  id: number;
  vehicleId: number;
  status: string | null;
  totalPrice: number;
  startTime: string | null;
  endTime: string | null;
}

export function getDriverSchedule(
  driverStaffId: number,
  from: string,
  to: string,
) {
  return backendApiClient.get<DriverScheduleEntry[]>("drivers/schedule", {
    driverStaffId,
    from,
    to,
  });
}

export function getDriverRental(rentalId: number) {
  return backendApiClient.get<DriverRentalDto>(`rentals/${rentalId}`);
}

export type DriverPortalAccount = Omit<AccountProfile, "staffId"> & {
  staffId: number;
};

export function isDriverStaffAccount(
  account: AccountProfile,
): account is DriverPortalAccount {
  const roles = account.roles ?? [];
  const isStaff = roles.some((role) =>
    ["staff", "driver"].includes(role.toLocaleLowerCase()),
  );
  const isDriverDepartment =
    account.departmentName?.trim().toLocaleLowerCase() === "driver";
  return isStaff && isDriverDepartment && account.staffId !== null;
}

export function initialsFor(name: string | null | undefined): string {
  return (name ?? "Driver")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase();
}
