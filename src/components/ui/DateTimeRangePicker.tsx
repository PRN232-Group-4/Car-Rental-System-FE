"use client";

import React, { useState, useId, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker, DateRange } from "react-day-picker";
import { vi } from "date-fns/locale";
import { Calendar, Clock, ChevronDown, AlertCircle, RotateCcw, Check } from "lucide-react";
import {
  GMT7_TIMEZONE,
  nowGmt7,
  toUtcIso,
  fromUtcIso,
  formatRange,
  combineDateAndTimeGmt7,
  diffHours,
  generateTimeSlots,
} from "@/lib/time";
import { BusySlot } from "@/features/vehicles/types";

export interface DateTimeRangeValue {
  from: string | null;      // Chuỗi UTC ISO
  to: string | null;        // Chuỗi UTC ISO
  startDate?: Date;         // Date đối tượng hiển thị (GMT+7)
  endDate?: Date;           // Date đối tượng hiển thị (GMT+7)
  startTime?: string;       // "HH:mm" theo GMT+7
  endTime?: string;         // "HH:mm" theo GMT+7
}

export interface DateTimeRangePickerProps {
  id?: string;
  name?: string;
  value?: DateTimeRangeValue;
  defaultValue?: DateTimeRangeValue;
  onChange?: (value: DateTimeRangeValue) => void;
  minDurationMinutes?: number; // Mặc định 1440 (24h) với daily/longterm, hoặc 60 (1h) với hourly
  maxDurationDays?: number;    // Mặc định 366
  stepMinutes?: 15 | 30;       // Mặc định 30 phút
  rentalMode?: "hourly" | "daily" | "longterm";
  disabled?: boolean;
  required?: boolean;
  disabledDates?: (Date | { from: Date; to: Date })[];
  busySlots?: BusySlot[];
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
}

