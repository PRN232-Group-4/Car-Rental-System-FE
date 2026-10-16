"use client";

import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "./register";
import { motionTokens } from "./tokens";

export interface RevealOptions {
  y?: number;
  scale?: number;
  duration?: number;
  ease?: string;
  delay?: number;
  triggerStart?: string;
}

export interface RevealBatchOptions extends RevealOptions {
  stagger?: number;
  batchMax?: number;
}

/**
 * Animate a single element into view when scrolled to.
 */
export function useReveal(
  targetRef: React.RefObject<HTMLElement | null>,
  options: RevealOptions = {}
): void {
  const {
    y = motionTokens.distances.md,
    scale = 0.98,
    duration = motionTokens.durations.slow,
    ease = motionTokens.eases.out,
    delay = 0,
    triggerStart = "top 85%",
  } = options;

  useGSAP(
    () => {
      const el = targetRef.current;
      if (!el || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { opacity: 1, y: 0, scale: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { opacity: 0, y, scale },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration,
            ease,
            delay,
            scrollTrigger: {
              trigger: el,
              start: triggerStart,
              once: true,
            },
          }
        );
      });
    },
    { scope: targetRef, dependencies: [y, scale, duration, ease, delay, triggerStart] }
  );
}

/**
 * Animate a list or grid of items using ScrollTrigger.batch for high performance.
 */
export function useRevealBatch(
  containerRef: React.RefObject<HTMLElement | null>,
  itemSelector: string,
  options: RevealBatchOptions = {}
): void {
  const {
    y = motionTokens.distances.md,
    scale = 0.98,
    duration = motionTokens.durations.slow,
    ease = motionTokens.eases.out,
    stagger = 0.06,
    batchMax = 6,
    triggerStart = "top 90%",
  } = options;

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const items = container.querySelectorAll(itemSelector);
        gsap.set(items, { opacity: 1, y: 0, scale: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = container.querySelectorAll(itemSelector);
        if (items.length === 0) return;

        // Set initial state
        gsap.set(items, { opacity: 0, y, scale });

        ScrollTrigger.batch(items, {
          start: triggerStart,
          once: true,
          batchMax,
          onEnter: (batch) => {
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration,
              ease,
              stagger,
              overwrite: "auto",
            });
          },
        });
      });
    },
    { scope: containerRef, dependencies: [itemSelector, y, scale, duration, ease, stagger, batchMax, triggerStart] }
  );
}
