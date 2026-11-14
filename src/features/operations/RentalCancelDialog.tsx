"use client";

import { useId, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { Button } from "@/components/ui/Button";
import { InlineTextarea, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { notifyError, notifySuccess } from "@/components/ui/Toaster";
import { ADMIN_NAVIGATION_COUNTS_KEY } from "@/features/admin/navigation-counts";
import { cancelOperationalRental, getRentalCancellationPreview, operationalError, operationsInput, rentalTransitionBlocker, type OperationalRental } from "./api";

export default function RentalCancelDialog({ rental, close, refresh, audience = "admin" }: {
  rental: Pick<OperationalRental, "id" | "status">;
  close: () => void;
  refresh: () => Promise<unknown>;
  audience?: "admin" | "customer";
}) {
  const inputId = useId();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const cache = useQueryClient();
  const validation = useInlineValidation();
  const blocker = rentalTransitionBlocker(rental, "cancelled");
  const preview = useQuery({ queryKey: ["rental-cancel-preview", rental.id, audience], queryFn: () => getRentalCancellationPreview(rental.id), enabled: audience === "customer", retry: false });
  const previewBlocked = audience === "customer" && (preview.isPending || preview.isError || preview.data?.allowed !== true);
  const submit = async () => {
    if (lock.current || blocker || previewBlocked) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (audience === "customer") await cancelOperationalRental(rental.id, reason, "customer");
      else await cancelOperationalRental(rental.id, reason);
    } catch (failure) {
      const message = validation.report(failure);
      const general = failure instanceof TypeError ? operationalError(failure) : message;
      setError(general);
      if (general) notifyError(general);
      lock.current = false;
      setBusy(false);
      return;
    }
    notifySuccess(`Đã hủy đơn thuê #${rental.id}.`);
    close();
    await Promise.allSettled([
      refresh(),
      cache.invalidateQueries({ queryKey: ADMIN_NAVIGATION_COUNTS_KEY }),
      cache.invalidateQueries({ queryKey: ["operational-rentals-queue"] }),
      cache.invalidateQueries({ queryKey: ["booking-vehicles"] }),
      cache.invalidateQueries({ queryKey: ["invoices"] }),
      cache.invalidateQueries({ queryKey: ["customer-rentals"] }),
      cache.invalidateQueries({ queryKey: ["customer-rental", Number(rental.id)] }),
      cache.invalidateQueries({ queryKey: ["my-trips"] }),
    ]);
  };
  return <FormDialog title="Xác nhận hủy hợp đồng thuê" busy={busy} onClose={close}>
    <ValidatedForm validation={validation} onSubmit={submit} validate={() => ({ reason: !reason.trim() ? "Vui lòng nhập lý do hủy đơn thuê." : undefined })}>
      <p className="mb-4 text-sm text-td-muted">Bạn đang hủy đơn thuê #{rental.id} trước khi bàn giao xe. Lịch xe và phân công được giải phóng; phí hủy, hóa đơn và hoàn tiền được hệ thống xử lý theo chính sách.</p>
      {audience === "customer" && <div className="mb-4 space-y-2 text-sm" aria-live="polite">
        {preview.isPending ? <p role="status">Đang tải phí hủy và số tiền hoàn...</p> : preview.isError ? <p role="alert" className="text-danger">Không thể tải chính sách hủy. <button type="button" className="underline" onClick={() => void preview.refetch()}>Thử lại</button></p> : preview.data && <>
          <p>Phí hủy: {preview.data.feeAmount.toLocaleString("vi-VN")} đ</p><p>Hoàn tiền dự kiến: {preview.data.refundAmount.toLocaleString("vi-VN")} đ</p>
          {!preview.data.allowed && <p role="alert" className="text-danger">{preview.data.reasons?.join(" ") || "Đơn thuê không còn đủ điều kiện hủy. Vui lòng tải lại trạng thái đơn."}</p>}
        </>}
      </div>}
      <div><label htmlFor={inputId} className="text-sm font-semibold">Lý do hủy *</label><InlineTextarea id={inputId} name="reason" required rows={3} className={operationsInput} value={reason} disabled={busy} onChange={(event) => setReason(event.target.value)} /></div>
      {(error || blocker) && <p role="alert" className="mt-3 text-sm text-danger">{error || blocker}</p>}
      <FormDialogFooter><Button type="button" variant="secondary" onClick={close} disabled={busy}>Đóng</Button><Button type="submit" variant="danger" isLoading={busy} disabled={busy || Boolean(blocker) || previewBlocked}>Xác nhận hủy đơn</Button></FormDialogFooter>
    </ValidatedForm>
  </FormDialog>;
}
