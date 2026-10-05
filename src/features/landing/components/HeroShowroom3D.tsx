"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export interface HeroShowroom3DProps {
  posterUrl?: string;
  modelUrl?: string;
  alt?: string;
  className?: string;
}

/**
 * HeroShowroom3D Component according to DESIGN.md Section A8.
 *
 * NOTE: As required by DESIGN.md Section A8:
 * - If no valid GLB asset exists in public/models/, we MUST render a static poster fallback.
 * - Under NO circumstances do we construct fake geometric 3D cars (cubes, cylinders).
 */
export function HeroShowroom3D({
  posterUrl = "/assets/hero-hai-van.jpg",
  modelUrl,
  alt = "Thong Dong 3D Showroom Poster",
  className = "",
}: HeroShowroom3DProps) {
  const [hasModel, setHasModel] = useState<boolean>(false);

  useEffect(() => {
    // Check if model URL is supplied and accessible
    if (!modelUrl) {
      if (process.env.NODE_ENV === "development") {
        console.info(
          "[HeroShowroom3D] No GLB model provided in public/models/. Rendering high-fidelity poster fallback per DESIGN.md Section A8."
        );
      }
      return;
    }

    let active = true;
    fetch(modelUrl, { method: "HEAD" })
      .then((res) => {
        if (active) {
          setHasModel(res.ok);
        }
      })
      .catch(() => {
        if (active) {
          setHasModel(false);
        }
      });

    return () => {
      active = false;
    };
  }, [modelUrl]);

  return (
    <div
      className={`relative w-full h-full min-h-[360px] overflow-hidden rounded-3xl bg-stage-ink ${className}`.trim()}
      role="region"
      aria-label="Khu vực trưng bày xe 3D hoặc hình ảnh đại diện"
    >
      {!hasModel && (
        <div className="relative w-full h-full min-h-[360px]">
          <Image
            src={posterUrl}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center filter contrast-[1.05]"
          />
          {/* Flat scrim per A4.1 */}
          <div
            className="absolute inset-0 bg-[var(--scrim)] pointer-events-none"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

export default HeroShowroom3D;
