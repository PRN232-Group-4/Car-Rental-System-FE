"use client";

import React, { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { RentalPolicy } from "../types";
import { formatVnd } from "@/lib/format";

export interface PriceBreakdownProps {
  hourlyRate: number;
  monthlyRate?: number;
  hours: number;
  days: number;
  hasDriver: boolean;
  rentalType: "hourly" | "longterm";
  policy?: RentalPolicy | null;
  driverFeePerDay?: number;
  className?: string;
}

export function PriceBreakdown({
  hourlyRate,
  monthlyRate,
  hours,
  days,
  hasDriver,
  rentalType,
  policy,
  driverFeePerDay = 500000,
  className = "",
}: PriceBreakdownProps) {
  const calculation = useMemo(() => {
    // 1. Tiền thuê cơ sở
    const safeHours = Math.max(1, hours);
    const safeDays = Math.max(1, days);

    const baseRentalFee =
      rentalType === "hourly"
        ? Math.round(hourlyRate * safeHours)
        : Math.round(
            (monthlyRate && monthlyRate > 0 ? monthlyRate : hourlyRate * 24 * 30 * 0.75) *
              (safeDays / 30)
          );

    // 2. Phụ phí tài xế
    const driverDays = Math.max(1, Math.ceil(safeHours / 24));
    const driverFee = hasDriver ? driverFeePerDay * driverDays : 0;

    // 3. Thuế VAT
    const vatRate = policy?.vatRate ?? 8;
    const vatFee = Math.round((baseRentalFee + driverFee) * (vatRate / 100));

    // 4. Tiền thuê dịch vụ (A)
    const rentalSubtotal = baseRentalFee + driverFee + vatFee;

    // 5. Tiền đặt cọc hoàn lại (B)
    const depositRate = policy?.depositPercentage ?? 30;
    const depositAmount = Math.round(rentalSubtotal * (depositRate / 100));

    // 6. Tổng dự toán tạm tính ban đầu (A + B)
    const totalEstimated = rentalSubtotal + depositAmount;

    return {
      safeHours,
      safeDays,
      baseRentalFee,
      driverDays,
      driverFee,
      vatRate,
      vatFee,
      rentalSubtotal,
      depositRate,
      depositAmount,
      totalEstimated,
    };
  }, [hourlyRate, monthlyRate, hours, days, hasDriver, rentalType, policy, driverFeePerDay]);

  return (
    <div
      data-testid="price-breakdown"
      className={`rounded-2xl border border-line bg-canvas p-4 text-xs space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <span className="font-bold text-ink text-sm">Dự toán chi phí minh bạch</span>
        <span className="rounded-md bg-primary-tint px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
          {rentalType === "hourly" ? "Thuê theo giờ" : "Thuê dài hạn"}
        </span>
      </div>

      {/* Danh sách các khoản tính */}
      <div className="space-y-2 text-ink-2">
        {/* Tiền thuê cơ sở */}
        <div className="flex items-center justify-between">
          <span className="text-ink-3">
            Tiền thuê xe ({calculation.safeHours}h × {formatVnd(hourlyRate)})
          </span>
          <span className="font-mono tabular-nums font-semibold text-ink">
            {formatVnd(calculation.baseRentalFee)}
          </span>
        </div>

        {/* Phụ phí tài xế nếu có */}
        {hasDriver && (
          <div className="flex items-center justify-between">
            <span className="text-ink-3">
              Tài xế riêng ({calculation.driverDays} ngày × {formatVnd(driverFeePerDay)})
            </span>
            <span className="font-mono tabular-nums font-semibold text-ink">
              {formatVnd(calculation.driverFee)}
            </span>
          </div>
        )}

        {/* Thuế VAT */}
        <div className="flex items-center justify-between">
          <span className="text-ink-3">Thuế VAT ({calculation.vatRate}%)</span>
          <span className="font-mono tabular-nums font-semibold text-ink">
            {formatVnd(calculation.vatFee)}
          </span>
        </div>

        {/* Tổng tiền thuê dịch vụ (A) */}
        <div className="flex items-center justify-between border-t border-line/60 pt-2 font-bold text-ink">
          <span>Tiền thuê chuyến xe (A)</span>
          <span className="font-mono tabular-nums text-primary text-sm">
            {formatVnd(calculation.rentalSubtotal)}
          </span>
        </div>

        {/* Tiền đặt cọc (B) */}
        <div className="flex items-start justify-between border-t border-line/60 pt-2">
          <div>
            <div className="flex items-center gap-1 font-semibold text-ink">
              <span>Tiền đặt cọc hoàn lại ({calculation.depositRate}%)</span>
              <span className="text-[10px] text-success font-bold bg-success-bg px-1.5 py-0.2 rounded">
                Hoàn 100%
              </span>
            </div>
            <p className="text-[10px] text-ink-3 mt-0.5">
              Hoàn trả vào tài khoản trong 24h sau bàn giao
            </p>
          </div>
          <span className="font-mono tabular-nums font-bold text-ink">
            {formatVnd(calculation.depositAmount)}
          </span>
        </div>
      </div>

      {/* Tổng thanh toán ban đầu (A + B) */}
      <div className="flex items-center justify-between border-t border-line pt-3 bg-surface -mx-4 -mb-4 p-4 rounded-b-2xl">
        <div>
          <span className="font-bold text-ink text-sm">Tổng thanh toán dự kiến:</span>
          <p className="text-[10px] text-ink-3">Bao gồm cọc hoàn lại khi trả xe</p>
        </div>
        <div className="text-right">
          <span className="font-mono tabular-nums text-lg font-black text-primary">
            {formatVnd(calculation.totalEstimated)}
          </span>
        </div>
      </div>

      {/* Cam kết minh bạch */}
      <div className="flex items-center gap-1.5 text-[11px] text-ink-3 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
        <span>Đã bao gồm VAT và bảo hiểm trách nhiệm dân sự bắt buộc.</span>
      </div>
    </div>
  );
}
