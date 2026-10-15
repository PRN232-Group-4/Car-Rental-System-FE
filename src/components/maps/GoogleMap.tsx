"use client";

import { useState } from "react";
import { ExternalLink, MapPin, Navigation, RefreshCw } from "lucide-react";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import { buildGoogleMapsDirectionsUrl, buildGoogleMapsEmbedUrl, type MapTarget } from "./google-maps";

interface GoogleMapProps {
  title: string;
  location?: MapTarget;
  origin?: MapTarget;
  destination?: MapTarget;
  className?: string;
}

function MapFrame({ src, title }: { src: string; title: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  return <div className="relative min-h-[240px] overflow-hidden rounded-xl border border-line bg-sunken">
    {status !== "error" && <iframe
      key={attempt}
      title={title}
      src={src}
      width="100%"
      height="320"
      className="block h-80 w-full min-w-[200px] border-0"
      loading="lazy"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      aria-busy={status === "loading"}
      onLoad={() => setStatus("ready")}
      onError={() => setStatus("error")}
    />}
    {status === "loading" && <SkeletonBlock label="Đang tải bản đồ..." className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-4 bg-surface p-6">
      <Skeleton className="h-6 w-40" /><Skeleton className="h-36 w-full" /><Skeleton className="h-4 w-2/3" />
    </SkeletonBlock>}
    {status === "error" && <div role="status" className="flex min-h-60 flex-col items-center justify-center gap-3 p-5 text-center text-sm text-ink-2">
      <MapPin aria-hidden="true" className="h-7 w-7 text-ink-3" />
      <p>Không thể tải bản đồ. Bạn có thể thử lại hoặc mở Google Maps bên dưới.</p>
      <button type="button" onClick={() => { setAttempt((value) => value + 1); setStatus("loading"); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-primary">
        <RefreshCw aria-hidden="true" className="h-4 w-4" /> Thử lại bản đồ
      </button>
    </div>}
  </div>;
}

export default function GoogleMap({ title, location, origin, destination, className = "" }: GoogleMapProps) {
  const options = { location, origin, destination };
  const src = buildGoogleMapsEmbedUrl({ ...options, apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY });
  const directions = buildGoogleMapsDirectionsUrl(options);
  return <section aria-label={title} className={`min-w-0 space-y-3 text-ink ${className}`.trim()}>
    <h3 className="flex items-center gap-2 text-sm font-semibold"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />{title}</h3>
    {src ? <MapFrame key={src} src={src} title={title} /> : <p role="status" className="rounded-xl border border-line bg-sunken px-4 py-5 text-sm text-ink-2">
      {directions ? "Bản đồ nhúng hiện chưa khả dụng. Bạn vẫn có thể xem vị trí và chỉ đường trên Google Maps." : "Chưa có địa chỉ hoặc tọa độ để hiển thị bản đồ."}
    </p>}
    {directions && <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-primary transition hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      <Navigation aria-hidden="true" className="h-4 w-4" /> Chỉ đường trên Google Maps <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" /><span className="sr-only"> (mở trong thẻ mới)</span>
    </a>}
    {src && <p className="text-xs text-ink-3">Nếu bản đồ không hiển thị, hãy dùng liên kết chỉ đường để mở Google Maps.</p>}
  </section>;
}
