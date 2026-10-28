"use client";

import React, { useEffect, useState } from "react";
import { GlobalLiquidThemeTransition } from "@/components/layout/GlobalLiquidThemeTransition";

/**
 * Backward compatibility bridge for Transit Desk Shell.
 * If GlobalLiquidThemeTransition is already mounted at root (layout.tsx),
 * this returns null to eliminate duplicate DOM IDs and duplicate transition handlers.
 */
export function RentalLiquidTransition() {
  const [needsFallback, setNeedsFallback] = useState(false);

  useEffect(() => {
    // If root GlobalLiquidThemeTransition is absent, render local instance
    if (typeof document !== "undefined" && !document.getElementById("liquidFloodClip")) {
      setNeedsFallback(true);
    }
  }, []);

  if (!needsFallback) return null;
  return <GlobalLiquidThemeTransition />;
}

export default RentalLiquidTransition;
