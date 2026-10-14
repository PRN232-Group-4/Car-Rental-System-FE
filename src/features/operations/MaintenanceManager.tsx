"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import OperationFields, { nullableNumber } from "./OperationFields";
import type { OperationField } from "./OperationFields";
import { getMaintenance, saveMaintenance } from "./extended-api";
import type { MaintenanceRecord } from "./extended-api";
import { operationalError, operationsButton, operationsPanel } from "./api";

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
  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Quản lý bảo trì</h1><button type="button" className={operationsButton} onClick={() => setEditing(null)}>Tạo phiếu bảo trì</button></div>
    <ValidatedForm validation={filterValidation} onSubmit={() => setActiveFilter({ ...filter })} className={operationsPanel}><OperationFields prefix="maintenance-filter" values={filter} change={(name, value) => setFilter((current) => ({ ...current, [name]: value }))} fields={[{ name: "vehicleId", label: "Lọc theo mã xe", type: "number", integer: true }, { name: "status", label: "Trạng thái", options: [{ value: "", label: "Tất cả" }, ...Object.entries(statuses).map(([value, label]) => ({ value, label }))] }]} /><button type="submit" className={operationsButton}>Lọc danh sách</button></ValidatedForm>
    {query.isPending && <p role="status">Đang tải phiếu bảo trì...</p>}{query.error && <p role="alert" className="text-danger">{operationalError(query.error)} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p>}
    {query.data && <div className="overflow-x-auto rounded-2xl border border-border bg-surface"><table className="w-full text-left text-sm"><caption className="sr-only">Danh sách phiếu bảo trì</caption><thead><tr>{["Phiếu", "Xe", "Nhân viên", "Ngày dự kiến", "Trạng thái", "Chi phí", "Thao tác"].map((label) => <th key={label} className="whitespace-nowrap p-4">{label}</th>)}</tr></thead><tbody>{query.data.map((item) => <tr key={item.id} className="border-t border-border"><td className="p-4">#{item.id}</td><td className="p-4">#{item.vehicleId}</td><td className="p-4">{item.assignedStaffId ?? "Chưa gán"}</td><td className="p-4">{item.scheduledDate ?? "—"}</td><td className="p-4">{statuses[item.status as keyof typeof statuses] ?? item.status ?? "—"}</td><td className="p-4">{item.cost == null ? "—" : item.cost.toLocaleString("vi-VN") + " đ"}</td><td className="p-4"><button type="button" className="text-primary underline" onClick={() => setEditing(item)}>Cập nhật</button></td></tr>)}</tbody></table>{!query.data.length && <p className="p-5 text-sm">Không có phiếu bảo trì phù hợp.</p>}</div>}
    {editing !== undefined && <MaintenanceForm key={editing?.id ?? "new"} record={editing} close={() => setEditing(undefined)} saved={() => query.refetch()} />}
  </div>;
}
function MaintenanceForm({ record, close, saved }: { record: MaintenanceRecord | null; close: () => void; saved: () => Promise<unknown> }) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((field) => [field.name, record?.[field.name as keyof MaintenanceRecord] == null ? field.name === "status" ? "scheduled" : "" : String(record[field.name as keyof MaintenanceRecord])])));
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const validation = useInlineValidation();
  const submit = async () => {
    if (busy) return; setBusy(true); setError("");
    try { await saveMaintenance({ vehicleId: Number(values.vehicleId), facilityId: nullableNumber(values.facilityId), assignedStaffId: nullableNumber(values.assignedStaffId), status: values.status || null, maintenanceType: values.maintenanceType || null, scheduledDate: values.scheduledDate || null, isSafe: values.isSafe === "" ? null : values.isSafe === "true", description: values.description || null, cost: nullableNumber(values.cost) }, record?.id); await saved(); close(); }
    catch (failure) { const message = validation.report(failure); setError(failure instanceof TypeError ? operationalError(failure) : message); }
    finally { setBusy(false); }
  };
  return <ValidatedForm validation={validation} onSubmit={submit} className={operationsPanel}><h2 className="text-lg font-bold">{record ? `Cập nhật phiếu #${record.id}` : "Phiếu bảo trì mới"}</h2><fieldset disabled={busy}><OperationFields prefix="maintenance-edit" fields={fields} values={values} change={(name, value) => setValues((current) => ({ ...current, [name]: value }))} /></fieldset>{error && <p role="alert" className="text-sm text-danger">{error}</p>}<div className="flex gap-3"><button type="submit" disabled={busy} className={operationsButton}>{busy ? "Đang lưu..." : "Lưu phiếu bảo trì"}</button><button type="button" disabled={busy} onClick={close} className="rounded-xl border border-border px-4 py-3 text-sm">Đóng</button></div></ValidatedForm>;
}
