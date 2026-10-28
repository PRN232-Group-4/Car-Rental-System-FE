"use client";

import React, { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

export interface CadCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  interactive?: boolean;
  active?: boolean;
  className?: string;
  tiltIntensity?: number; // Default 2.5 degrees
}

/**
 * CadCard: Thẻ giao diện khí cụ kỹ thuật CAD chuẩn Awwwards SOTD.
 * Tích hợp 4 góc reticle L-shaped, dải header thông số lộ thiên,
 * và hiệu ứng 3D micro-tilt mượt mà 60fps qua GSAP quickTo.
 * Không dùng gradient CSS, không dùng inline backdrop-blur.
 */
export function CadCard({
  children,
  headerLeft,
  headerRight,
  interactive = true,
  active = false,
  className = "",
  tiltIntensity = 2.5,
  ...props
}: CadCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = cardRef.current;
      if (!el || !interactive || typeof window === "undefined") return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      const rotX = gsap.quickTo(el, "rotationX", { duration: 0.35, ease: "power2.out" });
      const rotY = gsap.quickTo(el, "rotationY", { duration: 0.35, ease: "power2.out" });
      const transY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power2.out" });

      const handlePointerMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        rotY(normX * tiltIntensity);
        rotX(-normY * tiltIntensity);
        transY(-4);
      };

      const handlePointerLeave = () => {
        rotX(0);
        rotY(0);
        transY(0);
      };

      el.addEventListener("pointermove", handlePointerMove, { passive: true });
      el.addEventListener("pointerleave", handlePointerLeave, { passive: true });

      return () => {
        el.removeEventListener("pointermove", handlePointerMove);
        el.removeEventListener("pointerleave", handlePointerLeave);
        gsap.set(el, { clearProps: "transform" });
      };
    },
    { scope: cardRef, dependencies: [interactive, tiltIntensity] }
  );

  const hasHeader = Boolean(headerLeft || headerRight);

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-xl bg-surface border transition-colors duration-200 select-none overflow-hidden ${
        active 
          ? "border-primary/80 shadow-md ring-1 ring-primary/30" 
          : "border-line-strong hover:border-primary/50 shadow-sm"
      } ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      {...props}
    >
      {/* 4 Precision L-Shaped Corner Reticles */}
      <span 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-line group-hover:border-primary transition-colors duration-200" 
      />
      <span 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-line group-hover:border-primary transition-colors duration-200" 
      />
      <span 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-1.5 left-1.5 w-2 h-2 border-b-[1.5px] border-l-[1.5px] border-line group-hover:border-primary transition-colors duration-200" 
      />
      <span 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-1.5 right-1.5 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-line group-hover:border-primary transition-colors duration-200" 
      />

      {/* Exposed Technical CAD Header Strip */}
      {hasHeader && (
        <div className="border-b border-line px-5 py-2.5 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-ink-3 bg-sunken/40">
          <div className="flex items-center gap-2 font-semibold text-ink-2">
            {headerLeft}
          </div>
          <div className="flex items-center gap-2">
            {headerRight}
          </div>
        </div>
      )}

      {/* Card Body Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

export default CadCard;
