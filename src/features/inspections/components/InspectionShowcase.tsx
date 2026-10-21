"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, UserCheck, Zap, Gauge } from "lucide-react";
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
      <div className="glass-ink rounded p-8 sm:p-12 text-white relative overflow-hidden border border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Context & Narrative */}
          <div className="lg:col-span-6 space-y-6">

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
              Biên Bản Kiểm Định Số Hoá Trước & Sau Mỗi Chuyến Đi
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed font-normal">
              Tại Thong Dong, sự an tâm của khách hàng bắt nguồn từ dữ liệu viễn thông thực tế. Kỹ thuật viên chi nhánh lập biên bản kiểm định 12 hạng mục (pre-rental inspection), chốt odometer, dung lượng pin SoH và lưu trữ ảnh chụp trạng thái xe trước khi bạn nhận chìa khoá.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-stage-ink border border-white/10 rounded p-4.5">
                <span className="font-mono text-3xl font-black text-white block mb-1">
                  100%
                </span>
                <span className="text-xs text-white/70 font-normal">
                  Lượt thuê có phiếu kiểm định số hoá có ảnh
                </span>
              </div>
              <div className="bg-stage-ink border border-white/10 rounded p-4.5">
                <span className="font-mono text-3xl font-black text-primary-tint block mb-1">
                  0đ Phí
                </span>
                <span className="text-xs text-white/70 font-normal">
                  Tranh chấp trầy xước nhờ đối soát ảnh gốc
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Inspection Digital Certificate */}
          {record && (
            <div className="lg:col-span-6">
              <div className="bg-td-white rounded p-6 sm:p-7 relative overflow-hidden border border-td-rule text-td-ink">
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-td-rule pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-extrabold text-primary block tracking-wider font-mono">
                        VERIFIED · IS_OK: TRUE
                      </span>
                      <span className="text-xs text-td-muted font-mono">
                        Hợp đồng: {record.rentalId}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-td-ink bg-td-chalk border border-td-rule px-3 py-1 rounded-full">
                    {record.inspectedAt}
                  </span>
                </div>

                {/* Vehicle Title */}
                <div className="mb-4">
                  <h3 className="font-display text-xl font-bold text-td-ink mb-0.5">
                    {record.vehicleName}
                  </h3>
                  <span className="text-xs font-mono font-semibold text-td-muted">
                    Biển số: {record.plateNumber} · {record.type}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3.5 rounded bg-td-paper border border-td-rule">
                    <div className="flex items-center gap-1.5 text-xs text-td-muted mb-1 font-semibold">
                      <Gauge className="w-3.5 h-3.5 text-primary" />
                      <span>Số km (Odometer)</span>
                    </div>
                    <span className="font-mono text-base font-bold text-td-ink">
                      {record.odometer}
                    </span>
                  </div>

                  <div className="p-3.5 rounded bg-td-paper border border-td-rule">
                    <div className="flex items-center gap-1.5 text-xs text-td-muted mb-1 font-semibold">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span>Pin / SoH Health</span>
                    </div>
                    <span className="font-mono text-base font-bold text-primary">
                      {record.fuelBatteryLevel}
                    </span>
                  </div>
                </div>

                {/* Inspection items */}
                <div className="space-y-2 text-xs text-td-ink mb-5">
                  <div className="flex items-center justify-between p-2.5 rounded bg-td-paper border border-td-rule">
                    <span className="font-medium text-td-ink">Ngoại quan & Thân vỏ (6 góc)</span>
                    <span className="font-semibold text-primary">Đạt chuẩn 100%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-td-paper border border-td-rule">
                    <span className="font-medium text-td-ink">Khoang cabin & Bộ sạc kèm xe</span>
                    <span className="font-semibold text-primary">Đầy đủ · Sạch sẽ</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-td-paper border border-td-rule">
                    <span className="font-medium text-td-ink">Hệ thống phanh & Áp suất lốp</span>
                    <span className="font-semibold text-primary">2.3 Bar chuẩn</span>
                  </div>
                </div>

                {/* Staff stamp */}
                <div className="pt-4 border-t border-td-rule flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-td-ink">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span>Kỹ thuật viên: <strong className="text-td-ink">{record.inspectorName}</strong></span>
                  </div>
                  <span className="text-primary font-mono font-extrabold text-xs px-2.5 py-1 rounded-md bg-primary-tint border border-primary/20">
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
