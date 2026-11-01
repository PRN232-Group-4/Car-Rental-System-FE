"use client";

import Image from "next/image";

interface HalftoneImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function HalftoneImage({
  src,
  alt,
  width = 640,
  height = 360,
  className = "",
  priority = false,
}: HalftoneImageProps) {
  return (
    <div className={`relative overflow-hidden bg-ink-950 rounded-none border border-bone-100/20 ${className}`}>
      {/* SVG Duotone & Stipple Pattern Definitions */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="riso-duotone" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.2126 0.7152 0.0722 0 0
                      0.2126 0.7152 0.0722 0 0
                      0.2126 0.7152 0.0722 0 0
                      0      0      0      1 0"
            />
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.85" intercept="0.06" />
              <feFuncG type="linear" slope="0.82" intercept="0.07" />
              <feFuncB type="linear" slope="0.77" intercept="0.08" />
            </feComponentTransfer>
          </filter>
          <pattern id="stipple-pattern" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="#0F1215" opacity="0.4" />
          </pattern>
        </defs>
      </svg>

      {/* Rendered image with Riso duotone filter */}
      <div className="relative w-full h-full [filter:url(#riso-duotone)] contrast-125 select-none">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          unoptimized
          className="w-full h-full object-cover"
        />
      </div>

      {/* SVG Stipple Pattern Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-multiply" aria-hidden="true">
        <rect width="100%" height="100%" fill="url(#stipple-pattern)" />
      </svg>
    </div>
  );
}
