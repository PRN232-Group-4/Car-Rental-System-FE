"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InlineSelect, InlineTextarea, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { notifyError, notifySuccess } from "@/components/ui/Toaster";
import VehicleName from "@/features/admin/VehicleName";
import { assignDriverToRental, getAssignableDrivers } from "@/features/admin/staff/api";
import { mapIneligibleReason } from "@/features/admin/staff/license-utils";
import type { AssignDriverReason } from "@/features/admin/staff/types";
import { ADMIN_NAVIGATION_COUNTS_KEY } from "@/features/admin/navigation-counts";
import { useOptionalSession } from "@/features/auth/AuthContext";
import { DRIVER_SHIFT_MANAGEMENT_ENABLED } from "@/config/operational-features";
import { canAssignRental, getOperationalDrivers, operationalError, operationsButton, operationsInput, operationsPanel, type OperationalRental } from "./api";

export default function DriverAssignmentForm({ rental, refresh, canMutate = true, compact = false }: {
  rental: OperationalRental; refresh: () => Promise<unknown>; canMutate?: boolean; compact?: boolean;
}) {
  const [driverId, setDriverId] = useState("");
  const [reason, setReason] = useState<AssignDriverReason>("other");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const lock = useRef(false);
  const validation = useInlineValidation();
  const cache = useQueryClient();
  const session = useOptionalSession();
  const canReadDirectory = Boolean(session?.hasAnyRole(["Admin", "Manager"]));
  const enabled = canMutate && rental.hasDriver === true && canAssignRental(rental.status);
  const candidates = useQuery({ queryKey: ["assignable-drivers", rental.id], queryFn: () => getAssignableDrivers(Number(rental.id)), enabled, retry: false });
  const directory = useQuery({ queryKey: ["operational-drivers"], queryFn: getOperationalDrivers, enabled: enabled && canReadDirectory, retry: false });
  const loading = candidates.isPending || (canReadDirectory && directory.isPending);
  const loadError = candidates.error;
  const eligible = (candidates.data ?? []).filter(driver => driver.eligible);
  const reload = () => Promise.all([candidates.refetch(), ...(canReadDirectory ? [directory.refetch()] : [])]);
  const submit = async () => {
    if (!enabled || lock.current || loading || loadError) return;
    lock.current = true; setBusy(true); setError(""); setSuccess("");
    try {
      await assignDriverToRental({ rentalId: Number(rental.id), driverStaffId: Number(driverId), reason, notes: note.trim() || undefined });
      setSuccess("Đã lưu phân công tài xế cho xe của đơn thuê.");
      notifySuccess("Đã lưu phân công tài xế cho xe của đơn thuê.");
      await Promise.all([refresh(), cache.invalidateQueries({ queryKey: ["dispatch-schedule"] }), cache.invalidateQueries({ queryKey: ["driver-schedules"] }), cache.invalidateQueries({ queryKey: ADMIN_NAVIGATION_COUNTS_KEY }), candidates.refetch()]);
    } catch (failure) {
      const message = validation.report(failure);
      const generalError = message ? operationalError(failure) : "";
      setError(generalError);
      if (generalError) notifyError(generalError);
      void candidates.refetch();
    } finally { lock.current = false; setBusy(false); }
  };
  if (rental.hasDriver !== true || !canAssignRental(rental.status)) return null;
  return <ValidatedForm validation={validation} validate={() => ({ driverStaffId: !driverId ? "Vui lòng chọn tài xế cho đơn thuê có tài xế." : !eligible.some(driver => String(driver.staffId) === driverId) ? "Tài xế không còn đủ điều kiện. Vui lòng tải lại và chọn tài xế khác." : undefined })} onSubmit={submit} className={compact ? "space-y-3" : operationsPanel}>
    {!compact && <h2 className="text-lg font-bold">Phân xe và tài xế</h2>}
    <div className="text-sm"><p className="mb-2 text-td-muted">Xe của đơn</p><VehicleName vehicleId={rental.vehicleId} /></div>
    <p className="text-xs text-td-muted">Tài xế được phân cho xe theo từng đơn thuê.{!DRIVER_SHIFT_MANAGEMENT_ENABLED && " Chức năng phân công vẫn hoạt động khi xếp ca tạm khóa."}</p>
    {!canMutate ? <p className="text-xs text-td-muted">Tài khoản chỉ có quyền tra cứu, không thể phân công tài xế.</p> : <>
      <div><label htmlFor="assignment-driver" className="text-sm font-semibold">Tài xế nhận lệnh</label><InlineSelect id="assignment-driver" name="driverStaffId" required className={operationsInput} value={driverId} onChange={event => setDriverId(event.target.value)} disabled={busy || loading || !!loadError}><option value="">Chọn tài xế</option>{(candidates.data ?? []).map(driver => <option key={driver.staffId} value={driver.staffId} disabled={!driver.eligible}>{directory.data?.find(staff => staff.id === driver.staffId)?.email?.trim() || driver.fullName}{!driver.eligible ? ` — ${(driver.reasons ?? []).map(mapIneligibleReason).join("; ") || "Không đủ điều kiện"}` : ""}</option>)}</InlineSelect></div>
      {loading && <p role="status" className="text-xs text-td-muted">Đang kiểm tra tài xế khả dụng cho đơn thuê...</p>}
      {loadError && <p role="alert" className="text-sm text-danger">{operationalError(loadError)} <button type="button" className="underline" onClick={() => void reload()}>Tải lại tài xế</button></p>}
      {!loading && !loadError && !eligible.length && <p role="status" className="text-xs text-td-muted">Chưa có tài xế đủ điều kiện cho khoảng thuê này. Kiểm tra hồ sơ, giấy phép và lịch chuyến của tài xế.</p>}
      <div><label htmlFor="assignment-reason" className="text-sm font-semibold">Lý do phân công</label><InlineSelect id="assignment-reason" name="reason" className={operationsInput} value={reason} disabled={busy} onChange={event => setReason(event.target.value as AssignDriverReason)}><option value="other">Phân công theo điều phối</option><option value="driver_unavailable">Tài xế hiện tại không khả dụng</option><option value="driver_request">Yêu cầu của tài xế</option><option value="customer_request">Yêu cầu của khách hàng</option></InlineSelect></div>
      <div><label htmlFor="assignment-note" className="text-sm font-semibold">Ghi chú</label><InlineTextarea id="assignment-note" name="note" maxLength={500} className={operationsInput} value={note} disabled={busy} onChange={event => setNote(event.target.value)} /></div>
      <button type="submit" disabled={busy || loading || !!loadError || !eligible.length} className={`${operationsButton}${compact ? " w-full" : ""}`}>{busy ? "Đang phân công..." : "Lưu phân công"}</button>
    </>}
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}{success && <p role="status" className="text-sm text-success">{success}</p>}
  </ValidatedForm>;
}
