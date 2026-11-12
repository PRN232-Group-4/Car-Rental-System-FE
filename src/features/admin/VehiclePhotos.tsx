"use client";

import { useQuery } from "@tanstack/react-query";
import VehicleImage from "@/components/ui/VehicleImage";
import { vehicleImageSource } from "@/components/ui/vehicle-image-source";
import { Skeleton } from "@/components/ui/Skeleton";
import { getOperationalRental } from "@/features/operations/api";
import type { VehicleDto } from "./api";
import { vehicleQueryOptions } from "./vehicle-query";

/** Vehicle photos are separate from inspection and incident evidence. */
export function VehiclePhotoGrid({ vehicle }: { vehicle: Pick<VehicleDto, "brand" | "model" | "licensePlate" | "mainImageUrl" | "detail"> }) {
  const name = [vehicle.brand, vehicle.model, vehicle.licensePlate].filter(Boolean).join(" · ") || "Phương tiện";
  const photos = [...new Set([vehicle.mainImageUrl, ...(vehicle.detail?.galleryImages ?? [])]
    .map(vehicleImageSource).filter((source): source is string => Boolean(source)))];

  return <section aria-label="Ảnh phương tiện" className="min-w-0 space-y-3">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-xs font-bold text-td-muted">Ảnh phương tiện</h3>
      {photos.length > 0 && <span className="text-[10px] text-td-muted">{photos.length} ảnh · Bấm để xem ảnh gốc</span>}
    </div>
    {photos.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {photos.map((source, index) => <a
        key={source}
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Mở ảnh ${index + 1} của ${name} (tab mới)`}
        className={`${index === 0 ? "col-span-2 sm:col-span-3" : ""} block min-w-0 overflow-hidden rounded border border-td-rule focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-td-oxide`}
      >
        <VehicleImage src={source} alt={`${name} · ${index === 0 ? "Ảnh chính" : `Ảnh ${index + 1}`}`} className={`w-full ${index === 0 ? "aspect-video" : "aspect-[4/3]"}`} />
      </a>)}
    </div> : <p className="text-xs text-td-muted">Phương tiện chưa có hình ảnh.</p>}
  </section>;
}

function PhotoLoading() {
  return <div role="status" aria-label="Đang tải ảnh phương tiện" aria-busy="true" className="space-y-2">
    <span className="sr-only">Đang tải ảnh phương tiện</span>
    <Skeleton className="aspect-video w-full rounded" />
  </div>;
}

function PhotoError({ retry }: { retry: () => void }) {
  return <div role="alert" className="space-y-2 text-xs text-td-muted">
    <p>Không tải được ảnh phương tiện.</p>
    <button type="button" onClick={retry} className="font-semibold text-td-oxide underline">Tải lại ảnh phương tiện</button>
  </div>;
}

export default function VehiclePhotos({ vehicleId }: { vehicleId: number | string }) {
  const id = Number(vehicleId);
  const query = useQuery(vehicleQueryOptions(id));
  if (!Number.isSafeInteger(id) || id <= 0) return <p className="text-xs text-td-muted">Chưa có phương tiện liên kết.</p>;
  if (query.isPending) return <PhotoLoading />;
  if (query.isError) return <PhotoError retry={() => void query.refetch()} />;
  return <VehiclePhotoGrid vehicle={query.data} />;
}

/** Resolve the vehicle through the rental when the context only supplies a rental ID. */
export function RentalVehiclePhotos({ rentalId }: { rentalId: number | string }) {
  const id = Number(rentalId);
  const query = useQuery({
    queryKey: ["operational-rental", String(rentalId)],
    queryFn: () => getOperationalRental(id),
    enabled: Number.isSafeInteger(id) && id > 0,
    staleTime: 60_000,
    retry: false,
  });
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  if (query.isPending) return <PhotoLoading />;
  if (query.isError) return <PhotoError retry={() => void query.refetch()} />;
  return <VehiclePhotos vehicleId={query.data.vehicleId} />;
}
