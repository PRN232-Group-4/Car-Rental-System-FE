import { defaultApiClient, isMockMode } from "@/api/default-api-client";
import { MOCK_VEHICLES } from "@/api/mock/mock-catalog";
import { Vehicle, VehicleFilterParams } from "./types";
import { mapVehicleFromBE } from "./mappers";

export async function getVehicles(params?: VehicleFilterParams): Promise<Vehicle[]> {
  try {
    const queryParams: Record<string, string | number> = {};
    if (params?.category && params.category !== "all") {
      queryParams.category = params.category;
    }
    if (params?.facilityId && params.facilityId !== "all") {
      queryParams.facilityId = params.facilityId;
    }
    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

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
