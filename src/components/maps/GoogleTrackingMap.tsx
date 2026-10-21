"use client";

import { useEffect, useRef, useState } from "react";
import { SkeletonBlock, Skeleton } from "@/components/ui/Skeleton";

export interface TrackingMapPoint { lat: number; lng: number; title?: string }
interface MapInstance { fitBounds: (bounds: unknown, padding?: number) => void; setCenter: (point: TrackingMapPoint) => void; setZoom: (zoom: number) => void }
interface MapsSdk {
  importLibrary: (library: string) => Promise<unknown>;
  Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance;
  LatLngBounds: new () => { extend: (point: TrackingMapPoint) => void };
  Polyline: new (options: Record<string, unknown>) => { setMap: (map: MapInstance | null) => void };
  Circle: new (options: Record<string, unknown>) => { setMap: (map: MapInstance | null) => void; getBounds: () => unknown };
  marker: { AdvancedMarkerElement: new (options: Record<string, unknown>) => { map: MapInstance | null } };
}
const valid = (point: TrackingMapPoint) => Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;
let loading: Promise<MapsSdk> | undefined;
const sdkWindow = () => window as unknown as { google?: { maps: MapsSdk } };
function loadMaps(key: string) {
  if (!loading) loading = new Promise<MapsSdk>((resolve, reject) => {
    const finish = async () => {
      try {
        const sdk = sdkWindow().google?.maps;
        if (!sdk) throw new Error("Không tải được Google Maps.");
        await Promise.all([sdk.importLibrary("maps"), sdk.importLibrary("marker")]);
        resolve(sdk);
      } catch (error) { reject(error); }
    };
    if (sdkWindow().google?.maps?.importLibrary) { void finish(); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&libraries=marker`;
    script.async = true;
    script.onload = () => void finish();
    script.onerror = () => { script.remove(); reject(new Error("Không thể kết nối Google Maps. Vui lòng thử lại.")); };
    document.head.appendChild(script);
  }).catch((error) => { loading = undefined; throw error; });
  return loading;
}
export default function GoogleTrackingMap({ title, points, path = [], zones = [] }: { title: string; points: TrackingMapPoint[]; path?: TrackingMapPoint[]; zones?: { lat: number; lng: number; radiusMeters: number; title?: string }[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;
  // Serialize coordinates so ordinary parent renders do not recreate the map.
  const coordinates = JSON.stringify({ points, path, zones });
  useEffect(() => {
    if (!key || !root.current) return;
    let cancelled = false;
    const cleanup: (() => void)[] = [];
    setStatus("loading"); setError("");
    void loadMaps(key).then((sdk) => {
      if (cancelled || !root.current) return;
      const values = JSON.parse(coordinates) as { points: TrackingMapPoint[]; path: TrackingMapPoint[]; zones: typeof zones };
      const markers = values.points.filter(valid);
      const route = values.path.filter(valid);
      const circles = values.zones.filter((zone) => valid(zone) && zone.radiusMeters > 0);
      const first = markers[0] ?? route[0] ?? circles[0];
      if (!first) { root.current.replaceChildren(); setStatus("empty"); return; }
      const map = new sdk.Map(root.current, { center: first, zoom: 14, mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID", fullscreenControl: true });
      const bounds = new sdk.LatLngBounds();
      markers.forEach((point) => {
        bounds.extend(point);
        const marker = new sdk.marker.AdvancedMarkerElement({ map, position: { lat: point.lat, lng: point.lng }, title: point.title });
        cleanup.push(() => { marker.map = null; });
      });
      route.forEach((point) => bounds.extend(point));
      if (route.length > 1) {
        const line = new sdk.Polyline({ map, path: route, strokeWeight: 4 });
        cleanup.push(() => line.setMap(null));
      }
      circles.forEach((zone) => {
        bounds.extend(zone);
        const circle = new sdk.Circle({ map, center: { lat: zone.lat, lng: zone.lng }, radius: zone.radiusMeters, strokeWeight: 2, fillOpacity: 0.12 });
        cleanup.push(() => circle.setMap(null));
        if (circles.length === 1 && markers.length === 0) map.fitBounds(circle.getBounds(), 32);
      });
      if (markers.length + route.length + circles.length > 1) map.fitBounds(bounds, 48);
      setStatus("ready");
    }).catch((failure: unknown) => {
      if (!cancelled) { setError(failure instanceof Error ? failure.message : "Không tải được Google Maps."); setStatus("error"); }
    });
    return () => { cancelled = true; cleanup.forEach((dispose) => dispose()); };
  }, [coordinates, key, attempt]);
  return <section aria-label={title} className="space-y-3">
    <h3 className="text-sm font-semibold">{title}</h3>
    {!key ? <p role="status" className="text-sm text-ink-3">Chưa cấu hình khóa Google Maps JavaScript. Danh sách tọa độ vẫn hiển thị bên dưới.</p> : <>
      <div className="relative overflow-hidden rounded-xl border border-line bg-sunken">
        <div ref={root} className="h-96 w-full" aria-label={title} aria-busy={status === "loading"} />
        {status === "loading" && <SkeletonBlock label="Đang tải bản đồ..." className="absolute inset-0 bg-surface p-6"><Skeleton className="h-full w-full" /></SkeletonBlock>}
      </div>
      {status === "error" && <p role="alert" className="text-sm text-danger">{error} <button type="button" className="underline" onClick={() => setAttempt((value) => value + 1)}>Thử lại bản đồ</button></p>}
      {status === "empty" && <p role="status" className="text-sm text-ink-3">Chưa có tọa độ hợp lệ để hiển thị.</p>}
    </>}
  </section>;
}
