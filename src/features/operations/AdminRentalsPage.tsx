"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdminFilterBar, AdminFilterButton, AdminFilterField } from "@/components/admin/AdminFilters";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { InlineSelect, ValidatedForm, mapValidationErrors, useInlineValidation } from "@/components/forms/inline-validation";
import { ApiClientError } from "@/api/api-client";
import VehicleName from "@/features/admin/VehicleName";
import { formatAdminDateTime } from "@/lib/date-time";
import RentalOperations from "./RentalOperations";
import { rentalStatuses } from "./api";
import { getOperationalRentals } from "./rental-list-api";

const pageButtonClass = "inline-flex h-10 w-10 items-center justify-center rounded-control border border-line bg-surface text-ink-2 hover:bg-sunken disabled:opacity-40";

export default function AdminRentalsPage() {
  const params = useSearchParams();
  const rentalId = params.get("rentalId") ?? "";
  const [status, setStatus] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const validation = useInlineValidation();
  const query = useQuery({
    queryKey: ["admin-rentals", appliedStatus, page, pageSize],
    queryFn: ({ signal }) => getOperationalRentals({ status: appliedStatus || undefined, page, pageSize }, signal),
    retry: false,
  });
  const items = query.data?.items ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const backendValidation = mapValidationErrors(query.error instanceof ApiClientError ? query.error.data : null, ["status"]);
  const statusError = status === appliedStatus ? backendValidation.errors.status : undefined;
  const filterValidation = { ...validation, errors: { ...(statusError ? { status: statusError } : {}), ...validation.errors } };
  useEffect(() => {
    if (query.error instanceof ApiClientError && mapValidationErrors(query.error.data, ["status"]).errors.status) {
      document.getElementById("admin-rental-status")?.focus();
    }
  }, [query.error]);
  const error = backendValidation.remaining.join(" ") || (Object.keys(backendValidation.errors).length ? "" : query.error instanceof ApiClientError && query.error.status === 403
    ? "Tài khoản không có quyền xem danh sách đơn thuê."
    : "Không thể tải danh sách đơn thuê. Vui lòng thử lại.");

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Đơn thuê xe</h1><p className="mt-2 text-sm text-ink-3">Tất cả yêu cầu đặt xe và đơn thuê chính thức. Chọn biểu tượng xem để mở chi tiết và vận hành.</p></div>
    <ValidatedForm validation={filterValidation} onSubmit={() => { setAppliedStatus(status); setPage(1); }}>
      <AdminFilterBar title="Lọc đơn thuê" actions={<>
        <AdminFilterButton type="submit">Lọc danh sách</AdminFilterButton>
        <AdminFilterButton variant="secondary" disabled={!status && !appliedStatus} onClick={() => { setStatus(""); setAppliedStatus(""); setPage(1); validation.reset(); }}>Đặt lại</AdminFilterButton>
      </>}>
        <AdminFilterField label="Trạng thái đơn thuê" htmlFor="admin-rental-status" select>
          <InlineSelect id="admin-rental-status" name="status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(rentalStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</InlineSelect>
        </AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    {query.error && error && <p role="alert" className="text-sm text-danger">{error} <button type="button" className="font-semibold underline" onClick={() => void query.refetch()}>Thử lại</button></p>}
    <AdminTableCard>
      <div className="border-b border-line px-5 py-4"><h2 className="font-bold text-ink">Danh sách đơn thuê</h2><p aria-live="polite" className="mt-1 text-xs text-ink-3">{query.isPending ? "Đang tải đơn thuê..." : query.error ? "Chưa tải được danh sách" : `${totalCount.toLocaleString("vi-VN")} yêu cầu / đơn thuê`}</p></div>
      <AdminTable className="min-w-[1100px]" aria-busy={query.isFetching}>
        <caption className="sr-only">Tất cả yêu cầu đặt xe và đơn thuê chính thức</caption>
        <thead><tr>{["Mã yêu cầu / đơn", "Khách hàng", "Phương tiện", "Thời gian thuê", "Hình thức lái", "Tổng tiền", "Trạng thái"].map((label) => <th key={label} scope="col">{label}</th>)}<th scope="col" data-actions>Xem chi tiết</th></tr></thead>
        <tbody>
          {query.isFetching ? <AdminTableSkeleton columns={8} label="Đang tải danh sách đơn thuê" /> : !query.error && items.map((rental) => <tr key={rental.id}>
            <td className="whitespace-nowrap text-sm"><p className="font-semibold">Yêu cầu #{rental.id}</p>{rental.orderId && <p className="mt-1 text-xs text-ink-3">Đơn #{rental.orderId}</p>}</td>
            <td><p className="font-semibold text-ink">{rental.customerName?.trim() || rental.customerEmail || "Chưa có tên khách hàng"}</p><p className="mt-1 text-xs text-ink-3">{rental.customerEmail}</p></td>
            <td><VehicleName vehicleId={rental.vehicleId} /></td>
            <td className="whitespace-nowrap text-xs tabular-nums"><p>Nhận: {formatAdminDateTime(rental.startTime)}</p><p className="mt-1 text-ink-3">Trả: {formatAdminDateTime(rental.endTime)}</p></td>
            <td><p>{rental.hasDriver ? "Có tài xế" : "Tự lái"}</p>{rental.hasDriver && <p className="mt-1 text-xs text-ink-3">{rental.driverName?.trim() || "Chưa phân công tài xế"}</p>}</td>
            <td className="whitespace-nowrap font-mono tabular-nums">{rental.totalPrice.toLocaleString("vi-VN")} đ</td>
            <td><AdminStatusBadge domain="rental" status={rental.status}>{rentalStatuses[rental.status] ?? "Chưa xác định"}</AdminStatusBadge><p className="mt-2 text-xs text-ink-3">{rental.orderId ? "Đơn thuê chính thức" : "Yêu cầu đặt xe"}</p></td>
            <td data-actions><AdminRowAction action="view" href={`/admin/rentals?rentalId=${rental.id}#rental-detail`} label={`Xem chi tiết đơn thuê của ${rental.customerName?.trim() || rental.customerEmail || "khách hàng"}`} /></td>
          </tr>)}
          {!query.isFetching && !query.error && !items.length && <AdminTableEmptyRow colSpan={8}>Không có đơn thuê phù hợp. Hãy thử đặt lại bộ lọc.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
      <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-wrap items-center gap-3 text-xs text-ink-3">Số đơn thuê mỗi trang<select aria-label="Số đơn thuê mỗi trang" className="h-10 rounded-control border border-line-strong bg-surface px-3 text-sm text-ink" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>{[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
        <nav aria-label="Phân trang đơn thuê" className="flex items-center gap-3"><span className="text-xs text-ink-3">Trang {page} / {pageCount}</span><button type="button" aria-label="Trang trước" disabled={page <= 1 || query.isFetching} onClick={() => setPage((current) => current - 1)} className={pageButtonClass}><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button><button type="button" aria-label="Trang sau" disabled={page >= pageCount || query.isFetching || !!query.error} onClick={() => setPage((current) => current + 1)} className={pageButtonClass}><ChevronRight aria-hidden="true" className="h-4 w-4" /></button></nav>
      </div>
    </AdminTableCard>
    {/^[1-9]\d*$/.test(rentalId) && <div id="rental-detail" className="scroll-mt-24"><RentalOperations key={rentalId} /></div>}
  </div>;
}
