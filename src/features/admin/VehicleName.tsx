"use client";

import { useQuery } from "@tanstack/react-query";
import { vehicleQueryOptions } from "./vehicle-query";
import type { VehicleDto } from "./api";
import VehicleImage from "@/components/ui/VehicleImage";
import { Skeleton } from "@/components/ui/Skeleton";

export function VehicleIdentity({ vehicle }: { vehicle: Pick<VehicleDto, "brand" | "model" | "licensePlate" | "mainImageUrl"> }) {
  const name = [vehicle.brand?.trim(), vehicle.model?.trim()].filter(Boolean).join(" ");
  const label = name || vehicle.licensePlate || "Chưa có tên phương tiện";
  return <span className="flex min-w-0 items-center gap-3">
    <VehicleImage src={vehicle.mainImageUrl} alt={label} />
    <span className="min-w-0">
      <span className="block font-semibold text-ink">{label}</span>
      {name && vehicle.licensePlate && <span className="mt-1 block text-xs text-ink-3">{vehicle.licensePlate}</span>}
    </span>
  </span>;
}

/** Cache by vehicle so multiple maintenance records share the same lookup. */
export default function VehicleName({ vehicleId }: { vehicleId: number | string }) {
  const numericId = Number(vehicleId);
  const vehicle = useQuery(vehicleQueryOptions(numericId));

  if (!Number.isSafeInteger(numericId) || numericId <= 0) return <VehicleIdentity vehicle={{ brand: null, model: null, licensePlate: null, mainImageUrl: null }} />;
  if (vehicle.isPending) return <span role="status" aria-label="Đang tải phương tiện" data-skeleton-block className="flex items-center gap-3"><Skeleton className="h-12 w-[68px] rounded-lg" /><span className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></span></span>;
  if (vehicle.isError) return <span className="flex items-center gap-3 text-ink-3">
    <VehicleImage alt="Phương tiện" />
    <span>Không tải được tên xe
      <button type="button" onClick={() => void vehicle.refetch()} className="mt-1 block text-xs font-semibold text-primary hover:underline">Tải lại tên xe</button>
    </span>
  </span>;

  return <VehicleIdentity vehicle={vehicle.data} />;
}
