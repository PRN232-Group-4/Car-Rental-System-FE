"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType } from "react";

interface RevealTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** delay (ms) before the first character starts */
  delay?: number;
  /** stagger (ms) between characters (default: 18ms for snappy kinetic feel) */
  stagger?: number;
}

/**
 * Kinetic character-by-character text reveal with spring bounce dynamics.
 * Maintains local React state so text NEVER unmounts, blinks, or disappears
 * when scrolling up and down.
 */
export default function RevealText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = 18,
}: RevealTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const el = containerRef.current;
    if (!el) return;

    const show = () => setIsVisible(true);

    // Accessibility: reduced motion — show on the next frame, no animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(show);
      return () => cancelAnimationFrame(frame);
    }

    // Already in viewport on mount (e.g. hero above the fold): reveal next frame.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const frame = requestAnimationFrame(show);
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          observer.disconnect(); // Once revealed, stay permanently revealed
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -4% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");
  // Pure prefix-sum of character offsets per word (no mutation during render).
  const wordOffsets = words.map((_, index) =>
    words.slice(0, index).reduce((sum, w) => sum + w.length + 1, 0)
  );

  return (
    <Tag
      ref={containerRef}
      className={`reveal-kinetic-text ${isVisible ? "is-visible" : ""} ${className}`.trim()}
    >
      {words.map((word, wordIndex) => {
        const chars = Array.from(word);
        const wordCharStartIndex = wordOffsets[wordIndex];

        return (
          <span
            key={`word-${wordIndex}-${word}`}
            className="inline-block whitespace-nowrap mr-[0.28em] last:mr-0 align-top"
          >
            {chars.map((char, charIndex) => {
              const charDelay = delay + (wordCharStartIndex + charIndex) * stagger;
              return (
                <span
                  key={`char-${charIndex}-${char}`}
                  className={`inline-block ${
                    isVisible ? "char-kinetic-jump" : "opacity-0"
                  }`}
                  style={
                    {
                      "--char-delay": `${charDelay}ms`,
                    } as CSSProperties
                  }
                >
                  {char}
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
