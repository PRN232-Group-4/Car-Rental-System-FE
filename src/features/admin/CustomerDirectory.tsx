"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ApiClientError } from "@/api/api-client";
import { AdminFilterBar, AdminFilterButton, AdminFilterField } from "@/components/admin/AdminFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { useOptionalSession } from "@/features/auth/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { TransitFolio, TransitFolioMetric } from "@/features/admin/transit-desk/TransitFolio";
import { InlineInput, InlineSelect, ValidatedForm, mapValidationErrors, useInlineValidation } from "@/components/forms/inline-validation";
import type { LicenseStatus } from "@/features/licenses/types";
import { getCustomers } from "./customer-api";

const licenseLabels: Record<string, string> = {
  pending: "Chờ phê duyệt",
  approved: "Đã phê duyệt",
  rejected: "Đã từ chối",
  none: "Chưa cập nhật",
};
const emptyFilter = { search: "", licenseStatus: "", isActive: "" };
const pageButtonClass = "inline-flex h-8 w-8 items-center justify-center rounded border border-td-rule bg-transparent text-td-ink hover:bg-td-chalk disabled:opacity-40";

export default function CustomerDirectory({ initialLicenseStatus = "" }: { initialLicenseStatus?: string }) {
  const session = useOptionalSession();
  const canOpenProfile = Boolean(session?.hasRole("Admin"));
  const initialFilter = { ...emptyFilter, licenseStatus: initialLicenseStatus === "pending" ? "pending" : "" };
  const [filter, setFilter] = useState(initialFilter);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const validation = useInlineValidation();
  const query = useQuery({
    queryKey: ["admin-customers", activeFilter, page, pageSize],
    queryFn: ({ signal }) => getCustomers({
      search: activeFilter.search || undefined,
      licenseStatus: (activeFilter.licenseStatus || undefined) as LicenseStatus | undefined,
      isActive: activeFilter.isActive === "" ? undefined : activeFilter.isActive === "true",
      page,
      pageSize,
    }, signal),
    retry: false,
  });
  useEffect(() => {
    if (!(query.error instanceof ApiClientError)) return;
    const { errors } = mapValidationErrors(query.error.data, Object.keys(emptyFilter));
    const fields = { search: "customers-search", licenseStatus: "customers-license", isActive: "customers-active" };
    const first = (Object.keys(fields) as (keyof typeof fields)[]).find((name) => errors[name]);
    if (first) document.getElementById(fields[first])?.focus();
  }, [query.error]);
  const backendValidation = mapValidationErrors(query.error instanceof ApiClientError ? query.error.data : null, Object.keys(emptyFilter));
  const serverErrors = Object.fromEntries(Object.entries(backendValidation.errors).filter(([name]) =>
    filter[name as keyof typeof filter] === activeFilter[name as keyof typeof activeFilter]));
  const filterValidation = { ...validation, errors: { ...serverErrors, ...validation.errors } };
  const error = !query.error ? "" : backendValidation.remaining.join(" ")
    || (Object.keys(backendValidation.errors).length ? "" : query.error instanceof ApiClientError && query.error.status === 403
      ? "Tài khoản không có quyền xem danh sách khách hàng."
      : "Không thể tải danh sách khách hàng. Vui lòng thử lại.");

  const customers = query.data?.items ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasFilters = [...Object.values(filter), ...Object.values(activeFilter)].some(Boolean)
    || Object.values(filterValidation.errors).some(Boolean);
  const reset = () => {
    setFilter(emptyFilter);
    setActiveFilter(emptyFilter);
    setPage(1);
    validation.reset();
  };

  return <div className="space-y-6">
    <TransitFolio
      index="07"
      tag="ORG"
      kicker="TỔ CHỨC · KHÁCH HÀNG"
      title={<>Khách <em className="italic text-td-teal">hàng.</em></>}
      description="Tra cứu toàn bộ khách hàng và theo dõi giấy phép lái xe đang chờ phê duyệt."
    >
      <TransitFolioMetric
        label="DANH BẠ · TỔNG KHÁCH"
        value={query.isPending ? <Skeleton className="h-8 w-16" /> : totalCount.toLocaleString("vi-VN")}
      />
    </TransitFolio>
    <ValidatedForm validation={filterValidation} onSubmit={() => {
      setActiveFilter({ ...filter, search: filter.search.trim() });
      setPage(1);
    }}>
      <AdminFilterBar description="Chọn Chờ phê duyệt để xem khách hàng đã gửi giấy phép cần kiểm tra." actions={<>
        <AdminFilterButton type="submit">Lọc danh sách</AdminFilterButton>
        <AdminFilterButton variant="secondary" disabled={!hasFilters} onClick={reset}>Đặt lại</AdminFilterButton>
      </>}>
        <AdminFilterField label="Tìm khách hàng" htmlFor="customers-search" icon={Search}>
          <InlineInput id="customers-search" name="search" maxLength={255} value={filter.search} placeholder="Tên, email hoặc số điện thoại" onChange={(event) => setFilter((current) => ({ ...current, search: event.target.value }))} />
        </AdminFilterField>
        <AdminFilterField label="Trạng thái GPLX" htmlFor="customers-license" select>
          <InlineSelect id="customers-license" name="licenseStatus" value={filter.licenseStatus} onChange={(event) => setFilter((current) => ({ ...current, licenseStatus: event.target.value }))}>
            <option value="">Tất cả trạng thái GPLX</option>
            {Object.entries(licenseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </InlineSelect>
        </AdminFilterField>
        <AdminFilterField label="Trạng thái tài khoản" htmlFor="customers-active" select>
          <InlineSelect id="customers-active" name="isActive" value={filter.isActive} onChange={(event) => setFilter((current) => ({ ...current, isActive: event.target.value }))}>
            <option value="">Tất cả tài khoản</option><option value="true">Đang hoạt động</option><option value="false">Đã ngừng hoạt động</option>
          </InlineSelect>
        </AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    {error && <p role="alert" className="text-sm text-danger">{error} <button type="button" className="font-semibold underline" onClick={() => void query.refetch()}>Thử lại</button></p>}
    <AdminTableCard>
      <div className="border-b border-td-rule pb-2 pt-3">
        <h2 className="text-sm font-bold text-td-ink">Danh sách khách hàng</h2>
        <p aria-live="polite" className="mt-1 font-mono text-[11px] text-td-muted">{query.isPending ? "Đang tải khách hàng..." : query.error ? "Chưa tải được danh sách" : `${totalCount.toLocaleString("vi-VN")} khách hàng`}</p>
      </div>
      <AdminTable className="min-w-[860px]" aria-busy={query.isFetching}>
        <caption className="sr-only">Danh sách khách hàng</caption>
        <thead><tr>{["Khách hàng", "Số điện thoại", "Giấy phép lái xe", "Tài khoản", "Điểm tích lũy"].map((label) => <th key={label} scope="col">{label}</th>)}{canOpenProfile && <th scope="col" data-actions>Thao tác</th>}</tr></thead>
        <tbody>
          {query.isFetching ? <AdminTableSkeleton columns={canOpenProfile ? 6 : 5} label="Đang tải danh sách khách hàng" /> : !query.error && customers.map((customer) => <tr key={customer.id}>
            <td><p className="font-semibold text-td-ink">{customer.fullName?.trim() || customer.email || "Chưa có tên khách hàng"}</p><p className="mt-1 font-mono text-[11px] text-td-muted">{customer.email}</p></td>
            <td className="text-td-muted">{customer.phone?.trim() || "Chưa cập nhật"}</td>
            <td><AdminStatusBadge domain="license" status={customer.licenseStatus}>{licenseLabels[customer.licenseStatus] ?? "Chưa xác định"}</AdminStatusBadge></td>
            <td><AdminStatusBadge domain="activity" status={customer.isActive ? "active" : "inactive"}>{customer.isActive ? "Đang hoạt động" : "Đã ngừng hoạt động"}</AdminStatusBadge></td>
            <td className="font-mono tabular-nums text-td-ink">{customer.loyaltyPoint.toLocaleString("vi-VN")}</td>
            {canOpenProfile && <td data-actions><AdminRowAction action="view" href={`/admin/users/detail?id=${customer.userId}`} label={`Xem hồ sơ GPLX ${customer.email}`} /></td>}
          </tr>)}
          {!query.isFetching && !query.error && !customers.length && <AdminTableEmptyRow colSpan={canOpenProfile ? 6 : 5}>Không có khách hàng phù hợp. Hãy thử thay đổi hoặc đặt lại bộ lọc.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
      <div className="flex flex-col gap-3 border-t border-td-rule py-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-td-muted">Số khách hàng mỗi trang
          <select aria-label="Số khách hàng mỗi trang" className="rounded border border-td-rule bg-transparent px-2 py-1 text-xs text-td-ink outline-none focus:border-td-ink" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
            {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <nav aria-label="Phân trang khách hàng" className="flex items-center gap-3 font-mono text-[11px] text-td-muted">
          <span>Trang {page} / {pageCount}</span>
          <button type="button" aria-label="Trang trước" disabled={page <= 1 || query.isFetching} onClick={() => setPage((current) => current - 1)} className={pageButtonClass}><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button>
          <button type="button" aria-label="Trang sau" disabled={page >= pageCount || query.isFetching || !!query.error} onClick={() => setPage((current) => current + 1)} className={pageButtonClass}><ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
        </nav>
      </div>
    </AdminTableCard>
  </div>;
}
