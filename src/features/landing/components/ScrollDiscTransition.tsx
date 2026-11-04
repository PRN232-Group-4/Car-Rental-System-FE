"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

interface ScrollDiscTransitionProps {
  color: "lake" | "sun" | "ink";
}

const COLOR_CLASSES = {
  lake: "bg-lake-600",
  sun: "bg-sun-600",
  ink: "bg-ink-950",
};

export default function ScrollDiscTransition({ color }: ScrollDiscTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current || !discRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(discRef.current, { scale: 1, opacity: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          discRef.current,
          { scale: 0.12, opacity: 0.6 },
          {
            scale: 2.8,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
              end: "bottom 15%",
              scrub: true,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative w-full h-[32vh] overflow-hidden pointer-events-none flex items-center justify-center select-none"
    >
      <div
        ref={discRef}
        className={`w-[60vw] max-w-[800px] aspect-square rounded-full ${COLOR_CLASSES[color]} will-change-transform origin-center`}
      />
    </div>
  );
}
