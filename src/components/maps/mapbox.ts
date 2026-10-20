export interface MapLocation {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  name?: string | null;
  placeId?: string | null;
}

export type MapTarget = MapLocation | string | null;
export type Coordinates = [longitude: number, latitude: number];
export interface MapOptions { location?: MapTarget; origin?: MapTarget; destination?: MapTarget }
export interface MapboxRoute { coordinates: Coordinates[]; distanceMeters: number; durationSeconds: number }

export function mapCoordinates(target?: MapTarget): Coordinates | null {
  if (!target || typeof target === "string") return null;
  const { latitude, longitude } = target;
  return typeof latitude === "number" && Number.isFinite(latitude) && Math.abs(latitude) <= 90
    && typeof longitude === "number" && Number.isFinite(longitude) && Math.abs(longitude) <= 180
    ? [longitude, latitude] : null;
}

export function mapAddress(target?: MapTarget): string | null {
  return (typeof target === "string" ? target : target?.address)?.trim() || null;
}

export function hasMapTarget(target?: MapTarget): boolean {
  return !!(mapCoordinates(target) || mapAddress(target));
}

export function isMapboxToken(token?: string): token is string {
  return !!token?.trim().startsWith("pk.");
}

async function mapboxRequest(path: string, token: string, signal: AbortSignal) {
  const url = new URL(path, "https://api.mapbox.com/");
  url.searchParams.set("access_token", token.trim());
  try {
    const response = await fetch(url, { signal, cache: "no-store" });
    if (!response.ok) throw new Error();
    return await response.json();
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("Không tải được dữ liệu Mapbox. Vui lòng thử lại.");
  }
}

/** Prefer actual API coordinates; Google place IDs must never be sent to Mapbox. */
export async function resolveMapTarget(target: MapTarget | undefined, token: string, signal: AbortSignal): Promise<Coordinates> {
  const coordinates = mapCoordinates(target);
  if (coordinates) return coordinates;
  const address = mapAddress(target);
  if (!address) throw new Error("Chưa có địa chỉ hoặc tọa độ để hiển thị bản đồ.");
  const query = new URLSearchParams({ q: address, limit: "1", autocomplete: "false", language: "vi", country: "vn" });
  const data = await mapboxRequest(`search/geocode/v6/forward?${query}`, token, signal);
  const point = data.features?.[0]?.geometry?.coordinates;
  if (!Array.isArray(point) || !mapCoordinates({ longitude: point[0], latitude: point[1] }))
    throw new Error("Không tìm thấy vị trí của địa chỉ này trên Mapbox.");
  return [point[0], point[1]];
}

export async function getMapboxRoute(origin: Coordinates, destination: Coordinates, token: string, signal: AbortSignal): Promise<MapboxRoute> {
  const data = await mapboxRequest(`directions/v5/mapbox/driving/${origin.join(",")};${destination.join(",")}?geometries=geojson&overview=full&steps=false`, token, signal);
  const route = data.routes?.[0];
  if (data.code !== "Ok" || !route || !Number.isFinite(route.distance) || route.distance < 0 || !Number.isFinite(route.duration) || route.duration < 0
    || !Array.isArray(route.geometry?.coordinates) || route.geometry.coordinates.length < 2
    || !route.geometry.coordinates.every((p: unknown) => Array.isArray(p) && !!mapCoordinates({ longitude: p[0], latitude: p[1] })))
    throw new Error("Không tìm thấy tuyến đường giữa hai vị trí trên Mapbox.");
  return { coordinates: route.geometry.coordinates, distanceMeters: route.distance, durationSeconds: route.duration };
}

export function currentMapPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Trình duyệt chưa hỗ trợ định vị vị trí hiện tại."));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve([coords.longitude, coords.latitude]),
      () => reject(new Error("Chưa lấy được vị trí hiện tại. Hãy cho phép truy cập vị trí rồi thử lại.")),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });
}
