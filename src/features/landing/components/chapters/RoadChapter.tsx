"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

export default function RoadChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const layerSkyRef = useRef<HTMLDivElement>(null);
  const layerMountainRef = useRef<HTMLDivElement>(null);
  const layerForestRef = useRef<HTMLDivElement>(null);
  const layerRoadRef = useRef<HTMLDivElement>(null);
  const carRunnerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (layerSkyRef.current) gsap.set(layerSkyRef.current, { y: 0 });
        if (layerMountainRef.current) gsap.set(layerMountainRef.current, { y: 0 });
        if (layerForestRef.current) gsap.set(layerForestRef.current, { y: 0 });
        if (layerRoadRef.current) gsap.set(layerRoadRef.current, { y: 0 });
        if (carRunnerRef.current) gsap.set(carRunnerRef.current, { xPercent: 50, yPercent: 50 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 4 Parallax Layers with scrub speeds: 0.2 / 0.4 / 0.7 / 1.0
        if (layerSkyRef.current) {
          gsap.to(layerSkyRef.current, {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        if (layerMountainRef.current) {
          gsap.to(layerMountainRef.current, {
            yPercent: -40,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        if (layerForestRef.current) {
          gsap.to(layerForestRef.current, {
            yPercent: -70,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        if (layerRoadRef.current) {
          gsap.to(layerRoadRef.current, {
            yPercent: -100,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        // CatmullRom-style Car Motion along Road Curve
        if (carRunnerRef.current) {
          gsap.to(carRunnerRef.current, {
            x: "70vw",
            y: "30vh",
            rotation: 12,
            ease: "power1.inOut",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top center",
              end: "bottom center",
              scrub: 1.2,
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
      id="cung-duong"
      data-chapter="lake"
      className="relative w-full min-h-[140vh] sm:min-h-[170vh] bg-lake-600 text-white overflow-hidden flex flex-col justify-between py-24 select-none"
    >
      {/* 4 Parallax Layers (SVG Cutouts) */}
      {/* Layer 1: Sky & Sun Disc (Speed 0.2) */}
      <div
        ref={layerSkyRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0 flex items-start justify-center pt-20"
      >
        <div className="w-[420px] h-[420px] rounded-full bg-lake-400/30 blur-2xl" />
      </div>

      {/* Layer 2: Distant Angular Mountain Ridges (Speed 0.4) */}
      <div
        ref={layerMountainRef}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-1/3 pointer-events-none z-10 opacity-70"
      >
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-auto text-lake-600/90 fill-current"
          preserveAspectRatio="none"
        >
          <polygon points="0,320 0,160 220,90 480,210 760,60 1100,180 1440,80 1440,320" />
        </svg>
      </div>

      {/* Layer 3: Forest & Ridge Silhouette (Speed 0.7) */}
      <div
        ref={layerForestRef}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-1/4 pointer-events-none z-20 opacity-85"
      >
        <svg
          viewBox="0 0 1440 280"
          className="w-full h-auto text-ink-950 fill-current"
          preserveAspectRatio="none"
        >
          <polygon points="0,280 0,180 180,120 340,200 520,110 740,190 960,100 1200,170 1440,90 1440,280" />
        </svg>
      </div>

      {/* Layer 4: Coastal Road Ribbon & Car Runner (Speed 1.0) */}
      <div
        ref={layerRoadRef}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 pointer-events-none z-30"
      >
        <svg
          viewBox="0 0 1440 360"
          className="w-full h-auto text-bone-100 fill-none stroke-bone-100 stroke-[8]"
          preserveAspectRatio="none"
        >
          {/* Smooth S-curve road spline */}
          <path d="M-100,280 C300,320 500,140 850,220 C1150,280 1350,110 1550,160" />
        </svg>

        {/* Car Runner traveling along spline */}
        <div
          ref={carRunnerRef}
          className="absolute left-[10vw] top-[40%] w-16 h-8 text-white flex items-center justify-center will-change-transform"
        >
          <div className="w-12 h-5 bg-white border border-ink-950 rounded-none shadow-md flex items-center justify-between px-1">
            <span className="w-2 h-2 rounded-full bg-sun-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-lake-600" />
          </div>
        </div>
      </div>

      {/* Section Content & Editorial Philosophy */}
      <div className="relative z-40 max-w-5xl mx-auto px-6 sm:px-12 text-center my-auto">
        <span className="font-mono text-xs uppercase tracking-widest text-bone-100/70 block mb-4">
          02 / CHƯƠNG II · CUNG ĐƯỜNG
        </span>
        <h2 className="font-display uppercase tracking-tight text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight">
          Đường dài là để{" "}
          <span className="font-serif italic font-normal text-bone-100">
            đi chậm.
          </span>
        </h2>
        <p className="font-sans text-sm sm:text-base text-white/80 max-w-2xl mx-auto mt-6 leading-relaxed">
          Hành trình không đo bằng vận tốc tối đa, mà bằng khoảnh khắc bạn trọn vẹn làm chủ cỗ máy trên từng khúc cua ven biển hay đèo núi tĩnh lặng.
        </p>
      </div>

      {/* Typographic Brand Names Strip */}
      <div className="relative z-40 w-full overflow-hidden border-y border-white/20 py-4 bg-lake-600">
        <div className="flex items-center justify-around gap-8 text-xs sm:text-sm font-display uppercase tracking-widest text-white/90 whitespace-nowrap px-4">
          <span>Porsche</span>
          <span className="text-white/40">·</span>
          <span>Ferrari</span>
          <span className="text-white/40">·</span>
          <span>Lamborghini</span>
          <span className="text-white/40">·</span>
          <span>McLaren</span>
          <span className="text-white/40">·</span>
          <span>Aston Martin</span>
          <span className="text-white/40">·</span>
          <span>Mercedes-AMG</span>
        </div>
      </div>
    </section>
  );
}
