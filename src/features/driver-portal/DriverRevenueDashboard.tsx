"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleDollarSign, ClipboardCheck } from "lucide-react";
import { getDriverRental, getDriverSchedule } from "./api";
import type { DriverRentalDto, DriverScheduleEntry } from "./api";
import { useDriverPortalAccount } from "./DriverPortalShell";

type CompletedRental = {
  rental: DriverRentalDto;
  assignment: DriverScheduleEntry;
};

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthRange(month: string): { from: string; to: string } {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 0, 23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

function isCompleted(status: string | null | undefined): boolean {
  return status?.trim().toLocaleLowerCase() === "completed";
}

export default function DriverRevenueDashboard() {
  const account = useDriverPortalAccount();
  const [month, setMonth] = useState(currentMonth);
  const [assignments, setAssignments] = useState<DriverScheduleEntry[]>([]);
  const [completedRentals, setCompletedRentals] = useState<CompletedRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError("");
        try {
          const { from, to } = monthRange(month);
          const monthAssignments = await getDriverSchedule(account.staffId, from, to);
          const rentalAssignments = [
            ...new Map(
              monthAssignments
                .filter(
                  (assignment): assignment is DriverScheduleEntry & { rentalId: number } =>
                    typeof assignment.rentalId === "number" &&
                    Number.isInteger(assignment.rentalId) &&
                    assignment.rentalId > 0,
                )
                .map((assignment) => [assignment.rentalId, assignment]),
            ).values(),
          ];
          const rentals = await Promise.all(
            rentalAssignments.map(async (assignment) => ({
              assignment,
              rental: await getDriverRental(assignment.rentalId),
            })),
          );
          if (active) {
            setAssignments(monthAssignments);
            setCompletedRentals(
              rentals.filter(({ rental, assignment }) =>
                isCompleted(rental.status ?? assignment.rentalStatus),
              ),
            );
          }
        } catch (loadError) {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "Không thể tải dữ liệu doanh thu tài xế.",
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [account.staffId, month]);

  const totalRevenue = useMemo(
    () => completedRentals.reduce((total, item) => total + (item.rental.totalPrice || 0), 0),
    [completedRentals],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Doanh thu theo lịch phân công
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Doanh thu chuyến xe
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Tổng giá trị thuê của các chuyến đã hoàn thành và được phân công cho bạn.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="sr-only">Chọn tháng</span>
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.currentTarget.value)}
            className="bg-transparent outline-none"
          />
        </label>
      </div>

      <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
        Số liệu là tổng giá trị thuê của chuyến đã hoàn thành, không phải hoa hồng cá nhân hoặc doanh thu đã đối soát thanh toán.
      </p>
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Đang tải doanh thu...
        </p>
      )}

      <section aria-label="Chỉ số doanh thu" className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CircleDollarSign className="h-5 w-5" />
          </span>
          <p className="mt-5 text-sm font-medium text-slate-500">Tổng giá trị chuyến hoàn thành</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {loading ? "—" : `${totalRevenue.toLocaleString("vi-VN")} ₫`}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          <p className="mt-5 text-sm font-medium text-slate-500">Chuyến được phân công trong tháng</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {loading ? "—" : assignments.length.toLocaleString("vi-VN")}
          </p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-bold text-slate-900">Chuyến đã hoàn thành</h3>
        </div>
        {!loading && !error && completedRentals.length === 0 && (
          <p className="px-5 py-6 text-sm text-slate-500">
            Chưa có chuyến hoàn thành trong tháng đã chọn.
          </p>
        )}
        {completedRentals.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Mã chuyến</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-5 py-3 text-right">Giá trị thuê</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedRentals.map(({ rental, assignment }) => (
                  <tr key={`${rental.id}-${assignment.assignmentId ?? assignment.startTime ?? ""}`} className="text-sm">
                    <td className="px-5 py-4 font-semibold text-slate-800">#{rental.id}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(rental.endTime ?? assignment.endTime ?? rental.startTime ?? assignment.startTime)}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      {(rental.totalPrice ?? 0).toLocaleString("vi-VN")} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });
}
