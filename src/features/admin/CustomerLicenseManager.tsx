"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FileCheck, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiClientError } from "@/api/api-client";
import { useAuth } from "@/features/auth";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { InlineError, InlineInput, InlineSelect, ValidatedForm, mapValidationErrors, useInlineValidation } from "@/components/forms/inline-validation";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { Button } from "@/components/ui/Button";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { formatAdminDate } from "@/lib/date-time";
import { getCustomerLicenses, getCustomerLicenseDetail, licenseStatusLabel, reviewCustomerLicense } from "./customer-license-api";
import type { CustomerLicenseSummary } from "./customer-license-api";

const inputClass = "admin-input w-full";
const errorMessage = (error: unknown) => error instanceof TypeError
  ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại."
  : error instanceof Error ? `Không thể thực hiện yêu cầu. ${error.message}` : "Không thể thực hiện yêu cầu. Vui lòng thử lại.";
const customerLabel = (customer: CustomerLicenseSummary) => customer.fullName || customer.email || "Khách hàng chưa có thông tin";

export default function CustomerLicenseManager() {
  const { hasRole, isLoading } = useAuth();
  const allowed = ["customerservice", "staff", "manager"].some(hasRole);
  const [draft, setDraft] = useState({ search: "", status: "pending" });
  const [filter, setFilter] = useState(draft);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CustomerLicenseSummary | null>(null);
  const [success, setSuccess] = useState("");
  const validation = useInlineValidation();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["customer-license-list", filter, page], queryFn: () => getCustomerLicenses(filter.search, filter.status, page), enabled: allowed, retry: false });
  const mapped = mapValidationErrors(query.error instanceof ApiClientError ? query.error.data : null, ["search", "status"], { licensestatus: "status" });
  const backendErrors = Object.fromEntries(Object.entries(mapped.errors).filter(([key]) => draft[key as keyof typeof draft] === filter[key as keyof typeof filter]));
  useEffect(() => {
    if (query.error instanceof ApiClientError) {
      const first = Object.keys(mapValidationErrors(query.error.data, ["search", "status"], { licensestatus: "status" }).errors)[0];
      if (first) document.getElementById(`license-filter-${first}`)?.focus();
    }
  }, [query.error]);
  const records = query.data?.items ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / (query.data?.pageSize ?? 20)));
  const currentPage = query.data?.page ?? page;
  const displayed = records;
  const reset = () => { setDraft({ search: "", status: "pending" }); setFilter({ search: "", status: "pending" }); setPage(1); validation.reset(); };

  if (isLoading) return <FormSkeleton label="Đang kiểm tra quyền truy cập..." />;
  if (!allowed) return <p role="alert" className="text-sm text-danger">Bạn không có quyền xem và duyệt GPLX khách hàng.</p>;

  return <div className="space-y-6">
    <div className="flex items-center gap-3"><span className="rounded-2xl bg-primary-tint p-3 text-primary"><FileCheck className="h-6 w-6" aria-hidden="true" /></span><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Giấy phép lái xe khách hàng</h1></div>
    <p className="text-sm text-ink-3">Xem hồ sơ, kiểm tra ảnh giấy phép và cập nhật kết quả xét duyệt.</p>
    <ValidatedForm validation={{ ...validation, errors: { ...backendErrors, ...validation.errors } }} onSubmit={() => { setFilter({ search: draft.search.trim(), status: draft.status }); setPage(1); }}>
      <AdminFilterBar actions={<><AdminFilterButton type="submit">Áp dụng</AdminFilterButton><AdminFilterButton variant="secondary" onClick={reset}>Đặt lại</AdminFilterButton></>}>
        <AdminFilterField label="Tìm khách hàng" htmlFor="license-filter-search" icon={Search}><InlineInput id="license-filter-search" name="search" maxLength={255} value={draft.search} onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))} placeholder="Tên, email hoặc số điện thoại" /></AdminFilterField>
        <AdminFilterField label="Trạng thái GPLX" htmlFor="license-filter-status" select><InlineSelect id="license-filter-status" name="status" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}><option value="">Tất cả trạng thái</option><option value="pending">Chờ duyệt</option><option value="approved">Đã duyệt</option><option value="rejected">Từ chối</option><option value="none">Chưa cập nhật</option></InlineSelect></AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    {success && <p role="status" className="text-sm text-success">{success}</p>}
    {query.error && <div className="flex flex-wrap items-center gap-3 text-sm"><p role="alert" className="text-danger">{errorMessage(query.error)}</p><button type="button" onClick={() => void query.refetch()} className="font-semibold text-primary underline">Thử lại</button></div>}
    <AdminTableCard>
      <div className="border-b border-line px-5 py-4"><h2 className="font-bold">Danh sách hồ sơ GPLX</h2><p className="mt-1 text-xs text-ink-3">{query.isFetching ? "Đang tải hồ sơ..." : `${totalCount} khách hàng`}</p></div>
      <AdminTable aria-busy={query.isFetching} className="min-w-[680px]">
        <caption className="sr-only">Hồ sơ giấy phép lái xe khách hàng</caption>
        <thead><tr><th scope="col">Khách hàng</th><th scope="col">Email</th><th scope="col">Số điện thoại</th><th scope="col">Trạng thái GPLX</th><th scope="col" data-actions>Thao tác</th></tr></thead>
        <tbody>{query.isFetching ? <AdminTableSkeleton columns={5} label="Đang tải hồ sơ GPLX..." /> : query.error ? <AdminTableEmptyRow colSpan={5}>Chưa tải được hồ sơ. Vui lòng thử lại.</AdminTableEmptyRow> : displayed.map((customer) => <tr key={customer.id}>
          <td className="font-semibold text-ink">{customerLabel(customer)}</td><td>{customer.email || "Chưa cập nhật"}</td><td>{customer.phone || "Chưa cập nhật"}</td><td><AdminStatusBadge domain="license" status={customer.licenseStatus}>{licenseStatusLabel(customer.licenseStatus)}</AdminStatusBadge></td>
          <td data-actions><AdminRowAction action="view" label={`Xem và duyệt GPLX của ${customerLabel(customer)}`} onClick={() => setSelected(customer)} /></td>
        </tr>)}{!query.isFetching && !query.error && !records.length && <AdminTableEmptyRow colSpan={5}>Không có hồ sơ phù hợp với bộ lọc.</AdminTableEmptyRow>}</tbody>
      </AdminTable>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-sm text-ink-3"><span>Trang {currentPage} / {pageCount}</span><nav aria-label="Phân trang hồ sơ GPLX" className="flex gap-2"><button type="button" disabled={query.isFetching || currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="min-h-11 rounded-xl border border-line-strong px-4 disabled:opacity-50">Trang trước</button><button type="button" disabled={query.isFetching || !!query.error || currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="min-h-11 rounded-xl border border-line-strong px-4 disabled:opacity-50">Trang sau</button></nav></div>
    </AdminTableCard>
    {selected && <LicenseReviewDialog key={selected.id} customer={selected} onClose={() => setSelected(null)} onSaved={() => { setSuccess(`Đã cập nhật trạng thái GPLX của ${customerLabel(selected)}.`); setSelected(null); void queryClient.invalidateQueries({ queryKey: ["customer-license-list"] }); void queryClient.invalidateQueries({ queryKey: ["customer-license"] }); }} />}
  </div>;
}

