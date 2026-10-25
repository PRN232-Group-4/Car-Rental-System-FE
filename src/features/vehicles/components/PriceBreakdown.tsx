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
  /** Phí tài xế mỗi ngày khi có nguồn dữ liệu; bỏ trống nghĩa là không cộng phụ phí tài xế. */
  driverFeePerDay?: number;
  className?: string;
}

/**
 * Dự toán chi phí khớp công thức backend (`NpgsqlOperationsRepository.CreateRentalAsync`):
 *   hourly   : tiền thuê = đơn giá giờ × số giờ
 *   longterm : tiền thuê = đơn giá tháng × max(1, ceil(số giờ / 720))
 *   VAT      = (tiền thuê + phí tài xế) × vat_rate%
 *   cọc      = (tiền thuê + phí tài xế) × deposit_percentage% — **không** gồm VAT
 *   hóa đơn  = tiền thuê + phí tài xế + VAT + cọc
 * Ví dụ đối chiếu: 100.000/giờ × 2 giờ, VAT 10%, cọc 20% ⇒ thuê 200.000 · VAT 20.000 · cọc 40.000 · tổng 260.000
 * (xem `docs/rental-deposit-penalty-audit.md`). Không hiển thị dự toán khi thiếu chính sách hoặc thiếu đơn giá
 * tháng cho thuê dài hạn. Hình thức thuê kèm tài xế **không** làm mất dự toán: bảng giá hiện hành chỉ tính
 * tiền thuê theo đơn giá, nên chỉ cộng dòng phụ phí tài xế khi có nguồn dữ liệu phí thật.
 */
export function PriceBreakdown({
  hourlyRate,
  monthlyRate,
  hours,
  rentalType,
  hasDriver,
  policy,
  driverFeePerDay,
  className = "",
}: PriceBreakdownProps) {
  const calculation = useMemo(() => {
    // Thiếu chính sách thì không tự bịa tỷ lệ VAT/cọc.
    if (!policy) return null;

    const billableHours = Math.max(0, hours);
    const months = Math.max(1, Math.ceil(billableHours / 720));
    const monthly = monthlyRate && monthlyRate > 0 ? monthlyRate : hourlyRate * 24 * 30;
    if (rentalType === "hourly" && !(hourlyRate > 0)) return null;
    if (rentalType === "longterm" && !(monthlyRate && monthlyRate > 0)) return null;

    const baseRentalFee = Math.round(
      rentalType === "hourly" ? hourlyRate * billableHours : monthly * months
    );

    const driverDays = Math.max(1, Math.ceil(billableHours / 24));
    const driverFee = hasDriver ? Math.round((driverFeePerDay ?? 0) * driverDays) : 0;

    const vatRate = policy.vatRate;
    const vatFee = Math.round((baseRentalFee + driverFee) * (vatRate / 100));

    const depositRate = policy.depositPercentage;
    const depositAmount = Math.round((baseRentalFee + driverFee) * (depositRate / 100));

    return {
      billableHours,
      months,
      monthly,
      baseRentalFee,
      driverDays,
      driverFee,
      vatRate,
      vatFee,
      depositRate,
      depositAmount,
      totalEstimated: baseRentalFee + driverFee + vatFee + depositAmount,
    };
  }, [hourlyRate, monthlyRate, hours, rentalType, hasDriver, policy, driverFeePerDay]);

  if (!calculation) {
    return <p role="status" data-testid="price-breakdown" className={`rounded border border-td-rule bg-td-paper p-4 text-xs text-td-muted ${className}`}>Chưa đủ bảng giá hoặc chính sách để dự toán chi phí. Vui lòng xem báo giá khi đặt xe.</p>;
  }

  const rentLabel =
    rentalType === "hourly"
      ? `Tiền thuê xe (${calculation.billableHours.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}h × ${formatVnd(hourlyRate)})`
      : `Tiền thuê xe (${calculation.months} tháng × ${formatVnd(calculation.monthly)})`;

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
          <span className="text-td-muted">{rentLabel}</span>
          <span className="font-mono tabular-nums font-semibold text-td-ink">
            {formatVnd(calculation.baseRentalFee)}
          </span>
        </div>

        {/* Phụ phí tài xế khi có dữ liệu */}
        {calculation.driverFee > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-td-muted">
              Tài xế riêng ({calculation.driverDays} ngày × {formatVnd(driverFeePerDay ?? 0)})
            </span>
            <span className="font-mono tabular-nums font-semibold text-td-ink">
              {formatVnd(calculation.driverFee)}
            </span>
          </div>
        )}

        {/* Thuế VAT */}
        <div className="flex items-center justify-between">
          <span className="text-td-muted">Thuế VAT ({calculation.vatRate}%)</span>
          <span className="font-mono tabular-nums font-semibold text-td-ink">
            {formatVnd(calculation.vatFee)}
          </span>
        </div>

        {/* Tiền thuê dịch vụ (A) */}
        <div className="flex items-center justify-between border-t border-td-rule/60 pt-2 font-bold text-td-ink">
          <span>Tiền thuê chuyến xe (A)</span>
          <span className="font-mono tabular-nums text-primary text-sm">
            {formatVnd(calculation.baseRentalFee + calculation.driverFee + calculation.vatFee)}
          </span>
        </div>

        {/* Tiền đặt cọc (B) */}
        <div className="flex items-start justify-between border-t border-td-rule/60 pt-2">
          <div>
            <div className="flex items-center gap-1 font-semibold text-td-ink">
              <span>Tiền đặt cọc hoàn lại ({calculation.depositRate}%)</span>
              <span className="text-[10px] text-success font-bold bg-success-bg px-1.5 py-0.2 rounded">
                Theo quyết toán
              </span>
            </div>
            <p className="text-[10px] text-td-muted mt-0.5">
              Tính trên tiền thuê (không gồm VAT); hoàn cọc theo kết quả kiểm tra và quyết toán khi trả xe
            </p>
          </div>
          <span className="font-mono tabular-nums font-bold text-td-ink">
            {formatVnd(calculation.depositAmount)}
          </span>
        </div>
      </div>

      {/* Tổng thanh toán ban đầu (A + B) */}
      <div className="flex items-center justify-between border-t border-td-rule pt-3 bg-td-white -mx-4 -mb-4 p-4 rounded-b-2xl">
        <div>
          <span className="font-bold text-td-ink text-sm">Tổng thanh toán dự kiến:</span>
          <p className="text-[10px] text-td-muted">Bao gồm cọc hoàn lại khi trả xe</p>
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
        <span>Dự toán theo bảng giá và chính sách hiện hành; số tiền chính thức do máy chủ xác nhận trên đơn thuê và hóa đơn.</span>
      </div>
    </div>
  );
}
