"use client";

import { useRef } from "react";
import { KeyRound, ShieldCheck, RefreshCw, CheckCircle2, FileText, Smartphone } from "lucide-react";

interface JourneyPhase {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof KeyRound;
  highlight: string;
}

const PHASES: JourneyPhase[] = [
  {
    step: "1",
    title: "Xác thực eKYC & Ký hợp đồng số (60s)",
    subtitle: "Thủ tục số hóa 100% không thế chấp",
    description: "Xác thực danh tính công dân số qua VNeID/CCCD gắn chip. Hợp đồng điện tử ký số bảo mật OTP, đối soát tự động theo quy chuẩn pháp lý.",
    icon: FileText,
    highlight: "Hợp đồng số hóa pháp lý 100%",
  },
  {
    step: "2",
    title: "Biên bản bàn giao 360° & Mở khóa số",
    subtitle: "Khởi hành tại trạm hoặc giao tận nơi",
    description: "AI tự động lập biên bản số đối soát 8 góc chụp ngoại quan thân vỏ, công-tơ-mét và mức pin/nhiên liệu trước khi chìa khóa số được mở trên điện thoại.",
    icon: Smartphone,
    highlight: "Kiểm định hình ảnh AI 8 góc",
  },
  {
    step: "3",
    title: "Hành trình tự do & Giám sát an toàn 24/7",
    subtitle: "Bảo hiểm vật chất 2 chiều cao cấp",
    description: "Toàn bộ chuyến đi được bảo vệ bởi gói bảo hiểm toàn diện. Cảm biến áp suất lốp, cảnh báo an toàn và tổng đài điều phối hỗ trợ cứu hộ khẩn cấp 24/7.",
    icon: ShieldCheck,
    highlight: "Bảo hiểm hai chiều & Cứu hộ 24/7",
  },
  {
    step: "4",
    title: "Trả xe tự động & Giải phóng cọc PayOS",
    subtitle: "Hoàn cọc tức thì trong 15 phút",
    description: "Telematics tự động chốt quãng đường và năng lượng tiêu hao. Hệ thống tự động kích hoạt hoàn cọc tức thì về tài khoản ngân hàng liên kết, không phí ẩn.",
    icon: RefreshCw,
    highlight: "Hoàn cọc PayOS tự động 15 phút",
  },
];

export default function PinnedJourney() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section
      id="quy-trinh"
      ref={containerRef}
      className="relative w-full py-14 lg:py-20 px-4 sm:px-6 lg:px-12 bg-canvas scroll-mt-24 overflow-hidden"
    >
      {/* Monumental Chapter Numeral */}
      <span 
        aria-hidden="true" 
        className="font-display font-black text-[clamp(4.5rem,7vw,8rem)] leading-none text-ink/5 dark:text-ink/10 select-none pointer-events-none absolute right-8 top-2 z-0 opacity-40"
      >
        06
      </span>

      <div className="relative z-10 w-full max-w-[1680px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-line pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
                QUY TRÌNH BÀN GIAO SỐ HÓA // KHÔNG TIẾP XÚC
              </span>
            </div>
            <h2 data-kinetic-skew="true" className="font-display text-2xl sm:text-4xl xl:text-5xl font-black text-ink tracking-tight text-balance">
              Hành trình thuê xe 4 bước chuẩn hóa
            </h2>
          </div>
          <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed text-balance">
            Thủ tục số hóa 100% không thế chấp, nhận xe tức thì và tự động giải phóng cọc PayOS trong 15 phút.
          </p>
        </div>

        {/* Ma Trận 4 Cột Ngang (4-Column Process Matrix) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <div
                key={phase.step}
                className="group rounded-3xl bg-surface border border-line p-6 sm:p-7 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 shadow-sm relative overflow-hidden"
              >
                <div>
                  {/* Top Bar inside Card: Step Numeral & Icon */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <span className="font-mono text-4xl sm:text-5xl font-black text-ink-3/40 group-hover:text-primary transition-colors tabular-nums">
                      0{phase.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-line text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 stroke-[2]" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Subtitle Tag */}
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary block mb-1.5">
                    {phase.subtitle}
                  </span>

                  {/* Title */}
                  <h3 className="font-display text-lg sm:text-xl font-bold text-ink leading-snug mb-3">
                    {phase.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-ink-2 leading-relaxed mb-6">
                    {phase.description}
                  </p>
                </div>

                {/* Bottom Commitment Badge */}
                <div className="pt-4 border-t border-line flex items-center gap-2 text-xs font-mono text-primary font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{phase.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
