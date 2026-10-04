"use client";

import { gsap } from "./register";

export interface MotionMediaContext {
  isReduceMotion: boolean;
  isMobile: boolean;
  isDesktop: boolean;
}

/**
 * Creates a configured gsap.matchMedia instance honoring:
 * 1. prefers-reduced-motion: reduce (jump immediately to final state, no loop, no parallax)
 * 2. mobile: max-width: 767px (reduced motion distance, unpin desktop story)
 * 3. desktop: min-width: 768px
 */
export function createMotionMedia(
  setup: (context: {
    conditions: {
      reduce: boolean;
      mobile: boolean;
      desktop: boolean;
    };
  }) => void | (() => void),
  scope?: React.RefObject<HTMLElement | null> | HTMLElement
): gsap.MatchMedia {
  const mm = gsap.matchMedia(scope);

  mm.add(
    {
      reduce: "(prefers-reduced-motion: reduce)",
      mobile: "(max-width: 767px)",
      desktop: "(min-width: 768px)",
    },
    (context) => {
      const { reduce, mobile, desktop } = context.conditions as {
        reduce: boolean;
        mobile: boolean;
        desktop: boolean;
      };

      return setup({
        conditions: {
          reduce: Boolean(reduce),
          mobile: Boolean(mobile),
          desktop: Boolean(desktop),
        },
      });
    }
  );

  return mm;
}
