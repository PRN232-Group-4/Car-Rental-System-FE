"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Compass } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const BOOT_PHASES = [
  "Khởi tạo không gian trưng bày 3D",
  "Đồng bộ danh mục xe sẵn sàng vận hành",
  "Xác thực tiêu chuẩn kiểm định hai chiều",
  "Sẵn sàng lăn bánh cùng Thong Dong",
];

export default function CinematicPreloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const topShutterRef = useRef<HTMLDivElement>(null);
  const bottomShutterRef = useRef<HTMLDivElement>(null);
  const centerHudRef = useRef<HTMLDivElement>(null);
  const laserLineRef = useRef<HTMLDivElement>(null);
  const counterNodeRef = useRef<HTMLSpanElement>(null);
  const stepTextRef = useRef<HTMLSpanElement>(null);

  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch("/models/porsche_911_carrera_4s_opt.glb", { priority: "low" as RequestPriority }).catch(() => {});
    }
  }, []);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !rootRef.current) return;

      const params = new URLSearchParams(window.location.search);
      const holdForInspect = params.get("preloader") === "hold";
      const forceFull = params.get("preloader") === "1" || holdForInspect;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isAutomatedBot = navigator.webdriver === true && !forceFull;
      const alreadyBooted = sessionStorage.getItem("td_editorial_booted") === "1" && !forceFull;

      if (prefersReduced || isAutomatedBot || alreadyBooted) {
        setIsDismissed(true);
        return;
      }

      const progressObj = { value: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          if (!holdForInspect) {
            sessionStorage.setItem("td_editorial_booted", "1");
            setIsDismissed(true);
          }
        },
      });

      tl.to(
        progressObj,
        {
          value: holdForInspect ? 88 : 100,
          duration: holdForInspect ? 0.6 : 1.1,
          ease: "power3.inOut",
          onUpdate: () => {
            const current = Math.round(progressObj.value);
            if (counterNodeRef.current) {
              counterNodeRef.current.textContent = String(current).padStart(2, "0");
            }
            if (stepTextRef.current) {
              const stepIdx = Math.min(
                BOOT_PHASES.length - 1,
                Math.floor((current / 100) * BOOT_PHASES.length)
              );
              stepTextRef.current.textContent = BOOT_PHASES[stepIdx];
            }
          },
        },
        0
      );

      if (laserLineRef.current) {
        tl.fromTo(
          laserLineRef.current,
          { scaleX: 0.02 },
          {
            scaleX: holdForInspect ? 0.88 : 1,
            duration: holdForInspect ? 0.6 : 1.1,
            ease: "power3.inOut",
          },
          0
        );
      }

      if (holdForInspect) return;

      if (centerHudRef.current) {
        tl.to(
          centerHudRef.current,
          {
            opacity: 0,
            y: -12,
            duration: 0.25,
            ease: "power2.in",
          },
          1.12
        );
      }

      if (topShutterRef.current && bottomShutterRef.current) {
        tl.to(
          topShutterRef.current,
          {
            yPercent: -100,
            duration: 0.75,
            ease: "power4.inOut",
          },
          1.22
        ).to(
          bottomShutterRef.current,
          {
            yPercent: 100,
            duration: 0.75,
            ease: "power4.inOut",
          },
          1.22
        );
      }
    },
    { scope: rootRef }
  );

  if (isDismissed) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Đang tải trải nghiệm Thong Dong"
      className="fixed inset-0 z-[120] min-h-[100dvh] w-full pointer-events-auto overflow-hidden select-none"
    >
      <div
        ref={topShutterRef}
        className="absolute top-0 left-0 right-0 h-1/2 bg-stage-ink border-b border-white/10 will-change-transform"
      >
        <div className="max-w-[1600px] mx-auto h-full px-6 sm:px-12 py-8 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between text-xs tracking-wider uppercase text-white/70">
            <span className="font-display font-bold tracking-widest text-white">
              THONG DONG
            </span>
            <span className="font-sans text-white/60">
              Dịch vụ thuê xe cao cấp
            </span>
          </div>
        </div>
      </div>

      <div
        ref={bottomShutterRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-stage-ink border-t border-white/10 will-change-transform"
      >
        <div className="max-w-[1600px] mx-auto h-full px-6 sm:px-12 py-8 flex flex-col justify-end text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/70">
            <span ref={stepTextRef} className="font-sans font-medium text-white">
              {BOOT_PHASES[0]}
            </span>
            <div className="flex items-center gap-6 text-white/50">
              <span className="hidden sm:flex items-center gap-1.5">
                <ShieldCheck aria-hidden="true" className="w-3.5 h-3.5 text-primary" />
                <span>Biên bản đối soát minh bạch</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Compass aria-hidden="true" className="w-3.5 h-3.5 text-primary" />
                <span>Hà Nội · Đà Nẵng · TP.HCM</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={centerHudRef}
        className="relative z-10 min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 pointer-events-none"
      >
        <div className="w-full max-w-3xl flex flex-col items-center text-center">
          <p className="text-white/60 text-xs sm:text-sm uppercase tracking-[0.25em] mb-3 font-sans">
            Trải nghiệm di chuyển tự chủ
          </p>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Thuê xe
            </span>
            <span className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              thong dong<span className="text-primary">.</span>
            </span>
          </div>

          <div className="w-full max-w-md h-[1.5px] bg-white/15 overflow-hidden relative mb-4">
            <div
              ref={laserLineRef}
              className="h-full w-full bg-primary origin-left will-change-transform"
            />
          </div>

          <div className="flex items-baseline gap-1 font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
            <span ref={counterNodeRef}>00</span>
            <span className="text-sm text-primary">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
