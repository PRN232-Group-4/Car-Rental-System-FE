import { defaultApiClient } from "@/api/default-api-client";
import { mapVehicleFromBE } from "@/features/vehicles/mappers";
import { mapRentalFromBE } from "./mappers";
import type { RentalBookingRequest, RentalBookingResponse, RentalContract, RentalPolicy } from "./types";

/** Only send the fields supported by the deployed RentalRequest. */
export function toRentalRequest(input: RentalBookingRequest) {
  return {
    vehicleId: Number(input.vehicleId),
    policyId: input.policyId ?? null,
    startTime: input.startTime,
    endTime: input.endTime,
    subscriptionId: input.subscriptionId ? Number(input.subscriptionId) : null,
    hasDriver: input.hasDriver !== false,
    paymentMethod: input.paymentMethod ?? "payos",
  };
}

export function mapBookingResponse(raw: unknown): RentalBookingResponse {
  const record = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const nested = record.rental ?? record.Rental;
  const rental = nested && typeof nested === "object" ? nested as Record<string, unknown> : record;
  const id = record.bookingId ?? record.rentalId ?? record.RentalId ?? rental.id ?? rental.Id ??
    (typeof raw === "number" ? raw : undefined);
  return {
    success: true,
    bookingId: typeof id === "number" || typeof id === "string" ? id : undefined,
    message: "Đã tạo đơn thuê xe thành công.",
    rental: rental.id || rental.Id ? mapRentalFromBE(rental) : undefined,
    invoiceId: typeof record.invoiceId === "number" ? record.invoiceId : undefined,
  };
}

export async function createRentalBooking(input: RentalBookingRequest): Promise<RentalBookingResponse> {
  const path = input.rentalType === "longterm" ? "rentals/longterm" : "rentals/hourly";
  return mapBookingResponse(await defaultApiClient.post<unknown>(path, toRentalRequest(input)));
}

export function createHourlyRental(input: RentalBookingRequest) {
  return createRentalBooking({ ...input, rentalType: "hourly" });
}

export function createLongTermRental(input: RentalBookingRequest) {
  return createRentalBooking({ ...input, rentalType: "longterm" });
}

export async function getActivePolicyForVehicleType(vehicleTypeId: number): Promise<RentalPolicy | null> {
  try {
    return await defaultApiClient.get<RentalPolicy>(`vehicle-type/${vehicleTypeId}/active-policy`);
  } catch {
    return null;
  }
}

export async function getBookingPolicies() {
  const policies: RentalPolicy[] = [];
  let page = 1;
  while (true) {
    const result = await defaultApiClient.get<RentalPolicy[] | { items: RentalPolicy[] | null; totalCount: number }>("rental-policies", { page, pageSize: 100 });
    if (Array.isArray(result)) return result;
    const items = result.items ?? [];
    policies.push(...items);
    if (!items.length || policies.length >= result.totalCount) return policies;
    page++;
  }
}

export async function getBookingVehicles(from?: string, to?: string, facilityId?: string, hasDriver = true, rentalType = "hourly", signal?: AbortSignal) {
  const items: import("@/features/vehicles").Vehicle[] = [];
  let page = 1;
  while (true) {
    const raw = await defaultApiClient.get<Record<string, unknown> | unknown[]>("vehicles/search", {
      from, to, facilityId, hasDriver, rentalType, page, pageSize: 100,
    }, { signal });
    const batch = Array.isArray(raw) ? raw : Array.isArray(raw.items) ? raw.items : [];
    items.push(...batch.map((vehicle) => {
      const row = vehicle as Record<string, unknown>;
      const type = (row.vehicleType ?? {}) as Record<string, unknown>;
      const facility = (row.facility ?? {}) as Record<string, unknown>;
      return mapVehicleFromBE({
        ...row, vehicleTypeId: type.id, vehicleType: `${type.name ?? ""} ${type.fuelType ?? ""}`,
        facilityId: facility.id, facility: facility.name, detail: row.summary,
        hourlyPrice: row.priceHourly, longtermPrice: row.priceLongterm,
        // Search has already checked availability for the requested window.
        status: "available",
      });
    }));
    if (Array.isArray(raw) || !batch.length || items.length >= Number(raw.totalCount ?? items.length)) break;
    page += 1;
  }
  return items.filter((vehicle) => vehicle.isAvailable);
}

export async function getRentalById(id: number | string): Promise<RentalContract> {
  return mapContract(await defaultApiClient.get<Record<string, unknown>>(`rental/${encodeURIComponent(id)}`));
}

function mapContract(raw: Record<string, unknown>): RentalContract {
  return {
    ...mapRentalFromBE(raw),
    contractLink: (raw.contractLink ?? raw.ContractLink ?? null) as string | null,
    signedAt: (raw.signedAt ?? raw.SignedAt ?? null) as string | null,
    hasUploadedContract: (raw.hasUploadedContract ?? raw.HasUploadedContract) === true,
    hourlyPriceSnapshot: (raw.hourlyPriceSnapshot ?? null) as number | null,
    monthlyPriceSnapshot: (raw.monthlyPriceSnapshot ?? null) as number | null,
  };
}

export async function updateRentalContract(id: number | string, contractLink: string | null, signedAt: string) {
  return mapContract(await defaultApiClient.put<Record<string, unknown>>(`rental/${encodeURIComponent(id)}/contract`, {
    contractLink, signedAt,
  }));
}

export async function uploadRentalContract(id: number | string, file: File, signedAt: string) {
  const body = new FormData();
  body.append("file", file);
  body.append("signedAt", signedAt);
  return mapContract(await defaultApiClient.post<Record<string, unknown>>(`rental/${encodeURIComponent(id)}/contract/upload`, body));
}
