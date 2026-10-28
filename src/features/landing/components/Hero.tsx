"use client";

import { useRef } from "react";
import { SearchWidget } from "@/features/rentals";
import type { RentalMode } from "@/features/rentals/components/SearchWidget";
import { ArrowUpRight } from "lucide-react";
import { useSplitReveal } from "@/lib/motion/text";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const subActionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const searchConsoleRef = useRef<HTMLDivElement>(null);

  // Thiết lập thứ bậc thị giác tức thì và dẫn dắt sự chú ý vào thông điệp cốt lõi.
  useSplitReveal(headingRef, {
    type: "lines",
    duration: 0.85,
    stagger: 0.08,
    ease: "power3.out",
    linesClass: "mask-reveal-safe overflow-hidden inline-block",
  });

  // Dẫn dắt nhịp đọc trơn tru từ tiêu đề xuống khu vực hành động chính và làm nổi bật hành động cốt lõi.
  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (stageRef.current) gsap.set(stageRef.current, { opacity: 1, scale: 1 });
        if (subtitleRef.current) gsap.set(subtitleRef.current, { opacity: 1, y: 0 });
        if (subActionRef.current) gsap.set(subActionRef.current, { opacity: 1, y: 0 });
        if (searchConsoleRef.current) gsap.set(searchConsoleRef.current, { opacity: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Tạo cảm giác chiều sâu thị giác phân tầng giữa lớp hình ảnh và lớp nội dung.
        if (stageRef.current) {
          tl.fromTo(
            stageRef.current,
            { opacity: 0, scale: 0.96, clipPath: "inset(4% 4% 4% 4% round 16px)" },
            { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 0.8 },
            0.15
          );
        }

        // Dẫn dắt nhịp đọc trơn tru từ tiêu đề xuống khu vực hành động chính.
        if (subtitleRef.current) {
          tl.fromTo(
            subtitleRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.6 },
            0.3
          );
        }

        if (subActionRef.current) {
          tl.fromTo(
            subActionRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5 },
            0.45
          );
        }

        // Làm nổi bật hành động quan trọng nhất trên màn hình đầu tiên (Above The Fold).
        if (searchConsoleRef.current) {
          tl.fromTo(
            searchConsoleRef.current,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.75 },
            0.35
          );
        }
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100dvh] pt-20 md:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between overflow-visible"
    >
      {/* 1. Architectural CAD Hairline Grid Background (Pure 1px lines, absolutely NO decorative text) */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="hero-cad-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-ink"
              />
              <circle cx="24" cy="24" r="0.75" fill="currentColor" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-cad-grid)" />
        </svg>
      </div>

      {/* Main Asymmetrical Stage Container (V3b Layout: Huge Typography Backdrop + Foreground Vehicle + Docked Console) */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-between relative z-10">
        {/* Stage Area */}
        <div className="relative w-full flex flex-col items-center pt-2 sm:pt-4">
          {/* Layer 1 (z-10): Huge Monumental Backdrop H1 Heading */}
          <h1
            ref={headingRef}
            className="font-display font-extrabold text-ink tracking-tight leading-[0.88] text-[clamp(2.75rem,8.5vw,9.5rem)] text-center w-full select-none opacity-95 relative z-10 pt-2"
          >
            Thuê xe thong dong.
          </h1>

          {/* Layer 2 (z-20): Vehicle Foreground Stage (Porsche 911 Carrera 4S Amber Gold) */}
          <div
            ref={stageRef}
            className="relative w-full max-w-[1220px] mx-auto -mt-10 sm:-mt-20 md:-mt-28 lg:-mt-36 z-20 flex justify-center pointer-events-none"
          >
            <picture className="w-full flex justify-center">
              <source
                type="image/avif"
                srcSet="/assets/hero-car/hero-car-composite-1920.avif 1920w, /assets/hero-car/hero-car-composite-1280.avif 1280w, /assets/hero-car/hero-car-composite-960.avif 960w, /assets/hero-car/hero-car-composite-640.avif 640w"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1220px"
              />
              <source
                type="image/webp"
                srcSet="/assets/hero-car/hero-car-composite-1920.webp 1920w, /assets/hero-car/hero-car-composite-1280.webp 1280w, /assets/hero-car/hero-car-composite-960.webp 960w, /assets/hero-car/hero-car-composite-640.webp 640w"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1220px"
              />
              <img
                src="/assets/hero-car/hero-car-composite-1280.webp"
                alt="Porsche Carrera 4S Thong Dong"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-auto max-h-[220px] sm:max-h-[340px] md:max-h-[420px] lg:max-h-[480px] object-contain drop-shadow-[0_28px_40px_rgba(0,0,0,0.20)]"
              />
            </picture>
          </div>
        </div>

        {/* Layer 3 (z-30): Sub-Headline Row (Neutral Copy based on SRS/BE truth matrix) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative z-30 mb-4 sm:mb-6">
          <div className="md:col-span-8 flex flex-col items-start text-left">
            <h2 className="font-sans font-bold text-ink tracking-tight text-lg sm:text-2xl md:text-[1.65rem] leading-snug">
              Sẵn sàng lăn bánh tại mọi trạm.
            </h2>
            <p
              ref={subtitleRef}
              className="font-sans text-ink-2 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mt-1 text-pretty"
            >
              Thuần điện và xăng cao cấp, tự lái hoặc có tài xế. Bàn giao số hóa, hoàn cọc minh bạch.
            </p>
          </div>

          <div ref={subActionRef} className="md:col-span-4 flex md:justify-end items-center">
            <a
              href="#showroom-3d"
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer group py-1"
            >
              <span>Xem xe 3D tương tác</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Layer 4 (z-40): SearchWidget Console (.glass-2) docked gracefully above fold */}
        <div
          ref={searchConsoleRef}
          id="tim-xe"
          className="relative z-40 w-full scroll-mt-28"
        >
          <SearchWidget onSearch={onSearchCriteriaChange} />
        </div>
      </div>
    </section>
  );
}
