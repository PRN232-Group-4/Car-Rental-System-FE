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
  maxRange?: string;
  storageCapacity?: string;
  hourlyPrice: number;
  monthlyPrice: number;
  facilityId: number | string;
  facilityName: string;
  imageUrl: string;
  badges: string[];
  isAvailable: boolean;
  supportsSubscription: boolean;
  status?: string;
  description?: string;
  galleryImages?: string[];
}

export interface VehicleFilterParams {
  category?: string;
  facilityId?: number | string;
  search?: string;
  status?: string;
}
