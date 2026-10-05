"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  RefreshCw, 
  FileCheck2, 
  CheckCircle2, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InspectionPoint {
  id: string;
  name: string;
  code: string;
  tag: string;
  desc: string;
  status: string;
  specs: string[];
}

const INSPECTION_POINTS: InspectionPoint[] = [
  {
    id: "p1",
    name: "Ngoại Quan 360°",
    code: "ISO-VISUAL-360",
    tag: "4K CAMERA SCAN",
    desc: "Chụp 6 góc thân vỏ lưu trữ đám mây. Triệt tiêu tranh chấp trầy xước.",
    status: "ĐÃ ĐỐI SOÁT",
    specs: ["Độ phân giải 4K", "Lưu trữ WORM", "0 phụ phí vô lý"],
  },
  {
    id: "p2",
    name: "ECU Odometer & Pin",
    code: "METROLOGY-LOCK",
    tag: "OBD-II CAN-BUS",
    desc: "Khóa điện tử số km lăn bánh và mức năng lượng thực tế lúc nhận - trả xe.",
    status: "KHÓA ĐIỆN TỬ",
    specs: ["Đồng bộ tức thì", "Chính xác 100%", "Bảo mật phần cứng"],
  },
  {
    id: "p3",
    name: "Áp Suất Lốp & Phanh",
    code: "SAFETY-BRAKE-TPMS",
    tag: "TPMS 2.4 BAR",
    desc: "Đo 4 bánh và quét chẩn đoán má phanh đạt chuẩn an toàn trước giờ lăn bánh.",
    status: "CHUẨN AN TOÀN",
    specs: ["Áp suất 2.4 Bar", "Má phanh 98%", "Cảm biến ADAS"],
  },
  {
    id: "p4",
    name: "Ký Số Điện Tử",
    code: "E-CONTRACT-SIGN",
    tag: "SHA-256 SIGN",
    desc: "1 chạm duyệt biên bản bàn giao trên điện thoại. Giá trị pháp lý công chứng.",
    status: "SHA-256 VERIFIED",
    specs: ["Ký số 1 chạm", "Thời gian thực", "Bảo chứng pháp lý"],
  },
];

