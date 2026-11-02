"use client";

import { useRef } from "react";
import Link from "@/components/navigation/NavigationLink";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

interface BookingChapterProps {
  onEnterChapter5?: (isInView: boolean) => void;
}

export default function BookingChapter({ onEnterChapter5 }: BookingChapterProps) {
  const containerRef = useRef<HTMLElement>(null);
  const sunDiscRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([sunDiscRef.current, headlineRef.current, carRef.current], {
          clearProps: "all",
          opacity: 1,
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "bottom bottom",
            scrub: 0.6,
            onEnter: () => onEnterChapter5?.(true),
            onLeaveBack: () => onEnterChapter5?.(false),
          },
        });

        // Giant Sun Disc sinks behind the horizon frame as user scrolls to the bottom
        if (sunDiscRef.current) {
          tl.fromTo(
            sunDiscRef.current,
            { yPercent: -14, scale: 0.92 },
            { yPercent: 24, scale: 1.05, ease: "none" },
            0
          );
        }

        if (headlineRef.current) {
          tl.fromTo(
            headlineRef.current,
            { yPercent: 20, opacity: 0.5 },
            { yPercent: 0, opacity: 1, ease: "none" },
            0
          );
        }

        if (carRef.current) {
          tl.fromTo(
            carRef.current,
            { xPercent: 8, scale: 0.94 },
            { xPercent: -4, scale: 1.04, ease: "none" },
            0
          );
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
      className="relative w-full min-h-[115svh] bg-ink-950 text-bone-100 flex flex-col justify-between pt-20 select-none overflow-hidden border-t border-bone-100/20"
    >
      {/* Finale Stage: Symmetrical Constructivist Sunset & Panoramic Horizon Strip */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 flex-1 flex flex-col justify-center items-center">
        {/* Sinking Giant Constructivist Sun Disc */}
        <div
          ref={sunDiscRef}
          aria-hidden="true"
          style={{ zIndex: 10 }}
          className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[68vw] sm:w-[44vw] max-w-[560px] aspect-square rounded-full bg-sun-600 pointer-events-none will-change-transform"
        />

        {/* Monumental Departure Headline (Above the Horizon Strip, Zero Overlap with Car) */}
        <div
          ref={headlineRef}
          style={{ zIndex: 30 }}
          className="relative text-center pointer-events-none mb-6 sm:mb-8 will-change-transform"
        >
          <span className="text-[11px] tracking-[0.28em] uppercase font-semibold text-bone-100/80 block mb-2">
            ACT V // THE DEPARTURE
          </span>
          <h2
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "clamp(3.5rem, 11vw, 12.5rem)",
              lineHeight: 0.95,
              fontVariationSettings: "'wdth' 120",
            }}
            className="font-black uppercase tracking-tight text-bone-100 whitespace-nowrap"
          >
            «ĐI THÔI.»
          </h2>
          <p className="font-sans text-sm sm:text-base text-bone-100/90 max-w-md mx-auto mt-3 leading-relaxed">
            Chọn trạm nhận xe và khung giờ khởi hành ngay tại thanh điều khiển bên dưới.
          </p>
        </div>

        {/* Framed Panoramic Horizon Strip + Lithograph Car */}
        <div style={{ zIndex: 20 }} className="relative w-full h-[34svh] sm:h-[40svh] max-h-[380px] flex items-end">
          <div className="relative w-full h-full border border-bone-100/25 bg-ink-800 overflow-hidden rounded-none">
            <picture className="w-full h-full block pointer-events-none">
              <source
                type="image/avif"
                srcSet="/assets/landing/scene-a-dalat-full-2880.avif 2880w, /assets/landing/scene-a-dalat-full-1920.avif 1920w, /assets/landing/scene-a-dalat-full-1280.avif 1280w"
              />
              <source
                type="image/webp"
                srcSet="/assets/landing/scene-a-dalat-full-2880.webp 2880w, /assets/landing/scene-a-dalat-full-1920.webp 1920w, /assets/landing/scene-a-dalat-full-1280.webp 1280w"
              />
              <img
                src="/assets/landing/scene-a-dalat-full-1920.webp"
                alt="Chân trời hoàng hôn Đà Lạt"
                className="w-full h-full object-cover object-bottom pointer-events-none"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>

          {/* Center-Anchored Porsche on the Horizon Line */}
          <div
            ref={carRef}
            style={{
              zIndex: 32,
              width: "clamp(280px, 38vw, 620px)",
            }}
            className="absolute left-1/2 -translate-x-1/2 -bottom-5 pointer-events-none will-change-transform"
          >
            <picture className="w-full block">
              <source
                type="image/avif"
                srcSet="/assets/landing/a4-car-1920.avif 1920w, /assets/landing/a4-car-1280.avif 1280w, /assets/landing/a4-car-960.avif 960w"
              />
              <source
                type="image/webp"
                srcSet="/assets/landing/a4-car-1920.webp 1920w, /assets/landing/a4-car-1280.webp 1280w, /assets/landing/a4-car-960.webp 960w"
              />
              <img
                src="/assets/landing/a4-car-1280.webp"
                alt="Porsche 911"
                className="w-full h-auto object-contain pointer-events-none"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </div>

      {/* Minimalist Footer & Attribution (z-40, padded for BookingDock) */}
      <footer
        style={{ position: "relative", zIndex: 40 }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 pb-28 pt-16 mt-12 border-t border-rule space-y-4 text-xs text-bone-100/60"
      >
        <div className="leading-relaxed border-b border-rule pb-3 text-[11px] text-bone-100/50">
          <strong className="text-bone-100 font-medium">
            Ghi nhận bản quyền mô hình 3D (CC BY 4.0):
          </strong>{" "}
          1975 Porsche 911 (930) Turbo tác quyền bởi Karol Miklas; Porsche 911 Carrera 4S (2026 Edition) tác quyền bởi Martin Trafas / 3D Automotive Design Lab. Được tích hợp và tối ưu hoá hiển thị theo giấy phép Creative Commons Attribution 4.0 International.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[11px] tracking-wider">
          <span>
            © 2026 Hệ thống cho thuê xe Thong Dong. Toàn bộ quyền được bảo lưu. · Liên hệ: support@vrs.vn
          </span>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/find" className="hover:text-sun-400 transition-colors">
              ĐỘI XE
            </Link>
            <Link href="/facilities" className="hover:text-sun-400 transition-colors">
              CHI NHÁNH
            </Link>
            <Link href="/inspection" className="hover:text-sun-400 transition-colors">
              KIỂM ĐỊNH 3D
            </Link>
          </div>
        </div>
      </footer>
    </section>
  );
}
