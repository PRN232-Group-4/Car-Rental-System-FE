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
  const stageRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            stageRef.current,
            bgImgRef.current,
            headlineRef.current,
            ruleRef.current,
            carRef.current,
            mistRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Instantaneous 1:1 Section Curtain-Iris Transition (`clipPath` expands from Warm Paper into Full-Screen Dark Night Sky!)
        if (stageRef.current) {
          gsap.fromTo(
            stageRef.current,
            { clipPath: "inset(10% 5% 0% 5%)", scale: 0.94 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 96%",
                end: "top 20%",
                scrub: true,
              },
            }
          );
        }

        // 2. 1:1 Scroll-Scrubbed Finale Choreography (`scrub: true` = Zero Delay)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 92%",
            end: "bottom bottom",
            scrub: true,
            onEnter: () => onEnterChapter5?.(true),
            onLeaveBack: () => onEnterChapter5?.(false),
          },
        });

        if (bgImgRef.current) {
          tl.fromTo(
            bgImgRef.current,
            { scale: 1.16, yPercent: -8 },
            { scale: 1.0, yPercent: 6, ease: "none" },
            0
          );
        }

        if (headlineRef.current) {
          tl.fromTo(
            headlineRef.current,
            { xPercent: 10, opacity: 0.2 },
            { xPercent: 0, opacity: 1, ease: "none" },
            0
          );
        }

        if (ruleRef.current) {
          tl.fromTo(
            ruleRef.current,
            { scaleX: 0 },
            { scaleX: 1, ease: "none" },
            0.05
          );
        }

        if (carRef.current) {
          tl.fromTo(
            carRef.current,
            { xPercent: 18, yPercent: 8, scale: 0.86 },
            { xPercent: -4, yPercent: -2, scale: 1.06, ease: "none" },
            0
          );
        }

        if (mistRef.current) {
          tl.fromTo(
            mistRef.current,
            { xPercent: -15, opacity: 0.3 },
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
      className="relative w-full min-h-[105svh] bg-bone-100 select-none overflow-hidden"
    >
      {/* Expanding Cinema Curtain Stage */}
      <div
        ref={stageRef}
        style={{ transformOrigin: "center top" }}
        className="relative w-full min-h-[105svh] bg-ink-950 text-bone-100 flex flex-col justify-between pt-20 overflow-hidden will-change-transform"
      >
        {/* 1. Full-Bleed Hai Van Sunset Woodcut (`b0-backdrop` — Orange Sun on Left, Dark Night Sky on Right) */}
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

        {/* 3. Unbroken Single-Line Monumental Departure Headline (Full-Width Flex End so "«ĐI THÔI.»" NEVER wraps onto 2 lines!) */}
        <div
          ref={headlineRef}
          style={{ zIndex: 30 }}
          className="relative w-full max-w-[1640px] mx-auto px-6 sm:px-12 lg:px-20 pt-4 sm:pt-8 flex flex-col items-end text-right pointer-events-none will-change-transform"
        >
          <span className="text-xs tracking-[0.28em] uppercase font-sans font-bold text-sun-400 block mb-2">
            05 // KHỞI HÀNH NGAY HÔM NAY
          </span>

          <h2
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "clamp(2.75rem, 6.8vw, 8.2rem)",
              lineHeight: 1.15,
              fontVariationSettings: "'wdth' 108",
            }}
            className="font-black uppercase tracking-tight text-bone-100 whitespace-nowrap pt-[0.16em] drop-shadow-2xl"
          >
            «ĐI THÔI.»
          </h2>

          <div
            ref={ruleRef}
            style={{ transformOrigin: "right center" }}
            className="w-36 sm:w-56 h-[3px] bg-sun-600 my-4 will-change-transform"
          />

          <p className="font-sans text-base sm:text-lg text-bone-100/95 max-w-md leading-relaxed font-medium drop-shadow-lg">
            Chọn trạm nhận xe và khung giờ khởi hành ngay tại thanh điều khiển phía dưới.
          </p>
        </div>

        {/* 4. Cornering Lithograph Car (`b4-car`) + Solid Dark Ink Horizon Plinth & Footer */}
        <div style={{ zIndex: 35 }} className="relative w-full mt-auto pt-20">
          <div
            ref={carRef}
            style={{
              width: "clamp(320px, 46vw, 760px)",
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
                className="w-full h-auto object-contain pointer-events-none contrast-125 brightness-95 drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>

          {/* Solid Dark Ink Horizon Plinth & Minimalist Footer matching E2E assertions */}
          <footer className="relative z-10 w-full bg-ink-950 border-t-4 border-sun-600 px-6 sm:px-12 lg:px-20 pb-28 pt-14">
            <div className="max-w-[1640px] mx-auto space-y-4 text-xs text-bone-100/60">
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
      </div>
    </section>
  );
}
