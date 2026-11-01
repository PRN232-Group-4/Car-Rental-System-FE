"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

export default function CursorDisc() {
  const discRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!discRef.current || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const disc = discRef.current;
        if (!disc) return;

        const xTo = gsap.quickTo(disc, "x", { duration: 0.18, ease: "power2.out" });
        const yTo = gsap.quickTo(disc, "y", { duration: 0.18, ease: "power2.out" });
        const scaleTo = gsap.quickTo(disc, "scale", { duration: 0.15, ease: "power2.out" });

        const handleMouseMove = (e: MouseEvent) => {
          xTo(e.clientX);
          yTo(e.clientY);
        };

        const handleMouseDown = () => scaleTo(0.75);
        const handleMouseUp = () => scaleTo(1.0);

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mousedown", handleMouseDown, { passive: true });
        window.addEventListener("mouseup", handleMouseUp, { passive: true });

        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mousedown", handleMouseDown);
          window.removeEventListener("mouseup", handleMouseUp);
        };
      });

      return () => mm.revert();
    },
    { scope: discRef }
  );

  return (
    <div
      ref={discRef}
      aria-hidden="true"
      className="hidden md:block fixed top-0 left-0 w-3.5 h-3.5 rounded-full bg-bone-100 pointer-events-none z-[100] mix-blend-difference -translate-x-1/2 -translate-y-1/2 will-change-transform"
    />
  );
}
