"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, RefreshCw } from "lucide-react";
import MapboxMap from "@/components/maps/MapboxMap";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import { formatAdminDateTime } from "@/lib/date-time";
import { getVehiclePosition, trackingError } from "./api";

export default function VehicleTrackingPanel({ vehicleId }: { vehicleId: number }) {
  const [open, setOpen] = useState(false);
  const position = useQuery({
    queryKey: ["vehicle-position", vehicleId], queryFn: () => getVehiclePosition(vehicleId),
    enabled: open && vehicleId > 0, retry: false, staleTime: 30_000,
  });

  return <section className="space-y-4 border-t border-line pt-5" aria-label="Vị trí xe">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 font-semibold"><MapPin aria-hidden="true" className="h-4 w-4 text-primary" />Vị trí xe</h3>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="min-h-11 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold text-primary">{open ? "Ẩn vị trí xe" : "Xem vị trí xe"}</button>
    </div>
    {open && <>
      {position.isPending && <SkeletonBlock label="Đang tải vị trí xe..." className="space-y-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-64 w-full rounded-xl" /></SkeletonBlock>}
      {position.error && <p role="alert" className="text-sm text-danger">{trackingError(position.error)}</p>}
      {position.data === null && <p role="status" className="text-sm text-ink-3">Xe chưa có vị trí GPS được ghi nhận.</p>}
      {position.data && <div className="space-y-3">
        <p className="text-sm text-ink-2">Vị trí ghi nhận lúc <strong className="font-mono tabular-nums">{formatAdminDateTime(position.data.recordedAt)}</strong>. Dữ liệu được cập nhật khi thiết bị GPS gửi vị trí.</p>
        {position.data.address && <p className="text-sm text-ink-2">{position.data.address}</p>}
        {position.data.accuracyM != null && <p className="text-xs text-ink-3">Độ chính xác GPS: khoảng {Math.round(position.data.accuracyM)} m.</p>}
        <MapboxMap title="Vị trí GPS gần nhất của xe" location={{ latitude: position.data.lat, longitude: position.data.lng }} />
      </div>}
      {!position.isPending && <button type="button" disabled={position.isFetching} onClick={() => void position.refetch()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50"><RefreshCw aria-hidden="true" className="h-4 w-4" />{position.isFetching ? "Đang cập nhật..." : "Cập nhật vị trí"}</button>}
    </>}
  </section>;
}
