"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, UserCheck, Fuel, Gauge, Shield } from "lucide-react";
import { getLatestInspectionRecord, getInitialInspectionRecord } from "../api";
import type { InspectionRecord } from "../types";

export default function InspectionShowcase() {
  const [record, setRecord] = useState<InspectionRecord | null>(getInitialInspectionRecord());

  useEffect(() => {
    getLatestInspectionRecord()
      .then(setRecord)
      .catch(() => setRecord(null));
  }, []);

  return (
    <section id="kiem-dinh" className="scroll-mt-28 py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="glass-ink rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-elevation-2 border border-border-dim">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Context & Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stage-ink border border-border-dim text-emerald-400 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Tiêu chuẩn minh bạch v2.0</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Biên bản kiểm định xe số hoá trước & sau mỗi chuyến đi
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed font-normal">
              Tại Thong Dong, sự an tâm của khách hàng không đến từ lời hứa mà đến từ dữ liệu thực tế. Kỹ thuật viên chi nhánh lập biên bản kiểm định 12 hạng mục (pre-rental inspection), chốt odometer, dung lượng pin/nhiên liệu và lưu ảnh chụp trạng thái xe trước khi bạn nhận chìa khoá.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-stage-ink border border-border-dim rounded-2xl p-4">
                <span className="text-2xl font-black text-white block mb-0.5">
                  100%
                </span>
                <span className="text-xs text-white/70">
                  Lượt thuê có phiếu kiểm định số hoá
                </span>
              </div>
              <div className="bg-stage-ink border border-border-dim rounded-2xl p-4">
                <span className="text-2xl font-black text-emerald-400 block mb-0.5">
                  0 Phí phạt
                </span>
                <span className="text-xs text-white/70">
                  Đối soát minh bạch từ ảnh lưu trữ
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Inspection Digital Certificate */}
          {record && (
            <div className="lg:col-span-6">
              <div className="bg-surface rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-border shadow-elevation-2 text-ink">
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-extrabold text-primary block tracking-tight">
                        Phiếu kiểm tra đạt chuẩn (is_ok: true)
                      </span>
                      <span className="text-xs text-ink-muted font-medium">
                        Mã hợp đồng: {record.rentalId}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink-muted bg-canvas border border-border px-3 py-1 rounded-full">
                    {record.inspectedAt}
                  </span>
                </div>

                {/* Vehicle Title */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-ink">
                    {record.vehicleName}
                  </h3>
                  <span className="text-xs font-semibold text-ink-muted">
                    Biển số xe: {record.plateNumber} · {record.type}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-canvas border border-border">
                    <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                      <Gauge className="w-3.5 h-3.5 text-ink-subtle" />
                      <span>Số km (Odometer)</span>
                    </div>
                    <span className="text-sm font-bold text-ink">
                      {record.odometer}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-canvas border border-border">
                    <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                      <Fuel className="w-3.5 h-3.5 text-primary" />
                      <span>Mức nhiên liệu / Pin</span>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {record.fuelBatteryLevel} (Đầy đủ)
                    </span>
                  </div>
                </div>

                {/* Inspection items */}
                <div className="space-y-2 text-xs text-ink mb-5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-canvas border border-border">
                    <span>Ngoại quan & Thân vỏ</span>
                    <span className="font-semibold text-primary">Đạt tiêu chuẩn</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-canvas border border-border">
                    <span>Khoang nội thất & Phụ kiện</span>
                    <span className="font-semibold text-primary">Sạch sẽ · Đầy đủ</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-canvas border border-border">
                    <span>Hệ thống an toàn & Áp suất lốp</span>
                    <span className="font-semibold text-primary">2.3 Bar chuẩn</span>
                  </div>
                </div>

                {/* Staff stamp */}
                <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-ink-muted">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span>Kỹ thuật viên: <strong className="text-ink">{record.inspectorName}</strong></span>
                  </div>
                  <span className="text-primary font-bold px-2.5 py-1 rounded-md bg-emerald-100">
                    ĐÃ DUYỆT BÀN GIAO
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
