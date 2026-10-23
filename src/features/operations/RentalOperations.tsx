"use client";

import { notifyError, notifySuccess } from "@/components/ui/Toaster";

import { useRef, useState } from "react";
import { ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import RentalLookup from "./RentalLookup";
import { canAssignRental, isClosedRental, changeRentalStatus, operationalError, operationsButton, operationsPanel, rentalStatuses, rentalTransitionBlocker } from "./api";
import type { OperationalRental } from "./api";
import CashReceiptPanel from "./CashReceiptPanel";
import RentalEditForm from "./RentalEditForm";
import HandoverPanel from "./HandoverPanel";
import TechnicianAssignmentForm from "./TechnicianAssignmentForm";
import RentalReturnStatus from "./RentalReturnStatus";
import DriverAssignmentForm from "./DriverAssignmentForm";
import RentalWorkflowChecklist, { useRentalWorkflowChecklist } from "./RentalWorkflowChecklist";
import SignedContractUpload from "@/features/rentals/components/SignedContractUpload";
import { useRentalInvoice } from "./rental-invoice";
import RentalCancelDialog from "./RentalCancelDialog";
import { useOptionalSession } from "@/features/auth/AuthContext";

export default function RentalOperations() {
  return <RentalLookup title="Vận hành yêu cầu và đơn thuê">{(rental, refresh) => <div className="grid gap-6 lg:grid-cols-2">
    <RentalReturnStatus key={rental.id} rental={rental} />
    <StatusForm key={`${rental.id}-${rental.status}`} rental={rental} refresh={refresh} />
    {!["pre_inspection", "post_inspection"].includes(rental.status) && <details className={operationsPanel}><summary className="cursor-pointer text-sm font-bold">Kiểm tra phương tiện</summary><TechnicianAssignmentForm key={rental.id} rental={rental} refresh={refresh} showApprovalAction={false} /></details>}
    {rental.hasDriver && canAssignRental(rental.status) && <details className={operationsPanel}><summary className="cursor-pointer text-sm font-bold">Phân công tài xế</summary><AssignmentForm rental={rental} refresh={refresh} /></details>}
    {!rental.isSubscription && rental.status === "pending" && <details className={operationsPanel}><summary className="cursor-pointer text-sm font-bold">Thanh toán đơn thuê</summary><CashReceiptPanel rental={rental} refresh={refresh} /></details>}
    <details className={operationsPanel}><summary className="cursor-pointer text-sm font-bold">Chỉnh sửa yêu cầu</summary><RentalEditForm rental={rental} refresh={refresh} /></details>
    <details className={operationsPanel}><summary className="cursor-pointer text-sm font-bold">Hồ sơ bàn giao</summary><HandoverPanel rentalId={rental.id} refresh={refresh} /></details>
  </div>}</RentalLookup>;
}

export function AssignmentForm({ rental, refresh }: { rental: OperationalRental; refresh: () => Promise<unknown> }) {
  const session = useOptionalSession();
  const canMutate = Boolean(session?.isAuthenticated && session.hasAnyRole(["Admin", "Manager", "CustomerService"]));
  return <DriverAssignmentForm key={rental.id} rental={rental} refresh={refresh} canMutate={canMutate} />;
}

export function StatusForm({ rental, refresh }: { rental: OperationalRental; refresh: () => Promise<unknown> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const lock = useRef(false);
  const validation = useInlineValidation();
  const session = useOptionalSession();
  const canMutate = Boolean(session?.isAuthenticated && session.hasAnyRole(["Admin", "Manager", "CustomerService"]));
  const invoice = useRentalInvoice(rental, canMutate);
  const paymentBlocker = rental.status === "pre_inspection" && !rental.isSubscription && invoice.data?.status !== "paid"
    ? invoice.isError ? "Chưa kiểm tra được thanh toán. Vui lòng tải lại hóa đơn trong mục Thanh toán đơn thuê." : "Cần thanh toán đủ hóa đơn trước khi bàn giao xe."
    : null;
  const checklist = useRentalWorkflowChecklist(rental, paymentBlocker);
  const submit = async () => {
    const status = checklist.nextStatus;
    if (lock.current || !canMutate || !status || !checklist.ready || rentalTransitionBlocker(rental, status)) return;
    lock.current = true;
    setBusy(true); setError(""); setSuccess("");
    try { await changeRentalStatus(Number(rental.id), status); const message = status === "pre_inspection" ? "Đã duyệt yêu cầu thuê. Khách hàng có thể thanh toán hóa đơn." : `Đã cập nhật: ${rentalStatuses[status]}.`; setSuccess(message); notifySuccess(message); await refresh(); }
    catch (failure) { const generalError = operationalError(failure); setError(generalError); if (generalError) notifyError(generalError); }
    finally { lock.current = false; setBusy(false); }
  };
  if (isClosedRental(rental.status)) return <p className="text-sm text-td-muted">Đơn thuê đã kết thúc. Chỉ có thể xem lại hồ sơ.</p>;
  return <>
    <section className={operationsPanel}>
      <h2 className="text-lg font-bold">Thao tác đơn thuê</h2>
      <RentalWorkflowChecklist checklist={checklist} disabled={busy || !canMutate} controls={{
        contract: canMutate && <SignedContractUpload key={`contract-${rental.id}`} rental={rental} refresh={refresh} />,
        inspection: <TechnicianAssignmentForm key={`${rental.id}-${rental.status}`} rental={rental} refresh={refresh} compact embedded showApprovalAction={false} />,
        payment: <CashReceiptPanel key={`payment-${rental.id}`} rental={rental} refresh={refresh} compact embedded />,
      }} />
      {checklist.blocker && <p className="text-sm text-td-muted">{checklist.blocker}</p>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}{success && <p role="status" className="text-sm text-success">{success}</p>}
      <ValidatedForm validation={validation} onSubmit={submit}>
      <button type="submit" disabled={busy || !canMutate || !checklist.ready} className={operationsButton}>{busy ? "Đang cập nhật..." : `Cập nhật: ${rentalStatuses[checklist.nextStatus ?? ""] || "Bước tiếp theo"}`}</button>
      </ValidatedForm>
      {["pending", "pre_inspection"].includes(rental.status) && <button type="button" disabled={busy || !canMutate} onClick={() => setCancelling(true)} className="text-sm text-td-muted underline">Hủy đơn thuê</button>}
    </section>
    {cancelling && <RentalCancelDialog rental={rental} close={() => setCancelling(false)} refresh={refresh} />}
  </>;
}
