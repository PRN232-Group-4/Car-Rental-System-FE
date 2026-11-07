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
  tiltIntensity?: number; // Preserved for backwards compatibility
}

/**
 * CadCard: Thẻ bề mặt kiến trúc thanh lịch (Editorial Architectural Surface).
 * Loại bỏ hoàn toàn 4 góc reticle giả tạo và hiệu ứng nghiêng 3D cơ học.
 * Viền tinh tế với chỉ báo trạng thái kích hoạt, tương phản sắc nét trên mọi nền.
 */
export function CadCard({
  children,
  headerLeft,
  headerRight,
  interactive = true,
  active = false,
  className = "",
  tiltIntensity: _tiltIntensity = 2.5,
  ...props
}: CadCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = cardRef.current;
      if (!el || !interactive || typeof window === "undefined") return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      const transY = gsap.quickTo(el, "y", { duration: 0.28, ease: "power2.out" });

      const handlePointerEnter = () => {
        transY(-3);
      };

      const handlePointerLeave = () => {
        transY(0);
      };

      el.addEventListener("pointerenter", handlePointerEnter, { passive: true });
      el.addEventListener("pointerleave", handlePointerLeave, { passive: true });

      return () => {
        el.removeEventListener("pointerenter", handlePointerEnter);
        el.removeEventListener("pointerleave", handlePointerLeave);
        gsap.set(el, { clearProps: "transform" });
      };
    },
    { scope: cardRef, dependencies: [interactive] }
  );

  const hasHeader = Boolean(headerLeft || headerRight);

  return (
    <div
      ref={cardRef}
      className={`group relative bg-surface border transition-colors duration-200 select-none overflow-hidden ${
        active
          ? "border-primary/80 ring-1 ring-primary/25"
          : "border-line-strong hover:border-line-strong"
      } ${className}`}
      {...props}
    >
      {/* Top Active Indicator Bar */}
      {active && (
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[2px] bg-primary z-20"
        />
      )}

      {/* Architectural Header Strip */}
      {hasHeader && (
        <div className="border-b border-line px-5 py-2.5 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-ink-3 bg-sunken/30">
          <div className="flex items-center gap-2 font-semibold text-ink-2">
            {headerLeft}
          </div>
          <div className="flex items-center gap-2 text-ink-3">
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
