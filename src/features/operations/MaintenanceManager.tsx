"use client";
import { useState } from "react";
import { formatAdminDate } from "@/lib/date-time";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import VehicleName from "@/features/admin/VehicleName";
import StaffName from "@/features/admin/StaffName";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import { useQuery } from "@tanstack/react-query";
import { InlineInput, InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import OperationFields, { nullableNumber } from "./OperationFields";
import type { OperationField } from "./OperationFields";
import { getMaintenance, saveMaintenance } from "./extended-api";
import type { MaintenanceRecord } from "./extended-api";
import { operationalError, operationsButton } from "./api";
import { getVehicles } from "@/features/admin/api";

const statuses = { scheduled: "Đã lên lịch", in_progress: "Đang bảo trì", completed: "Hoàn thành", verified: "Đã kiểm tra", cancelled: "Đã hủy" };
const fields: OperationField[] = [
  { name: "vehicleId", label: "Mã phương tiện", type: "number", integer: true, required: true },
  { name: "facilityId", label: "Mã cơ sở (tùy chọn)", type: "number", integer: true },
  { name: "assignedStaffId", label: "Mã nhân viên phụ trách (tùy chọn)", type: "number", integer: true },
  { name: "maintenanceType", label: "Loại bảo trì" },
  { name: "scheduledDate", label: "Ngày dự kiến", type: "date" },
  { name: "status", label: "Trạng thái", options: Object.entries(statuses).map(([value, label]) => ({ value, label })) },
  { name: "cost", label: "Chi phí (đ)", type: "number" },
  { name: "isSafe", label: "Tình trạng an toàn", options: [{ value: "", label: "Chưa kết luận" }, { value: "true", label: "An toàn" }, { value: "false", label: "Không an toàn" }] },
  { name: "description", label: "Mô tả công việc", type: "textarea" },
];
export default function MaintenanceManager() {
  const [filter, setFilter] = useState({ vehicleId: "", status: "" });
  const [activeFilter, setActiveFilter] = useState(filter);
  const [editing, setEditing] = useState<MaintenanceRecord | null | undefined>();
  const filterValidation = useInlineValidation();
  const query = useQuery({ queryKey: ["maintenance-list", activeFilter], queryFn: () => getMaintenance(activeFilter.vehicleId ? Number(activeFilter.vehicleId) : undefined, activeFilter.status || undefined), retry: false });
  const vehiclesQuery = useQuery({ queryKey: ["admin-vehicles-for-maintenance"], queryFn: () => getVehicles({ page: 1, pageSize: 100 }), retry: false });
  const vehicleOptions = (vehiclesQuery.data?.items ?? []).map((v) => ({
    value: String(v.id),
    label: `#${v.id} - ${[v.brand, v.model].filter(Boolean).join(" ") || v.licensePlate || `Phương tiện #${v.id}`}`,
  }));
  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Quản lý bảo trì</h1><button type="button" className={operationsButton} onClick={() => setEditing(null)}>Tạo phiếu bảo trì</button></div>
    <ValidatedForm validation={filterValidation} onSubmit={() => setActiveFilter({ ...filter })}>
      <AdminFilterBar description="Chọn phương tiện và trạng thái để tìm phiếu bảo trì." actions={<>
        <AdminFilterButton type="submit">Lọc danh sách</AdminFilterButton>
        <AdminFilterButton variant="secondary" disabled={!filter.vehicleId && !filter.status && !activeFilter.vehicleId && !activeFilter.status && Object.keys(filterValidation.errors).length === 0} onClick={() => { const cleared = { vehicleId: "", status: "" }; setFilter(cleared); setActiveFilter(cleared); filterValidation.reset(); }}>Đặt lại</AdminFilterButton>
      </>}>
        <AdminFilterField label="Mã phương tiện" htmlFor="maintenance-filter-vehicleId">
          <InlineInput id="maintenance-filter-vehicleId" name="vehicleId" type="number" step="1" value={filter.vehicleId} placeholder="Nhập mã phương tiện" onChange={(event) => setFilter((current) => ({ ...current, vehicleId: event.target.value }))} />
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
      const maintenanceList: MaintenanceRecord[] = Array.isArray(query.data)
        ? query.data
        : ((query.data as any)?.items ?? []);
      return (
        <AdminTableCard>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-bold text-ink">Danh sách phiếu bảo trì</h2>
            <p className="mt-1 text-xs text-ink-3">{query.isPending ? "Đang tải..." : `${maintenanceList.length} phiếu`}</p>
          </div>
          <AdminTable className="min-w-[900px]" aria-busy={query.isPending}>
            <caption className="sr-only">Danh sách phiếu bảo trì</caption>
            <thead><tr>{["Xe", "Nhân viên", "Ngày dự kiến", "Trạng thái", "Chi phí"].map((label) => <th key={label} scope="col">{label}</th>)}<th scope="col" data-actions>Thao tác</th></tr></thead>
            <tbody>
              {query.isPending ? <AdminTableSkeleton columns={6} label="Đang tải phiếu bảo trì" /> : maintenanceList.map((item) => <tr key={item.id}>
                <td><VehicleName vehicleId={item.vehicleId} /></td>
                <td className="text-ink-3"><StaffName staffId={item.assignedStaffId} /></td>
                <td className="text-ink-3">{formatAdminDate(item.scheduledDate)}</td>
                <td><AdminStatusBadge domain="maintenance" status={item.status}>{statuses[item.status as keyof typeof statuses] ?? item.status ?? "—"}</AdminStatusBadge></td>
                <td className="font-medium text-ink">{item.cost == null ? "—" : item.cost.toLocaleString("vi-VN") + " ₫"}</td>
                <td data-actions><AdminRowAction action="edit" label="Cập nhật" onClick={() => setEditing(item)} /></td>
              </tr>)}
              {!query.isPending && !query.error && !maintenanceList.length && <AdminTableEmptyRow colSpan={6}>Không có phiếu bảo trì phù hợp.</AdminTableEmptyRow>}
            </tbody>
          </AdminTable>
        </AdminTableCard>
      );
    })()}
    {editing !== undefined && <MaintenanceForm key={editing?.id ?? "new"} record={editing} vehicleOptions={vehicleOptions} close={() => setEditing(undefined)} saved={() => query.refetch()} />}
  </div>;
}
function MaintenanceForm({ record, vehicleOptions = [], close, saved }: { record: MaintenanceRecord | null; vehicleOptions?: { value: string; label: string }[]; close: () => void; saved: () => Promise<unknown> }) {
  const formFields = fields.map((f) => {
    if (f.name === "vehicleId" && vehicleOptions.length > 0) {
      return {
        ...f,
        type: undefined,
        options: [{ value: "", label: "Chọn phương tiện" }, ...vehicleOptions],
      };
    }
    return f;
  });
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(formFields.map((field) => [field.name, record?.[field.name as keyof MaintenanceRecord] == null ? field.name === "status" ? "scheduled" : "" : String(record[field.name as keyof MaintenanceRecord])])));
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const validation = useInlineValidation();
  const submit = async () => {
    if (busy) return; setBusy(true); setError("");
    try { await saveMaintenance({ vehicleId: Number(values.vehicleId), facilityId: nullableNumber(values.facilityId), assignedStaffId: nullableNumber(values.assignedStaffId), status: values.status || null, maintenanceType: values.maintenanceType || null, scheduledDate: values.scheduledDate || null, isSafe: values.isSafe === "" ? null : values.isSafe === "true", description: values.description || null, cost: nullableNumber(values.cost) }, record?.id); await saved(); close(); }
    catch (failure) { const message = validation.report(failure); setError(failure instanceof TypeError ? operationalError(failure) : message); }
    finally { setBusy(false); }
  };
  return <FormDialog title={record ? "Cập nhật phiếu bảo trì" : "Phiếu bảo trì mới"} onClose={close} busy={busy} size="xl"><ValidatedForm validation={validation} onSubmit={submit} className="space-y-5"><fieldset disabled={busy}><OperationFields prefix="maintenance-edit" fields={formFields} values={values} change={(name, value) => setValues((current) => ({ ...current, [name]: value }))} /></fieldset>{error && <p role="alert" className="text-sm text-danger">{error}</p>}<FormDialogFooter><button type="submit" disabled={busy} className={operationsButton}>{busy ? "Đang lưu..." : "Lưu phiếu bảo trì"}</button><button type="button" disabled={busy} onClick={close} className="rounded-xl border border-line px-4 py-3 text-sm">Đóng</button></FormDialogFooter></ValidatedForm></FormDialog>;
}
