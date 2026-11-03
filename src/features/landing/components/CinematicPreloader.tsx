"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

export default function CinematicPreloader() {
  const [isDone, setIsDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shutterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Bypass immediately for automated E2E Playwright runs or reduced-motion users
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isWebDriver = navigator.webdriver;
    const hasSeen = sessionStorage.getItem("td_preloader_seen") === "1";

    if (isReduced || isWebDriver || hasSeen) {
      setIsDone(true);
    }
  }, []);

  useGSAP(
    () => {
      if (isDone || typeof window === "undefined" || !rootRef.current) return;

      const counterObj = { val: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("td_preloader_seen", "1");
          setIsDone(true);
        },
      });

      // 1. Tachometer Counter 00 -> 100 & SVG Ring Sweep
      tl.to(
        counterObj,
        {
          val: 100,
          duration: 1.05,
          ease: "power3.inOut",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(Math.round(counterObj.val)).padStart(2, "0");
            }
          },
        },
        0
      );

      if (ringRef.current) {
        tl.fromTo(
          ringRef.current,
          { strokeDashoffset: 565 },
          { strokeDashoffset: 0, duration: 1.05, ease: "power3.inOut" },
          0
        );
      }

      // 2. Collapse Center Telemetry & Open 5 Constructivist Venetian Shutters
      if (contentRef.current) {
        tl.to(
          contentRef.current,
          { scale: 0.92, opacity: 0, duration: 0.3, ease: "power2.in" },
          1.0
        );
      }

      const validShutters = shutterRefs.current.filter(Boolean);
      if (validShutters.length > 0) {
        tl.to(
          validShutters,
          {
            scaleY: 0,
            duration: 0.65,
            stagger: 0.05,
            ease: "expo.inOut",
          },
          1.05
        );
      }
    },
    { dependencies: [isDone], scope: rootRef }
  );

  if (isDone) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{ zIndex: 95 }}
      className="fixed inset-0 w-full h-[100svh] pointer-events-none select-none overflow-hidden flex items-center justify-center"
    >
      {/* 5 Constructivist Venetian Shutter Columns */}
      <div className="absolute inset-0 grid grid-cols-5 w-full h-full">
        {[0, 1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            ref={(el) => {
              shutterRefs.current[idx] = el;
            }}
            style={{ transformOrigin: idx % 2 === 0 ? "top center" : "bottom center" }}
            className="w-full h-full bg-ink-950 border-r border-bone-100/10 will-change-transform"
          />
        ))}
      </div>

      {/* Center Mechanical Tachometer & Lithograph Ignition Stamp */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center text-bone-100 px-6 will-change-transform"
      >
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(233, 228, 216, 0.14)"
              strokeWidth="2"
            />
            <circle
              ref={ringRef}
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="var(--sun-600)"
              strokeWidth="4"
              strokeDasharray="565"
              strokeDashoffset="565"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] tracking-[0.28em] uppercase font-sans font-bold text-bone-100/60 mb-1">
              IGNITION
            </span>
            <span
              ref={counterRef}
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontVariationSettings: "'wdth' 72",
              }}
              className="font-black text-5xl sm:text-6xl text-bone-100 tracking-tight"
            >
              00
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-3 h-1.5 bg-sun-600 inline-block" />
            <span className="w-3 h-1.5 bg-sun-600 inline-block" />
            <span className="w-3 h-1.5 bg-sun-600 inline-block" />
          </div>
          <span className="font-display font-black uppercase tracking-[0.26em] text-xs text-bone-100">
            THONG DONG · GRAND TOURING
          </span>
        </div>
      </div>
    </div>
  );
}
