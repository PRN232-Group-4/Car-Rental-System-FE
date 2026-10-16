"use client";

import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "./register";

export interface SplitRevealOptions {
  type?: "lines" | "words" | "chars" | "lines,words" | "words,chars";
  duration?: number;
  stagger?: number;
  ease?: string;
  delay?: number;
  triggerStart?: string;
}

/**
 * Text reveal using SplitText.
 * Automatically guarantees accessibility:
 * - Parent container gets original text as aria-label.
 * - Split parts get aria-hidden="true".
 * - Honors prefers-reduced-motion: reduce.
 */
export function useSplitReveal(
  targetRef: React.RefObject<HTMLElement | null>,
  options: SplitRevealOptions = {}
): void {
  const {
    type = "lines,words",
    duration = 0.8,
    stagger = 0.04,
    ease = "power4.out",
    delay = 0,
    triggerStart = "top 85%",
  } = options;

  useGSAP(
    () => {
      const el = targetRef.current;
      if (!el || typeof window === "undefined") return;

      const originalText = el.textContent || "";
      el.setAttribute("aria-label", originalText);

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { opacity: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = new SplitText(el, {
          type,
          linesClass: "overflow-hidden inline-block",
          wordsClass: "inline-block will-change-transform",
        });

        // Hide split items from assistive tech
        const parts = split.words.length > 0 ? split.words : split.lines;
        for (const part of parts) {
          part.setAttribute("aria-hidden", "true");
        }

        gsap.fromTo(
          parts,
          { opacity: 0, y: "100%" },
          {
            opacity: 1,
            y: "0%",
            duration,
            ease,
            stagger,
            delay,
            scrollTrigger: {
              trigger: el,
              start: triggerStart,
              once: true,
            },
          }
        );

        return () => {
          split.revert();
        };
      });
    },
    { scope: targetRef, dependencies: [type, duration, stagger, ease, delay, triggerStart] }
  );
}
