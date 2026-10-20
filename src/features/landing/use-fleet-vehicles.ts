"use client";

import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "@/features/vehicles/api";

export function useFleetVehicles() {
  return useQuery({ queryKey: ["public-fleet"], queryFn: () => getVehicles(), staleTime: 30_000 });
}