export default function InspectionSection() {
  const [activePointId, setActivePointId] = useState<string>("p1");
  const activePoint = INSPECTION_POINTS.find((p) => p.id === activePointId) || INSPECTION_POINTS[0];

  return (
    <section id="kiem-dinh" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 overflow-hidden">
      {/* Background Optical LiDAR & 360° Diagnostic Radar Blueprint */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg 
          className="w-full h-full opacity-[0.06]" 
          viewBox="0 0 1280 900" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin slice"
        >
          {/* Engineering Boundary Marks */}
          <line x1="0" y1="40" x2="1280" y2="40" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="6 6" />
          <line x1="0" y1="100" x2="1280" y2="100" stroke="#b45309" strokeWidth="0.8" />
          
          <g stroke="#0f172a" strokeWidth="0.8">
            <line x1="40" y1="90" x2="40" y2="110" />
            <line x1="280" y1="90" x2="280" y2="110" />
            <text x="160" y="96" fill="#0f172a" fontSize="10" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
              OPTICAL LIDAR &amp; 360° TELEMETRY
            </text>
          </g>

          {/* Concentric Radar Range Rings & Azimuth Crosshairs */}
          <g transform="translate(640, 520)">
            <circle cx="0" cy="0" r="120" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r="220" stroke="#b45309" strokeWidth="1" />
            <circle cx="0" cy="0" r="320" stroke="#0f172a" strokeWidth="1.2" strokeDasharray="8 6" />
            <circle cx="0" cy="0" r="420" stroke="#0f172a" strokeWidth="0.8" strokeDasharray="2 4" />
            <circle cx="0" cy="0" r="6" fill="#b45309" />

            {/* Radar Sweep Rays & Angle Guides */}
            <line x1="-460" y1="0" x2="460" y2="0" stroke="#0f172a" strokeWidth="0.8" />
            <line x1="0" y1="-460" x2="0" y2="460" stroke="#0f172a" strokeWidth="0.8" />
            <line x1="-320" y1="-320" x2="320" y2="320" stroke="#0f172a" strokeWidth="0.6" strokeDasharray="4 4" />
            <line x1="-320" y1="320" x2="320" y2="-320" stroke="#0f172a" strokeWidth="0.6" strokeDasharray="4 4" />

            {/* Range Annotations */}
            <text x="125" y="-8" fill="#0f172a" fontSize="9" fontFamily="monospace">R: 10M</text>
            <text x="225" y="-8" fill="#b45309" fontSize="9" fontFamily="monospace">R: 25M</text>
            <text x="325" y="-8" fill="#0f172a" fontSize="9" fontFamily="monospace">R: 50M</text>
            
            {/* Azimuth Angle Marks */}
            <text x="0" y="-430" fill="#0f172a" fontSize="9" fontFamily="monospace" textAnchor="middle">000° [N]</text>
            <text x="430" y="4" fill="#0f172a" fontSize="9" fontFamily="monospace">090° [E]</text>
            <text x="0" y="445" fill="#0f172a" fontSize="9" fontFamily="monospace" textAnchor="middle">180° [S]</text>
            <text x="-430" y="4" fill="#0f172a" fontSize="9" fontFamily="monospace" textAnchor="end">270° [W]</text>
          </g>

          {/* Sensor Alignment Target Marks */}
          <g stroke="#b45309" strokeWidth="0.8">
            <circle cx="180" cy="400" r="16" strokeDasharray="2 2" />
            <circle cx="180" cy="400" r="2" fill="#b45309" />
            <text x="180" y="430" fill="#0f172a" fontSize="9" fontFamily="monospace" textAnchor="middle">CAM-01 [F-FOV 120°]</text>

            <circle cx="1100" cy="400" r="16" strokeDasharray="2 2" />
            <circle cx="1100" cy="400" r="2" fill="#b45309" />
            <text x="1100" y="430" fill="#0f172a" fontSize="9" fontFamily="monospace" textAnchor="middle">CAM-02 [R-FOV 120°]</text>
          </g>
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-600/20 text-[#b45309] text-xs font-mono font-bold tracking-wider uppercase mb-3.5">
            <ShieldCheck className="w-4 h-4 text-[#b45309]" />
            <span>MINH BẠCH & TRÁCH NHIỆM PHÁP LÝ</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-ink tracking-tight">
            Kiểm Định 2 Chiều & Hoàn Cọc Tự Động
          </h2>
        </div>
        <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed">
          Triệt tiêu hoàn toàn tranh chấp hư hỏng. Mọi lượt thuê đều được định danh bằng dữ liệu cảm biến thực tế và ảnh chụp gốc độ phân giải cao.
        </p>
      </div>

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Visual Diagnostic Checklist with Specs Chips (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INSPECTION_POINTS.map((point) => {
            const isSelected = activePointId === point.id;
            return (
              <div
                key={point.id}
                onClick={() => setActivePointId(point.id)}
                className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? "bg-surface border-[#b45309]/50 shadow-[0_8px_24px_-4px_rgba(180,83,9,0.12)] ring-1 ring-[#b45309]/20"
                    : "bg-[#f7f7f4] border-line hover:border-line-strong hover:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-[10px] font-black uppercase text-[#b45309] bg-amber-50 border border-amber-600/20 px-2.5 py-0.5 rounded-lg">
                      {point.tag}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isSelected
                          ? "bg-amber-100 text-[#b45309]"
                          : "bg-sunken text-ink-3"
                      }`}
                    >
                      {point.status}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-ink mb-1.5">
                    {point.name}
                  </h3>

                  <p className="text-xs text-ink-2 leading-relaxed mb-4">
                    {point.desc}
                  </p>
                </div>

                {/* Telemetry Chips (Concise Visual Proof) */}
                <div className="pt-3 border-t border-line flex flex-wrap gap-1.5">
                  {point.specs.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-mono text-ink-3 bg-sunken px-2 py-0.5 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Certificate & PayOS Guarantee Terminal (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0f172a] text-white p-7 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#f59e0b]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white/80">
                  CHỨNG THỰC ĐIỆN TỬ
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                SẴN SÀNG ĐỐI SOÁT
              </span>
            </div>

            {/* Current Active Point Telemetry Focus */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-5">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
                TIÊU CHUẨN ĐANG CHỌN // {activePoint.code}
              </span>
              <h4 className="font-display text-lg font-bold text-white mb-1">
                {activePoint.name}
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                {activePoint.desc}
              </p>
            </div>

            {/* PayOS Automated Refund Guarantee Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-5">
              <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] font-bold uppercase tracking-wider mb-2">
                <RefreshCw className="w-4 h-4 text-[#f59e0b]" />
                <span>CƠ CHẾ HOÀN CỌC PAYOS TỨC THÌ</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center my-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-white/50 block">THỜI GIAN</span>
                  <strong className="text-sm font-mono text-emerald-400">&lt; 5 PHÚT</strong>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-white/50 block">CỔNG THANH TOÁN</span>
                  <strong className="text-sm font-mono text-white">PayOS API</strong>
                </div>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed">
                Tiền cọc được giải ngân tự động về tài khoản ngân hàng ngay khi ký số biên bản trả xe mà không giam vốn.
              </p>
            </div>

            {/* System Trust Pillars */}
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Không phụ phí phát sinh ngoài thỏa thuận</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ảnh 6 góc mã hóa chống sửa đổi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hỗ trợ kỹ thuật và cứu hộ 24/7 toàn quốc</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 relative z-10">
            <Button
              as="a"
              href="#chi-nhanh"
              variant="amber-hero"
              className="w-full flex items-center justify-center gap-2 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider"
            >
              <span>Xem xe đạt chuẩn kiểm định</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
