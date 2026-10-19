"use client";

import React, { useEffect, useRef } from "react";
import styles from "./rental-workspace-v4.module.css";

declare global {
  interface Window {
    __liquidPerformanceReport?: {
      totalFrames: number;
      durationMs: number;
      measuredFps: number;
      frameIntervals: number[];
      jsWorkDurations: number[];
      avgIntervalMs: number;
      maxIntervalMs: number;
      minIntervalMs: number;
      stdDevIntervalMs: number;
      droppedFrames: number;
      maxJsWorkMs: number;
      avgJsWorkMs: number;
    };
    __setLiquidProgress?: (progress: number, targetTheme?: "light" | "dark") => void;
  }
}

const DURATION = 1050; // 1050ms target duration (900-1200ms)
const N_POINTS = 192; // High-resolution contour for buttery smooth, chordless curves

// C2 continuous quintic smootherstep function: S(t) = 6t^5 - 15t^4 + 10t^3
function smootherstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

interface LiquidGeom {
  pathD: string;
  droplets: Array<{
    dx: number;
    dy: number;
    rMax: number;
    spawnP: number;
    growP: number;
    mergeStartP: number;
    mergeEndP: number;
    idShape: string;
    idBorder: string;
  }>;
  ox: number;
  oy: number;
}

function calculateLiquidGeometry(progress: number, ox: number, oy: number): LiquidGeom {
  const w = typeof window !== "undefined" ? window.innerWidth : 1920;
  const h = typeof window !== "undefined" ? window.innerHeight : 1080;
  const maxReach = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy)) * 1.35;

  const pEased = smootherstep(progress);
  const baseRadius = pEased * maxReach;

  // Asymmetric directional bias: liquid flows faster southwest into the stage (theta ≈ 2.42 rad ≈ 138.7 deg)
  const biasTheta = 2.42;

  // 3 satellite droplets with natural lifespan and smooth coalescence intervals
  const droplets = [
    { dx: -220, dy: 160, rMax: 24, spawnP: 0.12, growP: 0.22, mergeStartP: 0.36, mergeEndP: 0.52, idShape: "liquidDroplet1", idBorder: "meniscusDroplet1" },
    { dx: -390, dy: 90,  rMax: 30, spawnP: 0.18, growP: 0.30, mergeStartP: 0.46, mergeEndP: 0.62, idShape: "liquidDroplet2", idBorder: "meniscusDroplet2" },
    { dx: -310, dy: 290, rMax: 26, spawnP: 0.24, growP: 0.36, mergeStartP: 0.54, mergeEndP: 0.70, idShape: "liquidDroplet3", idBorder: "meniscusDroplet3" },
  ];

  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < N_POINTS; i++) {
    const theta = (2 * Math.PI * i) / N_POINTS;

    // 1. Asymmetric speed field
    const dirMultiplier = 1.0 + 0.32 * Math.cos(theta - biasTheta) + 0.12 * Math.sin(2 * (theta - biasTheta));

    // 2. Viscous lobes / flowing fingers extending ahead of wavefront with dynamic meander
    const theta1 = 2.25 + 0.06 * Math.sin(3.5 * progress);
    const diff1 = Math.atan2(Math.sin(theta - theta1), Math.cos(theta - theta1));
    const lobe1 = (progress > 0.06 && progress < 0.85)
      ? 135 * Math.sin(Math.PI * (progress - 0.06) / 0.79) * Math.exp(-(diff1 * diff1) / 0.18)
      : 0;

    const theta2 = 3.10 + 0.05 * Math.cos(4.0 * progress);
    const diff2 = Math.atan2(Math.sin(theta - theta2), Math.cos(theta - theta2));
    const lobe2 = (progress > 0.10 && progress < 0.85)
      ? 95 * Math.sin(Math.PI * (progress - 0.10) / 0.75) * Math.exp(-(diff2 * diff2) / 0.14)
      : 0;

    const theta3 = 1.55 + 0.05 * Math.sin(3.0 * progress);
    const diff3 = Math.atan2(Math.sin(theta - theta3), Math.cos(theta - theta3));
    const lobe3 = (progress > 0.12 && progress < 0.80)
      ? 80 * Math.sin(Math.PI * (progress - 0.12) / 0.68) * Math.exp(-(diff3 * diff3) / 0.12)
      : 0;

    // 3. Recessed viscous coves
    const diffCove1 = Math.atan2(Math.sin(theta - 1.88), Math.cos(theta - 1.88));
    const cove1 = (progress > 0.15 && progress < 0.75)
      ? -45 * Math.sin(Math.PI * (progress - 0.15) / 0.60) * Math.exp(-(diffCove1 * diffCove1) / 0.08)
      : 0;

    const diffCove2 = Math.atan2(Math.sin(theta - 2.68), Math.cos(theta - 2.68));
    const cove2 = (progress > 0.15 && progress < 0.75)
      ? -40 * Math.sin(Math.PI * (progress - 0.15) / 0.60) * Math.exp(-(diffCove2 * diffCove2) / 0.08)
      : 0;

    // 4. Multi-octave evolving fluid noise (organic capillary ripples)
    const waveNoise = baseRadius * (
      0.110 * Math.sin(3 * theta + progress * 4.2 + 0.7) +
      0.055 * Math.cos(5 * theta - progress * 5.0 + 1.3) +
      0.025 * Math.sin(9 * theta + progress * 6.8) +
      0.012 * Math.sin(13 * theta - progress * 8.5 + 2.1) +
      0.007 * Math.cos(17 * theta + progress * 10.2)
    );

    let r = baseRadius * dirMultiplier + lobe1 + lobe2 + lobe3 + cove1 + cove2 + waveNoise;

    // 5. Viscous bridging toward satellite droplets (surface tension coalescence)
    for (let j = 0; j < droplets.length; j++) {
      const drop = droplets[j];
      if (progress >= drop.spawnP && progress <= drop.mergeEndP + 0.05) {
        const dropDist = Math.hypot(drop.dx, drop.dy);
        const dropAngle = Math.atan2(drop.dy, drop.dx);
        const angleDiff = Math.atan2(Math.sin(theta - dropAngle), Math.cos(theta - dropAngle));
        const angularWidth = (drop.rMax / dropDist) * 1.6;

        const gapToDrop = dropDist - r;
        if (gapToDrop < 140 && Math.abs(angleDiff) < angularWidth * 2.2) {
          const bridgeFactor = Math.max(0, Math.min(1, (140 - gapToDrop) / 140));
          const bridgePull = Math.pow(bridgeFactor, 2.0) * Math.max(0, (dropDist + drop.rMax - r)) * Math.exp(-(angleDiff * angleDiff) / (2 * angularWidth * angularWidth));
          r += bridgePull;
        }
      }
    }

    points.push({
      x: ox + r * Math.cos(theta),
      y: oy + r * Math.sin(theta),
    });
  }

  // Catmull-Rom cubic Bezier path formulation
  let pathD = "M " + points[0].x.toFixed(1) + " " + points[0].y.toFixed(1);
  for (let i = 0; i < N_POINTS; i++) {
    const p0 = points[(i - 1 + N_POINTS) % N_POINTS];
    const p1 = points[i];
    const p2 = points[(i + 1) % N_POINTS];
    const p3 = points[(i + 2) % N_POINTS];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += " C " + cp1x.toFixed(1) + " " + cp1y.toFixed(1) + ", " + cp2x.toFixed(1) + " " + cp2y.toFixed(1) + ", " + p2.x.toFixed(1) + " " + p2.y.toFixed(1);
  }
  pathD += " Z";

  return { pathD, droplets, ox, oy };
}

