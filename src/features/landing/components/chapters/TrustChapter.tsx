"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const TRUST_DATA_ROWS = [
  {
    index: "01",
    key: "PHÁP NHÂN VẬN TẢI",
    metric: "100% HỢP ĐỒNG SỐ",
    statement: "DOANH NGHIỆP VẬN TẢI ĐƯỢC CẤP PHÉP",
    source: "Hợp đồng thuê xe điện tử có giá trị pháp lý toàn diện · Hồ sơ pháp nhân minh bạch.",
    inverted: false,
  },
  {
    index: "02",
    key: "BẢO HIỂM TOÀN DIỆN",
    metric: "BẢO LÃNH 24/7",
    statement: "BẢO HIỂM VẬT CHẤT VÀ THÂN VỎ 100%",
    source: "Mọi chuyến đi đều đi kèm gói bảo hiểm vật chất xe và hỗ trợ kỹ thuật hiện trường.",
    inverted: true,
  },
  {
    index: "03",
    key: "HOÀN CỌC MINH BẠCH",
    metric: "TỰ ĐỘNG QUA PAYOS",
    statement: "ĐỐI SOÁT TỰ ĐỘNG QUA CỔNG PAYOS",
    source: "Biên bản kiểm định số hóa đối chiếu trước và sau chuyến đi · Không phát sinh phí ẩn.",
    inverted: true,
  },
  {
    index: "04",
    key: "ĐỘI XE TUYỂN CHỌN",
    metric: "SỞ HỮU TRỰC TIẾP",
    statement: "PORSCHE · MERCEDES-AMG · LAMBORGHINI",
    source: "100% phương tiện thuộc đội xe chuẩn hóa, bảo dưỡng định kỳ theo tiêu chuẩn hãng.",
    inverted: false,
  },
];

