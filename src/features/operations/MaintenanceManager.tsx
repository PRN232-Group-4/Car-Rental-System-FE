"use client";

import { notifyError, notifySuccess } from "@/components/ui/Toaster";
import { useState } from "react";
import { formatAdminDate } from "@/lib/date-time";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { FormSkeleton } from "@/components/ui/Skeleton";
import VehicleName from "@/features/admin/VehicleName";
import VehiclePhotos from "@/features/admin/VehiclePhotos";
import StaffName from "@/features/admin/StaffName";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ADMIN_NAVIGATION_COUNTS_KEY } from "@/features/admin/navigation-counts";
import { InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import OperationFields, { nullableNumber } from "./OperationFields";
import type { OperationField } from "./OperationFields";
import { getMaintenance, saveMaintenance } from "./extended-api";
import type { MaintenanceRecord } from "./extended-api";
import { operationalError, operationsButton, toList } from "./api";
import { getFacilities, getStaffById, getVehicles } from "@/features/admin/api";
import { getInspectionTechnicians, isInspectionTechnician } from "./technician-api";
import { useOptionalSession } from "@/features/auth/AuthContext";

const statuses = { scheduled: "Đã lên lịch", in_progress: "Đang bảo trì", completed: "Hoàn thành", verified: "Đã kiểm tra", cancelled: "Đã hủy" };
const fields: OperationField[] = [
  { name: "vehicleId", label: "Mã phương tiện", type: "number", integer: true, required: true },
  { name: "facilityId", label: "Cơ sở phụ trách (tùy chọn)" },
  { name: "assignedStaffId", label: "Email kỹ thuật viên phụ trách (tùy chọn)" },
  { name: "maintenanceType", label: "Loại bảo trì" },
  { name: "scheduledDate", label: "Ngày dự kiến", type: "date" },
  { name: "status", label: "Trạng thái", options: Object.entries(statuses).map(([value, label]) => ({ value, label })) },
  { name: "cost", label: "Chi phí (đ)", type: "number" },
  { name: "isSafe", label: "Tình trạng an toàn", options: [{ value: "", label: "Chưa kết luận" }, { value: "true", label: "An toàn" }, { value: "false", label: "Không an toàn" }] },
  { name: "description", label: "Mô tả công việc", type: "textarea" },
];
export default function MaintenanceManager() {
  const cache = useQueryClient();
  const [filter, setFilter] = useState({ vehicleId: "", status: "" });
  const [activeFilter, setActiveFilter] = useState(filter);
  const [editing, setEditing] = useState<MaintenanceRecord | null | undefined>();
  const filterValidation = useInlineValidation();
  const query = useQuery({ queryKey: ["maintenance-list", activeFilter], queryFn: () => getMaintenance(activeFilter.vehicleId ? Number(activeFilter.vehicleId) : undefined, activeFilter.status || undefined), retry: false });
  const vehiclesQuery = useQuery({ queryKey: ["admin-vehicles-for-maintenance"], queryFn: async () => {
    const vehicles = [];
    for (let page = 1; ; page += 1) {
      const result = await getVehicles({ page, pageSize: 100 });
      const items = result.items ?? [];
      vehicles.push(...items);
      if (!items.length || vehicles.length >= result.totalCount) return vehicles;
    }
  }, retry: false });
  const vehicleOptions = (vehiclesQuery.data ?? []).map((v) => ({
    value: String(v.id),
    label: [[v.brand, v.model].filter(Boolean).join(" "), v.licensePlate].filter(Boolean).join(" · ") || "Phương tiện chưa cập nhật tên",
  }));
  return <div className="space-y-6">
    <TransitFolio title="Quản lý bảo trì" description="Mỗi phiếu là một mốc thời gian của xe: ngày dự kiến, tình trạng an toàn và chi phí thực tế.">
      <button type="button" className={`${operationsButton} self-start sm:self-end`} onClick={() => setEditing(null)}>Tạo phiếu bảo trì</button>
    </TransitFolio>
    <ValidatedForm validation={filterValidation} onSubmit={() => setActiveFilter({ ...filter })}>
      <AdminFilterBar description="Chọn phương tiện và trạng thái để tìm phiếu bảo trì." actions={<>
        <AdminFilterButton type="submit">Lọc danh sách</AdminFilterButton>
        <AdminFilterButton variant="secondary" disabled={!filter.vehicleId && !filter.status && !activeFilter.vehicleId && !activeFilter.status && Object.keys(filterValidation.errors).length === 0} onClick={() => { const cleared = { vehicleId: "", status: "" }; setFilter(cleared); setActiveFilter(cleared); filterValidation.reset(); }}>Đặt lại</AdminFilterButton>
      </>}>
        <AdminFilterField label="Phương tiện" htmlFor="maintenance-filter-vehicleId" select>
          <InlineSelect id="maintenance-filter-vehicleId" name="vehicleId" value={filter.vehicleId} disabled={vehiclesQuery.isPending || vehiclesQuery.isError} onChange={(event) => setFilter((current) => ({ ...current, vehicleId: event.target.value }))}>
            <option value="">Tất cả phương tiện</option>{vehicleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </InlineSelect>
        </AdminFilterField>
        <AdminFilterField label="Trạng thái" htmlFor="maintenance-filter-status" select>
          <InlineSelect id="maintenance-filter-status" name="status" value={filter.status} onChange={(event) => setFilter((current) => ({ ...current, status: event.target.value }))}>
            <option value="">Tất cả trạng thái</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </InlineSelect>
        </AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    {query.error && <p role="alert" className="text-danger">{operationalError(query.error)} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p>}
    {(() => {
      const maintenanceList = toList<MaintenanceRecord>(query.data);
      return (
        <AdminTableCard>
          <div className="border-b border-td-rule pb-2 pt-3">
            <h2 className="text-sm font-bold text-td-ink">Danh sách phiếu bảo trì</h2>
            <p className="mt-1 text-xs text-td-muted">{query.isPending ? "Đang tải..." : `${maintenanceList.length} phiếu`}</p>
          </div>
          <AdminTable className="min-w-[900px]" aria-busy={query.isPending}>
            <caption className="sr-only">Danh sách phiếu bảo trì</caption>
            <thead><tr>{["Xe", "Nhân viên", "Ngày dự kiến", "Trạng thái", "Chi phí"].map((label) => <th key={label} scope="col">{label}</th>)}<th scope="col" data-actions>Thao tác</th></tr></thead>
            <tbody>
              {query.isPending ? <AdminTableSkeleton columns={6} label="Đang tải phiếu bảo trì" /> : maintenanceList.map((item) => <tr key={item.id}>
                <td><VehicleName vehicleId={item.vehicleId} /></td>
                <td className="text-td-muted"><StaffName staffId={item.assignedStaffId} email={item.assignedStaffEmail} /></td>
                <td className="text-td-muted">{formatAdminDate(item.scheduledDate)}</td>
                <td><AdminStatusBadge domain="maintenance" status={item.status}>{statuses[item.status as keyof typeof statuses] ?? item.status ?? "—"}</AdminStatusBadge></td>
                <td className="font-medium text-td-ink">{item.cost == null ? "—" : item.cost.toLocaleString("vi-VN") + " ₫"}</td>
                <td data-actions><AdminRowAction action="edit" label="Cập nhật" onClick={() => setEditing(item)} /></td>
              </tr>)}
              {!query.isPending && !query.error && !maintenanceList.length && <AdminTableEmptyRow colSpan={6}>Không có phiếu bảo trì phù hợp.</AdminTableEmptyRow>}
            </tbody>
          </AdminTable>
        </AdminTableCard>
      );
    })()}
    {editing !== undefined && <MaintenanceForm key={editing?.id ?? "new"} record={editing} vehicleOptions={vehicleOptions} close={() => setEditing(undefined)} saved={() => Promise.all([query.refetch(), cache.invalidateQueries({ queryKey: ADMIN_NAVIGATION_COUNTS_KEY })])} />}
  </div>;
}
function MaintenanceForm({ record, vehicleOptions = [], close, saved }: { record: MaintenanceRecord | null; vehicleOptions?: { value: string; label: string }[]; close: () => void; saved: () => Promise<unknown> }) {
  const session = useOptionalSession();
  const canManage = Boolean(session?.hasAnyRole(["Admin", "Manager"]));
  const technicians = useQuery({ queryKey: ["inspection-technicians"], queryFn: getInspectionTechnicians, enabled: canManage, retry: false });
  const facilities = useQuery({ queryKey: ["admin-facilities"], queryFn: getFacilities, enabled: canManage, retry: false });
  const assignedStaff = useQuery({ queryKey: ["admin-staff", record?.assignedStaffId], queryFn: () => getStaffById(record!.assignedStaffId!), enabled: canManage && record?.assignedStaffId != null && !record.assignedStaffEmail, retry: false });
  const technicianOptions = (technicians.data ?? []).filter(isInspectionTechnician).map((staff) => ({ value: String(staff.id), label: staff.email?.trim() || "Chưa cập nhật email kỹ thuật viên" }));
  const facilityOptions = (facilities.data ?? []).map((facility) => ({ value: String(facility.id), label: facility.name?.trim() || "Cơ sở chưa cập nhật tên" }));
  const directoriesPending = canManage && (technicians.isPending || facilities.isPending);
  const directoriesFailed = canManage && (technicians.isError || facilities.isError);
  const formFields = fields.map((f) => {
    if (f.name === "assignedStaffId") {
      if (!canManage) return { ...f, disabled: true, options: [{ value: record?.assignedStaffId == null ? "" : String(record.assignedStaffId), label: record?.assignedStaffId == null ? "Chưa phân công kỹ thuật viên" : record.assignedStaffEmail || "Đã phân công kỹ thuật viên" }] };
      const missing = record?.assignedStaffId != null && !technicianOptions.some((option) => option.value === String(record.assignedStaffId));
      return { ...f, options: [{ value: "", label: "Chưa phân công kỹ thuật viên" }, ...technicianOptions, ...(missing ? [{ value: String(record.assignedStaffId), label: `${record.assignedStaffEmail || assignedStaff.data?.email?.trim() || "Kỹ thuật viên hiện tại"} (không khả dụng)`, disabled: true }] : [])] };
    }
    if (f.name === "facilityId") {
      if (!canManage) return { ...f, disabled: true, options: [{ value: record?.facilityId == null ? "" : String(record.facilityId), label: record?.facilityId == null ? "Chưa chọn cơ sở" : record.facilityName || "Cơ sở đã phân công" }] };
      const missing = record?.facilityId != null && !facilityOptions.some((option) => option.value === String(record.facilityId));
      return { ...f, options: [{ value: "", label: "Chưa chọn cơ sở" }, ...facilityOptions, ...(missing ? [{ value: String(record.facilityId), label: "Cơ sở hiện tại không còn khả dụng", disabled: true }] : [])] };
    }
    if (f.name === "vehicleId") {
      return {
        ...f,
        type: undefined,
        label: "Phương tiện",
        options: [{ value: "", label: "Chọn phương tiện" }, ...vehicleOptions, ...(record && !vehicleOptions.some((option) => option.value === String(record.vehicleId)) ? [{ value: String(record.vehicleId), label: "Phương tiện hiện tại không còn khả dụng", disabled: true }] : [])],
      };
    }
    return f;
  });
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(formFields.map((field) => [field.name, record?.[field.name as keyof MaintenanceRecord] == null ? field.name === "status" ? "scheduled" : "" : String(record[field.name as keyof MaintenanceRecord])])));
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const validation = useInlineValidation();
  const submit = async () => {
    if (busy || directoriesPending || directoriesFailed) return; setBusy(true); setError("");
    try { await saveMaintenance({ vehicleId: Number(values.vehicleId), facilityId: nullableNumber(values.facilityId), assignedStaffId: nullableNumber(values.assignedStaffId), status: values.status || null, maintenanceType: values.maintenanceType || null, scheduledDate: values.scheduledDate || null, isSafe: values.isSafe === "" ? null : values.isSafe === "true", description: values.description || null, cost: nullableNumber(values.cost) }, record?.id); notifySuccess(record ? "Đã cập nhật phiếu bảo trì." : "Đã tạo phiếu bảo trì."); await saved(); close(); }
    catch (failure) { const message = validation.report(failure); const generalError = failure instanceof TypeError ? operationalError(failure) : message; setError(generalError); notifyError(generalError); }
    finally { setBusy(false); }
  };
  return <FormDialog title={record ? "Cập nhật phiếu bảo trì" : "Phiếu bảo trì mới"} onClose={close} busy={busy} size="xl"><ValidatedForm validation={validation} validate={() => ({
    assignedStaffId: canManage && values.assignedStaffId && !technicianOptions.some((option) => option.value === values.assignedStaffId) ? "Vui lòng chọn kỹ thuật viên đang hoạt động hoặc bỏ phân công." : undefined,
    facilityId: canManage && values.facilityId && !facilityOptions.some((option) => option.value === values.facilityId) ? "Vui lòng chọn cơ sở trong danh sách hoặc bỏ lựa chọn." : undefined,
  })} onSubmit={submit} className="space-y-5">
    {directoriesPending ? <FormSkeleton label="Đang tải cơ sở và kỹ thuật viên" fields={fields.length} /> : <fieldset disabled={busy || directoriesFailed}><OperationFields prefix="maintenance-edit" fields={formFields} values={values} change={(name, value) => setValues((current) => ({ ...current, [name]: value }))} /></fieldset>}
    {technicians.isError && <p role="alert" className="text-sm text-danger">Không thể tải kỹ thuật viên. <button type="button" className="underline" onClick={() => void technicians.refetch()}>Tải lại kỹ thuật viên</button></p>}
    {facilities.isError && <p role="alert" className="text-sm text-danger">Không thể tải cơ sở. <button type="button" className="underline" onClick={() => void facilities.refetch()}>Tải lại cơ sở</button></p>}
    {Number(values.vehicleId) > 0 && <VehiclePhotos vehicleId={values.vehicleId} />}{error && <p role="alert" className="text-sm text-danger">{error}</p>}<FormDialogFooter><button type="submit" disabled={busy || directoriesPending || directoriesFailed} className={operationsButton}>{busy ? "Đang lưu..." : "Lưu phiếu bảo trì"}</button><button type="button" disabled={busy} onClick={close} className="rounded border border-td-rule px-4 py-3 text-sm">Đóng</button></FormDialogFooter></ValidatedForm></FormDialog>;
}
