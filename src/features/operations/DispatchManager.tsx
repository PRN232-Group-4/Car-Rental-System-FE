"use client";

import { useState } from "react";
import { formatAdminDateTime } from "@/lib/date-time";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { Pagination } from "@/components/ui/Pagination";
import VehicleName from "@/features/admin/VehicleName";
import StaffName from "@/features/admin/StaffName";
import { useQuery } from "@tanstack/react-query";
import { InlineInput, InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { validateBookingTimes } from "@/features/rentals/booking-rules";
import { localInputToUtcIso, toLocalInputValue } from "@/lib/time";
import { getDispatchSchedule } from "./extended-api";
import { getOperationalRentals } from "./rental-list-api";
import type { DriverScheduleEntry } from "@/features/driver-portal/api";
import { getOperationalDrivers, operationalError, rentalStatuses, toList } from "./api";

type ScheduleEntry = DriverScheduleEntry & { driverName?: string | null };
import RentalLookup from "./RentalLookup";
import { AssignmentForm } from "./RentalOperations";
import { useOptionalSession } from "@/features/auth/AuthContext";

const asIso = localInputToUtcIso;
const dateLabel = formatAdminDateTime;
const defaultDispatchFilter = () => ({ driverStaffId: "", startTime: toLocalInputValue(new Date()), endTime: toLocalInputValue(new Date(Date.now() + 7 * 86400000)) });
export default function DispatchManager() {
  const [filter, setFilter] = useState(defaultDispatchFilter);
  const [activeFilter, setActiveFilter] = useState(filter);
  const [driverPage, setDriverPage] = useState(1);
  const validation = useInlineValidation();
  const session = useOptionalSession();
  const canReadDispatch = Boolean(session?.hasAnyRole(["Admin", "Manager"]));
  const drivers = useQuery({ queryKey: ["operational-drivers"], queryFn: getOperationalDrivers, enabled: canReadDispatch, retry: false });
  const from = asIso(activeFilter.startTime); const to = asIso(activeFilter.endTime);
  const driverId = activeFilter.driverStaffId ? Number(activeFilter.driverStaffId) : undefined;
  const schedule = useQuery({ queryKey: ["dispatch-schedule", activeFilter], queryFn: () => getDispatchSchedule(from, to, driverId), enabled: canReadDispatch, retry: false });
  // Đơn khách chọn "có tài xế" nhưng chưa gán tài xế nào cho xe: duyệt rồi (chuẩn bị xe) hoặc đang thuê.
  const unassigned = useQuery({
    queryKey: ["dispatch-unassigned-driver-rentals"],
    queryFn: async ({ signal }) => {
      const pages = await Promise.all(["pre_inspection", "renting"].map((status) => getOperationalRentals({ status, page: 1, pageSize: 100 }, signal)));
      return pages.flatMap((page) => page.items ?? []).filter((rental) => rental.hasDriver && !rental.driverName).sort((left, right) => right.id - left.id);
    },
    enabled: canReadDispatch, retry: false, refetchInterval: 30000,
  });
  const driverOptions = (drivers.data ?? []).filter((item) => item.isActive).map((item) => ({ value: String(item.id), label: item.email?.trim() || "Chưa cập nhật email tài xế" }));
  const scheduleItems = toList<ScheduleEntry>(schedule.data);
  const visibleDrivers = (drivers.data ?? []).filter(item => item.isActive && (!driverId || item.id === driverId));
  const driverPageCount = Math.max(1, Math.ceil(visibleDrivers.length / 10));
  const currentDriverPage = Math.min(driverPage, driverPageCount);
  const pageDrivers = visibleDrivers.slice((currentDriverPage - 1) * 10, currentDriverPage * 10);
  const refresh = async () => { if (canReadDispatch) await Promise.all([schedule.refetch(), unassigned.refetch()]); };
  return <div className="space-y-6">
    <TransitFolio title="Điều phối tài xế" description="Phân công tài xế đang rảnh cho các đơn khách đặt có tài xế, và xem lịch chuyến đã phân công." />
    {canReadDispatch && <>
    <ValidatedForm validation={validation} validate={() => validateBookingTimes(filter.startTime, filter.endTime)} onSubmit={() => { setActiveFilter({ ...filter }); setDriverPage(1); }}>
      <AdminFilterBar description="Lọc lịch chuyến theo tài xế và khoảng thời gian." actions={<>
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
    <AdminTableCard>
      <div className="space-y-1 border-b border-td-rule py-3"><h2 className="text-sm font-bold text-td-ink">Đơn có tài xế chưa phân công</h2><p className="text-xs text-td-muted">Khách đặt xe có tài xế nhưng xe chưa được gán tài xế. Mở đơn để chọn một tài xế đang rảnh.</p></div>
      {unassigned.error && <p role="alert" className="text-sm text-danger">{operationalError(unassigned.error)} <button type="button" className="underline" onClick={() => void unassigned.refetch()}>Thử lại</button></p>}
      <AdminTable className="min-w-[700px]" aria-busy={unassigned.isFetching}>
        <caption className="sr-only">Đơn có tài xế chưa phân công</caption>
        <thead><tr><th scope="col">Đơn thuê</th><th scope="col">Phương tiện</th><th scope="col">Thời gian</th><th scope="col">Trạng thái</th><th scope="col" data-actions>Phân công</th></tr></thead>
        <tbody>{unassigned.isPending ? <AdminTableSkeleton columns={5} label="Đang tải đơn chưa có tài xế" /> : !unassigned.isError && (unassigned.data ?? []).map((rental) => <tr key={rental.id}>
          <td className="font-mono">#{rental.id}<span className="mt-1 block break-all font-sans text-xs text-td-muted">{rental.customerEmail || rental.customerName}</span></td>
          <td>{rental.vehicleModel || "Chưa cập nhật tên xe"}<span className="mt-1 block text-xs text-td-muted">{rental.licensePlate || "Chưa có biển số"}</span></td>
          <td className="text-xs text-td-muted">{dateLabel(rental.startTime)} → {dateLabel(rental.endTime)}</td>
          <td><AdminStatusBadge domain="rental" status={rental.status}>{rentalStatuses[rental.status] ?? rental.status}</AdminStatusBadge></td>
          <td data-actions><AdminRowAction action="edit" label={`Phân công tài xế cho đơn #${rental.id}`} href={`/admin/dispatch?rentalId=${rental.id}#rental-driver-assignment`} /></td>
        </tr>)}
        {!unassigned.isPending && !unassigned.isError && !unassigned.data?.length && <AdminTableEmptyRow colSpan={5}>Không có đơn nào đang chờ phân công tài xế.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
    </AdminTableCard>
    {drivers.error && <p role="alert" className="text-danger">{operationalError(drivers.error)} <button type="button" className="underline" onClick={() => void drivers.refetch()}>Tải lại tài xế</button></p>}
    <AdminTableCard>
      <div className="space-y-2 border-b border-td-rule py-3"><h2 className="text-sm font-bold text-td-ink">Danh sách tài xế</h2><p className="text-xs text-td-muted">Tài xế đang hoạt động và số chuyến đã nhận trong khoảng thời gian đang xem.</p><button type="button" className="text-xs font-semibold text-td-oxide underline disabled:opacity-50" disabled={drivers.isFetching} onClick={() => void drivers.refetch()}>Cập nhật danh sách tài xế</button></div>
      <AdminTable className="min-w-[760px]" aria-busy={drivers.isFetching}>
        <caption className="sr-only">Danh sách tài xế đang hoạt động</caption>
        <thead><tr><th scope="col">Tài xế</th><th scope="col">Cơ sở</th><th scope="col">Chuyến trong khoảng đang xem</th></tr></thead>
        <tbody>{drivers.isFetching ? <AdminTableSkeleton columns={3} label="Đang tải danh sách tài xế" /> : !drivers.isError && pageDrivers.map(driver => {
          const count = scheduleItems.filter(trip => trip.driverStaffId === driver.id).length;
          return <tr key={driver.id}><td><span className="block font-semibold">{driver.email?.trim() || "Chưa cập nhật email tài xế"}</span><span className="text-xs text-td-muted">{driver.fullName}</span></td><td>{driver.facilityName || "Chưa phân bổ cơ sở"}</td><td>{schedule.isFetching ? "Đang tải chuyến..." : schedule.isError ? "Chưa tải được lịch chuyến" : count ? `${count} chuyến` : "Đang rảnh"}</td></tr>;
        })}
        {!drivers.isFetching && !drivers.isError && !pageDrivers.length && <AdminTableEmptyRow colSpan={3}>Không có tài xế đang hoạt động phù hợp bộ lọc.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
      {!drivers.isError && <Pagination page={currentDriverPage} pageSize={10} totalCount={visibleDrivers.length} onPageChange={setDriverPage} loading={drivers.isFetching} itemName="tài xế" />}
    </AdminTableCard>
    <AdminTableCard>
      <div className="flex items-baseline justify-between gap-3 border-b border-td-rule pb-2 pt-3">
        <h2 className="text-sm font-bold text-td-ink">Các chuyến đã phân công</h2>
        {schedule.error && <p role="alert" className="text-sm text-danger">{operationalError(schedule.error)} <button type="button" className="underline" onClick={() => void schedule.refetch()}>Thử lại</button></p>}
      </div>
      <AdminTable className="min-w-[760px]" aria-busy={schedule.isPending}>
        <caption className="sr-only">Lịch chuyến được phân cho tài xế</caption>
        <thead><tr>{["Tài xế", "Xe", "Nhận xe", "Trả xe", "Trạng thái"].map((label) => <th key={label} scope="col">{label}</th>)}<th scope="col" data-actions>Thao tác</th></tr></thead>
        <tbody>
          {schedule.isPending ? <AdminTableSkeleton columns={6} label="Đang tải lịch chuyến" /> : scheduleItems.map((item, index) => (
            <tr key={item.assignmentId ?? index}>
              <td><StaffName staffId={item.driverStaffId} email={drivers.data?.find((driver) => driver.id === item.driverStaffId)?.email} name={item.driverName} /></td>
              <td>{item.vehicleId != null ? <VehicleName vehicleId={item.vehicleId} /> : "Chưa có thông tin xe"}</td>
              <td className="text-td-muted">{dateLabel(item.startTime)}</td>
              <td className="text-td-muted">{dateLabel(item.endTime)}</td>
              <td><AdminStatusBadge domain="rental" status={item.rentalStatus}>{item.rentalStatus ?? "—"}</AdminStatusBadge></td>
              <td data-actions>{item.rentalId != null ? <AdminRowAction action="view" label="Mở đơn thuê" href={`/admin/rentals?rentalId=${item.rentalId}`} /> : "—"}</td>
            </tr>
          ))}
          {!schedule.isPending && scheduleItems.length === 0 && <AdminTableEmptyRow colSpan={6}>Chưa có chuyến đã phân công trong khoảng thời gian này.</AdminTableEmptyRow>}
        </tbody>
      </AdminTable>
    </AdminTableCard>
    </>}
    <section id="rental-driver-assignment" aria-label="Phân công tài xế theo đơn thuê"><RentalLookup title="Phân chuyến theo mã đơn">{(rental, refreshRental) => <AssignmentForm rental={rental} refresh={async () => { await refreshRental(); await refresh(); }} />}</RentalLookup></section>
  </div>;
}

