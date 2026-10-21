"use client";

import { useQuery } from "@tanstack/react-query";
import { getVehiclesPaginated } from "@/features/vehicles/api";

export function useFleetVehicles() {
  return useQuery({
    queryKey: ["public-fleet", "available", 6],
    queryFn: async () => {
      const result = await getVehiclesPaginated({ status: "available", page: 1, pageSize: 6 });
      return result.items.filter((vehicle) => vehicle.isAvailable).slice(0, 6);
    },
    staleTime: 30_000,
  });
}
