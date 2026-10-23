"use client";

import { ShieldCheck } from "lucide-react";
import type { RentalPolicy, VehicleCategory } from "../types";

export interface RentalPolicyPanelProps {
  policy?: RentalPolicy | null;
  isElectric?: boolean;
  category?: VehicleCategory;
  className?: string;
}

export function RentalPolicyPanel({ policy, className = "" }: RentalPolicyPanelProps) {
  return (
    <div className={`space-y-4 rounded border border-td-rule bg-td-white p-5 ${className}`}>
      <h3 className="flex items-center gap-2 text-base font-bold text-td-ink"><ShieldCheck className="h-5 w-5 text-primary" />Chính sách thuê xe</h3>
      {policy ? <dl className="space-y-3 text-xs text-td-ink">
        <div><dt className="text-td-muted">Thuế VAT</dt><dd>{policy.vatRate}%</dd></div>
        <div><dt className="text-td-muted">Tiền đặt cọc</dt><dd>{policy.depositPercentage}% tổng tiền thuê có VAT</dd></div>
        <div><dt className="text-td-muted">Phụ phí trả trễ</dt><dd>{policy.overtimeFeeRate}% cộng vào đơn giá mỗi giờ quá hạn</dd></div>
      </dl> : <p role="status" className="text-xs text-td-muted">Chưa có chính sách thuê áp dụng cho xe này.</p>}
      <p className="text-xs text-td-muted">Điều kiện bàn giao và quyết toán được ghi trong đơn thuê và biên bản kiểm tra xe.</p>
    </div>
  );
}
