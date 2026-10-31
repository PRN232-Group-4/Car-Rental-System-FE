"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/register";

/**
 * ContinuousBlueprint: Canvas 60fps mô phỏng lưới tọa độ kiến trúc từ tính
 * và các dòng chảy khí động học (Aerodynamic Wind-Tunnel Streamlines) phong cách Active Theory.
 * Tự động chuyển đổi giữa chế độ theo dõi con trỏ (Desktop) và sóng điều hòa tự nhiên (Mobile/Touch).
 * Tuyệt đối không dùng gradient CSS, không dùng emoji, tuân thủ DESIGN.md A11.
 */
export default function ContinuousBlueprint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mouse coordinates and magnetic target
    const mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999 };
    const magneticRadius = 240;

    const handlePointerMove = (e: PointerEvent) => {
      if (isTouch) return;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Grid spacing
    const spacing = 80;

    // Streamline configuration
    const streamlines = [
      { yOffset: 0.18, amplitude: 24, frequency: 0.0018, speed: 1.2, phase: 0 },
      { yOffset: 0.26, amplitude: 32, frequency: 0.0014, speed: 0.9, phase: 1.5 },
      { yOffset: 0.35, amplitude: 28, frequency: 0.0016, speed: 1.1, phase: 3.0 },
      { yOffset: 0.44, amplitude: 20, frequency: 0.0020, speed: 1.4, phase: 4.5 },
    ];

    let time = 0;

    const render = () => {
      time += 0.016;

      // Smooth mouse interpolation
      if (!isTouch) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      }

      ctx.clearRect(0, 0, width, height);

      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.dataset.theme === "dark";

      // 1. Draw Aerodynamic Wind-Tunnel Streamlines in Hero / Studio Zone
      if (!prefersReducedMotion) {
        ctx.lineWidth = 1;
        streamlines.forEach((line, idx) => {
          const baseY = height * line.yOffset;
          ctx.beginPath();

          const waveColor = isDark
            ? idx === 1 ? "rgba(246, 186, 124, 0.22)" : "rgba(241, 245, 249, 0.07)"
            : idx === 1 ? "rgba(180, 83, 9, 0.20)" : "rgba(15, 23, 42, 0.05)";

          ctx.strokeStyle = waveColor;

          for (let x = 0; x <= width; x += 20) {
            const mouseInfluence =
              !isTouch && Math.abs(x - mouse.x) < 300
                ? ((300 - Math.abs(x - mouse.x)) / 300) * 15 * Math.sin(time * 3)
                : 0;

            const y =
              baseY +
              Math.sin(x * line.frequency + time * line.speed + line.phase) * line.amplitude +
              mouseInfluence;

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        });

        // Technical CAD Dimension Callouts at top right of Hero stream
        ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
        ctx.fillStyle = isDark ? "rgba(246, 186, 124, 0.35)" : "rgba(180, 83, 9, 0.40)";
        const cadText = "WHEELBASE: 2,450 MM // TRACK: 1,590 MM // DRAG COEFF: 0.29 Cd";
        ctx.fillText(cadText, Math.max(24, width - 420), height * 0.22);
      }

      // 2. Draw Hairline Coordinate Crosshairs
      const startX = (spacing / 2);
      const startY = (spacing / 2);

      const normalColor = isDark ? "rgba(241, 245, 249, 0.04)" : "rgba(15, 23, 42, 0.04)";
      const highlightColor = isDark ? "rgba(246, 186, 124, 0.85)" : "rgba(180, 83, 9, 0.80)";

      for (let x = startX; x < width; x += spacing) {
        for (let y = startY; y < height; y += spacing) {
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          const isNear = !isTouch && distToMouse < magneticRadius;

          ctx.save();
          ctx.translate(x, y);

          if (isNear) {
            const factor = 1 - distToMouse / magneticRadius;
            const rotation = factor * (Math.PI / 4); // Max 45 degrees
            ctx.rotate(rotation);
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1 + factor * 0.5;
            const arm = 3.5 + factor * 2;

            ctx.beginPath();
            ctx.moveTo(-arm, 0);
            ctx.lineTo(arm, 0);
            ctx.moveTo(0, -arm);
            ctx.lineTo(0, arm);
            ctx.stroke();
          } else {
            // Subtle ambient float on mobile/touch
            if (isTouch && !prefersReducedMotion) {
              const ambientWave = Math.sin(time * 0.8 + (x + y) * 0.005);
              if (ambientWave > 0.85) {
                ctx.strokeStyle = isDark ? "rgba(246, 186, 124, 0.25)" : "rgba(180, 83, 9, 0.20)";
              } else {
                ctx.strokeStyle = normalColor;
              }
            } else {
              ctx.strokeStyle = normalColor;
            }
            ctx.lineWidth = 0.75;
            const arm = 2.5;

            ctx.beginPath();
            ctx.moveTo(-arm, 0);
            ctx.lineTo(arm, 0);
            ctx.moveTo(0, -arm);
            ctx.lineTo(0, arm);
            ctx.stroke();
          }

          ctx.restore();
        }
      }
    };

    gsap.ticker.add(render);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
