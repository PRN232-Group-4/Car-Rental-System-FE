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
  const sunDiscRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([sunDiscRef.current, headlineRef.current, bgImgRef.current], {
          clearProps: "all",
          opacity: 1,
        });
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
            { scale: 1.12, yPercent: -8 },
            { scale: 1.0, yPercent: 6, ease: "none" },
            0
          );
        }

        if (sunDiscRef.current) {
          tl.fromTo(
            sunDiscRef.current,
            { yPercent: -18, scale: 0.88 },
            { yPercent: 22, scale: 1.06, ease: "none" },
            0
          );
        }

        if (headlineRef.current) {
          tl.fromTo(
            headlineRef.current,
            { yPercent: 18, opacity: 0.4 },
            { yPercent: 0, opacity: 1, ease: "none" },
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
      className="relative w-full min-h-[100svh] bg-ink-950 text-bone-100 flex flex-col justify-between pt-20 select-none overflow-hidden"
    >
      {/* 1. Full-Viewport Atmospheric Woodcut Backdrop + Lithograph Dust (No More Small Cropped Box) */}
      <picture className="absolute inset-0 w-full h-full block pointer-events-none" style={{ zIndex: 5 }}>
        <source
          type="image/avif"
          srcSet="/assets/landing/b0-backdrop-2880.avif 2880w, /assets/landing/b0-backdrop-1920.avif 1920w, /assets/landing/b0-backdrop-1280.avif 1280w"
        />
        <source
          type="image/webp"
          srcSet="/assets/landing/b0-backdrop-2880.webp 2880w, /assets/landing/b0-backdrop-1920.webp 1920w, /assets/landing/b0-backdrop-1280.webp 1280w"
        />
        <img
          ref={bgImgRef}
          src="/assets/landing/b0-backdrop-1920.webp"
          alt="Chân trời khởi hành"
          className="w-full h-full object-cover object-bottom opacity-35 contrast-125 pointer-events-none will-change-transform"
          loading="lazy"
          decoding="async"
        />
      </picture>

      <div
        aria-hidden="true"
        style={{ zIndex: 6, mixBlendMode: "screen", opacity: 0.45 }}
        className="absolute inset-0 pointer-events-none"
      >
        <img
          src="/assets/landing/a7-dust-1920.webp"
          alt=""
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* 2. Sinking Constructivist Giant Sun Disc behind the Horizon Deck */}
      <div
        ref={sunDiscRef}
        aria-hidden="true"
        style={{ zIndex: 10 }}
        className="absolute top-[16%] left-1/2 -translate-x-1/2 w-[56vw] sm:w-[36vw] max-w-[480px] aspect-square rounded-full bg-sun-600 pointer-events-none will-change-transform"
      />

      {/* 3. Single-Line Unbroken Departure Headline (Guaranteed 1 Line with whitespace-nowrap) */}
      <div
        ref={headlineRef}
        style={{ zIndex: 30 }}
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 my-auto text-center pointer-events-none will-change-transform"
      >
        <div className="inline-flex items-center gap-3 border border-bone-100/30 bg-ink-950/90 px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-sun-600 inline-block" />
          <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-semibold text-bone-100">
            ACT V // THE DEPARTURE
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-archivo, sans-serif)",
            fontSize: "clamp(2.75rem, 7.5vw, 8.2rem)",
            lineHeight: 0.95,
            fontVariationSettings: "'wdth' 115",
          }}
          className="font-black uppercase tracking-tight text-bone-100 whitespace-nowrap drop-shadow-2xl"
        >
          «ĐI THÔI.»
        </h2>

        <p className="font-sans text-sm sm:text-base text-bone-100/90 max-w-lg mx-auto mt-4 leading-relaxed bg-ink-950/80 px-4 py-2 border border-bone-100/15">
          Chọn trạm nhận xe và khung giờ khởi hành ngay tại thanh điều khiển bên dưới.
        </p>
      </div>

      {/* 4. Constructivist Horizon Deck & 1-Line Minimalist Footer (z-40) */}
      <div style={{ zIndex: 40 }} className="relative w-full bg-ink-950 border-t-2 border-bone-100/25">
        {/* 3-Column Architectural Summary Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-bone-100/15 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.24em] uppercase text-sun-400 font-semibold block">
              01 // MẠNG LƯỚI TRẠM
            </span>
            <span className="font-display font-bold uppercase text-bone-100">
              TP. HỒ CHÍ MINH (TẤT CẢ CHI NHÁNH)
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.24em] uppercase text-lake-400 font-semibold block">
              02 // PHƯƠNG THỨC THUÊ
            </span>
            <span className="font-display font-bold uppercase text-bone-100">
              LINH HOẠT THEO GIỜ & DÀI HẠN
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.24em] uppercase text-bone-100/60 font-semibold block">
              03 // BÀN GIAO
            </span>
            <span className="font-display font-bold uppercase text-bone-100">
              CHÌA KHÓA SỐ · HOÀN CỌC TỰ ĐỘNG
            </span>
          </div>
        </div>

        {/* Footer matching E2E test assertions */}
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 pb-28 pt-8 space-y-4 text-xs text-bone-100/60">
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
      </div>
    </section>
  );
}
