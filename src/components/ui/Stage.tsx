"use client";

import React, { forwardRef } from "react";

export type StageVariant = "photo" | "ink" | "emerald";

export interface StageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: StageVariant;
  imageUrl?: string;
  imageAlt?: string;
  aspectRatio?: "16/9" | "21/9" | "auto";
  as?: React.ElementType;
}

export const Stage = forwardRef<HTMLDivElement, StageProps>(function Stage(
  {
    variant,
    imageUrl,
    imageAlt = "Showroom stage",
    aspectRatio = "auto",
    as: Component = "section",
    className = "",
    children,
    ...props
  },
  ref
) {
  const aspectStyle = aspectRatio && aspectRatio !== "auto" ? { aspectRatio } : undefined;
  const combinedStyle = { ...aspectStyle, ...props.style };

  if (variant === "photo") {
    return (
      <Component
        ref={ref}
        style={combinedStyle}
        className={`relative w-full overflow-hidden bg-stage-ink ${className}`.trim()}
        {...props}
      >
        {imageUrl && (
          <>
            {/* Real photography background */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center filter contrast-[1.05] saturate-[0.90] pointer-events-none"
              style={{ backgroundImage: `url(${imageUrl})` }}
              role="img"
              aria-label={imageAlt}
            />
            {/* Flat Scrim — strictly no gradient per A2 & A4.1 */}
            <div
              className="absolute inset-0 w-full h-full bg-scrim pointer-events-none"
              aria-hidden="true"
            />
          </>
        )}
        <div className="relative z-10 w-full">{children}</div>
      </Component>
    );
  }

  if (variant === "ink") {
    return (
      <Component
        ref={ref}
        style={combinedStyle}
        className={`relative w-full bg-stage-ink text-white overflow-hidden ${className}`.trim()}
        {...props}
      >
        <div className="relative z-10 w-full">{children}</div>
      </Component>
    );
  }

  // emerald
  return (
    <Component
      ref={ref}
      style={combinedStyle}
      className={`relative w-full bg-stage-emerald text-white overflow-hidden ${className}`.trim()}
      {...props}
    >
      <div className="relative z-10 w-full">{children}</div>
    </Component>
  );
});

export default Stage;
