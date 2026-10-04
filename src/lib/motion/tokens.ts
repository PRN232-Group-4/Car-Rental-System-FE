/**
 * Motion tokens calibrated to DESIGN.md v3.0 (A4.3, A7.2).
 * Strictly mirrors the CSS timing tokens in globals.css.
 */
export const motionTokens = {
  durations: {
    fast: 0.16, // 160ms
    base: 0.32, // 320ms
    slow: 0.64, // 640ms
    cine: 1.1,  // 1100ms
  },
  eases: {
    out: "expo.out",
    inOut: "power3.inOut",
    press: "power2.out",
    pop: "back.out(1.4)",
    bounce: "back.out(1.2)",
    spring: "elastic.out(1, 0.75)",
    pulse: "sine.inOut",
    linear: "none",
  },
  distances: {
    sm: 12,
    md: 24,
    lg: 32,
    xl: 48,
  },
} as const;
