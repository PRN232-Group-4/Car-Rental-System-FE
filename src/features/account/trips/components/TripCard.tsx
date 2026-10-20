import Link from "next/link";
import { ArrowRight, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { formatDateTime } from "@/lib/time";
import { TripStatusBadge } from "./TripStatusBadge";
import type { TripListItem } from "../types";

interface TripCardProps {
  trip: TripListItem;
}

/** Một dòng trong sổ chuyến đi của khách hàng (ghi đè ledger của cổng khách). */
export function TripCard({ trip }: TripCardProps) {
  const { vehicle, status, start, end, totalPrice, isSubscription, subscriptionHoursUsed } = trip;

  const a11ySummary = `Chuyến đi ${vehicle.brand} ${vehicle.model}, từ ${formatDateTime(
    start
  )} đến ${formatDateTime(end)}, trạng thái: ${status}, giá ${
    isSubscription ? "Gói thuê bao" : formatVnd(totalPrice)
  }`;

  return (
    <li className="list-none">
      <div
        aria-label={a11ySummary}
        className="group grid grid-cols-12 items-center gap-4 border-b border-td-rule py-3.5 transition-colors hover:bg-td-chalk/40"
      >
        {/* Phương tiện */}
        <div className="col-span-4 min-w-0">
          <Link
            href={`/account/trips/detail?id=${trip.id}`}
            className="block truncate text-sm font-bold text-td-ink transition-colors group-hover:text-primary"
          >
            {vehicle.brand} {vehicle.model}
          </Link>
          <span className="mt-0.5 block truncate font-mono text-[11px] text-td-muted">
            {vehicle.licensePlate ? `${vehicle.licensePlate} · ` : ""}
            {vehicle.category ?? "Chưa phân loại"}
          </span>
        </div>

        {/* Thời gian nhận / trả */}
        <div className="col-span-4 min-w-0 font-mono text-[11px] text-td-ink">
          <span className="block truncate">
            <span className="text-td-muted">Nhận </span>
            {formatDateTime(start)}
          </span>
          <span className="mt-0.5 block truncate">
            <span className="text-td-muted">Trả </span>
            {formatDateTime(end)}
          </span>
        </div>

        {/* Chi phí */}
        <div className="col-span-2 text-right">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-td-muted">
            {isSubscription ? "Hình thức" : "Tổng chi phí"}
          </span>
          {isSubscription ? (
            <span className="block font-mono text-xs font-bold text-primary">
              Trừ {subscriptionHoursUsed ?? 0} giờ gói
            </span>
          ) : (
            <span className="block font-mono text-xs font-bold text-td-ink">{formatVnd(totalPrice)}</span>
          )}
        </div>

        {/* Trạng thái + thao tác */}
        <div className="col-span-2 flex flex-col items-end gap-1.5">
          <TripStatusBadge status={status} />
          <div className="flex items-center gap-2">
            {trip.nextAction === "report_issue" && (
              <Link
                href={`/report-incident?rentalId=${trip.id}`}
                className="inline-flex items-center gap-1 rounded border border-td-rule px-2 py-1 text-[11px] font-bold text-td-ink transition-colors hover:bg-td-chalk"
                aria-label={`Báo sự cố cho chuyến ${trip.id}`}
              >
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                <span>Sự cố</span>
              </Link>
            )}
            {trip.nextAction === "rebook" && (
              <Link
                href={`/vehicles/detail?id=${vehicle.id}`}
                className="inline-flex items-center gap-1 rounded border border-td-rule px-2 py-1 text-[11px] font-bold text-td-ink transition-colors hover:bg-td-chalk"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                <span>Đặt lại</span>
              </Link>
            )}
            <Link
              href={`/account/trips/detail?id=${trip.id}`}
              className="inline-flex items-center gap-1 rounded border border-td-rule px-2 py-1 text-[11px] font-bold text-td-ink transition-colors hover:bg-td-chalk"
            >
              <span>Chi tiết</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          {trip.facility && (
            <span className="flex max-w-full items-center gap-1 text-[10px] text-td-muted">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{trip.facility.name}</span>
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export default TripCard;
