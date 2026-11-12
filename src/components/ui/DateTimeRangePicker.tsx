"use client";

import React, { useState, useId, useMemo } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { vi } from "date-fns/locale";
import { Calendar, ChevronDown, AlertCircle, RotateCcw, ArrowRight } from "lucide-react";
import { Modal } from "./Modal";
import { Select } from "./Select";
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

/** "2 ngày 3 giờ" / "5 giờ" for a whole-hour span. */
function durationText(hours: number): string {
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  if (days === 0) return `${hours} giờ`;
  return rest > 0 ? `${days} ngày ${rest} giờ` : `${days} ngày`;
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

      <button
        id={inputId}
        type="button"
        disabled={disabled}
        aria-describedby={ariaDescribedby}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
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
              {durationText(currentDurationInfo.hours)}
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-ink-3" />
        </div>
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Thời gian thuê"
        size="xl"
        footer={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-sm">
              {currentDurationInfo ? (
                <>
                  <p className="font-mono font-bold tabular-nums text-ink">
                    {formatRange(currentDurationInfo.startDt, currentDurationInfo.endDt)}
                  </p>
                  {validationError ? (
                    <p role="alert" className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-danger">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {validationError}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-ink-3">
                      Thời gian thuê: <span className="font-semibold text-primary">{durationText(currentDurationInfo.hours)}</span>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-ink-3">Chọn ngày nhận và ngày trả trên lịch.</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-ink-3 hover:bg-sunken hover:text-ink transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Thiết lập lại</span>
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!currentDurationInfo?.isValid || Boolean(validationError)}
                className="bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        }
      >
        {/* Two-month calendar. react-day-picker renders nav as a sibling of the months, so it is laid over the caption row. */}
        <div className="flex justify-center border border-line p-3 sm:p-4">
          <DayPicker
            mode="range"
            timeZone={GMT7_TIMEZONE}
            locale={vi}
            selected={internalRange}
            onSelect={setInternalRange}
            disabled={disabledMatchers}
            numberOfMonths={typeof window !== "undefined" && window.innerWidth >= 768 ? 2 : 1}
            classNames={{
              root: "relative",
              months: "flex flex-col md:flex-row gap-8",
              month: "space-y-2",
              month_caption: "flex h-11 items-center justify-center text-sm font-bold text-ink",
              caption_label: "font-bold text-ink",
              nav: "pointer-events-none absolute inset-x-0 top-0 z-10 flex h-11 items-center justify-between",
              button_previous: "pointer-events-auto flex h-11 w-11 items-center justify-center text-ink hover:bg-sunken disabled:opacity-30 transition-colors cursor-pointer",
              button_next: "pointer-events-auto flex h-11 w-11 items-center justify-center text-ink hover:bg-sunken disabled:opacity-30 transition-colors cursor-pointer",
              month_grid: "border-collapse",
              weekdays: "flex",
              weekday: "w-10 sm:w-11 py-1 text-center text-xs font-semibold text-ink-3",
              week: "mt-1 flex w-full",
              day: "relative p-0 text-center focus-within:relative focus-within:z-20",
              day_button: "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center text-sm font-medium text-ink hover:bg-surface-raised transition-colors cursor-pointer",
              disabled: "pointer-events-none cursor-not-allowed text-ink-3 opacity-30",
              today: "font-bold text-primary underline underline-offset-4",
              range_start: "bg-primary text-white font-bold",
              range_end: "bg-primary text-white font-bold",
              range_middle: "bg-primary-tint text-primary font-semibold",
              selected: "bg-primary text-white font-bold",
              outside: "opacity-30",
            }}
          />
        </div>

        {/* Pickup and return time, GMT+7 */}
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="block border border-line px-3 py-2">
            <span className="block text-xs text-ink-3">Giờ nhận xe (GMT+7)</span>
            <Select
              aria-label="Giờ nhận xe (GMT+7)"
              menuLabel="Giờ nhận xe (GMT+7)"
              value={startTime}
              onValueChange={setStartTime}
              options={timeSlots.map((slot) => ({ value: slot, label: slot }))}
              className="mt-0.5 h-8 border-0 bg-transparent px-0 font-mono text-base font-semibold tabular-nums"
              contentClassName="min-w-40"
            />
          </div>
          <ArrowRight className="h-4 w-4 text-ink-3" aria-hidden="true" />
          <div className="block border border-line px-3 py-2">
            <span className="block text-xs text-ink-3">Giờ trả xe (GMT+7)</span>
            <Select
              aria-label="Giờ trả xe (GMT+7)"
              menuLabel="Giờ trả xe (GMT+7)"
              value={endTime}
              onValueChange={setEndTime}
              options={timeSlots.map((slot) => ({ value: slot, label: slot }))}
              className="mt-0.5 h-8 border-0 bg-transparent px-0 font-mono text-base font-semibold tabular-nums"
              contentClassName="min-w-40"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
