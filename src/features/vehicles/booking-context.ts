import type { Vehicle } from "./types";

export interface VehicleBookingContext {
  from?: string;
  to?: string;
  mode?: "self" | "driver" | "subscription";
  rentalType?: "hourly" | "longterm";
}

/** Transfer identity and booking choices; resolve prices and availability from the API. */
export function vehicleDetailHref(vehicle: Pick<Vehicle, "id" | "facilityId">, context: VehicleBookingContext = {}) {
  const query = new URLSearchParams({ id: String(vehicle.id), facilityId: String(vehicle.facilityId) });
  for (const key of ["from", "to", "mode", "rentalType"] as const) {
    if (context[key]) query.set(key, context[key]);
  }
  return `/vehicles/detail?${query}`;
}
