"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";
import DisplayLine from "../DisplayLine";

export default function HeroChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const line1WrapRef = useRef<HTMLDivElement>(null);
  const line2WrapRef = useRef<HTMLDivElement>(null);
  const headingLine1Ref = useRef<HTMLSpanElement>(null);
  const headingLine2Ref = useRef<HTMLSpanElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
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
            headingLine1Ref.current,
            headingLine2Ref.current,
            leadRef.current,
            carRef.current,
            branchRef.current,
            bgImgRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Multi-Plane Entrance Choreography
        const introTl = gsap.timeline({ defaults: { ease: "expo.out" } });

        if (bgImgRef.current) {
          introTl.fromTo(
            bgImgRef.current,
            { scale: 1.15, opacity: 0 },
            { scale: 1.02, opacity: 1, duration: 1.6, ease: "power3.out" },
            0
          );
        }

        if (headingLine1Ref.current && headingLine2Ref.current) {
          introTl.fromTo(
            [headingLine1Ref.current, headingLine2Ref.current],
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.25, stagger: 0.14 },
            0.15
          );
        }

        if (leadRef.current) {
          introTl.fromTo(
            leadRef.current,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.0 },
            0.4
          );
        }

        if (carRef.current) {
          introTl.fromTo(
            carRef.current,
            { xPercent: 14, yPercent: 8, scale: 0.9, opacity: 0 },
            { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, duration: 1.4 },
            0.25
          );
        }

        if (branchRef.current) {
          introTl.fromTo(
            branchRef.current,
            { xPercent: 18, yPercent: 12, opacity: 0 },
            { xPercent: 0, yPercent: 0, opacity: 1, duration: 1.5 },
            0.35
          );
        }

        // 2. Deep Multi-Layer Scroll Parallax Scrub (5 distinct depth speeds)
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });

        if (bgImgRef.current) {
          scrollTl.to(bgImgRef.current, { yPercent: 20, scale: 1.16, ease: "none" }, 0);
        }
        if (line1WrapRef.current) {
          scrollTl.to(line1WrapRef.current, { xPercent: -14, yPercent: -28, ease: "none" }, 0);
        }
        if (line2WrapRef.current) {
          scrollTl.to(line2WrapRef.current, { xPercent: 14, yPercent: -18, ease: "none" }, 0);
        }
        if (leadRef.current) {
          scrollTl.to(leadRef.current, { yPercent: -35, opacity: 0, ease: "none" }, 0);
        }
        if (mistRef.current) {
          scrollTl.to(mistRef.current, { xPercent: -16, yPercent: -10, opacity: 0.75, ease: "none" }, 0);
        }
        if (carRef.current) {
          scrollTl.to(
            carRef.current,
            { xPercent: -10, yPercent: -16, scale: 1.1, ease: "none" },
            0
          );
        }
        if (branchRef.current) {
          scrollTl.to(
            branchRef.current,
            { xPercent: 8, yPercent: -34, scale: 1.14, ease: "none" },
            0
          );
        }

        // 3. Interactive Pointer Parallax (3D Depth Response on Mouse Move)
        const el = containerRef.current;
        if (el && window.matchMedia("(pointer: fine)").matches) {
          const xBg = gsap.quickTo(bgImgRef.current, "x", { duration: 1.2, ease: "power3.out" });
          const yBg = gsap.quickTo(bgImgRef.current, "y", { duration: 1.2, ease: "power3.out" });
          const xCar = gsap.quickTo(carRef.current, "x", { duration: 0.8, ease: "power3.out" });
          const yCar = gsap.quickTo(carRef.current, "y", { duration: 0.8, ease: "power3.out" });
          const xBranch = gsap.quickTo(branchRef.current, "x", { duration: 0.6, ease: "power3.out" });
          const yBranch = gsap.quickTo(branchRef.current, "y", { duration: 0.6, ease: "power3.out" });

          const onMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            xBg(nx * 10);
            yBg(ny * 6);
            xCar(nx * -22);
            yCar(ny * -10);
            xBranch(nx * -38);
            yBranch(ny * -18);
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
      className="relative w-full h-[105svh] min-h-[760px] bg-ink-950 text-bone-100 overflow-hidden select-none flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-24 pb-24"
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

      {/* Layer 2 (z-15): Lithograph Dust Texture */}
      <div
        aria-hidden="true"
        style={{ zIndex: 15, mixBlendMode: "screen", opacity: 0.4 }}
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

      {/* Layer 3 (z-20): Unboxed Monumental Typography in the Calm Upper Sky */}
      <div
        style={{ zIndex: 20 }}
        className="relative w-full max-w-7xl mx-auto pt-2 sm:pt-4 pointer-events-none"
      >
        <h1 className="font-display font-black uppercase text-bone-100 flex flex-col items-start leading-none">
          <div ref={line1WrapRef} className="will-change-transform">
            <DisplayLine
              ref={headingLine1Ref}
              wdth={74}
              style={{ fontSize: "clamp(3.5rem, 9.5vw, 11.5rem)" }}
              className="tracking-tight text-bone-100 whitespace-nowrap"
            >
              SIÊU XE.
            </DisplayLine>
          </div>
          <div
            ref={line2WrapRef}
            className="sm:ml-[4vw] -mt-[0.9vw] will-change-transform"
          >
            <DisplayLine
              ref={headingLine2Ref}
              wdth={118}
              style={{ fontSize: "clamp(2.2rem, 6.2vw, 7.5rem)" }}
              className="tracking-tight text-bone-100 whitespace-nowrap"
            >
              KHÔNG VỘI.
            </DisplayLine>
          </div>
        </h1>

        <p
          ref={leadRef}
          className="font-sans text-sm sm:text-lg text-bone-100/90 max-w-md mt-6 sm:ml-[4vw] leading-relaxed font-medium will-change-transform"
        >
          Porsche, Mercedes-AMG, Lamborghini. Chọn trạm nhận xe, kích hoạt chìa khóa số và tự do cầm lái trên mọi cung đường.
        </p>
      </div>

      {/* Layer 4 (z-25): Drifting Valley Mist weaving between Typography and Car */}
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

      {/* Layer 5 (z-30): Foreground Lithograph Porsche 911 on the Mountain Curve */}
      <div
        ref={carRef}
        style={{
          zIndex: 30,
          width: "clamp(310px, 48vw, 780px)",
        }}
        className="relative ml-auto mr-[4%] sm:mr-[10%] -mb-4 sm:-mb-8 pointer-events-none will-change-transform"
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
            className="w-full h-auto object-contain pointer-events-none contrast-125 brightness-95"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>

      {/* Layer 6 (z-35): Foreground Pine Branch Cutout framing the right edge (Kigo-style Foreground Depth Plane) */}
      <div
        ref={branchRef}
        aria-hidden="true"
        style={{
          zIndex: 35,
          width: "clamp(180px, 24vw, 420px)",
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
