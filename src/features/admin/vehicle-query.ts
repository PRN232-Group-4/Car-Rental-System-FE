import { queryOptions } from "@tanstack/react-query";
import { getVehicle } from "./api";

/** Every reference to one vehicle shares a request and a fresh cached result. */
export function vehicleQueryOptions(vehicleId: number) {
  return queryOptions({
    queryKey: ["admin-vehicle", vehicleId],
    queryFn: () => getVehicle(vehicleId),
    enabled: Number.isSafeInteger(vehicleId) && vehicleId > 0,
    staleTime: 60_000,
    retry: false,
  });
}
