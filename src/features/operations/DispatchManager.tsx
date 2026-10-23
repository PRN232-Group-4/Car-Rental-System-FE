"use client";

import { notifyError, notifySuccess } from "@/components/ui/Toaster";
import { useState } from "react";
import { formatAdminDateTime } from "@/lib/date-time";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import { Pagination } from "@/components/ui/Pagination";
import VehicleName from "@/features/admin/VehicleName";
import StaffName from "@/features/admin/StaffName";
import { useQuery } from "@tanstack/react-query";
import { InlineInput, InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { validateBookingTimes } from "@/features/rentals/booking-rules";
import { localInputToUtcIso, toLocalInputValue } from "@/lib/time";
import OperationFields from "./OperationFields";
import type { OperationField } from "./OperationFields";
import { getDriverShifts, getDispatchSchedule, saveDriverShift } from "./extended-api";
import type { DriverShift } from "./extended-api";
import type { DriverScheduleEntry } from "@/features/driver-portal/api";
import { getOperationalDrivers, operationalError, operationsButton, toList } from "./api";

type ScheduleEntry = DriverScheduleEntry & { driverName?: string | null };
import RentalLookup from "./RentalLookup";
import { AssignmentForm } from "./RentalOperations";
import { DRIVER_SHIFT_MANAGEMENT_ENABLED, DRIVER_SHIFT_PAUSED_MESSAGE } from "@/config/operational-features";
import { useOptionalSession } from "@/features/auth/AuthContext";

const asIso = localInputToUtcIso;
const dateLabel = formatAdminDateTime;
const defaultDispatchFilter = () => ({ driverStaffId: "", startTime: toLocalInputValue(new Date()), endTime: toLocalInputValue(new Date(Date.now() + 7 * 86400000)) });
export default function DispatchManager() {
  const [filter, setFilter] = useState(defaultDispatchFilter);
  const [activeFilter, setActiveFilter] = useState(filter);
  const [editing, setEditing] = useState<DriverShift | null | undefined>();
  const [creatingDriverId, setCreatingDriverId] = useState("");
  const [driverPage, setDriverPage] = useState(1);
  const validation = useInlineValidation();
  const session = useOptionalSession();
  const canReadDispatch = Boolean(session?.hasAnyRole(["Admin", "Manager"]));
  const drivers = useQuery({ queryKey: ["operational-drivers"], queryFn: getOperationalDrivers, enabled: canReadDispatch, retry: false });
  const from = asIso(activeFilter.startTime); const to = asIso(activeFilter.endTime);
  const driverId = activeFilter.driverStaffId ? Number(activeFilter.driverStaffId) : undefined;
  const shifts = useQuery({ queryKey: ["dispatch-shifts", activeFilter], queryFn: () => getDriverShifts(from, to, driverId), enabled: canReadDispatch, retry: false });
  const schedule = useQuery({ queryKey: ["dispatch-schedule", activeFilter], queryFn: () => getDispatchSchedule(from, to, driverId), enabled: canReadDispatch, retry: false });
  const driverOptions = (drivers.data ?? []).filter((item) => item.isActive).map((item) => ({ value: String(item.id), label: item.email?.trim() || "Chưa cập nhật email tài xế" }));
  const visibleDrivers = (drivers.data ?? []).filter(item => item.isActive && (!driverId || item.id === driverId));
  const driverPageCount = Math.max(1, Math.ceil(visibleDrivers.length / 10));
  const currentDriverPage = Math.min(driverPage, driverPageCount);
  const pageDrivers = visibleDrivers.slice((currentDriverPage - 1) * 10, currentDriverPage * 10);
  const createShift = (id = activeFilter.driverStaffId) => { if (!DRIVER_SHIFT_MANAGEMENT_ENABLED) return; setCreatingDriverId(id); setEditing(null); };
  const refresh = async () => { if (canReadDispatch) await Promise.all([shifts.refetch(), schedule.refetch()]); };
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-6 border-b border-td-rule pb-6 sm:flex-row sm:items-end">
      <div className="flex items-start gap-5">
        <span className="min-w-[42px] border-t-2 border-td-oxide pt-1 font-mono text-xs font-bold text-td-oxide">05<br />DSP</span>
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">ĐIỀU PHỐI · CA LÀM & PHÂN CHUYẾN</span>
          <h1 className="mt-1 font-sans text-3xl font-bold tracking-tight text-td-ink sm:text-4xl md:text-5xl">Điều phối <em className="italic text-td-teal">tài xế.</em></h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-td-muted sm:text-sm">Tra cứu tài xế và phân công cho xe theo từng đơn thuê.</p>
        </div>
      </div>
      <button type="button" className={`${operationsButton} self-start sm:self-end`} aria-describedby={!DRIVER_SHIFT_MANAGEMENT_ENABLED ? "driver-shift-paused" : undefined} disabled={!DRIVER_SHIFT_MANAGEMENT_ENABLED || drivers.isPending || drivers.isError || !driverOptions.length} onClick={() => createShift()}>Tạo ca làm</button>
    </div>
    {!DRIVER_SHIFT_MANAGEMENT_ENABLED && <p id="driver-shift-paused" role="status" className="border-l-2 border-td-oxide pl-3 text-sm text-td-muted">{DRIVER_SHIFT_PAUSED_MESSAGE} <a className="font-semibold text-td-oxide underline" href="#rental-driver-assignment">Mở phân công tài xế</a></p>}
    {canReadDispatch && <>
    <ValidatedForm validation={validation} validate={() => validateBookingTimes(filter.startTime, filter.endTime)} onSubmit={() => { setActiveFilter({ ...filter }); setDriverPage(1); }}>
      <AdminFilterBar description="Lọc ca làm và lịch chuyến theo tài xế, khoảng thời gian." actions={<>
        <AdminFilterButton type="submit">Xem lịch</AdminFilterButton>
        <AdminFilterButton variant="secondary" onClick={() => { const cleared = defaultDispatchFilter(); setFilter(cleared); setActiveFilter(cleared); setDriverPage(1); validation.reset(); }}>Đặt lại</AdminFilterButton>
      </>}>
        <AdminFilterField label="Tài xế" htmlFor="dispatch-filter-driverStaffId" select>
          <InlineSelect id="dispatch-filter-driverStaffId" name="driverStaffId" disabled={drivers.isPending || drivers.isError} value={filter.driverStaffId} onChange={(event) => setFilter((current) => ({ ...current, driverStaffId: event.target.value }))}>
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
      <div className="space-y-2 border-b border-td-rule py-3"><h2 className="text-sm font-bold text-td-ink">Danh sách tài xế</h2><p className="text-xs text-td-muted">Bao gồm tài xế đang hoạt động chưa có ca hoặc chuyến. Ca làm bên dưới chỉ hiển thị các ca đã được tạo trong khoảng thời gian đang xem.</p><button type="button" className="text-xs font-semibold text-td-oxide underline disabled:opacity-50" disabled={drivers.isFetching} onClick={() => void drivers.refetch()}>Cập nhật danh sách tài xế</button></div>
      <AdminTable className="min-w-[760px]" aria-busy={drivers.isFetching}>
        <caption className="sr-only">Danh sách tài xế đang hoạt động</caption>
        <thead><tr><th scope="col">Tài xế</th><th scope="col">Cơ sở</th><th scope="col">Ca trong khoảng đang xem</th><th scope="col" data-actions>Thao tác</th></tr></thead>
        <tbody>{drivers.isFetching ? <AdminTableSkeleton columns={4} label="Đang tải danh sách tài xế" /> : !drivers.isError && pageDrivers.map(driver => {
          const count = toList<DriverShift>(shifts.data).filter(shift => shift.driverStaffId === driver.id && shift.status !== "cancelled").length;
          return <tr key={driver.id}><td><span className="block font-semibold">{driver.email?.trim() || "Chưa cập nhật email tài xế"}</span><span className="text-xs text-td-muted">{driver.fullName}</span></td><td>{driver.facilityName || "Chưa phân bổ cơ sở"}</td><td>{shifts.isFetching ? "Đang tải ca..." : shifts.isError ? "Chưa tải được ca làm" : count ? `${count} ca` : "Chưa có ca trong khoảng đang xem"}</td><td data-actions><AdminRowAction action="edit" label={`Xếp ca cho ${driver.email || driver.fullName}`} disabled={!DRIVER_SHIFT_MANAGEMENT_ENABLED} aria-describedby={!DRIVER_SHIFT_MANAGEMENT_ENABLED ? "driver-shift-paused" : undefined} onClick={() => createShift(String(driver.id))} /></td></tr>;
        })}
        {!drivers.isFetching && !drivers.isError && !pageDrivers.length && <AdminTableEmptyRow colSpan={4}>Không có tài xế đang hoạt động phù hợp bộ lọc.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
      {!drivers.isError && <Pagination page={currentDriverPage} pageSize={10} totalCount={visibleDrivers.length} onPageChange={setDriverPage} loading={drivers.isFetching} itemName="tài xế" />}
    </AdminTableCard>
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
              <td className="font-semibold"><StaffName staffId={item.driverStaffId} email={drivers.data?.find((driver) => driver.id === item.driverStaffId)?.email} /></td>
              <td className="text-td-muted">{dateLabel(item.startTime)}</td>
              <td className="text-td-muted">{dateLabel(item.endTime)}</td>
              <td><AdminStatusBadge domain="shift" status={item.status}>{item.status ?? "—"}</AdminStatusBadge></td>
              <td data-actions><AdminRowAction action="edit" label="Sửa / hủy ca" disabled={!DRIVER_SHIFT_MANAGEMENT_ENABLED} aria-describedby={!DRIVER_SHIFT_MANAGEMENT_ENABLED ? "driver-shift-paused" : undefined} onClick={() => { if (DRIVER_SHIFT_MANAGEMENT_ENABLED) setEditing(item); }} /></td>
            </tr>
          ))}
          {!shifts.isPending && toList<DriverShift>(shifts.data).length === 0 && <AdminTableEmptyRow colSpan={5}>Không có ca làm trong khoảng thời gian này.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
    </AdminTableCard>
    {DRIVER_SHIFT_MANAGEMENT_ENABLED && editing !== undefined && <ShiftForm key={editing?.id ?? `new-${creatingDriverId}`} record={editing} initialDriverId={creatingDriverId} drivers={driverOptions} close={() => setEditing(undefined)} saved={refresh} />}
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
              <td><StaffName staffId={item.driverStaffId} email={drivers.data?.find((driver) => driver.id === item.driverStaffId)?.email} name={item.driverName} /></td>
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
    </>}
    <section id="rental-driver-assignment" aria-label="Phân công tài xế theo đơn thuê"><RentalLookup title="Phân chuyến theo mã đơn">{(rental, refreshRental) => <AssignmentForm rental={rental} refresh={async () => { await refreshRental(); await refresh(); }} />}</RentalLookup></section>
  </div>;
}

