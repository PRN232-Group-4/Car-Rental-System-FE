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
            { scale: 1.16, opacity: 0 },
            { scale: 1.02, opacity: 1, duration: 1.4, ease: "power3.out" },
            0
          );
        }

        if (spineRef.current) {
          introTl.fromTo(
            spineRef.current,
            { scaleY: 0 },
            { scaleY: 1, duration: 1.1, ease: "expo.inOut" },
            0.05
          );
        }

        if (horizonRuleRef.current) {
          introTl.fromTo(
            horizonRuleRef.current,
            { scaleX: 0 },
            { scaleX: 1, duration: 1.1, ease: "expo.inOut" },
            0.15
          );
        }

        if (headingLine1Ref.current && headingLine2Ref.current) {
          introTl.fromTo(
            [headingLine1Ref.current, headingLine2Ref.current],
            { yPercent: 115, rotateZ: 2, opacity: 0 },
            { yPercent: 0, rotateZ: 0, opacity: 1, duration: 1.15, stagger: 0.12 },
            0.12
          );
        }

        if (leadBlockRef.current) {
          introTl.fromTo(
            leadBlockRef.current,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.95 },
            0.35
          );
        }

        if (carRef.current) {
          introTl.fromTo(
            carRef.current,
            { xPercent: 16, yPercent: 6, scale: 0.9, opacity: 0 },
            { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, duration: 1.35 },
            0.2
          );
        }

        if (branchRef.current) {
          introTl.fromTo(
            branchRef.current,
            { xPercent: 20, yPercent: 12, opacity: 0 },
            { xPercent: 0, yPercent: 0, opacity: 1, duration: 1.4 },
            0.3
          );
        }

        // 2. 1:1 Scroll-Linked Multi-Plane Parallax (`scrub: true`)
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        if (bgImgRef.current) {
          scrollTl.to(bgImgRef.current, { yPercent: 16, scale: 1.14, ease: "none" }, 0);
        }
        if (line1WrapRef.current) {
          scrollTl.to(line1WrapRef.current, { xPercent: -10, yPercent: -18, ease: "none" }, 0);
        }
        if (line2WrapRef.current) {
          scrollTl.to(line2WrapRef.current, { xPercent: 12, yPercent: -12, ease: "none" }, 0);
        }
        if (leadBlockRef.current) {
          scrollTl.to(leadBlockRef.current, { yPercent: -22, opacity: 0.15, ease: "none" }, 0);
        }
        if (mistRef.current) {
          scrollTl.to(mistRef.current, { xPercent: -16, yPercent: -8, opacity: 0.7, ease: "none" }, 0);
        }
        if (carRef.current) {
          scrollTl.to(
            carRef.current,
            { xPercent: -14, yPercent: -10, scale: 1.08, ease: "none" },
            0
          );
        }
        if (branchRef.current) {
          scrollTl.to(
            branchRef.current,
            { xPercent: 10, yPercent: -32, scale: 1.14, ease: "none" },
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
      className="relative w-full h-[105svh] min-h-[820px] bg-ink-950 text-bone-100 overflow-hidden select-none flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-28 sm:pt-32 pb-20"
    >
      {/* Layer 1 (z-10): Full-Bleed Da Lat Dawn Woodcut Painting */}
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

      {/* Layer 2 (z-14): Constructivist Vertical Spine & Horizon Axis Hairline */}
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
        className="absolute left-0 right-0 bottom-[20%] h-[1px] bg-bone-100/25 pointer-events-none will-change-transform"
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

      {/* Layer 4 (z-20): Monumental Stepped Typography (Protected with pt-28/32 so it NEVER touches Navbar Logo!) */}
      <div
        style={{ zIndex: 20 }}
        className="relative w-full max-w-[1640px] mx-auto pointer-events-none"
      >
        <h1 className="font-display font-black uppercase text-bone-100 flex flex-col items-start">
          <div ref={line1WrapRef} className="will-change-transform">
            <DisplayLine
              ref={headingLine1Ref}
              wdth={74}
              style={{
                fontSize: "clamp(3.5rem, 9.2vw, 11.5rem)",
                lineHeight: 1.08,
              }}
              className="tracking-tight text-bone-100 whitespace-nowrap drop-shadow-2xl"
            >
              SIÊU XE.
            </DisplayLine>
          </div>
          <div
            ref={line2WrapRef}
            className="sm:ml-[4.5vw] -mt-[0.5vw] will-change-transform"
          >
            <DisplayLine
              ref={headingLine2Ref}
              wdth={114}
              style={{
                fontSize: "clamp(2.25rem, 5.8vw, 7.2rem)",
                lineHeight: 1.12,
              }}
              className="tracking-tight text-bone-100 whitespace-nowrap drop-shadow-2xl"
            >
              KHÔNG VỘI.
            </DisplayLine>
          </div>
        </h1>

        {/* High-Contrast Architectural Caption Plate (100% Readable over White Mountain Mist!) */}
        <div
          ref={leadBlockRef}
          className="mt-5 sm:ml-[4.5vw] max-w-md bg-ink-950/90 border-l-4 border-sun-600 p-4 sm:p-5 will-change-transform"
        >
          <div className="flex items-center justify-between text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-sun-400 mb-2">
            <span>PORSCHE · MERCEDES-AMG · LAMBORGHINI</span>
            <span>////</span>
          </div>
          <p className="font-sans text-xs sm:text-sm text-bone-100/95 leading-relaxed font-medium">
            Chọn trạm nhận xe, kích hoạt chìa khóa số và tự do cầm lái trên mọi cung đường.
          </p>
        </div>
      </div>

      {/* Layer 5 (z-25): Drifting Valley Mist */}
      <div
        ref={mistRef}
        aria-hidden="true"
        style={{ zIndex: 25, mixBlendMode: "screen", opacity: 0.42 }}
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
          width: "clamp(310px, 46vw, 780px)",
        }}
        className="relative ml-auto mr-[4%] sm:mr-[8%] -mb-2 pointer-events-none will-change-transform"
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
        className="hidden sm:block absolute -right-[2%] bottom-[8%] pointer-events-none will-change-transform"
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
