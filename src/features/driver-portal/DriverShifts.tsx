"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CarFront, Clock3, RefreshCw } from "lucide-react";
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
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return labels[normalized] ?? status.replaceAll("_", " ");
}

function statusStyle(status: string | null | undefined): string {
  switch (status?.trim().toLocaleLowerCase()) {
    case "ongoing":
    case "active":
      return "bg-info-bg text-info";
    case "completed":
      return "bg-primary-tint text-primary";
    case "cancelled":
      return "bg-danger-bg text-danger";
    case "pending":
      return "bg-primary-tint text-warning";
    default:
      return "bg-sunken text-ink-2";
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Lịch được phân công
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Ca làm việc
          </h2>
          <p className="mt-2 text-sm text-ink-3">
            Xem các chuyến xe được phân công cho bạn trong khoảng thời gian đã chọn.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((current) => current + 1)}
          disabled={loading || !canLoad}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-2 transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-line/80 bg-surface p-4 shadow-sm sm:flex-row sm:items-end sm:p-5">
        <label className="flex-1 text-sm font-semibold text-ink-2">
          Từ ngày
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(event) => setFromDate(event.currentTarget.value)}
            className="admin-input mt-2"
          />
        </label>
        <label className="flex-1 text-sm font-semibold text-ink-2">
          Đến ngày
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => setToDate(event.currentTarget.value)}
            className="admin-input mt-2"
          />
        </label>
        {!canLoad && (
          <p role="alert" className="text-sm text-danger">
            Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.
          </p>
        )}
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {canLoad && loading && (
        <p role="status" className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-3">
          Đang tải lịch làm việc...
        </p>
      )}

      {!loading && !error && canLoad && (
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-xl border border-line bg-surface px-4 py-2.5 font-medium text-ink-2">
            Tổng số ca: <strong>{shifts.length}</strong>
          </span>
          <span className="rounded-xl border border-primary/30 bg-primary-tint px-4 py-2.5 font-medium text-warning">
            Đã hoàn thành: <strong>{completedCount}</strong>
          </span>
        </div>
      )}

      {!loading && !error && canLoad && shifts.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface px-5 py-10 text-center">
          <CalendarClock className="mx-auto h-9 w-9 text-ink-3" />
          <p className="mt-3 font-semibold text-ink-2">Không có ca làm việc</p>
          <p className="mt-1 text-sm text-ink-3">
            Chưa có chuyến nào được phân công trong khoảng thời gian này.
          </p>
        </div>
      )}

      {canLoad && shifts.length > 0 && (
        <section aria-label="Danh sách ca làm việc" className="space-y-3">
          {shifts.map((shift, index) => (
            <article
              key={`${shift.assignmentId ?? "assignment"}-${shift.rentalId ?? "rental"}-${index}`}
              className="rounded-2xl border border-line/80 bg-surface p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarClock className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink">
                      Ca #{shift.assignmentId ?? index + 1}
                    </h3>
                    <p className="mt-1 text-sm text-ink-3">
                      Mã chuyến: {shift.rentalId ? `#${shift.rentalId}` : "Chưa có"}
                    </p>
                  </div>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(shift.rentalStatus)}`}>
                  {statusLabel(shift.rentalStatus)}
                </span>
              </div>
              <div className="mt-5 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
                <p className="flex items-start gap-2 text-ink-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                  <span>
                    <span className="block text-xs text-ink-3">Bắt đầu</span>
                    <strong className="mt-1 block font-semibold text-ink">
                      {formatDateTime(shift.startTime)}
                    </strong>
                  </span>
                </p>
                <p className="flex items-start gap-2 text-ink-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                  <span>
                    <span className="block text-xs text-ink-3">Kết thúc</span>
                    <strong className="mt-1 block font-semibold text-ink">
                      {formatDateTime(shift.endTime)}
                    </strong>
                  </span>
                </p>
                <p className="flex items-start gap-2 text-ink-3">
                  <CarFront className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                  <span>
                    <span className="block text-xs text-ink-3">Phương tiện</span>
                    <strong className="mt-1 block font-semibold text-ink">
                      {shift.vehicleId ? `Xe #${shift.vehicleId}` : "Chưa phân công"}
                    </strong>
                  </span>
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
