"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const Hero3DCanvas = dynamic(() => import("../Hero3DCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-bone-100/40 font-mono text-xs">
      LOADING 3D SCENE...
    </div>
  ),
});

export default function HeroChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const headingLine1Ref = useRef<HTMLSpanElement>(null);
  const headingLine2Ref = useRef<HTMLSpanElement>(null);
  const sunDiscRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (headingLine1Ref.current) gsap.set(headingLine1Ref.current, { yPercent: 0, opacity: 1 });
        if (headingLine2Ref.current) gsap.set(headingLine2Ref.current, { yPercent: 0, opacity: 1 });
        if (sunDiscRef.current) gsap.set(sunDiscRef.current, { scale: 1, opacity: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Line-mask reveals
        if (headingLine1Ref.current && headingLine2Ref.current) {
          tl.fromTo(
            [headingLine1Ref.current, headingLine2Ref.current],
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out" },
            0.1
          );
        }

        // Sun disc rising scale reveal
        if (sunDiscRef.current) {
          tl.fromTo(
            sunDiscRef.current,
            { scale: 0.85, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.4, ease: "power3.out" },
            0.2
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
      id="gioi-thieu"
      className="relative w-full min-h-[100dvh] bg-ink-950 text-bone-100 overflow-hidden flex flex-col justify-between pt-24 sm:pt-28 pb-16 px-6 sm:px-12 select-none"
    >
      {/* Top Editorial Micro Meta (Max 4 micro labels per viewport) */}
      <div className="relative z-20 flex items-center justify-between border-b border-bone-100/15 pb-4 text-xs font-mono tracking-wider text-bone-100/60 uppercase">
        <div className="flex items-center gap-4">
          <span className="text-sun-400 font-bold">01 / CHƯƠNG I</span>
          <span className="hidden sm:inline">RISO GRAND TOUR</span>
        </div>
        <div className="flex items-center gap-4">
          <span>TP. HỒ CHÍ MINH</span>
          <span className="hidden md:inline">BÀN GIAO SỐ HÓA</span>
        </div>
      </div>

      {/* Monumental Sun Disc (~90vw, cut off at bottom/horizon) */}
      <div
        ref={sunDiscRef}
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 top-[32%] w-[92vw] max-w-[1150px] aspect-square rounded-full bg-sun-600 pointer-events-none z-0 will-change-transform"
      />

      {/* Horizon line at ~58% viewport height */}
      <div
        aria-hidden="true"
        className="absolute top-[58%] inset-x-0 border-b border-bone-100/20 z-10 pointer-events-none"
      />

      {/* Central Typographic Stage & 3D Car */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center my-auto">
        {/* H1 Typographic Focal Point */}
        <div className="w-full text-center mb-[-2rem] sm:mb-[-3.5rem] relative z-20">
          <h1 className="font-display font-black uppercase tracking-tight text-[clamp(3.8rem,14vw,17rem)] leading-[1.05] pt-[0.1em] text-bone-100 flex flex-col items-center justify-center">
            <span className="overflow-hidden block py-1">
              <span ref={headingLine1Ref} className="block will-change-transform">
                SIÊU XE.
              </span>
            </span>
            <span className="overflow-hidden block py-1 -mt-[2vw]">
              <span
                ref={headingLine2Ref}
                className="block will-change-transform font-serif italic lowercase font-normal text-sun-400"
              >
                không vội.
              </span>
            </span>
          </h1>
        </div>

        {/* 3D Porsche resting on the horizon */}
        <div className="relative z-20 w-full h-[360px] sm:h-[440px] md:h-[500px] flex items-center justify-center overflow-visible pointer-events-auto">
          <Hero3DCanvas />
        </div>
      </div>

      {/* Bottom Subtext / Micro Info */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-bone-100/50 border-t border-bone-100/10 pt-4">
        <span className="font-sans">
          Đội xe biểu tượng · Quy chuẩn kỹ thuật số đa điểm · Bàn giao tức thì
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-sun-400">
          CUỘN ĐỂ KHỞI HÀNH ↓
        </span>
      </div>
    </section>
  );
}
