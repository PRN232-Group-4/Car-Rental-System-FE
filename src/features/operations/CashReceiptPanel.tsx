"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { confirmCashReceipt } from "@/features/invoices";
import { useOptionalSession } from "@/features/auth/AuthContext";
import { ADMIN_NAVIGATION_COUNTS_KEY } from "@/features/admin/navigation-counts";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { notifyError, notifySuccess } from "@/components/ui/Toaster";
import { operationsButton, operationsPanel, operationalError, type OperationalRental } from "./api";
import { useRentalInvoice } from "./rental-invoice";
import RentalIdentifiers from "./RentalIdentifiers";

export default function CashReceiptPanel({ rental, refresh, compact = false }: { rental: OperationalRental; refresh: () => Promise<unknown>; compact?: boolean }) {
  const session = useOptionalSession();
  const allowed = Boolean(session?.isAuthenticated && session.hasAnyRole(["Admin", "Manager", "CustomerService"]));
  const cache = useQueryClient();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const validation = useInlineValidation();
  const query = useRentalInvoice(rental, allowed);
  if (!allowed || rental.isSubscription || !["pending", "pre_inspection"].includes(rental.status)) return null;
  const invoice = query.data;
  const paid = invoice?.status === "paid";
  const canConfirm = rental.status === "pre_inspection" && invoice?.kind === "rental" && invoice.paymentMethod === "cash" && invoice.canPay === true && !paid && !query.isFetching && !query.isError;
  const confirm = async () => {
    if (!invoice || !canConfirm || lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      await confirmCashReceipt(invoice.id);
      setConfirming(false);
      notifySuccess("Đã ghi nhận thanh toán tiền mặt của đơn thuê.");
      await Promise.all([query.refetch(), refresh(), cache.invalidateQueries({ queryKey: ["invoices"] }), cache.invalidateQueries({ queryKey: ["invoice", String(invoice.id)] }), cache.invalidateQueries({ queryKey: ["operational-rentals-queue"] }), cache.invalidateQueries({ queryKey: ADMIN_NAVIGATION_COUNTS_KEY })]);
    } catch (failure) { const message = operationalError(failure); setError(message); notifyError(message); await query.refetch(); }
    finally { lock.current = false; setBusy(false); }
  };
  return <section aria-label="Thanh toán đơn thuê" className={compact ? "space-y-3 border-t border-td-rule pt-4" : operationsPanel} aria-busy={query.isFetching || busy}>
    <h2 className={compact ? "text-sm font-bold text-td-ink" : "text-lg font-bold"}>Thanh toán đơn thuê</h2>
    {query.isPending ? <p role="status" className="text-sm text-td-muted">Đang kiểm tra hóa đơn...</p>
      : query.isError ? <p role="alert" className="text-sm text-danger">{operationalError(query.error)}</p>
      : !invoice ? <p className="text-sm text-td-muted">Chưa có hóa đơn của yêu cầu này. Vui lòng kiểm tra lại trước khi bàn giao xe.</p>
      : <>
        <p className="text-sm">{invoice.invoiceNumber} · {invoice.amount.toLocaleString("vi-VN")} đ · {invoice.paymentMethod === "cash" ? "Tiền mặt" : "Online qua PayOS"}</p>
        <p role="status" className="text-sm font-semibold">{paid ? "Đã thanh toán" : "Chưa thanh toán"}</p>
        {paid && <RentalIdentifiers rentalId={rental.id} orderId={invoice.orderId} />}
        {!paid && rental.status === "pending" ? <p className="text-sm text-td-muted">Xác nhận đơn thuê trước khi ghi nhận thanh toán.</p> : !paid && invoice.paymentMethod === "cash" ? <>
          <p className="text-sm text-td-muted">Chỉ xác nhận sau khi thực nhận đủ tiền. Hệ thống lưu người thu và thời điểm thu.</p>
          {!invoice.canPay && <p className="text-sm text-td-muted">Hóa đơn hiện chưa cho phép thu tiền. Hãy cập nhật trạng thái hoặc kiểm tra lại đơn thuê.</p>}
          <button type="button" disabled={!canConfirm || busy} onClick={() => { setError(""); setConfirming(true); }} className={operationsButton}>Xác nhận đã thanh toán tiền mặt</button>
        </> : !paid && <p className="text-sm text-td-muted">Khách thanh toán online trong mục Hóa đơn. PayOS xác nhận đã nhận tiền thì hệ thống mới ghi Đã thanh toán; không xác nhận thủ công cho giao dịch online.</p>}
      </>}
    {error && !confirming && <p role="alert" className="text-sm text-danger">{error}</p>}
    <button type="button" disabled={busy || query.isFetching} className="block text-sm font-semibold text-td-oxide underline disabled:opacity-50" onClick={() => void query.refetch()}>Cập nhật trạng thái thanh toán</button>
    {confirming && <FormDialog title="Xác nhận đã thanh toán tiền mặt" busy={busy} onClose={() => setConfirming(false)}>
      <ValidatedForm validation={validation} onSubmit={confirm} className="space-y-4">
        <p>Xác nhận đã thực nhận đủ <strong>{invoice?.amount.toLocaleString("vi-VN")} đ</strong> cho đơn thuê #{rental.id}? Hệ thống lưu tài khoản người thu và thời điểm thu.</p>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {!canConfirm && !busy && !query.isFetching && <p role="alert" className="text-sm text-danger">Hóa đơn không còn cho phép thu tiền mặt. Đóng cửa sổ và kiểm tra trạng thái mới.</p>}
        <FormDialogFooter><button type="button" disabled={busy} onClick={() => setConfirming(false)} className="admin-input">Đóng</button><button type="submit" disabled={busy || !canConfirm} className={operationsButton}>{busy ? "Đang ghi nhận..." : "Xác nhận đã nhận đủ tiền"}</button></FormDialogFooter>
      </ValidatedForm>
    </FormDialog>}
  </section>;
}
