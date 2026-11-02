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
  const posterImgRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([posterImgRef.current, headingRef.current], {
          clearProps: "all",
          opacity: 1,
        });
        ruleRefs.current.forEach((r) => {
          if (r) gsap.set(r, { scaleX: 1 });
        });
        rowRefs.current.forEach((row) => {
          if (row) gsap.set(row, { opacity: 1, y: 0 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Poster 1 (`poster-bugatti-heritage.webp`) Scroll Scale & Parallax
        if (posterImgRef.current) {
          gsap.fromTo(
            posterImgRef.current,
            { scale: 0.93, yPercent: 6 },
            {
              scale: 1.03,
              yPercent: -5,
              ease: "none",
              scrollTrigger: {
                trigger: posterImgRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        }

        // 2. Heading & Proof Ledger Self-Drawing Rules
        if (headingRef.current) {
          gsap.fromTo(
            headingRef.current,
            { xPercent: -8, opacity: 0.2 },
            {
              xPercent: 0,
              opacity: 1,
              duration: 0.9,
              ease: "expo.out",
              scrollTrigger: {
                trigger: headingRef.current,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        rowRefs.current.forEach((row, idx) => {
          const rule = ruleRefs.current[idx];
          if (!row) return;

          if (rule) {
            gsap.fromTo(
              rule,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 0.9,
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
            { opacity: 0.25, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
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
      className="relative w-full bg-bone-100 text-ink-950 pt-12 pb-28 sm:pb-36 px-6 sm:px-12 lg:px-20 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-24">
        {/* 1. Full-Scale Poster 1 Masterpiece (`poster-bugatti-heritage.webp`) seamlessly blended onto Warm Archival Paper (`bg-bone-100`) via `mix-blend-mode: multiply` — ZERO Box Borders! */}
        <div className="relative w-full max-w-[1540px] mx-auto overflow-hidden">
          <img
            ref={posterImgRef}
            src="/assets/posters/poster-bugatti-heritage.webp"
            alt="Constructivist Hypercar Heritage Lithograph"
            style={{ mixBlendMode: "multiply" }}
            className="w-full h-auto object-contain pointer-events-none will-change-transform"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* 2. Unboxed Editorial Verification Ledger on Warm Paper (`text-ink-950` on `bg-bone-100` = 14.8:1 AAA Contrast) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column (Cols 1-5): Monumental Editorial Title */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <h2
              ref={headingRef}
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.75rem, 6.2vw, 6.8rem)",
                lineHeight: 0.94,
                fontVariationSettings: "'wdth' 104",
              }}
              className="font-black uppercase tracking-tight text-ink-950 will-change-transform"
            >
              TIN CẬY BẰNG DỮ KIỆN.
            </h2>
            <p className="font-sans text-base sm:text-lg text-ink-950/80 leading-relaxed max-w-md">
              Không dùng lời hứa quảng cáo. Mọi chuyến đi đều được bảo chứng bằng pháp nhân rõ ràng, bảo hiểm vật chất toàn diện và cơ chế hoàn cọc tự động.
            </p>
          </div>

          {/* Right Column (Cols 6-12): 4 Clean Hairline Proof Rows (Zero Dark Slop Boxes) */}
          <div className="lg:col-span-7">
            {TRUST_DATA_ROWS.map((row, idx) => (
              <div
                key={row.key}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="relative w-full py-10 will-change-transform"
              >
                {/* Self-Drawing Woodblock Ink Hairline */}
                <div
                  ref={(el) => {
                    ruleRefs.current[idx] = el;
                  }}
                  style={{ transformOrigin: "left center" }}
                  className="absolute top-0 left-0 right-0 h-[2px] bg-ink-950 will-change-transform"
                />

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
                  <div className="sm:col-span-4 flex items-baseline gap-3">
                    <span
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontVariationSettings: "'wdth' 70",
                      }}
                      className="font-black text-2xl text-ink-950"
                    >
                      {row.index}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--fs-micro)",
                        letterSpacing: "var(--ls-micro)",
                      }}
                      className="font-sans font-bold text-ink-950/70 uppercase block"
                    >
                      {row.key}
                    </span>
                  </div>

                  <div className="sm:col-span-8 space-y-2">
                    <h3
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(1.5rem, 2.6vw, 2.5rem)",
                        lineHeight: 1.08,
                        fontVariationSettings: "'wdth' 98",
                      }}
                      className="font-black uppercase tracking-tight text-ink-950"
                    >
                      {row.statement}
                    </h3>
                    <p className="font-sans text-sm sm:text-base text-ink-950/80 leading-relaxed">
                      {row.source}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="w-full h-[2px] bg-ink-950" />
          </div>
        </div>
      </div>
    </section>
  );
}