function applyLiquidFrame(geom: LiquidGeom, progress: number) {
  const shape = document.getElementById("liquidFloodShape");
  if (shape) shape.setAttribute("d", geom.pathD);

  const meniscus = document.getElementById("meniscusBorder");
  if (meniscus) meniscus.setAttribute("d", geom.pathD);

  for (let j = 0; j < geom.droplets.length; j++) {
    const drop = geom.droplets[j];
    const elShape = document.getElementById(drop.idShape);
    const elBorder = document.getElementById(drop.idBorder);

    let curR = 0;
    let opacity = 0;

    if (progress >= drop.spawnP && progress < drop.growP) {
      const u = (progress - drop.spawnP) / (drop.growP - drop.spawnP);
      curR = drop.rMax * (3 * u * u - 2 * u * u * u);
      opacity = 1.0;
    } else if (progress >= drop.growP && progress < drop.mergeStartP) {
      curR = drop.rMax;
      opacity = 1.0;
    } else if (progress >= drop.mergeStartP && progress <= drop.mergeEndP) {
      const uMerge = (progress - drop.mergeStartP) / (drop.mergeEndP - drop.mergeStartP);
      curR = drop.rMax * Math.max(0, 1.0 - Math.pow(uMerge, 1.2));
      opacity = Math.max(0, 1.0 - Math.pow(uMerge, 1.5));
    } else {
      curR = 0;
      opacity = 0;
    }

    const dropX = geom.ox + drop.dx;
    const dropY = geom.oy + drop.dy;

    if (elShape) {
      elShape.setAttribute("cx", String(dropX));
      elShape.setAttribute("cy", String(dropY));
      elShape.setAttribute("r", curR.toFixed(1));
      elShape.style.opacity = opacity.toFixed(2);
    }
    if (elBorder) {
      elBorder.setAttribute("cx", String(dropX));
      elBorder.setAttribute("cy", String(dropY));
      elBorder.setAttribute("r", curR.toFixed(1));
      elBorder.style.opacity = opacity.toFixed(2);
    }
  }
}

