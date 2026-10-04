import { defaultApiClient, isMockMode } from "@/api/default-api-client";
import { MOCK_FACILITIES } from "@/api/mock/mock-catalog";
import { Facility } from "./types";

export async function getFacilities(): Promise<Facility[]> {
  try {
    return await defaultApiClient.get<Facility[]>("facilities");
  } catch (error) {
    if (!isMockMode) throw error;
    console.warn("[Facilities API] Fallback to static mock:", error);
    return MOCK_FACILITIES;
  }
}

export async function getFacilityById(id: string): Promise<Facility | undefined> {
  try {
    return await defaultApiClient.get<Facility>(`facilities/${id}`);
  } catch (error) {
    if (!isMockMode) throw error;
    return MOCK_FACILITIES.find((f) => f.id === id);
  }
}

export function getInitialFacilities(): Facility[] {
  return isMockMode ? MOCK_FACILITIES : [];
}