export function DateTimeRangePicker({
  id: externalId,
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  minDurationMinutes,
  maxDurationDays = 366,
  stepMinutes = 30,
  rentalMode = "daily",
  disabled = false,
  required = false,
  disabledDates = [],
  busySlots = [],
  placeholder = "Chọn thời gian nhận & trả xe",
  className = "",
  "aria-invalid": ariaInvalidProp,
  "aria-describedby": ariaDescribedby,
}: DateTimeRangePickerProps) {
  const generatedId = useId();
  const inputId = externalId || generatedId;
  const isInvalid = ariaInvalidProp === true || ariaInvalidProp === "true";

  // Thời lượng tối thiểu tính theo phút (Mặc định: 60 phút nếu hourly, 1440 phút nếu daily/longterm)
  const effectiveMinMinutes = minDurationMinutes ?? (rentalMode === "hourly" ? 60 : 1440);
  const minHours = effectiveMinMinutes / 60;

  // Giờ mặc định
  const defaultStartTime = "08:00";
  const defaultEndTime = "18:00";

  // Khởi tạo state nội bộ
  const [open, setOpen] = useState(false);
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(() => {
    const initial = controlledValue ?? defaultValue;
    if (initial?.startDate && initial?.endDate) {
      return { from: initial.startDate, to: initial.endDate };
    }
    if (initial?.from && initial?.to) {
      return {
        from: fromUtcIso(initial.from),
        to: fromUtcIso(initial.to),
      };
    }
    return undefined;
  });

  const [startTime, setStartTime] = useState<string>(() => {
    return controlledValue?.startTime ?? defaultValue?.startTime ?? defaultStartTime;
  });

  const [endTime, setEndTime] = useState<string>(() => {
    return controlledValue?.endTime ?? defaultValue?.endTime ?? defaultEndTime;
  });

  // Đồng bộ controlled value khi prop thay đổi từ ngoài trong quá trình render
  const [prevControlled, setPrevControlled] = useState(controlledValue);
  if (controlledValue !== undefined && controlledValue !== prevControlled) {
    setPrevControlled(controlledValue);
    if (controlledValue.from && controlledValue.to) {
      setInternalRange({
        from: fromUtcIso(controlledValue.from),
        to: fromUtcIso(controlledValue.to),
      });
    } else if (controlledValue.startDate && controlledValue.endDate) {
      setInternalRange({
        from: controlledValue.startDate,
        to: controlledValue.endDate,
      });
    } else {
      setInternalRange(undefined);
    }

    if (controlledValue.startTime) setStartTime(controlledValue.startTime);
    if (controlledValue.endTime) setEndTime(controlledValue.endTime);
  }

  // Sinh danh sách time slots 30 phút
  const timeSlots = useMemo(() => generateTimeSlots(stepMinutes), [stepMinutes]);

  // Tính toán thời lượng hiện tại
  const currentDurationInfo = useMemo(() => {
    if (!internalRange?.from || !internalRange?.to) {
      return null;
    }
    const startDt = combineDateAndTimeGmt7(internalRange.from, startTime);
    const endDt = combineDateAndTimeGmt7(internalRange.to, endTime);
    const hours = diffHours(startDt, endDt);

    return {
      startDt,
      endDt,
      hours,
      days: Math.floor(hours / 24),
      isValid: hours >= minHours,
    };
  }, [internalRange, startTime, endTime, minHours]);

  // Tính toán lỗi kiểm tra hợp lệ một cách thuần túy (không gọi setState trong effect)
  const validationError = useMemo(() => {
    if (!currentDurationInfo) {
      return null;
    }

    if (currentDurationInfo.hours <= 0) {
      return "Thời gian trả xe phải sau thời gian nhận xe";
    }

    if (currentDurationInfo.hours < minHours) {
      return `Thời gian thuê tối thiểu là ${minHours} giờ`;
    }

    if (currentDurationInfo.days > maxDurationDays) {
      return `Thời gian thuê tối đa không quá ${maxDurationDays} ngày`;
    }

    // Kiểm tra xung đột với busy slots
    const reqStart = currentDurationInfo.startDt.getTime();
    const reqEnd = currentDurationInfo.endDt.getTime();
    for (const slot of busySlots) {
      const sStart = new Date(slot.from).getTime();
      const sEnd = new Date(slot.to).getTime();
      if (reqStart < sEnd && reqEnd > sStart) {
        return "Khoảng thời gian này trùng với lịch xe đang được thuê hoặc bảo trì";
      }
    }

    return null;
  }, [currentDurationInfo, minHours, maxDurationDays, busySlots]);

  // Xử lý áp dụng
  const handleApply = () => {
    if (!currentDurationInfo || !currentDurationInfo.isValid || validationError) return;

    const fromIso = toUtcIso(currentDurationInfo.startDt);
    const toIso = toUtcIso(currentDurationInfo.endDt);

    const emittedValue: DateTimeRangeValue = {
      from: fromIso,
      to: toIso,
      startDate: currentDurationInfo.startDt,
      endDate: currentDurationInfo.endDt,
      startTime,
      endTime,
    };

    onChange?.(emittedValue);
    setOpen(false);
  };

  // Reset
  const handleReset = () => {
    setInternalRange(undefined);
    setStartTime(defaultStartTime);
    setEndTime(defaultEndTime);
    onChange?.({
      from: null,
      to: null,
    });
  };

  // Label hiển thị trên nút trigger
  const displayLabel = useMemo(() => {
    if (controlledValue?.from && controlledValue?.to) {
      return formatRange(controlledValue.from, controlledValue.to);
    }
    if (internalRange?.from && internalRange?.to) {
      const startDt = combineDateAndTimeGmt7(internalRange.from, startTime);
      const endDt = combineDateAndTimeGmt7(internalRange.to, endTime);
      return formatRange(startDt, endDt);
    }
    return placeholder;
  }, [controlledValue, internalRange, startTime, endTime, placeholder]);

  const hasValue = Boolean(
    (controlledValue?.from && controlledValue?.to) || (internalRange?.from && internalRange?.to)
  );

  // Tạo disabled matchers cho DayPicker
  const disabledMatchers = useMemo(() => {
    const list: Array<Date | { before: Date } | { from: Date; to: Date }> = [
      { before: nowGmt7() },
      ...disabledDates,
    ];
    for (const slot of busySlots) {
      list.push({
        from: fromUtcIso(slot.from),
        to: fromUtcIso(slot.to),
      });
    }
    return list;
  }, [disabledDates, busySlots]);

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {name && (
        <>
          <input type="hidden" name={`${name}_from`} value={controlledValue?.from ?? ""} required={required} />
          <input type="hidden" name={`${name}_to`} value={controlledValue?.to ?? ""} required={required} />
        </>
      )}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            id={inputId}
            type="button"
            disabled={disabled}
            aria-describedby={ariaDescribedby}
            className={`group flex h-12 w-full items-center justify-between gap-3 border bg-surface px-4 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              isInvalid
                ? "border-danger text-danger focus:border-danger"
                : "border-line hover:border-line-strong focus:border-primary"
            } ${disabled ? "cursor-not-allowed bg-sunken/60 text-ink-3" : "cursor-pointer text-ink"}`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Calendar className="h-4 w-4 shrink-0 text-primary" />
              <span
                className={`truncate font-medium ${
                  hasValue ? "font-mono tabular-nums text-ink" : "text-ink-3"
                }`}
              >
                {displayLabel}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentDurationInfo && currentDurationInfo.isValid && (
                <span className="hidden sm:inline-flex items-center bg-primary-tint px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                  {currentDurationInfo.days > 0
                    ? `${currentDurationInfo.days} ngày ${currentDurationInfo.hours % 24 > 0 ? `${currentDurationInfo.hours % 24}h` : ""}`
                    : `${currentDurationInfo.hours} giờ`}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-ink-3 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className="z-50 w-full max-w-[95vw] sm:max-w-none border border-line bg-surface p-4 sm:p-6 shadow-e3 focus:outline-none glass-3 animate-in fade-in-0 zoom-in-95"
          >
            {/* 1. DayPicker Lịch ngày */}
            <div className="flex justify-center overflow-x-auto pb-4">
              <DayPicker
                mode="range"
                timeZone={GMT7_TIMEZONE}
                locale={vi}
                selected={internalRange}
                onSelect={setInternalRange}
                disabled={disabledMatchers}
                numberOfMonths={typeof window !== "undefined" && window.innerWidth >= 640 ? 2 : 1}
                classNames={{
                  root: "relative",
                  months: "flex flex-col sm:flex-row gap-6",
                  month: "space-y-4",
                  month_caption: "flex items-center justify-between font-bold text-ink px-2 py-1 text-sm",
                  caption_label: "font-bold text-ink",
                  nav: "flex items-center gap-1",
                  button_previous: "min-h-11 min-w-11 flex items-center justify-center hover:bg-sunken text-ink transition-colors",
                  button_next: "min-h-11 min-w-11 flex items-center justify-center hover:bg-sunken text-ink transition-colors",
                  weeks: "w-full border-collapse space-y-1",
                  weekdays: "flex",
                  weekday: "text-ink-3 text-xs font-semibold w-11 text-center py-1",
                  week: "flex w-full mt-1",
                  day: "p-0 relative text-center focus-within:relative focus-within:z-20",
                  day_button: "min-h-11 min-w-11 text-sm font-medium text-ink hover:bg-surface-raised flex items-center justify-center transition-colors cursor-pointer",
                  disabled: "opacity-30 cursor-not-allowed pointer-events-none line-through text-ink-3",
                  today: "font-bold text-primary border border-primary/40",
                  range_start: "bg-primary text-white font-bold",
                  range_end: "bg-primary text-white font-bold",
                  range_middle: "bg-primary-tint text-primary font-semibold rounded-none",
                  selected: "bg-primary text-white font-bold",
                  outside: "opacity-30",
                }}
              />
            </div>

            {/* 2. Bộ chọn giờ 30 phút */}
            <div className="mt-4 border-t border-line pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Giờ nhận xe (GMT+7)</span>
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    aria-label="Giờ nhận xe (GMT+7)"
                    className="w-full border border-line bg-surface px-3 py-2 font-mono text-sm tabular-nums text-ink transition-colors focus:border-primary focus:outline-none"
                  >
                    {timeSlots.map((slot) => (
                      <option key={`start-${slot}`} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Giờ trả xe (GMT+7)</span>
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    aria-label="Giờ trả xe (GMT+7)"
                    className="w-full border border-line bg-surface px-3 py-2 font-mono text-sm tabular-nums text-ink transition-colors focus:border-primary focus:outline-none"
                  >
                    {timeSlots.map((slot) => (
                      <option key={`end-${slot}`} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Cảnh báo lỗi & Tóm tắt thời lượng */}
            <div className="mt-4">
              {validationError ? (
                <div className="flex items-center gap-2 bg-warning-bg/60 p-2.5 text-xs font-medium text-warning border border-warning/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              ) : currentDurationInfo?.isValid ? (
                <div className="flex items-center justify-between text-xs font-medium text-ink-2 bg-canvas p-2.5 border border-line">
                  <span>Tổng thời gian dự kiến:</span>
                  <span className="font-mono tabular-nums font-bold text-primary">
                    {currentDurationInfo.days > 0 && `${currentDurationInfo.days} ngày `}
                    {currentDurationInfo.hours % 24 > 0 && `${currentDurationInfo.hours % 24} giờ`}
                    {currentDurationInfo.hours === 0 && "0 giờ"}
                    {` (${currentDurationInfo.hours}h)`}
                  </span>
                </div>
              ) : null}
            </div>

            {/* 4. Footer hành động */}
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-ink-3 hover:bg-sunken hover:text-ink transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Thiết lập lại</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={!currentDurationInfo?.isValid || Boolean(validationError)}
                className="flex items-center gap-1.5 bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Áp dụng thời gian</span>
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
