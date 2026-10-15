import { ApiClientError } from "@/api/api-client";
import { backendApiClient } from "@/api/backend-api-client";

export interface GpsPoint {
  lat: number;
  lng: number;
  recordedAt: string;
  speedKmh?: number | null;
  accuracyM?: number | null;
}

export interface VehiclePosition extends GpsPoint {
  vehicleId: number;
  address?: string | null;
}

export interface RentalRoute {
  rentalId: number;
  vehicleId: number;
  totalPoints: number;
  totalDistanceMeters: number;
  durationSeconds: number;
  averageSpeedKmh: number;
  maxSpeedKmh: number;
  startPosition: GpsPoint | null;
  endPosition: GpsPoint | null;
  routePoints: GpsPoint[];
}

export function hasGpsCoordinates(point: Pick<GpsPoint, "lat" | "lng"> | null | undefined): boolean {
  return !!point && Number.isFinite(point.lat) && Number.isFinite(point.lng)
    && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;
}

export async function getVehiclePosition(vehicleId: number): Promise<VehiclePosition | null> {
  try {
    const point = await backendApiClient.get<VehiclePosition>(`tracking/vehicles/${vehicleId}/last-position`);
    return hasGpsCoordinates(point) ? point : null;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

export function getRentalRoute(rentalId: number | string) {
  return backendApiClient.get<RentalRoute>(`tracking/rentals/${encodeURIComponent(rentalId)}/route`);
}

export function trackingError(error: unknown): string {
  if (error instanceof ApiClientError && error.status === 403) return "Bạn không có quyền xem dữ liệu định vị này.";
  if (error instanceof ApiClientError && error.status === 404) return "Không tìm thấy dữ liệu hành trình cho đơn thuê này.";
  return "Không tải được dữ liệu định vị. Vui lòng kiểm tra kết nối và thử lại.";
}