function LicenseReviewDialog({ customer, onClose, onSaved }: { customer: CustomerLicenseSummary; onClose: () => void; onSaved: () => void }) {
  const queryClient = useQueryClient();
  const detail = useQuery({ queryKey: ["customer-license-detail", customer.id], queryFn: () => getCustomerLicenseDetail(customer.id), retry: false, staleTime: 0 });
  const [status, setStatus] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const saving = useRef(false);
  const validation = useInlineValidation();
  const license = detail.data?.license;
  const imageUrl = license?.imageUrl && /^https?:\/\//i.test(license.imageUrl) ? license.imageUrl : null;
  const submit = async () => {
    if (saving.current || !detail.data) return;
    saving.current = true; setBusy(true); setError("");
    try { await reviewCustomerLicense(customer.id, status); void queryClient.invalidateQueries({ queryKey: ["customer-license-detail", customer.id] }); onSaved(); }
    catch (failure) { const message = validation.report(failure); setError(failure instanceof TypeError ? errorMessage(failure) : message); }
    finally { saving.current = false; setBusy(false); }
  };
  return <FormDialog title={`Xem và duyệt GPLX — ${customerLabel(customer)}`} onClose={onClose} busy={busy} size="xl">
    <ValidatedForm validation={validation} onSubmit={submit}>
      <div className="space-y-5">
        {detail.isFetching ? <FormSkeleton label="Đang tải chi tiết GPLX..." /> : detail.error ? <div className="space-y-3"><p role="alert" className="text-sm text-danger">{errorMessage(detail.error)}</p><Button type="button" variant="secondary" onClick={() => void detail.refetch()}>Thử lại</Button></div> : detail.data && <>
          <dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-ink-3">Khách hàng</dt><dd className="font-semibold">{detail.data.fullName || detail.data.email || "Chưa cập nhật"}</dd></div><div><dt className="text-ink-3">Email</dt><dd className="break-all">{detail.data.email || "Chưa cập nhật"}</dd></div><div><dt className="text-ink-3">Số GPLX</dt><dd>{license?.number || "Chưa cập nhật"}</dd></div><div><dt className="text-ink-3">Hạng giấy phép</dt><dd>{license?.type || "Chưa cập nhật"}</dd></div><div><dt className="text-ink-3">Ngày cấp</dt><dd>{formatAdminDate(license?.issueDate)}</dd></div><div><dt className="text-ink-3">Ngày hết hạn</dt><dd>{formatAdminDate(license?.expiryDate)}</dd></div><div><dt className="mb-1 text-ink-3">Trạng thái hiện tại</dt><dd><AdminStatusBadge domain="license" status={license?.status}>{licenseStatusLabel(license?.status)}</AdminStatusBadge></dd></div></dl>
          <div className="space-y-2"><h3 className="text-sm font-semibold">Ảnh giấy phép lái xe</h3>{imageUrl ? <><a href={imageUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-primary underline">Mở ảnh gốc</a>{imageFailed ? <p role="status" className="text-sm text-ink-3">Không tải được ảnh xem trước. Bạn có thể mở ảnh gốc để kiểm tra.</p> : <Image src={imageUrl} alt={`Ảnh GPLX của ${customerLabel(customer)}`} width={960} height={600} unoptimized onError={() => setImageFailed(true)} className="max-h-80 w-full rounded-xl border border-line object-contain" />}</> : <p className="text-sm text-ink-3">Khách hàng chưa có ảnh GPLX hợp lệ.</p>}</div>
          <fieldset disabled={busy} className="space-y-4"><legend className="sr-only">Kết quả xét duyệt</legend><div><label htmlFor="license-review-status" className="mb-2 block text-sm font-semibold">Trạng thái mới *</label><InlineSelect id="license-review-status" name="status" required value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}><option value="">Chọn kết quả xét duyệt</option><option value="approved">Duyệt GPLX</option><option value="rejected">Từ chối GPLX</option></InlineSelect></div>
            <div><div className="flex items-start gap-3"><InlineInput id="license-review-confirm" name="confirmed" type="checkbox" required checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} showError={false} className="mt-1 h-4 w-4 accent-primary" /><label htmlFor="license-review-confirm" className="text-sm">Tôi xác nhận đã kiểm tra hồ sơ và muốn cập nhật trạng thái GPLX của khách hàng này.</label></div><InlineError name="confirmed" inputId="license-review-confirm" /></div>
          </fieldset>
        </>}
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </div>
      <FormDialogFooter><Button type="button" variant="secondary" disabled={busy} onClick={onClose}>Đóng</Button><Button type="submit" disabled={busy || detail.isFetching || !detail.data || !!detail.error} isLoading={busy}>Lưu trạng thái</Button></FormDialogFooter>
    </ValidatedForm>
  </FormDialog>;
}
