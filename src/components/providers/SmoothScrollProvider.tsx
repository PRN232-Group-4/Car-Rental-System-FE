"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/motion/register";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * SmoothScrollProvider: Quản lý cuộn mượt Lenis và hệ thống điều phối
 * chuyển động quán tính (Scroll-Velocity Kinetic Response).
 * Tự động truyền lực cuộn vào độ nghiêng trục Y (skewY ±1.8deg) cho các phần tử
 * mang thuộc tính [data-kinetic-skew], tạo cảm giác chuyển động vật lý cao cấp chuẩn Lusion.
 */
export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion and static capture mode
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isStaticCapture = window.location.search.includes("capture=static");

    if (prefersReducedMotion || isStaticCapture) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // Connect Lenis scroll events to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Scroll-Velocity Kinetic Response
    let resetTween: gsap.core.Tween | null = null;
    let cachedTargets: NodeListOf<HTMLElement> | null = null;

    const handleScrollVelocity = (e: { velocity: number }) => {
      if (!cachedTargets || cachedTargets.length === 0) {
        cachedTargets = document.querySelectorAll<HTMLElement>("[data-kinetic-skew]");
      }
      if (cachedTargets.length === 0) return;

      const rawSkew = (e.velocity || 0) * 0.06;
      const clampedSkew = Math.max(-1.8, Math.min(1.8, rawSkew));

      if (resetTween) resetTween.kill();

      gsap.set(cachedTargets, { skewY: clampedSkew });

      resetTween = gsap.to(cachedTargets, {
        skewY: 0,
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    lenis.on("scroll", handleScrollVelocity);

    // Drive Lenis directly from GSAP Ticker for synchronized frame rate
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", handleScrollVelocity);
      if (resetTween) resetTween.kill();
      if (cachedTargets) gsap.set(cachedTargets, { clearProps: "skewY" });
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
