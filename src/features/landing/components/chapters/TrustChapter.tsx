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
  },
  {
    index: "02",
    key: "BẢO HIỂM TOÀN DIỆN",
    metric: "BẢO LÃNH 24/7",
    statement: "BẢO HIỂM VẬT CHẤT VÀ THÂN VỎ 100%",
    source: "Mọi chuyến đi đều đi kèm gói bảo hiểm vật chất xe và hỗ trợ kỹ thuật hiện trường.",
  },
  {
    index: "03",
    key: "HOÀN CỌC MINH BẠCH",
    metric: "TỰ ĐỘNG QUA PAYOS",
    statement: "ĐỐI SOÁT TỰ ĐỘNG QUA CỔNG PAYOS",
    source: "Biên bản kiểm định số hóa đối chiếu trước và sau chuyến đi · Không phát sinh phí ẩn.",
  },
  {
    index: "04",
    key: "ĐỘI XE TUYỂN CHỌN",
    metric: "SỞ HỮU TRỰC TIẾP",
    statement: "PORSCHE · MERCEDES-AMG · LAMBORGHINI",
    source: "100% phương tiện thuộc đội xe chuẩn hóa, bảo dưỡng định kỳ theo tiêu chuẩn hãng.",
  },
];

export default function TrustChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([spineRef.current, posterImgRef.current, headingRef.current], {
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
        // 1. Instantaneous 1:1 Scroll-Scrubbed Constructivist Blue Spine & Monumental Poster 1 Mural
        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 95%",
            end: "bottom top",
            scrub: true,
          },
        });

        if (spineRef.current) {
          masterTl.fromTo(
            spineRef.current,
            { scaleY: 0 },
            { scaleY: 1, ease: "none" },
            0
          );
        }

        if (posterImgRef.current) {
          masterTl.fromTo(
            posterImgRef.current,
            { scale: 0.9, yPercent: 6 },
            { scale: 1.04, yPercent: -5, ease: "none" },
            0
          );
        }

        if (headingRef.current) {
          masterTl.fromTo(
            headingRef.current,
            { xPercent: -6 },
            { xPercent: 4, ease: "none" },
            0
          );
        }

        // 2. 2x2 Architectural Proof Grid 1:1 Scroll-Scrubbed Reveal
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
            { y: 36, opacity: 0.15 },
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
      style={{ zIndex: 25 }}
      className="relative w-full bg-bone-100 text-ink-950 py-24 sm:py-36 px-8 sm:px-14 lg:px-24 select-none overflow-hidden border-t-4 border-lake-600"
    >
      {/* Continuous Vertical Racing Blue Constructivist Spine (Connects Poster 1's Blue Stripe through the entire section!) */}
      <div
        ref={spineRef}
        aria-hidden="true"
        style={{ transformOrigin: "top center" }}
        className="hidden lg:block absolute top-0 bottom-0 left-[58.5%] w-4 bg-lake-600/20 pointer-events-none will-change-transform"
      />

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-16 sm:space-y-20">
        {/* 1. Distinct Editorial Exhibition Header (Different from Act II to avoid repetition!) */}
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

        {/* 2. Monumental Borderless Poster 1 Centerpiece (`brightness(1.18) contrast(1.15)` + `multiply` dissolves 100% of the poster paper into `bg-bone-100`!) */}
        <div className="relative w-full max-w-[1520px] mx-auto py-2">
          <img
            ref={posterImgRef}
            src="/assets/posters/poster-bugatti-heritage.webp"
            alt="Engineering Heritage Constructivist Lithograph"
            style={{
              mixBlendMode: "multiply",
              filter: "brightness(1.18) contrast(1.15)",
            }}
            className="w-full h-auto object-contain pointer-events-none will-change-transform"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* 3. Bold 2x2 Architectural Crosshair Verification Grid (High-Impact Exhibition Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 border-b-2 border-ink-950">
          {TRUST_DATA_ROWS.map((row, idx) => (
            <div
              key={row.key}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className="group relative py-12 px-6 -mx-6 transition-colors duration-300 hover:bg-ink-950 hover:text-bone-100 will-change-transform"
            >
              {/* Self-Drawing 2px Top Ink Rule */}
              <div
                ref={(el) => {
                  ruleRefs.current[idx] = el;
                }}
                style={{ transformOrigin: "left center" }}
                className="absolute top-0 left-6 right-6 h-[2px] bg-ink-950 group-hover:bg-lake-400 transition-colors will-change-transform"
              />

              <div className="flex items-baseline justify-between mb-6">
                <div className="space-y-1">
                  <span
                    style={{
                      fontSize: "var(--fs-micro)",
                      letterSpacing: "var(--ls-micro)",
                    }}
                    className="font-sans font-bold text-lake-600 group-hover:text-lake-400 uppercase block transition-colors"
                  >
                    {row.key}
                  </span>
                  <span className="text-[11px] tracking-[0.22em] uppercase font-sans font-bold text-ink-950/60 group-hover:text-bone-100/60 block">
                    {row.metric}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(3.25rem, 5vw, 5.5rem)",
                    lineHeight: 0.9,
                    fontVariationSettings: "'wdth' 66",
                  }}
                  className="font-black text-ink-950 group-hover:text-lake-400 transition-colors"
                >
                  {row.index}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(1.75rem, 2.8vw, 2.85rem)",
                  lineHeight: 1.14,
                  fontVariationSettings: "'wdth' 98",
                }}
                className="font-black uppercase tracking-tight text-ink-950 group-hover:text-bone-100 mb-3 transition-colors"
              >
                {row.statement}
              </h3>

              <p className="font-sans text-sm sm:text-base text-ink-950/85 group-hover:text-bone-100/85 leading-relaxed transition-colors">
                {row.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
