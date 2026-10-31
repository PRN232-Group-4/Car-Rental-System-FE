"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

let isRegistered = false;

/**
 * Register GSAP plugins once on the client side.
 * Never runs during SSR / static export build.
 */
export function registerMotion(): void {
  if (typeof window === "undefined" || isRegistered) {
    return;
  }

  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, CustomEase, Flip, SplitText, DrawSVGPlugin);
  isRegistered = true;
}

// Auto-register when imported in browser environment
if (typeof window !== "undefined") {
  registerMotion();
}

export { gsap, useGSAP, ScrollTrigger, ScrollSmoother, CustomEase, Flip, SplitText, DrawSVGPlugin };
