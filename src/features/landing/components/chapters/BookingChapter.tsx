"use client";

import { useRef } from "react";
import Link from "@/components/navigation/NavigationLink";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";
import SceneLayerStack from "../SceneLayerStack";

interface BookingChapterProps {
  onEnterChapter5?: (isInView: boolean) => void;
}

export default function BookingChapter({ onEnterChapter5 }: BookingChapterProps) {
  const containerRef = useRef<HTMLElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (sunRef.current) gsap.set(sunRef.current, { yPercent: 15 });
        if (mistRef.current) gsap.set(mistRef.current, { opacity: 0.8 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Sun sinks behind far mountains as user scrolls through Chapter 5
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom bottom",
            scrub: true,
            onEnter: () => onEnterChapter5?.(true),
            onLeaveBack: () => onEnterChapter5?.(false),
          },
        });

        if (sunRef.current) {
          tl.to(sunRef.current, { yPercent: 25, ease: "none" }, 0);
        }

        if (mistRef.current) {
          tl.to(mistRef.current, { opacity: 0.85, ease: "none" }, 0);
        }
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="dat-xe"
      className="relative w-full min-h-[140vh] bg-ink-950 text-bone-100 flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Scene A Outro Sticky Stage (Mặt trời lặn sau núi xa) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          marginBottom: "-100svh",
          overflow: "hidden",
        }}
        className="w-full"
      >
        <SceneLayerStack
          scene="A"
          className="absolute inset-0 w-full h-full"
          layerRefs={{
            "a1-sun": sunRef,
            "a5-mist": mistRef,
          }}
        />

        {/* Typographic Statement */}
        <div
          style={{ zIndex: 60 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6"
        >
          <h2
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "clamp(3rem, 10vw, 10rem)",
              lineHeight: 1.05,
            }}
            className="font-black uppercase tracking-tight text-bone-100"
          >
            «Đi thôi.»
          </h2>
          <p className="font-sans text-sm sm:text-base text-bone-100/70 max-w-md mx-auto mt-4 leading-relaxed">
            Chọn trạm. Chọn giờ. Lên đường cùng cỗ máy của bạn.
          </p>
        </div>
      </div>

      {/* Spacer for scroll pacing */}
      <div className="h-[80vh] w-full pointer-events-none" />

      {/* 1-Line Minimalist Footer & Attribution */}
      <footer
        style={{ position: "relative", zIndex: 70 }}
        className="w-full max-w-6xl mx-auto px-6 sm:px-12 pb-32 pt-16 border-t border-rule space-y-4 text-xs text-bone-100/60"
      >
        {/* CC BY 4.0 Attribution */}
        <div className="leading-relaxed border-b border-rule pb-4 text-[11px] text-bone-100/50">
          <strong className="text-bone-100 font-medium">
            Ghi nhận bản quyền mô hình 3D (CC BY 4.0):
          </strong>{" "}
          1975 Porsche 911 (930) Turbo tác quyền bởi Karol Miklas; Porsche 911 Carrera 4S (2026 Edition) tác quyền bởi Martin Trafas / 3D Automotive Design Lab. Được tích hợp và tối ưu hoá hiển thị theo giấy phép Creative Commons Attribution 4.0 International.
        </div>

        {/* 1-Line Bottom bar matching E2E test assertions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <span>
            © 2026 Hệ thống cho thuê xe Thong Dong. Toàn bộ quyền được bảo lưu. · Liên hệ: support@vrs.vn
          </span>
          <div className="flex items-center gap-6">
            <Link href="/find" className="hover:text-sun-600 transition-colors">
              ĐỘI XE
            </Link>
            <Link href="/facilities" className="hover:text-sun-600 transition-colors">
              CHI NHÁNH
            </Link>
            <Link href="/inspection" className="hover:text-sun-600 transition-colors">
              KIỂM ĐỊNH 3D
            </Link>
          </div>
        </div>
      </footer>
    </section>
  );
}
