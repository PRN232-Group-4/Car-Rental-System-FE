"use client";

import React, { useRef, type ElementType } from "react";
import { useSplitReveal } from "@/lib/motion";

interface RevealTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
}

/**
 * Text reveal powered by GSAP SplitText (A7.2 / A7.3).
 * Preserves accessibility by assigning aria-label to parent and aria-hidden to split nodes.
 */
export default function RevealText({
  text,
  as: Component = "span",
  className = "",
  delay = 0,
  stagger = 0.04,
}: RevealTextProps) {
  const textRef = useRef<HTMLElement | null>(null);

  useSplitReveal(textRef, {
    type: "lines,words",
    duration: 0.8,
    stagger,
    delay: delay / 1000,
  });

  return (
    <Component
      ref={textRef}
      aria-label={text}
      className={`inline-block ${className}`.trim()}
    >
      {text}
    </Component>
  );
}
