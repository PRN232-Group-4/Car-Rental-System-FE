"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptionalSession } from "@/features/auth/AuthContext";
import { checkoutOvertimeForStaff, confirmCashReceipt, getInvoiceById } from "@/features/invoices";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { notifyError, notifySuccess } from "@/components/ui/Toaster";
import { operationalError, operationsButton } from "./api";

export default function OvertimePaymentPanel({ invoiceId }: { invoiceId: number }) {
  const session = useOptionalSession();
  const allowed = Boolean(session?.isAuthenticated && session.hasAnyRole(["Admin", "Manager", "CustomerService"]));
  const cache = useQueryClient();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const validation = useInlineValidation();
  const query = useQuery({
    queryKey: ["overtime-invoice", invoiceId], queryFn: () => getInvoiceById(invoiceId), enabled: allowed, retry: false,
    refetchInterval: state => state.state.data?.status === "paid" ? false : 5000,
  });
  if (!allowed) return null;
  const invoice = query.data;
  const paid = invoice?.status === "paid";
  const cashAllowed = !query.isFetching && !query.isError && invoice?.kind === "overtime" && invoice.canConfirmCash === true && !paid;
  const onlineAllowed = !query.isFetching && !query.isError && invoice?.kind === "overtime" && invoice.canCreateStaffCheckout === true && !paid;
  const collect = async (method: "cash" | "payos") => {
    if (lock.current || (method === "cash" ? !cashAllowed : !onlineAllowed)) return;
    lock.current = true; setBusy(true); setError("");
    try {
      if (method === "cash") {
        await confirmCashReceipt(invoiceId);
        notifySuccess("Đã ghi nhận thu tiền mặt phí quá hạn.");
        setConfirming(false); setLink("");
      } else {
        const checkout = await checkoutOvertimeForStaff(invoiceId);
        const url = new URL(checkout.checkoutUrl);
        if (url.protocol !== "https:") throw new Error("Link thanh toán không hợp lệ. Vui lòng tải lại hóa đơn.");
        setLink(url.href);
        notifySuccess("Đã tạo link thanh toán. Đang chờ PayOS xác nhận tiền.");
      }
      await cache.invalidateQueries({ queryKey: ["invoice", String(invoiceId)] });
    } catch (failure) {
      const message = operationalError(failure); setError(message); notifyError(message);
    } finally {
      await query.refetch(); // A provider failure may already have reserved the invoice; never offer cash from stale flags.
      lock.current = false; setBusy(false);
    }
  };
  return <section aria-label="Thu phí quá hạn còn thiếu" className="space-y-3 border-t border-td-rule pt-4" aria-busy={query.isFetching || busy}>
    <h4 className="font-bold text-td-ink">Thu phí quá hạn còn thiếu</h4>
    {query.isPending ? <p role="status">Đang tải hóa đơn phụ phí...</p> : query.isError || !invoice ? <p role="alert" className="text-danger">{query.error ? operationalError(query.error) : "Chưa tải được hóa đơn phụ phí."}</p> : <>
      <p>{invoice.invoiceNumber} · <strong>{invoice.amount.toLocaleString("vi-VN")} đ</strong></p>
      <p role="status">{paid ? `Đã thu phí · ${invoice.paymentMethod === "cash" ? "Tiền mặt" : "Online qua PayOS"}` : "Chưa thanh toán phí quá hạn"}</p>
      {!paid && <p className="text-td-muted">Tiền mặt: chỉ xác nhận sau khi thực nhận đủ tiền. Online: PayOS xác nhận giao dịch thì hóa đơn mới được ghi đã thu.</p>}
      {!paid && <div className="flex flex-wrap gap-3">
        <button type="button" className={operationsButton} disabled={!cashAllowed || busy} onClick={() => { setError(""); setConfirming(true); }}>Xác nhận đã thu tiền mặt</button>
        <button type="button" className={operationsButton} disabled={!onlineAllowed || busy} onClick={() => void collect("payos")}>{busy ? "Đang xử lý..." : "Tạo link thanh toán online"}</button>
      </div>}
      {!paid && !cashAllowed && !query.isFetching && <p className="text-td-muted">Không thể thu tiền mặt khi đã bắt đầu thanh toán online hoặc hóa đơn không đủ điều kiện.</p>}
      {!paid && link && <a className="font-semibold text-td-oxide underline" href={link} target="_blank" rel="noopener noreferrer">Mở link PayOS để thanh toán</a>}
    </>}
    {error && !confirming && <p role="alert" className="text-danger">{error}</p>}
    <button type="button" className="text-td-oxide underline disabled:opacity-50" disabled={busy || query.isFetching} onClick={() => void query.refetch()}>Cập nhật trạng thái thu phí</button>
    {confirming && <FormDialog title="Xác nhận thu tiền mặt phí quá hạn" busy={busy} onClose={() => setConfirming(false)}>
      <ValidatedForm validation={validation} onSubmit={() => collect("cash")} className="space-y-4">
        <p>Xác nhận đã thực nhận đủ <strong>{invoice?.amount.toLocaleString("vi-VN")} đ</strong> cho hóa đơn {invoice?.invoiceNumber}? Hệ thống lưu tài khoản người thu và thời điểm thu.</p>
        {error && <p role="alert" className="text-danger">{error}</p>}
        {!cashAllowed && !busy && !query.isFetching && <p role="alert" className="text-danger">Hóa đơn không còn cho phép thu tiền mặt. Đóng cửa sổ và kiểm tra trạng thái mới.</p>}
        <FormDialogFooter><button type="button" disabled={busy} onClick={() => setConfirming(false)} className="admin-input">Đóng</button><button type="submit" disabled={busy || !cashAllowed} className={operationsButton}>{busy ? "Đang ghi nhận..." : "Xác nhận đã nhận đủ tiền"}</button></FormDialogFooter>
      </ValidatedForm>
    </FormDialog>}
  </section>;
}
