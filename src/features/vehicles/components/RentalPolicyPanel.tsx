"use client";

import React from "react";
import { ShieldCheck, BatteryCharging, Fuel, XCircle, Clock } from "lucide-react";
import { RentalPolicy, VehicleCategory } from "../types";

export interface RentalPolicyPanelProps {
  policy?: RentalPolicy | null;
  isElectric?: boolean;
  category?: VehicleCategory;
  className?: string;
}

/**
 * Khối chính sách thuê xe trên trang chi tiết phương tiện.
 * Mọi con số ở đây phải khớp với quy tắc mà backend thực sự áp dụng:
 * - cọc = % tiền thuê (chưa gồm VAT), hoàn cọc qua yêu cầu hoàn tiền có duyệt (FR-021);
 * - hủy trước 24h miễn phí, hủy muộn tính 20% tiền thuê đã gồm VAT (RentalCancellationOptions);
 * - quá giờ tính theo giờ làm tròn lên, cộng thêm `overtime_fee_rate`%, trừ vào cọc trước (FR-012/FR-021).
 * Khi chưa tải được chính sách thì không suy diễn tỷ lệ nào.
 */
export function RentalPolicyPanel({
  policy,
  isElectric = false,
  className = "",
}: RentalPolicyPanelProps) {
  const depositText = policy ? `${policy.depositPercentage}%` : "theo chính sách của loại xe";
  const overtimeText = policy ? `đơn giá giờ cộng thêm ${policy.overtimeFeeRate}%` : "theo chính sách của loại xe";
  const vatText = policy ? `${policy.vatRate}%` : "theo chính sách của loại xe";

  return (
    <div className={`space-y-4 rounded border border-td-rule bg-td-white p-5 ${className}`}>
      <div className="flex items-center gap-2 border-b border-td-rule pb-3">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-base font-bold text-td-ink">Chính sách thuê xe & Bảo hiểm</h3>
          <p className="text-xs text-td-muted">
            Minh bạch 100% điều khoản, cam kết không phụ phí ẩn ngoài hợp đồng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Tiền đặt cọc & Hoàn cọc */}
        <div className="rounded border border-td-rule bg-td-paper p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-td-ink">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-tint font-mono text-[11px] text-primary">
              1
            </span>
            <span>Tiền đặt cọc & Hoàn cọc</span>
          </div>
          <p className="text-xs text-td-ink leading-relaxed">
            Mức đặt cọc áp dụng là{" "}
            <strong className="font-mono text-primary font-bold">{depositText}</strong> tiền thuê (không gồm VAT).
            Hóa đơn còn cộng <strong className="font-mono">{vatText}</strong> thuế GTGT.
          </p>
          <p className="text-[11px] text-td-muted leading-relaxed">
            Cọc được giữ trong suốt chuyến đi. Sau khi trả xe và có biên bản kiểm định, hệ thống tạo yêu cầu hoàn cọc
            và bộ phận vận hành duyệt đúng số tiền còn lại của cọc.
          </p>
        </div>

        {/* 2. Chính sách Năng lượng & Nhiên liệu */}
        <div className="rounded border border-td-rule bg-td-paper p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-td-ink">
            {isElectric ? (
              <BatteryCharging className="w-4 h-4 text-primary" />
            ) : (
              <Fuel className="w-4 h-4 text-primary" />
            )}
            <span>{isElectric ? "Chính sách pin & sạc xe điện" : "Chính sách xăng xe"}</span>
          </div>
          {isElectric ? (
            <p className="text-xs text-td-ink leading-relaxed">
              Nhận xe với mức pin tối thiểu <strong>80%</strong>, hoàn trả tối thiểu <strong>30%</strong>. Miễn phí sạc tại toàn bộ trạm chi nhánh Thong Dong.
            </p>
          ) : (
            <p className="text-xs text-td-ink leading-relaxed">
              Nhận sao trả vậy: Khách hàng hoàn trả lượng xăng tương đương vạch xăng lúc nhận xe bàn giao.
            </p>
          )}
          <p className="text-[11px] text-td-muted">
            Mức pin và vạch xăng được ghi trong biên bản kiểm định trước và sau chuyến đi.
          </p>
        </div>

        {/* 3. Chính sách hủy đơn */}
        <div className="rounded border border-td-rule bg-td-paper p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-td-ink">
            <XCircle className="w-4 h-4 text-primary" />
            <span>Quy định hủy chuyến & Hoàn tiền</span>
          </div>
          <ul className="text-xs text-td-ink space-y-1">
            <li className="flex items-start gap-1.5">
              <span className="text-success font-bold">•</span>
              <span>Trước 24h nhận xe: <strong>Miễn phí hủy</strong>, hoàn lại toàn bộ số tiền đã thanh toán.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-warning font-bold">•</span>
              <span>Sau mốc 24h hoặc không đến nhận xe: phí hủy <strong>20% tiền thuê bao gồm VAT</strong>; phần còn lại của số tiền đã thanh toán được hoàn.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-td-muted font-bold">•</span>
              <span>Chi nhánh hủy hoặc hệ thống tự động hủy đơn: không thu phí và hoàn lại toàn bộ số tiền đã thanh toán.</span>
            </li>
          </ul>
          <p className="text-[11px] text-td-muted">
            Số tiền hoàn không vượt quá số tiền bạn đã thanh toán. Con số cụ thể được hệ thống tính và hiển thị ngay trong hộp thoại hủy đơn trước khi bạn xác nhận.
          </p>
        </div>

        {/* 4. Phụ phí phát sinh */}
        <div className="rounded border border-td-rule bg-td-paper p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-td-ink">
            <Clock className="w-4 h-4 text-primary" />
            <span>Phụ phí quá giờ &amp; hư hại</span>
          </div>
          <div className="text-xs text-td-ink space-y-1.5">
            <p>
              Phí trả xe quá giờ: <strong className="font-mono text-primary">{overtimeText}</strong>, tính theo giờ làm tròn lên và miễn 15 phút đầu.
            </p>
            <p className="text-[11px] text-td-muted">
              Phụ phí quá giờ trừ vào tiền đặt cọc trước; nếu vượt quá cọc, phần thiếu hụt được phát hành thành hóa đơn bổ sung có thời hạn thanh toán.
            </p>
            <p className="text-[11px] text-td-muted">
              Hư hỏng, trầy xước, thiếu nhiên liệu hoặc vệ sinh được ghi nhận trong biên bản kiểm định khi trả xe.
              Nhân viên căn cứ biên bản để xử lý và quyết toán riêng; hệ thống không tự trừ thêm khoản nào ngoài biên bản.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
