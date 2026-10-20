"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
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
      <div className="flex flex-col justify-between gap-6 border-b border-td-rule pb-6 sm:flex-row sm:items-end">
        <div className="flex items-start gap-5">
          <span className="min-w-[42px] border-t-2 border-td-oxide pt-1 font-mono text-xs font-bold text-td-oxide">05<br />DSP</span>
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">ĐIỀU PHỐI · LỊCH TRÌNH VẬN HÀNH</span>
            <h1 className="mt-1 font-sans text-3xl font-bold tracking-tight text-td-ink sm:text-4xl md:text-5xl">
              Bảng lịch trình <em className="italic text-td-teal">tài xế.</em>
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-td-muted sm:text-sm">
              Theo dõi phân bổ chuyến đi, vùng đệm 60 phút và chỉ định / thay đổi tài xế kịp thời.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-end">
          {/* Nút chuyển chế độ xem Ma trận lưới vs Danh sách (A11y) */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-1 font-semibold transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "border-td-oxide text-td-oxide"
                  : "border-transparent text-td-muted hover:text-td-ink"
              }`}
              title="Xem ma trận tuần"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Lưới tuần</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-1 font-semibold transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "border-td-oxide text-td-oxide"
                  : "border-transparent text-td-muted hover:text-td-ink"
              }`}
              title="Xem danh sách (hỗ trợ trình đọc màn hình)"
            >
              <List className="w-3.5 h-3.5" />
              <span>Danh sách</span>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-td-ink pb-4">
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

          <span className="font-mono text-sm font-bold text-td-ink ml-2">
            {weekRangeLabel}
          </span>
        </div>

        {/* Lọc cơ sở */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-td-muted whitespace-nowrap">Trạm / Cơ sở:</span>
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="h-8 rounded border border-td-rule bg-transparent px-2 text-xs font-medium text-td-ink focus:border-td-ink focus:outline-none"
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
        <div className="overflow-x-auto border-t border-td-ink">
          <table className="w-full border-collapse text-left text-xs min-w-[900px]">
            <caption className="sr-only">Lịch trình công tác của đội ngũ tài xế theo tuần</caption>
            <thead className="border-b border-td-ink font-mono text-[11px] uppercase tracking-wider text-td-muted">
              <tr>
                <th className="p-3 text-left font-bold w-48 border-r border-td-rule">
                  Tài xế ({drivers.length})
                </th>
                {weekDays.map((d, index) => {
                  const isToday =
                    formatDate(d, "yyyy-MM-dd") === formatDate(nowGmt7(), "yyyy-MM-dd");
                  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
                  return (
                    <th
                      key={index}
                      className={`p-3 text-center border-r border-td-rule last:border-r-0 ${
                        isToday ? "bg-td-chalk text-td-oxide font-black" : "text-td-ink"
                      }`}
                    >
                      <span className="block text-[11px] font-mono text-td-muted">
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

            <tbody className="divide-y divide-td-rule">
              {drivers.map((driver) => {
                const licenseCalc = getLicenseState(driver.license?.expiryDate);

                return (
                  <tr key={driver.id} className="hover:bg-td-chalk/50 transition-colors">
                    {/* Cột thông tin tài xế */}
                    <td className="p-3 border-r border-td-rule">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/staffs/detail?id=${driver.id}`}
                            className="font-bold text-xs text-td-ink hover:text-td-oxide transition-colors truncate block max-w-[140px]"
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
                          className="p-1.5 border-r border-td-rule last:border-r-0 align-top h-24"
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
                                  className="group rounded border border-td-oxide/30 bg-td-chalk p-2 transition-colors hover:border-td-oxide cursor-pointer"
                                  title={`Đơn #${sched.rentalId}: ${sched.vehicleName} (${sched.licensePlate}). Bấm để đổi tài xế.`}
                                >
                                  <div className="flex items-center justify-between font-mono text-[10px] font-bold text-td-oxide">
                                    <span>#{sched.rentalId}</span>
                                    <span>{formatDate(sched.start, "HH:mm")}</span>
                                  </div>

                                  <p className="mt-0.5 truncate text-[11px] font-bold text-td-ink">
                                    {sched.vehicleName}
                                  </p>

                                  <div className="mt-1 flex items-center justify-between text-[10px] text-td-muted">
                                    <span className="font-mono">{sched.licensePlate}</span>
                                    <span className="rounded bg-td-white px-1 text-[9px] font-bold text-td-ink">
                                      +{sched.bufferMinutes || 60}p
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-[10px] text-td-muted/50">
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
            <div className="border-t border-td-ink py-12 text-center font-mono text-xs text-td-muted">
              Không có chuyến đi nào được lên lịch trong khoảng thời gian này.
            </div>
          ) : (
            schedules.map((s) => (
              <div
                key={s.assignmentId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-td-rule py-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-td-ink">
                      Đơn thuê #{s.rentalId}
                    </span>
                    <span className="rounded bg-td-chalk px-2 py-0.5 font-mono text-[11px] font-bold text-td-oxide">
                      {s.vehicleName} ({s.licensePlate})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-td-muted">
                    <span className="flex items-center gap-1 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-td-oxide" />
                      {s.driverName}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-td-oxide" />
                      {formatDate(s.start, "HH:mm dd/MM")} - {formatDate(s.end, "HH:mm dd/MM/yyyy")}
                    </span>
                  </div>

                  {s.note && <p className="text-xs text-td-muted italic">{s.note}</p>}
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
        <Suspense fallback={<div className="h-40 rounded bg-td-white animate-pulse" />}>
          <DriverScheduleContent />
        </Suspense>
    </AuthGate>
  );
}
