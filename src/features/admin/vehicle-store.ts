import { MOCK_VEHICLES } from "@/api/mock/mock-catalog";
import type { VehicleCategory, VehicleCatalogItem } from "@/api/mock/mock-catalog";

export type VehicleStatus = "available" | "rented" | "maintenance" | "unavailable";

export interface ManagedVehicle extends VehicleCatalogItem {
  licensePlate: string;
  status: VehicleStatus;
}

export const VEHICLES_STORAGE_KEY = "thong-dong-admin-vehicles";

export const VEHICLE_CATEGORIES: { value: VehicleCategory; label: string }[] = [
  { value: "car", label: "Ô tô xăng" },
  { value: "electric_car", label: "Ô tô điện" },
  { value: "motorbike", label: "Xe máy xăng" },
  { value: "electric_motorbike", label: "Xe máy điện" },
];

export const INITIAL_MANAGED_VEHICLES: ManagedVehicle[] = MOCK_VEHICLES.map((vehicle, index) => ({
  ...vehicle,
  licensePlate: ["51K-892.44", "51H-348.21", "51K-672.18", "51G-225.63", "59P-118.32", "59P-410.77"][index] ?? `51A-${index + 1}`,
  status: vehicle.isAvailable ? "available" : "rented",
}));

export function loadManagedVehicles(): ManagedVehicle[] {
  const stored = window.localStorage.getItem(VEHICLES_STORAGE_KEY);
  if (stored === null) return INITIAL_MANAGED_VEHICLES;

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed) || !parsed.every(isManagedVehicle)) {
    throw new Error("Dữ liệu phương tiện đã lưu không hợp lệ.");
  }
  return parsed;
}

export function saveManagedVehicles(vehicles: ManagedVehicle[]): void {
  window.localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
}

export function categoryLabel(category: VehicleCategory): string {
  return VEHICLE_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

function isManagedVehicle(value: unknown): value is ManagedVehicle {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.category === "string" &&
    VEHICLE_CATEGORIES.some((category) => category.value === item.category) &&
    typeof item.categoryLabel === "string" &&
    typeof item.year === "number" &&
    typeof item.transmission === "string" &&
    typeof item.hourlyPrice === "number" &&
    typeof item.monthlyPrice === "number" &&
    typeof item.facilityId === "string" &&
    typeof item.facilityName === "string" &&
    typeof item.imageUrl === "string" &&
    Array.isArray(item.badges) &&
    typeof item.isAvailable === "boolean" &&
    typeof item.supportsSubscription === "boolean" &&
    typeof item.licensePlate === "string" &&
    ["available", "rented", "maintenance", "unavailable"].includes(String(item.status))
  );
}
