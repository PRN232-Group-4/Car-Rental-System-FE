"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "./register";

/**
 * Creates high-performance hover coordinate trackers using gsap.quickTo.
 * Strictly forbidden to render a custom cursor.
 */
export function createQuickHover(
  target: HTMLElement,
  options: { duration?: number; ease?: string } = {}
): {
  toX: gsap.QuickToFunc;
  toY: gsap.QuickToFunc;
} {
  const { duration = 0.3, ease = "power2.out" } = options;

  const toX = gsap.quickTo(target, "x", { duration, ease });
  const toY = gsap.quickTo(target, "y", { duration, ease });

  return { toX, toY };
}

/**
 * Hook providing subtle magnetic pull (±4px) for interactive CTA buttons.
 * Disabled on touch and prefers-reduced-motion: reduce.
 */
// Cung cấp phản hồi xúc giác vật lý cao cấp, kích thích hành vi nhấp chuột.
export function useMagneticHover(
  targetRef: React.RefObject<HTMLElement | null>,
  enabled: boolean = true
): void {
  useGSAP(
    () => {
      const el = targetRef.current;
      if (!el || !enabled || typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;

      const toX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power2.out" });
      const toY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power2.out" });

      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        const clampedX = Math.max(-4, Math.min(4, relX * 0.2));
        const clampedY = Math.max(-4, Math.min(4, relY * 0.2));
        toX(clampedX);
        toY(clampedY);
      };

      const handleMouseLeave = () => {
        toX(0);
        toY(0);
      };

      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseleave", handleMouseLeave);
        gsap.set(el, { x: 0, y: 0 });
      };
    },
    { scope: targetRef, dependencies: [enabled] }
  );
}
