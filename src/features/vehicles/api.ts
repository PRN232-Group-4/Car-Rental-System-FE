import { defaultApiClient } from "@/api/default-api-client";
import { Vehicle, VehicleFilterParams, VehiclePage, BusySlot, AvailabilityResult, RentalPolicy } from "./types";
import { mapVehicleFromBE } from "./mappers";

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

  // The API only filters by vehicleTypeId/facilityId/status/from/to; everything else is local.
  const queryParams: Record<string, string | number> = { page, pageSize };
  if (params?.status) queryParams.status = params.status;
  if (params?.facilityId && params.facilityId !== "all") queryParams.facilityId = params.facilityId;
  if (params?.from) queryParams.from = params.from;
  if (params?.to) queryParams.to = params.to;

  const needsLocalFilter = Boolean(
    (params?.category && params.category !== "all") ||
      (params?.brand && params.brand !== "all") ||
      Number(params?.seats) > 0 ||
      (params?.transmission && params.transmission !== "all") ||
      (params?.fuelType && params.fuelType !== "all") ||
      Number(params?.priceMin) > 0 ||
      Number(params?.priceMax) > 0 ||
      params?.search?.trim() ||
      params?.sort,
  );

  if (!needsLocalFilter) {
    const res = await defaultApiClient.get<unknown>("vehicles", queryParams);
    return toPage(res, page, pageSize);
  }

  const all: Vehicle[] = [];
  let serverPage = 1;
  while (true) {
    const res = await defaultApiClient.get<unknown>("vehicles", { ...queryParams, page: serverPage, pageSize: 100 });
    const chunk = toPage(res, serverPage, 100);
    if (chunk.totalCount > all.length + chunk.items.length && chunk.items.length === 0) {
      throw new Error("Chưa tải đủ danh mục xe. Vui lòng thử lại.");
    }
    all.push(...chunk.items);
    if (all.length >= chunk.totalCount || chunk.items.length === 0) break;
    serverPage++;
  }

  const matched = sortVehicles(all.filter((vehicle) => matchesFilters(vehicle, params)), params?.sort);
  return {
    items: matched.slice((page - 1) * pageSize, page * pageSize),
    totalCount: matched.length,
    page,
    pageSize,
  };
}

function toPage(res: unknown, page: number, pageSize: number): VehiclePage {
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

/** Case- and accent-insensitive compare key, including the Vietnamese đ. */
function fold(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

function matchesFilters(vehicle: Vehicle, params?: VehicleFilterParams): boolean {
  const category = params?.category;
  if (category && category !== "all" && vehicle.category !== category) return false;
  const brand = params?.brand;
  if (brand && brand !== "all" && fold(vehicle.brand ?? "") !== fold(brand)) return false;
  const seats = Number(params?.seats);
  if (seats > 0 && Number(vehicle.seats) !== seats) return false;
  const transmission = params?.transmission;
  if (transmission && transmission !== "all") {
    const wanted: string | undefined = { automatic: "tu dong", manual: "so san", cvt: "cvt" }[transmission as "automatic" | "manual" | "cvt"];
    if (!wanted || !fold(vehicle.transmission ?? "").includes(wanted)) return false;
  }
  const fuelType = params?.fuelType;
  if (fuelType && fuelType !== "all") {
    const isElectric = vehicle.category.includes("electric");
    if (fuelType === "electric" && !isElectric) return false;
    if (fuelType === "petrol" && isElectric) return false;
  }
  const priceMin = Number(params?.priceMin);
  if (priceMin > 0 && vehicle.hourlyPrice < priceMin) return false;
  const priceMax = Number(params?.priceMax);
  if (priceMax > 0 && vehicle.hourlyPrice > priceMax) return false;
  const search = params?.search?.trim();
  if (search) {
    const needle = fold(search);
    const haystack = fold(
      [vehicle.name, vehicle.brand, vehicle.model, vehicle.categoryLabel, vehicle.facilityName]
        .filter(Boolean)
        .join(" "),
    );
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function sortVehicles(vehicles: Vehicle[], sort?: VehicleFilterParams["sort"]): Vehicle[] {
  const sorted = [...vehicles];
  if (sort === "price_asc") sorted.sort((a, b) => a.hourlyPrice - b.hourlyPrice);
  if (sort === "price_desc") sorted.sort((a, b) => b.hourlyPrice - a.hourlyPrice);
  if (sort === "year_desc") sorted.sort((a, b) => Number(b.year ?? 0) - Number(a.year ?? 0));
  if (sort === "name_asc") sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  return sorted;
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
