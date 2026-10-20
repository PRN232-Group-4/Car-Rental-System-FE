"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { ApiClientError } from "@/api/api-client";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { InlineInput, InlineSelect, ValidatedForm, mapValidationErrors, useInlineValidation } from "@/components/forms/inline-validation";
import ResultPagination from "@/components/ui/ResultPagination";
import GoogleTrackingMap, { type TrackingMapPoint } from "@/components/maps/GoogleTrackingMap";
import VehicleName from "@/features/admin/VehicleName";
import { formatAdminDateTime } from "@/lib/date-time";
import { operationsButton, operationsPanel } from "@/features/operations/api";
import { getGeofences, getGeofenceEvents, getTrackingAlerts, resolveTrackingAlert, trackingError, type TrackingAlert } from "./api";

const initial = { rentalId: "", vehicleId: "", isResolved: "false" };
export default function TrackingManager() {
  const { hasAnyRole, isLoading } = useAuth();
  const allowed = hasAnyRole(["Admin", "Manager"]);
  const [draft, setDraft] = useState(initial);
  const [filter, setFilter] = useState(initial);
  const [eventPage, setEventPage] = useState(1);
  const [alertPage, setAlertPage] = useState(1);
  const [point, setPoint] = useState<TrackingMapPoint | null>(null);
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [selected, setSelected] = useState<TrackingAlert | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const cache = useQueryClient();
  const validation = useInlineValidation();
  const ids = { rentalId: filter.rentalId ? Number(filter.rentalId) : undefined, vehicleId: filter.vehicleId ? Number(filter.vehicleId) : undefined };
  const zones = useQuery({ queryKey: ["geofences"], queryFn: getGeofences, enabled: allowed, retry: false });
  const events = useQuery({ queryKey: ["geofence-events", ids, eventPage], queryFn: () => getGeofenceEvents({ ...ids, page: eventPage, pageSize: 20 }), enabled: allowed, retry: false });
  const alerts = useQuery({ queryKey: ["tracking-alerts", filter, alertPage], queryFn: () => getTrackingAlerts({ ...ids, isResolved: filter.isResolved === "" ? undefined : filter.isResolved === "true", page: alertPage, pageSize: 20 }), enabled: allowed, retry: false });
  const queryError = events.error || alerts.error;
  const mapped = mapValidationErrors(queryError instanceof ApiClientError ? queryError.data : null, Object.keys(draft));
  const backendErrors = Object.fromEntries(Object.entries(mapped.errors).filter(([field]) => draft[field as keyof typeof draft] === filter[field as keyof typeof filter]));
  useEffect(() => {
    if (queryError instanceof ApiClientError) {
      const first = Object.keys(mapValidationErrors(queryError.data, ["rentalId", "vehicleId", "isResolved"]).errors)[0];
      if (first) document.getElementById(`tracking-filter-${first}`)?.focus();
    }
  }, [queryError]);
  const resolve = async () => {
    if (!allowed || !selected || selected.isResolved || lock.current) return;
    if (!window.confirm("Xác nhận cảnh báo này đã được xử lý?")) return;
    lock.current = true; setBusy(true); setError("");
    try {
      setSelected(await resolveTrackingAlert(selected.id));
      await cache.invalidateQueries({ queryKey: ["tracking-alerts"] });
    } catch (failure) { setError(trackingError(failure)); }
    finally { lock.current = false; setBusy(false); }
  };
  if (isLoading) return <p role="status">Đang kiểm tra quyền truy cập...</p>;
  if (!allowed) return <p role="alert" className="text-sm text-danger">Chỉ Admin và Manager được xem geofence và xử lý cảnh báo.</p>;
  const zone = zones.error ? null : zones.data?.find((item) => item.id === zoneId);
  return <div className="space-y-6">
    <header><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Vùng địa lý và cảnh báo</h1><p className="mt-2 text-sm text-ink-3">Theo dõi vùng hoạt động, sự kiện ra/vào vùng và xử lý cảnh báo từ hệ thống định vị.</p></header>
    <AdminTableCard><div className="border-b border-line px-5 py-4"><h2 className="font-bold">Vùng địa lý</h2></div>
      {zones.error && <p role="alert" className="p-5 text-sm text-danger">{trackingError(zones.error)} <button type="button" className="underline" onClick={() => void zones.refetch()}>Thử lại</button></p>}
      <AdminTable aria-busy={zones.isFetching}><caption className="sr-only">Danh sách geofence</caption><thead><tr><th scope="col">Tên vùng</th><th scope="col">Loại vùng</th><th scope="col">Bán kính</th><th scope="col">Hoạt động</th><th scope="col" data-actions>Thao tác</th></tr></thead>
        <tbody>{zones.isFetching ? <AdminTableSkeleton columns={5} label="Đang tải vùng địa lý..." /> : !zones.error && zones.data?.map((item) => <tr key={item.id}><td className="font-semibold">{item.name || "Vùng chưa có tên"}</td><td>{item.zoneType || "Chưa có dữ liệu"}</td><td>{item.radiusMeters.toLocaleString("vi-VN")} m</td><td><AdminStatusBadge domain="activity" status={item.isActive ? "active" : "inactive"}>{item.isActive ? "Đang hoạt động" : "Tạm ngưng"}</AdminStatusBadge></td><td data-actions><AdminRowAction action="view" label={`Xem vùng ${item.name || "địa lý"}`} onClick={() => { setZoneId(item.id); setPoint(null); }} /></td></tr>)}{!zones.isFetching && (!zones.data?.length || zones.error) && <AdminTableEmptyRow colSpan={5}>{zones.error ? "Chưa tải được dữ liệu." : "Chưa có vùng địa lý."}</AdminTableEmptyRow>}</tbody>
      </AdminTable>
    </AdminTableCard>
    {zone && <GoogleTrackingMap title={zone.name || "Vùng địa lý"} points={[]} zones={[{ lat: zone.centerLat, lng: zone.centerLng, radiusMeters: zone.radiusMeters, title: zone.name || undefined }]} />}
    {point && <GoogleTrackingMap title={point.title || "Vị trí sự kiện"} points={[point]} />}
    <ValidatedForm validation={{ ...validation, errors: { ...backendErrors, ...validation.errors } }} onSubmit={() => { setFilter({ ...draft }); setEventPage(1); setAlertPage(1); setSelected(null); setPoint(null); setError(""); }}>
      <AdminFilterBar title="Lọc sự kiện và cảnh báo" description="Trạng thái xử lý chỉ áp dụng cho danh sách cảnh báo." actions={<><AdminFilterButton type="submit">Áp dụng</AdminFilterButton><AdminFilterButton variant="secondary" onClick={() => { setDraft(initial); setFilter(initial); setEventPage(1); setAlertPage(1); setSelected(null); setPoint(null); setError(""); validation.reset(); }}>Đặt lại</AdminFilterButton></>}>
        <AdminFilterField label="Mã yêu cầu thuê" htmlFor="tracking-filter-rentalId"><InlineInput id="tracking-filter-rentalId" name="rentalId" type="number" min="1" step="1" value={draft.rentalId} onChange={(event) => setDraft({ ...draft, rentalId: event.target.value })} /></AdminFilterField>
        <AdminFilterField label="Mã phương tiện" htmlFor="tracking-filter-vehicleId"><InlineInput id="tracking-filter-vehicleId" name="vehicleId" type="number" min="1" step="1" value={draft.vehicleId} onChange={(event) => setDraft({ ...draft, vehicleId: event.target.value })} /></AdminFilterField>
        <AdminFilterField label="Trạng thái cảnh báo" htmlFor="tracking-filter-isResolved" select><InlineSelect id="tracking-filter-isResolved" name="isResolved" value={draft.isResolved} onChange={(event) => setDraft({ ...draft, isResolved: event.target.value })}><option value="">Tất cả</option><option value="false">Chưa xử lý</option><option value="true">Đã xử lý</option></InlineSelect></AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    <AdminTableCard><div className="border-b border-line px-5 py-4"><h2 className="font-bold">Sự kiện vùng địa lý</h2></div>
      {events.error && <p role="alert" className="p-5 text-sm text-danger">{trackingError(events.error)} <button type="button" className="underline" onClick={() => void events.refetch()}>Thử lại</button></p>}
      <AdminTable aria-busy={events.isFetching}><caption className="sr-only">Sự kiện geofence</caption><thead><tr><th scope="col">Phương tiện</th><th scope="col">Vùng</th><th scope="col">Sự kiện</th><th scope="col">Thời gian</th><th scope="col" data-actions>Thao tác</th></tr></thead>
        <tbody>{events.isFetching ? <AdminTableSkeleton columns={5} label="Đang tải sự kiện..." /> : !events.error && events.data?.items?.map((event) => <tr key={event.id}><td><VehicleName vehicleId={event.vehicleId} /></td><td>{event.geofenceName || "Vùng chưa có tên"}</td><td>{event.eventType || "Chưa có dữ liệu"}</td><td>{formatAdminDateTime(event.occurredAt)}</td><td data-actions><AdminRowAction action="view" label="Xem vị trí sự kiện" onClick={() => { setZoneId(null); setPoint({ lat: event.lat, lng: event.lng, title: event.geofenceName || "Vị trí sự kiện" }); }} /></td></tr>)}{!events.isFetching && (!events.data?.items?.length || events.error) && <AdminTableEmptyRow colSpan={5}>{events.error ? "Chưa tải được dữ liệu." : "Không có sự kiện phù hợp."}</AdminTableEmptyRow>}</tbody>
      </AdminTable><ResultPagination page={events.data?.page ?? eventPage} pageSize={events.data?.pageSize ?? 20} totalCount={events.data?.totalCount ?? 0} busy={events.isFetching || !!events.error} onPage={setEventPage} />
    </AdminTableCard>
    <AdminTableCard><div className="border-b border-line px-5 py-4"><h2 className="font-bold">Cảnh báo định vị</h2></div>
      {alerts.error && <p role="alert" className="p-5 text-sm text-danger">{trackingError(alerts.error)} <button type="button" className="underline" onClick={() => void alerts.refetch()}>Thử lại</button></p>}
      <AdminTable aria-busy={alerts.isFetching}><caption className="sr-only">Danh sách cảnh báo định vị</caption><thead><tr><th scope="col">Phương tiện</th><th scope="col">Cảnh báo</th><th scope="col">Mức độ</th><th scope="col">Thời gian</th><th scope="col">Xử lý</th><th scope="col" data-actions>Thao tác</th></tr></thead>
        <tbody>{alerts.isFetching ? <AdminTableSkeleton columns={6} label="Đang tải cảnh báo..." /> : !alerts.error && alerts.data?.items?.map((alert) => <tr key={alert.id}><td><VehicleName vehicleId={alert.vehicleId} /></td><td><p>{alert.alertType}</p><p className="text-xs text-ink-3">{alert.message}</p></td><td>{alert.severity || "Chưa có dữ liệu"}</td><td>{formatAdminDateTime(alert.createdAt)}</td><td>{alert.isResolved ? "Đã xử lý" : "Chưa xử lý"}</td><td data-actions><AdminRowAction action="view" disabled={busy} label="Xem và xử lý cảnh báo" onClick={() => { setSelected(alert); setZoneId(null); setPoint({ lat: alert.lat, lng: alert.lng, title: alert.message || "Vị trí cảnh báo" }); setError(""); }} /></td></tr>)}{!alerts.isFetching && (!alerts.data?.items?.length || alerts.error) && <AdminTableEmptyRow colSpan={6}>{alerts.error ? "Chưa tải được dữ liệu." : "Không có cảnh báo phù hợp."}</AdminTableEmptyRow>}</tbody>
      </AdminTable><ResultPagination page={alerts.data?.page ?? alertPage} pageSize={alerts.data?.pageSize ?? 20} totalCount={alerts.data?.totalCount ?? 0} busy={alerts.isFetching || !!alerts.error || busy} onPage={(page) => { setAlertPage(page); setSelected(null); }} />
    </AdminTableCard>
    {selected && <section className={operationsPanel}><h2 className="text-lg font-bold">Chi tiết cảnh báo</h2><p>{selected.message || selected.alertType}</p>{selected.rentalId && <p className="text-sm">Mã yêu cầu thuê: #{selected.rentalId}</p>}<p className="text-sm text-ink-3">Vị trí: {selected.lat}, {selected.lng} · {formatAdminDateTime(selected.createdAt)}</p>{selected.distanceMeters != null && <p className="text-sm">Khoảng cách: {selected.distanceMeters.toLocaleString("vi-VN")} m</p>}{selected.isResolved ? <p role="status" className="text-sm text-success">Đã xử lý · {formatAdminDateTime(selected.resolvedAt)}{selected.resolvedBy ? ` · ${selected.resolvedBy}` : ""}</p> : <button type="button" className={operationsButton} disabled={busy || !!alerts.error} onClick={() => void resolve()}>{busy ? "Đang ghi nhận..." : "Xác nhận đã xử lý cảnh báo"}</button>}{error && <p role="alert" className="text-sm text-danger">{error}</p>}</section>}
  </div>;
}
