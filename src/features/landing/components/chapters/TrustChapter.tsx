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
  const bladeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shutterRefs = useRef<(HTMLDivElement | null)[]>([]);

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
        bladeRefs.current.forEach((blade) => {
          if (blade) gsap.set(blade, { clearProps: "all", opacity: 1 });
        });
        shutterRefs.current.forEach((s) => {
          if (s) gsap.set(s, { scaleY: 0 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
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
            { scale: 0.94 },
            { scale: 1.03, ease: "none" },
            0
          );
        }

        if (headingRef.current) {
          masterTl.fromTo(
            headingRef.current,
            { xPercent: -5 },
            { xPercent: 4, ease: "none" },
            0
          );
        }

        // Staggered Architectural Monograph Blades (Alternating Horizontal Counter-Scrub!)
        bladeRefs.current.forEach((blade, idx) => {
          const rule = ruleRefs.current[idx];
          if (!blade) return;

          const dir = idx % 2 === 0 ? -8 : 8;

          const bladeTl = gsap.timeline({
            scrollTrigger: {
              trigger: blade,
              start: "top 95%",
              end: "top 38%",
              scrub: true,
            },
          });

          if (rule) {
            bladeTl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
          }

          bladeTl.fromTo(
            blade,
            { xPercent: dir, opacity: 0.2 },
            { xPercent: 0, opacity: 1, ease: "none" },
            0
          );
        });

        // 5-Column Obsidian Shutters Rising at the Bottom of Act IV to Transition into Act V Finale!
        const validShutters = shutterRefs.current.filter(Boolean);
        if (validShutters.length > 0) {
          gsap.fromTo(
            validShutters,
            { scaleY: 0 },
            {
              scaleY: 1,
              stagger: 0.05,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "bottom 45%",
                end: "bottom top",
                scrub: true,
              },
            }
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
      id="tin-cay"
      className="relative w-full bg-bone-100 text-ink-950 pt-16 sm:pt-24 pb-40 sm:pb-52 px-8 sm:px-14 lg:px-24 select-none overflow-hidden"
    >
      {/* Architectural Blueprint Grid & Continuous Racing Blue Spine */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none grid grid-cols-4 lg:grid-cols-12 px-8 sm:px-14 lg:px-24"
      >
        <div className="border-l border-ink-950/[0.07] h-full" />
        <div className="hidden lg:block lg:col-start-4 border-l border-ink-950/[0.07] h-full" />
        <div className="hidden lg:block lg:col-start-9 border-l border-ink-950/[0.07] h-full" />
        <div className="col-start-4 lg:col-start-12 border-r border-ink-950/[0.07] h-full" />
      </div>

      <div
        ref={spineRef}
        aria-hidden="true"
        style={{ transformOrigin: "top center" }}
        className="hidden lg:block absolute top-0 bottom-0 left-[58.5%] w-4 bg-lake-600/20 pointer-events-none will-change-transform"
      />

      {/* CRITICAL: Direct bg-bone-100 without z-index isolation so Poster 1 blends 100.0% into #E9E4D8! */}
      <div className="max-w-[1600px] mx-auto bg-bone-100 space-y-16 sm:space-y-20">
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

        {/* 2. Deterministic 16:9 Container + Seamless Poster 1 Masterpiece (`brightness(1.16) contrast(1.14)` + `multiply` on direct `bg-bone-100` parent = ZERO Box Edge & Zero Scroll-Lock!) */}
        <div className="w-full max-w-[1520px] mx-auto aspect-[16/9] bg-bone-100 overflow-hidden">
          <img
            ref={posterImgRef}
            src="/assets/posters/poster-bugatti-heritage.webp"
            alt="Engineering Heritage Constructivist Lithograph"
            style={{
              mixBlendMode: "multiply",
              filter: "brightness(1.16) contrast(1.14)",
            }}
            className="w-full h-full block object-contain pointer-events-none"
            decoding="async"
          />
        </div>

        {/* 3. Staggered Architectural Monograph Blades (Replaces the clunky 4-box grid!) */}
        <div className="pt-4">
          {TRUST_DATA_ROWS.map((row, idx) => (
            <div
              key={row.key}
              ref={(el) => {
                bladeRefs.current[idx] = el;
              }}
              className="group relative w-full py-12 sm:py-14 transition-colors duration-300 hover:bg-ink-950 hover:text-bone-100 px-6 sm:px-10 -mx-6 sm:-mx-10 will-change-transform"
            >
              {/* Self-Drawing 3px Racing Blue / Ink Rule */}
              <div
                ref={(el) => {
                  ruleRefs.current[idx] = el;
                }}
                style={{ transformOrigin: idx % 2 === 0 ? "left center" : "right center" }}
                className="absolute top-0 left-0 right-0 h-[3px] bg-ink-950 group-hover:bg-lake-400 transition-colors will-change-transform"
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Col 1-3: Giant Index + Category Key */}
                <div className="lg:col-span-3 flex items-baseline gap-6">
                  <span
                    style={{
                      fontFamily: "var(--font-archivo, sans-serif)",
                      fontSize: "clamp(4rem, 7vw, 7.5rem)",
                      lineHeight: 0.9,
                      fontVariationSettings: "'wdth' 64",
                    }}
                    className="font-black text-lake-600 group-hover:text-lake-400 transition-colors"
                  >
                    {row.index}
                  </span>

                  <div className="space-y-1">
                    <span
                      style={{
                        fontSize: "var(--fs-micro)",
                        letterSpacing: "var(--ls-micro)",
                      }}
                      className="font-sans font-bold text-ink-950 group-hover:text-bone-100 uppercase block transition-colors"
                    >
                      {row.key}
                    </span>
                    <span className="text-[11px] tracking-[0.22em] uppercase font-sans font-bold text-lake-600 group-hover:text-lake-400 block">
                      {row.metric}
                    </span>
                  </div>
                </div>

                {/* Col 4-8: Monumental Proof Statement (Asymmetrically stepped on even rows) */}
                <div
                  className={
                    idx % 2 === 1
                      ? "lg:col-span-5 lg:col-start-5"
                      : "lg:col-span-5 lg:col-start-4"
                  }
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-archivo, sans-serif)",
                      fontSize: "clamp(1.85rem, 3.4vw, 3.6rem)",
                      lineHeight: 1.1,
                      fontVariationSettings: "'wdth' 100",
                    }}
                    className="font-black uppercase tracking-tight text-ink-950 group-hover:text-bone-100 transition-colors"
                  >
                    {row.statement}
                  </h3>
                </div>

                {/* Col 9-12: Verification Source Copy */}
                <div className="lg:col-span-4 lg:col-start-9">
                  <p className="font-sans text-sm sm:text-base text-ink-950/85 group-hover:text-bone-100/85 leading-relaxed border-l-2 border-lake-600 pl-4 transition-colors">
                    {row.source}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div className="w-full h-[3px] bg-ink-950" />
        </div>
      </div>

      {/* 4. 5-Column Rising Obsidian Shutters at Bottom of Act IV (Wipes Warm Paper into Act V Finale!) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[32svh] grid grid-cols-5 pointer-events-none"
      >
        {[0, 1, 2, 3, 4].map((colIdx) => (
          <div
            key={colIdx}
            ref={(el) => {
              shutterRefs.current[colIdx] = el;
            }}
            style={{ transformOrigin: "bottom center", transform: "scaleY(0)" }}
            className="w-full h-full bg-ink-950 border-t-4 border-sun-600 will-change-transform"
          />
        ))}
      </div>
    </section>
  );
}
