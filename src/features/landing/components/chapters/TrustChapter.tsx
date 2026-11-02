"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const TRUST_DATA_ROWS = [
  {
    index: "01",
    key: "PHÁP NHÂN VẬN TẢI",
    statement: "DOANH NGHIỆP VẬN TẢI ĐƯỢC CẤP PHÉP",
    source: "Hợp đồng thuê xe điện tử có giá trị pháp lý toàn diện · Hồ sơ pháp nhân minh bạch.",
  },
  {
    index: "02",
    key: "BẢO HIỂM TOÀN DIỆN",
    statement: "BẢO HIỂM VẬT CHẤT VÀ THÂN VỎ 100%",
    source: "Mọi chuyến đi đều đi kèm gói bảo hiểm vật chất xe và hỗ trợ kỹ thuật hiện trường.",
  },
  {
    index: "03",
    key: "HOÀN CỌC MINH BẠCH",
    statement: "ĐỐI SOÁT TỰ ĐỘNG QUA CỔNG PAYOS",
    source: "Biên bản kiểm định số hóa đối chiếu trước và sau chuyến đi · Không phát sinh phí ẩn.",
  },
  {
    index: "04",
    key: "ĐỘI XE TUYỂN CHỌN",
    statement: "PORSCHE · MERCEDES-AMG · LAMBORGHINI",
    source: "100% phương tiện thuộc đội xe chuẩn hóa, bảo dưỡng định kỳ theo tiêu chuẩn hãng.",
  },
];

