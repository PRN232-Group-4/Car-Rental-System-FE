import { defaultApiClient } from "@/api/default-api-client";
import { Facility } from "./types";

export function mapFacilityFromBE(value: Record<string, unknown>): Facility {
  const text = (key: string) => typeof value[key] === "string" ? value[key] as string : undefined;
  const number = (key: string) => typeof value[key] === "number" && Number.isFinite(value[key]) ? value[key] as number : undefined;
  return {
    id: String(value.id ?? ""),
    name: text("name") ?? "Chi nhánh chưa cập nhật tên",
    address: text("address") ?? "",
    shortName: text("shortName"),
    district: text("district"),
    city: text("city"),
    availableVehicles: number("availableVehicles"),
    openHours: text("openHours"),
    phone: text("phone"),
    imageUrl: text("imageUrl"),
    latitude: number("latitude"),
    longitude: number("longitude"),
  };
}

export function mapFacilitiesPage(value: unknown): Facility[] {
  const rows = Array.isArray(value) ? value : value && typeof value === "object" && "items" in value && Array.isArray(value.items) ? value.items : [];
  return rows.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object" && row.id != null).map(mapFacilityFromBE);
}

export async function getFacilities(): Promise<Facility[]> {
  try {
    const facilities: Facility[] = [];
    let page = 1;
    while (true) {
      const data = await defaultApiClient.get<unknown>("facilities", { page, pageSize: 100 });
      const batch = mapFacilitiesPage(data);
      const fresh = batch.filter((facility) => !facilities.some((existing) => existing.id === facility.id));
      facilities.push(...fresh);
      const totalCount = data && typeof data === "object" && "totalCount" in data ? Number(data.totalCount) : facilities.length;
      if (Array.isArray(data) || !fresh.length || facilities.length >= totalCount) break;
      page += 1;
    }
    return facilities;
  } catch (error) {
    console.warn("[Facilities API] Không tải được danh sách chi nhánh:", error);
    throw error;
  }
}

export async function getFacilityById(id: string): Promise<Facility | undefined> {
  // The backend exposes a public collection but has no GET /facilities/{id} route.
  return (await getFacilities()).find((facility) => facility.id === id);
}

export function getInitialFacilities(): Facility[] {
  return [];
}
