"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import { useDriverPortalAccount } from "./DriverPortalShell";
import { getDriverSchedule } from "./api";
import type { DriverScheduleEntry } from "./api";

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateBoundary(value: string, endOfDay: boolean): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day);
  return date.toISOString();
}

function formatDateTime(value: string | undefined): string {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Thời gian không hợp lệ";
  return date.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(status: string | null | undefined): string {
  if (!status) return "Chưa cập nhật";
  const normalized = status.trim().toLocaleLowerCase();
  const labels: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    ongoing: "Đang thực hiện",
    active: "Đang thực hiện",
    renting: "Đang thuê",
    pre_inspection: "Kiểm tra trước thuê",
    post_inspection: "Kiểm tra trả xe",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return labels[normalized] ?? status.replaceAll("_", " ");
}

/** Map trạng thái chuyến của tài xế về tone chuẩn của StatusBadge. */
function statusToneKey(status: string | null | undefined): string {
  switch (status?.trim().toLocaleLowerCase()) {
    case "ongoing":
    case "active":
    case "renting":
      return "rented";
    case "pre_inspection":
    case "post_inspection":
      return "reserved";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "pending":
      return "pending";
    case "confirmed":
      return "reserved";
    default:
      return "unavailable";
  }
}

export default function DriverShifts() {
  const account = useDriverPortalAccount();
  const [fromDate, setFromDate] = useState(() => toDateInputValue(new Date()));
  const [toDate, setToDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return toDateInputValue(date);
  });
  const [shifts, setShifts] = useState<DriverScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const canLoad = Boolean(fromDate && toDate && fromDate <= toDate);

  useEffect(() => {
    if (!canLoad) return;

    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      void getDriverSchedule(
        account.staffId,
        dateBoundary(fromDate, false),
        dateBoundary(toDate, true),
      )
        .then((data) => {
          if (!Array.isArray(data)) {
            throw new Error("API lịch làm việc trả về dữ liệu không hợp lệ.");
          }
          if (active) {
            setShifts(
              [...data].sort((left, right) =>
                (left.startTime ?? "").localeCompare(right.startTime ?? ""),
              ),
            );
          }
        })
        .catch((loadError: unknown) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "Không thể tải lịch làm việc.",
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [account.staffId, canLoad, fromDate, reloadKey, toDate]);

  const completedCount = useMemo(
    () =>
      shifts.filter(
        (shift) => shift.rentalStatus?.trim().toLocaleLowerCase() === "completed",
      ).length,
    [shifts],
  );

  return (
    <div className="space-y-6">
      <TransitFolio
        title="Ca làm việc"
        description="Xem các chuyến xe được phân công cho bạn trong khoảng thời gian đã chọn."
      >
        <button
          type="button"
          onClick={() => setReloadKey((current) => current + 1)}
          disabled={loading || !canLoad}
          className="inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Làm mới
        </button>
      </TransitFolio>

      <section className="flex flex-col gap-4 border-y border-td-rule py-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-[11px] font-semibold text-td-muted">
          Từ ngày
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(event) => setFromDate(event.currentTarget.value)}
            className="admin-input mt-1 font-sans text-xs"
          />
        </label>
        <label className="flex-1 text-[11px] font-semibold text-td-muted">
          Đến ngày
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => setToDate(event.currentTarget.value)}
            className="admin-input mt-1 font-sans text-xs"
          />
        </label>
        {!canLoad && (
          <p role="alert" className="text-xs text-danger">
            Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.
          </p>
        )}
      </section>

      {error && (
        <p role="alert" className="border-l border-danger pl-3 text-sm text-danger">
          {error}
        </p>
      )}
      {canLoad && loading && (
        <SkeletonBlock label="Đang tải lịch làm việc" className="space-y-2">
          {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-16 w-full rounded" />)}
        </SkeletonBlock>
      )}

      {!loading && !error && canLoad && (
        <p className="font-mono text-[11px] text-td-muted">
          {shifts.length} ca · {completedCount} đã hoàn thành
        </p>
      )}

      {!loading && !error && canLoad && shifts.length === 0 && (
        <div className="border-t border-td-ink py-12 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-td-muted" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-td-ink">Không có ca làm việc</p>
          <p className="mt-1 text-xs text-td-muted">
            Chưa có chuyến nào được phân công trong khoảng thời gian này.
          </p>
        </div>
      )}

      {canLoad && !loading && shifts.length > 0 && (
        <section aria-label="Danh sách ca làm việc" className="border-t border-td-ink">
          <div className="grid grid-cols-12 gap-4 border-b border-td-ink py-2.5 text-[11px] font-bold text-td-muted">
            <span className="col-span-4">Ca / Chuyến</span>
            <span className="col-span-3">Bắt đầu</span>
            <span className="col-span-3">Kết thúc</span>
            <span className="col-span-2 text-right">Trạng thái</span>
          </div>
          <div className="divide-y divide-td-rule border-b border-td-rule">
            {shifts.map((shift, index) => (
              <div
                key={`${shift.assignmentId ?? "assignment"}-${shift.rentalId ?? "rental"}-${index}`}
                className="grid grid-cols-12 items-center gap-4 py-3.5"
              >
                <div className="col-span-4 min-w-0">
                  <span className="block font-mono text-xs font-bold text-td-ink">
                    Ca #{shift.assignmentId ?? index + 1}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-td-muted">
                    {shift.rentalId ? `Chuyến #${shift.rentalId}` : "Chưa có chuyến"}
                    {shift.vehicleId ? ` · Xe #${shift.vehicleId}` : ""}
                  </span>
                </div>
                <span className="col-span-3 font-mono text-[11px] text-td-ink">
                  {formatDateTime(shift.startTime)}
                </span>
                <span className="col-span-3 font-mono text-[11px] text-td-ink">
                  {formatDateTime(shift.endTime)}
                </span>
                <div className="col-span-2 flex justify-end">
                  <StatusBadge status={statusToneKey(shift.rentalStatus)}>
                    {statusLabel(shift.rentalStatus)}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
