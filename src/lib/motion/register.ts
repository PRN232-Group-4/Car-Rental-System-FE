"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

let isRegistered = false;

/**
 * Register GSAP plugins once on the client side.
 * Never runs during SSR / static export build.
 */
export function registerMotion(): void {
  if (typeof window === "undefined" || isRegistered) {
    return;
  }

  gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, SplitText);
  isRegistered = true;
}

// Auto-register when imported in browser environment
if (typeof window !== "undefined") {
  registerMotion();
}

export { gsap, useGSAP, ScrollTrigger, Flip, SplitText };
