"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const TRUST_HEADING_WORDS = ["TIN", "CẬY", "BẰNG", "DỮ", "KIỆN."];

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
  const posterWrapRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const headingWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const portalDiscRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(posterImgRef.current, { clearProps: "all", opacity: 1 });
        headingWordRefs.current.forEach((w) => {
          if (w) gsap.set(w, { clearProps: "all", opacity: 1 });
        });
        ruleRefs.current.forEach((r) => {
          if (r) gsap.set(r, { scaleX: 1 });
        });
        rowRefs.current.forEach((row) => {
          if (row) gsap.set(row, { opacity: 1, y: 0 });
        });
        if (portalDiscRef.current) gsap.set(portalDiscRef.current, { scale: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Poster 1 (`poster-bugatti-heritage.webp`) Scroll Scale & Parallax
        if (posterImgRef.current && posterWrapRef.current) {
          gsap.fromTo(
            posterImgRef.current,
            { scale: 0.9, yPercent: 6 },
            {
              scale: 1.03,
              yPercent: -5,
              ease: "none",
              scrollTrigger: {
                trigger: posterWrapRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        }

        // 2. Diacritic-Safe Kinetic Per-Word Heading Reveal
        const validWords = headingWordRefs.current.filter(Boolean);
        if (validWords.length > 0) {
          gsap.fromTo(
            validWords,
            { yPercent: 115, rotateZ: 3, opacity: 0 },
            {
              yPercent: 0,
              rotateZ: 0,
              opacity: 1,
              duration: 0.95,
              stagger: 0.06,
              ease: "expo.out",
              scrollTrigger: {
                trigger: validWords[0],
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // 3. Proof Ledger Self-Drawing Rules
        rowRefs.current.forEach((row, idx) => {
          const rule = ruleRefs.current[idx];
          if (!row) return;

          if (rule) {
            gsap.fromTo(
              rule,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 0.95,
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
            { opacity: 0.2, y: 26 },
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

        // 4. Expanding Constructivist Eclipse Portal Transition into Chapter 5 (Dark Ink Finale)
        if (portalDiscRef.current) {
          gsap.fromTo(
            portalDiscRef.current,
            { scale: 0.05 },
            {
              scale: 2.8,
              ease: "power2.in",
              scrollTrigger: {
                trigger: portalDiscRef.current,
                start: "top 95%",
                end: "bottom top",
                scrub: 0.5,
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
      className="relative w-full bg-bone-100 text-ink-950 pt-16 sm:pt-24 pb-32 sm:pb-44 px-6 sm:px-12 lg:px-20 select-none overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto space-y-24">
        {/* 1. Full-Scale Poster 1 Masterpiece (`brightness(1.07) contrast(1.08)` + `multiply` dissolves the beige box 100% into `bg-bone-100`) */}
        <div
          ref={posterWrapRef}
          className="relative w-full max-w-[1480px] mx-auto overflow-hidden"
        >
          <img
            ref={posterImgRef}
            src="/assets/posters/poster-bugatti-heritage.webp"
            alt="Constructivist Hypercar Heritage Lithograph"
            style={{
              mixBlendMode: "multiply",
              filter: "brightness(1.07) contrast(1.08)",
            }}
            className="w-full h-auto object-contain pointer-events-none will-change-transform"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* 2. Wide Horizontal Editorial Header (Prevents 4-line narrow stacking & diacritic collisions!) */}
        <div className="border-t-2 border-ink-950 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.5rem, 6.2vw, 7.0rem)",
                lineHeight: 1.16,
                fontVariationSettings: "'wdth' 96",
              }}
              className="font-black uppercase tracking-tight text-ink-950 flex flex-wrap items-baseline gap-x-[0.24em] gap-y-1"
            >
              {TRUST_HEADING_WORDS.map((word, wIdx) => (
                <span
                  key={word}
                  className="inline-block overflow-hidden pt-[0.22em] pb-[0.08em] -mt-[0.18em]"
                >
                  <span
                    ref={(el) => {
                      headingWordRefs.current[wIdx] = el;
                    }}
                    className="inline-block will-change-transform"
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p className="font-sans text-sm sm:text-base text-ink-950/85 leading-relaxed font-medium border-l-2 border-lake-600 pl-4">
              Không dùng lời hứa quảng cáo. Mọi chuyến đi đều được bảo chứng bằng pháp nhân rõ ràng, bảo hiểm vật chất toàn diện và cơ chế hoàn cọc tự động.
            </p>
          </div>
        </div>

        {/* 3. 4 Full-Width Architectural Proof Ledgers */}
        <div>
          {TRUST_DATA_ROWS.map((row, idx) => (
            <div
              key={row.key}
              ref={(el) => {
                rowRefs.current[idx] = el;
              }}
              className="group relative w-full py-10 sm:py-12 transition-colors duration-300 hover:bg-ink-950 hover:text-bone-100 px-4 sm:px-8 -mx-4 sm:-mx-8 will-change-transform"
            >
              {/* Self-Drawing Woodblock Ink Rule */}
              <div
                ref={(el) => {
                  ruleRefs.current[idx] = el;
                }}
                style={{ transformOrigin: "left center" }}
                className="absolute top-0 left-0 right-0 h-[2px] bg-ink-950 will-change-transform"
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-baseline">
                <div className="lg:col-span-4 flex items-baseline gap-4">
                  <span
                    style={{
                      fontFamily: "var(--font-archivo, sans-serif)",
                      fontVariationSettings: "'wdth' 70",
                    }}
                    className="font-black text-2xl sm:text-3xl text-lake-600 group-hover:text-lake-400 transition-colors"
                  >
                    {row.index}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--fs-micro)",
                      letterSpacing: "var(--ls-micro)",
                    }}
                    className="font-sans font-bold text-ink-950/75 group-hover:text-bone-100/75 uppercase block transition-colors"
                  >
                    {row.key}
                  </span>
                </div>

                <div className="lg:col-span-5">
                  <h3
                    style={{
                      fontFamily: "var(--font-archivo, sans-serif)",
                      fontSize: "clamp(1.5rem, 2.6vw, 2.5rem)",
                      lineHeight: 1.15,
                      fontVariationSettings: "'wdth' 96",
                    }}
                    className="font-black uppercase tracking-tight text-ink-950 group-hover:text-bone-100 transition-colors"
                  >
                    {row.statement}
                  </h3>
                </div>

                <div className="lg:col-span-3">
                  <p className="font-sans text-sm text-ink-950/80 group-hover:text-bone-100/80 leading-relaxed transition-colors">
                    {row.source}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div className="w-full h-[2px] bg-ink-950" />
        </div>
      </div>

      {/* 4. Expanding Constructivist Eclipse Portal (Seamless Circular Transition into Chapter 5's Dark Ink Night Sky) */}
      <div
        aria-hidden="true"
        className="relative w-full h-24 flex items-center justify-center pointer-events-none mt-12"
      >
        <div
          ref={portalDiscRef}
          className="w-[45vw] aspect-square rounded-full bg-ink-950 will-change-transform"
        />
      </div>
    </section>
  );
}
