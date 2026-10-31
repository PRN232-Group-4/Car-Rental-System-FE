/**
 * Motion tokens calibrated to DESIGN.md v3.0 (A4.3, A7.2).
 * Strictly mirrors the CSS timing tokens in globals.css.
 */
export const motionTokens = {
  durations: {
    fast: 0.16,
    base: 0.32,
    slow: 0.64,
    cine: 1.1,
  },
  eases: {
    out: "power2.out",
    inOut: "power3.inOut",
    editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
    cinematic: "cubic-bezier(0.25, 1, 0.5, 1)",
  },
  stagger: {
    tight: 0.04,
    base: 0.08,
    relaxed: 0.12,
  },
  distances: {
    sm: 12,
    md: 20,
    lg: 32,
    xl: 48,
  },
};
