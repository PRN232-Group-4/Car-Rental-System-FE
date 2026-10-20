"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleDollarSign, ClipboardCheck } from "lucide-react";
import { getDriverRental, getDriverSchedule } from "./api";
import type { DriverRentalDto, DriverScheduleEntry } from "./api";
import { useDriverPortalAccount } from "./DriverPortalShell";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";

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
      <TransitFolio
        index="10"
        tag="NV"
        kicker="NHÂN VIÊN · DOANH THU CHUYẾN"
        title={<>Doanh thu <em className="italic text-td-teal">chuyến xe.</em></>}
        description="Tổng giá trị thuê của các chuyến đã hoàn thành và được phân công cho bạn."
      >
        <div className="border-l border-td-rule pl-4 text-right">
          <span className="block font-mono text-[10px] tracking-wider text-td-muted">TỔNG GIÁ TRỊ</span>
          <strong className="block font-sans text-2xl font-bold tracking-tight text-td-ink">
            {loading ? "—" : `${totalRevenue.toLocaleString("vi-VN")} ₫`}
          </strong>
        </div>
        <label className="flex items-center gap-2 rounded border border-td-rule px-2.5 py-1.5 font-mono text-[11px] text-td-ink">
          <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="sr-only">Chọn tháng</span>
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.currentTarget.value)}
            className="bg-transparent outline-none"
          />
        </label>
      </TransitFolio>

      <p className="max-w-3xl border-l-2 border-info pl-3 text-xs leading-relaxed text-td-muted">
        Số liệu là tổng giá trị thuê của chuyến đã hoàn thành, không phải hoa hồng cá nhân hoặc doanh thu đã đối soát thanh toán.
      </p>
      {error && (
        <p role="alert" className="border-l-2 border-danger pl-3 text-sm text-danger">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="font-mono text-[11px] text-td-muted">
          Đang tải doanh thu...
        </p>
      )}

      <section aria-label="Chỉ số doanh thu" className="grid gap-6 border-y-2 border-td-ink py-6 sm:grid-cols-2">
        <div className="relative pl-5 first:pl-5 sm:border-l sm:border-td-rule sm:pl-5 sm:first:border-l-0 sm:first:pl-0">
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase text-td-muted">
            <CircleDollarSign className="h-3.5 w-3.5" aria-hidden="true" /> 01 · Tổng giá trị chuyến hoàn thành
          </span>
          <strong className="mt-2 block font-sans text-4xl font-bold tracking-tight text-td-ink">
            {loading ? "—" : `${totalRevenue.toLocaleString("vi-VN")} ₫`}
          </strong>
        </div>
        <div className="relative pl-5 sm:border-l sm:border-td-rule sm:pl-5">
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase text-td-muted">
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" /> 02 · Chuyến được phân công trong tháng
          </span>
          <strong className="mt-2 block font-sans text-4xl font-bold tracking-tight text-td-ink">
            {loading ? "—" : assignments.length.toLocaleString("vi-VN")}
          </strong>
        </div>
      </section>

      <section aria-label="Chuyến đã hoàn thành">
        <div className="flex items-baseline justify-between border-b border-td-ink pb-2">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-td-muted">
            Chuyến đã hoàn thành
          </h3>
          <span className="font-mono text-[11px] text-td-muted">{completedRentals.length} chuyến</span>
        </div>
        {!loading && !error && completedRentals.length === 0 && (
          <p className="py-8 text-center text-xs text-td-muted">
            Chưa có chuyến hoàn thành trong tháng đã chọn.
          </p>
        )}
        {completedRentals.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-td-rule font-mono text-[11px] uppercase tracking-wider text-td-muted">
                  <th className="py-2.5 pr-4 font-bold">Mã chuyến</th>
                  <th className="px-4 py-2.5 font-bold">Thời gian</th>
                  <th className="py-2.5 pl-4 text-right font-bold">Giá trị thuê</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-td-rule">
                {completedRentals.map(({ rental, assignment }) => (
                  <tr key={`${rental.id}-${assignment.assignmentId ?? assignment.startTime ?? ""}`} className="text-xs">
                    <td className="py-3 pr-4 font-mono font-bold text-td-ink">#{rental.id}</td>
                    <td className="px-4 py-3 font-mono text-td-muted">
                      {formatDate(rental.endTime ?? assignment.endTime ?? rental.startTime ?? assignment.startTime)}
                    </td>
                    <td className="py-3 pl-4 text-right font-mono font-bold text-td-ink">
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
