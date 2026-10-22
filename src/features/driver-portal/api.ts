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

export async function getDriverSchedule(
  driverStaffId: number,
  from: string,
  to: string,
) {
  const result = await backendApiClient.get<
    DriverScheduleEntry[] | { items?: DriverScheduleEntry[] }
  >("drivers/schedule", {
    driverStaffId,
    from,
    to,
  });
  return Array.isArray(result) ? result : (result.items ?? []);
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
  const roles = (account.roles ?? []).map((role) => role.toLocaleLowerCase());
  const hasDriverRole = roles.includes("driver");
  const isStaff = roles.some((role) =>
    ["staff", "driver"].includes(role),
  );
  const isDriverDepartment =
    account.departmentName?.trim().toLocaleLowerCase() === "driver";
  return (hasDriverRole || (isStaff && isDriverDepartment)) && account.staffId !== null;
}
