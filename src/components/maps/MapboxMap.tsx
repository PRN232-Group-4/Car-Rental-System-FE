"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxInstance, Marker } from "mapbox-gl";
import { MapPin, Navigation, RefreshCw } from "lucide-react";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import { currentMapPosition, getMapboxRoute, hasMapTarget, isMapboxToken, resolveMapTarget, type Coordinates, type MapboxRoute, type MapOptions } from "./mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxMapProps extends MapOptions { title: string; className?: string; gpsPath?: { lat: number; lng: number }[] }

function MapCanvas({ serialized, token, title }: { serialized: string; token: string; title: string }) {
  const container = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [route, setRoute] = useState<MapboxRoute | null>(null);
  const [start, setStart] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const hasHistory = Boolean((JSON.parse(serialized) as Pick<MapboxMapProps, "gpsPath">).gpsPath?.length);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const controller = new AbortController();
    let map: MapboxInstance | undefined;
    const markers: Marker[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;
    let resize: ResizeObserver | undefined;
    let started = false;
    const fail = (error: unknown) => {
      if (controller.signal.aborted) return;
      clearTimeout(timer);
      setMessage(error instanceof Error ? error.message : "Không tải được bản đồ Mapbox. Vui lòng thử lại.");
      setStatus("error");
    };
    const load = async () => {
      if (started) return;
      started = true;
      timer = setTimeout(() => fail(new Error("Bản đồ tải quá lâu. Vui lòng kiểm tra kết nối và thử lại.")), 30000);
      try {
        const options: MapOptions & Pick<MapboxMapProps, "gpsPath"> = JSON.parse(serialized);
        const history: Coordinates[] = (options.gpsPath ?? []).filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180).map((point) => [point.lng, point.lat]);
        const endTarget = hasMapTarget(options.destination) ? options.destination : options.location;
        const [sdk, end, origin] = await Promise.all([
          import("mapbox-gl").then((module) => module.default),
          resolveMapTarget(endTarget, token, controller.signal),
          start ? Promise.resolve(start) : hasMapTarget(options.origin) ? resolveMapTarget(options.origin, token, controller.signal) : Promise.resolve(null),
        ]);
        const directions = origin && !history.length ? await getMapboxRoute(origin, end, token, controller.signal) : null;
        if (controller.signal.aborted) return;
        if (!sdk.supported()) throw new Error("Trình duyệt chưa hỗ trợ hiển thị bản đồ. Hãy bật WebGL hoặc thử trình duyệt khác.");
        map = new sdk.Map({ container: element, accessToken: token, style: "mapbox://styles/mapbox/streets-v12", center: end, zoom: 14, cooperativeGestures: true });
        map.addControl(new sdk.NavigationControl(), "top-right");
        const routeColor = getComputedStyle(element).getPropertyValue("--primary").trim();
        markers.push(new sdk.Marker({ color: routeColor }).setLngLat(end).addTo(map));
        if (origin) markers.push(new sdk.Marker({ color: routeColor }).setLngLat(origin).addTo(map));
        map.on("error", () => fail(new Error("Không tải được bản đồ Mapbox. Vui lòng kiểm tra kết nối hoặc thử lại.")));
        map.on("load", () => {
          if (controller.signal.aborted || !map) return;
          if (directions) {
            map.addSource("driving-route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: directions.coordinates } } });
            map.addLayer({ id: "driving-route", type: "line", source: "driving-route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": routeColor, "line-width": 5 } });
            const bounds = new sdk.LngLatBounds(end, end);
            for (const point of directions.coordinates) bounds.extend(point);
            map.fitBounds(bounds, { padding: 45, maxZoom: 15, duration: 0 });
          }
          if (history.length > 1) {
            map.addSource("gps-history", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: history } } });
            map.addLayer({ id: "gps-history", type: "line", source: "gps-history", paint: { "line-color": routeColor, "line-width": 4 } });
            const bounds = new sdk.LngLatBounds(history[0], history[0]);
            for (const point of history) bounds.extend(point);
            map.fitBounds(bounds, { padding: 45, maxZoom: 15, duration: 0 });
          }
          clearTimeout(timer);
          setRoute(directions);
          setStatus("ready");
        });
        if (typeof ResizeObserver !== "undefined") {
          resize = new ResizeObserver(() => map?.resize());
          resize.observe(element);
        }
      } catch (error) { fail(error); }
    };
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { observer?.disconnect(); void load(); }
    }, { rootMargin: "200px" }) : null;
    if (observer) observer.observe(element); else void load();
    return () => {
      controller.abort();
      observer?.disconnect();
      resize?.disconnect();
      clearTimeout(timer);
      for (const marker of markers) marker.remove();
      map?.remove();
    };
  }, [serialized, token, start, attempt]);

  async function showDirections() {
    setLocating(true);
    setMessage("");
    try {
      const point = await currentMapPosition();
      if (!alive.current) return;
      setStatus("loading"); setRoute(null); setStart(point);
    } catch (error) {
      if (alive.current) setMessage(error instanceof Error ? error.message : "Chưa lấy được vị trí hiện tại.");
    } finally { if (alive.current) setLocating(false); }
  }

  return <>
    <div className="relative min-w-0 overflow-hidden rounded border border-line bg-sunken">
      <div ref={container} role="region" aria-label={`Bản đồ Mapbox: ${title}`} aria-busy={status === "loading"} className="h-80 w-full" />
      {status === "loading" && <SkeletonBlock label="Đang tải bản đồ..." className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-4 bg-surface p-6"><Skeleton className="h-6 w-40" /><Skeleton className="h-36 w-full" /><Skeleton className="h-4 w-2/3" /></SkeletonBlock>}
    </div>
    {message && <p role="alert" className="text-sm text-danger">{message}</p>}
    <div className="flex flex-wrap gap-3">
      {!hasHistory && <button type="button" disabled={locating || status === "loading"} onClick={() => void showDirections()} className="inline-flex min-h-11 items-center gap-2 rounded border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50">
        <Navigation aria-hidden="true" className="h-4 w-4" />{locating ? "Đang lấy vị trí..." : "Chỉ đường từ vị trí hiện tại"}
      </button>}
      {status === "error" && <button type="button" onClick={() => { setMessage(""); setRoute(null); setStatus("loading"); setAttempt((value) => value + 1); }} className="inline-flex min-h-11 items-center gap-2 rounded border border-line-strong bg-surface px-4 text-sm font-semibold text-ink"><RefreshCw aria-hidden="true" className="h-4 w-4" />Thử lại bản đồ</button>}
    </div>
    {status === "ready" && route && <p role="status" className="text-sm text-ink-2">Quãng đường: {(route.distanceMeters / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km · Thời gian dự kiến: {Math.max(1, Math.ceil(route.durationSeconds / 60))} phút.</p>}
    <p className="text-xs text-ink-3">{hasHistory ? "Đường nối các vị trí GPS thực tế do máy chủ ghi nhận; có thể bị gián đoạn khi mất tín hiệu." : "Tuyến đường gợi ý từ Mapbox không phải lịch sử GPS của xe. Thời gian di chuyển là ước tính."}</p>
  </>;
}

export default function MapboxMap({ title, location, origin, destination, gpsPath, className = "" }: MapboxMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
  const serialized = JSON.stringify({ location, origin, destination, gpsPath });
  const hasLocation = hasMapTarget(destination) || hasMapTarget(location);
  return <section aria-label={title} className={`min-w-0 space-y-3 text-ink ${className}`.trim()}>
    <h3 className="flex items-center gap-2 text-sm font-semibold"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />{title}</h3>
    {!hasLocation ? <p role="status" className="rounded border border-line bg-sunken px-4 py-5 text-sm text-ink-2">Chưa có địa chỉ hoặc tọa độ để hiển thị bản đồ.</p>
      : !isMapboxToken(token) ? <p role="status" className="rounded border border-line bg-sunken px-4 py-5 text-sm text-ink-2">Bản đồ hiện chưa khả dụng. Vui lòng liên hệ chi nhánh để được hướng dẫn đường đi.</p>
        : <MapCanvas key={serialized} serialized={serialized} token={token} title={title} />}
  </section>;
}
