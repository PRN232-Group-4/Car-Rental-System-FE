"use client";

import React from "react";
import { ShieldCheck, BatteryCharging, Fuel, XCircle, Clock, Sparkles, CigaretteOff } from "lucide-react";
import { RentalPolicy, VehicleCategory } from "../types";
import { formatVnd } from "@/lib/format";

export interface RentalPolicyPanelProps {
  policy?: RentalPolicy | null;
  isElectric?: boolean;
  category?: VehicleCategory;
  className?: string;
}

export function RentalPolicyPanel({
  policy,
  isElectric = false,
  className = "",
}: RentalPolicyPanelProps) {
  const depositRate = policy?.depositPercentage ?? 30;
  const overtimeRate = policy?.overtimeFeeRate ?? (isElectric ? 50000 : 60000);

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
            Mức đặt cọc áp dụng là <strong className="font-mono text-primary font-bold">{depositRate}%</strong> tổng giá trị đơn thuê.
          </p>
          <p className="text-[11px] text-td-muted leading-relaxed">
            Cọc sẽ được hoàn trả tự động 100% về tài khoản ban đầu trong vòng 24 giờ sau khi xe được nghiệm thu và không phát sinh vi phạm phạt nguội.
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
            Hỗ trợ sạc nhanh khẩn cấp qua tổng đài hỗ trợ 24/7.
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
              <span>Trước 24h nhận xe: <strong>Miễn phí hủy</strong> (hoàn cọc 100%).</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-warning font-bold">•</span>
              <span>Từ 12h – 24h: Phí hủy <strong>30%</strong> tiền cọc.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-danger font-bold">•</span>
              <span>Dưới 12h hoặc không nhận xe: Phí hủy <strong>100%</strong> tiền cọc.</span>
            </li>
          </ul>
        </div>

        {/* 4. Phụ phí phát sinh & Vệ sinh */}
        <div className="rounded border border-td-rule bg-td-paper p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-td-ink">
            <Clock className="w-4 h-4 text-primary" />
            <span>Phụ phí quá hạn & Vệ sinh</span>
          </div>
          <div className="text-xs text-td-ink space-y-1.5">
            <p>
              Phí trễ hạn: <strong className="font-mono tabular-nums text-primary">{formatVnd(overtimeRate)}/giờ</strong> vượt quá thời gian hợp đồng.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-td-muted">
              <CigaretteOff className="w-3.5 h-3.5 text-danger shrink-0" />
              <span>Phạt 500.000đ vi phạm hút thuốc (xe 100% không khói thuốc).</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-td-muted">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Phí vệ sinh chuyên sâu nội thất bẩn nặng: 150.000đ – 300.000đ.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
