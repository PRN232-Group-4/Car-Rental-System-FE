"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { SearchWidget } from "@/features/rentals";
import type { RentalMode } from "@/features/rentals/components/SearchWidget";
import { ArrowRight, ShieldCheck, Zap, Sparkles, Clock, RefreshCw } from "lucide-react";
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
    <section className="relative w-full pt-28 pb-16 px-4 sm:px-6 flex flex-col items-center overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
        aria-hidden="true"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-architectural-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#0f172a" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="#b45309" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-architectural-grid)" />
        </svg>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col items-center relative z-10">
        {/* Main Warm Editorial Stage Container */}
        <div className="w-full rounded-3xl sm:rounded-[40px] bg-[#f7f7f4] border border-line p-8 sm:p-14 lg:p-16 text-center shadow-[0_4px_24px_-8px_rgba(15,23,42,0.06)] relative overflow-hidden">
          {/* Subtle Ambient Accent Corner */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
            {/* Tech Micro-Badge (Warm Editorial Prestige) */}
            <div className="bg-white/80 border border-line px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-6 text-ink text-xs font-mono font-bold tracking-wider uppercase select-none shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
              <span className="text-[#b45309]">VRS 2026</span>
              <span className="text-ink-3">·</span>
              <span>HỆ THỐNG CHO THUÊ PHƯƠNG TIỆN TOÀN DIỆN</span>
            </div>

            {/* H1 Display: Be Vietnam Pro Ultra-Bold with flawless diacritics */}
            <h1
              ref={headingRef}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-ink tracking-tight leading-[1.08] mb-6 max-w-4xl"
            >
              Giải Pháp Thuê Xe Toàn Diện — Tự Do Khởi Hành Sang Trọng
            </h1>

            {/* Subtitle with high contrast and readable line length */}
            <p
              ref={subtitleRef}
              className="text-ink-2 text-base sm:text-lg md:text-xl max-w-3xl mx-auto font-normal leading-relaxed mb-8"
            >
              Hệ thống quản lý 4 nhóm phương tiện thuần điện & xăng cao cấp. Tùy chọn tự lái linh hoạt hoặc có tài xế chuyên nghiệp. Bàn giao số hóa 3 phút, kiểm định 2 chiều minh bạch và hoàn cọc tự động tức thì qua PayOS.
            </p>

            {/* CTA Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <Button
                as="a"
                href="#tim-xe"
                variant="amber-hero"
                size="lg"
                className="group text-base font-bold px-8 py-4 rounded-xl"
              >
                <span>Đặt xe trực tuyến</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>

              <Button
                as="a"
                href="#showroom-3d"
                variant="secondary"
                size="lg"
                className="text-base font-bold px-7 py-4 rounded-xl bg-white border border-line-strong text-ink hover:bg-[#f2f2ee]"
              >
                <Zap className="w-4 h-4 mr-2 text-[#b45309]" />
                <span>Trải nghiệm 3D Showroom</span>
              </Button>
            </div>

            {/* 3 Core System Assurances (Delivering Full Project Transparency) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl pt-6 border-t border-line text-left">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-line">
                <ShieldCheck className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">100% Chính Chủ</h4>
                  <p className="text-xs text-ink-3 mt-0.5">Bảo dưỡng tiêu chuẩn hãng, kiểm tra OBD-II trước mỗi chuyến đi.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-line">
                <Clock className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Bàn Giao 3 Phút</h4>
                  <p className="text-xs text-ink-3 mt-0.5">Xác thực CCCD & GPLX số hóa, mở cửa xe thông minh không chờ đợi.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-line">
                <RefreshCw className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Hoàn Cọc Tức Thì</h4>
                  <p className="text-xs text-ink-3 mt-0.5">Tự động đối soát và trả cọc qua PayOS ngay khi ký biên bản trả xe.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping Floating Search Console (.glass-2) */}
        <div id="tim-xe" className="relative z-20 -mt-10 sm:-mt-12 w-full max-w-5xl px-2 sm:px-4 scroll-mt-28">
          <SearchWidget onSearch={onSearchCriteriaChange} />
        </div>
      </div>
    </section>
  );
}
