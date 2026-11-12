"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MapboxMap from "@/components/maps/MapboxMap";
import { AdminTable, AdminTableCard } from "@/components/admin/AdminTable";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import { formatAdminDateTime } from "@/lib/date-time";
import { getRentalRoute, hasGpsCoordinates, trackingError } from "./api";

const pageSize = 10;

export default function RentalTrackingPanel({ rentalId }: { rentalId: number | string }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const route = useQuery({
    queryKey: ["rental-route", rentalId], queryFn: () => getRentalRoute(rentalId),
    enabled: open && /^[1-9]\d*$/.test(String(rentalId)), retry: false, staleTime: 30_000,
  });
  const points = (route.data?.routePoints ?? []).filter(hasGpsCoordinates);
  const last = points.at(-1) ?? route.data?.endPosition;
  const pages = Math.max(1, Math.ceil(points.length / pageSize));
  const currentPage = Math.min(page, pages);
  const mapLocation = hasGpsCoordinates(last) && last ? { latitude: last.lat, longitude: last.lng } : null;

  return <section className="space-y-4 rounded border border-line bg-surface p-5 sm:p-6" aria-label="Hành trình GPS của đơn thuê">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-bold">Hành trình GPS</h2><p className="mt-1 text-sm text-ink-3">Tra cứu các vị trí thiết bị đã ghi nhận trong thời gian thuê.</p></div>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="min-h-11 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold text-primary">{open ? "Ẩn hành trình" : "Xem hành trình"}</button>
    </div>
    {open && <>
      {route.isPending && <SkeletonBlock label="Đang tải hành trình GPS..." className="space-y-3"><Skeleton className="h-5 w-56" /><Skeleton className="h-64 w-full rounded-xl" /></SkeletonBlock>}
      {route.error && <p role="alert" className="text-sm text-danger">{trackingError(route.error)}</p>}
      {route.data && !route.error && <>
        {!mapLocation ? <p role="status" className="text-sm text-ink-3">Chưa có dữ liệu GPS cho khoảng thời gian thuê này.</p> : <>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-ink-3">Điểm GPS hợp lệ</dt><dd className="font-mono tabular-nums">{points.length}</dd></div>
            <div><dt className="text-ink-3">Quãng đường nối các điểm GPS</dt><dd className="font-mono tabular-nums">{(route.data.totalDistanceMeters / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} km</dd></div>
            <div><dt className="text-ink-3">Thời gian giữa điểm đầu / cuối</dt><dd className="font-mono tabular-nums">{Math.round(route.data.durationSeconds / 60).toLocaleString("vi-VN")} phút</dd></div>
          </dl>
          <p className="text-sm text-ink-3">Điểm GPS cuối cùng ghi nhận lúc {formatAdminDateTime(last?.recordedAt)}. Lịch sử bên dưới giữ các điểm ghi nhận; quãng đường có thể thiếu khi mất tín hiệu GPS.</p>
          <MapboxMap title="Hành trình GPS của đơn thuê" location={mapLocation} gpsPath={points} />
          <AdminTableCard>
            <AdminTable aria-label="Lịch sử điểm GPS">
              <thead><tr><th scope="col">Ghi nhận lúc</th><th scope="col">Vĩ độ</th><th scope="col">Kinh độ</th><th scope="col">Tốc độ</th></tr></thead>
              <tbody>{points.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((point, index) => <tr key={`${point.recordedAt}-${index}`}><td className="font-mono tabular-nums">{formatAdminDateTime(point.recordedAt)}</td><td className="font-mono tabular-nums">{point.lat.toFixed(5)}</td><td className="font-mono tabular-nums">{point.lng.toFixed(5)}</td><td>{point.speedKmh == null ? "—" : `${Math.round(point.speedKmh)} km/h`}</td></tr>)}</tbody>
            </AdminTable>
          </AdminTableCard>
          {pages > 1 && <nav aria-label="Phân trang lịch sử GPS" className="flex flex-wrap items-center justify-end gap-3 text-sm"><button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="min-h-11 rounded border border-line-strong px-3 disabled:opacity-50">Trang trước</button><span>Trang {currentPage}/{pages}</span><button type="button" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)} className="min-h-11 rounded-lg border border-line-strong px-3 disabled:opacity-50">Trang sau</button></nav>}
        </>}
      </>}
      {!route.isPending && <button type="button" disabled={route.isFetching} onClick={() => void route.refetch()} className="min-h-11 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50">{route.isFetching ? "Đang cập nhật..." : "Cập nhật hành trình"}</button>}
    </>}
  </section>;
}
