"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";
import DisplayLine from "../DisplayLine";

export default function HeroChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const line1WrapRef = useRef<HTMLDivElement>(null);
  const line2WrapRef = useRef<HTMLDivElement>(null);
  const headingLine1Ref = useRef<HTMLSpanElement>(null);
  const headingLine2Ref = useRef<HTMLSpanElement>(null);
  const sunDiscRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<HTMLDivElement>(null);
  const artPlateRef = useRef<HTMLDivElement>(null);
  const artImgRef = useRef<HTMLImageElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const metaStripRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !sectionRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            headingLine1Ref.current,
            headingLine2Ref.current,
            carRef.current,
            sunDiscRef.current,
            artPlateRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Entrance Choreography
        const introTl = gsap.timeline({ defaults: { ease: "power3.out" } });

        if (stripeRef.current) {
          introTl.fromTo(
            stripeRef.current,
            { scaleY: 0 },
            { scaleY: 1, duration: 1.1, ease: "expo.inOut" },
            0
          );
        }

        if (sunDiscRef.current) {
          introTl.fromTo(
            sunDiscRef.current,
            { scale: 0.72, yPercent: 18, opacity: 0 },
            { scale: 1, yPercent: 0, opacity: 1, duration: 1.3, ease: "expo.out" },
            0.1
          );
        }

        if (artPlateRef.current) {
          introTl.fromTo(
            artPlateRef.current,
            { yPercent: 8, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.1 },
            0.15
          );
        }

        if (headingLine1Ref.current && headingLine2Ref.current) {
          introTl.fromTo(
            [headingLine1Ref.current, headingLine2Ref.current],
            { yPercent: 105, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.14, ease: "expo.out" },
            0.25
          );
        }

        if (carRef.current) {
          introTl.fromTo(
            carRef.current,
            { xPercent: 14, yPercent: 8, scale: 0.92, opacity: 0 },
            { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, duration: 1.25, ease: "expo.out" },
            0.35
          );
        }

        // 2. Scroll-Driven Multi-Layer Choreography (Scrub across 155svh track)
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });

        if (line1WrapRef.current) {
          scrollTl.to(line1WrapRef.current, { xPercent: -12, yPercent: -18, ease: "none" }, 0);
        }
        if (line2WrapRef.current) {
          scrollTl.to(line2WrapRef.current, { xPercent: 12, yPercent: -10, ease: "none" }, 0);
        }
        if (sunDiscRef.current) {
          scrollTl.to(sunDiscRef.current, { yPercent: -22, scale: 1.12, ease: "none" }, 0);
        }
        if (artImgRef.current) {
          scrollTl.to(artImgRef.current, { scale: 1.14, yPercent: 10, ease: "none" }, 0);
        }
        if (mistRef.current) {
          scrollTl.to(mistRef.current, { xPercent: -14, opacity: 0.65, ease: "none" }, 0);
        }
        if (carRef.current) {
          scrollTl.to(
            carRef.current,
            { xPercent: -10, yPercent: -14, scale: 1.08, ease: "none" },
            0
          );
        }
        if (metaStripRef.current) {
          scrollTl.to(metaStripRef.current, { opacity: 0.25, yPercent: 20, ease: "none" }, 0);
        }

        // 3. Interactive Pointer Parallax (Desktop Only)
        const stageEl = stageRef.current;
        if (stageEl && window.matchMedia("(pointer: fine)").matches) {
          const xCar = gsap.quickTo(carRef.current, "x", { duration: 0.8, ease: "power3.out" });
          const yCar = gsap.quickTo(carRef.current, "y", { duration: 0.8, ease: "power3.out" });
          const xSun = gsap.quickTo(sunDiscRef.current, "x", { duration: 1.1, ease: "power3.out" });
          const ySun = gsap.quickTo(sunDiscRef.current, "y", { duration: 1.1, ease: "power3.out" });
          const xArt = gsap.quickTo(artPlateRef.current, "x", { duration: 1.0, ease: "power3.out" });

          const onMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            xCar(nx * -22);
            yCar(ny * -10);
            xSun(nx * 16);
            ySun(ny * 12);
            xArt(nx * -8);
          };

          stageEl.addEventListener("mousemove", onMove, { passive: true });
          return () => stageEl.removeEventListener("mousemove", onMove);
        }
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="gioi-thieu"
      className="relative w-full h-[155svh] bg-ink-950 text-bone-100 select-none"
    >
      {/* Sticky Viewport Stage */}
      <div
        ref={stageRef}
        className="sticky top-0 w-full h-[100svh] overflow-hidden flex flex-col justify-between px-4 sm:px-8 lg:px-14 pt-20 pb-24"
      >
        {/* Constructivist Vertical Racing Spine (from Bugatti Poster DNA) */}
        <div
          ref={stripeRef}
          aria-hidden="true"
          style={{ zIndex: 12, transformOrigin: "top center" }}
          className="hidden lg:block absolute top-0 bottom-0 right-[26%] w-[2.2vw] max-w-[36px] bg-lake-600 pointer-events-none"
        />

        {/* Constructivist Giant Sun Disc (from Mountain Poster DNA) */}
        <div
          ref={sunDiscRef}
          aria-hidden="true"
          style={{ zIndex: 14 }}
          className="absolute top-[14%] right-[6%] sm:right-[10%] w-[58vw] sm:w-[40vw] max-w-[580px] aspect-square rounded-full bg-sun-600 pointer-events-none will-change-transform"
        />

        {/* Top Technical Swiss Grid Bar */}
        <div
          ref={metaStripRef}
          style={{ zIndex: 35 }}
          className="relative w-full border-y border-bone-100/20 py-2.5 flex items-center justify-between text-[11px] tracking-[0.24em] uppercase font-sans font-semibold text-bone-100/70"
        >
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-sun-600" />
            <span>THONG DONG MONOGRAPH</span>
          </div>
          <span className="hidden md:inline text-bone-100/50">
            POWER / PRECISION / FREEDOM
          </span>
          <span className="text-bone-100/80">PORSCHE · AMG · LAMBORGHINI</span>
        </div>

        {/* Monumental Asymmetrical Masthead (Protected in Dark Upper Zone, Zero Cloud Collision) */}
        <div style={{ zIndex: 35 }} className="relative w-full mt-2 sm:mt-4 pointer-events-none">
          <h1 className="font-display font-black uppercase text-bone-100 flex flex-col w-full leading-none">
            <div ref={line1WrapRef} className="self-start will-change-transform">
              <DisplayLine
                ref={headingLine1Ref}
                wdth={75}
                style={{ fontSize: "clamp(3.25rem, 10.5vw, 13.5rem)" }}
                className="tracking-tight text-bone-100 whitespace-nowrap"
              >
                SIÊU XE.
              </DisplayLine>
            </div>
            <div
              ref={line2WrapRef}
              className="self-start sm:self-end sm:mr-[6vw] -mt-[1.2vw] will-change-transform"
            >
              <DisplayLine
                ref={headingLine2Ref}
                wdth={120}
                style={{ fontSize: "clamp(2.25rem, 7.2vw, 9.2rem)" }}
                className="tracking-tight text-bone-100 whitespace-nowrap"
              >
                KHÔNG VỘI.
              </DisplayLine>
            </div>
          </h1>
        </div>

        {/* Framed Woodcut Landscape Plate + Foreground Lithograph Car */}
        <div className="relative w-full flex-1 min-h-[38svh] max-h-[54svh] my-auto flex items-end">
          {/* Architectural Framed Da Lat Woodcut Window */}
          <div
            ref={artPlateRef}
            style={{ zIndex: 18 }}
            className="relative w-full lg:w-[88%] h-full ml-auto border border-bone-100/25 rounded-none overflow-hidden bg-ink-800 will-change-transform"
          >
            <picture className="w-full h-full block pointer-events-none">
              <source
                type="image/avif"
                srcSet="/assets/landing/scene-a-dalat-full-3840.avif 3840w, /assets/landing/scene-a-dalat-full-2880.avif 2880w, /assets/landing/scene-a-dalat-full-1920.avif 1920w, /assets/landing/scene-a-dalat-full-1280.avif 1280w"
              />
              <source
                type="image/webp"
                srcSet="/assets/landing/scene-a-dalat-full-3840.webp 3840w, /assets/landing/scene-a-dalat-full-2880.webp 2880w, /assets/landing/scene-a-dalat-full-1920.webp 1920w, /assets/landing/scene-a-dalat-full-1280.webp 1280w"
              />
              <img
                ref={artImgRef}
                src="/assets/landing/scene-a-dalat-full-1920.webp"
                alt="Cao nguyên Đà Lạt lúc bình minh"
                className="w-full h-full object-cover object-bottom pointer-events-none will-change-transform"
                fetchPriority="high"
                loading="eager"
                decoding="async"
              />
            </picture>

            {/* Drifting Atmospheric Mist Layer */}
            <div
              ref={mistRef}
              style={{ mixBlendMode: "screen", opacity: 0.42 }}
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

            {/* Constructivist Corner Micro-Spec inside Plate */}
            <div className="hidden sm:flex absolute top-4 left-5 items-center gap-3 text-[10px] tracking-[0.24em] uppercase text-bone-100/80 font-sans font-semibold">
              <span>PLATE I // DA LAT DAWN</span>
              <span className="w-8 border-t border-bone-100/40" />
              <span>11.9404° N, 108.4583° E</span>
            </div>
          </div>

          {/* Horizon Axis Hairline */}
          <div
            aria-hidden="true"
            style={{ zIndex: 24 }}
            className="absolute inset-x-0 bottom-[8%] border-t border-bone-100/30 pointer-events-none"
          />

          {/* Left Constructivist Manifesto Block + Diagonal Hazard Motif */}
          <div
            style={{ zIndex: 30 }}
            className="hidden lg:flex flex-col justify-between w-[26%] bg-ink-950 border border-bone-100/20 p-6 rounded-none mr-auto relative -bottom-2"
          >
            <p className="font-sans text-sm text-bone-100/85 leading-relaxed">
              Trải nghiệm cầm lái những cỗ máy cơ khí tuyển chọn trên cung đường đèo tĩnh lặng. Chọn trạm, nhận khóa số và khởi hành.
            </p>
            <div className="mt-5 pt-4 border-t border-bone-100/15 flex items-center justify-between">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-1.5 bg-lake-400 inline-block" />
                <span className="w-2.5 h-1.5 bg-lake-400 inline-block" />
                <span className="w-2.5 h-1.5 bg-lake-400 inline-block" />
                <span className="w-2.5 h-1.5 bg-lake-400 inline-block" />
              </div>
              <span className="text-[10px] tracking-[0.24em] uppercase font-semibold text-bone-100/60">
                CUỘN ĐỂ KHỞI HÀNH
              </span>
            </div>
          </div>

          {/* Foreground Lithograph Hero Car (Breaking Out of Frame like Bugatti Poster) */}
          <div
            ref={carRef}
            style={{
              zIndex: 32,
              width: "clamp(300px, 48vw, 820px)",
            }}
            className="absolute right-[2%] sm:right-[6%] -bottom-[6%] pointer-events-none will-change-transform"
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
                alt="Porsche 911 Carrera 4S Lithograph"
                className="w-full h-auto object-contain pointer-events-none"
                loading="eager"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}
