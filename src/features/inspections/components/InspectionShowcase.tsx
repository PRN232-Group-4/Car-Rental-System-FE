"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, UserCheck, Fuel, Gauge, Shield } from "lucide-react";
import { getLatestInspectionRecord, getInitialInspectionRecord } from "../api";
import type { InspectionRecord } from "../types";
import RevealText from "@/components/ui/RevealText";

export default function InspectionShowcase() {
  const [record, setRecord] = useState<InspectionRecord>(getInitialInspectionRecord());

  useEffect(() => {
    getLatestInspectionRecord().then(setRecord);
  }, []);

  return (
    <section id="kiem-dinh" className="scroll-mt-28 py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="glass-dark specular-border rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,rgba(5,150,105,0.18),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.12),transparent_70%)] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Context & Narrative */}
          <div className="reveal lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#34d399] text-xs font-bold border border-white/10 backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Tiêu chuẩn minh bạch v2.0</span>
            </div>

            <RevealText
              as="h2"
              text="Biên bản kiểm định xe số hoá trước & sau mỗi chuyến đi"
              className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight"
            />

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-normal">
              Tại Thong Dong, sự an tâm của khách hàng không đến từ lời hứa mà đến từ dữ liệu thực tế. Kỹ thuật viên chi nhánh lập biên bản kiểm định 12 hạng mục (pre-rental inspection), chốt odometer, dung lượng pin/nhiên liệu và lưu ảnh chụp trạng thái xe trước khi bạn nhận chìa khoá.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-2xl font-black text-white block mb-0.5">
                  100%
                </span>
                <span className="text-xs text-neutral-400">
                  Lượt thuê có phiếu kiểm định số hoá
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-2xl font-black text-[#10b981] block mb-0.5">
                  0 Phí phạt
                </span>
                <span className="text-xs text-neutral-400">
                  Đối soát minh bạch từ ảnh lưu trữ
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Inspection Digital Certificate */}
          <div className="reveal lg:col-span-6">
            <div className="glass-certificate specular-border rounded-3xl p-6 sm:p-7 relative overflow-hidden">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-neutral-200/60 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#059669] text-white flex items-center justify-center shadow-md shadow-[#059669]/30">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold text-emerald-700 block tracking-tight">
                      Phiếu kiểm tra đạt chuẩn (is_ok: true)
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">
                      Mã hợp đồng: {record.rentalId}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-neutral-600 glass-pill px-3 py-1 rounded-full">
                  {record.inspectedAt}
                </span>
              </div>

              {/* Vehicle Title */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-neutral-900">
                  {record.vehicleName}
                </h3>
                <span className="text-xs font-semibold text-neutral-500">
                  Biển số xe: {record.plateNumber} · {record.type}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="glass-sub p-3 rounded-xl border border-white/70">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Số km (Odometer)</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-900">
                    {record.odometer}
                  </span>
                </div>

                <div className="glass-sub p-3 rounded-xl border border-white/70">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                    <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mức nhiên liệu / Pin</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    {record.fuelBatteryLevel} (Đầy đủ)
                  </span>
                </div>
              </div>

              {/* Inspection items */}
              <div className="space-y-2 text-xs text-neutral-700 mb-5">
                <div className="flex items-center justify-between p-2.5 rounded-xl glass-sub border border-white/60">
                  <span>Ngoại quan & Thân vỏ</span>
                  <span className="font-semibold text-emerald-700">Đạt tiêu chuẩn</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl glass-sub border border-white/60">
                  <span>Khoang nội thất & Phụ kiện</span>
                  <span className="font-semibold text-emerald-700">Sạch sẽ · Đầy đủ</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl glass-sub border border-white/60">
                  <span>Hệ thống an toàn & Áp suất lốp</span>
                  <span className="font-semibold text-emerald-700">2.3 Bar chuẩn</span>
                </div>
              </div>

              {/* Staff stamp */}
              <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-600">
                  <UserCheck className="w-4 h-4 text-[#059669]" />
                  <span>Kỹ thuật viên: <strong>{record.inspectorName}</strong></span>
                </div>
                <span className="text-emerald-800 font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 shadow-xs">
                  ĐÃ DUYỆT BÀN GIAO
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
