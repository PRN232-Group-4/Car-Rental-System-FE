"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";
import DisplayLine from "../DisplayLine";

export default function HeroChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const headingLine1Ref = useRef<HTMLSpanElement>(null);
  const headingLine2Ref = useRef<HTMLSpanElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (headingLine1Ref.current) gsap.set(headingLine1Ref.current, { yPercent: 0, opacity: 1 });
        if (headingLine2Ref.current) gsap.set(headingLine2Ref.current, { yPercent: 0, opacity: 1 });
        if (carRef.current) gsap.set(carRef.current, { opacity: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // 1. Reveal H1 typography cleanly from offset
        if (headingLine1Ref.current && headingLine2Ref.current) {
          tl.fromTo(
            [headingLine1Ref.current, headingLine2Ref.current],
            { yPercent: 30, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.12, ease: "power4.out" },
            0.15
          );
        }

        // 2. Subtle car entrance
        if (carRef.current) {
          tl.fromTo(carRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1 }, 0.3);
        }

        // 3. Parallax scroll (scrub, NO pin)
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        if (carRef.current) scrollTl.to(carRef.current, { yPercent: -12, ease: "none" }, 0);
        if (mistRef.current) scrollTl.to(mistRef.current, { opacity: 0.55, ease: "none" }, 0);
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="gioi-thieu"
      className="relative w-full h-[100svh] min-h-[100svh] bg-ink-950 text-bone-100 overflow-hidden select-none"
    >
      {/* 1. Nền tranh Cảnh A nguyên bản liền mạch (object-cover object-center, z-10) */}
      <picture className="absolute inset-0 w-full h-full block pointer-events-none" style={{ zIndex: 10 }}>
        <source
          type="image/avif"
          srcSet="/assets/landing/scene-a-dalat-full-3840.avif 3840w, /assets/landing/scene-a-dalat-full-2880.avif 2880w, /assets/landing/scene-a-dalat-full-1920.avif 1920w, /assets/landing/scene-a-dalat-full-1280.avif 1280w, /assets/landing/scene-a-dalat-full-960.avif 960w, /assets/landing/scene-a-dalat-full-640.avif 640w"
        />
        <source
          type="image/webp"
          srcSet="/assets/landing/scene-a-dalat-full-3840.webp 3840w, /assets/landing/scene-a-dalat-full-2880.webp 2880w, /assets/landing/scene-a-dalat-full-1920.webp 1920w, /assets/landing/scene-a-dalat-full-1280.webp 1280w, /assets/landing/scene-a-dalat-full-960.webp 960w, /assets/landing/scene-a-dalat-full-640.webp 640w"
        />
        <img
          src="/assets/landing/scene-a-dalat-full-1920.webp"
          alt="Hoàng hôn Đà Lạt"
          className="w-full h-full object-cover object-center pointer-events-none"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
      </picture>

      {/* 2. Lớp xe a4-car (z-20, đặt dưới H1): khóa kích thước clamp(260px, 32vw, 540px), đỗ đúng trên mặt đường nhựa */}
      <div
        ref={carRef}
        style={{
          position: "absolute",
          bottom: "14%",
          left: "35%",
          width: "clamp(260px, 32vw, 540px)",
          zIndex: 20,
        }}
        className="pointer-events-none will-change-transform"
      >
        <picture className="w-full block">
          <source
            type="image/avif"
            srcSet="/assets/landing/a4-car-2000.avif 2000w, /assets/landing/a4-car-1920.avif 1920w, /assets/landing/a4-car-1280.avif 1280w, /assets/landing/a4-car-960.avif 960w, /assets/landing/a4-car-640.avif 640w"
          />
          <source
            type="image/webp"
            srcSet="/assets/landing/a4-car-2000.webp 2000w, /assets/landing/a4-car-1920.webp 1920w, /assets/landing/a4-car-1280.webp 1280w, /assets/landing/a4-car-960.webp 960w, /assets/landing/a4-car-640.webp 640w"
          />
          <img
            src="/assets/landing/a4-car-1280.webp"
            alt="Porsche"
            className="w-full h-auto object-contain pointer-events-none drop-shadow-2xl"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>

      {/* 3. Lớp sương a5-mist (z-25, screen, opacity 0.35) */}
      <div
        ref={mistRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 25,
          mixBlendMode: "screen",
          opacity: 0.35,
        }}
        className="w-full h-full pointer-events-none"
      >
        <img
          src="/assets/landing/a5-mist-1920.webp"
          alt=""
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* 4. Lớp chữ H1 (z-30): GÓC TRÊN BÊN TRÁI (top: 14%, left: 6%, max-width: 55vw) trên vùng bầu trời tối */}
      <div
        style={{
          position: "absolute",
          top: "14%",
          left: "6%",
          maxWidth: "55vw",
          zIndex: 30,
        }}
        className="pointer-events-none text-left"
      >
        <h1 className="font-display font-black uppercase text-bone-100 flex flex-col items-start leading-none">
          <DisplayLine
            ref={headingLine1Ref}
            wdth={70}
            style={{ fontSize: "var(--fs-h1-top)" }}
            className="tracking-tight text-bone-100 drop-shadow-lg"
          >
            SIÊU XE.
          </DisplayLine>
          <DisplayLine
            ref={headingLine2Ref}
            wdth={125}
            style={{ fontSize: "var(--fs-h1-bottom)" }}
            className="tracking-tight text-bone-100 drop-shadow-lg -mt-[1vw]"
          >
            KHÔNG VỘI.
          </DisplayLine>
        </h1>
      </div>
    </section>
  );
}
