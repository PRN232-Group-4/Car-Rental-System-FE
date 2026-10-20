"use client";
import { useState } from "react";
import { formatAdminDateTime } from "@/lib/date-time";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import VehicleName from "@/features/admin/VehicleName";
import StaffName from "@/features/admin/StaffName";
import { useQuery } from "@tanstack/react-query";
import { InlineInput, InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { localDateTime, validateBookingTimes } from "@/features/rentals/booking-rules";
import OperationFields from "./OperationFields";
import type { OperationField } from "./OperationFields";
import { getDriverShifts, getDispatchSchedule, saveDriverShift } from "./extended-api";
import type { DriverShift } from "./extended-api";
import type { DriverScheduleEntry } from "@/features/driver-portal/api";
import { getOperationalDrivers, operationalError, operationsButton, toList } from "./api";

type ScheduleEntry = DriverScheduleEntry & { driverName?: string | null };
import RentalLookup from "./RentalLookup";
import { AssignmentForm } from "./RentalOperations";

const asIso = (value: string) => new Date(value).toISOString();
const dateLabel = formatAdminDateTime;
const defaultDispatchFilter = () => ({ driverStaffId: "", startTime: localDateTime(new Date()), endTime: localDateTime(new Date(Date.now() + 7 * 86400000)) });
export default function DispatchManager() {
  const [filter, setFilter] = useState(defaultDispatchFilter);
  const [activeFilter, setActiveFilter] = useState(filter);
  const [editing, setEditing] = useState<DriverShift | null | undefined>();
  const validation = useInlineValidation();
  const drivers = useQuery({ queryKey: ["operational-drivers"], queryFn: getOperationalDrivers, retry: false });
  const from = asIso(activeFilter.startTime); const to = asIso(activeFilter.endTime);
  const driverId = activeFilter.driverStaffId ? Number(activeFilter.driverStaffId) : undefined;
  const shifts = useQuery({ queryKey: ["dispatch-shifts", activeFilter], queryFn: () => getDriverShifts(from, to, driverId), retry: false });
  const schedule = useQuery({ queryKey: ["dispatch-schedule", activeFilter], queryFn: () => getDispatchSchedule(from, to, driverId), retry: false });
  const driverOptions = (drivers.data ?? []).map((item) => ({ value: String(item.id), label: item.fullName?.trim() || item.email?.trim() || "Chưa có tên tài xế" }));
  const refresh = async () => { await Promise.all([shifts.refetch(), schedule.refetch()]); };
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-6 border-b border-td-rule pb-6 sm:flex-row sm:items-end">
      <div className="flex items-start gap-5">
        <span className="min-w-[42px] border-t-2 border-td-oxide pt-1 font-mono text-xs font-bold text-td-oxide">05<br />DSP</span>
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">ĐIỀU PHỐI · CA LÀM & PHÂN CHUYẾN</span>
          <h1 className="mt-1 font-sans text-3xl font-bold tracking-tight text-td-ink sm:text-4xl md:text-5xl">Điều phối <em className="italic text-td-teal">tài xế.</em></h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-td-muted sm:text-sm">Xếp ca theo tài xế trước, đọc lịch chuyến sau. Mọi thay đổi đi qua một bảng tra cứu duy nhất.</p>
        </div>
      </div>
      <button type="button" className={`${operationsButton} self-start sm:self-end`} onClick={() => setEditing(null)}>Tạo ca làm</button>
    </div>
    <ValidatedForm validation={validation} validate={() => validateBookingTimes(filter.startTime, filter.endTime)} onSubmit={() => setActiveFilter({ ...filter })}>
      <AdminFilterBar description="Lọc ca làm và lịch chuyến theo tài xế, khoảng thời gian." actions={<>
        <AdminFilterButton type="submit">Xem lịch</AdminFilterButton>
        <AdminFilterButton variant="secondary" onClick={() => { const cleared = defaultDispatchFilter(); setFilter(cleared); setActiveFilter(cleared); validation.reset(); }}>Đặt lại</AdminFilterButton>
      </>}>
        <AdminFilterField label="Tài xế" htmlFor="dispatch-filter-driverStaffId" select>
          <InlineSelect id="dispatch-filter-driverStaffId" name="driverStaffId" value={filter.driverStaffId} onChange={(event) => setFilter((current) => ({ ...current, driverStaffId: event.target.value }))}>
            <option value="">Tất cả tài xế</option>{driverOptions.map((driver) => <option key={driver.value} value={driver.value}>{driver.label}</option>)}
          </InlineSelect>
        </AdminFilterField>
        <AdminFilterField label="Từ ngày giờ" htmlFor="dispatch-filter-startTime">
          <InlineInput id="dispatch-filter-startTime" name="startTime" type="datetime-local" required value={filter.startTime} onChange={(event) => setFilter((current) => ({ ...current, startTime: event.target.value }))} />
        </AdminFilterField>
        <AdminFilterField label="Đến ngày giờ" htmlFor="dispatch-filter-endTime">
          <InlineInput id="dispatch-filter-endTime" name="endTime" type="datetime-local" required value={filter.endTime} onChange={(event) => setFilter((current) => ({ ...current, endTime: event.target.value }))} />
        </AdminFilterField>
      </AdminFilterBar>
    </ValidatedForm>
    {drivers.error && <p role="alert" className="text-danger">{operationalError(drivers.error)} <button type="button" className="underline" onClick={() => void drivers.refetch()}>Tải lại tài xế</button></p>}
    <AdminTableCard>
      <div className="flex items-baseline justify-between gap-3 border-b border-td-rule pb-2 pt-3">
        <h2 className="text-sm font-bold text-td-ink">Ca làm việc</h2>
        {shifts.error && <p role="alert" className="text-sm text-danger">{operationalError(shifts.error)} <button type="button" className="underline" onClick={() => void shifts.refetch()}>Thử lại</button></p>}
      </div>
      <AdminTable className="min-w-[760px]" aria-busy={shifts.isPending}>
        <caption className="sr-only">Danh sách ca làm tài xế</caption>
        <thead><tr>{["Tài xế", "Bắt đầu", "Kết thúc", "Trạng thái"].map((label) => <th key={label} scope="col">{label}</th>)}<th scope="col" data-actions>Thao tác</th></tr></thead>
        <tbody>
          {shifts.isPending ? <AdminTableSkeleton columns={5} label="Đang tải ca làm" /> : toList<DriverShift>(shifts.data).map((item) => (
            <tr key={item.id}>
              <td className="font-semibold"><StaffName staffId={item.driverStaffId} name={driverOptions.find((option) => option.value === String(item.driverStaffId))?.label} /></td>
              <td className="text-td-muted">{dateLabel(item.startTime)}</td>
              <td className="text-td-muted">{dateLabel(item.endTime)}</td>
              <td><AdminStatusBadge domain="shift" status={item.status}>{item.status ?? "—"}</AdminStatusBadge></td>
              <td data-actions><AdminRowAction action="edit" label="Sửa / hủy ca" onClick={() => setEditing(item)} /></td>
            </tr>
          ))}
          {!shifts.isPending && toList<DriverShift>(shifts.data).length === 0 && <AdminTableEmptyRow colSpan={5}>Không có ca làm trong khoảng thời gian này.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
    </AdminTableCard>
    {editing !== undefined && <ShiftForm key={editing?.id ?? "new"} record={editing} drivers={driverOptions} close={() => setEditing(undefined)} saved={refresh} />}
    <AdminTableCard>
      <div className="flex items-baseline justify-between gap-3 border-b border-td-rule pb-2 pt-3">
        <h2 className="text-sm font-bold text-td-ink">Các chuyến đã phân công</h2>
        {schedule.error && <p role="alert" className="text-sm text-danger">{operationalError(schedule.error)} <button type="button" className="underline" onClick={() => void schedule.refetch()}>Thử lại</button></p>}
      </div>
      <AdminTable className="min-w-[760px]" aria-busy={schedule.isPending}>
        <caption className="sr-only">Lịch chuyến được phân cho tài xế</caption>
        <thead><tr>{["Tài xế", "Xe", "Nhận xe", "Trả xe", "Trạng thái"].map((label) => <th key={label} scope="col">{label}</th>)}<th scope="col" data-actions>Thao tác</th></tr></thead>
        <tbody>
          {schedule.isPending ? <AdminTableSkeleton columns={6} label="Đang tải lịch chuyến" /> : toList<ScheduleEntry>(schedule.data).map((item, index) => (
            <tr key={item.assignmentId ?? index}>
              <td><StaffName staffId={item.driverStaffId} name={item.driverName?.trim() || driverOptions.find((option) => option.value === String(item.driverStaffId))?.label} /></td>
              <td>{item.vehicleId != null ? <VehicleName vehicleId={item.vehicleId} /> : "Chưa có thông tin xe"}</td>
              <td className="text-td-muted">{dateLabel(item.startTime)}</td>
              <td className="text-td-muted">{dateLabel(item.endTime)}</td>
              <td><AdminStatusBadge domain="rental" status={item.rentalStatus}>{item.rentalStatus ?? "—"}</AdminStatusBadge></td>
              <td data-actions>{item.rentalId != null ? <AdminRowAction action="view" label="Mở đơn thuê" href={`/admin/rentals?rentalId=${item.rentalId}`} /> : "—"}</td>
            </tr>
          ))}
          {!schedule.isPending && toList<ScheduleEntry>(schedule.data).length === 0 && <AdminTableEmptyRow colSpan={6}>Chưa có chuyến đã phân công trong khoảng thời gian này.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
    </AdminTableCard>
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
  return <FormDialog title={record ? "Cập nhật ca làm" : "Tạo ca làm mới"} onClose={close} busy={busy} size="xl"><ValidatedForm validation={validation} validate={() => validateBookingTimes(values.startTime, values.endTime)} onSubmit={submit} className="space-y-5"><fieldset disabled={busy}><OperationFields prefix="shift-edit" fields={fields} values={values} change={(name, value) => setValues((current) => ({ ...current, [name]: value }))} /></fieldset>{error && <p role="alert" className="text-danger">{error}</p>}<FormDialogFooter><button type="submit" disabled={busy} className={operationsButton}>{busy ? "Đang lưu..." : "Lưu ca làm"}</button><button type="button" disabled={busy} onClick={close} className="rounded border border-td-rule px-4 py-3 text-sm">Đóng</button></FormDialogFooter></ValidatedForm></FormDialog>;
}
