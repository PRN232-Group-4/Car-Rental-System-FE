import { Vehicle, VehicleCategory } from "./types";
import { components } from "@/api/generated/schema";

type BEVehicle = components["schemas"]["Vehicle"];

/** Public search returns nested type/facility/summary references. */
export function mapVehicleSearchFromBE(raw: Record<string, unknown>): Vehicle {
  const type = (raw.vehicleType ?? {}) as Record<string, unknown>;
  const facility = raw.facility as Record<string, unknown> | null;
  const summary = (raw.summary ?? {}) as Record<string, unknown>;
  const badges = (raw.badges ?? {}) as Record<string, unknown>;
  const typeName = String(type.type ?? type.name ?? "car");
  const electric = badges.electric === true || /electric|điện/i.test(String(type.fuelType ?? typeName));
  return mapVehicleFromBE({
    ...raw,
    vehicleType: `${electric ? "electric " : ""}${typeName}`,
    vehicleTypeId: type.id,
    facilityId: facility?.id,
    facility: facility?.name,
    detail: summary,
    hourlyPrice: raw.priceHourly,
    longtermPrice: raw.priceLongterm,
    fuelType: type.fuelType,
    driverAvailable: badges.driverAvailable,
    badges: [],
    status: "available",
  });
}

export function mapVehicleFromBE(raw: BEVehicle | Record<string, unknown>): Vehicle {
  const r = raw as Record<string, unknown>;
  const id = (r.id ?? r.Id) as number | string;
  const brand = String(r.brand ?? r.Brand ?? "");
  const model = String(r.model ?? r.Model ?? "");
  const name = String(r.name ?? (brand ? `${brand} ${model}`.trim() : `Phương tiện #${id}`));

  const rawType = String(r.vehicleType ?? r.VehicleType ?? r.category ?? "").toLowerCase();
  let category: VehicleCategory = "car";
  let categoryLabel = "Ô tô xăng";

  if ((rawType.includes("electric") || rawType.includes("điện")) && (rawType.includes("motor") || rawType.includes("xe máy"))) {
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
  const year = Number(r.yearOfManufacture ?? r.YearOfManufacture ?? r.year ?? 0);
  const seats = detail.seatCount ? Number(detail.seatCount) : (r.seats ? Number(r.seats) : undefined);
  const transmission = String(detail.transmission ?? r.transmission ?? "");
  const fuelType = category.includes("electric") ? "Điện" : String(r.fuelType ?? "Xăng");
  const batteryCapacity = detail.batteryCapacity ? String(detail.batteryCapacity) : undefined;
  const maxRange = detail.maxRangeKm ? `${detail.maxRangeKm} km` : (r.maxRange ? String(r.maxRange) : undefined);
  const storageCapacity = detail.trunkCapacity ? `${detail.trunkCapacity}L` : undefined;

  const hourlyPrice = Number(r.hourlyPrice ?? r.HourlyPrice ?? 0);
  const monthlyPrice = Number(r.longtermPrice ?? r.LongtermPrice ?? r.monthlyPrice ?? 0);

  const facilityId = (r.facilityId ?? r.FacilityId ?? "") as number | string;
  const facilityName = String(r.facility ?? r.Facility ?? r.facilityName ?? "Chưa có thông tin cơ sở");

  const imageUrl = String(
    r.mainImageUrl ??
      r.MainImageUrl ??
      r.imageUrl ??
      ""
  );

  const status = String(r.status ?? r.Status ?? "unavailable").toLowerCase();
  const isAvailable = status === "available";

  const badges: string[] = Array.isArray(r.badges) ? [...r.badges as string[]] : [];
  if (category.includes("electric") && !badges.includes("Eco Friendly")) badges.push("Eco Friendly");
  if (isAvailable && !badges.includes("Sẵn sàng giao")) badges.push("Sẵn sàng giao");

  const chargingType = (detail.chargingType ?? r.chargingType) as string | undefined;
  const chargingTimeHours = (detail.chargingTimeHours ?? r.chargingTimeHours) as string | undefined;
  const trunkCapacity = detail.trunkCapacity ? Number(detail.trunkCapacity) : (r.trunkCapacity ? Number(r.trunkCapacity) : undefined);
  const bikeType = (detail.bikeType ?? r.bikeType) as string | undefined;
  const color = (r.color ?? detail.color) as string | undefined;
  const modelUrl = (r.modelUrl ?? detail.modelUrl) as string | undefined;
  const features = Array.isArray(detail.features)
    ? (detail.features as string[])
    : Array.isArray(r.features)
      ? (r.features as string[])
      : undefined;

  return {
    id,
    vehicleTypeId: Number(r.vehicleTypeId ?? r.VehicleTypeId) || undefined,
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
    chargingType,
    chargingTimeHours,
    maxRange,
    storageCapacity,
    trunkCapacity,
    bikeType,
    color,
    hourlyPrice,
    monthlyPrice,
    facilityId,
    facilityName,
    imageUrl,
    modelUrl,
    hasDriverOption: typeof r.driverAvailable === "boolean" ? r.driverAvailable : undefined,
    badges,
    isAvailable,
    supportsSubscription: true,
    status,
    description: (r.description ?? r.Description) as string | undefined,
    features,
    galleryImages: Array.isArray(detail.galleryImages)
      ? (detail.galleryImages as string[])
      : Array.isArray(r.galleryImages)
        ? (r.galleryImages as string[])
        : undefined,
  };
}
