"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import RentalLookup from "./RentalLookup";
import { getVehicle } from "@/features/admin/api";
import { assignRental, changeRentalStatus, getOperationalDrivers, operationalError, operationsButton, operationsInput, operationsPanel, rentalStatuses } from "./api";
import type { OperationalRental } from "./api";

export default function RentalOperations() {
  return <RentalLookup title="Vận hành đơn thuê">{(rental, refresh) => <div className="grid gap-6 lg:grid-cols-2"><AssignmentForm rental={rental} refresh={refresh} /><StatusForm rental={rental} refresh={refresh} /></div>}</RentalLookup>;
}

export function AssignmentForm({ rental, refresh }: { rental: OperationalRental; refresh: () => Promise<unknown> }) {
  const [driverId, setDriverId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const validation = useInlineValidation();
  const drivers = useQuery({ queryKey: ["operational-drivers"], queryFn: getOperationalDrivers, retry: false });
  const vehicle = useQuery({ queryKey: ["operational-vehicle", rental.vehicleId], queryFn: () => getVehicle(Number(rental.vehicleId)) });
  const submit = async () => {
    if (busy) return;
    setBusy(true); setError(""); setSuccess("");
    try { await assignRental(Number(rental.id), driverId ? Number(driverId) : null); setSuccess("Đã lưu phân công xe / tài xế."); await refresh(); }
    catch (failure) { const message = validation.report(failure); setError(failure instanceof TypeError ? operationalError(failure) : message); }
    finally { setBusy(false); }
  };
  return <ValidatedForm validation={validation} onSubmit={submit} className={operationsPanel}>
    <h2 className="text-lg font-bold">Phân xe và tài xế</h2>
    <p className="text-sm">Xe của đơn: {vehicle.data ? `${vehicle.data.brand ?? ""} ${vehicle.data.model ?? ""} (#${rental.vehicleId})` : `#${rental.vehicleId}`}</p>
    <p className="text-xs text-ink-muted">Phân công sử dụng phương tiện đã chọn trong đơn thuê.</p>
    <div><label htmlFor="assignment-driver" className="text-sm font-semibold">Tài xế</label><InlineSelect id="assignment-driver" name="driverStaffId" className={operationsInput} value={driverId} onChange={(event) => setDriverId(event.target.value)} disabled={busy || drivers.isPending}><option value="">Không phân tài xế (tự lái)</option>{(drivers.data ?? []).filter((driver) => driver.isActive).map((driver) => <option key={driver.id} value={driver.id}>{driver.fullName ?? driver.email ?? `Tài xế #${driver.id}`}</option>)}</InlineSelect></div>
    {drivers.error && <p role="alert" className="text-sm text-red-700">{operationalError(drivers.error)} <button type="button" className="underline" onClick={() => void drivers.refetch()}>Tải lại tài xế</button></p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}{success && <p role="status" className="text-sm text-green-700">{success}</p>}
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
    try { await changeRentalStatus(Number(rental.id), status); setSuccess(`Đã cập nhật: ${rentalStatuses[status]}.`); setStatus(""); await refresh(); }
    catch (failure) { const message = validation.report(failure); setError(failure instanceof TypeError ? operationalError(failure) : message); }
    finally { setBusy(false); }
  };
  return <ValidatedForm validation={validation} onSubmit={submit} className={operationsPanel}>
    <h2 className="text-lg font-bold">Bàn giao và nhận xe</h2><p className="text-sm text-ink-muted">Hoàn thành kiểm tra xe trước khi bàn giao hoặc hoàn tất đơn. Máy chủ kiểm tra điều kiện chuyển trạng thái.</p>
    <div><label htmlFor="rental-next-status" className="text-sm font-semibold">Thao tác</label><InlineSelect id="rental-next-status" name="status" required className={operationsInput} value={status} onChange={(event) => setStatus(event.target.value)} disabled={busy}><option value="">Chọn thao tác</option><option value="pre_inspection">Chuyển sang kiểm tra trước thuê</option><option value="renting">Bàn giao xe — bắt đầu thuê</option><option value="post_inspection">Nhận xe — kiểm tra sau thuê</option><option value="completed">Hoàn tất đơn thuê</option><option value="cancelled">Hủy đơn thuê</option></InlineSelect></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}{success && <p role="status" className="text-sm text-green-700">{success}</p>}
    <button type="submit" disabled={busy} className={operationsButton}>{busy ? "Đang cập nhật..." : "Xác nhận cập nhật trạng thái"}</button>
  </ValidatedForm>;
}