function setupIncomingThemeOverlay(targetTheme: "light" | "dark") {
  const floodLayer = document.getElementById("liquidFloodLayer");
  const appShell = document.getElementById("rentalWorkspaceRoot") || document.querySelector('[data-portal="admin"]');
  if (!floodLayer || !appShell) return;

  // 1. Deep clone the container
  const clone = appShell.cloneNode(true) as HTMLElement;

  // 2. Strip ALL id attributes to guarantee ZERO duplicate IDs in document
  clone.removeAttribute("id");
  const elementsWithId = clone.querySelectorAll("[id]");
  for (let i = 0; i < elementsWithId.length; i++) {
    elementsWithId[i].removeAttribute("id");
  }

  // 3. Disable all interactive controls and strip form/action attributes
  const interactiveEls = clone.querySelectorAll("button, a, input, select, textarea, details, summary");
  for (let i = 0; i < interactiveEls.length; i++) {
    const el = interactiveEls[i];
    el.setAttribute("tabindex", "-1");
    el.setAttribute("disabled", "true");
    el.setAttribute("aria-hidden", "true");
    el.removeAttribute("href");
    el.removeAttribute("for");
    el.removeAttribute("name");
  }

  // 3b. Remove any nested transition layers to prevent duplicate recursive rendering
  const nestedOverlays = clone.querySelectorAll("#liquidFloodLayer, #liquidMeniscusSvg, [class*='liquid']");
  for (let i = 0; i < nestedOverlays.length; i++) {
    nestedOverlays[i].remove();
  }

  // 4. Mark inert and aria-hidden to isolate completely from accessibility tree
  clone.setAttribute("aria-hidden", "true");
  if ("inert" in clone) {
    (clone as any).inert = true;
  }
  clone.setAttribute("inert", "");

  // 5. Update theme and mount non-interactively
  floodLayer.setAttribute("data-admin-theme", targetTheme);
  floodLayer.setAttribute("data-theme", targetTheme);
  floodLayer.setAttribute("aria-hidden", "true");
  floodLayer.setAttribute("inert", "");
  floodLayer.replaceChildren(clone);
  floodLayer.style.display = "block";
}

function cleanupIncomingThemeOverlay() {
  const floodLayer = document.getElementById("liquidFloodLayer");
  if (floodLayer) {
    floodLayer.style.display = "none";
    floodLayer.replaceChildren();
  }
}

function getButtonOrigin(): { ox: number; oy: number } {
  const themeBtn = document.querySelector<HTMLElement>('[data-testid="admin-theme-toggle"]')
    || document.querySelector<HTMLElement>('button[aria-label*="giao diện"]')
    || document.querySelector<HTMLElement>('button[class*="themeToggle"]');
  if (themeBtn) {
    const rect = themeBtn.getBoundingClientRect();
    return { ox: rect.left + rect.width / 2, oy: rect.top + rect.height / 2 };
  }
  return { ox: typeof window !== "undefined" ? window.innerWidth - 80 : 1840, oy: 29 };
}

