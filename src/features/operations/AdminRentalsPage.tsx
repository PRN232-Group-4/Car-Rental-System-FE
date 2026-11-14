"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { AdminFilterBar, AdminFilterButton, AdminFilterField } from "@/components/admin/AdminFilters";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import RentalOperationalBadge from "./RentalOperationalBadge";
import RentalIdentifiers from "./RentalIdentifiers";
import { InlineInput, InlineSelect, ValidatedForm, mapValidationErrors, useInlineValidation } from "@/components/forms/inline-validation";
import { ApiClientError } from "@/api/api-client";
import ResultPagination from "@/components/ui/ResultPagination";
import VehicleName from "@/features/admin/VehicleName";
import { formatAdminDateTime } from "@/lib/date-time";
import RentalOperations from "./RentalOperations";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import HandoverPanel from "./HandoverPanel";
import { operationalError, rentalStatuses } from "./api";
import { getOperationalRentals } from "./rental-list-api";
import { getHandovers } from "./handover-api";

export default function AdminRentalsPage({ handovers = false }: { handovers?: boolean }) {
  const params = useSearchParams();
  const rentalId = params.get("rentalId") ?? "";
  const { hasAnyRole, isLoading } = useAuth();
  const allowed = hasAnyRole(["Staff", "CustomerService", "Manager"]);
  const initial = { status: handovers ? "pending" : "", customerId: "", vehicleId: "", from: "", to: "" };
  const [draft, setDraft] = useState(initial);
  const [filter, setFilter] = useState(initial);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const validation = useInlineValidation();
  const query = useQuery({
    queryKey: [handovers ? "handovers" : "admin-rentals", filter, page, pageSize],
    queryFn: async ({ signal }) => {
      const request = { status: filter.status || undefined, customerId: filter.customerId ? Number(filter.customerId) : undefined, vehicleId: filter.vehicleId ? Number(filter.vehicleId) : undefined, from: filter.from ? new Date(filter.from).toISOString() : undefined, to: filter.to ? new Date(filter.to).toISOString() : undefined, page, pageSize };
      if (!handovers) return getOperationalRentals(request, signal);
      const result = await getHandovers(request, signal);
      return { ...result, items: (result.items ?? []).map((item) => item.rental) };
    }, enabled: allowed, retry: false, refetchInterval: 30000,
  });
  const mapped = mapValidationErrors(query.error instanceof ApiClientError ? query.error.data : null, Object.keys(draft));
  useEffect(() => {
    if (query.error instanceof ApiClientError) {
      const first = Object.keys(mapValidationErrors(query.error.data, ["status", "customerId", "vehicleId", "from", "to"]).errors)[0];
      const ids: Record<string, string> = { status: "status", customerId: "customer", vehicleId: "vehicle", from: "from", to: "to" };
      if (first) document.getElementById(`rental-filter-${ids[first]}`)?.focus();
    }
  }, [query.error]);
  const filterErrors = Object.fromEntries(Object.entries(mapped.errors).filter(([key]) => draft[key as keyof typeof draft] === filter[key as keyof typeof filter]));
  const items = query.error ? [] : [...(query.data?.items ?? [])].sort((left, right) => right.id - left.id);
  if (isLoading) return <p role="status">Đang kiểm tra quyền truy cập...</p>;
  if (!allowed) return <p role="alert" className="text-sm text-danger">Bạn không có quyền xem danh sách này.</p>;
  return <div className="space-y-6">
    <TransitFolio title={handovers ? "Bàn giao xe" : "Danh sách yêu cầu và đơn thuê"} description="Mã yêu cầu dùng để tra cứu và thao tác; mã đơn chính thức xuất hiện sau thanh toán hoặc sau duyệt với gói trả trước." />
    <ValidatedForm validation={{ ...validation, errors: { ...filterErrors, ...validation.errors } }} validate={() => draft.from && draft.to && new Date(draft.to) < new Date(draft.from) ? { to: "Ngày kết thúc phải từ ngày bắt đầu trở đi." } : {}} onSubmit={() => { setFilter({ ...draft }); setPage(1); }}>
      <AdminFilterBar title="Lọc danh sách" actions={<><AdminFilterButton type="submit">Áp dụng</AdminFilterButton><AdminFilterButton variant="secondary" onClick={() => { setDraft(initial); setFilter(initial); setPage(1); validation.reset(); }}>Đặt lại</AdminFilterButton></>}>
        <AdminFilterField label="Trạng thái" htmlFor="rental-filter-status" select><InlineSelect id="rental-filter-status" name="status" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>{handovers ? <><option value="pending">Chờ bàn giao</option><option value="completed">Đã bàn giao</option><option value="all">Tất cả</option></> : <><option value="">Tất cả</option>{Object.entries(rentalStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</>}</InlineSelect></AdminFilterField>
        <AdminFilterField label="Mã khách hàng" htmlFor="rental-filter-customer"><InlineInput id="rental-filter-customer" name="customerId" type="number" min="1" step="1" value={draft.customerId} onChange={(event) => setDraft({ ...draft, customerId: event.target.value })} /></AdminFilterField>
        <AdminFilterField label="Mã phương tiện" htmlFor="rental-filter-vehicle"><InlineInput id="rental-filter-vehicle" name="vehicleId" type="number" min="1" step="1" value={draft.vehicleId} onChange={(event) => setDraft({ ...draft, vehicleId: event.target.value })} /></AdminFilterField>
        <AdminFilterField label="Từ ngày giờ" htmlFor="rental-filter-from"><InlineInput id="rental-filter-from" name="from" type="datetime-local" value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} /></AdminFilterField>
        <AdminFilterField label="Đến ngày giờ" htmlFor="rental-filter-to"><InlineInput id="rental-filter-to" name="to" type="datetime-local" value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} /></AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    {query.error && <p role="alert" className="text-sm text-danger">{mapped.remaining.join(" ") || (Object.keys(mapped.errors).length ? "Vui lòng sửa bộ lọc theo hướng dẫn tại từng trường." : operationalError(query.error))} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p>}
    <AdminTableCard>
      <AdminTable aria-busy={query.isFetching} className="min-w-[960px]">
        <caption className="sr-only">{handovers ? "Danh sách bàn giao xe" : "Danh sách yêu cầu và đơn thuê"}</caption>
        <thead><tr>{["Mã hồ sơ", "Khách hàng", "Phương tiện", "Thời gian thuê", "Hình thức lái", "Tổng tiền", "Trạng thái"].map((label) => <th key={label} scope="col">{label}</th>)}<th scope="col" data-actions>Thao tác</th></tr></thead>
        <tbody>{query.isFetching ? <AdminTableSkeleton columns={8} label="Đang tải danh sách..." /> : items.map((rental) => <tr key={rental.id}>
          <td><RentalIdentifiers rentalId={rental.id} orderId={rental.orderId} /></td>
          <td><p className="font-semibold">{rental.customerName || rental.customerEmail || "Chưa có tên khách hàng"}</p><p className="text-xs text-td-muted">{rental.customerEmail}</p></td>
          <td><VehicleName vehicleId={rental.vehicleId} /></td><td className="text-xs"><p>{formatAdminDateTime(rental.startTime)}</p><p>{formatAdminDateTime(rental.endTime)}</p></td>
          <td>{rental.hasDriver ? rental.driverName || "Chưa phân tài xế" : "Tự lái"}</td><td>{rental.totalPrice.toLocaleString("vi-VN")} đ</td>
          <td><RentalOperationalBadge rental={rental} /></td>
          <td data-actions><AdminRowAction action="view" href={`/admin/${handovers ? "handovers" : "rentals"}?${handovers ? "" : "view=list&"}rentalId=${rental.id}#rental-detail`} label={`Xem yêu cầu của ${rental.customerName || rental.customerEmail || "khách hàng"}`} /></td>
        </tr>)}{!query.isFetching && !items.length && <AdminTableEmptyRow colSpan={8}>{query.error ? "Chưa tải được dữ liệu." : "Không có kết quả phù hợp."}</AdminTableEmptyRow>}</tbody>
      </AdminTable>
      <div className="border-t border-td-rule px-5 pt-4"><label className="text-xs text-td-muted">Số mục mỗi trang <InlineSelect className="admin-input ml-2" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>{[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}</InlineSelect></label></div>
      <ResultPagination page={query.data?.page ?? page} pageSize={query.data?.pageSize ?? pageSize} totalCount={query.data?.totalCount ?? 0} busy={query.isFetching || !!query.error} onPage={setPage} />
    </AdminTableCard>
    {/^[1-9]\d*$/.test(rentalId) && <div id="rental-detail" className="scroll-mt-24">{handovers ? <HandoverPanel key={rentalId} rentalId={rentalId} /> : <RentalOperations key={rentalId} />}</div>}
  </div>;
}
