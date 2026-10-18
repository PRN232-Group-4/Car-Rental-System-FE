import { defaultApiClient, isMockMode } from "@/api/default-api-client";
import { MOCK_VEHICLES, MOCK_BUSY_SLOTS, MOCK_ACTIVE_POLICIES } from "@/api/mock/mock-catalog";
import { Vehicle, VehicleFilterParams, VehiclePage, BusySlot, AvailabilityResult, RentalPolicy } from "./types";
import { mapVehicleFromBE } from "./mappers";

export async function getVehicles(params?: VehicleFilterParams): Promise<Vehicle[]> {
  try {
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
  } catch (error) {
    if (!isMockMode) throw error;
    console.warn("[Vehicles API] Fallback to static mock:", error);
  }
  return getInitialVehicles(params);
}

export async function getVehiclesPaginated(params?: VehicleFilterParams): Promise<VehiclePage> {
  const page = Math.max(1, Number(params?.page) || 1);
  const pageSize = Math.max(1, Number(params?.pageSize) || 9);

  try {
    const queryParams: Record<string, string | number> = {
      page,
      pageSize,
    };
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
  } catch (error) {
    if (!isMockMode) throw error;
    console.warn("[Vehicles API Paginated] Fallback to static mock:", error);
  }

  // Fallback pagination from local list
  let filtered = (MOCK_VEHICLES as unknown as Record<string, unknown>[]).map((v) => mapVehicleFromBE(v));
  if (params?.facilityId && params.facilityId !== "all") {
    filtered = filtered.filter((v) => String(v.facilityId) === String(params.facilityId));
  }
  if (params?.category && params.category !== "all") {
    filtered = filtered.filter((v) => v.category === params.category);
  }
  if (params?.brand && params.brand !== "all") {
    filtered = filtered.filter((v) => v.brand?.toLowerCase() === params.brand?.toLowerCase());
  }
  if (params?.seats && Number(params.seats) > 0) {
    filtered = filtered.filter((v) => v.seats === Number(params.seats));
  }
  if (params?.transmission && params.transmission !== "all") {
    filtered = filtered.filter((v) => v.transmission.toLowerCase().includes(params.transmission!.toLowerCase()));
  }
  if (params?.fuelType && params.fuelType !== "all") {
    const ft = params.fuelType.toLowerCase();
    filtered = filtered.filter((v) => {
      if (ft === "electric") return v.category.includes("electric");
      if (ft === "petrol" || ft === "xăng") return !v.category.includes("electric");
      return v.fuelType?.toLowerCase().includes(ft);
    });
  }
  if (params?.priceMin && Number(params.priceMin) > 0) {
    filtered = filtered.filter((v) => v.hourlyPrice >= Number(params.priceMin));
  }
  if (params?.priceMax && Number(params.priceMax) > 0) {
    filtered = filtered.filter((v) => v.hourlyPrice <= Number(params.priceMax));
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.categoryLabel.toLowerCase().includes(q) ||
        v.facilityName.toLowerCase().includes(q) ||
        (v.brand && v.brand.toLowerCase().includes(q))
    );
  }

  if (params?.sort) {
    switch (params.sort) {
      case "price_asc":
        filtered.sort((a, b) => a.hourlyPrice - b.hourlyPrice);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.hourlyPrice - a.hourlyPrice);
        break;
      case "year_desc":
        filtered.sort((a, b) => b.year - a.year);
        break;
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        break;
    }
  }

  const totalCount = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);

  return {
    items,
    totalCount,
    page,
    pageSize,
  };
}

export async function getVehicleById(id: number | string): Promise<Vehicle | undefined> {
  try {
    const raw = await defaultApiClient.get<unknown>(`vehicles/${id}`);
    if (raw) {
      return mapVehicleFromBE(raw as Record<string, unknown>);
    }
  } catch (error) {
    if (!isMockMode) throw error;
  }
  const found = (MOCK_VEHICLES as unknown as Record<string, unknown>[]).find(
    (v) => String(v.id) === String(id)
  );
  return found ? mapVehicleFromBE(found) : undefined;
}

export async function getVehicleBusySlots(
  vehicleId: number | string,
  from?: string,
  to?: string
): Promise<BusySlot[]> {
  try {
    const query: Record<string, string> = {};
    if (from) query.from = from;
    if (to) query.to = to;
    const res = await defaultApiClient.get<BusySlot[]>(`vehicles/${vehicleId}/busy-slots`, query);
    if (Array.isArray(res)) return res;
  } catch (error) {
    if (!isMockMode) throw error;
  }

  const vId = String(vehicleId);
  const slots = MOCK_BUSY_SLOTS[vId] ?? [
    {
      from: "2026-10-25T01:00:00.000Z",
      to: "2026-10-27T10:00:00.000Z",
      reason: "Đã có đơn thuê",
      isBuffer: false,
    },
    {
      from: "2026-10-27T10:00:00.000Z",
      to: "2026-10-27T11:00:00.000Z",
      reason: "Đệm kỹ thuật 60 phút",
      isBuffer: true,
    },
  ];

  if (!from && !to) return slots;
  return slots.filter((slot) => {
    if (from && new Date(slot.to).getTime() < new Date(from).getTime()) return false;
    if (to && new Date(slot.from).getTime() > new Date(to).getTime()) return false;
    return true;
  });
}

export async function checkVehicleAvailability(
  vehicleId: number | string,
  from: string,
  to: string
): Promise<AvailabilityResult> {
  try {
    const res = await defaultApiClient.get<AvailabilityResult>(`vehicles/${vehicleId}/availability`, {
      from,
      to,
    });
    if (res && typeof res.available === "boolean") return res;
  } catch (error) {
    if (!isMockMode) throw error;
  }

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
        conflictingBooking: {
          from: slot.from,
          to: slot.to,
        },
      };
    }
  }

  return {
    vehicleId,
    available: true,
  };
}

export async function getActiveRentalPolicy(vehicleTypeId: number): Promise<RentalPolicy | null> {
  try {
    const res = await defaultApiClient.get<RentalPolicy>(`vehicle-types/${vehicleTypeId}/active-policy`);
    if (res && res.id) return res;
  } catch (error) {
    if (!isMockMode) throw error;
  }

  const mock = MOCK_ACTIVE_POLICIES[vehicleTypeId] ?? MOCK_ACTIVE_POLICIES[1];
  return mock ?? null;
}

export function getInitialVehicles(params?: VehicleFilterParams): Vehicle[] {
  if (!isMockMode) return [];
  let list = (MOCK_VEHICLES as unknown as Record<string, unknown>[]).map((v) => mapVehicleFromBE(v));
  if (params?.facilityId && params.facilityId !== "all") {
    list = list.filter((v) => String(v.facilityId) === String(params.facilityId));
  }
  if (params?.category && params.category !== "all") {
    list = list.filter((v) => v.category === params.category);
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.categoryLabel.toLowerCase().includes(q) ||
        v.facilityName.toLowerCase().includes(q)
    );
  }
  return list;
}
