"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import StaffShell from "@/features/admin/StaffShell";
import { AuthGate } from "@/features/auth/AuthGate";
import {
  useDriverSchedules,
  useStaffs,
  useFacilities,
} from "@/features/admin/staff/hooks";
import { DriverAssignDrawer } from "@/features/admin/staff/components/DriverAssignDrawer";
import { LicenseBadge } from "@/features/admin/staff/components/LicenseBadge";
import { getLicenseState } from "@/features/admin/staff/license-utils";
import { Button } from "@/components/ui/Button";
import { formatDate, nowGmt7 } from "@/lib/time";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCheck,
  List,
  Grid3X3,
  AlertTriangle,
} from "lucide-react";

function DriverScheduleContent() {
  const { data: facilities = [] } = useFacilities();
  const { data: staffResult } = useStaffs({ isDriver: "driver", pageSize: 50 });
  const drivers = useMemo(() => staffResult?.items || [], [staffResult]);

  // Quản lý tuần làm việc (mặc định tuần chứa hôm nay)
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Drawer gán tài xế
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [selectedRentalForAssign, setSelectedRentalForAssign] = useState<{
    rentalId: number;
    rentalCode: string;
    vehicleName: string;
    currentDriverName?: string;
  } | null>(null);

  // Tính 7 ngày của tuần được chọn theo GMT+7
  const weekDays = useMemo(() => {
    const today = nowGmt7();
    const dayOfWeek = today.getDay(); // 0 là Chủ Nhật, 1 là Thứ Hai
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + currentWeekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentWeekOffset]);

  const weekRangeLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    return `${formatDate(first, "dd/MM")} - ${formatDate(last, "dd/MM/yyyy")}`;
  }, [weekDays]);

  const { data: schedules = [], refetch } = useDriverSchedules({
    from: weekDays[0].toISOString(),
    to: weekDays[6].toISOString(),
    facilityId: selectedFacilityId !== "all" ? parseInt(selectedFacilityId, 10) : undefined,
  });

  const handleOpenAssignModal = (rentalId: number, rentalCode: string, vehicleName: string, currentDriverName?: string) => {
    setSelectedRentalForAssign({
      rentalId,
      rentalCode,
      vehicleName,
      currentDriverName,
    });
    setAssignDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <CalendarIcon className="w-4 h-4" />
            <span>Lịch Trình Vận Hành</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-ink tracking-tight">
            Bảng Lịch Trình Tài Xế Toàn Hệ Thống
          </h1>
          <p className="mt-1 text-xs text-ink-3">
            Theo dõi phân bổ chuyến đi, vùng đệm 60 phút và chỉ định / thay đổi tài xế kịp thời.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút chuyển chế độ xem Ma trận lưới vs Danh sách (A11y) */}
          <div className="flex items-center rounded-xl border border-line bg-surface p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "text-ink-3 hover:text-ink hover:bg-canvas"
              }`}
              title="Xem ma trận tuần"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lưới tuần</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-ink-3 hover:text-ink hover:bg-canvas"
              }`}
              title="Xem danh sách (hỗ trợ trình đọc màn hình)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Danh sách</span>
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => handleOpenAssignModal(104, "#104", "VinFast VF 8 Eco")}
          >
            <UserCheck className="w-4 h-4 mr-1.5" />
            <span>Gán tài xế</span>
          </Button>
        </div>
      </div>

      {/* 2. Thanh điều khiển tuần & bộ lọc cơ sở */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 shadow-e1">
        {/* Điều hướng tuần */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
            title="Tuần trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentWeekOffset(0)}
            className="font-bold text-xs"
          >
            Tuần này
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
            title="Tuần sau"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <span className="font-mono text-sm font-bold text-ink ml-2">
            {weekRangeLabel}
          </span>
        </div>

        {/* Lọc cơ sở */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-3 whitespace-nowrap">Trạm / Cơ sở:</span>
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="h-9 rounded-xl border border-line bg-surface px-3 text-xs font-medium text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tất cả chi nhánh</option>
            {facilities.map((f) => (
              <option key={f.id} value={String(f.id)}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Bảng Lưới Tuần (Desktop / Grid View) */}
      {viewMode === "grid" ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-e1">
          <table className="w-full border-collapse text-left text-xs min-w-[900px]">
            <caption className="sr-only">Lịch trình công tác của đội ngũ tài xế theo tuần</caption>
            <thead className="border-b border-line bg-sunken">
              <tr>
                <th className="p-3 font-bold uppercase text-ink-3 w-48 border-r border-line">
                  Tài xế ({drivers.length})
                </th>
                {weekDays.map((d, index) => {
                  const isToday =
                    formatDate(d, "yyyy-MM-dd") === formatDate(nowGmt7(), "yyyy-MM-dd");
                  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
                  return (
                    <th
                      key={index}
                      className={`p-3 text-center border-r border-line last:border-r-0 ${
                        isToday ? "bg-primary-tint/30 text-primary font-black" : "text-ink"
                      }`}
                    >
                      <span className="block text-[11px] font-mono text-ink-3">
                        {dayNames[index]}
                      </span>
                      <span className="block text-sm font-bold">
                        {formatDate(d, "dd/MM")}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-line bg-surface">
              {drivers.map((driver) => {
                const licenseCalc = getLicenseState(driver.license?.expiryDate);

                return (
                  <tr key={driver.id} className="hover:bg-canvas/50 transition-colors">
                    {/* Cột thông tin tài xế */}
                    <td className="p-3 border-r border-line bg-surface">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/staffs/detail?id=${driver.id}`}
                            className="font-bold text-xs text-ink hover:text-primary transition-colors truncate block max-w-[140px]"
                          >
                            {driver.fullName}
                          </Link>
                          {licenseCalc.state === "expired" || licenseCalc.state === "expiring" ? (
                            <span title={licenseCalc.label}>
                              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1">
                          <LicenseBadge expiryDate={driver.license?.expiryDate} showIcon={false} />
                        </div>
                      </div>
                    </td>

                    {/* 7 cột ngày trong tuần */}
                    {weekDays.map((day, dayIndex) => {
                      const dayStr = formatDate(day, "yyyy-MM-dd");

                      // Lọc các ca trong ngày của tài xế này
                      const daySchedules = schedules.filter((s) => {
                        if (s.driverStaffId !== driver.id) return false;
                        const scheduleStartDay = formatDate(s.start, "yyyy-MM-dd");
                        return scheduleStartDay === dayStr;
                      });

                      return (
                        <td
                          key={dayIndex}
                          className="p-1.5 border-r border-line last:border-r-0 align-top h-24"
                        >
                          {daySchedules.length > 0 ? (
                            <div className="space-y-1.5">
                              {daySchedules.map((sched) => (
                                <div
                                  key={sched.assignmentId}
                                  onClick={() =>
                                    handleOpenAssignModal(
                                      sched.rentalId,
                                      `#${sched.rentalId}`,
                                      sched.vehicleName || "Xe cho thuê",
                                      driver.fullName
                                    )
                                  }
                                  className="group rounded-xl border border-primary/30 bg-primary-tint/20 p-2 shadow-xs transition-all hover:border-primary hover:bg-primary-tint/40 cursor-pointer"
                                  title={`Đơn #${sched.rentalId}: ${sched.vehicleName} (${sched.licensePlate}). Bấm để đổi tài xế.`}
                                >
                                  <div className="flex items-center justify-between font-mono text-[10px] font-bold text-primary">
                                    <span>#{sched.rentalId}</span>
                                    <span>{formatDate(sched.start, "HH:mm")}</span>
                                  </div>

                                  <p className="mt-0.5 truncate text-[11px] font-bold text-ink">
                                    {sched.vehicleName}
                                  </p>

                                  <div className="mt-1 flex items-center justify-between text-[10px] text-ink-3">
                                    <span className="font-mono">{sched.licensePlate}</span>
                                    <span className="rounded bg-surface px-1 text-[9px] font-bold text-ink-2">
                                      +{sched.bufferMinutes || 60}p
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-[10px] text-ink-3/40">
                              Trống
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* 4. Xem Dạng Danh Sách (A11y / Mobile View) */
        <div className="space-y-4">
          {schedules.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center text-xs text-ink-3">
              Không có chuyến đi nào được lên lịch trong khoảng thời gian này.
            </div>
          ) : (
            schedules.map((s) => (
              <div
                key={s.assignmentId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 shadow-e1"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink">
                      Đơn thuê #{s.rentalId}
                    </span>
                    <span className="rounded bg-primary-tint px-2 py-0.5 text-xs font-bold text-primary">
                      {s.vehicleName} ({s.licensePlate})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-ink-2">
                    <span className="flex items-center gap-1 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-primary" />
                      {s.driverName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-ink-3">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {formatDate(s.start, "HH:mm dd/MM")} - {formatDate(s.end, "HH:mm dd/MM/yyyy")}
                    </span>
                  </div>

                  {s.note && <p className="text-xs text-ink-3 italic">{s.note}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleOpenAssignModal(
                        s.rentalId,
                        `#${s.rentalId}`,
                        s.vehicleName || "Xe thuê",
                        s.driverName
                      )
                    }
                  >
                    <span>Điều phối / Đổi tài xế</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. Drawer Điều phối & Đổi tài xế */}
      {selectedRentalForAssign && (
        <DriverAssignDrawer
          open={assignDrawerOpen}
          onOpenChange={(open) => {
            setAssignDrawerOpen(open);
            if (!open) setSelectedRentalForAssign(null);
          }}
          rentalId={selectedRentalForAssign.rentalId}
          rentalCode={selectedRentalForAssign.rentalCode}
          vehicleName={selectedRentalForAssign.vehicleName}
          currentDriverName={selectedRentalForAssign.currentDriverName}
          onSuccess={() => {
            void refetch();
          }}
        />
      )}
    </div>
  );
}

export default function DriverSchedulePage() {
  return (
    <AuthGate allowedRoles={["Admin", "Manager", "Staff"]}>
      <StaffShell>
        <Suspense fallback={<div className="h-40 rounded-2xl bg-surface animate-pulse" />}>
          <DriverScheduleContent />
        </Suspense>
      </StaffShell>
    </AuthGate>
  );
}
