
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const HERO_LINE1_CHARS = ["S", "I", "Ê", "U", "\u00A0", "X", "E", "."];
const HERO_LINE2_CHARS = ["K", "H", "Ô", "N", "G", "\u00A0", "V", "Ộ", "I", "."];

export default function HeroChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const svgRingRef = useRef<SVGSVGElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const horizonRuleRef = useRef<HTMLDivElement>(null);
  const line1WrapRef = useRef<HTMLDivElement>(null);
  const line2WrapRef = useRef<HTMLDivElement>(null);
  const char1Refs = useRef<(HTMLSpanElement | null)[]>([]);
  const char2Refs = useRef<(HTMLSpanElement | null)[]>([]);
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
            stageRef.current,
            bgImgRef.current,
            svgRingRef.current,
            spineRef.current,
            horizonRuleRef.current,
            leadBlockRef.current,
            carRef.current,
            branchRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
        char1Refs.current.forEach((c) => {
          if (c) gsap.set(c, { clearProps: "all", opacity: 1 });
        });
        char2Refs.current.forEach((c) => {
          if (c) gsap.set(c, { clearProps: "all", opacity: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Entrance Choreography: 3D Character Flip + Constructivist SVG Ring Spin + Full Uncropped Car Entrance
        const introTl = gsap.timeline({ defaults: { ease: "expo.out" } });

        if (bgImgRef.current) {
          introTl.fromTo(
            bgImgRef.current,
            { scale: 1.15, opacity: 0 },
            { scale: 1.02, opacity: 1, duration: 1.4, ease: "power3.out" },
            0
          );
        }

        if (svgRingRef.current) {
          introTl.fromTo(
            svgRingRef.current,
            { rotate: -60, scale: 0.85, opacity: 0 },
            { rotate: 0, scale: 1, opacity: 1, duration: 1.5 },
            0.1
          );
        }

        const c1 = char1Refs.current.filter(Boolean);
        const c2 = char2Refs.current.filter(Boolean);

        if (c1.length > 0) {
          introTl.fromTo(
            c1,
            { yPercent: 115, rotateX: -90, opacity: 0 },
            {
              yPercent: 0,
              rotateX: 0,
              opacity: 1,
              duration: 1.1,
              stagger: 0.04,
            },
            0.12
          );
        }

        if (c2.length > 0) {
          introTl.fromTo(
            c2,
            { yPercent: 115, rotateX: -90, opacity: 0 },
            {
              yPercent: 0,
              rotateX: 0,
              opacity: 1,
              duration: 1.1,
              stagger: 0.035,
            },
            0.24
          );
        }

        if (spineRef.current) {
          introTl.fromTo(
            spineRef.current,
            { scaleY: 0 },
            { scaleY: 1, duration: 1.1, ease: "expo.inOut" },
            0.1
          );
        }

        if (horizonRuleRef.current) {
          introTl.fromTo(
            horizonRuleRef.current,
            { scaleX: 0 },
            { scaleX: 1, duration: 1.1, ease: "expo.inOut" },
            0.2
          );
        }

        if (leadBlockRef.current) {
          introTl.fromTo(
            leadBlockRef.current,
            { x: -30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.95 },
            0.38
          );
        }

        if (carRef.current) {
          introTl.fromTo(
            carRef.current,
            { xPercent: 16, yPercent: 8, scale: 0.9, opacity: 0 },
            { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, duration: 1.35 },
            0.22
          );
        }

        if (branchRef.current) {
          introTl.fromTo(
            branchRef.current,
            { xPercent: 18, yPercent: 10, opacity: 0 },
            { xPercent: 0, yPercent: 0, opacity: 1, duration: 1.4 },
            0.32
          );
        }

        // 2. 1:1 Scroll-Linked Multi-Plane Parallax + Variable Font Width Stretch (`wdth` morphing on scroll!)
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        if (stageRef.current) {
          scrollTl.to(stageRef.current, { yPercent: -8, scale: 0.96, ease: "none" }, 0);
        }
        if (bgImgRef.current) {
          scrollTl.to(bgImgRef.current, { yPercent: 15, scale: 1.12, ease: "none" }, 0);
        }
        if (svgRingRef.current) {
          scrollTl.to(svgRingRef.current, { rotate: 110, scale: 1.15, ease: "none" }, 0);
        }
        if (line1WrapRef.current) {
          scrollTl.to(
            line1WrapRef.current,
            {
              xPercent: -10,
              fontVariationSettings: "'wdth' 115",
              ease: "none",
            },
            0
          );
        }
        if (line2WrapRef.current) {
          scrollTl.to(
            line2WrapRef.current,
            {
              xPercent: 12,
              fontVariationSettings: "'wdth' 75",
              ease: "none",
            },
            0
          );
        }
        if (mistRef.current) {
          scrollTl.to(mistRef.current, { xPercent: -16, opacity: 0.72, ease: "none" }, 0);
        }
        if (carRef.current) {
          scrollTl.to(
            carRef.current,
            { xPercent: -14, yPercent: -12, scale: 1.08, ease: "none" },
            0
          );
        }
        if (branchRef.current) {
          scrollTl.to(
            branchRef.current,
            { xPercent: 10, yPercent: -28, scale: 1.14, ease: "none" },
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
            xBranch(nx * -40);
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
      className="relative w-full h-[100svh] min-h-[720px] bg-ink-950 text-bone-100 overflow-hidden select-none"
    >
      <div
        ref={stageRef}
        style={{ transformOrigin: "center top" }}
        className="relative w-full h-full flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-20 sm:pt-24 pb-10 will-change-transform"
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

        {/* Layer 2 (z-14): Constructivist SVG Telemetry Compass Ring & Architectural Crosshairs */}
        <svg
          ref={svgRingRef}
          aria-hidden="true"
          viewBox="0 0 600 600"
          style={{ zIndex: 14 }}
          className="hidden sm:block absolute right-[12%] top-[8%] w-[44vw] max-w-[540px] aspect-square text-bone-100/20 pointer-events-none will-change-transform"
        >
          <circle cx="300" cy="300" r="280" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 10" />
          <circle cx="300" cy="300" r="220" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="300" x2="600" y2="300" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="300" y1="0" x2="300" y2="600" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
        </svg>

        <div
          ref={spineRef}
          aria-hidden="true"
          style={{ zIndex: 14, transformOrigin: "top center" }}
          className="hidden lg:block absolute top-0 bottom-0 left-[6%] w-[2px] bg-bone-100/20 pointer-events-none will-change-transform"
        />
        <div
          ref={horizonRuleRef}
          aria-hidden="true"
          style={{ zIndex: 14, transformOrigin: "left center" }}
          className="absolute left-0 right-0 bottom-[16%] h-[1px] bg-bone-100/25 pointer-events-none will-change-transform"
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

        {/* Layer 4 (z-20): Monumental 3D Character-Flip & Variable-Width Typography (Positioned high & crisp in upper sky!) */}
        <div
          style={{ zIndex: 20, perspective: "1200px" }}
          className="relative w-full max-w-[1640px] mx-auto pointer-events-none"
        >
          <h1
            aria-label="SIÊU XE. KHÔNG VỘI."
            className="font-display font-black uppercase text-bone-100 flex flex-col items-start"
          >
            <div
              ref={line1WrapRef}
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(3.25rem, 8.6vw, 10.8rem)",
                lineHeight: 1.08,
                fontVariationSettings: "'wdth' 74",
              }}
              className="tracking-tight text-bone-100 whitespace-nowrap flex overflow-hidden pt-[0.2em] pb-[0.06em] -mt-[0.16em] drop-shadow-2xl will-change-transform"
            >
              {HERO_LINE1_CHARS.map((ch, idx) => (
                <span
                  key={idx}
                  ref={(el) => {
                    char1Refs.current[idx] = el;
                  }}
                  style={{ transformOrigin: "bottom center" }}
                  className="inline-block will-change-transform"
                >
                  {ch}
                </span>
              ))}
            </div>

            <div
              ref={line2WrapRef}
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.15rem, 5.4vw, 6.8rem)",
                lineHeight: 1.12,
                fontVariationSettings: "'wdth' 114",
              }}
              className="sm:ml-[4.5vw] -mt-[0.4vw] tracking-tight text-bone-100 whitespace-nowrap flex overflow-hidden pt-[0.2em] pb-[0.06em] drop-shadow-2xl will-change-transform"
            >
              {HERO_LINE2_CHARS.map((ch, idx) => (
                <span
                  key={idx}
                  ref={(el) => {
                    char2Refs.current[idx] = el;
                  }}
                  style={{ transformOrigin: "bottom center" }}
                  className="inline-block will-change-transform"
                >
                  {ch}
                </span>
              ))}
            </div>
          </h1>
        </div>

        {/* Layer 5 (z-25): Drifting Valley Mist */}
        <div
          ref={mistRef}
          aria-hidden="true"
          style={{ zIndex: 25, mixBlendMode: "screen", opacity: 0.4 }}
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

        {/* Layer 6 (z-30): Bottom Row — Left Architectural Caption in Dark Pine Zone + Right Full Uncropped Porsche 911 Above the Fold! */}
        <div
          style={{ zIndex: 30 }}
          className="relative w-full max-w-[1640px] mx-auto mt-auto flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6"
        >
          {/* Left Manifesto Block (Sits cleanly in the bottom-left dark pine forest, NEVER over the white mist!) */}
          <div
            ref={leadBlockRef}
            className="max-w-sm bg-ink-950/95 border-l-4 border-sun-600 p-4 sm:p-5 mb-2 sm:mb-6 will-change-transform"
          >
            <div className="flex items-center justify-between text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-sun-400 mb-2">
              <span>PORSCHE · MERCEDES-AMG · LAMBORGHINI</span>
              <span>/////</span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-bone-100/95 leading-relaxed font-medium">
              Chọn trạm nhận xe, kích hoạt chìa khóa số và tự do cầm lái trên mọi cung đường.
            </p>
          </div>

          {/* Right Foreground Porsche 911 (100% of wheels and front bumper visible above the fold at scrollY=0!) */}
          <div
            ref={carRef}
            style={{
              width: "clamp(290px, 43vw, 720px)",
            }}
            className="ml-auto mr-[2%] sm:mr-[6%] pointer-events-none will-change-transform"
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

        {/* Layer 7 (z-35): Foreground Pine Branch Cutout */}
        <div
          ref={branchRef}
          aria-hidden="true"
          style={{
            zIndex: 35,
            width: "clamp(180px, 23vw, 400px)",
          }}
          className="hidden sm:block absolute -right-[2%] bottom-[14%] pointer-events-none will-change-transform"
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
      </div>
    </section>
  );
}

