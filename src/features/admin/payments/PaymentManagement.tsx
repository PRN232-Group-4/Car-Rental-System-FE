"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminFilterBar, AdminFilterButton, AdminFilterField } from "@/components/admin/AdminFilters";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { InlineInput, InlineSelect, useInlineValidation, ValidatedForm } from "@/components/forms/inline-validation";
import { TransitFolio, TransitFolioMetric } from "@/features/admin/transit-desk/TransitFolio";
import { useSession } from "@/features/auth/AuthContext";
import { hasAnyRole } from "@/features/auth/access";
import type { PaymentSummary } from "@/features/payments/types";
import { formatAdminDateTime } from "@/lib/date-time";
import { formatVnd } from "@/lib/format";
import { getAdminPayments } from "./api";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ thanh toán", unpaid: "Chưa thanh toán", paid: "Đã thanh toán",
  requested: "Yêu cầu hoàn tiền", refunded: "Đã hoàn tiền", rejected: "Từ chối hoàn tiền",
  cancelled: "Đã hủy", failed: "Thất bại",
};
const TYPE_LABELS: Record<string, string> = {
  rental: "Tiền thuê xe", payment: "Thanh toán đơn thuê", deposit: "Tiền cọc", refund: "Hoàn tiền",
  overtime: "Phí quá giờ", subscription: "Gói đăng ký",
};
const METHOD_LABELS: Record<string, string> = { cash: "Tiền mặt", payos: "PayOS" };
const EMPTY_FILTERS = { search: "", status: "all", type: "all", method: "all" };
const PAGE_SIZE = 20;
const pageButtonClass = "min-h-11 rounded border border-td-rule px-3 text-td-ink hover:bg-td-chalk disabled:opacity-40";

function labelFor(labels: Record<string, string>, value?: string | null) {
  return value ? labels[value.toLowerCase()] ?? value : "Chưa ghi nhận";
}

function paymentStatus(payment: PaymentSummary) {
  // The ledger records approved refunds as type=refund/status=paid.
  return payment.type === "refund" && payment.status === "paid" ? "refunded" : payment.status;
}

