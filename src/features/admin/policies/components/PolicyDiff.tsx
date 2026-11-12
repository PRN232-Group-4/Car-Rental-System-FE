"use client";

import { ArrowRight, AlertCircle, Info } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { calculateSampleQuote, SAMPLE_BASE_RENTAL } from "../pricing-calculator";
import type { RentalPolicy, PolicyFormValues } from "../types";

interface PolicyDiffProps {
  currentPolicy: RentalPolicy | null;
  newValues: Partial<PolicyFormValues>;
  vehicleTypeName?: string;
}

export function PolicyDiff({
  currentPolicy,
  newValues,
  vehicleTypeName,
}: PolicyDiffProps) {
  const newVat = typeof newValues.vatRate === "number" ? newValues.vatRate : (currentPolicy?.vatRate ?? 10);
  const newOvertime = typeof newValues.overtimeFeeRate === "number" ? newValues.overtimeFeeRate : (currentPolicy?.overtimeFeeRate ?? 15);
  const newDeposit = typeof newValues.depositPercentage === "number" ? newValues.depositPercentage : (currentPolicy?.depositPercentage ?? 10);

  const currentQuote = currentPolicy
    ? calculateSampleQuote(currentPolicy.vatRate, currentPolicy.depositPercentage)
    : null;
  const newQuote = calculateSampleQuote(newVat, newDeposit);

  const renderMetricDiff = (
    label: string,
    currentVal: number | null,
    newVal: number,
    unit = "%"
  ) => {
    const isUnchanged = currentVal === newVal;
    const isIncrease = currentVal !== null && newVal > currentVal;

    let diffText = "Chưa có chính sách trước đó";
    if (currentVal !== null) {
      if (isUnchanged) {
        diffText = `Giữ nguyên (${newVal}${unit})`;
      } else if (isIncrease) {
        diffText = `Tăng từ ${currentVal}${unit} lên ${newVal}${unit}`;
      } else {
        diffText = `Giảm từ ${currentVal}${unit} xuống ${newVal}${unit}`;
      }
    }

    return (
      <div className="flex items-center justify-between py-2 border-b border-td-rule last:border-b-0 text-sm">
        <span className="text-td-ink font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {currentVal !== null ? (
            <>
              <span className="font-mono text-td-muted line-through">{currentVal}{unit}</span>
              <ArrowRight className="w-3.5 h-3.5 text-td-muted" aria-hidden="true" />
              <span className={`font-mono font-bold ${isUnchanged ? "text-td-ink" : isIncrease ? "text-td-oxide" : "text-success"}`}>
                {newVal}{unit}
              </span>
            </>
          ) : (
            <span className="font-mono font-bold text-td-ink">{newVal}{unit}</span>
          )}
          <span className="sr-only">({diffText})</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Khối so sánh thông số */}
      <div className="bg-td-white border border-td-rule rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-td-muted">
            Bảng so sánh điều khoản {vehicleTypeName ? `· ${vehicleTypeName}` : ""}
          </h4>
          {currentPolicy && (
            <span className="text-xs text-td-muted">
              Bản hiện tại: #{currentPolicy.id}
            </span>
          )}
        </div>

        <div className="space-y-0.5">
          {renderMetricDiff("Thuế VAT", currentPolicy?.vatRate ?? null, newVat)}
          {renderMetricDiff("Tỷ lệ đặt cọc", currentPolicy?.depositPercentage ?? null, newDeposit)}
          {renderMetricDiff("Phí trả trễ", currentPolicy?.overtimeFeeRate ?? null, newOvertime)}
        </div>
      </div>

      {/* Khối ví dụ minh họa theo DESIGN.md §23 */}
      <div className="bg-td-chalk border border-td-rule rounded p-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-td-ink mb-2">
          <Info className="w-4 h-4 text-td-oxide shrink-0" aria-hidden="true" />
          <span>Mô phỏng tính giá trên đơn mẫu (30 giờ × 90.000đ)</span>
        </div>
        <p className="text-td-muted mb-3 leading-relaxed">
          Công thức chuẩn DESIGN.md §23: Tiền thuê mẫu {formatVnd(SAMPLE_BASE_RENTAL)} cộng VAT ({newVat}%) và Tiền cọc ({newDeposit}% trên tổng có VAT).
        </p>

        <div className="space-y-1.5 font-mono">
          <div className="flex justify-between text-td-ink">
            <span>Tiền thuê (30 giờ)</span>
            <span>{formatVnd(newQuote.baseRental)}</span>
          </div>
          <div className="flex justify-between text-td-ink">
            <span>VAT ({newQuote.vatRate}%)</span>
            <span>+{formatVnd(newQuote.vatAmount)}</span>
          </div>
          <div className="flex justify-between text-td-ink">
            <span>Đặt cọc ({newQuote.depositRate}%)</span>
            <span>+{formatVnd(newQuote.depositAmount)}</span>
          </div>
          <div className="border-t border-td-rule pt-1.5 flex justify-between font-bold text-td-ink text-sm">
            <span>Tổng ước tính tạm thu</span>
            <span className="text-td-oxide">{formatVnd(newQuote.totalEstimated)}</span>
          </div>
          {currentQuote && currentQuote.totalEstimated !== newQuote.totalEstimated && (
            <div className="text-[11px] text-td-muted pt-1 text-right">
              Chênh lệch so với bản cũ: {newQuote.totalEstimated > currentQuote.totalEstimated ? "+" : ""}
              {formatVnd(newQuote.totalEstimated - currentQuote.totalEstimated)}
            </div>
          )}
        </div>
      </div>

      {/* Chú thích tác động hợp đồng */}
      <div className="flex items-start gap-2 text-xs text-td-ink bg-warning-bg/40 border border-warning/20 rounded p-3">
        <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="text-td-ink font-semibold">Quy tắc bất biến:</strong> Chính sách mới chỉ áp dụng cho các đơn thuê tạo từ thời điểm này trở đi. Tất cả các đơn đã tạo trước đó giữ nguyên vẹn snapshot giá và điều khoản trong hợp đồng.
        </p>
      </div>
    </div>
  );
}