export default function TrustChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const posterStageRef = useRef<HTMLDivElement>(null);
  const posterCircleRef = useRef<HTMLDivElement>(null);
  const posterCarRef = useRef<HTMLDivElement>(null);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        ruleRefs.current.forEach((r) => {
          if (r) gsap.set(r, { scaleX: 1 });
        });
        rowRefs.current.forEach((row) => {
          if (row) gsap.set(row, { opacity: 1, y: 0 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Constructivist Poster Stage Parallax
        if (posterStageRef.current) {
          const posterTl = gsap.timeline({
            scrollTrigger: {
              trigger: posterStageRef.current,
              start: "top 85%",
              end: "bottom 15%",
              scrub: 0.6,
            },
          });

          if (posterCircleRef.current) {
            posterTl.fromTo(
              posterCircleRef.current,
              { scale: 0.88, yPercent: 8 },
              { scale: 1.04, yPercent: -6, ease: "none" },
              0
            );
          }

          if (posterCarRef.current) {
            posterTl.fromTo(
              posterCarRef.current,
              { xPercent: 10, scale: 0.94 },
              { xPercent: -4, scale: 1.04, ease: "none" },
              0
            );
          }
        }

        // Verification Rows Reveal
        rowRefs.current.forEach((row, idx) => {
          const rule = ruleRefs.current[idx];
          if (!row) return;

          if (rule) {
            gsap.fromTo(
              rule,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 0.85,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: row,
                  start: "top 88%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }

          gsap.fromTo(
            row,
            { opacity: 0.25, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: row,
                start: "top 86%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="tin-cay"
      className="relative w-full bg-ink-950 text-bone-100 py-24 sm:py-32 px-4 sm:px-8 lg:px-14 overflow-hidden select-none border-b border-bone-100/20"
    >
      {/* 1. Tactile Woodblock Dust Texture & Architectural Grid */}
      <div
        aria-hidden="true"
        style={{ zIndex: 1, mixBlendMode: "screen", opacity: 0.45 }}
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

      <div
        aria-hidden="true"
        style={{ zIndex: 2 }}
        className="absolute inset-0 pointer-events-none max-w-7xl mx-auto border-x border-bone-100/10"
      />

      <div style={{ zIndex: 10 }} className="relative max-w-7xl mx-auto space-y-20">
        {/* 2. Bespoke Constructivist Poster 1 Stage (Recreates the exact Bugatti Poster DNA natively with Porsche 911 Carrera 4S on Dark Ink Canvas) */}
        <div
          ref={posterStageRef}
          className="relative w-full bg-ink-800 border border-bone-100/25 p-6 sm:p-12 lg:p-16 overflow-hidden rounded-none"
        >
          {/* Poster 1 Geometry: Giant Off-Center Circle + Vertical Racing Blue Stripe + Blue Lower Arc */}
          <div
            ref={posterCircleRef}
            aria-hidden="true"
            style={{ zIndex: 5 }}
            className="absolute right-[8%] sm:right-[14%] top-1/2 -translate-y-1/2 w-[62vw] sm:w-[44vw] max-w-[560px] aspect-square rounded-full bg-ink-950 border border-bone-100/20 overflow-hidden pointer-events-none will-change-transform"
          >
            {/* Bottom Racing Blue Crescent inside Circle (matching Poster 1) */}
            <div className="absolute bottom-0 inset-x-0 h-[24%] bg-lake-600/90" />
          </div>

          {/* Vertical Racing Blue Spine bisecting the Circle (matching Poster 1) */}
          <div
            aria-hidden="true"
            style={{ zIndex: 6 }}
            className="hidden sm:block absolute top-0 bottom-0 right-[34%] w-5 bg-lake-600 pointer-events-none"
          />

          {/* Top Row of Poster: Monumental Condensed Title (Left) + Oval Badge & Spec Stack (Right) */}
          <div style={{ zIndex: 20 }} className="relative flex flex-col sm:flex-row items-start justify-between gap-8">
            <div className="space-y-3">
              <div
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(3.5rem, 8.5vw, 9.5rem)",
                  lineHeight: 0.88,
                  fontVariationSettings: "'wdth' 66",
                }}
                className="font-black uppercase tracking-tight text-bone-100"
              >
                PORSCHE
              </div>
              <div className="text-xs sm:text-base tracking-[0.34em] uppercase font-sans font-bold text-bone-100/90 pt-1">
                CARRERA 4S <span className="font-normal text-bone-100/60">HERITAGE</span>
              </div>
              {/* Stacked 3-Word Cadence + Short Rule (from Poster 1) */}
              <div className="pt-3 space-y-1 text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-semibold text-bone-100/70">
                <span className="block">SPEED</span>
                <span className="block">POWER</span>
                <span className="block">LEGEND</span>
                <span className="block w-10 border-t-2 border-bone-100/80 pt-2 mt-2" />
              </div>
            </div>

            {/* Right Oval Emblem & Technical Spec Stack (from Poster 1) */}
            <div className="flex flex-col items-start sm:items-end justify-between self-stretch">
              <div className="border-2 border-bone-100/85 rounded-full px-6 py-2 bg-ink-950/90">
                <span className="font-display font-black uppercase tracking-[0.22em] text-xs sm:text-sm text-bone-100">
                  THONG DONG
                </span>
              </div>

              <div className="mt-8 sm:mt-16 text-left sm:text-right space-y-1.5 text-xs sm:text-sm tracking-[0.24em] uppercase font-sans font-bold text-bone-100/85">
                <span className="block">FLAT-6</span>
                <span className="block">3.0L TWIN-TURBO</span>
                <span className="block text-lake-400">443 HP</span>
                <span className="block w-10 border-t-2 border-bone-100/80 sm:ml-auto mt-2" />
              </div>
            </div>
          </div>

          {/* Center-Foreground Woodcut Car breaking across the Constructivist Circle */}
          <div
            ref={posterCarRef}
            style={{
              zIndex: 25,
              width: "clamp(290px, 52vw, 760px)",
            }}
            className="relative mx-auto sm:ml-auto sm:mr-[8%] my-6 sm:-mt-10 sm:mb-4 pointer-events-none will-change-transform"
          >
            <picture className="w-full block">
              <source
                type="image/avif"
                srcSet="/assets/landing/a4-car-2000.avif 2000w, /assets/landing/a4-car-1920.avif 1920w, /assets/landing/a4-car-1280.avif 1280w"
              />
              <source
                type="image/webp"
                srcSet="/assets/landing/a4-car-2000.webp 2000w, /assets/landing/a4-car-1920.webp 1920w, /assets/landing/a4-car-1280.webp 1280w"
              />
              <img
                src="/assets/landing/a4-car-1280.webp"
                alt="Porsche 911 Carrera 4S Constructivist Plate"
                className="w-full h-auto object-contain pointer-events-none contrast-125 brightness-95 drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>

          {/* Poster 1 Bottom Bar: 5 Diagonal Racing Blue Bars + Horizontal Rule + Statement */}
          <div
            style={{ zIndex: 20 }}
            className="relative pt-4 border-t border-bone-100/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-4 h-2 bg-lake-400 inline-block" />
                <span className="w-4 h-2 bg-lake-400 inline-block" />
                <span className="w-4 h-2 bg-lake-400 inline-block" />
                <span className="w-4 h-2 bg-lake-400 inline-block" />
                <span className="w-4 h-2 bg-lake-400 inline-block" />
              </div>
              <span className="hidden md:block w-48 border-t-2 border-bone-100/60" />
            </div>

            <div className="text-[10px] sm:text-[11px] tracking-[0.26em] uppercase font-sans font-semibold text-bone-100/75 text-left sm:text-right">
              <span>MORE THAN A CAR · IT&apos;S A STATEMENT</span>
            </div>
          </div>
        </div>

        {/* 3. Verified Authority Ledger (12-Column Hairline Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-4">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase font-semibold text-lake-400">
              <span className="inline-block w-2 h-2 rounded-full bg-lake-400" />
              <span>ACT IV // VERIFIED AUTHORITY</span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.25rem, 4.8vw, 4.75rem)",
                lineHeight: 0.98,
                fontVariationSettings: "'wdth' 105",
              }}
              className="font-black uppercase tracking-tight text-bone-100"
            >
              TIN CẬY BẰNG DỮ KIỆN.
            </h2>
            <p className="font-sans text-sm sm:text-base text-bone-100/75 leading-relaxed max-w-md">
              Mọi chuyến đi đều được bảo chứng bằng pháp nhân rõ ràng, bảo hiểm vật chất toàn diện và cơ chế hoàn cọc tự động.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-2">
            {TRUST_DATA_ROWS.map((row, idx) => (
              <div
                key={row.key}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="relative w-full py-7 px-6 bg-ink-800/60 border-x border-b border-bone-100/10 will-change-transform"
              >
                {/* Animated Top Hairline Rule */}
                <div
                  ref={(el) => {
                    ruleRefs.current[idx] = el;
                  }}
                  style={{ transformOrigin: "left center" }}
                  className="absolute top-0 left-0 right-0 h-[1px] bg-bone-100/40 will-change-transform"
                />

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
                  <div className="sm:col-span-4 flex items-baseline gap-3">
                    <span className="font-display font-black text-sm text-sun-400">
                      {row.index}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--fs-micro)",
                        letterSpacing: "var(--ls-micro)",
                      }}
                      className="font-sans font-semibold text-bone-100/65 uppercase block"
                    >
                      {row.key}
                    </span>
                  </div>

                  <div className="sm:col-span-8 space-y-1.5">
                    <h3
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(1.25rem, 2.2vw, 2.0rem)",
                        lineHeight: 1.1,
                        fontVariationSettings: "'wdth' 95",
                      }}
                      className="font-black uppercase tracking-tight text-bone-100"
                    >
                      {row.statement}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-bone-100/75 leading-relaxed">
                      {row.source}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
