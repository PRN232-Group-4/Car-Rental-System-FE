"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { InlineInput, ValidatedForm, mapValidationErrors, useInlineValidation } from "@/components/forms/inline-validation";
import { ApiClientError } from "@/api/api-client";
import ResultPagination from "@/components/ui/ResultPagination";
import GoogleTrackingMap from "@/components/maps/GoogleTrackingMap";
import { getNearbyVehicles, hasGpsCoordinates, trackingError } from "./api";

const initial = { lat: "", lng: "", radiusMeters: "5000" };
export default function NearbyVehicles() {
  const { isAuthenticated } = useAuth();
  const [draft, setDraft] = useState(initial);
  const [filter, setFilter] = useState<typeof initial | null>(null);
  const [page, setPage] = useState(1);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const validation = useInlineValidation();
  const query = useQuery({ queryKey: ["nearby-vehicles", filter, page], queryFn: ({ signal }) => getNearbyVehicles({ lat: Number(filter!.lat), lng: Number(filter!.lng), radiusMeters: Number(filter!.radiusMeters), includeEta: true, page, pageSize: 20 }, signal), enabled: isAuthenticated && !!filter, retry: false });
  const mapped = mapValidationErrors(query.error instanceof ApiClientError ? query.error.data : null, Object.keys(draft));
  const backendErrors = Object.fromEntries(Object.entries(mapped.errors).filter(([field]) => draft[field as keyof typeof draft] === filter?.[field as keyof typeof draft]));
  useEffect(() => {
    if (query.error instanceof ApiClientError) {
      const fields = mapValidationErrors(query.error.data, ["lat", "lng", "radiusMeters"]).errors;
      const first = Object.keys(fields)[0];
      if (first) document.getElementById(`nearby-${first}`)?.focus();
    }
  }, [query.error]);
  const locate = () => {
    if (!navigator.geolocation) { setLocationError("Trình duyệt chưa hỗ trợ định vị. Vui lòng nhập tọa độ."); return; }
    setLocating(true); setLocationError("");
    navigator.geolocation.getCurrentPosition((position) => {
      setDraft((current) => ({ ...current, lat: String(position.coords.latitude), lng: String(position.coords.longitude) }));
      validation.clear("lat"); validation.clear("lng"); setLocating(false);
    }, () => { setLocationError("Không lấy được vị trí. Hãy cho phép truy cập vị trí hoặc nhập tọa độ thủ công."); setLocating(false); }, { timeout: 15000, enableHighAccuracy: true });
  };
  const items = query.error ? [] : query.data?.items ?? [];
  return <div className="mx-auto max-w-6xl space-y-6">
    <header><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Xe gần đây</h1><p className="mt-2 text-sm text-ink-3">Tìm xe quanh vị trí của bạn, xem khoảng cách đường đi và thời gian di chuyển do máy chủ trả về.</p></header>
    <ValidatedForm validation={{ ...validation, errors: { ...backendErrors, ...validation.errors } }} onSubmit={() => { setFilter({ ...draft }); setPage(1); }}>
      <AdminFilterBar actions={<><AdminFilterButton type="submit">Tìm xe</AdminFilterButton><AdminFilterButton variant="secondary" disabled={locating} onClick={locate}>{locating ? "Đang định vị..." : "Lấy vị trí của tôi"}</AdminFilterButton><AdminFilterButton variant="secondary" onClick={() => { setDraft(initial); setFilter(null); setPage(1); setLocationError(""); validation.reset(); }}>Đặt lại</AdminFilterButton></>}>
        <AdminFilterField label="Vĩ độ *" htmlFor="nearby-lat"><InlineInput id="nearby-lat" name="lat" type="number" step="any" min="-90" max="90" required value={draft.lat} onChange={(event) => setDraft({ ...draft, lat: event.target.value })} /></AdminFilterField>
        <AdminFilterField label="Kinh độ *" htmlFor="nearby-lng"><InlineInput id="nearby-lng" name="lng" type="number" step="any" min="-180" max="180" required value={draft.lng} onChange={(event) => setDraft({ ...draft, lng: event.target.value })} /></AdminFilterField>
        <AdminFilterField label="Bán kính (mét) *" htmlFor="nearby-radiusMeters"><InlineInput id="nearby-radiusMeters" name="radiusMeters" type="number" step="any" required value={draft.radiusMeters} onChange={(event) => setDraft({ ...draft, radiusMeters: event.target.value })} /></AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    {locationError && <p role="alert" className="text-sm text-danger">{locationError}</p>}
    {query.error && <p role="alert" className="text-sm text-danger">{mapped.remaining.join(" ") || (Object.keys(mapped.errors).length ? "Vui lòng sửa thông tin tại trường có lỗi." : trackingError(query.error))} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p>}
    {filter && !query.error && !query.isFetching && query.data && <GoogleTrackingMap title="Vị trí của bạn và các xe trong trang kết quả" points={[{ lat: Number(filter.lat), lng: Number(filter.lng), title: "Vị trí tìm kiếm" }, ...items.filter(hasGpsCoordinates).map((vehicle) => ({ lat: vehicle.lat, lng: vehicle.lng, title: [vehicle.brand, vehicle.model, vehicle.licensePlate].filter(Boolean).join(" · ") }))]} />}
    {filter && <AdminTableCard>
      <AdminTable aria-busy={query.isFetching}><caption className="sr-only">Danh sách xe gần vị trí tìm kiếm</caption><thead><tr><th scope="col">Phương tiện</th><th scope="col">Khoảng cách đường đi</th><th scope="col">ETA</th><th scope="col">Tọa độ</th><th scope="col" data-actions>Thao tác</th></tr></thead>
        <tbody>{query.isFetching ? <AdminTableSkeleton columns={5} label="Đang tìm xe gần đây..." /> : items.map((vehicle) => <tr key={vehicle.vehicleId}>
          <td><p className="font-semibold">{[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Chưa có tên xe"}</p><p className="text-xs text-ink-3">{vehicle.licensePlate}</p></td>
          <td>{vehicle.routeMeters == null ? "Chưa có khoảng cách đường đi" : `${(vehicle.routeMeters / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} km`}</td><td>{vehicle.etaSeconds == null ? "Chưa có ETA" : `${Math.ceil(vehicle.etaSeconds / 60)} phút`}</td><td className="text-xs">{vehicle.lat}, {vehicle.lng}</td>
          <td data-actions><AdminRowAction action="view" href={`/vehicles/detail?id=${vehicle.vehicleId}`} label={`Xem xe ${vehicle.brand ?? ""} ${vehicle.model ?? ""}`} /></td>
        </tr>)}{!query.isFetching && !items.length && <AdminTableEmptyRow colSpan={5}>{query.error ? "Chưa tải được danh sách xe." : "Không có xe trong bán kính tìm kiếm."}</AdminTableEmptyRow>}</tbody>
      </AdminTable>
      <ResultPagination page={query.data?.page ?? page} pageSize={query.data?.pageSize ?? 20} totalCount={query.data?.totalCount ?? 0} busy={query.isFetching || !!query.error} onPage={setPage} />
    </AdminTableCard>}
  </div>;
}
