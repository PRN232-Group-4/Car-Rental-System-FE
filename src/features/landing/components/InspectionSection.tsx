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
  desc: string;
  status: string;
  detail: string;
}

const INSPECTION_POINTS: InspectionPoint[] = [
  {
    id: "p1",
    name: "Ảnh chụp 6 góc thân vỏ ngoại quan",
    code: "ISO-VISUAL-360",
    desc: "Đầu xe, đuôi xe, sườn trái, sườn phải, nóc và gầm được chụp ảnh HD lưu trữ vào hợp đồng số.",
    status: "ĐÃ ĐỐI SOÁT",
    detail: "Độ phân giải 4K · Chống đổ lỗi trầy xước",
  },
  {
    id: "p2",
    name: "Chốt Odometer điện tử & Mức pin/xăng",
    code: "METROLOGY-LOCK",
    desc: "Ghi nhận chính xác số km lăn bánh thực tế và mức năng lượng ban đầu để tính toán minh bạch.",
    status: "KHÓA ĐIỆN TỬ",
    detail: "Đồng bộ tức thì từ ECU xe lên hệ thống",
  },
  {
    id: "p3",
    name: "Áp suất 4 lốp (TPMS) & Phanh ADAS",
    code: "SAFETY-BRAKE-TPMS",
    desc: "Kiểm tra cảm biến áp suất 4 bánh tiêu chuẩn và quét chẩn đoán hệ thống an toàn phanh khẩn cấp.",
    status: "TIÊU CHUẨN AN TOÀN",
    detail: "Áp suất 2.3 Bar · Má phanh đạt 98%",
  },
  {
    id: "p4",
    name: "Biên bản bàn giao ký số điện tử",
    code: "E-CONTRACT-SIGN",
    desc: "Khách hàng duyệt biên bản trên ứng dụng di động chỉ với 1 chạm trước khi nhận chìa khóa thông minh.",
    status: "SHA-256 VERIFIED",
    detail: "Giá trị pháp lý ngang văn bản công chứng",
  },
];

export default function InspectionSection() {
  const [activePointId, setActivePointId] = useState<string>("p1");
  const activePoint = INSPECTION_POINTS.find((p) => p.id === activePointId) || INSPECTION_POINTS[0];

  return (
    <section id="kiem-dinh" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
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
          Triệt tiêu hoàn toàn nỗi lo tranh chấp hư hỏng. Mọi lượt thuê đều được ghi nhận bằng dữ liệu cảm biến thực tế và ảnh chụp gốc độ phân giải cao.
        </p>
      </div>

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Interactive Inspection Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {INSPECTION_POINTS.map((point) => {
            const isSelected = activePointId === point.id;
            return (
              <div
                key={point.id}
                onClick={() => setActivePointId(point.id)}
                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer select-none ${
                  isSelected
                    ? "bg-surface border-[#b45309]/50 shadow-[0_8px_24px_-4px_rgba(180,83,9,0.12)]"
                    : "bg-[#f7f7f4] border-line hover:border-line-strong hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-black transition-colors ${
                        isSelected
                          ? "bg-[#b45309] text-white"
                          : "bg-sunken text-ink-3"
                      }`}
                    >
                      {point.id.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-ink">
                        {point.name}
                      </h3>
                      <span className="font-mono text-[10px] text-ink-3 uppercase tracking-wider">
                        {point.code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                      isSelected
                        ? "bg-amber-100 text-[#b45309]"
                        : "bg-sunken text-ink-3"
                    }`}
                  >
                    {point.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-ink-2 leading-relaxed pl-12">
                  {point.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Certificate & PayOS Guarantee Terminal (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0f172a] text-white p-7 sm:p-9 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
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

            <div className="mb-6">
              <span className="text-[11px] font-mono text-white/50 uppercase tracking-widest block mb-1">
                TIÊU CHUẨN ĐANG XEM
              </span>
              <h4 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                {activePoint.name}
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                {activePoint.detail}
              </p>
            </div>

            {/* PayOS Automated Refund Guarantee Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] font-bold uppercase tracking-wider mb-2">
                <RefreshCw className="w-4 h-4" />
                <span>CƠ CHẾ HOÀN CỌC PAYOS TỨC THÌ</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Sau khi ký số biên bản trả xe, lệnh hoàn tiền cọc được hệ thống đẩy trực tiếp qua cổng thanh toán PayOS trong vòng <strong className="text-white">5 phút</strong>. Khách hàng nhận lại cọc đúng số tiền ban đầu mà không bị giam vốn.
              </p>
            </div>

            {/* System Trust Pillars */}
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Không phát sinh phụ phí vệ sinh vô lý</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ảnh chụp 6 góc được mã hóa chống can thiệp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hỗ trợ cứu hộ kỹ thuật 24/7 toàn quốc</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 relative z-10">
            <Button
              as="a"
              href="#doi-xe"
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
