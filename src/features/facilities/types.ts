export interface Facility {
  id: string;
  name: string;
  shortName?: string;
  address: string;
  district?: string;
  city?: string;
  availableVehicles?: number;
  openHours?: string;
  phone?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}
