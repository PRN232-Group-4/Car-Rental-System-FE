"use client";

import { useMemo } from "react";
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
  className?: string;
}

export function PriceBreakdown({
  hourlyRate,
  monthlyRate,
  hours,
  rentalType,
  policy,
  className = "",
}: PriceBreakdownProps) {
  const calculation = useMemo(() => {
    // Cùng công thức với backend (`NpgsqlOperationsRepository.CreateRentalAsync`):
    //   hourly   : tiền thuê = đơn giá giờ × số giờ
    //   longterm : tiền thuê = đơn giá tháng × max(1, ceil(số giờ / 720))
    //   VAT      = tiền thuê × vat_rate%
    //   cọc      = tiền thuê × deposit_percentage%  (KHÔNG gồm VAT)
    // Hóa đơn = tiền thuê + VAT + cọc. Không có phụ phí tài xế trong bảng giá hiện hành.
    const billableHours = Math.max(0, hours);
    const months = Math.max(1, Math.ceil(billableHours / 720));
    const monthly = monthlyRate && monthlyRate > 0 ? monthlyRate : hourlyRate * 24 * 30;

    const baseRentalFee = Math.round(
      rentalType === "hourly" ? hourlyRate * billableHours : monthly * months
    );

    // Chưa có chính sách thì không tự bịa tỷ lệ VAT/cọc.
    const hasPolicy = Boolean(policy);
    const vatRate = policy?.vatRate ?? 0;
    const vatFee = hasPolicy ? Math.round(baseRentalFee * (vatRate / 100)) : 0;

    const depositRate = policy?.depositPercentage ?? 0;
    const depositAmount = hasPolicy ? Math.round(baseRentalFee * (depositRate / 100)) : 0;

    return {
      billableHours,
      months,
      baseRentalFee,
      hasPolicy,
      vatRate,
      vatFee,
      depositRate,
      depositAmount,
      totalEstimated: baseRentalFee + vatFee + depositAmount,
    };
  }, [hourlyRate, monthlyRate, hours, rentalType, policy]);

  return (
    <div
      data-testid="price-breakdown"
      className={`rounded border border-td-rule bg-td-paper p-4 text-xs space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-td-rule pb-2.5">
        <span className="font-bold text-td-ink text-sm">Dự toán chi phí minh bạch</span>
        <span className="rounded-md bg-primary-tint px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
          {rentalType === "hourly" ? "Thuê theo giờ" : "Thuê dài hạn"}
        </span>
      </div>

      {/* Danh sách các khoản tính */}
      <div className="space-y-2 text-td-ink">
        {/* Tiền thuê cơ sở */}
        <div className="flex items-center justify-between">
          <span className="text-td-muted">
            Tiền thuê xe ({calculation.billableHours}h × {formatVnd(hourlyRate)})
          </span>
          <span className="font-mono tabular-nums font-semibold text-td-ink">
            {formatVnd(calculation.baseRentalFee)}
          </span>
        </div>

        {/* Thuế VAT */}
        <div className="flex items-center justify-between">
          <span className="text-td-muted">
            Thuế VAT {calculation.hasPolicy ? `(${calculation.vatRate}%)` : "(theo chính sách)"}
          </span>
          <span className="font-mono tabular-nums font-semibold text-td-ink">
            {calculation.hasPolicy ? formatVnd(calculation.vatFee) : "—"}
          </span>
        </div>

        {/* Tiền thuê dịch vụ (A) */}
        <div className="flex items-center justify-between border-t border-td-rule/60 pt-2 font-bold text-td-ink">
          <span>Tiền thuê chuyến xe (A)</span>
          <span className="font-mono tabular-nums text-primary text-sm">
            {formatVnd(calculation.baseRentalFee + calculation.vatFee)}
          </span>
        </div>

        {/* Tiền đặt cọc (B) */}
        <div className="flex items-start justify-between border-t border-td-rule/60 pt-2">
          <div>
            <div className="flex items-center gap-1 font-semibold text-td-ink">
              <span>Tiền đặt cọc hoàn lại {calculation.hasPolicy ? `(${calculation.depositRate}%)` : "(theo chính sách)"}</span>
              <span className="text-[10px] text-success font-bold bg-success-bg px-1.5 py-0.2 rounded">
                Hoàn 100%
              </span>
            </div>
            <p className="text-[10px] text-td-muted mt-0.5">
              Tính trên tiền thuê (không gồm VAT), hoàn trả sau khi bàn giao và kiểm định xe
            </p>
          </div>
          <span className="font-mono tabular-nums font-bold text-td-ink">
            {calculation.hasPolicy ? formatVnd(calculation.depositAmount) : "—"}
          </span>
        </div>
      </div>

      {/* Tổng thanh toán ban đầu (A + B) */}
      <div className="flex items-center justify-between border-t border-td-rule pt-3 bg-td-white -mx-4 -mb-4 p-4 rounded-b-2xl">
        <div>
          <span className="font-bold text-td-ink text-sm">
            {calculation.hasPolicy ? "Tổng thanh toán dự kiến:" : "Tạm tính tiền thuê:"}
          </span>
          <p className="text-[10px] text-td-muted">
            {calculation.hasPolicy ? "Bao gồm cọc hoàn lại khi trả xe" : "Chưa gồm VAT và tiền cọc"}
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono tabular-nums text-lg font-black text-primary">
            {formatVnd(calculation.totalEstimated)}
          </span>
        </div>
      </div>

      {/* Cam kết minh bạch */}
      <div className="flex items-center gap-1.5 text-[11px] text-td-muted pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
        <span>
          {calculation.hasPolicy
            ? "Số tiền chính thức do máy chủ xác nhận trên đơn thuê và hóa đơn."
            : "Chưa tải được chính sách giá; số tiền chính thức do máy chủ xác nhận trên đơn thuê và hóa đơn."}
        </span>
      </div>
    </div>
  );
}
