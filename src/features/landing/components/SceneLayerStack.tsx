"use client";

import React from "react";
import manifestData from "../data/manifest.json";

export interface LayerPlacement {
  topPct: number;
  leftPct: number;
  widthPct: number;
  heightPct: number;
}

export interface LayerVariant {
  width: number;
  webp: string;
  avif: string;
}

export interface LayerItem {
  id: string;
  file: string;
  scene: string;
  z: number;
  speed: number;
  blend: "normal" | "screen" | "multiply";
  loading: "eager" | "lazy";
  fetchPriority?: "high" | "auto" | "low";
  maxWidth: number;
  placement: LayerPlacement;
  isPlaceholder: boolean;
  variants?: LayerVariant[];
}

interface SceneLayerStackProps {
  scene: "A" | "B";
  className?: string;
  /**
   * Cho phép truyền ref mapping nếu cần animation parallax riêng từng lớp
   */
  layerRefs?: Record<string, React.RefObject<HTMLDivElement | null>>;
  children?: React.ReactNode;
}

export default function SceneLayerStack({
  scene,
  className = "",
  layerRefs,
  children,
}: SceneLayerStackProps) {
  const layers = (manifestData.layers as LayerItem[]).filter(
    (l) => l.scene === scene
  );

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
    >
      {layers.map((layer) => {
        const customRef = layerRefs ? layerRefs[layer.id] : undefined;
        const { topPct, leftPct, widthPct, heightPct } = layer.placement;

        // Định vị theo % khung hình 16:9 gốc
        const positionStyle: React.CSSProperties = {
          position: "absolute",
          top: `${topPct}%`,
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
          zIndex: layer.z,
          mixBlendMode: layer.blend,
        };

        if (layer.isPlaceholder) {
          return (
            <div
              key={layer.id}
              ref={customRef}
              style={positionStyle}
              aria-label={`Thiếu asset: ${layer.file}`}
              className="border border-bone-100/20 bg-ink-800/80 text-bone-100/60 font-mono text-[10px] sm:text-xs tracking-wider flex flex-col items-center justify-center p-2 text-center pointer-events-none will-change-transform"
            >
              <span className="font-semibold text-sun-600">
                [THIẾU ASSET: {layer.file}]
              </span>
              <span className="text-[9px] text-bone-100/40 mt-1">
                z-{layer.z} · blend:{layer.blend} · {widthPct}%×{heightPct}%
              </span>
            </div>
          );
        }

        const bestWebp = layer.variants?.[0]?.webp || `/assets/landing/${layer.file}`;
        const srcSetWebp = layer.variants?.map((v) => `${v.webp} ${v.width}w`).join(", ");
        const srcSetAvif = layer.variants?.map((v) => `${v.avif} ${v.width}w`).join(", ");

        return (
          <div
            key={layer.id}
            ref={customRef}
            style={positionStyle}
            className="pointer-events-none will-change-transform"
          >
            <picture className="w-full h-full block">
              {srcSetAvif && <source type="image/avif" srcSet={srcSetAvif} />}
              {srcSetWebp && <source type="image/webp" srcSet={srcSetWebp} />}
              <img
                src={bestWebp}
                alt=""
                aria-hidden="true"
                loading={layer.loading}
                decoding="async"
                fetchPriority={layer.fetchPriority || "auto"}
                className="w-full h-full object-contain"
              />
            </picture>
          </div>
        );
      })}

      {/* Các thành phần DOM lồng giữa (ví dụ tiêu đề DOM z-30 ở Hero) */}
      {children}
    </div>
  );
}
