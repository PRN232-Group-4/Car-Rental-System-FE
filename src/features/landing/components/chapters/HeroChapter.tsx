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
  const stripeRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const manifestoCardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            headingLine1Ref.current,
            headingLine2Ref.current,
            carRef.current,
            bgImgRef.current,
            manifestoCardRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Entrance Choreography
        const introTl = gsap.timeline({ defaults: { ease: "power3.out" } });

        if (bgImgRef.current) {
          introTl.fromTo(
            bgImgRef.current,
            { scale: 1.12, opacity: 0 },
            { scale: 1.02, opacity: 1, duration: 1.4, ease: "power2.out" },
            0
          );
        }

        if (stripeRef.current) {
          introTl.fromTo(
            stripeRef.current,
            { scaleY: 0 },
            { scaleY: 1, duration: 1.1, ease: "expo.inOut" },
            0.1
          );
        }

        if (headingLine1Ref.current && headingLine2Ref.current) {
          introTl.fromTo(
            [headingLine1Ref.current, headingLine2Ref.current],
            { yPercent: 105, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.14, ease: "expo.out" },
            0.2
          );
        }

        if (carRef.current) {
          introTl.fromTo(
            carRef.current,
            { xPercent: 12, yPercent: 6, scale: 0.92, opacity: 0 },
            { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, duration: 1.25, ease: "expo.out" },
            0.3
          );
        }

        if (manifestoCardRef.current) {
          introTl.fromTo(
            manifestoCardRef.current,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9 },
            0.45
          );
        }

        // 2. Continuous Scroll-Driven Parallax (Zero Empty Black Spacer Gap)
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });

        if (bgImgRef.current) {
          scrollTl.to(bgImgRef.current, { yPercent: 18, scale: 1.14, ease: "none" }, 0);
        }
        if (line1WrapRef.current) {
          scrollTl.to(line1WrapRef.current, { xPercent: -10, yPercent: -25, ease: "none" }, 0);
        }
        if (line2WrapRef.current) {
          scrollTl.to(line2WrapRef.current, { xPercent: 10, yPercent: -15, ease: "none" }, 0);
        }
        if (mistRef.current) {
          scrollTl.to(mistRef.current, { xPercent: -12, yPercent: 8, opacity: 0.7, ease: "none" }, 0);
        }
        if (carRef.current) {
          scrollTl.to(
            carRef.current,
            { xPercent: -8, yPercent: -12, scale: 1.08, ease: "none" },
            0
          );
        }

        // 3. Interactive Mouse Depth Parallax
        const el = containerRef.current;
        if (el && window.matchMedia("(pointer: fine)").matches) {
          const xCar = gsap.quickTo(carRef.current, "x", { duration: 0.8, ease: "power3.out" });
          const yCar = gsap.quickTo(carRef.current, "y", { duration: 0.8, ease: "power3.out" });
          const xBg = gsap.quickTo(bgImgRef.current, "x", { duration: 1.2, ease: "power3.out" });
          const xMist = gsap.quickTo(mistRef.current, "x", { duration: 1.0, ease: "power3.out" });

          const onMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            xCar(nx * -24);
            yCar(ny * -10);
            xBg(nx * 12);
            xMist(nx * -16);
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
      className="relative w-full h-[100svh] min-h-[760px] bg-ink-950 text-bone-100 overflow-hidden select-none flex flex-col justify-between px-4 sm:px-8 lg:px-14 pt-20 pb-24 border-b border-bone-100/20"
    >
      {/* 1. Full-Viewport Woodcut Da Lat Landscape (Uses the authentic woodcut sun inside the artwork — NO duplicate CSS sun) */}
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
          alt="Cao nguyên Đà Lạt lúc bình minh"
          className="w-full h-full object-cover object-center pointer-events-none will-change-transform"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
      </picture>

      {/* 2. Architectural Constructivist Grid Hairlines & Racing Blue Vertical Spine */}
      <div
        aria-hidden="true"
        style={{ zIndex: 12 }}
        className="absolute inset-0 pointer-events-none grid grid-cols-4 lg:grid-cols-12 px-4 sm:px-8 lg:px-14"
      >
        <div className="border-l border-bone-100/10 h-full" />
        <div className="hidden lg:block lg:col-start-5 border-l border-bone-100/10 h-full" />
        <div className="hidden lg:block lg:col-start-9 border-l border-bone-100/10 h-full" />
        <div className="col-start-4 lg:col-start-12 border-r border-bone-100/10 h-full" />
      </div>

      <div
        ref={stripeRef}
        aria-hidden="true"
        style={{ zIndex: 14, transformOrigin: "top center" }}
        className="hidden sm:block absolute top-0 bottom-0 right-[8%] w-3 bg-lake-600/85 pointer-events-none"
      />

      {/* 3. Tactile Lithograph Dust & Drifting Low Mist */}
      <div
        aria-hidden="true"
        style={{ zIndex: 16, mixBlendMode: "screen", opacity: 0.45 }}
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

      <div
        ref={mistRef}
        aria-hidden="true"
        style={{ zIndex: 22, mixBlendMode: "screen", opacity: 0.48 }}
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

      {/* 4. Top Constructivist Monograph Strip */}
      <div
        style={{ zIndex: 35 }}
        className="relative w-full border-y border-bone-100/25 bg-ink-950/80 py-2 px-3 flex items-center justify-between text-[10px] sm:text-[11px] tracking-[0.24em] uppercase font-sans font-semibold text-bone-100/80"
      >
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-sun-600" />
          <span>ACT I // DA LAT HIGHLANDS</span>
        </div>
        <span className="hidden md:inline text-bone-100/60">
          POWER / PRECISION / FREEDOM
        </span>
        <span className="text-bone-100/90">PORSCHE · AMG · LAMBORGHINI</span>
      </div>

      {/* 5. Monumental 2-Line Masthead (Kept strictly in the upper dark charcoal sky zone above the clouds) */}
      <div
        style={{ zIndex: 35 }}
        className="relative w-full my-auto pb-[22svh] sm:pb-[26svh] pointer-events-none"
      >
        <h1 className="font-display font-black uppercase text-bone-100 flex flex-col items-start leading-none">
          <div ref={line1WrapRef} className="will-change-transform">
            <DisplayLine
              ref={headingLine1Ref}
              wdth={75}
              style={{ fontSize: "clamp(3.2rem, 8.8vw, 10.5rem)" }}
              className="tracking-tight text-bone-100 whitespace-nowrap drop-shadow-2xl"
            >
              SIÊU XE.
            </DisplayLine>
          </div>
          <div
            ref={line2WrapRef}
            className="sm:ml-[3.5vw] -mt-[0.8vw] will-change-transform"
          >
            <DisplayLine
              ref={headingLine2Ref}
              wdth={115}
              style={{ fontSize: "clamp(2.1rem, 5.8vw, 7.0rem)" }}
              className="tracking-tight text-bone-100 whitespace-nowrap drop-shadow-2xl"
            >
              KHÔNG VỘI.
            </DisplayLine>
          </div>
        </h1>
      </div>

      {/* 6. Bottom-Left Constructivist Spec Plate + Foreground High-Contrast Lithograph Car */}
      <div style={{ zIndex: 32 }} className="relative w-full flex items-end justify-between">
        <div
          ref={manifestoCardRef}
          className="hidden md:flex flex-col justify-between max-w-sm bg-ink-950/95 border border-bone-100/25 p-5 rounded-none"
        >
          <div className="flex items-center justify-between text-[10px] tracking-[0.24em] uppercase font-semibold text-sun-400 pb-2.5 mb-2.5 border-b border-bone-100/15">
            <span>GRAND TOURING MONOGRAPH</span>
            <span>443 HP · FLAT-6</span>
          </div>
          <p className="font-sans text-xs sm:text-sm text-bone-100/85 leading-relaxed">
            Trải nghiệm cầm lái những cỗ máy cơ khí tuyển chọn. Chọn trạm nhận xe, kích hoạt khóa số và lên đường.
          </p>
          <div className="mt-4 pt-3 border-t border-bone-100/15 flex items-center justify-between">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-3 h-1.5 bg-lake-400 inline-block" />
              <span className="w-3 h-1.5 bg-lake-400 inline-block" />
              <span className="w-3 h-1.5 bg-lake-400 inline-block" />
              <span className="w-3 h-1.5 bg-lake-400 inline-block" />
              <span className="w-3 h-1.5 bg-lake-400 inline-block" />
            </div>
            <span className="text-[10px] tracking-[0.22em] uppercase text-bone-100/60">
              11.9404° N, 108.4583° E
            </span>
          </div>
        </div>

        {/* Foreground Porsche 911 Carrera 4S anchored on the winding mountain road */}
        <div
          ref={carRef}
          style={{
            width: "clamp(300px, 46vw, 760px)",
          }}
          className="ml-auto mr-[2%] sm:mr-[5%] -mb-4 sm:-mb-6 pointer-events-none will-change-transform"
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
      </div>
    </section>
  );
}