export default function PaymentManagement() {
  const { user, isAuthenticated } = useSession();
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const validation = useInlineValidation();
  const canRead = isAuthenticated && hasAnyRole(user?.roles, ["Admin", "Manager"]);
  const query = useQuery({
    queryKey: ["admin", "payments", user?.email, user?.roles],
    queryFn: getAdminPayments,
    enabled: canRead,
    retry: false,
  });

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (query.data ?? []).filter((payment) =>
      (filters.status === "all" || paymentStatus(payment) === filters.status) &&
      (filters.type === "all" || payment.type === filters.type) &&
      (filters.method === "all" || payment.method === filters.method) &&
      (!search || [payment.id, `GD-${payment.id}`, payment.rentalId, payment.rentalId ? `Đơn thuê #${payment.rentalId}` : null,
        payment.invoiceId, payment.invoiceId ? `Hóa đơn #${payment.invoiceId}` : null, payment.providerReference]
        .some((value) => value != null && String(value).toLowerCase().includes(search))),
    );
  }, [query.data, filters]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const updateDraft = (name: keyof typeof EMPTY_FILTERS, value: string) => setDraft((previous) => ({ ...previous, [name]: value }));
  const reset = () => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setPage(1); validation.reset(); };
  const errorStatus = query.error && "status" in query.error ? query.error.status : undefined;

  if (!canRead) return <p role="alert" className="pl-3 text-sm text-td-ink">Bạn không có quyền xem danh sách thanh toán.</p>;

  return <div className="space-y-6">
    <TransitFolio
      title="Thanh toán đơn thuê"
      description="Tra cứu giao dịch tiền thuê, tiền cọc, phí quá giờ, gói đăng ký và hoàn tiền theo hóa đơn.">
      <TransitFolioMetric label="Giao dịch phù hợp" value={query.isPending || query.isError ? "—" : filtered.length.toLocaleString("vi-VN")} />
    </TransitFolio>

    <ValidatedForm validation={validation} onSubmit={() => { setFilters({ ...draft, search: draft.search.trim() }); setPage(1); }}>
      <AdminFilterBar title="Tra cứu thanh toán" actions={<>
        <AdminFilterButton type="submit">Áp dụng</AdminFilterButton>
        <AdminFilterButton variant="secondary" onClick={reset}>Đặt lại</AdminFilterButton>
      </>}>
        <AdminFilterField label="Tìm giao dịch" htmlFor="payment-search">
          <InlineInput id="payment-search" name="search" value={draft.search} onChange={(event) => updateDraft("search", event.target.value)} placeholder="Mã giao dịch, đơn thuê, hóa đơn, tham chiếu..." />
        </AdminFilterField>
        <AdminFilterField label="Trạng thái" htmlFor="payment-status" select>
          <InlineSelect id="payment-status" name="status" value={draft.status} onChange={(event) => updateDraft("status", event.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </InlineSelect>
        </AdminFilterField>
        <AdminFilterField label="Loại giao dịch" htmlFor="payment-type" select>
          <InlineSelect id="payment-type" name="type" value={draft.type} onChange={(event) => updateDraft("type", event.target.value)}>
            <option value="all">Tất cả loại giao dịch</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </InlineSelect>
        </AdminFilterField>
        <AdminFilterField label="Phương thức" htmlFor="payment-method" select>
          <InlineSelect id="payment-method" name="method" value={draft.method} onChange={(event) => updateDraft("method", event.target.value)}>
            <option value="all">Tất cả phương thức</option>
            {Object.entries(METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </InlineSelect>
        </AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>

    {query.isError && <div role="alert" className="space-y-3 text-sm text-td-ink">
      <p>{errorStatus === 403 ? "Bạn không có quyền xem danh sách thanh toán." : "Không thể tải danh sách thanh toán. Vui lòng thử lại."}</p>
      <button type="button" className={pageButtonClass} disabled={query.isFetching} onClick={() => void query.refetch()}>Thử tải lại</button>
    </div>}

    <AdminTableCard>
      <AdminTable className="min-w-[1040px]" aria-busy={query.isFetching}>
        <caption className="sr-only">Danh sách giao dịch thanh toán đơn thuê</caption>
        <thead><tr>
          <th scope="col">Giao dịch</th><th scope="col">Đơn thuê / Hóa đơn</th><th scope="col">Loại giao dịch</th>
          <th scope="col">Số tiền</th><th scope="col">Phương thức</th><th scope="col">Trạng thái</th><th scope="col">Thời điểm</th>
        </tr></thead>
        <tbody>
          {query.isPending ? <AdminTableSkeleton columns={7} label="Đang tải giao dịch thanh toán..." /> : query.isError ? (
            <AdminTableEmptyRow colSpan={7}>Chưa tải được dữ liệu thanh toán.</AdminTableEmptyRow>
          ) : rows.length ? rows.map((payment) => <tr key={String(payment.id)}>
            <td><strong className="font-mono text-xs text-td-ink">GD-{payment.id}</strong>
              <span className="mt-1 block max-w-[200px] break-all font-mono text-[11px] text-td-muted">{payment.providerReference || "Chưa có mã tham chiếu"}</span></td>
            <td className="font-mono text-[11px] text-td-muted">
              <span className="block">{payment.rentalId ? `Đơn thuê #${payment.rentalId}` : "Không gắn đơn thuê"}</span>
              <span className="mt-1 block">{payment.invoiceId ? `Hóa đơn #${payment.invoiceId}` : "Không có hóa đơn"}</span>
            </td>
            <td>{labelFor(TYPE_LABELS, payment.type)}</td>
            <td className="whitespace-nowrap font-mono font-semibold text-td-ink">{formatVnd(payment.amount)}</td>
            <td>{labelFor(METHOD_LABELS, payment.method)}</td>
            <td><AdminStatusBadge domain="payment" status={paymentStatus(payment)}>{labelFor(STATUS_LABELS, paymentStatus(payment))}</AdminStatusBadge></td>
            <td className="whitespace-nowrap font-mono text-[11px] text-td-muted">
              <span className="block">Tạo: {formatAdminDateTime(payment.createdAt)}</span>
              <span className="mt-1 block">{payment.paidAt ? `Ghi nhận: ${formatAdminDateTime(payment.paidAt)}` : "Chưa ghi nhận thanh toán"}</span>
            </td>
          </tr>) : <AdminTableEmptyRow colSpan={7}>Không có giao dịch phù hợp. Hãy thử đặt lại bộ lọc.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
      <nav aria-label="Phân trang thanh toán" className="flex flex-wrap items-center justify-between gap-3 py-4 text-[11px] text-td-muted">
        <span aria-live="polite">{query.isPending || query.isError ? "Chưa có dữ liệu" : `${filtered.length.toLocaleString("vi-VN")} giao dịch · Trang ${currentPage}/${pages}`}</span>
        <div className="flex gap-2">
          <button type="button" className={pageButtonClass} disabled={query.isFetching || query.isError || currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Trang trước</button>
          <button type="button" className={pageButtonClass} disabled={query.isFetching || query.isError || currentPage >= pages} onClick={() => setPage(currentPage + 1)}>Trang sau</button>
        </div>
      </nav>
    </AdminTableCard>
  </div>;
}
