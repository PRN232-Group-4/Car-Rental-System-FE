"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { SearchWidget } from "@/features/rentals";
import type { RentalMode } from "@/features/rentals/components/SearchWidget";
import { ArrowUpRight, ShieldCheck, Compass } from "lucide-react";
import { useSplitReveal } from "@/lib/motion/text";
import { useMagneticHover } from "@/lib/motion/hover";
import { useCountUp } from "@/lib/motion/number";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const Hero3DCanvas = dynamic(() => import("./Hero3DCanvas"), {
  ssr: false,
  loading: () => (
    <picture className="w-full flex justify-center pointer-events-none">
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
        className="w-full h-auto max-h-[260px] sm:max-h-[340px] md:max-h-[420px] lg:max-h-[480px] object-contain"
      />
    </picture>
  ),
});

export interface HeroSearchCriteria {
  mode: RentalMode;
  facilityId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

interface HeroProps {
  onSearchCriteriaChange?: (criteria: HeroSearchCriteria) => void;
}

export default function Hero({ onSearchCriteriaChange }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingWrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const leftWordRef = useRef<HTMLSpanElement>(null);
  const rightWordRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const searchConsoleRef = useRef<HTMLDivElement>(null);
  const ctaLinkRef = useRef<HTMLAnchorElement>(null);
  const powerCounterRef = useRef<HTMLSpanElement>(null);

  useMagneticHover(ctaLinkRef);
  useCountUp(powerCounterRef, 443, { duration: 1.4, formatter: (val) => `${val} HP` });

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (stageRef.current) gsap.set(stageRef.current, { opacity: 1, scale: 1, yPercent: 0 });
        if (headingWrapRef.current) gsap.set(headingWrapRef.current, { yPercent: 0 });
        if (leftWordRef.current) gsap.set(leftWordRef.current, { xPercent: 0, opacity: 1, y: 0 });
        if (rightWordRef.current) gsap.set(rightWordRef.current, { xPercent: 0, opacity: 1, y: 0 });
        if (searchConsoleRef.current) gsap.set(searchConsoleRef.current, { opacity: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        if (leftWordRef.current && rightWordRef.current) {
          tl.fromTo(
            [leftWordRef.current, rightWordRef.current],
            { opacity: 0, y: 35 },
            { opacity: 1, y: 0, duration: 0.85, stagger: 0.12, ease: "power3.out" },
            0.05
          );
        }

        if (stageRef.current) {
          tl.fromTo(
            stageRef.current,
            { opacity: 0, scale: 0.95, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.95 },
            0.15
          );
        }

        if (searchConsoleRef.current) {
          tl.fromTo(
            searchConsoleRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.75 },
            0.4
          );
        }

        if (headingWrapRef.current) {
          gsap.to(headingWrapRef.current, {
            yPercent: -14,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        // Kinematic Portal Split Effect: Khi cuộn xuống, 2 chữ tách ngang sang 2 bên
        if (leftWordRef.current && rightWordRef.current) {
          gsap.to(leftWordRef.current, {
            xPercent: -22,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
          gsap.to(rightWordRef.current, {
            xPercent: 22,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100dvh] pt-16 md:pt-20 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-12 flex flex-col justify-between overflow-visible"
    >
      {/* Top Editorial Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3.5 mb-6 text-xs text-ink-2">
        <div className="flex items-center gap-3">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-sans font-semibold text-ink">
            Hệ thống thuê xe tự lái &amp; có tài xế cao cấp
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:flex items-center gap-1.5 text-ink-3">
            <Compass aria-hidden="true" className="w-3.5 h-3.5 text-primary" />
            <span>Nhận xe tại trạm hoặc giao tận nơi</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-ink">
            <ShieldCheck aria-hidden="true" className="w-3.5 h-3.5 text-primary" />
            <span>Hoàn cọc tự động qua PayOS</span>
          </span>
        </div>
      </div>

      {/* 1920px Edge Micro-Typography Columns */}
      <div aria-hidden="true" className="hidden 2xl:flex flex-col justify-between absolute left-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="space-y-1.5">
          <div className="w-8 h-[2px] bg-primary" />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-3 font-semibold block max-w-[150px] leading-relaxed">
            CHỈ SỐ AN TOÀN // 100% BẢO HIỂM HAI CHIỀU
          </span>
        </div>
      </div>
      <div aria-hidden="true" className="hidden 2xl:flex flex-col justify-between absolute right-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-right items-end">
        <div className="space-y-1.5 flex flex-col items-end">
          <div className="w-8 h-[2px] bg-primary" />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-3 font-semibold block max-w-[160px] leading-relaxed">
            QUY CHUẨN SỐ HÓA // BÀN GIAO 60S &amp; HOÀN CỌC PAYOS 15P
          </span>
        </div>
      </div>

      {/* Main Architectural Stage */}
      <div className="w-full mx-auto flex flex-col relative z-10">
        {/* Typographic Focal Point */}
        <div ref={headingWrapRef} className="w-full will-change-transform relative z-10 text-center">
          <h1
            ref={headingRef}
            className="font-display font-extrabold text-ink tracking-tight leading-[0.88] text-[clamp(4.5rem,8.8vw,9.75rem)] w-full select-none flex flex-wrap items-baseline justify-center gap-x-6 sm:gap-x-8"
          >
            <span ref={leftWordRef} className="inline-block will-change-transform">
              Thuê xe
            </span>
            <span
              ref={rightWordRef}
              className="font-display font-extrabold tracking-tight text-ink inline-block will-change-transform"
            >
              thong dong<span className="text-primary">.</span>
            </span>
          </h1>
        </div>

        {/* 3D Porsche Carrera 4S Stage — Căn tâm chuẩn xác trên mặt phẳng bóng đổ & Monolith Disc */}
        <div
          ref={stageRef}
          className="relative w-full max-w-6xl mx-auto -mt-4 sm:-mt-6 md:-mt-8 z-20 flex justify-center bg-transparent overflow-visible will-change-transform h-[480px] xl:h-[520px]"
        >
          {/* Monolith Architectural Circle & Vertical Axis Background */}
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-visible">
            {/* Vertical Axis Ribbon */}
            <div className="absolute top-[-40px] bottom-[-40px] w-10 bg-primary/10 dark:bg-primary/15 border-x border-primary/25 pointer-events-none" />
            {/* Monolith Circle Disc */}
            <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] lg:w-[460px] lg:h-[460px] rounded-full bg-sunken/80 dark:bg-surface-raised/60 border border-line-strong shadow-inner flex items-center justify-center">
              {/* Inner Hairline Concentric Ring */}
              <div className="w-[82%] h-[82%] rounded-full border border-dashed border-line/60" />
            </div>
          </div>

          <div className="relative z-10 w-full h-full flex justify-center">
            <Hero3DCanvas />
          </div>
        </div>

        {/* Value Proposition & Specs Counterbalance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end relative z-30 mt-2 mb-6 pt-5 border-t border-line">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h2 className="font-display font-bold text-ink tracking-tight text-xl sm:text-2xl leading-snug text-balance">
              Trải nghiệm những dòng xe biểu tượng với quy trình bàn giao số hóa trong 60 giây.
            </h2>
            <p className="font-sans text-ink-2 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mt-1.5 text-balance">
              Đội xe thuần điện và thể thao hiệu năng cao được kiểm định đa điểm trước mỗi hành trình. Minh bạch chi phí, không phí ẩn.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-5">
            <div className="flex items-center gap-5 px-4 py-2.5 rounded-xl bg-surface border border-line-strong">
              <div>
                <span className="text-[11px] font-sans text-ink-3 block">Tiêu điểm hôm nay</span>
                <span className="font-display font-bold text-sm text-ink">Porsche 911 Carrera 4S</span>
              </div>
              <div className="h-7 w-[1px] bg-line" />
              <div>
                <span className="text-[11px] font-sans text-ink-3 block">Công suất</span>
                <span ref={powerCounterRef} className="font-mono font-bold text-sm text-primary tabular-nums">
                  443 HP
                </span>
              </div>
            </div>

            <a
              ref={ctaLinkRef}
              href="#showroom-3d"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stage-ink text-white font-sans text-xs sm:text-sm font-semibold hover:bg-primary transition-colors cursor-pointer group shrink-0"
            >
              <span>Khám phá ngoại thất 3D</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Live Search Console */}
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
