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

      {/* Main Asymmetrical Stage Container (3-Layer Sandwich Structure) */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-between relative z-10">
        {/* Top Horizon Section: Asymmetrical Split between H1 Typography and Vehicle Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end relative pt-2 sm:pt-4">
          {/* Layer 1 (z-10): Left-aligned Headline, Subtitle, and Secondary Link (Behind car stage) */}
          <div className="lg:col-span-10 lg:row-start-1 lg:col-start-1 flex flex-col items-start text-left relative z-10">
            <h1
              ref={headingRef}
              className="font-display font-extrabold text-ink tracking-tight leading-[1.14] text-[clamp(2rem,6.5vw,2.5rem)] sm:text-[clamp(2.5rem,4.5vw,4.5rem)] mb-4 text-balance"
            >
              <span className="block">Thuê xe thong dong.</span>
              <span className="block text-ink-2 dark:text-ink/90">Nhận xe trong 3 phút.</span>
            </h1>

            <p
              ref={subtitleRef}
              className="font-sans text-ink-2 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mb-4 text-pretty"
            >
              Thuần điện và xăng cao cấp, tự lái hoặc có tài xế. Bàn giao số hóa, hoàn cọc tự động.
            </p>

            <div ref={subActionRef} className="pt-1">
              <a
                href="#showroom-3d"
                className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-ink-2 hover:text-primary transition-colors cursor-pointer group py-1"
              >
                <span>Xem xe 3D</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Layer 2 (z-20): Vehicle Stage Container (Reserved for Phase 5 3D Showroom Turntable) */}
          <div
            ref={stageRef}
            className="lg:col-span-4 lg:col-start-9 lg:row-start-1 relative z-20 w-full flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md lg:max-w-none aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-line-strong bg-surface shadow-[0_16px_36px_-12px_rgba(15,23,42,0.14)]">
              {/* Responsive multi-resolution Hero Image (640w, 960w, 1280w in AVIF, WebP, JPEG) */}
              <picture>
                <source
                  type="image/avif"
                  srcSet="/assets/hero/hero-hai-van-640w.avif 640w, /assets/hero/hero-hai-van-960w.avif 960w, /assets/hero/hero-hai-van-1280w.avif 1280w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 403px"
                />
                <source
                  type="image/webp"
                  srcSet="/assets/hero/hero-hai-van-640w.webp 640w, /assets/hero/hero-hai-van-960w.webp 960w, /assets/hero/hero-hai-van-1280w.webp 1280w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 403px"
                />
                <img
                  src="/assets/hero/hero-hai-van-1280w.jpg"
                  srcSet="/assets/hero/hero-hai-van-640w.jpg 640w, /assets/hero/hero-hai-van-960w.jpg 960w, /assets/hero/hero-hai-van-1280w.jpg 1280w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 403px"
                  alt="Cung đường đèo Hải Vân - Trải nghiệm thong dong"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />
              </picture>
              <div
                className="absolute inset-0 bg-stage-ink/15 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Layer 3 (z-30): SearchWidget Console (.glass-2) docked gracefully above fold */}
        <div
          ref={searchConsoleRef}
          id="tim-xe"
          className="relative z-30 w-full mt-6 lg:mt-8 scroll-mt-28"
        >
          <SearchWidget onSearch={onSearchCriteriaChange} />
        </div>
      </div>
    </section>
  );
}
