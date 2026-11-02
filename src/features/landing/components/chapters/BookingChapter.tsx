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
  const bgImgRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [bgImgRef.current, headlineRef.current, carRef.current, mistRef.current],
          { clearProps: "all", opacity: 1 }
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 0.5,
            onEnter: () => onEnterChapter5?.(true),
            onLeaveBack: () => onEnterChapter5?.(false),
          },
        });

        if (bgImgRef.current) {
          tl.fromTo(
            bgImgRef.current,
            { scale: 1.15, yPercent: -10 },
            { scale: 1.0, yPercent: 6, ease: "none" },
            0
          );
        }

        if (headlineRef.current) {
          tl.fromTo(
            headlineRef.current,
            { xPercent: 10, yPercent: 20, opacity: 0.3 },
            { xPercent: 0, yPercent: 0, opacity: 1, ease: "none" },
            0
          );
        }

        if (carRef.current) {
          tl.fromTo(
            carRef.current,
            { xPercent: 16, yPercent: 6, scale: 0.88 },
            { xPercent: -4, yPercent: -4, scale: 1.05, ease: "none" },
            0
          );
        }

        if (mistRef.current) {
          tl.fromTo(
            mistRef.current,
            { xPercent: -12, opacity: 0.3 },
            { xPercent: 12, opacity: 0.65, ease: "none" },
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
      className="relative w-full min-h-[105svh] bg-ink-950 text-bone-100 flex flex-col justify-between pt-24 select-none overflow-hidden"
    >
      {/* 1. Full-Bleed Hai Van Sunset Woodcut (`b0-backdrop` at 100% rich opacity — Uses ONLY the authentic woodcut sun on the left, ZERO duplicate CSS sun!) */}
      <picture className="absolute inset-0 w-full h-full block pointer-events-none" style={{ zIndex: 5 }}>
        <source
          type="image/avif"
          srcSet="/assets/landing/b0-backdrop-3840.avif 3840w, /assets/landing/b0-backdrop-2880.avif 2880w, /assets/landing/b0-backdrop-1920.avif 1920w, /assets/landing/b0-backdrop-1280.avif 1280w"
        />
        <source
          type="image/webp"
          srcSet="/assets/landing/b0-backdrop-3840.webp 3840w, /assets/landing/b0-backdrop-2880.webp 2880w, /assets/landing/b0-backdrop-1920.webp 1920w, /assets/landing/b0-backdrop-1280.webp 1280w"
        />
        <img
          ref={bgImgRef}
          src="/assets/landing/b0-backdrop-1920.webp"
          alt="Hoàng hôn Đèo Hải Vân"
          className="w-full h-full object-cover object-center pointer-events-none will-change-transform"
          loading="lazy"
          decoding="async"
        />
      </picture>

      {/* 2. Drifting Coastal Mist */}
      <div
        ref={mistRef}
        aria-hidden="true"
        style={{ zIndex: 12, mixBlendMode: "screen", opacity: 0.45 }}
        className="absolute inset-0 pointer-events-none will-change-transform"
      >
        <img
          src="/assets/landing/b5-mist-1920.webp"
          alt=""
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* 3. Unboxed Single-Line Departure Headline in the Calm Upper-Right Night Sky (Counter-balancing the Orange Sun on the Left) */}
      <div
        ref={headlineRef}
        style={{ zIndex: 30 }}
        className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pt-8 sm:pt-14 flex flex-col items-start lg:items-end text-left lg:text-right pointer-events-none will-change-transform"
      >
        <h2
          style={{
            fontFamily: "var(--font-archivo, sans-serif)",
            fontSize: "clamp(3.25rem, 8.5vw, 10rem)",
            lineHeight: 0.92,
            fontVariationSettings: "'wdth' 115",
          }}
          className="font-black uppercase tracking-tight text-bone-100 whitespace-nowrap drop-shadow-2xl"
        >
          «ĐI THÔI.»
        </h2>

        <p className="font-sans text-base sm:text-lg text-bone-100/90 max-w-md mt-4 leading-relaxed font-medium drop-shadow-lg">
          Chọn trạm nhận xe và khung giờ khởi hành ngay tại thanh điều khiển phía dưới.
        </p>
      </div>

      {/* 4. Cornering Lithograph Car (`b4-car`) + Minimalist Footer Plinth */}
      <div style={{ zIndex: 35 }} className="relative w-full mt-auto pt-24">
        <div
          ref={carRef}
          style={{
            width: "clamp(300px, 44vw, 720px)",
          }}
          className="relative ml-auto mr-[6%] sm:mr-[10%] -mb-10 sm:-mb-14 z-20 pointer-events-none will-change-transform"
        >
          <picture className="w-full block">
            <source
              type="image/avif"
              srcSet="/assets/landing/b4-car-2000.avif 2000w, /assets/landing/b4-car-1920.avif 1920w, /assets/landing/b4-car-1280.avif 1280w, /assets/landing/b4-car-960.avif 960w"
            />
            <source
              type="image/webp"
              srcSet="/assets/landing/b4-car-2000.webp 2000w, /assets/landing/b4-car-1920.webp 1920w, /assets/landing/b4-car-1280.webp 1280w, /assets/landing/b4-car-960.webp 960w"
            />
            <img
              src="/assets/landing/b4-car-1280.webp"
              alt="Porsche 911 trên cung đường biển"
              className="w-full h-auto object-contain pointer-events-none contrast-125 brightness-95"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>

        {/* Solid Dark Ink Horizon Plinth & Minimalist Footer matching E2E assertions */}
        <footer className="relative z-10 w-full bg-ink-950 border-t border-bone-100/20 px-6 sm:px-12 lg:px-20 pb-28 pt-14">
          <div className="max-w-7xl mx-auto space-y-4 text-xs text-bone-100/60">
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
          </div>
        </footer>
      </div>
    </section>
  );
}
