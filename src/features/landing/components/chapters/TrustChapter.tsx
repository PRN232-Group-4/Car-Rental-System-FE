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
  const posterCardRef = useRef<HTMLDivElement>(null);
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
        if (posterCardRef.current) {
          gsap.fromTo(
            posterCardRef.current,
            { y: 30, opacity: 0.4 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
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
            { opacity: 0.25, y: 20 },
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
      className="relative w-full bg-ink-950 text-bone-100 py-24 sm:py-32 px-4 sm:px-8 lg:px-14 border-t border-bone-100/20 select-none"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase font-semibold text-lake-400 mb-3">
            <span>ACT IV // VERIFIED AUTHORITY</span>
            <span className="w-10 border-t border-lake-400/50" />
            <span>ENGINEERING HERITAGE</span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "clamp(2.5rem, 6vw, 6.25rem)",
              lineHeight: 0.98,
              fontVariationSettings: "'wdth' 108",
            }}
            className="font-black uppercase tracking-tight text-bone-100"
          >
            TIN CẬY BẰNG DỮ KIỆN.
          </h2>
        </div>

        {/* 12-Column Split Monograph: Cols 1-5 Sticky Heritage Poster 1 Plate, Cols 6-12 Verification Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT (Cols 1-5): Sticky Constructivist Heritage Poster Plate (poster-bugatti-heritage.webp) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div
              ref={posterCardRef}
              className="relative w-full border border-bone-100/25 bg-ink-800 rounded-none overflow-hidden will-change-transform"
            >
              {/* Vertical Racing Blue Constructivist Accent Bar */}
              <div
                aria-hidden="true"
                className="absolute top-0 bottom-0 right-8 w-3 bg-lake-600 z-10 pointer-events-none"
              />

              {/* Poster 1 Artwork */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-ink-950">
                <img
                  src="/assets/posters/poster-bugatti-heritage.webp"
                  alt="Engineering Heritage Constructivist Poster"
                  className="w-full h-full object-cover object-center pointer-events-none"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Technical Spec Footer inside Plate */}
              <div className="p-6 bg-ink-950 border-t border-bone-100/20 space-y-4">
                <div className="flex items-center justify-between text-[10px] tracking-[0.24em] uppercase font-semibold text-lake-400">
                  <span>ARCHIVAL PLATE // 01</span>
                  <span>CONSTRUCTIVIST EDITION</span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-bone-100/80 leading-relaxed">
                  Mỗi chiếc xe trong đội hình đều trải qua quy trình kiểm định kỹ thuật đa điểm trước khi bàn giao chìa khóa số cho khách hàng.
                </p>
                {/* Signature 5 Diagonal Bars Motif from Poster 1 */}
                <div className="pt-3 border-t border-bone-100/15 flex items-center justify-between">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="w-3 h-1.5 bg-lake-400 inline-block" />
                    <span className="w-3 h-1.5 bg-lake-400 inline-block" />
                    <span className="w-3 h-1.5 bg-lake-400 inline-block" />
                    <span className="w-3 h-1.5 bg-lake-400 inline-block" />
                    <span className="w-3 h-1.5 bg-lake-400 inline-block" />
                  </div>
                  <span className="text-[10px] tracking-[0.22em] uppercase text-bone-100/50">
                    MORE THAN A CAR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT (Cols 6-12): 4 Hairline Verification Ledgers */}
          <div className="lg:col-span-7 space-y-2">
            {TRUST_DATA_ROWS.map((row, idx) => (
              <div
                key={row.key}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="relative w-full py-8 will-change-transform"
              >
                {/* Animated 1px Hairline Rule */}
                <div
                  ref={(el) => {
                    ruleRefs.current[idx] = el;
                  }}
                  style={{ transformOrigin: "left center" }}
                  className="absolute top-0 left-0 right-0 border-t border-bone-100/30 will-change-transform"
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
                      className="font-sans font-semibold text-bone-100/60 uppercase block"
                    >
                      {row.key}
                    </span>
                  </div>

                  <div className="sm:col-span-8 space-y-2">
                    <h3
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(1.35rem, 2.4vw, 2.25rem)",
                        lineHeight: 1.1,
                        fontVariationSettings: "'wdth' 95",
                      }}
                      className="font-black uppercase tracking-tight text-bone-100"
                    >
                      {row.statement}
                    </h3>
                    <p className="font-sans text-sm text-bone-100/75 leading-relaxed">
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
