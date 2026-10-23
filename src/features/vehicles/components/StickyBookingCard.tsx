"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { Vehicle, RentalPolicy } from "../types";
import { DateTimeRangePicker, DateTimeRangeValue } from "@/components/ui/DateTimeRangePicker";
import { PriceBreakdown } from "./PriceBreakdown";
import { checkVehicleAvailability } from "../api";
import { nowGmt7, toUtcIso, fromUtcIso, diffHours, formatTime } from "@/lib/time";
import { addDays } from "date-fns";

export interface StickyBookingCardProps {
  vehicle: Vehicle;
  policy?: RentalPolicy | null;
  initialFrom?: string;
  initialTo?: string;
  initialMode?: "self" | "driver" | "subscription";
  initialRentalType?: "hourly" | "longterm";
  className?: string;
}

export function StickyBookingCard({
  vehicle,
  policy,
  initialFrom,
  initialTo,
  initialMode = "self",
  initialRentalType = "hourly",
  className = "",
}: StickyBookingCardProps) {
  const router = useRouter();

  // Hình thức thuê
  const [rentalType, setRentalType] = useState<"hourly" | "longterm">(initialRentalType);
  // Có tài xế hay tự lái
  const [hasDriver, setHasDriver] = useState(initialMode === "driver");

  // Thời gian nhận / trả xe
  const [dateRange, setDateRange] = useState<DateTimeRangeValue>(() => {
    if (initialFrom && initialTo) {
      return {
        from: initialFrom,
        to: initialTo,
        startDate: fromUtcIso(initialFrom),
        endDate: fromUtcIso(initialTo),
        startTime: formatTime(initialFrom),
        endTime: formatTime(initialTo),
      };
    }
    // Mặc định: ngày mai 08:00 đến ngày mốt 08:00 (24 giờ)
    const tomorrow = addDays(nowGmt7(), 1);
    const dayAfter = addDays(tomorrow, 1);
    return {
      from: toUtcIso(tomorrow),
      to: toUtcIso(dayAfter),
      startDate: tomorrow,
      endDate: dayAfter,
      startTime: "08:00",
      endTime: "08:00",
    };
  });

  const [previousDates, setPreviousDates] = useState({ from: initialFrom, to: initialTo });
  if (previousDates.from !== initialFrom || previousDates.to !== initialTo) {
    setPreviousDates({ from: initialFrom, to: initialTo });
    if (initialFrom && initialTo) setDateRange({
      from: initialFrom, to: initialTo,
      startDate: fromUtcIso(initialFrom), endDate: fromUtcIso(initialTo),
      startTime: formatTime(initialFrom), endTime: formatTime(initialTo),
    });
  }

  // Tính số giờ và số ngày
  const duration = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
      return { hours: 24, days: 1 };
    }
    const h = Math.max(1, Math.round(diffHours(dateRange.from, dateRange.to)));
    const d = Math.max(1, Math.ceil(h / 24));
    return { hours: h, days: d };
  }, [dateRange]);

  // Kiểm tra tình trạng xe khả dụng theo thời gian đã chọn
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [rawAvailabilityError, setRawAvailabilityError] = useState<string | null>(null);

  const availabilityError = dateRange.from && dateRange.to ? rawAvailabilityError : null;

  useEffect(() => {
    if (!dateRange.from || !dateRange.to) return;

    let active = true;
    const check = async () => {
      await Promise.resolve();
      if (!active) return;
      setIsCheckingAvailability(true);
      try {
        const result = await checkVehicleAvailability(vehicle.id, dateRange.from!, dateRange.to!);
        if (active) {
          if (!result.available) {
            setRawAvailabilityError(result.reason || "Xe đã có đơn thuê hoặc trùng lịch bảo dưỡng");
          } else {
            setRawAvailabilityError(null);
          }
        }
      } catch {
        if (active) setRawAvailabilityError(null);
      } finally {
        if (active) setIsCheckingAvailability(false);
      }
    };

    void check();
    return () => {
      active = false;
    };
  }, [vehicle.id, dateRange.from, dateRange.to]);

  const handleProceedBooking = () => {
    if (!dateRange.from || !dateRange.to || availabilityError) return;

    const query = new URLSearchParams({
      vehicleId: String(vehicle.id),
      facilityId: String(vehicle.facilityId),
      from: dateRange.from,
      to: dateRange.to,
      mode: hasDriver ? "driver" : "self",
      rentalType,
    });
    if (initialMode === "subscription" && !hasDriver && rentalType === "hourly") query.set("paymentMode", "subscription");

    router.push(`/booking?${query.toString()}`);
  };

  return (
    <aside
      data-testid="sticky-booking-card"
      className={`rounded border border-td-rule bg-td-white p-5 sm:p-6 space-y-5 ${className}`}
    >
      {/* 1. Header giá & toggle hình thức */}
      <div className="flex items-center justify-between border-b border-td-rule pb-4">
        <div>
          <span className="text-xs font-semibold text-td-muted">Đơn giá niêm yết:</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-2xl font-black tabular-nums text-primary">
              {new Intl.NumberFormat("vi-VN").format(vehicle.hourlyPrice)}₫
            </span>
            <span className="text-xs font-semibold text-td-muted">/giờ</span>
          </div>
        </div>

        {/* Toggle Hourly / Longterm */}
        <div className="flex rounded bg-td-chalk p-1 border border-td-rule">
          <button
            type="button"
            onClick={() => setRentalType("hourly")}
            className={`rounded px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              rentalType === "hourly"
                ? "bg-td-white text-td-ink shadow-xs"
                : "text-td-muted hover:text-td-ink"
            }`}
          >
            Theo giờ
          </button>
          <button
            type="button"
            onClick={() => setRentalType("longterm")}
            className={`rounded px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              rentalType === "longterm"
                ? "bg-td-white text-td-ink shadow-xs"
                : "text-td-muted hover:text-td-ink"
            }`}
          >
            Dài hạn
          </button>
        </div>
      </div>

      {/* 2. Bộ chọn lịch trình GMT+7 */}
      <div className="space-y-1.5">
        <label className="flex items-center justify-between text-xs font-bold text-td-ink">
          <span>Lịch trình thuê xe (GMT+7)</span>
          <span className="font-mono text-[11px] text-td-muted">
            {duration.days > 0 ? `${duration.days} ngày (${duration.hours}h)` : `${duration.hours}h`}
          </span>
        </label>

        <DateTimeRangePicker
          value={dateRange}
          rentalMode={rentalType}
          onChange={(newVal) => setDateRange(newVal)}
        />
      </div>

      {/* 3. Lựa chọn Có tài xế / Tự lái (Nếu là ô tô) */}
      {!vehicle.category.includes("motorbike") && (
        <div className="flex items-center justify-between rounded border border-td-rule bg-td-paper p-3">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-primary" />
            <div>
              <span className="text-xs font-bold text-td-ink">Kèm tài xế Thong Dong</span>
              <p className="text-[10px] text-td-muted">+500.000đ/ngày • Lái xe kinh nghiệm</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasDriver}
              onChange={(e) => setHasDriver(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-td-chalk peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-td-rule after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>
      )}

      {/* 4. Cảnh báo tình trạng xe khả dụng */}
      {availabilityError && (
        <div className="flex items-start gap-2 rounded bg-warning-bg/60 p-3 text-xs font-medium text-warning border border-warning/20">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{availabilityError}</span>
        </div>
      )}

      {/* 5. Bảng dự toán chi phí minh bạch */}
      <PriceBreakdown
        hourlyRate={vehicle.hourlyPrice}
        monthlyRate={vehicle.monthlyPrice}
        hours={duration.hours}
        days={duration.days}
        hasDriver={hasDriver}
        rentalType={rentalType}
        policy={policy}
      />

      {/* 6. Nút Tiến Hành Đặt Xe */}
      <button
        type="button"
        onClick={handleProceedBooking}
        disabled={Boolean(availabilityError) || isCheckingAvailability || !dateRange.from}
        className="w-full flex items-center justify-center gap-2 rounded bg-primary py-3.5 px-6 font-bold text-sm text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <span>Tiến hành đặt xe</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-center text-[11px] text-td-muted">
        Không mất phí hủy trước 24 giờ • Hỗ trợ xuất hóa đơn VAT điện tử
      </p>
    </aside>
  );
}