function ShiftForm({ record, initialDriverId, drivers, close, saved }: { record: DriverShift | null; initialDriverId: string; drivers: { value: string; label: string }[]; close: () => void; saved: () => Promise<unknown> }) {
  const [values, setValues] = useState(() => ({ driverStaffId: record ? String(record.driverStaffId) : initialDriverId, startTime: record ? toLocalInputValue(record.startTime) : "", endTime: record ? toLocalInputValue(record.endTime) : "", cancelled: record?.status?.toLowerCase() === "cancelled" ? "true" : "false" }));
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const validation = useInlineValidation();
  const fields: OperationField[] = [{ name: "driverStaffId", label: "Tài xế", required: true, options: [{ value: "", label: "Chọn tài xế" }, ...drivers] }, { name: "startTime", label: "Bắt đầu ca", type: "datetime-local", required: true }, { name: "endTime", label: "Kết thúc ca", type: "datetime-local", required: true }, { name: "cancelled", label: "Trạng thái ca", options: [{ value: "false", label: "Hoạt động" }, { value: "true", label: "Hủy ca" }] }];
  const submit = async () => {
    if (busy) return; setBusy(true); setError("");
    try { await saveDriverShift({ driverStaffId: Number(values.driverStaffId), startTime: asIso(values.startTime), endTime: asIso(values.endTime), cancelled: values.cancelled === "true" }, record?.id); notifySuccess(values.cancelled === "true" ? "Đã hủy ca làm." : record ? "Đã cập nhật ca làm." : "Đã tạo ca làm."); await saved(); close(); }
    catch (failure) { const message = validation.report(failure); const generalError = failure instanceof TypeError ? operationalError(failure) : message; setError(generalError); notifyError(generalError); }
    finally { setBusy(false); }
  };
  return <FormDialog title={record ? "Cập nhật ca làm" : "Tạo ca làm mới"} onClose={close} busy={busy} size="xl"><ValidatedForm validation={validation} validate={() => validateBookingTimes(values.startTime, values.endTime)} onSubmit={submit} className="space-y-5"><fieldset disabled={busy}><OperationFields prefix="shift-edit" fields={fields} values={values} change={(name, value) => setValues((current) => ({ ...current, [name]: value }))} /></fieldset>{error && <p role="alert" className="text-danger">{error}</p>}<FormDialogFooter><button type="submit" disabled={busy} className={operationsButton}>{busy ? "Đang lưu..." : "Lưu ca làm"}</button><button type="button" disabled={busy} onClick={close} className="rounded border border-td-rule px-4 py-3 text-sm">Đóng</button></FormDialogFooter></ValidatedForm></FormDialog>;
}
