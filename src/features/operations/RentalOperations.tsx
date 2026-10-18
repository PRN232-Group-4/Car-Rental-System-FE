"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import RentalLookup from "./RentalLookup";
import VehicleName from "@/features/admin/VehicleName";
import { assignRental, changeRentalStatus, getOperationalDrivers, operationalError, operationsButton, operationsInput, operationsPanel, rentalStatuses } from "./api";
import type { OperationalRental } from "./api";
import CashReceiptPanel from "./CashReceiptPanel";

export default function RentalOperations() {
  return <RentalLookup title="Vận hành yêu cầu và đơn thuê">{(rental, refresh) => <div className="grid gap-6 lg:grid-cols-2"><AssignmentForm rental={rental} refresh={refresh} /><StatusForm rental={rental} refresh={refresh} /><CashReceiptPanel rental={rental} refresh={refresh} /></div>}</RentalLookup>;
}

export function AssignmentForm({ rental, refresh }: { rental: OperationalRental; refresh: () => Promise<unknown> }) {
  const [driverId, setDriverId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const validation = useInlineValidation();
  const drivers = useQuery({ queryKey: ["operational-drivers"], queryFn: getOperationalDrivers, retry: false });
  const submit = async () => {
    if (busy) return;
    setBusy(true); setError(""); setSuccess("");
    try { await assignRental(Number(rental.id), driverId ? Number(driverId) : null); setSuccess("Đã lưu phân công xe / tài xế."); await refresh(); }
    catch (failure) { const message = validation.report(failure); setError(failure instanceof TypeError ? operationalError(failure) : message); }
    finally { setBusy(false); }
  };
  return <ValidatedForm validation={validation} onSubmit={submit} className={operationsPanel}>
    <h2 className="text-lg font-bold">Phân xe và tài xế</h2>
    <div className="text-sm"><p className="mb-2 text-ink-3">Xe của đơn</p><VehicleName vehicleId={rental.vehicleId} /></div>
    <p className="text-xs text-ink-3">Phân công sử dụng phương tiện đã chọn trong đơn thuê.</p>
    <div><label htmlFor="assignment-driver" className="text-sm font-semibold">Tài xế</label><InlineSelect id="assignment-driver" name="driverStaffId" className={operationsInput} value={driverId} onChange={(event) => setDriverId(event.target.value)} disabled={busy || drivers.isPending}><option value="">Không phân tài xế (tự lái)</option>{(drivers.data ?? []).filter((driver) => driver.isActive).map((driver) => <option key={driver.id} value={driver.id}>{driver.fullName ?? driver.email ?? `Tài xế #${driver.id}`}</option>)}</InlineSelect></div>
    {drivers.error && <p role="alert" className="text-sm text-danger">{operationalError(drivers.error)} <button type="button" className="underline" onClick={() => void drivers.refetch()}>Tải lại tài xế</button></p>}
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}{success && <p role="status" className="text-sm text-success">{success}</p>}
    <button type="submit" disabled={busy || drivers.isPending} className={operationsButton}>{busy ? "Đang phân công..." : "Lưu phân công"}</button>
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
    setBusy(true); setError(""); setSuccess("");
    try { await changeRentalStatus(Number(rental.id), status); setSuccess(status === "pre_inspection" ? "Đã duyệt yêu cầu thuê. Khách hàng có thể thanh toán hóa đơn." : `Đã cập nhật: ${rentalStatuses[status]}.`); setStatus(""); await refresh(); }
    catch (failure) { const message = validation.report(failure); setError(failure instanceof TypeError ? operationalError(failure) : message); }
    finally { setBusy(false); }
  };
  return <ValidatedForm validation={validation} onSubmit={submit} className={operationsPanel}>
    <h2 className="text-lg font-bold">Duyệt yêu cầu và bàn giao xe</h2><p className="text-sm text-ink-3">Duyệt yêu cầu để khách thanh toán. Đơn trực tiếp cần thanh toán và hoàn thành kiểm tra, phân công trước khi bàn giao xe.</p>
    <div><label htmlFor="rental-next-status" className="text-sm font-semibold">Thao tác</label><InlineSelect id="rental-next-status" name="status" required className={operationsInput} value={status} onChange={(event) => setStatus(event.target.value)} disabled={busy}><option value="">Chọn thao tác</option><option value="pre_inspection">Duyệt yêu cầu — mở thanh toán</option><option value="renting">Bàn giao xe — bắt đầu thuê</option><option value="post_inspection">Nhận xe — kiểm tra sau thuê</option><option value="completed">Hoàn tất đơn thuê</option><option value="cancelled">Hủy yêu cầu / đơn thuê</option></InlineSelect></div>
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}{success && <p role="status" className="text-sm text-success">{success}</p>}
    <button type="submit" disabled={busy} className={operationsButton}>{busy ? "Đang cập nhật..." : "Xác nhận cập nhật trạng thái"}</button>
  </ValidatedForm>;
}
