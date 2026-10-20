"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { confirmCashReceipt, getInvoiceById } from "@/features/invoices";
import { operationsButton, operationsPanel, operationalError, type OperationalRental } from "./api";

export default function CashReceiptPanel({ rental, refresh }: { rental: OperationalRental; refresh: () => Promise<unknown> }) {
  const cache = useQueryClient();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const query = useQuery({
    queryKey: ["operational-invoice", rental.id, rental.invoiceId, rental.status],
    queryFn: async () => {
      return rental.invoiceId ? getInvoiceById(rental.invoiceId) : null;
    },
    enabled: !rental.isSubscription,
    retry: false,
  });
  if (rental.isSubscription) return null;
  const invoice = query.data;
  const confirm = async () => {
    if (!invoice || invoice.paymentMethod !== "cash" || !invoice.canPay || lock.current) return;
    if (!window.confirm(`Xác nhận đã thực nhận ${invoice.amount.toLocaleString("vi-VN")} đ tiền mặt của yêu cầu #${rental.id}? Thao tác sẽ ghi nhận thanh toán và phát hành đơn thuê chính thức.`)) return;
    lock.current = true; setBusy(true); setError(""); setSuccess("");
    try {
      const receipt = await confirmCashReceipt(invoice.id);
      setSuccess(receipt.orderId ? `Đã thu tiền mặt và phát hành đơn thuê chính thức #${receipt.orderId}.` : "Đã ghi nhận thu tiền mặt.");
      await Promise.all([query.refetch(), refresh(), cache.invalidateQueries({ queryKey: ["invoices"] }), cache.invalidateQueries({ queryKey: ["invoice", String(invoice.id)] })]);
    } catch (failure) { setError(operationalError(failure)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <section className={operationsPanel} aria-busy={query.isFetching || busy}>
    <h2 className="text-lg font-bold">Thanh toán và phát hành đơn thuê</h2>
    {query.isPending ? <p role="status" className="text-sm text-td-muted">Đang kiểm tra hóa đơn...</p>
      : query.error ? <p role="alert" className="text-sm text-danger">{operationalError(query.error)} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p>
      : !invoice ? <p className="text-sm text-td-muted">Chưa có hóa đơn của yêu cầu này.</p>
      : <>
        <p className="text-sm">{invoice.invoiceNumber} · {invoice.amount.toLocaleString("vi-VN")} đ · {invoice.paymentMethod === "cash" ? "Tiền mặt" : "Online qua PayOS"}</p>
        {invoice.orderId && <p className="text-sm font-semibold text-success">Đơn thuê chính thức #{invoice.orderId} · Đã thanh toán</p>}
        {invoice.status !== "paid" && invoice.paymentMethod === "cash" && <>
          <p className="text-sm text-td-muted">{invoice.canPay ? "Chỉ xác nhận sau khi đã thực nhận đủ tiền. Hệ thống sẽ ghi người thu và phát hành đơn thuê." : (invoice.paymentBlockedReason || "Hóa đơn hiện chưa thể thanh toán.")}</p>
          <button type="button" disabled={!invoice.canPay || busy || query.isFetching} onClick={() => void confirm()} className={operationsButton}>{busy ? "Đang ghi nhận..." : "Xác nhận đã thu tiền mặt"}</button>
        </>}
        {invoice.status !== "paid" && invoice.paymentMethod !== "cash" && <p className="text-sm text-td-muted">Khách thanh toán sau khi yêu cầu được duyệt. PayOS xác nhận đã nhận tiền thì hệ thống tự phát hành đơn thuê.</p>}
      </>}
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    {success && <p role="status" className="text-sm text-success">{success}</p>}
  </section>;
}
