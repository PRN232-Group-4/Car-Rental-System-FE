"use client";

import { useState } from "react";
import { Shield, CheckCircle2, Zap, Gauge, Camera, RefreshCw, Cpu, Award } from "lucide-react";
import { Stage } from "@/components/ui/Stage";

interface DiagnosticPoint {
  id: number;
  label: string;
  tag: string;
  value: string;
  description: string;
  status: "VERIFIED" | "OPTIMAL";
  icon: typeof Shield;
}

const DIAGNOSTIC_POINTS: DiagnosticPoint[] = [
  {
    id: 1,
    label: "Tình trạng pin & Dung lượng SoH",
    tag: "BATTERY TELEMETRY",
    value: "SoH 98.8% • 87.7 kWh",
    description: "Đo trực tiếp qua cổng chẩn đoán OBD-EV. Không suy hao tế bào pin, đảm bảo tầm hoạt động thực tế tối đa.",
    status: "OPTIMAL",
    icon: Zap,
  },
  {
    id: 2,
    label: "Cảm biến áp suất 4 lốp (TPMS)",
    tag: "TIRE INTEGRITY",
    value: "2.3 Bar (4 bánh cân bằng)",
    description: "Kiểm tra độ mòn gai lốp và áp suất tiêu chuẩn trước giờ giao, triệt tiêu nguy cơ xẹp lốp giữa hành trình.",
    status: "OPTIMAL",
    icon: Gauge,
  },
  {
    id: 3,
    label: "Đối soát ngoại quan 6 góc xe",
    tag: "360° VISION SCAN",
    value: "6 góc ảnh độ phân giải cao",
    description: "Ảnh chụp 6 góc (đầu, đuôi, 2 sườn, nóc, gầm) lưu trữ trực tiếp trên đám mây để đối soát minh bạch khi trả xe.",
    status: "VERIFIED",
    icon: Camera,
  },
  {
    id: 4,
    label: "Chốt Odometer điện tử",
    tag: "ODOMETER LOCK",
    value: "14.820 km chính xác",
    description: "Chỉ số km được số hoá đồng bộ với hợp đồng điện tử. Không bao giờ phát sinh tranh chấp số km di chuyển.",
    status: "VERIFIED",
    icon: Cpu,
  },
  {
    id: 5,
    label: "Hệ thống phanh & An toàn ADAS",
    tag: "SAFETY & ADAS",
    value: "Cảnh báo va chạm • Phanh ABS/EBD",
    description: "Được kỹ thuật viên kiểm định tại xưởng trạm: đĩa phanh, dầu phanh và radar tự hành hoạt động hoàn hảo.",
    status: "VERIFIED",
    icon: Award,
  },
  {
    id: 6,
    label: "Lệnh hoàn cọc tự động qua PayOS",
    tag: "PAYOS AUTO-REFUND",
    value: "0đ Phí phạt • Hoàn trong 5 phút",
    description: "Khi biên bản bàn giao trả xe được xác nhận khớp với ảnh gốc lúc nhận, tiền cọc được lệnh hoàn tự động về tài khoản.",
    status: "OPTIMAL",
    icon: RefreshCw,
  },
];

export default function DiagnosticDeck() {
  const [activePointId, setActivePointId] = useState<number>(1);
  const activePoint = DIAGNOSTIC_POINTS.find((p) => p.id === activePointId) || DIAGNOSTIC_POINTS[0];
  const ActiveIcon = activePoint.icon;

  return (
    <Stage variant="ink" className="py-24 md:py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 text-white">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.08]">
              Trạm Quét Kiểm Định Viễn Thông Số Hoá
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-white/80 font-normal leading-relaxed">
            Mọi chuyến đi đều được bảo chứng bởi dữ liệu cảm biến thực tế. Minh bạch hai chiều, lưu ảnh gốc chống đổ lỗi trầy xước.
          </p>
        </div>

        {/* Diagnostic Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Interactive Radar Scan Matrix */}
          <div className="lg:col-span-7 glass-ink rounded-[var(--r-panel)] p-6 sm:p-10 border border-white/15 shadow-e3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-primary animate-ping" />
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  RADAR SCAN STATUS: ACTIVE
                </span>
              </div>
              <span className="text-xs font-mono text-primary-tint bg-stage-ink px-3 py-1 rounded-full border border-primary/40">
                100% TIÊU CHUẨN
              </span>
            </div>

            {/* 6 Diagnostic Points Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {DIAGNOSTIC_POINTS.map((pt) => {
                const Icon = pt.icon;
                const isSelected = pt.id === activePointId;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setActivePointId(pt.id)}
                    className={`p-4 rounded-2xl text-left transition-all cursor-pointer select-none active:scale-[0.98] border flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-primary/20 border-primary/40/80 shadow-e2"
                        : "bg-stage-ink/80 hover:bg-surface/10 border-white/10 text-white/80"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary text-white" : "bg-surface/10 text-white/70"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4
                          className={`text-xs font-bold line-clamp-1 ${
                            isSelected ? "text-white" : "text-white/90"
                          }`}
                        >
                          {pt.label}
                        </h4>
                        <span className="text-[10px] font-mono text-white/50">
                          {pt.tag}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-primary-tint block mt-1">
                        {pt.value}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Security Guarantee Note */}
            <div className="p-4 rounded-2xl bg-surface/5 border border-white/10 flex items-center gap-3 text-xs text-white/80">
              <CheckCircle2 className="w-4 h-4 text-primary-tint shrink-0" />
              <span>Ảnh số hoá 6 góc và chỉ số Odometer được khoá bảo mật không thể can thiệp.</span>
            </div>
          </div>

          {/* Right Column: Active Diagnostic Live Card */}
          <div className="lg:col-span-5 bg-surface rounded-[var(--r-panel)] p-8 sm:p-10 border border-white shadow-e3 text-ink flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-line mb-6">
                <span className="text-xs font-mono font-bold text-primary tracking-wider uppercase px-2.5 py-1 rounded bg-primary-tint">
                  {activePoint.tag}
                </span>
                <span className="text-xs font-mono font-bold text-primary bg-primary-tint px-3 py-1 rounded-full">
                  {activePoint.status}
                </span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-primary-tint text-primary flex items-center justify-center mb-6 shadow-e1">
                <ActiveIcon className="w-7 h-7 stroke-[2.2]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-ink mb-2">
                {activePoint.label}
              </h3>

              <div className="font-mono text-2xl font-black text-primary mb-4">
                {activePoint.value}
              </div>

              <p className="text-sm text-ink-2 font-normal leading-relaxed mb-6">
                {activePoint.description}
              </p>
            </div>

            <div className="pt-6 border-t border-line space-y-3">
              <div className="flex items-center justify-between text-xs text-ink-2">
                <span>Kỹ thuật viên kiểm tra:</span>
                <strong className="text-ink font-mono font-bold">KTV Nguyễn Quốc Bảo</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-ink-2">
                <span>Chữ ký số hợp đồng:</span>
                <span className="font-mono text-primary font-bold">SHA-256 VERIFIED</span>
              </div>
              <div className="flex items-center justify-between text-xs text-ink-2">
                <span>Quyết toán cọc:</span>
                <span className="font-mono text-primary font-bold">Tự động qua PayOS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
