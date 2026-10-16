"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "./register";

export interface ParallaxOptions {
  speed?: number; // Distance in px, e.g. -40 or 40
  scrub?: number | boolean;
  start?: string;
  end?: string;
}

/**
 * Performant scrubbed parallax animation strictly animating transform (y).
 * Automatically disabled on mobile (<768px) and prefers-reduced-motion.
 */
export function useParallax(
  targetRef: React.RefObject<HTMLElement | null>,
  options: ParallaxOptions = {}
): void {
  const { speed = -30, scrub = 0.8, start = "top bottom", end = "bottom top" } = options;

  useGSAP(
    () => {
      const el = targetRef.current;
      if (!el || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce), (max-width: 767px)", () => {
        gsap.set(el, { y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        gsap.fromTo(
          el,
          { y: -speed },
          {
            y: speed,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start,
              end,
              scrub,
            },
          }
        );
      });
    },
    { scope: targetRef, dependencies: [speed, scrub, start, end] }
  );
}
