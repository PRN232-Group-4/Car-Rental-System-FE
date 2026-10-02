import { defaultApiClient } from "@/api/default-api-client";
import { MOCK_VEHICLES } from "@/api/mock/mock-catalog";
import { Vehicle, VehicleFilterParams } from "./types";

export async function getVehicles(params?: VehicleFilterParams): Promise<Vehicle[]> {
  try {
    const queryParams: Record<string, string> = {};
    if (params?.category && params.category !== "all") {
      queryParams.category = params.category;
    }
    if (params?.facilityId && params.facilityId !== "all") {
      queryParams.facilityId = params.facilityId;
    }
    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    return await defaultApiClient.get<Vehicle[]>("vehicles", queryParams);
  } catch (error) {
    console.warn("[Vehicles API] Fallback to static mock:", error);
    return getInitialVehicles(params);
  }
}

export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
  try {
    return await defaultApiClient.get<Vehicle>(`vehicles/${id}`);
  } catch {
    return (MOCK_VEHICLES as Vehicle[]).find((v) => v.id === id);
  }
}

export function getInitialVehicles(params?: VehicleFilterParams): Vehicle[] {
  let list = [...(MOCK_VEHICLES as Vehicle[])];
  if (params?.facilityId && params.facilityId !== "all") {
    list = list.filter((v) => v.facilityId === params.facilityId);
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
