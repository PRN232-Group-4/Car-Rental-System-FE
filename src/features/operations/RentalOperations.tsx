"use client";

import { notifyError, notifySuccess } from "@/components/ui/Toaster";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import RentalLookup from "./RentalLookup";
import VehicleName from "@/features/admin/VehicleName";
import { assignRental, canAssignRental, isClosedRental, changeRentalStatus, getOperationalDrivers, operationalError, operationsButton, operationsInput, operationsPanel, rentalStatuses, rentalTransitionBlocker } from "./api";
import type { OperationalRental } from "./api";
import CashReceiptPanel from "./CashReceiptPanel";
import RentalEditForm from "./RentalEditForm";
import HandoverPanel from "./HandoverPanel";
import TechnicianAssignmentForm from "./TechnicianAssignmentForm";
import RentalReturnStatus from "./RentalReturnStatus";

export default function RentalOperations() {
  return <RentalLookup title="Vận hành yêu cầu và đơn thuê">{(rental, refresh) => <div className="grid gap-6 lg:grid-cols-2"><RentalReturnStatus key={rental.id} rental={rental} /><TechnicianAssignmentForm key={rental.id} rental={rental} refresh={refresh} /><AssignmentForm rental={rental} refresh={refresh} /><StatusForm rental={rental} refresh={refresh} /><CashReceiptPanel rental={rental} refresh={refresh} /><RentalEditForm rental={rental} refresh={refresh} /><HandoverPanel rentalId={rental.id} refresh={refresh} /></div>}</RentalLookup>;
}

export function AssignmentForm({ rental, refresh }: { rental: OperationalRental; refresh: () => Promise<unknown> }) {
  const [driverId, setDriverId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const validation = useInlineValidation();
  const drivers = useQuery({ queryKey: ["operational-drivers"], queryFn: getOperationalDrivers, enabled: rental.hasDriver === true && canAssignRental(rental.status), retry: false });
  const lock = useRef(false);
  const submit = async () => {
    if (rental.hasDriver !== true || !canAssignRental(rental.status) || lock.current || drivers.isPending || drivers.error) return;
    lock.current = true;
    setBusy(true); setError(""); setSuccess("");
    try { await assignRental(Number(rental.id), driverId ? Number(driverId) : null); setSuccess("Đã lưu phân công xe / tài xế."); notifySuccess("Đã lưu phân công xe / tài xế."); await refresh(); }
    catch (failure) { const message = validation.report(failure); const generalError = failure instanceof TypeError ? operationalError(failure) : message; setError(generalError); notifyError(generalError); }
    finally { lock.current = false; setBusy(false); }
  };
  if (rental.hasDriver !== true || !canAssignRental(rental.status)) return null;
  return <ValidatedForm validation={validation} onSubmit={submit} className={operationsPanel}>
    <h2 className="text-lg font-bold">Phân xe và tài xế</h2>
    <div className="text-sm"><p className="mb-2 text-td-muted">Xe của đơn</p><VehicleName vehicleId={rental.vehicleId} /></div>
    <p className="text-xs text-td-muted">Phân công sử dụng phương tiện đã chọn trong đơn thuê.</p>
    <div><label htmlFor="assignment-driver" className="text-sm font-semibold">Tài xế</label><InlineSelect id="assignment-driver" name="driverStaffId" className={operationsInput} value={driverId} onChange={(event) => setDriverId(event.target.value)} disabled={busy || drivers.isPending || !!drivers.error}><option value="">Không phân tài xế (tự lái)</option>{(drivers.data ?? []).filter((driver) => driver.isActive).map((driver) => <option key={driver.id} value={driver.id}>{driver.email?.trim() || "Chưa cập nhật email tài xế"}</option>)}</InlineSelect></div>
    {drivers.error && <p role="alert" className="text-sm text-danger">{operationalError(drivers.error)} <button type="button" className="underline" onClick={() => void drivers.refetch()}>Tải lại tài xế</button></p>}
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}{success && <p role="status" className="text-sm text-success">{success}</p>}
    <button type="submit" disabled={busy || drivers.isPending || !!drivers.error} className={operationsButton}>{busy ? "Đang phân công..." : "Lưu phân công"}</button>
  </ValidatedForm>;
}

function StatusForm({ rental, refresh }: { rental: OperationalRental; refresh: () => Promise<unknown> }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const validation = useInlineValidation();
  const submit = async () => {
    if (busy) return;
    const blocker = rentalTransitionBlocker(rental, status);
    if (blocker) { validation.setField("status", blocker); return; }
    setBusy(true); setError(""); setSuccess("");
    try { await changeRentalStatus(Number(rental.id), status); const message = status === "pre_inspection" ? "Đã duyệt yêu cầu thuê. Khách hàng có thể thanh toán hóa đơn." : `Đã cập nhật: ${rentalStatuses[status]}.`; setSuccess(message); notifySuccess(message); setStatus(""); await refresh(); }
    catch (failure) { const message = validation.report(failure); const generalError = failure instanceof TypeError ? operationalError(failure) : message; setError(generalError); notifyError(generalError); }
    finally { setBusy(false); }
  };
  if (isClosedRental(rental.status)) return <p className="text-sm text-td-muted">Đơn thuê đã kết thúc. Chỉ có thể xem lại hồ sơ.</p>;
  return <ValidatedForm validation={validation} onSubmit={submit} className={operationsPanel}>
    <h2 className="text-lg font-bold">Duyệt yêu cầu và bàn giao xe</h2><p className="text-sm text-td-muted">Duyệt yêu cầu để khách thanh toán. Đơn trực tiếp cần thanh toán và hoàn thành kiểm tra, phân công trước khi bàn giao xe.</p>
    <div><label htmlFor="rental-next-status" className="text-sm font-semibold">Thao tác</label><InlineSelect id="rental-next-status" name="status" required className={operationsInput} value={status} onChange={(event) => setStatus(event.target.value)} disabled={busy}><option value="">Chọn thao tác</option><option value="pre_inspection">Duyệt yêu cầu — mở thanh toán</option><option value="renting">Bàn giao xe — bắt đầu thuê</option><option value="post_inspection">Nhận xe — kiểm tra sau thuê</option><option value="completed">Hoàn tất đơn thuê</option><option value="cancelled">Hủy yêu cầu / đơn thuê</option></InlineSelect></div>
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}{success && <p role="status" className="text-sm text-success">{success}</p>}
    <button type="submit" disabled={busy} className={operationsButton}>{busy ? "Đang cập nhật..." : "Xác nhận cập nhật trạng thái"}</button>
  </ValidatedForm>;
}
