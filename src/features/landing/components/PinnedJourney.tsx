"use client";

import { useRef, useState } from "react";
import { KeyRound, ShieldCheck, RefreshCw, CheckCircle2, FileText, Smartphone } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/register";
import { CadCard } from "@/components/ui/CadCard";

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

/**
 * PinnedJourney (Awwwards SOTD v4.0):
 * Khắc phục triệt để lỗi lệch tâm trục dọc bằng cơ cấu cột cố định 24px (w-6),
 * khóa tuyệt đối tâm toán học x = 12px qua cả 4 bước hành trình.
 * Tích hợp hệ thống thẻ CadCard chuẩn khí cụ kỹ thuật.
 */
export default function PinnedJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const railProgressRef = useRef<HTMLDivElement>(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (railProgressRef.current) gsap.set(railProgressRef.current, { scaleY: 1 });
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

          // Sync vertical rail progress line
          if (railProgressRef.current && containerRef.current) {
            gsap.fromTo(
              railProgressRef.current,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 70%",
                  end: "bottom 70%",
                  scrub: true,
                },
              }
            );
          }
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
      className="py-20 sm:py-24 md:py-28 px-4 sm:px-6 lg:px-12 w-full max-w-[1480px] xl:max-w-[1600px] mx-auto scroll-mt-28 relative overflow-hidden"
    >
      {/* Monumental Chapter Numeral */}
      <span 
        aria-hidden="true" 
        className="font-display font-black text-[clamp(4.5rem,7vw,8rem)] leading-none text-ink/5 dark:text-ink/10 select-none pointer-events-none absolute right-6 top-8"
      >
        06
      </span>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Pinned Narrative on Desktop */}
        <div className="lg:col-span-5 space-y-8 lg:motion-safe:sticky lg:top-28">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase block mb-2">
              QUY TRÌNH THUÊ XE MINH BẠCH // VẬN HÀNH TỰ ĐỘNG
            </span>
            <h2 data-kinetic-skew="true" className="font-display text-3xl sm:text-5xl font-black text-ink tracking-tight leading-[1.08] text-balance">
              Quy trình 4&#160;bước trải&#160;nghiệm xe cao&#160;cấp
            </h2>
          </div>

          <p className="text-sm sm:text-base text-ink-2 font-normal leading-relaxed text-balance">
            Quy trình hoàn toàn tự động hóa từ xác thực eKYC trực tuyến, mở khóa thông minh cho đến đối soát hoàn cọc minh bạch.
          </p>

          {/* Vertical Progress Rail (Strict Mathematical Center Alignment at x = 12px) */}
          <div data-journey-rail="true" className="hidden sm:block relative pt-2">
            {/* Background continuous track line centered at 11.25px (middle of w-6) */}
            <div 
              aria-hidden="true"
              className="absolute left-[11.25px] top-3 bottom-3 w-[1.5px] bg-line-strong pointer-events-none"
            />
            {/* Animated GSAP progress bar track line */}
            <div 
              ref={railProgressRef}
              aria-hidden="true"
              className="absolute left-[11.25px] top-3 bottom-3 w-[1.5px] bg-primary origin-top pointer-events-none"
            />

            {/* Steps Axis Stack */}
            <div className="relative space-y-6">
              {PHASES.map((phase, idx) => {
                const isActive = idx === activePhaseIndex;
                return (
                  <div
                    key={phase.step}
                    data-journey-step={phase.step}
                    className="flex items-center gap-4 relative group cursor-default"
                  >
                    {/* Strict Fixed-Width Axis Container (w-6 h-6, Center at x = 12px) */}
                    <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                      {/* Active Concentric Pulse Ring (Does not shift center) */}
                      {isActive && (
                        <span 
                          aria-hidden="true"
                          className="absolute inset-0.5 rounded-full border border-primary animate-pulse" 
                        />
                      )}
                      {/* Center Dot Locked to Exact Center */}
                      <span
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          isActive 
                            ? "bg-primary shadow-sm" 
                            : "bg-line-strong group-hover:bg-primary/60"
                        }`}
                      />
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`font-mono text-xs font-bold transition-colors ${
                          isActive ? "text-primary" : "text-ink-3 group-hover:text-ink"
                        }`}
                      >
                        0{phase.step} //
                      </span>
                      <span
                        className={`text-xs truncate transition-colors ${
                          isActive ? "text-ink font-bold" : "text-ink-2 font-medium"
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
              <CadCard
                key={phase.step}
                data-journey-card={phase.step}
                active={isActive}
                headerLeft={
                  <span>
                    BƯỚC {phase.step} // {phase.subtitle}
                  </span>
                }
                headerRight={
                  <div className="w-7 h-7 rounded-lg bg-surface border border-line text-primary flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
                  </div>
                }
                className="p-6 sm:p-8"
              >
                <div className="space-y-4">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
                    {phase.title}
                  </h3>

                  <p className="text-sm text-ink-2 font-normal leading-relaxed">
                    {phase.description}
                  </p>

                  <div className="pt-4 border-t border-line flex items-center justify-between text-xs">
                    <span className="font-semibold text-xs text-primary font-mono">
                      {phase.highlight}
                    </span>

                    {idx === PHASES.length - 1 && (
                      <span className="font-semibold text-primary flex items-center gap-1.5 font-mono text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        HOÀN TẤT TỰ ĐỘNG
                      </span>
                    )}
                  </div>
                </div>
              </CadCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
