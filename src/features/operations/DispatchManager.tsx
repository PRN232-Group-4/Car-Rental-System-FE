"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { localDateTime, validateBookingTimes } from "@/features/rentals/booking-rules";
import OperationFields from "./OperationFields";
import type { OperationField } from "./OperationFields";
import { getDriverShifts, getDispatchSchedule, saveDriverShift } from "./extended-api";
import type { DriverShift } from "./extended-api";
import { getOperationalDrivers, operationalError, operationsButton, operationsPanel } from "./api";
import RentalLookup from "./RentalLookup";
import { AssignmentForm } from "./RentalOperations";

const asIso = (value: string) => new Date(value).toISOString();
const dateLabel = (value?: string) => value ? new Date(value).toLocaleString("vi-VN") : "—";
export default function DispatchManager() {
  const [filter, setFilter] = useState(() => ({ driverStaffId: "", startTime: localDateTime(new Date()), endTime: localDateTime(new Date(Date.now() + 7 * 86400000)) }));
  const [activeFilter, setActiveFilter] = useState(filter);
  const [editing, setEditing] = useState<DriverShift | null | undefined>();
  const validation = useInlineValidation();
  const drivers = useQuery({ queryKey: ["operational-drivers"], queryFn: getOperationalDrivers, retry: false });
  const from = asIso(activeFilter.startTime); const to = asIso(activeFilter.endTime);
  const driverId = activeFilter.driverStaffId ? Number(activeFilter.driverStaffId) : undefined;
  const shifts = useQuery({ queryKey: ["dispatch-shifts", activeFilter], queryFn: () => getDriverShifts(from, to, driverId), retry: false });
  const schedule = useQuery({ queryKey: ["dispatch-schedule", activeFilter], queryFn: () => getDispatchSchedule(from, to, driverId), retry: false });
  const driverOptions = (drivers.data ?? []).map((item) => ({ value: String(item.id), label: item.fullName ?? item.email ?? `Tài xế #${item.id}` }));
  const refresh = async () => { await Promise.all([shifts.refetch(), schedule.refetch()]); };
  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Điều phối tài xế</h1><button type="button" className={operationsButton} onClick={() => setEditing(null)}>Tạo ca làm</button></div>
    <ValidatedForm validation={validation} validate={() => validateBookingTimes(filter.startTime, filter.endTime)} onSubmit={() => setActiveFilter({ ...filter })} className={operationsPanel}><OperationFields prefix="dispatch-filter" values={filter} change={(name, value) => setFilter((current) => ({ ...current, [name]: value }))} fields={[{ name: "driverStaffId", label: "Tài xế", options: [{ value: "", label: "Tất cả tài xế" }, ...driverOptions] }, { name: "startTime", label: "Từ ngày giờ", type: "datetime-local", required: true }, { name: "endTime", label: "Đến ngày giờ", type: "datetime-local", required: true }]} /><button type="submit" className={operationsButton}>Xem lịch</button></ValidatedForm>
    {drivers.error && <p role="alert" className="text-red-700">{operationalError(drivers.error)} <button type="button" className="underline" onClick={() => void drivers.refetch()}>Tải lại tài xế</button></p>}
    <section className={operationsPanel}><h2 className="text-lg font-bold">Ca làm việc</h2>{shifts.isPending && <p role="status">Đang tải ca làm...</p>}{shifts.error && <p role="alert" className="text-red-700">{operationalError(shifts.error)} <button type="button" className="underline" onClick={() => void shifts.refetch()}>Thử lại</button></p>}
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Danh sách ca làm tài xế</caption><thead><tr>{["Ca", "Tài xế", "Bắt đầu", "Kết thúc", "Trạng thái", "Thao tác"].map((label) => <th key={label} className="whitespace-nowrap p-3">{label}</th>)}</tr></thead><tbody>{shifts.data?.map((item) => <tr key={item.id} className="border-t border-border"><td className="p-3">#{item.id}</td><td className="p-3">{driverOptions.find((option) => option.value === String(item.driverStaffId))?.label ?? `#${item.driverStaffId}`}</td><td className="p-3">{dateLabel(item.startTime)}</td><td className="p-3">{dateLabel(item.endTime)}</td><td className="p-3">{item.status ?? "—"}</td><td className="p-3"><button type="button" className="text-primary underline" onClick={() => setEditing(item)}>Sửa / hủy ca</button></td></tr>)}</tbody></table></div>{shifts.data?.length === 0 && <p className="text-sm text-ink-muted">Không có ca làm trong khoảng thời gian này.</p>}
    </section>
    {editing !== undefined && <ShiftForm key={editing?.id ?? "new"} record={editing} drivers={driverOptions} close={() => setEditing(undefined)} saved={refresh} />}
    <section className={operationsPanel}><h2 className="text-lg font-bold">Các chuyến đã phân công</h2>{schedule.isPending && <p role="status">Đang tải lịch chuyến...</p>}{schedule.error && <p role="alert" className="text-red-700">{operationalError(schedule.error)} <button type="button" className="underline" onClick={() => void schedule.refetch()}>Thử lại</button></p>}
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Lịch chuyến được phân cho tài xế</caption><thead><tr>{["Đơn thuê", "Tài xế", "Xe", "Nhận xe", "Trả xe", "Trạng thái"].map((label) => <th key={label} className="whitespace-nowrap p-3">{label}</th>)}</tr></thead><tbody>{schedule.data?.map((item, index) => <tr key={item.assignmentId ?? index} className="border-t border-border"><td className="p-3"><Link className="text-primary underline" href={`/admin/rentals?rentalId=${item.rentalId}`}>#{item.rentalId}</Link></td><td className="p-3">{item.driverName ?? `#${item.driverStaffId}`}</td><td className="p-3">#{item.vehicleId}</td><td className="p-3">{dateLabel(item.startTime)}</td><td className="p-3">{dateLabel(item.endTime)}</td><td className="p-3">{item.rentalStatus ?? "—"}</td></tr>)}</tbody></table></div>{schedule.data?.length === 0 && <p className="text-sm text-ink-muted">Chưa có chuyến đã phân công trong khoảng thời gian này.</p>}
    </section>
    <RentalLookup title="Phân chuyến theo mã đơn">{(rental, refreshRental) => <AssignmentForm rental={rental} refresh={async () => { await refreshRental(); await refresh(); }} />}</RentalLookup>
  </div>;
}

function ShiftForm({ record, drivers, close, saved }: { record: DriverShift | null; drivers: { value: string; label: string }[]; close: () => void; saved: () => Promise<unknown> }) {
  const [values, setValues] = useState(() => ({ driverStaffId: record ? String(record.driverStaffId) : "", startTime: record ? localDateTime(new Date(record.startTime)) : "", endTime: record ? localDateTime(new Date(record.endTime)) : "", cancelled: record?.status?.toLowerCase() === "cancelled" ? "true" : "false" }));
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const validation = useInlineValidation();
  const fields: OperationField[] = [{ name: "driverStaffId", label: "Tài xế", required: true, options: [{ value: "", label: "Chọn tài xế" }, ...drivers] }, { name: "startTime", label: "Bắt đầu ca", type: "datetime-local", required: true }, { name: "endTime", label: "Kết thúc ca", type: "datetime-local", required: true }, { name: "cancelled", label: "Trạng thái ca", options: [{ value: "false", label: "Hoạt động" }, { value: "true", label: "Hủy ca" }] }];
  const submit = async () => {
    if (busy) return; setBusy(true); setError("");
    try { await saveDriverShift({ driverStaffId: Number(values.driverStaffId), startTime: asIso(values.startTime), endTime: asIso(values.endTime), cancelled: values.cancelled === "true" }, record?.id); await saved(); close(); }
    catch (failure) { const message = validation.report(failure); setError(failure instanceof TypeError ? operationalError(failure) : message); }
    finally { setBusy(false); }
  };
  return <ValidatedForm validation={validation} validate={() => validateBookingTimes(values.startTime, values.endTime)} onSubmit={submit} className={operationsPanel}><h2 className="text-lg font-bold">{record ? `Cập nhật ca #${record.id}` : "Tạo ca làm mới"}</h2><fieldset disabled={busy}><OperationFields prefix="shift-edit" fields={fields} values={values} change={(name, value) => setValues((current) => ({ ...current, [name]: value }))} /></fieldset>{error && <p role="alert" className="text-red-700">{error}</p>}<div className="flex gap-3"><button type="submit" disabled={busy} className={operationsButton}>{busy ? "Đang lưu..." : "Lưu ca làm"}</button><button type="button" disabled={busy} onClick={close} className="rounded-xl border border-border px-4 py-3 text-sm">Đóng</button></div></ValidatedForm>;
}
