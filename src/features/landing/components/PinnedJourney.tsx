"use client";

import { useRef, useState } from "react";
import { KeyRound, ShieldCheck, RefreshCw, CheckCircle2, FileText, Smartphone } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/register";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const railPathRef = useRef<SVGLineElement>(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  // Minh hoạ trực quan quy trình giao nhận xe như một dòng chảy liên tục.
  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (railPathRef.current) gsap.set(railPathRef.current, { strokeDashoffset: 0 });
        if (cardsRef.current) {
          const cards = cardsRef.current.querySelectorAll<HTMLElement>("[data-journey-card]");
          gsap.set(cards, { opacity: 1, y: 0 });
        }
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (cardsRef.current) {
          const cards = cardsRef.current.querySelectorAll<HTMLElement>("[data-journey-card]");
          cards.forEach((card, idx) => {
            gsap.fromTo(
              card,
              { y: 24, opacity: 0.85 },
              {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                  end: "top 55%",
                  scrub: 0.5,
                },
              }
            );

            ScrollTrigger.create({
              trigger: card,
              start: "top 65%",
              end: "bottom 65%",
              onEnter: () => setActivePhaseIndex(idx),
              onEnterBack: () => setActivePhaseIndex(idx),
            });
          });
        }
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="quy-trinh"
      ref={containerRef}
      data-journey-container="true"
      className="py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-28 relative overflow-clip"
    >
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Pinned Narrative on Desktop */}
        <div className="lg:col-span-5 space-y-6 lg:motion-safe:sticky lg:top-[120px]">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase block mb-2">
              QUY TRÌNH THUÊ XE MINH BẠCH // VẬN HÀNH TỰ ĐỘNG
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-ink tracking-tight leading-[1.08] text-balance">
              Quy trình 4&#160;bước trải&#160;nghiệm xe cao&#160;cấp
            </h2>
          </div>

          <p className="text-sm sm:text-base text-ink-2 font-normal leading-relaxed text-balance">
            Quy trình hoàn toàn tự động hóa từ xác thực eKYC trực tuyến, mở khóa thông minh cho đến đối soát hoàn cọc minh bạch.
          </p>

          {/* Vertical Progress Rail */}
          <div data-journey-rail="true" className="pt-2 hidden sm:block relative">
            <svg
              className="absolute left-[7px] top-3 bottom-3 w-[2px] h-[calc(100%-24px)] overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              <line x1="0" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="2" className="text-line" />
              <line ref={railPathRef} x1="0" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="2" className="text-primary" />
            </svg>
            <div className="relative pl-6 space-y-4">
              {PHASES.map((phase, idx) => {
                const isActive = idx === activePhaseIndex;
                return (
                  <div
                    key={phase.step}
                    data-journey-step={phase.step}
                    className="relative group cursor-default transition-all duration-300"
                  >
                    {/* Rail Node Dot */}
                    <div
                      className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                        isActive
                          ? "border-primary bg-primary ring-4 ring-primary/20 scale-125"
                          : "border-line bg-surface group-hover:border-primary/50"
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          isActive ? "bg-white" : "bg-stage-ink"
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs font-semibold transition-colors ${
                          isActive ? "text-primary" : "text-ink group-hover:text-primary"
                        }`}
                      >
                        Bước {phase.step}
                      </span>
                      <span className="text-ink-3 text-xs">/</span>
                      <span
                        className={`text-xs truncate transition-colors ${
                          isActive ? "text-ink font-bold" : "text-ink-2 font-semibold"
                        }`}
                      >
                        {phase.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Scrolling Phase Cards */}
        <div ref={cardsRef} className="lg:col-span-7 space-y-6 sm:space-y-8">
          {PHASES.map((phase, idx) => {
            const Icon = phase.icon;
            const isActive = idx === activePhaseIndex;
            return (
              <div
                key={phase.step}
                data-journey-card={phase.step}
                className={`relative overflow-hidden rounded-3xl p-7 sm:p-9 bg-surface border transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? "border-primary/60 shadow-[0_12px_36px_rgba(180,83,9,0.1)] ring-1 ring-primary/20"
                    : "border-line-strong shadow-sm hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-line">
                    <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
                      Bước {phase.step} // {phase.subtitle}
                    </span>

                    <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5 stroke-[2]" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-ink mb-2 tracking-tight">
                    {phase.title}
                  </h3>

                  <p className="text-sm text-ink-2 font-normal leading-relaxed mb-6">
                    {phase.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-line flex items-center justify-between text-xs">
                  <span className="font-semibold text-xs text-primary">
                    {phase.highlight}
                  </span>

                  {idx === PHASES.length - 1 && (
                    <span className="font-semibold text-primary flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Hoàn tất tự động
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
