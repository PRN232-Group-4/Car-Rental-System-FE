"use client";

import { notifyError, notifySuccess } from "@/components/ui/Toaster";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiClientError } from "@/api/api-client";
import { InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOptionalSession } from "@/features/auth/AuthContext";
import { formatAdminDateTime } from "@/lib/date-time";
import { changeRentalStatus, operationalError, operationsButton, operationsInput, type OperationalRental } from "./api";
import { ADMIN_NAVIGATION_COUNTS_KEY } from "@/features/admin/navigation-counts";
import { assignInspectionTechnician, confirmInspectionChecked, getInspectionAssignment, getInspectionTechnicians, inspectionAssignmentError, inspectionConfirmationError } from "./technician-api";

export default function TechnicianAssignmentForm({ rental, refresh, compact = false, showApprovalAction = true, embedded = false }: {
  rental: OperationalRental;
  refresh: () => Promise<unknown>;
  compact?: boolean;
  showApprovalAction?: boolean;
  embedded?: boolean;
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
  const [inspectionAction, setInspectionAction] = useState("assign");
  const mutationLock = useRef(false);
  const canRead = Boolean(session?.hasAnyRole(["Admin", "Manager", "CustomerService", "Maintenance"]));
  const canManage = Boolean(session?.hasAnyRole(["Admin", "Manager"]));
  const canConfirm = Boolean(session?.hasAnyRole(["Admin"]));
  const post = ["post_inspection", "completed"].includes(rental.status);
  const phaseLabel = post ? "sau trả xe" : "trước thuê";
  const inspected = post ? rental.hasPostInspection === true : rental.hasPassingPreInspection === true;
  const assignmentKey = post ? ["inspection-assignment", rental.id, rental.vehicleId, "post_rental"] : ["inspection-assignment", rental.id, rental.vehicleId];
  const canApproveChecked = Boolean(session?.hasAnyRole(["Admin", "Manager", "CustomerService"])) && rental.status === "pending" && rental.hasPassingPreInspection === true;
  const canAssign = canManage && (post ? rental.status === "post_inspection" : rental.status === "pre_inspection") && !inspected;
  const assignment = useQuery({
    queryKey: assignmentKey,
    queryFn: () => post ? getInspectionAssignment(Number(rental.id), true) : getInspectionAssignment(Number(rental.id)),
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
  const refreshViews = async () => {
    await Promise.all([refresh(), cache.invalidateQueries({ queryKey: ["operational-rentals-queue"] }), cache.invalidateQueries({ queryKey: ["admin-rentals"] }), cache.invalidateQueries({ queryKey: ADMIN_NAVIGATION_COUNTS_KEY })]);
  };
  const approveChecked = async () => {
    if (!canApproveChecked || mutationLock.current) return;
    mutationLock.current = true; setBusy(true); setError(""); setSuccess("");
    try {
      await changeRentalStatus(Number(rental.id), "pre_inspection");
      notifySuccess("Đã duyệt yêu cầu đã kiểm tra. Tiếp tục chuẩn bị bàn giao xe.");
      await refreshViews();
    } catch (failure) { const message = operationalError(failure); setError(message); notifyError(message); }
    finally { mutationLock.current = false; setBusy(false); }
  };
  const submit = async (checked = false) => {
    if (mutationLock.current || !canAssign || (checked && !canConfirm) || assignment.isPending || assignment.isError || technicians.isPending || technicians.isError) return;
    mutationLock.current = true;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const saved = await (post
        ? checked ? confirmInspectionChecked(Number(rental.id), Number(technicianId), false, true) : assignInspectionTechnician(Number(rental.id), Number(technicianId), true)
        : (checked ? confirmInspectionChecked : assignInspectionTechnician)(Number(rental.id), Number(technicianId)));
      cache.setQueryData(assignmentKey, saved);
      setSelectedId(null);
      setConfirming(false);
      const message = checked ? post ? "Đã xác nhận phân công và kiểm tra sau trả xe đạt." : "Đã xác nhận phân công và kiểm tra trước thuê đạt." : "Đã phân công kỹ thuật viên. Đang chờ kết quả kiểm tra.";
      setSuccess(message);
      notifySuccess(message);
      void cache.invalidateQueries({ queryKey: ["inspection-directory"] });
      void cache.invalidateQueries({ queryKey: ["inspection-work-queue"] });
      await refreshViews();
    } catch (failure) {
      const confirmationError = checked || post ? inspectionConfirmationError(failure, post) : null;
      if (confirmationError) { setError(confirmationError); notifyError(confirmationError); return; }
      if (failure instanceof ApiClientError && ["TECHNICIAN_NOT_ELIGIBLE", "TECHNICIAN_ID_INVALID"].includes(failure.code ?? "")) {
        validation.show({ technicianStaffId: "Kỹ thuật viên không còn khả dụng. Vui lòng tải lại và chọn kỹ thuật viên đang hoạt động." });
        void technicians.refetch();
        return;
      }
      const message = validation.report(failure, { staffid: "technicianStaffId" });
      const generalError = failure instanceof TypeError ? operationalError(failure) : message; setError(generalError); notifyError(generalError);
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };
  if (!canRead) return null;
  const assignmentInfo = assignment.isPending ? <div role="status" aria-label="Đang tải phân công kiểm tra"><Skeleton className="h-12 w-full" /></div> : assignment.isError ?
    <p role="alert" className="text-sm text-danger">{inspectionAssignmentError(assignment.error)} <button type="button" className="underline" onClick={() => void assignment.refetch()}>Thử lại</button></p> : assignment.data ?
      <p className="break-words text-sm text-td-ink">Đã giao: <strong>{assignment.data.technicianEmail || options.find((staff) => staff.id === assignment.data?.technicianStaffId)?.email || "Chưa cập nhật email kỹ thuật viên"}</strong><span className="mt-1 block text-xs text-td-muted">{formatAdminDateTime(assignment.data.assignedAt)}</span></p> :
      <p className="text-sm text-td-muted">Chưa phân công kỹ thuật viên kiểm tra.</p>;
  const inspectionLink = <Link href={`/admin/inspections?rentalId=${rental.id}`} className="inline-block text-sm font-semibold text-td-oxide underline">Mở biên bản kiểm tra trước / sau thuê</Link>;
  if (compact && !canAssign) return <section aria-label={`Phân công kiểm tra ${phaseLabel}`} className={embedded ? "min-w-0 space-y-3 pl-6" : "space-y-3 border-t border-td-rule pt-4"}>
    <h2 className="text-sm font-bold text-td-ink">Kiểm tra {phaseLabel}</h2>
    <p className="text-sm text-td-muted">{rental.status === "pending" ? "Xác nhận đơn thuê trước, sau đó phân công và xác nhận Đã inspect." : inspected ? post ? "Đã có biên bản kiểm tra sau trả xe." : "Đã đạt kiểm tra trước thuê." : "Xem lại hồ sơ kiểm tra."}</p>
    <details className="space-y-3"><summary className="cursor-pointer text-sm font-semibold text-td-oxide">Chi tiết kiểm tra</summary>{assignmentInfo}{inspectionLink}</details>
  </section>;
  return <section className={embedded ? "min-w-0 space-y-3 pl-6" : "min-w-0 space-y-4 border-t border-td-rule pt-5"} aria-label={`Phân công kiểm tra ${phaseLabel}`}>
    <h2 className="text-sm font-bold text-td-ink">Kỹ thuật viên kiểm tra {phaseLabel}</h2>
    {post && inspected && <p role="status" className="text-sm text-td-teal">Đã có biên bản kiểm tra sau trả xe.</p>}
    {rental.status === "pending" && !rental.hasPassingPreInspection && <p className="text-sm text-td-muted">Xác nhận đơn thuê trước, sau đó phân công và xác nhận Đã inspect.</p>}
    {!post && rental.hasPassingPreInspection === true && <p role="status" className="text-sm text-td-teal">{rental.hasDriver ? "Đơn có tài xế: đã đạt kiểm tra trước thuê theo mặc định." : "Đã đạt kiểm tra trước thuê."}</p>}
    {rental.status === "pending" && rental.hasPassingPreInspection === true && <p className="text-sm text-td-muted">Kiểm tra trước thuê đã đạt nhưng yêu cầu chưa được duyệt. Duyệt yêu cầu để chuyển tiến trình sang Kiểm tra trước thuê; xe chưa được bàn giao.</p>}
    {canApproveChecked && showApprovalAction && <ValidatedForm validation={validation} onSubmit={approveChecked} className="space-y-3">
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={busy} className={`${operationsButton} w-full`}>{busy ? "Đang duyệt..." : "Duyệt yêu cầu đã kiểm tra"}</button>
    </ValidatedForm>}
    {assignmentInfo}
    {canAssign && <ValidatedForm validation={validation} onSubmit={() => submit(compact && canConfirm && inspectionAction === "checked")} validate={() => ({
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
      {compact && canConfirm && <div>
        <label htmlFor={`${inputId}-action`} className="text-xs font-semibold text-td-muted">Thao tác kiểm tra</label>
        <InlineSelect id={`${inputId}-action`} name="inspectionAction" className={operationsInput} disabled={busy} value={inspectionAction} onChange={event => setInspectionAction(event.target.value)}>
          <option value="assign">Phân công, chờ kỹ thuật kiểm tra</option>
          <option value="checked">Đã inspect — xác nhận kiểm tra đạt</option>
        </InlineSelect>
        {inspectionAction === "checked" && <p className="mt-2 text-xs text-td-muted">Chỉ xác nhận khi xe thực tế đã kiểm tra đạt. Hệ thống lưu kết quả đạt cùng tài khoản Admin của bạn.{post && " Nếu có hư hỏng hoặc không đạt, hãy mở biên bản kiểm tra đầy đủ để ghi nhận."}</p>}
      </div>}
      {technicians.isPending && <p role="status" className="text-xs text-td-muted">Đang tải kỹ thuật viên...</p>}
      {technicians.isError && <p role="alert" className="text-sm text-danger">Không thể tải kỹ thuật viên. <button type="button" className="underline" onClick={() => void technicians.refetch()}>Tải lại kỹ thuật viên</button></p>}
      {technicians.isSuccess && !options.length && <p className="text-xs text-td-muted">Chưa có nhân viên kỹ thuật đang hoạt động. Cập nhật vai trò Kỹ thuật tại mục Nhân sự.</p>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {success && <p role="status" className="text-sm text-td-ink">{success}</p>}
      <button type="submit" className={`${operationsButton} w-full`} disabled={busy || assignment.isPending || assignment.isError || technicians.isPending || technicians.isError || !options.length}>
        {busy ? "Đang xử lý..." : compact ? inspectionAction === "checked" && canConfirm ? "Đã inspect" : "Xác nhận" : "Lưu phân công kiểm tra"}
      </button>
      {!compact && canConfirm && <button type="button" className={`${operationsButton} w-full`} disabled={busy || assignment.isPending || assignment.isError || technicians.isPending || technicians.isError || !options.length} onClick={() => {
        if (!options.some((staff) => String(staff.id) === technicianId)) {
          validation.show({ technicianStaffId: "Vui lòng chọn kỹ thuật viên phụ trách trước khi xác nhận." });
          document.getElementById(inputId)?.focus();
          return;
        }
        setConfirming(true);
      }}>Đã inspect</button>}
      {!compact && confirming && <div role="group" aria-label="Xác nhận kiểm tra trực tiếp" className="space-y-3 border-t border-td-rule pt-3">
        <p className="text-sm text-td-muted">Xác nhận xe đã được phân công và kiểm tra {phaseLabel} đạt? Thao tác sẽ lưu kết quả đạt cùng tài khoản Admin của bạn.</p>
        <div className="flex flex-wrap gap-2"><button type="button" className={operationsButton} disabled={busy} onClick={() => void submit(true)}>{busy ? "Đang xác nhận..." : "Xác nhận kiểm tra đạt"}</button><button type="button" className="text-sm underline" disabled={busy} onClick={() => setConfirming(false)}>Hủy</button></div>
      </div>}
    </ValidatedForm>}
    {!canManage && ["pending", "pre_inspection"].includes(rental.status) && <p className="text-xs text-td-muted">Admin hoặc Quản lý phân công kỹ thuật viên tại đây.</p>}
    {inspectionLink}
  </section>;
}
