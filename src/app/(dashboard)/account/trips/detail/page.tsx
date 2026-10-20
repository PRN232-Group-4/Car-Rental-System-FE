"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Car,
  Clock,
  FileText,
  AlertCircle,
  XCircle,
  Star,
  User,
} from "lucide-react";
import { AuthGate } from "@/features/auth/AuthGate";
import { useMyTrip, useNow, getTripRemainingTime } from "@/features/account/trips/hooks";
import { TripStatusBadge } from "@/features/account/trips/components/TripStatusBadge";
import { TripStepper } from "@/features/account/trips/components/TripStepper";
import { TripPriceBreakdown } from "@/features/account/trips/components/TripPriceBreakdown";
import { TripInspections } from "@/features/account/trips/components/TripInspections";
import { TripTimeline } from "@/features/account/trips/components/TripTimeline";
import { CancelDialog } from "@/features/account/trips/components/CancelDialog";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime } from "@/lib/time";

function TripDetailContent() {
  const searchParams = useSearchParams();
  const tripIdStr = searchParams.get("id");
  const tripId = tripIdStr ? parseInt(tripIdStr, 10) : 0;

  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const { data: trip, isLoading, error, refetch } = useMyTrip(tripId);
  const now = useNow();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="bg-surface rounded-2xl border border-line p-10 text-center space-y-4 max-w-lg mx-auto mt-10">
        <div className="w-12 h-12 rounded-full bg-sunken flex items-center justify-center mx-auto text-ink-3">
          <Car className="w-6 h-6" />
        </div>
        <h2 className="font-display text-xl font-bold text-ink">
          Không tìm thấy chuyến đi
        </h2>
        <p className="text-sm text-ink-3">
          {error instanceof Error ? error.message : "Không tải được thông tin chuyến đi. Vui lòng thử lại."}
        </p>
        <Link href="/account/trips">
          <Button variant="primary" className="mt-2">
            Quay lại danh sách chuyến đi
          </Button>
        </Link>
      </div>
    );
  }

  // Đếm ngược hoặc cảnh báo quá giờ
  const countdown =
    trip.status === "renting" ? getTripRemainingTime(trip.end, now) : null;

  return (
    <div className="space-y-6">
      {/* Nút quay lại & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-5">
        <div>
          <Link
            href="/account/trips"
            className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-primary mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách chuyến đi</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
              {trip.vehicle.brand} {trip.vehicle.model}
            </h1>
            {trip.vehicle.licensePlate && (
              <span className="font-mono text-xs font-semibold bg-sunken px-2.5 py-1 rounded border border-line text-ink">
                {trip.vehicle.licensePlate}
              </span>
            )}
            <TripStatusBadge status={trip.status} />
          </div>
          <span className="text-xs text-ink-3 font-mono mt-1 block">
            Mã yêu cầu: #{trip.id}{trip.orderId ? ` · Mã đơn chính thức: #${trip.orderId}` : " · Chưa phát hành đơn chính thức"}
          </span>
        </div>

        {/* Nút hành động đầu trang */}
        <div className="flex items-center gap-2">
          {trip.status === "renting" && (
            <Link href={`/report-incident?rentalId=${trip.id}`}>
              <Button variant="ghost" className="text-warning hover:bg-warning-bg/40">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                <span>Báo sự cố</span>
              </Button>
            </Link>
          )}

          {trip.canCancel && (
            <Button
              variant="danger"
              onClick={() => setCancelModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Hủy chuyến</span>
            </Button>
          )}
        </div>
      </div>

      {/* Banner đếm ngược / Quá giờ khi đang renting */}
      {countdown && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            countdown.isOverdue
              ? "bg-danger-bg/40 border-danger/30 text-danger"
              : "bg-primary-tint/30 border-primary/20 text-primary"
          }`}
          aria-live="off"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-sm font-bold block">{countdown.displayText}</span>
              <span className="text-xs text-ink-3">
                {countdown.isOverdue
                  ? "Vui lòng di chuyển về trạm trả xe sớm nhất để tránh phát sinh thêm phụ phí theo giờ."
                  : `Hạn chót bàn giao xe tại trạm: ${formatDateTime(trip.end)}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stepper tiến trình */}
      <TripStepper
        status={trip.status}
        cancelReason={trip.timeline.find((t) => t.to === "cancelled")?.reason}
      />

      {/* Bố cục 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột chính (2 cột) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin nhận - trả xe */}
          <div className="bg-surface rounded-2xl border border-line p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Thông tin hành trình & Bàn giao
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-sunken rounded-xl p-4">
              <div>
                <span className="text-ink-3 font-sans block mb-1">Thời gian nhận xe (GMT+7)</span>
                <span className="font-bold text-ink text-sm">{formatDateTime(trip.start)}</span>
              </div>
              <div>
                <span className="text-ink-3 font-sans block mb-1">Thời gian trả xe (GMT+7)</span>
                <span className="font-bold text-ink text-sm">{formatDateTime(trip.end)}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-ink-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink font-semibold">Địa điểm & Cơ sở: </strong>
                  <span>{trip.pickup?.location || trip.facility?.name || "Tại cơ sở hệ thống"}</span>
                </div>
              </div>
              {trip.color && (
                <div>
                  <strong className="text-ink font-semibold">Màu sắc phương tiện: </strong>
                  <span>{trip.color}</span>
                </div>
              )}
            </div>

            {/* Thông tin tài xế riêng (nếu có tài xế đi kèm) */}
            {trip.hasDriver && trip.driver && (
              <div className="pt-4 border-t border-line flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sunken flex items-center justify-center text-ink-3">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-ink-3 block">Tài xế phụ trách hành trình</span>
                    <span className="text-sm font-bold text-ink">{trip.driver.fullName}</span>
                  </div>
                </div>
                {typeof trip.driver.rating === "number" && (
                  <div className="flex items-center gap-1 font-mono text-xs font-bold bg-sunken px-2.5 py-1 rounded-full border border-line text-ink">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span>{trip.driver.rating.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Biên bản kiểm định trước & sau */}
          <TripInspections inspections={trip.inspections} />

          {/* Dòng thời gian Timeline */}
          <TripTimeline timeline={trip.timeline} />
        </div>

        {/* Cột phụ (1 cột) */}
        <div className="space-y-6">
          {/* Bảng giá & Quyết toán hoàn cọc */}
          <TripPriceBreakdown trip={trip} />

          {/* Thông tin hóa đơn điện tử */}
          {trip.invoice && (
            <div className="bg-surface rounded-2xl border border-line p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Hóa đơn điện tử</span>
                </div>
                <span className="font-mono text-xs text-ink-3">
                  #{trip.invoice.number}
                </span>
              </div>
              <p className="text-xs text-ink-2">
                Hóa đơn VAT điện tử được xuất tự động sau khi thanh toán hoàn tất.
              </p>
              <Link
                href={`/invoices/${trip.invoice.id}`}
                className="inline-flex items-center justify-center w-full h-9 rounded-lg border border-line bg-surface hover:bg-sunken text-xs font-semibold text-ink transition-colors"
              >
                <span>Xem chi tiết hóa đơn</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modal xác nhận hủy chuyến */}
      {cancelModalOpen && (
        <CancelDialog
          open={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          trip={trip}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}

export default function TripDetailPage() {
  return (
    <AuthGate allowedRoles={["Customer"]}>
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-ink-3">
            Đang tải chi tiết chuyến đi...
          </div>
        }
      >
        <TripDetailContent />
      </Suspense>
    </AuthGate>
  );
}
