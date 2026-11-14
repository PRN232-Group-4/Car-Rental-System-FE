"use client";

import type { ReactNode } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatVnd } from "@/lib/format";
import { formatDateTime } from "@/lib/time";
import { calculateSampleQuote, SAMPLE_BASE_RENTAL } from "../pricing-calculator";
import type { RentalPolicy } from "../types";

interface PolicyDetailDrawerProps {
  policy: RentalPolicy | null;
  onClose: () => void;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-td-rule py-2.5 text-sm last:border-b-0">
      <dt className="text-td-muted">{label}</dt>
      <dd className="text-right font-medium text-td-ink">{children}</dd>
    </div>
  );
}

export function PolicyDetailDrawer({ policy, onClose }: PolicyDetailDrawerProps) {
  const quote = policy ? calculateSampleQuote(policy.vatRate, policy.depositPercentage) : null;

  return (
    <Drawer
      open={policy !== null}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      side="right"
      title={policy ? policy.name : "Chi tiết chính sách"}
      description={policy ? `Mã bản #${policy.id}. Chính sách bất biến theo phiên bản, các đơn thuê đã tạo giữ nguyên điều khoản.` : undefined}
    >
      {policy && quote && (
        <div className="space-y-6">
          <dl className="border-y border-td-rule">
            <Row label="Loại xe áp dụng">{policy.vehicleTypeName || `Loại xe #${policy.vehicleTypeId}`}</Row>
            <Row label="Trạng thái">
              <AdminStatusBadge domain="activity" status={policy.isActive ? "active" : "inactive"}>
                {policy.isActive ? "Đang áp dụng" : "Đã ngừng"}
              </AdminStatusBadge>
            </Row>
            <Row label="Thuế VAT"><span className="font-mono">{policy.vatRate}%</span></Row>
            <Row label="Đặt cọc"><span className="font-mono">{policy.depositPercentage}%</span></Row>
            <Row label="Phí trả trễ"><span className="font-mono">{policy.overtimeFeeRate}% / giờ</span></Row>
            <Row label="Số đơn thuê đã dùng bản này"><span className="font-mono">{policy.rentalCount ?? 0}</span></Row>
            <Row label="Thời gian tạo (GMT+7)">
              <span className="font-mono text-xs">{policy.createdAt ? formatDateTime(policy.createdAt) : "—"}</span>
            </Row>
            <Row label="Người lập">{policy.managedBy || "Hệ thống"}</Row>
          </dl>

          <div className="border border-td-rule bg-td-chalk p-4 text-xs">
            <h4 className="mb-2 font-bold text-td-ink">Mô phỏng tính giá trên đơn mẫu (30 giờ × 90.000đ)</h4>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-td-ink">
                <span>Tiền thuê (30 giờ)</span>
                <span>{formatVnd(SAMPLE_BASE_RENTAL)}</span>
              </div>
              <div className="flex justify-between text-td-ink">
                <span>VAT ({quote.vatRate}%)</span>
                <span>+{formatVnd(quote.vatAmount)}</span>
              </div>
              <div className="flex justify-between text-td-ink">
                <span>Đặt cọc ({quote.depositRate}%)</span>
                <span>+{formatVnd(quote.depositAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-td-rule pt-1.5 text-sm font-bold text-td-ink">
                <span>Tổng ước tính tạm thu</span>
                <span className="text-td-oxide">{formatVnd(quote.totalEstimated)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
