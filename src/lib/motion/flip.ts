"use client";

import { gsap, Flip } from "./register";

export interface FlipOptions {
  duration?: number;
  ease?: string;
  fade?: boolean;
  onComplete?: () => void;
}

/**
 * Record and animate layout changes with GSAP Flip.
 */
export function flipList(
  targets: gsap.DOMTarget,
  action: () => void,
  options: FlipOptions = {}
): Flip.FlipState | undefined {
  if (typeof window === "undefined") {
    action();
    return undefined;
  }

  const { duration = 0.45, ease = "power3.inOut", fade = true, onComplete } = options;

  // Capture state before DOM mutation
  const state = Flip.getState(targets);

  // Apply change
  action();

  // Animate from previous state
  Flip.from(state, {
    duration,
    ease,
    fade,
    nested: true,
    onComplete,
  });

  return state;
}
