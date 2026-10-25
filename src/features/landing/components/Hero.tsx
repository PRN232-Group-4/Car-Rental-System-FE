"use client";

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SearchWidget } from "@/features/rentals";
import type { RentalMode } from "@/features/rentals/components/SearchWidget";
import { ArrowRight, ShieldCheck, Clock, RefreshCw, Car, Gauge, SlidersHorizontal } from "lucide-react";
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
    <section className="relative w-full pt-28 pb-16 px-4 sm:px-6 flex flex-col items-center overflow-visible">
      {/* 1. Automotive Blueprint & Aero Vector Background SVGs */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Engineering Coordinate Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-cad-grid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#0f172a" strokeWidth="1" />
              <path d="M 32 0 L 32 64 M 0 32 L 64 32" fill="none" stroke="#0f172a" strokeWidth="0.5" strokeDasharray="2,4" />
              <circle cx="32" cy="32" r="1" fill="#b45309" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-cad-grid)" />
        </svg>

        {/* Aerodynamic Streamlines & Chassis Contour Sketch Lines */}
        <svg 
          className="absolute top-12 left-1/2 -translate-x-1/2 w-[1400px] h-[720px] max-w-none opacity-[0.14]" 
          viewBox="0 0 1400 720" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Aero Flow Curves */}
          <path d="M 50 180 C 350 140, 650 90, 950 160 C 1150 210, 1300 240, 1380 260" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="8 6" />
          <path d="M 80 230 C 400 190, 700 130, 1000 200 C 1180 240, 1280 280, 1360 310" stroke="#b45309" strokeWidth="1.5" />
          <path d="M 120 280 C 450 250, 750 180, 1050 250 C 1220 290, 1320 340, 1350 370" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4" />
          
          {/* Chassis Reference Silhouette Sketch Lines */}
          <path d="M 220 450 C 260 380, 340 330, 480 320 C 600 310, 720 260, 860 270 C 980 280, 1080 340, 1140 400 C 1170 430, 1180 470, 1170 510 L 220 510 Z" stroke="#0f172a" strokeWidth="1" strokeDasharray="6 6" />
          
          {/* Front & Rear Wheel Center Alignment Marks */}
          <circle cx="360" cy="480" r="42" stroke="#b45309" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="360" cy="480" r="4" fill="#b45309" />
          <circle cx="1020" cy="480" r="42" stroke="#b45309" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="1020" cy="480" r="4" fill="#b45309" />
          
          {/* Wheelbase Dimension Line */}
          <line x1="360" y1="540" x2="1020" y2="540" stroke="#0f172a" strokeWidth="1.2" />
          <path d="M 360 534 L 360 546 M 1020 534 L 1020 546" stroke="#0f172a" strokeWidth="1.2" />
          <text x="690" y="558" fill="#0f172a" fontSize="11" fontFamily="monospace" textAnchor="middle" letterSpacing="1.5">WHEELBASE: 2,900 MM</text>

          {/* CAD Precision Crosshairs & Coordinates */}
          <g stroke="#0f172a" strokeWidth="1">
            <line x1="160" y1="90" x2="180" y2="90" /><line x1="170" y1="80" x2="170" y2="100" />
            <text x="190" y="94" fill="#0f172a" fontSize="10" fontFamily="monospace">REF: VN-SGN-01</text>

            <line x1="1240" y1="90" x2="1260" y2="90" /><line x1="1250" y1="80" x2="1250" y2="100" />
            <text x="1150" y="94" fill="#0f172a" fontSize="10" fontFamily="monospace">SCALE 1:1 [METRIC]</text>
          </g>
        </svg>
      </div>

      {/* z-30: giữ console + dropdown của SearchWidget trên các section sau (z-10/z-20) nhưng dưới navbar/modal (z-50). */}
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center relative z-30">
        {/* 3. H1 Display: Be Vietnam Pro Ultra-Bold with clean typographic flow */}
        <h1
          ref={headingRef}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-ink text-center tracking-tight leading-[1.04] mb-5 max-w-5xl"
        >
          <span className="block">Hành Trình Tự Do,</span>
          <span className="block text-ink-2 dark:text-ink/90">Trải Nghiệm Tối Thượng</span>
        </h1>

        {/* 4. Subtitle: Single concise, high-contrast narrative statement */}
        <p
          ref={subtitleRef}
          className="text-ink-2 text-base sm:text-lg md:text-xl max-w-3xl text-center font-normal leading-relaxed mb-8 text-pretty"
        >
          Hệ thống quản lý 4 nhóm phương tiện thuần điện & xăng cao cấp. Tùy chọn tự lái linh hoạt hoặc có tài xế riêng. Theo dõi đặt xe, kiểm tra xe và thanh toán trong tài khoản.
        </p>

        {/* 5. Direct Action CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <Button
            as="a"
            href="#tim-xe"
            variant="amber-hero"
            size="lg"
            className="group text-sm sm:text-base font-bold px-8 py-4 rounded-xl shadow-md"
          >
            <span>Tìm và đặt xe ngay</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>

          <Button
            as="a"
            href="#showroom-3d"
            variant="secondary"
            size="lg"
            className="text-sm sm:text-base font-bold px-7 py-4 rounded-xl bg-surface border border-line-strong text-ink hover:bg-sunken"
          >
            <Car className="w-4 h-4 mr-2 text-primary" />
            <span>Khám phá 3D Showroom</span>
          </Button>
        </div>

        {/* 6. Central Cinematic Vehicle Stage with Automotive Blueprint Overlay */}
        <div className="relative w-full max-w-5xl my-4">
          {/* Architectural Blueprint CAD Frame */}
          <div className="relative rounded-3xl overflow-hidden border border-line-strong bg-surface shadow-[0_12px_40px_-15px_rgba(15,23,42,0.12)]">
            {/* Aspect ratio frame for high-res vehicle imagery */}
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] min-h-[260px] sm:min-h-[340px]">
              <Image
                src="/assets/hero-ev.jpg"
                alt="Thong Dong Fleet - Xe Sang Thể Thao Đương Đại"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
              
              {/* Flat architectural scrim to ground vehicle and display CAD telemetry (Strict A13 compliance: No gradients) */}
              <div 
                className="absolute inset-0 bg-stage-ink/25 pointer-events-none"
                aria-hidden="true"
              />

              {/* Technical Blueprint Corner Dimension Brackets */}
              <div className="absolute top-4 left-4 font-mono text-xs text-white/90 glass-ink px-2.5 py-1 rounded border border-white/20 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-primary-graphic" />
                <span>CHASSIS REF: 911-EV-SPECS</span>
              </div>

              <div className="absolute top-4 right-4 font-mono text-xs text-white/90 glass-ink px-2.5 py-1 rounded border border-white/20 flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-primary-graphic" />
                <span>AERO Cd: 0.22 · AWD</span>
              </div>

              {/* Bottom Telemetry Strip across vehicle visual */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 text-white text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-bold tracking-wide">100% SẴN SÀNG KHỞI HÀNH</span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-white/80 text-xs">
                  <span>DÀI: 4,963 MM</span>
                  <span>·</span>
                  <span>RỘNG: 1,966 MM</span>
                  <span>·</span>
                  <span>PIN 800V ULTRA-CHARGE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Minimal Inline Trust Strip (Pure typographic elegance, no nested card boxes) */}
        <div 
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-4 mb-10 text-xs sm:text-sm text-ink-2"
          suppressHydrationWarning
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span className="font-bold text-ink">100% Xe Chính Chủ</span>
            <span className="text-ink-3 font-mono text-xs hidden sm:inline">(Đội xe vận hành)</span>
          </div>

          <div className="hidden sm:inline-block text-line-strong font-light">/</div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span className="font-bold text-ink">Biên Bản Bàn Giao</span>
            <span className="text-ink-3 font-mono text-xs hidden sm:inline">(Biên bản số)</span>
          </div>

          <div className="hidden sm:inline-block text-line-strong font-light">/</div>

          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-primary shrink-0" />
            <span className="font-bold text-ink">Theo Dõi Quyết Toán</span>
            <span className="text-ink-3 font-mono text-xs hidden sm:inline">(Theo đơn thuê)</span>
          </div>
        </div>

        {/* 8. Overlapping Floating Search Console (.glass-2) */}
        <div id="tim-xe" className="relative z-20 w-full max-w-5xl px-2 sm:px-4 scroll-mt-28">
          <SearchWidget onSearch={onSearchCriteriaChange} />
        </div>
      </div>
    </section>
  );
}
