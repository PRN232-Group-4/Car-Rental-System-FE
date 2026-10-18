export type VehicleCategory = "car" | "electric_car" | "motorbike" | "electric_motorbike";

export interface Vehicle {
  id: number | string;
  vehicleTypeId?: number;
  name: string;
  brand?: string;
  model?: string;
  category: VehicleCategory;
  categoryLabel: string;
  year: number;
  seats?: number;
  transmission: string;
  fuelType?: string;
  batteryCapacity?: string;
  chargingType?: string;
  chargingTimeHours?: string;
  maxRange?: string;
  storageCapacity?: string;
  trunkCapacity?: number;
  bikeType?: string;
  color?: string;
  hourlyPrice: number;
  monthlyPrice: number;
  facilityId: number | string;
  facilityName: string;
  imageUrl: string;
  modelUrl?: string;
  badges: string[];
  isAvailable: boolean;
  supportsSubscription: boolean;
  status?: string;
  description?: string;
  features?: string[];
  galleryImages?: string[];
}

import type { RentalPolicy } from "@/features/rentals/types";

export type { RentalPolicy };


export interface BusySlot {
  from: string; // ISO UTC string
  to: string; // ISO UTC string
  reason?: string;
  isBuffer?: boolean;
}

export interface AvailabilityResult {
  vehicleId: number | string;
  available: boolean;
  reason?: string;
  nextAvailableFrom?: string;
  conflictingBooking?: {
    from: string;
    to: string;
  };
}

export interface VehiclePage {
  items: Vehicle[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface VehicleFilterParams {
  category?: string;
  facilityId?: number | string;
  brand?: string;
  seats?: number;
  transmission?: string;
  fuelType?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  status?: string;
  sort?: "price_asc" | "price_desc" | "year_desc" | "name_asc";
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  mode?: "hourly" | "longterm";
}
