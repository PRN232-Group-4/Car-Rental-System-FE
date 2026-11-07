"use client";

import React, { useRef } from "react";
import { useSplitReveal } from "@/lib/motion";

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  kicker?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  badge,
  kicker,
  align = "left",
  dark = false,
  className = "",
}: SectionHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useSplitReveal(headingRef, {
    type: "lines,words",
    duration: 0.8,
    stagger: 0.04,
  });

  const alignClass = align === "center" ? "text-center items-center mx-auto" : "text-left items-start";
  const titleColor = dark ? "text-white" : "text-ink";
  const subtitleColor = dark ? "text-white/80" : "text-ink-2";
  const tagText = kicker || badge;

  return (
    <div className={`flex flex-col max-w-3xl mb-8 sm:mb-12 ${alignClass} ${className}`.trim()}>
      {tagText && (
        <span
          className={`inline-flex items-center text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 mb-3 ${
            dark
              ? "bg-surface/10 text-white border border-white/15"
              : "bg-primary-tint text-primary border border-primary/20"
          }`}
        >
          {tagText}
        </span>
      )}
      <h2
        ref={headingRef}
        aria-label={title}
        className={`font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight ${titleColor}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${subtitleColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
