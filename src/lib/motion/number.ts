"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "./register";

export interface CountUpOptions {
  from?: number;
  duration?: number;
  ease?: string;
  decimals?: number;
  formatter?: (val: number) => string;
}

/**
 * Animate numbers counting up on enter.
 * Immediately sets target number if prefers-reduced-motion: reduce.
 */
export function useCountUp(
  targetRef: React.RefObject<HTMLElement | null>,
  targetValue: number,
  options: CountUpOptions = {}
): void {
  const {
    from = 0,
    duration = 0.9,
    ease = "power2.out",
    decimals = 0,
    formatter = (n) => n.toLocaleString("vi-VN"),
  } = options;

  useGSAP(
    () => {
      const el = targetRef.current;
      if (!el || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.textContent = formatter(targetValue);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const obj = { val: from };
        gsap.to(obj, {
          val: targetValue,
          duration,
          ease,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
          onUpdate: () => {
            const formatted = decimals > 0 ? obj.val.toFixed(decimals) : Math.round(obj.val);
            el.textContent = formatter(Number(formatted));
          },
        });
      });
    },
    { scope: targetRef, dependencies: [targetValue, from, duration, ease, decimals] }
  );
}
