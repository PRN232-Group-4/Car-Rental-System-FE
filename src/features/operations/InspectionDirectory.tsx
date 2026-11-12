"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AdminFilterBar, AdminFilterButton, AdminFilterField } from "@/components/admin/AdminFilters";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { InlineInput, InlineSelect, ValidatedForm, useInlineValidation, mapValidationErrors } from "@/components/forms/inline-validation";
import { ApiClientError } from "@/api/api-client";
import { Pagination } from "@/components/ui/Pagination";
import { formatAdminDateTime } from "@/lib/date-time";
import { getInspectionDirectory, inspectionImages, type InspectionDirectoryRecord } from "./inspection-directory-api";
import { getOperationalRentals } from "./rental-list-api";
import { operationalError, rentalStatuses } from "./api";

const inspectionLabel = (type: string) => type === "pre_rental" ? "Trước thuê" : "Sau thuê";

export default function InspectionDirectory() {
  const [draft, setDraft] = useState({ rentalId: "", inspectionType: "" });
  const [filters, setFilters] = useState(draft);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<InspectionDirectoryRecord | null>(null);
  const validation = useInlineValidation();
  const query = useQuery({
    queryKey: ["inspection-directory", filters, page, pageSize],
    queryFn: ({ signal }) => getInspectionDirectory({
      rentalId: filters.rentalId ? Number(filters.rentalId) : undefined,
      inspectionType: filters.inspectionType || undefined, page, pageSize,
    }, signal), retry: false,
  });
  const backendErrors = mapValidationErrors(query.error instanceof ApiClientError ? query.error.data : null, ["rentalId", "inspectionType"]);
  const formValidation = { ...validation, errors: {
    ...(draft.rentalId === filters.rentalId && backendErrors.errors.rentalId ? { rentalId: backendErrors.errors.rentalId } : {}),
    ...(draft.inspectionType === filters.inspectionType && backendErrors.errors.inspectionType ? { inspectionType: backendErrors.errors.inspectionType } : {}),
    ...Object.fromEntries(Object.entries(validation.errors).filter(([, message]) => Boolean(message))),
  } };
  useEffect(() => {
    if (!(query.error instanceof ApiClientError)) return;
    const errors = mapValidationErrors(query.error.data, ["rentalId", "inspectionType"]).errors;
    if (errors.rentalId) document.getElementById("inspection-list-rental")?.focus();
    else if (errors.inspectionType) document.getElementById("inspection-list-type")?.focus();
  }, [query.error]);
  const apply = () => { setFilters({ ...draft }); setPage(1); setSelected(null); };
  return <section className="min-w-0 space-y-4" aria-label="Toàn bộ biên bản kiểm tra">
    <ValidatedForm validation={formValidation} onSubmit={apply}>
      <AdminFilterBar title="Biên bản đã lập" description="Hiển thị tất cả biên bản trước và sau thuê, kể cả đơn đã hoàn tất và xe đã thay thế." actions={<>
        <AdminFilterButton type="submit">Lọc biên bản</AdminFilterButton>
        <AdminFilterButton variant="secondary" onClick={() => { const empty = { rentalId: "", inspectionType: "" }; setDraft(empty); setFilters(empty); setPage(1); setSelected(null); validation.reset(); }}>Đặt lại bộ lọc</AdminFilterButton>
      </>}>
        <AdminFilterField label="Đơn thuê" htmlFor="inspection-list-rental">
          <InlineInput id="inspection-list-rental" name="rentalId" type="number" min="1" step="1" value={draft.rentalId} placeholder="Tất cả đơn thuê" onChange={(event) => setDraft({ ...draft, rentalId: event.target.value })} />
        </AdminFilterField>
        <AdminFilterField label="Loại biên bản" htmlFor="inspection-list-type" select>
          <InlineSelect id="inspection-list-type" name="inspectionType" value={draft.inspectionType} onChange={(event) => setDraft({ ...draft, inspectionType: event.target.value })}>
            <option value="">Tất cả loại kiểm tra</option><option value="pre_rental">Trước thuê</option><option value="post_rental">Sau thuê</option>
          </InlineSelect>
        </AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    {query.isError && <p role="alert" className="text-sm text-danger">{Object.keys(backendErrors.errors).length ? backendErrors.remaining.join(" ") || "Vui lòng sửa bộ lọc theo hướng dẫn." : `Không thể tải danh sách kiểm tra. ${operationalError(query.error)}`} <button type="button" className="underline" onClick={() => void query.refetch()}>Tải lại biên bản</button></p>}
    <AdminTableCard>
      <p className="py-3 text-xs text-td-muted" aria-live="polite">{query.isPending ? "Đang tải biên bản kiểm tra..." : query.isError ? "Chưa tải được biên bản" : `${query.data.totalCount} biên bản kiểm tra`}</p>
      <AdminTable className="min-w-[900px]" aria-busy={query.isFetching}>
        <caption className="sr-only">Toàn bộ biên bản kiểm tra</caption>
        <thead><tr><th>Đơn thuê</th><th>Phương tiện</th><th>Loại kiểm tra</th><th>Người kiểm tra</th><th>Kết quả</th><th>Thời gian</th><th data-actions>Chi tiết</th></tr></thead>
        <tbody>
          {query.isFetching ? <AdminTableSkeleton columns={7} label="Đang tải biên bản kiểm tra" /> : !query.isError && (query.data?.items ?? []).map((record) => <tr key={record.id}>
            <td className="font-mono">#{record.rentalId}</td>
            <td><span className="block font-semibold">{record.vehicleName || "Chưa cập nhật tên xe"}</span><span className="text-xs text-td-muted">{record.licensePlate || "Chưa có biển số"}</span></td>
            <td>{inspectionLabel(record.inspectionType)}</td>
            <td className="break-all text-xs">{record.confirmationSource === "driver_default" ? "Hệ thống · Đơn có tài xế" : record.confirmationSource === "admin_confirmation" ? `Admin xác nhận · ${record.confirmedBy || "Chưa cập nhật"}` : record.inspectorEmail || "Chưa cập nhật email"}</td>
            <td><AdminStatusBadge domain="license" status={record.isOk == null ? "pending" : record.isOk ? "approved" : "rejected"}>{record.isOk == null ? "Chưa kết luận" : record.isOk ? "Đạt" : "Không đạt"}</AdminStatusBadge></td>
            <td className="whitespace-nowrap text-xs">{formatAdminDateTime(record.inspectedAt)}</td>
            <td data-actions><AdminRowAction action="view" label={`Xem biên bản ${inspectionLabel(record.inspectionType).toLowerCase()} đơn #${record.rentalId}`} onClick={() => setSelected(record)} /></td>
          </tr>)}
          {!query.isFetching && !query.isError && !query.data?.items?.length && <AdminTableEmptyRow colSpan={7}>Chưa có biên bản kiểm tra phù hợp.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
      {!query.isError && <Pagination page={page} pageSize={pageSize} totalCount={query.data?.totalCount ?? 0} onPageChange={(next) => { setPage(next); setSelected(null); }} onPageSizeChange={(size) => { setPageSize(size); setPage(1); setSelected(null); }} pageSizeOptions={[10, 20, 50, 100]} loading={query.isFetching} itemName="biên bản" />}
    </AdminTableCard>
    {selected && <section className="space-y-4 border-t border-td-rule pt-5" aria-label="Chi tiết biên bản kiểm tra">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-td-ink">{inspectionLabel(selected.inspectionType)} · Đơn #{selected.rentalId}</h2><button type="button" onClick={() => setSelected(null)} className="text-sm text-td-oxide underline">Đóng chi tiết</button></div>
      <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-td-muted">Nguồn kiểm tra / xác nhận</dt><dd className="break-all">{selected.confirmationSource === "driver_default" ? "Hệ thống · Mặc định cho đơn có tài xế" : selected.confirmationSource === "admin_confirmation" ? `Admin xác nhận · ${selected.confirmedBy || "Chưa cập nhật"}` : selected.inspectorEmail || "Chưa cập nhật email"}</dd></div>
        <div><dt className="text-td-muted">Thời gian kiểm tra</dt><dd>{formatAdminDateTime(selected.inspectedAt)}</dd></div>
        <div><dt className="text-td-muted">Số km</dt><dd>{selected.odometerKm ?? "Chưa ghi nhận"}</dd></div>
        <div><dt className="text-td-muted">Mức nhiên liệu / pin</dt><dd>{selected.fuelBatteryLevel ?? "Chưa ghi nhận"}</dd></div>
      </dl>
      <p className="whitespace-pre-wrap break-words text-sm">{selected.damageNotes || "Không có ghi chú hư hỏng."}</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{inspectionImages(selected.imageUrls).map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer"><Image src={url} alt={`Ảnh biên bản ${inspectionLabel(selected.inspectionType).toLowerCase()} ${index + 1}`} width={320} height={220} unoptimized className="h-40 w-full rounded object-cover" /></a>)}</div>
      {!inspectionImages(selected.imageUrls).length && <p className="text-xs text-td-muted">Không có ảnh kiểm tra.</p>}
      <Link href={`/admin/inspections?rentalId=${selected.rentalId}#inspection-editor`} className="inline-block text-sm font-semibold text-td-oxide underline">Mở hồ sơ đơn #{selected.rentalId}</Link>
    </section>}
  </section>;
}

export function InspectionWorkQueue() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pre_inspection");
  const query = useQuery({ queryKey: ["inspection-work-queue", status, page], queryFn: ({ signal }) => getOperationalRentals({ status, page, pageSize: 10 }, signal), retry: false });
  return <section className="min-w-0 space-y-3" aria-label="Đơn cần kiểm tra">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="text-lg font-bold text-td-ink">Đơn cần kiểm tra</h2><p className="mt-1 text-xs text-td-muted">Chọn đơn từ danh sách để phân công và lập biên bản.</p></div>
      <label className="text-xs text-td-muted">Giai đoạn kiểm tra<InlineSelect aria-label="Giai đoạn kiểm tra" className="admin-input mt-2" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="pre_inspection">Kiểm tra trước thuê</option><option value="post_inspection">Kiểm tra sau thuê</option></InlineSelect></label>
    </div>
    {query.isError && <p role="alert" className="text-sm text-danger">Không thể tải đơn cần kiểm tra. <button type="button" className="underline" onClick={() => void query.refetch()}>Tải lại đơn cần kiểm tra</button></p>}
    <AdminTableCard><AdminTable className="min-w-[650px]" aria-busy={query.isFetching}>
      <caption className="sr-only">Đơn cần kiểm tra</caption>
      <thead><tr><th>Đơn thuê</th><th>Phương tiện</th><th>Khách hàng</th><th>Trạng thái</th><th data-actions>Mở</th></tr></thead>
      <tbody>{query.isFetching ? <AdminTableSkeleton columns={5} label="Đang tải đơn cần kiểm tra" /> : !query.isError && (query.data?.items ?? []).map((rental) => <tr key={rental.id}>
        <td className="font-mono">#{rental.id}</td><td>{rental.vehicleModel || "Chưa cập nhật tên xe"}<span className="mt-1 block text-xs text-td-muted">{rental.licensePlate || "Chưa có biển số"}</span></td>
        <td className="break-all text-xs">{rental.customerEmail || rental.customerName || "Chưa cập nhật email"}</td>
        <td><AdminStatusBadge domain="rental" status={rental.status}>{rentalStatuses[rental.status] ?? rental.status}</AdminStatusBadge></td>
        <td data-actions><AdminRowAction action="view" label={`Mở kiểm tra đơn #${rental.id}`} href={`/admin/inspections?rentalId=${rental.id}#inspection-editor`} /></td>
      </tr>)}{!query.isFetching && !query.isError && !query.data?.items?.length && <AdminTableEmptyRow colSpan={5}>Không có đơn đang chờ ở giai đoạn này.</AdminTableEmptyRow>}</tbody>
    </AdminTable>{!query.isError && <Pagination page={page} pageSize={10} totalCount={query.data?.totalCount ?? 0} onPageChange={setPage} loading={query.isFetching} itemName="đơn chờ kiểm tra" />}</AdminTableCard>
  </section>;
}