export default function TrustChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const posterWrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([stageRef.current, posterWrapRef.current, headingRef.current], {
          clearProps: "all",
          opacity: 1,
        });
        ruleRefs.current.forEach((r) => {
          if (r) gsap.set(r, { scaleX: 1 });
        });
        cardRefs.current.forEach((card) => {
          if (card) gsap.set(card, { clearProps: "all", opacity: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Section-to-Section Entry Transform (Act III Dark Ink -> Act IV Archival Paper)
        if (stageRef.current) {
          gsap.fromTo(
            stageRef.current,
            { y: 60, scale: 0.94 },
            {
              y: 0,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 96%",
                end: "top 22%",
                scrub: true,
              },
            }
          );
        }

        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        // Animate wrapper (NOT img) so mix-blend-mode: multiply stays 100% blended into bg-bone-100!
        if (posterWrapRef.current) {
          masterTl.fromTo(
            posterWrapRef.current,
            { scale: 0.93, y: 24 },
            { scale: 1.02, y: -16, ease: "none" },
            0
          );
        }

        if (headingRef.current) {
          masterTl.fromTo(
            headingRef.current,
            { xPercent: -5 },
            { xPercent: 3, ease: "none" },
            0
          );
        }

        // 2. High-Contrast 2x2 Constructivist Matrix 1:1 Scroll-Scrubbed Reveal
        cardRefs.current.forEach((card, idx) => {
          const rule = ruleRefs.current[idx];
          if (!card) return;

          const cardTl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 95%",
              end: "top 40%",
              scrub: true,
            },
          });

          if (rule) {
            cardTl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
          }

          cardTl.fromTo(
            card,
            { y: 40, opacity: 0.2 },
            { y: 0, opacity: 1, ease: "none" },
            0
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
      className="relative w-full bg-bone-100 text-ink-950 py-24 sm:py-36 px-8 sm:px-14 lg:px-24 select-none overflow-hidden border-t-4 border-lake-600"
    >
      {/* CRITICAL FIX: Direct bg-bone-100 on stageRef without z-index isolation so Poster 1 blends 100% into #E9E4D8 with ZERO white box! */}
      <div
        ref={stageRef}
        style={{ transformOrigin: "center top" }}
        className="max-w-[1600px] mx-auto bg-bone-100 space-y-16 sm:space-y-20 will-change-transform"
      >
        {/* 1. Editorial Exhibition Header */}
        <div className="border-b-2 border-ink-950 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div ref={headingRef} className="will-change-transform">
            <span className="text-xs tracking-[0.28em] uppercase font-sans font-bold text-lake-600 block mb-3">
              04 // ENGINEERING HERITAGE & VERIFIED TRUST
            </span>
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.75rem, 6.8vw, 8.2rem)",
                lineHeight: 1.14,
                fontVariationSettings: "'wdth' 98",
              }}
              className="font-black uppercase tracking-tight text-ink-950 pt-[0.14em]"
            >
              TIN CẬY BẰNG <span className="text-lake-600">DỮ KIỆN.</span>
            </h2>
          </div>

          <p className="font-sans text-base sm:text-lg text-ink-950/85 max-w-md leading-relaxed font-medium border-l-4 border-lake-600 pl-5">
            Không dùng lời hứa quảng cáo. Mọi chuyến đi đều được bảo chứng bằng pháp nhân rõ ràng, bảo hiểm vật chất toàn diện và cơ chế hoàn cọc tự động.
          </p>
        </div>

        {/* 2. Seamless Poster 1 Masterpiece (Direct bg-bone-100 parent + multiply on unisolated img = ZERO white box!) */}
        <div
          ref={posterWrapRef}
          className="w-full max-w-[1520px] mx-auto bg-bone-100 will-change-transform"
        >
          <img
            src="/assets/posters/poster-bugatti-heritage.webp"
            alt="Engineering Heritage Constructivist Lithograph"
            style={{
              mixBlendMode: "multiply",
              filter: "brightness(1.06) contrast(1.08)",
            }}
            className="w-full h-auto block object-contain pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* 3. High-Contrast 2x2 Swiss Constructivist Checkerboard Matrix (Replaces the weak floating text rows!) */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-ink-950">
          {TRUST_DATA_ROWS.map((row, idx) => (
            <div
              key={row.key}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className={
                row.inverted
                  ? "relative p-8 sm:p-12 bg-ink-950 text-bone-100 border border-ink-950 flex flex-col justify-between will-change-transform"
                  : "relative p-8 sm:p-12 bg-bone-100 text-ink-950 border border-ink-950 flex flex-col justify-between will-change-transform"
              }
            >
              {/* 1:1 Scroll-Scrubbed 4px Top Accent Bar */}
              <div
                ref={(el) => {
                  ruleRefs.current[idx] = el;
                }}
                style={{ transformOrigin: "left center" }}
                className={
                  row.inverted
                    ? "absolute top-0 left-0 right-0 h-[4px] bg-lake-400 will-change-transform"
                    : "absolute top-0 left-0 right-0 h-[4px] bg-sun-600 will-change-transform"
                }
              />

              <div className="flex items-baseline justify-between mb-8">
                <div className="space-y-1.5">
                  <span
                    style={{
                      fontSize: "var(--fs-micro)",
                      letterSpacing: "var(--ls-micro)",
                    }}
                    className={
                      row.inverted
                        ? "font-sans font-bold text-lake-400 uppercase block"
                        : "font-sans font-bold text-lake-600 uppercase block"
                    }
                  >
                    {row.key}
                  </span>
                  <span
                    className={
                      row.inverted
                        ? "text-[11px] tracking-[0.22em] uppercase font-sans font-bold text-bone-100/60 block"
                        : "text-[11px] tracking-[0.22em] uppercase font-sans font-bold text-ink-950/60 block"
                    }
                  >
                    {row.metric}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(3.5rem, 5.5vw, 6rem)",
                    lineHeight: 0.9,
                    fontVariationSettings: "'wdth' 66",
                  }}
                  className={
                    row.inverted
                      ? "font-black text-lake-400"
                      : "font-black text-ink-950"
                  }
                >
                  {row.index}
                </span>
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(1.75rem, 2.8vw, 2.85rem)",
                    lineHeight: 1.14,
                    fontVariationSettings: "'wdth' 98",
                  }}
                  className="font-black uppercase tracking-tight mb-3"
                >
                  {row.statement}
                </h3>

                <p
                  className={
                    row.inverted
                      ? "font-sans text-sm sm:text-base text-bone-100/85 leading-relaxed"
                      : "font-sans text-sm sm:text-base text-ink-950/85 leading-relaxed"
                  }
                >
                  {row.source}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
