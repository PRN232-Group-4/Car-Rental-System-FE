"use client";

import { useQuery } from "@tanstack/react-query";
import GoogleMap from "@/components/maps/GoogleMap";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import { getFacilityById } from "../api";

export default function BookingPickupMap({ facilityId }: { facilityId?: string | number | null }) {
  const id = facilityId == null ? "" : String(facilityId);
  const query = useQuery({ queryKey: ["pickup-facility", id], queryFn: () => getFacilityById(id), enabled: Boolean(id), retry: false });
  if (!id) return null;
  if (query.isPending) return <SkeletonBlock label="Đang tải điểm nhận xe..." className="space-y-3"><Skeleton className="h-4 w-36" /><Skeleton className="h-24 w-full" /></SkeletonBlock>;
  if (query.error) return <p role="status" className="text-sm text-ink-3">Chưa tải được địa chỉ điểm nhận xe. <button type="button" onClick={() => void query.refetch()} className="min-h-11 font-semibold text-primary underline">Tải lại địa chỉ</button></p>;
  const facility = query.data;
  if (!facility) return <p className="text-sm text-ink-3">Chưa có thông tin địa chỉ điểm nhận xe.</p>;
  const address = [facility.address, facility.district, facility.city].filter(Boolean).join(", ");
  return <div className="space-y-3 border-t border-line pt-4">
    <div><p className="text-sm font-semibold text-ink">{facility.name}</p>{address && <p className="mt-1 text-xs text-ink-3">{address}</p>}</div>
    <GoogleMap title="Bản đồ điểm nhận xe" location={{ address, latitude: facility.latitude, longitude: facility.longitude }} />
  </div>;
}
