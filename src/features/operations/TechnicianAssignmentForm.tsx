"use client";

import { notifyError, notifySuccess } from "@/components/ui/Toaster";

import { useId, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiClientError } from "@/api/api-client";
import { InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOptionalSession } from "@/features/auth/AuthContext";
import { formatAdminDateTime } from "@/lib/date-time";
import { operationalError, operationsButton, operationsInput, type OperationalRental } from "./api";
import { assignInspectionTechnician, confirmInspectionChecked, getInspectionAssignment, getInspectionTechnicians, inspectionAssignmentError, inspectionConfirmationError } from "./technician-api";

export default function TechnicianAssignmentForm({ rental, refresh }: {
  rental: OperationalRental;
  refresh: () => Promise<unknown>;
}) {
  const session = useOptionalSession();
  const cache = useQueryClient();
  const inputId = useId();
  const validation = useInlineValidation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const canRead = Boolean(session?.hasAnyRole(["Admin", "Manager", "CustomerService", "Maintenance"]));
  const canManage = Boolean(session?.hasAnyRole(["Admin", "Manager"]));
  const canConfirm = Boolean(session?.hasAnyRole(["Admin"]));
  const canAssign = canManage && ["pending", "pre_inspection"].includes(rental.status) && rental.hasPassingPreInspection !== true;
  const assignment = useQuery({
    queryKey: ["inspection-assignment", rental.id, rental.vehicleId],
    queryFn: () => getInspectionAssignment(Number(rental.id)),
    enabled: canRead,
    retry: false,
  });
  const technicians = useQuery({
    queryKey: ["inspection-technicians"],
    queryFn: getInspectionTechnicians,
    enabled: canAssign,
    retry: false,
  });
  const technicianId = selectedId ?? (assignment.data ? String(assignment.data.technicianStaffId) : "");
  const options = technicians.data ?? [];
  const submit = async (checked = false) => {
    if (busy || !canAssign || assignment.isPending || assignment.isError || technicians.isPending || technicians.isError) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const saved = await (checked ? confirmInspectionChecked : assignInspectionTechnician)(Number(rental.id), Number(technicianId));
      cache.setQueryData(["inspection-assignment", rental.id, rental.vehicleId], saved);
      setSelectedId(null);
      setConfirming(false);
      const message = checked ? "Đã xác nhận phân công và kiểm tra trước thuê đạt." : "Đã phân công kỹ thuật viên. Đang chờ kết quả kiểm tra.";
      setSuccess(message);
      notifySuccess(message);
      void cache.invalidateQueries({ queryKey: ["inspection-directory"] });
      await refresh();
    } catch (failure) {
      const confirmationError = checked ? inspectionConfirmationError(failure) : null;
      if (confirmationError) { setError(confirmationError); notifyError(confirmationError); return; }
      if (failure instanceof ApiClientError && ["TECHNICIAN_NOT_ELIGIBLE", "TECHNICIAN_ID_INVALID"].includes(failure.code ?? "")) {
        validation.show({ technicianStaffId: "Kỹ thuật viên không còn khả dụng. Vui lòng tải lại và chọn kỹ thuật viên đang hoạt động." });
        void technicians.refetch();
        return;
      }
      const message = validation.report(failure, { staffid: "technicianStaffId" });
      const generalError = failure instanceof TypeError ? operationalError(failure) : message; setError(generalError); notifyError(generalError);
    } finally {
      setBusy(false);
    }
  };
  if (!canRead) return null;
  return <section className="min-w-0 space-y-4 border-t border-td-rule pt-5" aria-label="Phân công kiểm tra trước thuê">
    <h2 className="text-sm font-bold text-td-ink">Kỹ thuật viên kiểm tra trước thuê</h2>
    {rental.hasPassingPreInspection === true && <p role="status" className="text-sm text-td-teal">{rental.hasDriver ? "Đơn có tài xế: đã đạt kiểm tra trước thuê theo mặc định." : "Đã đạt kiểm tra trước thuê."}</p>}
    {assignment.isPending ? <div role="status" aria-label="Đang tải phân công kiểm tra"><Skeleton className="h-12 w-full" /></div> : assignment.isError ?
      <p role="alert" className="text-sm text-danger">{inspectionAssignmentError(assignment.error)} <button type="button" className="underline" onClick={() => void assignment.refetch()}>Thử lại</button></p> : assignment.data ?
        <p className="break-words text-sm text-td-ink">Đã giao: <strong>{assignment.data.technicianEmail || options.find((staff) => staff.id === assignment.data?.technicianStaffId)?.email || "Chưa cập nhật email kỹ thuật viên"}</strong><span className="mt-1 block text-xs text-td-muted">{formatAdminDateTime(assignment.data.assignedAt)}</span></p> :
        <p className="text-sm text-td-muted">Chưa phân công kỹ thuật viên kiểm tra.</p>}
    {canAssign && <ValidatedForm validation={validation} onSubmit={() => submit(false)} validate={() => ({
      technicianStaffId: !options.some((staff) => String(staff.id) === technicianId) ? "Vui lòng chọn kỹ thuật viên đang hoạt động trong danh sách." : undefined,
    })} className="space-y-3">
      <div>
        <label htmlFor={inputId} className="text-xs font-semibold text-td-muted">Kỹ thuật viên phụ trách</label>
        <InlineSelect id={inputId} name="technicianStaffId" required className={operationsInput} value={technicianId}
          disabled={busy || assignment.isPending || assignment.isError || technicians.isPending || technicians.isError}
          onChange={(event) => { setSelectedId(event.target.value); setSuccess(""); setConfirming(false); }}>
          <option value="">Chọn kỹ thuật viên</option>
          {assignment.data && !options.some((staff) => staff.id === assignment.data?.technicianStaffId) &&
            <option value={assignment.data.technicianStaffId} disabled>{assignment.data.technicianEmail || "Chưa cập nhật email kỹ thuật viên"} (không khả dụng)</option>}
          {options.map((staff) => <option key={staff.id} value={staff.id}>{staff.email?.trim() || "Chưa cập nhật email kỹ thuật viên"}</option>)}
        </InlineSelect>
      </div>
      {technicians.isPending && <p role="status" className="text-xs text-td-muted">Đang tải kỹ thuật viên...</p>}
      {technicians.isError && <p role="alert" className="text-sm text-danger">Không thể tải kỹ thuật viên. <button type="button" className="underline" onClick={() => void technicians.refetch()}>Tải lại kỹ thuật viên</button></p>}
      {technicians.isSuccess && !options.length && <p className="text-xs text-td-muted">Chưa có nhân viên kỹ thuật đang hoạt động. Cập nhật vai trò Kỹ thuật tại mục Nhân sự.</p>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {success && <p role="status" className="text-sm text-td-ink">{success}</p>}
      <button type="submit" className={`${operationsButton} w-full`} disabled={busy || assignment.isPending || assignment.isError || technicians.isPending || technicians.isError || !options.length}>
        {busy ? "Đang phân công..." : "Lưu phân công kiểm tra"}
      </button>
      {canConfirm && <button type="button" className={`${operationsButton} w-full`} disabled={busy || assignment.isPending || assignment.isError || technicians.isPending || technicians.isError || !options.length} onClick={() => {
        if (!options.some((staff) => String(staff.id) === technicianId)) {
          validation.show({ technicianStaffId: "Vui lòng chọn kỹ thuật viên phụ trách trước khi xác nhận." });
          document.getElementById(inputId)?.focus();
          return;
        }
        setConfirming(true);
      }}>Đã inspect</button>}
      {confirming && <div role="group" aria-label="Xác nhận kiểm tra trực tiếp" className="space-y-3 border-t border-td-rule pt-3">
        <p className="text-sm text-td-muted">Xác nhận xe đã được phân công và kiểm tra đạt? Thao tác sẽ lưu kết quả đạt cùng tài khoản Admin của bạn.</p>
        <div className="flex flex-wrap gap-2"><button type="button" className={operationsButton} disabled={busy} onClick={() => void submit(true)}>{busy ? "Đang xác nhận..." : "Xác nhận kiểm tra đạt"}</button><button type="button" className="text-sm underline" disabled={busy} onClick={() => setConfirming(false)}>Hủy</button></div>
      </div>}
    </ValidatedForm>}
    {!canManage && ["pending", "pre_inspection"].includes(rental.status) && <p className="text-xs text-td-muted">Admin hoặc Quản lý phân công kỹ thuật viên tại đây.</p>}
    <Link href={`/admin/inspections?rentalId=${rental.id}`} className="inline-block text-sm font-semibold text-td-oxide underline">Mở biên bản kiểm tra trước / sau thuê</Link>
  </section>;
}
