"use client";

import { useRef } from "react";
import { Stage } from "@/components/ui/Stage";
import { Button } from "@/components/ui/Button";
import { SearchWidget } from "@/features/rentals";
import type { RentalMode } from "@/features/rentals/components/SearchWidget";
import { ArrowRight, Zap } from "lucide-react";
import { useSplitReveal } from "@/lib/motion/text";

interface HeroProps {
  onSearchCriteriaChange?: (criteria: {
    mode: RentalMode;
    facilityId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  }) => void;
}

export default function Hero({ onSearchCriteriaChange }: HeroProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // Masked Horizon Split Reveal with Be Vietnam Pro
  useSplitReveal(headingRef, {
    type: "lines,words",
    duration: 0.95,
    stagger: 0.04,
    ease: "power4.out",
  });

  return (
    <section className="relative w-full pt-20 pb-16 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        {/* Stage Photo: Cyber-Minimalist EV on highway with deep flat scrim per A4.1 & A6 */}
        <Stage
          variant="photo"
          imageUrl="/assets/hero-ev-dark.jpg"
          imageAlt="Hành trình xe điện Thong Dong All-Electric Touring"
          className="rounded-3xl sm:rounded-[40px] min-h-[520px] sm:min-h-[580px] flex flex-col justify-center items-center px-6 sm:px-12 text-center border border-white/10 overflow-hidden shadow-e3"
        >
          {/* Deep dark flat scrim for absolute optical contrast */}
          <div className="absolute inset-0 bg-[#0E1A16]/65 pointer-events-none z-[1]" />

          <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto py-12 sm:py-16">
            {/* Tech Micro-Badge (Bilingual Flex) */}
            <div className="glass-1 px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-6 text-white text-xs font-mono font-bold tracking-wider uppercase border border-white/20 select-none shadow-e1">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>ALL-ELECTRIC FLEET 2026</span>
            </div>

            {/* H1 Display: Be Vietnam Pro Ultra-Bold, guaranteed 2 lines, flawless diacritics */}
            <h1
              ref={headingRef}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6 max-w-4xl selection:bg-emerald-500/30"
            >
              Thuê Xe Thuần Điện Thông Minh — Khởi Hành Tự Do
            </h1>

            {/* Subtitle with high contrast and readable line length */}
            <p
              ref={subtitleRef}
              className="text-white/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed mb-8"
            >
              Đội xe thuần điện 100% chính chủ, quy trình bàn giao số hoá 3 phút và hoàn cọc tức thì qua PayOS. Trải nghiệm di chuyển êm ái trên mọi cung đường Việt Nam.
            </p>

            {/* Exactly ONE primary CTA per A6 specification with magnetic pull and tactile physics */}
            <div className="flex items-center justify-center">
              <Button
                as="a"
                href="#tim-xe"
                variant="primary"
                size="lg"
                className="group shadow-e3 text-base font-bold px-8 py-4 rounded-xl border border-emerald-400/40"
              >
                <span>Đặt xe ngay</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </Stage>

        {/* Overlapping Floating Search Console (.glass-2) */}
        <div id="tim-xe" className="relative z-20 -mt-14 sm:-mt-16 w-full max-w-5xl px-2 sm:px-4 scroll-mt-28">
          <SearchWidget onSearch={onSearchCriteriaChange} />
        </div>
      </div>
    </section>
  );
}
