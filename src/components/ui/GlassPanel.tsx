"use client";

import React, { forwardRef } from "react";

export type GlassLayer = "1" | "2" | "3" | "ink" | "lite" | "admin";
export type GlassRadius = "control" | "card" | "panel" | "pill" | "none";

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  layer?: GlassLayer;
  lift?: boolean;
  rounded?: GlassRadius;
  as?: React.ElementType;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel(
  {
    layer = "lite",
    lift = false,
    rounded = "card",
    as: Component = "div",
    className = "",
    children,
    ...props
  },
  ref
) {
  const layerClasses: Record<GlassLayer, string> = {
    "1": "glass-1",
    "2": "glass-2",
    "3": "glass-3",
    ink: "glass-ink text-white",
    lite: "glass-lite",
    admin: "glass-admin",
  };

  const radiusClasses: Record<GlassRadius, string> = {
    control: "rounded-none",
    card: "rounded-none",
    panel: "rounded-none",
    pill: "rounded-none",
    none: "rounded-none",
  };

  const liftClass = lift ? "glass-lift" : "";

  return (
    <Component
      ref={ref}
      className={`${layerClasses[layer]} ${radiusClasses[rounded]} ${liftClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
});

export default GlassPanel;
