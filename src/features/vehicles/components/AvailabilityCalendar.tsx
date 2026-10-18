"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Wrench, Clock } from "lucide-react";
import { BusySlot } from "../types";
import {
  GMT7_TIMEZONE,
  nowGmt7,
  formatDate,
  toUtcIso,
} from "@/lib/time";
import { TZDate } from "@date-fns/tz";
import { addDays, startOfDay, endOfDay, isSameDay } from "date-fns";

export interface AvailabilityCalendarProps {
  vehicleId: number | string;
  busySlots?: BusySlot[];
  isLoading?: boolean;
  selectedRange?: { from: string | null; to: string | null };
  onSelectSlotRange?: (range: { from: string; to: string }) => void;
  className?: string;
}

export function AvailabilityCalendar({
  vehicleId,
  busySlots = [],
  isLoading = false,
  onSelectSlotRange,
  className = "",
}: AvailabilityCalendarProps) {
  // Bắt đầu từ ngày hôm nay (GMT+7)
  const [baseDate, setBaseDate] = useState<Date>(() => nowGmt7());

  // Tạo dải 31 ngày từ baseDate
  const days = useMemo(() => {
    const list: Date[] = [];
    const start = new TZDate(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, GMT7_TIMEZONE);
    for (let i = 0; i < 31; i++) {
      list.push(addDays(start, i));
    }
    return list;
  }, [baseDate]);

  // Phân loại trạng thái của từng ngày
  const dayStatusList = useMemo(() => {
    return days.map((day) => {
      const dayStart = startOfDay(day).getTime();
      const dayEnd = endOfDay(day).getTime();

      let status: "available" | "booked" | "maintenance" | "buffer" = "available";
      let matchedSlot: BusySlot | null = null;

      for (const slot of busySlots) {
        const slotStart = new Date(slot.from).getTime();
        const slotEnd = new Date(slot.to).getTime();

        // Kiểm tra overlap trong ngày
        if (dayStart < slotEnd && dayEnd > slotStart) {
          matchedSlot = slot;
          if (slot.isBuffer) {
            status = "buffer";
          } else if (slot.reason?.toLowerCase().includes("bảo trì") || slot.reason?.toLowerCase().includes("maintenance")) {
            status = "maintenance";
          } else {
            status = "booked";
          }
          break;
        }
      }

      return {
        date: day,
        status,
        matchedSlot,
      };
    });
  }, [days, busySlots]);

  // Điều hướng xem 14 ngày trước / sau
  const handlePrev = () => {
    setBaseDate((prev) => addDays(prev, -14));
  };

  const handleNext = () => {
    setBaseDate((prev) => addDays(prev, 14));
  };

  const handleResetToday = () => {
    setBaseDate(nowGmt7());
  };

  // Chọn ngày
  const handleDateClick = (dayItem: (typeof dayStatusList)[0]) => {
    if (dayItem.status !== "available" || !onSelectSlotRange) return;

    const fromDate = new TZDate(dayItem.date.getFullYear(), dayItem.date.getMonth(), dayItem.date.getDate(), 8, 0, 0, GMT7_TIMEZONE);
    const toDate = addDays(fromDate, 1);

    onSelectSlotRange({
      from: toUtcIso(fromDate),
      to: toUtcIso(toDate),
    });
  };

  return (
    <div className={`rounded-2xl border border-line bg-surface p-5 shadow-e1 ${className}`}>
      {/* 1. Header & Điều hướng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h3 className="text-base font-bold text-ink">
            Lịch khả dụng & trạng thái xe (31 ngày tới)
          </h3>
          <p className="mt-0.5 text-xs text-ink-3">
            Múi giờ chuẩn GMT+7 (Asia/Ho_Chi_Minh). Nhấp vào ô trống để chọn lịch nhận xe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToday}
            className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink-2 hover:bg-sunken transition-colors cursor-pointer"
          >
            Hôm nay
          </button>
          <div className="flex items-center border border-line rounded-lg overflow-hidden bg-surface">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="14 ngày trước"
              className="p-1.5 text-ink-2 hover:bg-sunken transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="14 ngày kế tiếp"
              className="p-1.5 text-ink-2 hover:bg-sunken border-l border-line transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Chú thích trực quan (Legend — WCAG: không phụ thuộc độc nhất màu sắc) */}
      <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-ink-2 border-b border-line">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-line bg-surface inline-block" />
          <span>Còn trống</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3.5 h-3.5 rounded border border-line bg-sunken inline-block bg-[url('data:image/svg+xml,%3Csvg%20width=%278%27%20height=%278%27%20viewBox=%270%200%208%208%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d=%27M0%208L8%200M-1%201L1%20-1M7%209L9%207%27%20stroke=%27%2364748b%27%20stroke-width=%271.2%27%20stroke-opacity=%270.3%27/%3E%3C/svg%3E')]"
          />
          <span>Đã có đơn thuê</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-warning/40 bg-warning-bg flex items-center justify-center">
            <Wrench className="w-2.5 h-2.5 text-warning" />
          </span>
          <span>Bảo trì kỹ thuật</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-dashed border-ink-3/40 bg-surface flex items-center justify-center">
            <Clock className="w-2.5 h-2.5 text-ink-3" />
          </span>
          <span>Đệm giao nhận 60p</span>
        </div>
      </div>

      {/* 3. Lưới 31 ngày */}
      <div className="mt-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 animate-pulse">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-sunken" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {dayStatusList.map((dayItem, idx) => {
              const formattedDay = formatDate(dayItem.date, "dd/MM");
              const isToday = isSameDay(dayItem.date, nowGmt7());

              let cardStyles = "border-line bg-surface hover:border-primary cursor-pointer hover:shadow-xs";
              let badgeLabel = "Sẵn sàng";
              let badgeStyles = "bg-success-bg text-success";

              if (dayItem.status === "booked") {
                cardStyles =
                  "border-line bg-sunken/80 opacity-80 cursor-not-allowed bg-[url('data:image/svg+xml,%3Csvg%20width=%278%27%20height=%278%27%20viewBox=%270%200%208%208%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d=%27M0%208L8%200M-1%201L1%20-1M7%209L9%207%27%20stroke=%27%2364748b%27%20stroke-width=%271.2%27%20stroke-opacity=%270.3%27/%3E%3C/svg%3E')]";
                badgeLabel = "Đã đặt";
                badgeStyles = "bg-sunken text-ink-3 border border-line";
              } else if (dayItem.status === "maintenance") {
                cardStyles = "border-warning/40 bg-warning-bg/40 cursor-not-allowed";
                badgeLabel = "Bảo trì";
                badgeStyles = "bg-warning-bg text-warning";
              } else if (dayItem.status === "buffer") {
                cardStyles = "border-dashed border-ink-3/40 bg-sunken/40 cursor-not-allowed";
                badgeLabel = "Đệm 60p";
                badgeStyles = "bg-sunken text-ink-3";
              }

              return (
                <div
                  key={`day-${idx}-${formattedDay}`}
                  role="button"
                  tabIndex={dayItem.status === "available" ? 0 : -1}
                  onClick={() => handleDateClick(dayItem)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleDateClick(dayItem);
                    }
                  }}
                  className={`flex flex-col justify-between rounded-xl border p-2.5 transition-all text-left ${cardStyles}`}
                  aria-label={`Ngày ${formattedDay}: ${badgeLabel}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold tabular-nums text-ink">
                      {formattedDay}
                    </span>
                    {isToday && (
                      <span className="rounded-full bg-primary-tint px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-1">
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${badgeStyles}`}>
                      {badgeLabel}
                    </span>
                    {dayItem.status === "available" && (
                      <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                    )}
                    {dayItem.status === "maintenance" && (
                      <Wrench className="w-3 h-3 text-warning shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Screen Reader Accessible Table Summary */}
      <div className="sr-only" aria-live="polite">
        <h4>Bảng tổng kết tình trạng lịch khả dụng của xe {vehicleId} trong 31 ngày tới:</h4>
        <ul>
          {dayStatusList.map((item, i) => (
            <li key={`sr-${i}`}>
              Ngày {formatDate(item.date, "dd/MM/yyyy")}:{" "}
              {item.status === "available"
                ? "Xe còn trống, có thể đặt thuê."
                : item.status === "booked"
                  ? `Xe đã có đơn thuê (${item.matchedSlot?.reason || "Đã đặt"}).`
                  : item.status === "maintenance"
                    ? "Xe đang bảo trì kỹ thuật định kỳ."
                    : "Khoảng đệm giao nhận xe 60 phút."}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
