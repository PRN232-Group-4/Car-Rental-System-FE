import Link from "next/link";
import { ArrowRight, MapPin, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { formatDateTime } from "@/lib/time";
import { TripStatusBadge } from "./TripStatusBadge";
import type { TripListItem } from "../types";

interface TripCardProps {
  trip: TripListItem;
}

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
        className="bg-td-white rounded border border-td-rule p-5 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between gap-4 h-full group"
      >
        <div className="space-y-3">
          {/* Header xe & Trạng thái */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-td-ink group-hover:text-primary transition-colors">
                  {vehicle.brand} {vehicle.model}
                </h3>
                {vehicle.licensePlate && (
                  <span className="font-mono text-[11px] font-semibold bg-td-chalk px-2 py-0.5 rounded border border-td-rule text-td-ink">
                    {vehicle.licensePlate}
                  </span>
                )}
              </div>
              {vehicle.category && (
                <span className="text-xs text-td-muted block mt-0.5">{vehicle.category}</span>
              )}
            </div>
            <TripStatusBadge status={status} />
          </div>

          {/* Thời gian nhận - trả GMT+7 */}
          <div className="space-y-1 text-xs text-td-ink font-mono bg-td-chalk rounded p-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>
                Nhận: <strong className="text-td-ink">{formatDateTime(start)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-td-muted shrink-0" aria-hidden="true" />
              <span>
                Trả: <strong className="text-td-ink">{formatDateTime(end)}</strong>
              </span>
            </div>
          </div>

          {/* Trạm giao nhận xe */}
          {trip.facility && (
            <div className="flex items-center gap-2 text-xs text-td-muted">
              <MapPin className="w-3.5 h-3.5 text-td-muted shrink-0" aria-hidden="true" />
              <span className="truncate">{trip.facility.name}</span>
            </div>
          )}
        </div>

        {/* Footer: Giá & CTA */}
        <div className="pt-3 border-t border-td-rule flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-td-muted uppercase font-bold tracking-wider block">
              {isSubscription ? "Hình thức" : "Tổng chi phí"}
            </span>
            {isSubscription ? (
              <span className="font-mono text-sm font-bold text-primary">
                Trừ {subscriptionHoursUsed ?? 0} giờ gói
              </span>
            ) : (
              <span className="font-mono text-base font-bold text-td-ink">
                {formatVnd(totalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {trip.nextAction === "report_issue" && (
              <Link
                href={`/report-incident?rentalId=${trip.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-warning hover:underline px-2.5 py-1.5 rounded border border-warning/30 bg-warning-bg/30"
              >
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Báo sự cố</span>
              </Link>
            )}

            {trip.nextAction === "rebook" && (
              <Link
                href={`/vehicles/detail?id=${vehicle.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-td-ink hover:text-primary px-2.5 py-1.5 rounded border border-td-rule bg-td-white"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Đặt lại</span>
              </Link>
            )}

            <Link
              href={`/account/trips/detail?id=${trip.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline px-3 py-1.5 rounded bg-primary-tint/40"
            >
              <span>Chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}
