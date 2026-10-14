"use client";

import { useQuery } from "@tanstack/react-query";
import { getVehicle } from "./api";

/** Cache by vehicle so multiple maintenance records share the same lookup. */
export default function VehicleName({ vehicleId }: { vehicleId: number }) {
  const vehicle = useQuery({
    queryKey: ["admin-vehicle", vehicleId],
    queryFn: () => getVehicle(vehicleId),
    staleTime: 60_000,
    retry: false,
  });

  if (vehicle.isPending) return <span className="text-ink-3">Đang tải tên xe...</span>;
  if (vehicle.isError) return <span className="block text-ink-3">
    Không tải được tên xe
    <button type="button" onClick={() => void vehicle.refetch()} className="mt-1 block text-xs font-semibold text-primary hover:underline">Tải lại tên xe</button>
  </span>;

  const name = [vehicle.data.brand?.trim(), vehicle.data.model?.trim()].filter(Boolean).join(" ");
  return <span>
    <span className="block font-semibold text-ink">{name || vehicle.data.licensePlate || "Chưa có tên phương tiện"}</span>
    {name && vehicle.data.licensePlate && <span className="mt-1 block text-xs text-ink-3">{vehicle.data.licensePlate}</span>}
  </span>;
}
