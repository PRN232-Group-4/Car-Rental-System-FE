"use client";

import React, { forwardRef } from "react";

interface DisplayLineProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Trục độ rộng Archivo wdth (ví dụ: 70 cho dòng 1, 125 cho dòng 2)
   */
  wdth?: number;
}

const DisplayLine = forwardRef<HTMLSpanElement, DisplayLineProps>(
  ({ children, className = "", style, wdth }, ref) => {
    const variationStyle: React.CSSProperties = wdth
      ? { fontVariationSettings: `'wdth' ${wdth}` }
      : {};

    return (
      <span className="block overflow-hidden pt-[0.14em] pb-[0.05em] leading-[1.05]">
        <span
          ref={ref}
          style={{
            ...variationStyle,
            ...style,
            willChange: "transform, opacity",
          }}
          className={`block transform-gpu ${className}`}
        >
          {children}
        </span>
      </span>
    );
  }
);

DisplayLine.displayName = "DisplayLine";

export default DisplayLine;
