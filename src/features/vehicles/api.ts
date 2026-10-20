import { defaultApiClient } from "@/api/default-api-client";
import { Vehicle, VehicleFilterParams, VehiclePage, BusySlot, AvailabilityResult, RentalPolicy } from "./types";
import { mapVehicleFromBE } from "./mappers";

export async function getVehicles(params?: VehicleFilterParams): Promise<Vehicle[]> {
  const queryParams: Record<string, string | number> = {};
  if (params?.category && params.category !== "all") queryParams.category = params.category;
  if (params?.facilityId && params.facilityId !== "all") queryParams.facilityId = params.facilityId;
  if (params?.search && params.search.trim()) queryParams.search = params.search.trim();

  const res = await defaultApiClient.get<unknown>("vehicles", queryParams);
  if (Array.isArray(res)) {
    return res.map((v) => mapVehicleFromBE(v as Record<string, unknown>));
  }
  if (typeof res === "object" && res !== null && "items" in res && Array.isArray((res as { items: unknown[] }).items)) {
    return (res as { items: unknown[] }).items.map((v) => mapVehicleFromBE(v as Record<string, unknown>));
  }
  return [];
}

export async function getVehiclesPaginated(params?: VehicleFilterParams): Promise<VehiclePage> {
  const page = Math.max(1, Number(params?.page) || 1);
  const pageSize = Math.max(1, Number(params?.pageSize) || 9);

  const queryParams: Record<string, string | number> = { page, pageSize };
  if (params?.category && params.category !== "all") queryParams.category = params.category;
  if (params?.facilityId && params.facilityId !== "all") queryParams.facilityId = params.facilityId;
  if (params?.brand && params.brand !== "all") queryParams.brand = params.brand;
  if (params?.seats && Number(params.seats) > 0) queryParams.seats = params.seats;
  if (params?.transmission && params.transmission !== "all") queryParams.transmission = params.transmission;
  if (params?.fuelType && params.fuelType !== "all") queryParams.fuelType = params.fuelType;
  if (params?.priceMin && Number(params.priceMin) > 0) queryParams.priceMin = params.priceMin;
  if (params?.priceMax && Number(params.priceMax) > 0) queryParams.priceMax = params.priceMax;
  if (params?.search && params.search.trim()) queryParams.search = params.search.trim();
  if (params?.sort) queryParams.sort = params.sort;

  const res = await defaultApiClient.get<unknown>("vehicles", queryParams);
  if (typeof res === "object" && res !== null && "items" in res && Array.isArray((res as { items: unknown[] }).items)) {
    const paged = res as { items: Record<string, unknown>[]; totalCount?: number; page?: number; pageSize?: number };
    return {
      items: paged.items.map((v) => mapVehicleFromBE(v)),
      totalCount: Number(paged.totalCount ?? paged.items.length),
      page: Number(paged.page ?? page),
      pageSize: Number(paged.pageSize ?? pageSize),
    };
  }

  return { items: [], totalCount: 0, page, pageSize };
}

export async function getVehicleById(id: number | string): Promise<Vehicle | undefined> {
  const raw = await defaultApiClient.get<unknown>(`vehicles/${id}`);
  return raw ? mapVehicleFromBE(raw as Record<string, unknown>) : undefined;
}

export async function getVehicleBusySlots(
  vehicleId: number | string,
  from?: string,
  to?: string
): Promise<BusySlot[]> {
  const query: Record<string, string> = {};
  if (from) query.from = from;
  if (to) query.to = to;
  const res = await defaultApiClient.get<BusySlot[]>(`vehicles/${vehicleId}/busy-slots`, query);
  return Array.isArray(res) ? res : [];
}

export async function checkVehicleAvailability(
  vehicleId: number | string,
  from: string,
  to: string
): Promise<AvailabilityResult> {
  const res = await defaultApiClient.get<AvailabilityResult>(`vehicles/${vehicleId}/availability`, {
    from,
    to,
  });
  if (res && typeof res.available === "boolean") return res;

  // Không có kết luận từ API: tự đối chiếu với khung giờ bận thật của xe.
  const busySlots = await getVehicleBusySlots(vehicleId, from, to);
  const reqStart = new Date(from).getTime();
  const reqEnd = new Date(to).getTime();

  for (const slot of busySlots) {
    const slotStart = new Date(slot.from).getTime();
    const slotEnd = new Date(slot.to).getTime();
    if (reqStart < slotEnd && reqEnd > slotStart) {
      return {
        vehicleId,
        available: false,
        reason: slot.reason || "Trùng lịch đơn thuê hoặc bảo dưỡng",
        nextAvailableFrom: slot.to,
        conflictingBooking: { from: slot.from, to: slot.to },
      };
    }
  }

  return { vehicleId, available: true };
}

export async function getActiveRentalPolicy(vehicleTypeId: number): Promise<RentalPolicy | null> {
  const res = await defaultApiClient.get<RentalPolicy>(`vehicle-types/${vehicleTypeId}/active-policy`);
  return res && res.id ? res : null;
}

export function getInitialVehicles(_params?: VehicleFilterParams): Vehicle[] {
  return [];
}
