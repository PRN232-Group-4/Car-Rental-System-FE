"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

export default function CinematicPreloader() {
  const [isDone, setIsDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const topGateRef = useRef<HTMLDivElement>(null);
  const bottomGateRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const centerPlateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
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

      // 1. Lithograph Ink Roller Bar & Giant Edition Counter 00 -> 100
      tl.to(
        counterObj,
        {
          val: 100,
          duration: 1.15,
          ease: "power3.inOut",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(Math.round(counterObj.val)).padStart(3, "0");
            }
          },
        },
        0
      );

      if (barFillRef.current) {
        tl.fromTo(
          barFillRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.15, ease: "power3.inOut" },
          0
        );
      }

      // 2. Fade Center Registration Plate & Split Horizontal Press Gates (Top Up / Bottom Down)
      if (centerPlateRef.current) {
        tl.to(
          centerPlateRef.current,
          { opacity: 0, scale: 0.96, duration: 0.25, ease: "power2.in" },
          1.1
        );
      }

      if (topGateRef.current) {
        tl.to(
          topGateRef.current,
          { yPercent: -100, duration: 0.75, ease: "expo.inOut" },
          1.15
        );
      }

      if (bottomGateRef.current) {
        tl.to(
          bottomGateRef.current,
          { yPercent: 100, duration: 0.75, ease: "expo.inOut" },
          1.15
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
      className="fixed inset-0 w-full h-[100svh] pointer-events-none select-none overflow-hidden flex flex-col justify-between"
    >
      {/* Top Lithograph Press Gate (Warm Archival Paper with Constructivist Registration Marks) */}
      <div
        ref={topGateRef}
        className="relative w-full h-1/2 bg-bone-100 text-ink-950 border-b-4 border-sun-600 px-6 sm:px-12 lg:px-20 py-8 flex flex-col justify-between will-change-transform"
      >
        <div className="flex items-center justify-between border-b-2 border-ink-950 pb-4 text-[10px] sm:text-xs tracking-[0.28em] uppercase font-sans font-bold">
          <span>THONG DONG // ARCHIVAL LITHOGRAPH EDITION</span>
          <span className="text-sun-600">PRESS PLATE NO. 01 — 05</span>
        </div>

        <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <span className="text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-ink-950/60 block mb-2">
              POWER / PRECISION / FREEDOM
            </span>
            <div
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.5rem, 6.5vw, 7.5rem)",
                lineHeight: 0.92,
                fontVariationSettings: "'wdth' 110",
              }}
              className="font-black uppercase tracking-tight text-ink-950"
            >
              SIÊU XE. KHÔNG VỘI.
            </div>
          </div>
          <div className="hidden lg:flex lg:col-span-5 justify-end">
            <img
              src="/assets/landing/a4-car-960.webp"
              alt=""
              className="w-64 h-auto object-contain contrast-125 brightness-95"
            />
          </div>
        </div>
      </div>

      {/* Bottom Lithograph Press Gate (Deep Obsidian Ink with Giant Counter) */}
      <div
        ref={bottomGateRef}
        className="relative w-full h-1/2 bg-ink-950 text-bone-100 px-6 sm:px-12 lg:px-20 py-8 flex flex-col justify-between will-change-transform"
      >
        {/* Live Ink Roller Progress Bar */}
        <div className="w-full h-2 bg-bone-100/15 overflow-hidden">
          <div
            ref={barFillRef}
            style={{ transformOrigin: "left center" }}
            className="w-full h-full bg-sun-600 will-change-transform"
          />
        </div>

        <div
          ref={centerPlateRef}
          className="my-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6 will-change-transform"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-2 bg-lake-400 inline-block" />
              <span className="w-4 h-2 bg-lake-400 inline-block" />
              <span className="w-4 h-2 bg-lake-400 inline-block" />
              <span className="w-4 h-2 bg-lake-400 inline-block" />
              <span className="w-4 h-2 bg-lake-400 inline-block" />
            </div>
            <span className="text-xs tracking-[0.26em] uppercase font-sans font-bold text-bone-100/75 block">
              ĐANG NẠP BẢN KHẮC ĐÀ LẠT & ĐÈO HẢI VÂN...
            </span>
          </div>

          <span
            ref={counterRef}
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "clamp(4.5rem, 14vw, 15rem)",
              lineHeight: 0.85,
              fontVariationSettings: "'wdth' 68",
            }}
            className="font-black text-bone-100 tracking-tight"
          >
            000
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-bone-100/20 pt-4 text-[10px] tracking-[0.24em] uppercase font-sans text-bone-100/60">
          <span>PORSCHE · MERCEDES-AMG · LAMBORGHINI</span>
          <span>TP. HỒ CHÍ MINH · VIỆT NAM</span>
        </div>
      </div>
    </div>
  );
}
