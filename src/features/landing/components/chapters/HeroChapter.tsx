"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";
import DisplayLine from "../DisplayLine";

export default function HeroChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const horizonRuleRef = useRef<HTMLDivElement>(null);
  const line1WrapRef = useRef<HTMLDivElement>(null);
  const line2WrapRef = useRef<HTMLDivElement>(null);
  const headingLine1Ref = useRef<HTMLSpanElement>(null);
  const headingLine2Ref = useRef<HTMLSpanElement>(null);
  const leadBlockRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            bgImgRef.current,
            spineRef.current,
            horizonRuleRef.current,
            headingLine1Ref.current,
            headingLine2Ref.current,
            leadBlockRef.current,
            carRef.current,
            branchRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. High-Impact Constructivist Entrance Choreography
        const introTl = gsap.timeline({ defaults: { ease: "expo.out" } });

        if (bgImgRef.current) {
          introTl.fromTo(
            bgImgRef.current,
            { scale: 1.18, opacity: 0 },
            { scale: 1.03, opacity: 1, duration: 1.5, ease: "power3.out" },
            0
          );
        }

        if (spineRef.current) {
          introTl.fromTo(
            spineRef.current,
            { scaleY: 0 },
            { scaleY: 1, duration: 1.2, ease: "expo.inOut" },
            0.05
          );
        }

        if (horizonRuleRef.current) {
          introTl.fromTo(
            horizonRuleRef.current,
            { scaleX: 0 },
            { scaleX: 1, duration: 1.2, ease: "expo.inOut" },
            0.15
          );
        }

        if (headingLine1Ref.current && headingLine2Ref.current) {
          introTl.fromTo(
            [headingLine1Ref.current, headingLine2Ref.current],
            { yPercent: 115, rotateZ: 2, opacity: 0 },
            { yPercent: 0, rotateZ: 0, opacity: 1, duration: 1.2, stagger: 0.12 },
            0.12
          );
        }

        if (leadBlockRef.current) {
          introTl.fromTo(
            leadBlockRef.current,
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.0 },
            0.35
          );
        }

        if (carRef.current) {
          introTl.fromTo(
            carRef.current,
            { xPercent: 16, yPercent: 8, scale: 0.88, opacity: 0 },
            { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, duration: 1.4 },
            0.2
          );
        }

        if (branchRef.current) {
          introTl.fromTo(
            branchRef.current,
            { xPercent: 22, yPercent: 14, opacity: 0 },
            { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, duration: 1.45 },
            0.3
          );
        }

        // 2. 1:1 Scroll-Linked Multi-Plane Compression as Chapter 2 Curtain Slides Over Hero (`scrub: true` = Zero Lag)
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        if (bgImgRef.current) {
          scrollTl.to(bgImgRef.current, { yPercent: 16, scale: 1.15, ease: "none" }, 0);
        }
        if (line1WrapRef.current) {
          scrollTl.to(line1WrapRef.current, { xPercent: -8, yPercent: -20, ease: "none" }, 0);
        }
        if (line2WrapRef.current) {
          scrollTl.to(line2WrapRef.current, { xPercent: 10, yPercent: -12, ease: "none" }, 0);
        }
        if (leadBlockRef.current) {
          scrollTl.to(leadBlockRef.current, { yPercent: -25, opacity: 0.1, ease: "none" }, 0);
        }
        if (mistRef.current) {
          scrollTl.to(mistRef.current, { xPercent: -15, yPercent: -8, opacity: 0.75, ease: "none" }, 0);
        }
        if (carRef.current) {
          scrollTl.to(
            carRef.current,
            { xPercent: -14, yPercent: -10, scale: 1.12, ease: "none" },
            0
          );
        }
        if (branchRef.current) {
          scrollTl.to(
            branchRef.current,
            { xPercent: 10, yPercent: -36, scale: 1.16, ease: "none" },
            0
          );
        }

        // 3. Interactive Pointer 3D Depth Parallax
        const el = containerRef.current;
        if (el && window.matchMedia("(pointer: fine)").matches) {
          const xBg = gsap.quickTo(bgImgRef.current, "x", { duration: 1.0, ease: "power3.out" });
          const yBg = gsap.quickTo(bgImgRef.current, "y", { duration: 1.0, ease: "power3.out" });
          const xCar = gsap.quickTo(carRef.current, "x", { duration: 0.6, ease: "power3.out" });
          const yCar = gsap.quickTo(carRef.current, "y", { duration: 0.6, ease: "power3.out" });
          const xBranch = gsap.quickTo(branchRef.current, "x", { duration: 0.5, ease: "power3.out" });
          const yBranch = gsap.quickTo(branchRef.current, "y", { duration: 0.5, ease: "power3.out" });

          const onMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            xBg(nx * 14);
            yBg(ny * 8);
            xCar(nx * -26);
            yCar(ny * -12);
            xBranch(nx * -42);
            yBranch(ny * -20);
          };

          el.addEventListener("mousemove", onMove, { passive: true });
          return () => el.removeEventListener("mousemove", onMove);
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
      style={{ zIndex: 10 }}
      className="sticky top-0 w-full h-[100svh] min-h-[760px] bg-ink-950 text-bone-100 overflow-hidden select-none flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-20 pb-20"
    >
      {/* Layer 1 (z-10): 100% Full-Bleed Edge-to-Edge Da Lat Dawn Woodcut (Zero Cream Border Bleed!) */}
      <picture className="absolute inset-0 w-full h-full block pointer-events-none" style={{ zIndex: 10 }}>
        <source
          type="image/avif"
          srcSet="/assets/landing/scene-a-dalat-full-3840.avif 3840w, /assets/landing/scene-a-dalat-full-2880.avif 2880w, /assets/landing/scene-a-dalat-full-1920.avif 1920w, /assets/landing/scene-a-dalat-full-1280.avif 1280w"
        />
        <source
          type="image/webp"
          srcSet="/assets/landing/scene-a-dalat-full-3840.webp 3840w, /assets/landing/scene-a-dalat-full-2880.webp 2880w, /assets/landing/scene-a-dalat-full-1920.webp 1920w, /assets/landing/scene-a-dalat-full-1280.webp 1280w"
        />
        <img
          ref={bgImgRef}
          src="/assets/landing/scene-a-dalat-full-1920.webp"
          alt="Bình minh cao nguyên Đà Lạt"
          className="w-full h-full object-cover object-center pointer-events-none will-change-transform"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
      </picture>

      {/* Layer 2 (z-14): Constructivist Vertical Racing Spine & Horizon Axis Hairline (Poster 1 & 2 DNA) */}
      <div
        ref={spineRef}
        aria-hidden="true"
        style={{ zIndex: 14, transformOrigin: "top center" }}
        className="hidden lg:block absolute top-0 bottom-0 left-[6.5%] w-[2px] bg-bone-100/20 pointer-events-none will-change-transform"
      />
      <div
        ref={horizonRuleRef}
        aria-hidden="true"
        style={{ zIndex: 14, transformOrigin: "left center" }}
        className="absolute left-0 right-0 bottom-[22%] h-[1px] bg-bone-100/25 pointer-events-none will-change-transform"
      />

      {/* Layer 3 (z-15): Lithograph Dust Texture */}
      <div
        aria-hidden="true"
        style={{ zIndex: 15, mixBlendMode: "screen", opacity: 0.42 }}
        className="absolute inset-0 pointer-events-none"
      >
        <img
          src="/assets/landing/a7-dust-1920.webp"
          alt=""
          className="w-full h-full object-cover pointer-events-none"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Layer 4 (z-20): Monumental Stepped Typography + Poster-Style Micro Cadence */}
      <div
        style={{ zIndex: 20 }}
        className="relative w-full max-w-[1640px] mx-auto pt-2 pointer-events-none"
      >
        <div className="flex items-center justify-between text-[10px] sm:text-xs tracking-[0.28em] uppercase font-sans font-bold text-bone-100/75 mb-4 pb-3 border-b border-bone-100/20">
          <span>THONG DONG // GRAND TOURING MONOGRAPH</span>
          <span className="hidden sm:inline text-sun-400">POWER · PRECISION · FREEDOM</span>
        </div>

        <h1 className="font-display font-black uppercase text-bone-100 flex flex-col items-start">
          <div ref={line1WrapRef} className="will-change-transform">
            <DisplayLine
              ref={headingLine1Ref}
              wdth={74}
              style={{
                fontSize: "clamp(3.75rem, 10vw, 12.5rem)",
                lineHeight: 1.08,
              }}
              className="tracking-tight text-bone-100 whitespace-nowrap drop-shadow-2xl"
            >
              SIÊU XE.
            </DisplayLine>
          </div>
          <div
            ref={line2WrapRef}
            className="sm:ml-[5vw] -mt-[0.5vw] will-change-transform"
          >
            <DisplayLine
              ref={headingLine2Ref}
              wdth={114}
              style={{
                fontSize: "clamp(2.4rem, 6.2vw, 7.8rem)",
                lineHeight: 1.12,
              }}
              className="tracking-tight text-bone-100 whitespace-nowrap drop-shadow-2xl"
            >
              KHÔNG VỘI.
            </DisplayLine>
          </div>
        </h1>

        <div
          ref={leadBlockRef}
          className="mt-5 sm:ml-[5vw] max-w-md space-y-3 will-change-transform"
        >
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-4 h-1.5 bg-sun-600 inline-block" />
            <span className="w-4 h-1.5 bg-sun-600 inline-block" />
            <span className="w-4 h-1.5 bg-sun-600 inline-block" />
            <span className="w-16 h-[2px] bg-bone-100/60 inline-block ml-2" />
          </div>
          <p className="font-sans text-sm sm:text-base text-bone-100/95 leading-relaxed font-medium drop-shadow-lg">
            Porsche, Mercedes-AMG, Lamborghini. Chọn trạm nhận xe, kích hoạt chìa khóa số và tự do cầm lái trên mọi cung đường.
          </p>
        </div>
      </div>

      {/* Layer 5 (z-25): Drifting Valley Mist */}
      <div
        ref={mistRef}
        aria-hidden="true"
        style={{ zIndex: 25, mixBlendMode: "screen", opacity: 0.45 }}
        className="absolute inset-0 pointer-events-none will-change-transform"
      >
        <img
          src="/assets/landing/a5-mist-1920.webp"
          alt=""
          className="w-full h-full object-cover pointer-events-none"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Layer 6 (z-30): Full Uncropped Lithograph Porsche 911 on the Mountain Road */}
      <div
        ref={carRef}
        style={{
          zIndex: 30,
          width: "clamp(320px, 50vw, 840px)",
        }}
        className="relative ml-auto mr-[4%] sm:mr-[8%] -mb-2 sm:-mb-4 pointer-events-none will-change-transform"
      >
        <picture className="w-full block">
          <source
            type="image/avif"
            srcSet="/assets/landing/a4-car-2000.avif 2000w, /assets/landing/a4-car-1920.avif 1920w, /assets/landing/a4-car-1280.avif 1280w, /assets/landing/a4-car-960.avif 960w"
          />
          <source
            type="image/webp"
            srcSet="/assets/landing/a4-car-2000.webp 2000w, /assets/landing/a4-car-1920.webp 1920w, /assets/landing/a4-car-1280.webp 1280w, /assets/landing/a4-car-960.webp 960w"
          />
          <img
            src="/assets/landing/a4-car-1280.webp"
            alt="Porsche 911 Carrera 4S"
            className="w-full h-auto object-contain pointer-events-none contrast-125 brightness-95 drop-shadow-2xl"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>

      {/* Layer 7 (z-35): Foreground Pine Branch Cutout */}
      <div
        ref={branchRef}
        aria-hidden="true"
        style={{
          zIndex: 35,
          width: "clamp(190px, 25vw, 440px)",
        }}
        className="hidden sm:block absolute -right-[2%] bottom-[6%] pointer-events-none will-change-transform"
      >
        <picture className="w-full block">
          <source
            type="image/avif"
            srcSet="/assets/landing/a6-fg-branch-1600.avif 1600w, /assets/landing/a6-fg-branch-1280.avif 1280w, /assets/landing/a6-fg-branch-960.avif 960w"
          />
          <source
            type="image/webp"
            srcSet="/assets/landing/a6-fg-branch-1600.webp 1600w, /assets/landing/a6-fg-branch-1280.webp 1280w, /assets/landing/a6-fg-branch-960.webp 960w"
          />
          <img
            src="/assets/landing/a6-fg-branch-1280.webp"
            alt=""
            className="w-full h-auto object-contain pointer-events-none"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>
    </section>
  );
}
