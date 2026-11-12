"use client";

import React, { useRef } from "react";
import { useSplitReveal } from "@/lib/motion";
import { cn } from "@/lib/cn";

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
  /** Heading level; use "h1" when the heading opens the page. */
  as?: "h1" | "h2";
}

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  dark = false,
  className = "",
  as: Heading = "h2",
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

  return (
    <div className={cn("flex flex-col max-w-3xl mb-8 sm:mb-12", alignClass, className)}>
      <Heading
        ref={headingRef}
        aria-label={title}
        className={`font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight ${titleColor}`}
      >
        {title}
      </Heading>
      {subtitle && (
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${subtitleColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
