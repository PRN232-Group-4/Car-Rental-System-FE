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

export interface NearbyVehicle {
  vehicleId: number; brand: string | null; model: string | null; licensePlate: string | null;
  status: string | null; lat: number; lng: number; straightLineMeters: number; routeMeters: number | null; etaSeconds: number | null;
}
export interface NearbyQuery { lat: number; lng: number; radiusMeters: number; includeEta: boolean; page: number; pageSize: number }
export const getNearbyVehicles = (query: NearbyQuery, signal?: AbortSignal) => backendApiClient.get<import("@/features/admin/api").PagedResult<NearbyVehicle>>("tracking/vehicles/nearby", { ...query }, { signal });
export interface Geofence { id: number; name: string | null; zoneType: string | null; centerLat: number; centerLng: number; radiusMeters: number; facilityId: number | null; isActive: boolean; createdAt: string }
export interface GeofenceEvent { id: number; vehicleId: number; rentalId: number | null; geofenceId: number; geofenceName: string | null; eventType: string | null; lat: number; lng: number; occurredAt: string }
export interface TrackingAlert { id: number; rentalId: number | null; vehicleId: number; alertType: string | null; severity: string | null; message: string | null; lat: number; lng: number; expectedLat: number | null; expectedLng: number | null; distanceMeters: number | null; isResolved: boolean; resolvedAt: string | null; resolvedBy: string | null; createdAt: string }
export interface TrackingFilters { vehicleId?: number; rentalId?: number; page: number; pageSize: number }
export async function getGeofences() {
  const zones = await backendApiClient.get<Geofence[]>("geofences");
  if (!Array.isArray(zones)) throw new Error("Dữ liệu vùng địa lý không hợp lệ.");
  return zones;
}
export const getGeofenceEvents = (query: TrackingFilters) => backendApiClient.get<import("@/features/admin/api").PagedResult<GeofenceEvent>>("geofences/events", { ...query });
export const getTrackingAlerts = (query: TrackingFilters & { isResolved?: boolean }) => backendApiClient.get<import("@/features/admin/api").PagedResult<TrackingAlert>>("tracking/alerts", { ...query });
export const resolveTrackingAlert = (id: number) => backendApiClient.post<TrackingAlert>(`tracking/alerts/${id}/resolve`);
