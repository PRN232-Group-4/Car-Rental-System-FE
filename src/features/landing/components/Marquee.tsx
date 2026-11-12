"use client";

import { useRef } from "react";
import { ShieldCheck, Zap, Award, RefreshCw, Cpu, Activity } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

export default function Marquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !trackRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const track = trackRef.current;
      const tween = gsap.to(track, {
        xPercent: -50,
        ease: "none",
        duration: 40,
        repeat: -1,
      });

      const container = containerRef.current;
      const onEnter = () => tween.pause();
      const onLeave = () => tween.play();

      container?.addEventListener("mouseenter", onEnter);
      container?.addEventListener("mouseleave", onLeave);

      return () => {
        tween.kill();
        container?.removeEventListener("mouseenter", onEnter);
        container?.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: containerRef }
  );

  const items = [
    { tag: "MULTI-CATEGORY", desc: "Ô Tô Xăng & Ô Tô Điện", icon: Zap },
    { tag: "CHAUFFEUR & SELF-DRIVE", desc: "Linh Hoạt Tự Lái Hoặc Kèm Tài Xế", icon: Award },
    { tag: "DIGITAL HANDOVER", desc: "Theo Dõi Biên Bản Bàn Giao", icon: ShieldCheck },
    { tag: "PAYMENTS", desc: "Theo Dõi Thanh Toán Và Quyết Toán", icon: RefreshCw },
    { tag: "VERIFIED 2-WAY", desc: "Kiểm Tra Trước Và Sau Thuê", icon: Cpu },
    { tag: "FACILITIES", desc: "Tra Cứu Cơ Sở Và Điểm Nhận Xe", icon: Activity },
  ];

  return (
    <div
      ref={containerRef}
      className="w-full py-4 border-y border-line bg-surface overflow-hidden select-none"
    >
      <div
        ref={trackRef}
        className="flex items-center gap-10 sm:gap-14 whitespace-nowrap text-xs font-bold tracking-wider text-ink-2 uppercase will-change-transform"
      >
        {/* Set 1 */}
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={`item-1-${idx}`} className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-md bg-primary-tint text-primary text-xs font-mono tracking-wider font-extrabold">
                {item.tag}
              </span>
              <span className="text-ink font-semibold tracking-normal text-xs sm:text-sm">
                {item.desc}
              </span>
              <Icon className="w-4 h-4 text-primary shrink-0 opacity-80" />
              <span className="w-1.5 h-1.5 rounded-full bg-line-strong ml-6"></span>
            </div>
          );
        })}

        {/* Set 2 for continuous seamless loop */}
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={`item-2-${idx}`} className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-md bg-primary-tint text-primary text-xs font-mono tracking-wider font-extrabold">
                {item.tag}
              </span>
              <span className="text-ink font-semibold tracking-normal text-xs sm:text-sm">
                {item.desc}
              </span>
              <Icon className="w-4 h-4 text-primary shrink-0 opacity-80" />
              <span className="w-1.5 h-1.5 rounded-full bg-line-strong ml-6"></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
