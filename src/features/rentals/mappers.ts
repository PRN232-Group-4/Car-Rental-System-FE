import { Rental } from "./types";
import { components } from "@/api/generated/schema";

type BERental = components["schemas"]["Rental"];

export function mapRentalFromBE(raw: BERental | Record<string, unknown>): Rental {
  const r = raw as Record<string, unknown>;
  const id = (r.id ?? r.Id) as number | string;
  const customerId = (r.customerId ?? r.CustomerId) as number | string | undefined;
  const vehicleId = (r.vehicleId ?? r.VehicleId) as number | string;
  const vehicleName = (r.vehicleName ?? r.VehicleName) as string | undefined;
  const rentalType = String(r.rentalType ?? r.RentalType ?? "hourly");
  const status = String(r.status ?? r.Status ?? "pending").toLowerCase();
  const isSubscription = Boolean(r.isSubscription ?? r.IsSubscription ?? false);
  const subscriptionId = (r.subscriptionId ?? r.SubscriptionId) as number | string | undefined;

  const vatPrice = Number(r.vatPrice ?? r.VatPrice ?? 0);
  const depositPrice = Number(r.depositPrice ?? r.DepositPrice ?? 0);
  const overtimePrice = Number(r.overtimePrice ?? r.OvertimePrice ?? 0);
  const totalPrice = Number(r.totalPrice ?? r.TotalPrice ?? 0);

  const startTime = (r.startTime ?? r.StartTime) as string | null | undefined;
  const endTime = (r.endTime ?? r.EndTime) as string | null | undefined;
  const hasDriver = Boolean(r.hasDriver ?? r.HasDriver ?? false);

  return {
    id,
    customerId,
    vehicleId,
    vehicleName,
    rentalType,
    status,
    isSubscription,
    subscriptionId,
    vatPrice,
    depositPrice,
    overtimePrice,
    totalPrice,
    startTime,
    endTime,
    hasDriver,
  };
}