export function RentalLiquidTransition() {
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    // 1. Expose window.__setLiquidProgress for forensic automated verification
    window.__setLiquidProgress = (progress: number, targetTheme?: "light" | "dark") => {
      const currentIsDark = (document.documentElement.dataset.adminTheme || document.documentElement.getAttribute("data-theme")) === "dark";
      const actualTarget = targetTheme || (currentIsDark ? "light" : "dark");

      const { ox, oy } = getButtonOrigin();
      const geom = calculateLiquidGeometry(progress, ox, oy);

      const meniscusSvg = document.getElementById("liquidMeniscusSvg");
      const meniscusColor = actualTarget === "light" ? "rgba(245, 241, 236, 0.95)" : "rgba(200, 169, 107, 0.85)";
      const meniscusBorder = document.getElementById("meniscusBorder");
      const d1 = document.getElementById("meniscusDroplet1");
      const d2 = document.getElementById("meniscusDroplet2");
      const d3 = document.getElementById("meniscusDroplet3");

      if (meniscusBorder) meniscusBorder.setAttribute("stroke", meniscusColor);
      if (d1) d1.setAttribute("stroke", meniscusColor);
      if (d2) d2.setAttribute("stroke", meniscusColor);
      if (d3) d3.setAttribute("stroke", meniscusColor);

      if (progress > 0 && progress < 1.0) {
        if (meniscusSvg) meniscusSvg.style.display = "block";
        setupIncomingThemeOverlay(actualTarget);
      } else if (progress >= 1.0) {
        document.documentElement.dataset.adminTheme = actualTarget;
        try {
          window.localStorage.setItem("vrs-admin-theme", actualTarget);
        } catch {}
        window.dispatchEvent(new Event("vrs-admin-theme-change"));
        if (meniscusSvg) meniscusSvg.style.display = "none";
        cleanupIncomingThemeOverlay();
      } else {
        if (meniscusSvg) meniscusSvg.style.display = "none";
        cleanupIncomingThemeOverlay();
      }

      applyLiquidFrame(geom, progress);
    };

    // 2. Intercept theme toggle click when on /admin/rentals
    const executeFluidThemeToggle = () => {
      if (isTransitioningRef.current) return;

      // Reduced motion fallback: Instant switch
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const cur = (document.documentElement.dataset.adminTheme || "dark") === "dark" ? "light" : "dark";
        document.documentElement.dataset.adminTheme = cur;
        try {
          window.localStorage.setItem("vrs-admin-theme", cur);
        } catch {}
        window.dispatchEvent(new Event("vrs-admin-theme-change"));
        return;
      }

      isTransitioningRef.current = true;

      try {
        const { ox, oy } = getButtonOrigin();
        const currentIsDark = (document.documentElement.dataset.adminTheme || document.documentElement.getAttribute("data-theme")) === "dark";
        const targetTheme: "light" | "dark" = currentIsDark ? "light" : "dark";

        const meniscusColor = targetTheme === "light"
          ? "rgba(245, 241, 236, 0.95)"
          : "rgba(200, 169, 107, 0.85)";

        const meniscusSvg = document.getElementById("liquidMeniscusSvg");
        const meniscusBorder = document.getElementById("meniscusBorder");
        const d1 = document.getElementById("meniscusDroplet1");
        const d2 = document.getElementById("meniscusDroplet2");
        const d3 = document.getElementById("meniscusDroplet3");

        if (meniscusBorder) meniscusBorder.setAttribute("stroke", meniscusColor);
        if (d1) d1.setAttribute("stroke", meniscusColor);
        if (d2) d2.setAttribute("stroke", meniscusColor);
        if (d3) d3.setAttribute("stroke", meniscusColor);
        if (meniscusSvg) meniscusSvg.style.display = "block";

        setupIncomingThemeOverlay(targetTheme);

        const frameIntervals: number[] = [];
        const jsWorkDurations: number[] = [];
        let lastFrameTime = 0;
        const startTime = performance.now();

        const step = (now: number) => {
          const jsStart = performance.now();

          const elapsed = now - startTime;
          const progress = Math.min(1.0, elapsed / DURATION);
          const geom = calculateLiquidGeometry(progress, ox, oy);
          applyLiquidFrame(geom, progress);

          const jsDuration = performance.now() - jsStart;
          jsWorkDurations.push(jsDuration);

          if (lastFrameTime > 0) {
            frameIntervals.push(now - lastFrameTime);
          }
          lastFrameTime = now;

          if (progress < 1.0) {
            requestAnimationFrame(step);
          } else {
            setTimeout(() => {
              try {
                document.documentElement.dataset.adminTheme = targetTheme;
                try {
                  window.localStorage.setItem("vrs-admin-theme", targetTheme);
                } catch {}
                window.dispatchEvent(new Event("vrs-admin-theme-change"));

                if (meniscusSvg) meniscusSvg.style.display = "none";
                cleanupIncomingThemeOverlay();
                const shape = document.getElementById("liquidFloodShape");
                if (shape) shape.setAttribute("d", "M -1000 -1000 H 6000 V 6000 H -1000 Z");
                if (d1) d1.setAttribute("r", "0");
                if (d2) d2.setAttribute("r", "0");
                if (d3) d3.setAttribute("r", "0");

                const totalDuration = performance.now() - startTime;
                const count = frameIntervals.length;
                const avgInterval = count > 0 ? frameIntervals.reduce((a, b) => a + b, 0) / count : 16.6;
                const avgJs = jsWorkDurations.reduce((a, b) => a + b, 0) / jsWorkDurations.length;
                const maxJs = Math.max(...jsWorkDurations);
                const minInterval = count > 0 ? Math.min(...frameIntervals) : 16.6;
                const maxInterval = count > 0 ? Math.max(...frameIntervals) : 16.6;
                const variance = count > 0 ? frameIntervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / count : 0;
                const stdDev = Math.sqrt(variance);
                const dropped = frameIntervals.filter((i) => i > 24.0).length;
                const fps = totalDuration > 0 ? count / (totalDuration / 1000) : 60;

                window.__liquidPerformanceReport = {
                  totalFrames: count,
                  durationMs: parseFloat(totalDuration.toFixed(1)),
                  measuredFps: parseFloat(fps.toFixed(1)),
                  frameIntervals: frameIntervals.map((i) => parseFloat(i.toFixed(2))),
                  jsWorkDurations: jsWorkDurations.map((j) => parseFloat(j.toFixed(3))),
                  avgIntervalMs: parseFloat(avgInterval.toFixed(2)),
                  maxIntervalMs: parseFloat(maxInterval.toFixed(2)),
                  minIntervalMs: parseFloat(minInterval.toFixed(2)),
                  stdDevIntervalMs: parseFloat(stdDev.toFixed(2)),
                  droppedFrames: dropped,
                  maxJsWorkMs: parseFloat(maxJs.toFixed(3)),
                  avgJsWorkMs: parseFloat(avgJs.toFixed(3)),
                };
              } finally {
                isTransitioningRef.current = false;
              }
            }, 35);
          }
        };

        requestAnimationFrame(step);
      } catch (err) {
        console.error("Liquid theme transition error:", err);
        cleanupIncomingThemeOverlay();
        isTransitioningRef.current = false;
      }
    };

    // Attach capturing click listener to the theme toggle button in the shell
    const handleCaptureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const themeBtn = target.closest<HTMLElement>(
        '[data-testid="admin-theme-toggle"], button[aria-label*="giao diện"], button[class*="themeToggle"]'
      );
      if (themeBtn) {
        e.preventDefault();
        e.stopPropagation();
        executeFluidThemeToggle();
      }
    };

    window.addEventListener("click", handleCaptureClick, true);

    return () => {
      window.removeEventListener("click", handleCaptureClick, true);
      delete window.__setLiquidProgress;
      delete window.__liquidPerformanceReport;
    };
  }, []);

  return (
    <>
      {/* SVG ClipPath Definition (Zero Visual Footprint) */}
      <svg style={{ position: "fixed", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
        <clipPath id="liquidFloodClip" clipPathUnits="userSpaceOnUse">
          <path id="liquidFloodShape" d="M 0 0" />
          <circle id="liquidDroplet1" cx="0" cy="0" r="0" />
          <circle id="liquidDroplet2" cx="0" cy="0" r="0" />
          <circle id="liquidDroplet3" cx="0" cy="0" r="0" />
        </clipPath>
      </svg>

      {/* Meniscus Viscous Edge Highlight */}
      <svg className={styles.liquidMeniscusSvg} id="liquidMeniscusSvg" aria-hidden="true">
        <defs>
          <filter id="meniscusGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          id="meniscusBorder"
          d="M 0 0"
          fill="none"
          stroke="rgba(200, 169, 107, 0.85)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#meniscusGlowFilter)"
        />
        <circle id="meniscusDroplet1" cx="0" cy="0" r="0" fill="none" stroke="rgba(200, 169, 107, 0.85)" strokeWidth="2.5" filter="url(#meniscusGlowFilter)" />
        <circle id="meniscusDroplet2" cx="0" cy="0" r="0" fill="none" stroke="rgba(200, 169, 107, 0.85)" strokeWidth="2.5" filter="url(#meniscusGlowFilter)" />
        <circle id="meniscusDroplet3" cx="0" cy="0" r="0" fill="none" stroke="rgba(200, 169, 107, 0.85)" strokeWidth="2.5" filter="url(#meniscusGlowFilter)" />
      </svg>

      {/* Incoming Theme Surface Overlay (Inert, Non-Interactive) */}
      <div id="liquidFloodLayer" className={styles.liquidIncomingOverlay} aria-hidden="true" />
    </>
  );
}

export default RentalLiquidTransition;
