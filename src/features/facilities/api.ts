import { defaultApiClient } from "@/api/default-api-client";
import { Facility } from "./types";

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: "fac-saigon-atelier",
    name: "Saigon Atelier - Trạm Quận 1",
    shortName: "Saigon Atelier",
    address: "Số 68 Lê Lợi, Bến Nghé, Quận 1",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    availableVehicles: 18,
    openHours: "07:00 - 22:00 Hàng ngày",
    phone: "1900 6868",
    imageUrl: "/images/facilities/district-1.jpg",
    latitude: 10.7769,
    longitude: 106.7009,
  },
  {
    id: "fac-riverside-gallery",
    name: "Riverside Gallery - Trạm Thảo Điền",
    shortName: "Riverside Gallery",
    address: "Số 12 Quốc Hương, Thảo Điền, TP. Thủ Đức",
    district: "TP. Thủ Đức",
    city: "TP. Hồ Chí Minh",
    availableVehicles: 24,
    openHours: "06:30 - 22:30 Hàng ngày",
    phone: "1900 6869",
    imageUrl: "/images/facilities/thao-dien.jpg",
    latitude: 10.8035,
    longitude: 106.7325,
  },
  {
    id: "fac-southside-lounge",
    name: "Southside Lounge - Trạm Phú Mỹ Hưng",
    shortName: "Southside Lounge",
    address: "Số 101 Tôn Dật Tiên, Tân Phong, Quận 7",
    district: "Quận 7",
    city: "TP. Hồ Chí Minh",
    availableVehicles: 15,
    openHours: "07:00 - 22:00 Hàng ngày",
    phone: "1900 6870",
    imageUrl: "/images/facilities/phu-my-hung.jpg",
    latitude: 10.7295,
    longitude: 106.7218,
  },
];

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
    return facilities.length > 0 ? facilities : INITIAL_FACILITIES;
  } catch (error) {
    console.warn("[Facilities API] Không tải được danh sách chi nhánh, sử dụng initial facilities:", error);
    return INITIAL_FACILITIES;
  }
}

export async function getFacilityById(id: string): Promise<Facility | undefined> {
  return (await getFacilities()).find((facility) => facility.id === id);
}

export function getInitialFacilities(): Facility[] {
  return INITIAL_FACILITIES;
}
