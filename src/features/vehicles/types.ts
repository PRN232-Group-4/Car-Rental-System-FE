export type VehicleCategory = "car" | "electric_car" | "motorbike" | "electric_motorbike";

export interface Vehicle {
  id: string;
  name: string;
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
  facilityId: string;
  facilityName: string;
  imageUrl: string;
  badges: string[];
  isAvailable: boolean;
  supportsSubscription: boolean;
}

export interface VehicleFilterParams {
  category?: string;
  facilityId?: string;
  search?: string;
}
