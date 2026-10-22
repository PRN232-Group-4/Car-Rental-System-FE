import { defaultApiClient } from "@/api/default-api-client";
import { Vehicle, VehicleFilterParams, VehiclePage, BusySlot, AvailabilityResult, RentalPolicy } from "./types";
import { mapVehicleFromBE, mapVehicleSearchFromBE } from "./mappers";

export async function getVehicles(params?: VehicleFilterParams): Promise<Vehicle[]> {
  const queryParams: Record<string, string | number> = {};
  if (params?.category && params.category !== "all") queryParams.category = params.category;
  if (params?.facilityId && params.facilityId !== "all") queryParams.facilityId = params.facilityId;
  if (params?.search && params.search.trim()) queryParams.search = params.search.trim();

  const vehicles: Vehicle[] = [];
  let page = 1;
  while (true) {
    const res = await defaultApiClient.get<{ items: Record<string, unknown>[]; totalCount: number }>("vehicles", { ...queryParams, page, pageSize: 100 });
    if (!res || !Array.isArray(res.items)) throw new Error("Dữ liệu danh mục xe không hợp lệ. Vui lòng thử lại.");
    vehicles.push(...res.items.map(mapVehicleFromBE));
    if (vehicles.length >= res.totalCount) break;
    if (!res.items.length) throw new Error("Chưa tải đủ danh mục xe. Vui lòng thử lại.");
    page++;
  }
  return vehicles.filter((vehicle) =>
    (!params?.category || params.category === "all" || vehicle.category === params.category) &&
    (!params?.search || vehicle.name.toLowerCase().includes(params.search.trim().toLowerCase()))
  );
}

export async function getVehiclesPaginated(params?: VehicleFilterParams): Promise<VehiclePage> {
  const page = Math.max(1, Number(params?.page) || 1);
  const pageSize = Math.max(1, Number(params?.pageSize) || 9);

  const queryParams: Record<string, string | number> = { page, pageSize };
  if (params?.category && params.category !== "all") queryParams.category = params.category;
  if (params?.facilityId && params.facilityId !== "all") queryParams.facilityId = params.facilityId;
  if (params?.brand && params.brand !== "all") queryParams.brand = params.brand;
  if (params?.seats && Number(params.seats) > 0) queryParams.seatCount = params.seats;
  if (params?.transmission && params.transmission !== "all") queryParams.transmission = params.transmission;
  if (params?.fuelType && params.fuelType !== "all") queryParams.fuelType = params.fuelType;
  if (params?.priceMin && Number(params.priceMin) > 0) queryParams.minPrice = params.priceMin;
  if (params?.priceMax && Number(params.priceMax) > 0) queryParams.maxPrice = params.priceMax;
  if (params?.search && params.search.trim()) queryParams.q = params.search.trim();
  if (params?.sort) queryParams.sort = params.sort === "year_desc" ? "newest" : params.sort;
  queryParams.rentalType = params?.mode ?? "hourly";
  if (params?.from && params?.to) {
    queryParams.from = params.from;
    queryParams.to = params.to;
  }

  // The landing preview uses the status catalogue; /vehicles/search has its own server-side filters.
  const res = params?.status
    ? await defaultApiClient.get<unknown>("vehicles", {
      page, pageSize, status: params.status,
      ...(params.facilityId && params.facilityId !== "all" ? { facilityId: params.facilityId } : {}),
      ...(params.from ? { from: params.from } : {}), ...(params.to ? { to: params.to } : {}),
    })
    : await defaultApiClient.get<unknown>("vehicles/search", queryParams);
  if (typeof res === "object" && res !== null && "items" in res && Array.isArray((res as { items: unknown[] }).items)) {
    const paged = res as { items: Record<string, unknown>[]; totalCount?: number; page?: number; pageSize?: number };
    return {
      items: paged.items.map(params?.status ? mapVehicleFromBE : mapVehicleSearchFromBE),
      totalCount: Number(paged.totalCount ?? paged.items.length),
      page: Number(paged.page ?? page),
      pageSize: Number(paged.pageSize ?? pageSize),
    };
  }

  throw new Error("Dữ liệu tìm kiếm xe không hợp lệ. Vui lòng thử lại.");
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

export function getInitialVehicles(params?: VehicleFilterParams): Vehicle[] {
  void params;
  return [];
}
