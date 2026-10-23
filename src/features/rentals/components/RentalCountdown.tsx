"use client";

import { useEffect, useRef, useState } from "react";
import { AlarmClock, TimerOff } from "lucide-react";

const pad = (value: number) => String(Math.max(0, Math.floor(value))).padStart(2, "0");

/** Phần dư còn lại tới `expireAt`, đã làm tròn xuống theo giây. */
export function remainingUntil(expireAt: string, now: number = Date.now()): number {
  const deadline = new Date(expireAt).getTime();
  if (!Number.isFinite(deadline)) return 0;
  return Math.max(0, deadline - now);
}

export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export interface RentalCountdownProps {
  /** Mốc hết hạn `expireAt` từ BE (UTC ISO). */
  expireAt: string;
  /** Gọi một lần khi đồng hồ về 0, dùng để tải lại trạng thái đơn. */
  onExpire?: () => void;
  className?: string;
}

/**
 * FR-042: đồng hồ đếm ngược thời gian còn lại để yêu cầu được duyệt và thanh toán.
 * Đồng hồ không quyết định trạng thái nghiệp vụ — trạng thái luôn lấy từ máy chủ;
 * khi về 0 component chỉ thông báo và đề nghị tải lại.
 */
export default function RentalCountdown({ expireAt, onExpire, className = "" }: RentalCountdownProps) {
  const [remaining, setRemaining] = useState(() => remainingUntil(expireAt));
  const notified = useRef(false);

  useEffect(() => {
    notified.current = false;
    const tick = () => setRemaining(remainingUntil(expireAt));
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [expireAt]);

  useEffect(() => {
    if (remaining > 0 || notified.current) return;
    notified.current = true;
    onExpire?.();
  }, [remaining, onExpire]);

  if (remaining <= 0) {
    return (
      <p role="status" className={`flex items-start gap-2 text-sm font-semibold text-danger ${className}`}>
        <TimerOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Đã quá thời hạn duyệt và thanh toán. Hệ thống đang cập nhật trạng thái đơn.</span>
      </p>
    );
  }

  return (
    <p role="timer" aria-live="off" className={`flex items-start gap-2 text-sm font-semibold text-td-ink ${className}`}>
      <AlarmClock className="mt-0.5 h-4 w-4 shrink-0 text-td-oxide" aria-hidden="true" />
      <span>
        Còn <strong className="font-mono tabular-nums">{formatCountdown(remaining)}</strong> để đơn được duyệt và thanh toán.
      </span>
    </p>
  );
}
