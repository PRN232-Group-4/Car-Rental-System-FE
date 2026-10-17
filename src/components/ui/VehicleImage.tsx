"use client";

import { useState } from "react";
import { CarFront } from "lucide-react";
import { vehicleImageSource } from "./vehicle-image-source";
import { Skeleton } from "./Skeleton";

type VehicleImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
};

export default function VehicleImage(props: VehicleImageProps) {
  const source = vehicleImageSource(props.src);
  // A changed URL starts a fresh load even if the previous image failed.
  return <VehicleImageContent key={source ?? "missing"} {...props} src={source} />;
}

function VehicleImageContent({ src, alt, className = "h-12 w-[68px] rounded-lg", imageClassName = "", loading = "lazy" }: VehicleImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return <span className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-sunken text-ink-3 ${className}`} data-vehicle-image>
    {src && !failed ? <>
      {!loaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
      {(
      // Media storage domains are configured by the deployment, so use the original URL.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} loading={loading} decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className={`h-full w-full object-cover ${imageClassName}`} />
      )}
    </> : (
      <span role="img" aria-label={`${failed ? "Không tải được ảnh" : "Chưa có ảnh"}: ${alt}`} className="flex h-full w-full items-center justify-center" data-vehicle-image-fallback>
        <CarFront aria-hidden="true" className="h-7 w-7" />
      </span>
    )}
  </span>;
}
