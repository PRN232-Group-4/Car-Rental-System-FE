"use client";

import { ShieldCheck } from "lucide-react";
import type { RentalPolicy, VehicleCategory } from "../types";

export interface RentalPolicyPanelProps {
  policy?: RentalPolicy | null;
  isElectric?: boolean;
  category?: VehicleCategory;
  className?: string;
}

/**
 * Chính sách thuê xe hiển thị đúng các tỷ lệ mà backend áp dụng:
 * cọc tính trên tiền thuê (không gồm VAT) theo `NpgsqlOperationsRepository.CreateRentalAsync`,
 * phụ phí trả trễ là tỷ lệ cộng thêm vào đơn giá giờ theo `OvertimeCalculator`
 * (miễn 15 phút đầu; phần phụ phí trừ vào cọc trước, thiếu hụt thành hóa đơn bổ sung).
 * Không chính sách thì không tự suy diễn tỷ lệ nào.
 */
export function RentalPolicyPanel({ policy, className = "" }: RentalPolicyPanelProps) {
  return (
    <div className={`space-y-4 rounded border border-td-rule bg-td-white p-5 ${className}`}>
      <h3 className="flex items-center gap-2 text-base font-bold text-td-ink"><ShieldCheck className="h-5 w-5 text-primary" />Chính sách thuê xe</h3>
      {policy ? <dl className="space-y-3 text-xs text-td-ink">
        <div><dt className="text-td-muted">Thuế VAT</dt><dd>{policy.vatRate}%</dd></div>
        <div><dt className="text-td-muted">Tiền đặt cọc</dt><dd>{policy.depositPercentage}% tiền thuê (không gồm VAT)</dd></div>
        <div><dt className="text-td-muted">Phụ phí trả trễ</dt><dd>{policy.overtimeFeeRate}% cộng vào đơn giá mỗi giờ quá hạn</dd></div>
        <div><dt className="text-td-muted">Cách tính phụ phí</dt><dd>Làm tròn lên theo giờ, miễn 15 phút đầu; trừ vào tiền đặt cọc trước, phần vượt quá cọc thành hóa đơn bổ sung có hạn thanh toán.</dd></div>
      </dl> : <p role="status" className="text-xs text-td-muted">Chưa có chính sách thuê áp dụng cho xe này.</p>}
      <p className="text-xs text-td-muted">Điều kiện bàn giao và quyết toán được ghi trong đơn thuê và biên bản kiểm tra xe.</p>
    </div>
  );
}
