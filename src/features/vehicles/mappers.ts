import { Vehicle, VehicleCategory } from "./types";
import { components } from "@/api/generated/schema";

type BEVehicle = components["schemas"]["Vehicle"];

export function mapVehicleFromBE(raw: BEVehicle | Record<string, unknown>): Vehicle {
  const r = raw as Record<string, unknown>;
  const id = (r.id ?? r.Id) as number | string;
  const brand = String(r.brand ?? r.Brand ?? "");
  const model = String(r.model ?? r.Model ?? "");
  const name = String(r.name ?? (brand ? `${brand} ${model}`.trim() : `Phương tiện #${id}`));

  const rawType = String(r.vehicleType ?? r.VehicleType ?? r.category ?? "").toLowerCase();
  let category: VehicleCategory = "car";
  let categoryLabel = "Ô tô xăng";

  if (rawType.includes("electric") && (rawType.includes("motor") || rawType.includes("xe máy"))) {
    category = "electric_motorbike";
    categoryLabel = "Xe máy điện";
  } else if (rawType.includes("motor") || rawType.includes("xe máy")) {
    category = "motorbike";
    categoryLabel = "Xe máy";
  } else if (rawType.includes("electric") || rawType.includes("điện")) {
    category = "electric_car";
    categoryLabel = "Ô tô điện";
  }

  const detail = (r.detail ?? r.Detail ?? {}) as Record<string, unknown>;
  const year = Number(r.yearOfManufacture ?? r.YearOfManufacture ?? r.year ?? 2024);
  const seats = detail.seatCount ? Number(detail.seatCount) : (r.seats ? Number(r.seats) : 5);
  const transmission = String(detail.transmission ?? r.transmission ?? "Tự động");
  const fuelType = category.includes("electric") ? "Điện" : String(r.fuelType ?? "Xăng");
  const batteryCapacity = detail.batteryCapacity ? String(detail.batteryCapacity) : undefined;
  const maxRange = detail.maxRangeKm ? `${detail.maxRangeKm} km` : (r.maxRange ? String(r.maxRange) : undefined);
  const storageCapacity = detail.trunkCapacity ? `${detail.trunkCapacity}L` : undefined;

  const hourlyPrice = Number(r.hourlyPrice ?? r.HourlyPrice ?? 100000);
  const monthlyPrice = Number(r.longtermPrice ?? r.LongtermPrice ?? r.monthlyPrice ?? hourlyPrice * 24 * 25);

  const facilityId = (r.facilityId ?? r.FacilityId ?? 1) as number | string;
  const facilityName = String(r.facility ?? r.Facility ?? r.facilityName ?? "Chi nhánh Trung tâm");

  const imageUrl = String(
    r.mainImageUrl ??
      r.MainImageUrl ??
      r.imageUrl ??
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"
  );

  const status = String(r.status ?? r.Status ?? "available").toLowerCase();
  const isAvailable = status === "available";

  const badges: string[] = [];
  if (category.includes("electric")) badges.push("Eco Friendly");
  if (isAvailable) badges.push("Sẵn sàng giao");

  return {
    id,
    name,
    brand,
    model,
    category,
    categoryLabel,
    year,
    seats,
    transmission,
    fuelType,
    batteryCapacity,
    maxRange,
    storageCapacity,
    hourlyPrice,
    monthlyPrice,
    facilityId,
    facilityName,
    imageUrl,
    badges,
    isAvailable,
    supportsSubscription: true,
    status,
    description: (r.description ?? r.Description) as string | undefined,
    galleryImages: Array.isArray(detail.galleryImages) ? detail.galleryImages : undefined,
  };
}
