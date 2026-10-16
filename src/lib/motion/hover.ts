"use client";

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
