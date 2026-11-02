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
  const topBannerRef = useRef<HTMLDivElement>(null);
  const bottomBannerRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [topBannerRef.current, bottomBannerRef.current, posterImgRef.current],
          { clearProps: "all", opacity: 1 }
        );
        ruleRefs.current.forEach((r) => {
          if (r) gsap.set(r, { scaleX: 1 });
        });
        rowRefs.current.forEach((row) => {
          if (row) gsap.set(row, { clearProps: "all", opacity: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Instantaneous 1:1 Scroll-Scrubbed Kinetic Title Banner & Poster Zoom (`scrub: true`)
        const headerTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 95%",
            end: "bottom top",
            scrub: true,
          },
        });

        if (topBannerRef.current) {
          headerTl.fromTo(
            topBannerRef.current,
            { xPercent: -12 },
            { xPercent: 8, ease: "none" },
            0
          );
        }

        if (bottomBannerRef.current) {
          headerTl.fromTo(
            bottomBannerRef.current,
            { xPercent: 12 },
            { xPercent: -8, ease: "none" },
            0
          );
        }

        if (posterImgRef.current) {
          headerTl.fromTo(
            posterImgRef.current,
            { scale: 1.12 },
            { scale: 1.0, ease: "none" },
            0
          );
        }

        // 2. 1:1 Scroll-Scrubbed Verification Rows (Zero Delay, Zero Black Circle Covering Text!)
        rowRefs.current.forEach((row, idx) => {
          const rule = ruleRefs.current[idx];
          if (!row) return;

          const rowTl = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              start: "top 95%",
              end: "top 40%",
              scrub: true,
            },
          });

          if (rule) {
            rowTl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
          }

          rowTl.fromTo(
            row,
            { y: 28, opacity: 0.2 },
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
      className="relative w-full bg-bone-100 text-ink-950 py-24 sm:py-36 px-6 sm:px-12 lg:px-20 select-none overflow-hidden border-t-4 border-lake-600"
    >
      <div className="relative z-10 max-w-[1640px] mx-auto space-y-16 sm:space-y-24">
        {/* 1. Monumental Counter-Sliding Kinetic Header (Diacritic-Safe, 100% Unbroken) */}
        <div className="space-y-2 pointer-events-none">
          <div ref={topBannerRef} className="will-change-transform">
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.75rem, 8.2vw, 10.2rem)",
                lineHeight: 1.15,
                fontVariationSettings: "'wdth' 80",
              }}
              className="font-black uppercase tracking-tight text-ink-950 whitespace-nowrap pt-[0.16em]"
            >
              TIN CẬY BẰNG
            </h2>
          </div>

          <div
            ref={bottomBannerRef}
            className="flex items-center justify-end gap-6 -mt-[1vw] will-change-transform"
          >
            <span className="hidden md:block flex-1 max-w-xs h-[3px] bg-lake-600" />
            <span
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.75rem, 8.2vw, 10.2rem)",
                lineHeight: 1.15,
                fontVariationSettings: "'wdth' 114",
              }}
              className="font-black uppercase tracking-tight text-lake-600 whitespace-nowrap pt-[0.16em]"
            >
              DỮ KIỆN.
            </span>
          </div>
        </div>

        {/* 2. Bold 12-Column Asymmetric Split: Left Sticky Framed Poster 1 Mount (Cols 1-6) + Right Verification Ledger (Cols 7-12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left 6 Columns: Sticky Architectural Passe-Partout Mount for Poster 1 (`poster-bugatti-heritage.webp`) */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="bg-ink-950 p-2 sm:p-4 border-2 border-ink-950">
              <div className="relative w-full overflow-hidden bg-bone-100">
                <img
                  ref={posterImgRef}
                  src="/assets/posters/poster-bugatti-heritage.webp"
                  alt="Engineering Heritage Constructivist Lithograph"
                  className="w-full h-auto object-cover pointer-events-none will-change-transform"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Architectural Caption Strip */}
              <div className="pt-4 pb-2 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-bone-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1.5 bg-lake-400 inline-block" />
                  <span className="w-3 h-1.5 bg-lake-400 inline-block" />
                  <span className="w-3 h-1.5 bg-lake-400 inline-block" />
                  <span className="text-[11px] tracking-[0.22em] uppercase font-bold text-bone-100/90 ml-2">
                    ENGINEERING HERITAGE
                  </span>
                </div>
                <span className="text-[11px] tracking-[0.22em] uppercase font-bold text-lake-400">
                  100% ĐỘI XE SỞ HỮU TRỰC TIẾP
                </span>
              </div>
            </div>
          </div>

          {/* Right 6 Columns: 4 High-Contrast Verification Rows (100% Visible, Zero Covering Circle!) */}
          <div className="lg:col-span-6">
            {TRUST_DATA_ROWS.map((row, idx) => (
              <div
                key={row.key}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="group relative w-full py-9 sm:py-10 transition-colors duration-300 hover:bg-ink-950 hover:text-bone-100 px-6 -mx-6 will-change-transform"
              >
                {/* 1:1 Scroll-Scrubbed 2px Ink Rule */}
                <div
                  ref={(el) => {
                    ruleRefs.current[idx] = el;
                  }}
                  style={{ transformOrigin: "left center" }}
                  className="absolute top-0 left-0 right-0 h-[2px] bg-ink-950 will-change-transform"
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontSize: "var(--fs-micro)",
                        letterSpacing: "var(--ls-micro)",
                      }}
                      className="font-sans font-bold text-lake-600 group-hover:text-lake-400 uppercase transition-colors"
                    >
                      {row.key}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontVariationSettings: "'wdth' 68",
                      }}
                      className="font-black text-3xl text-ink-950 group-hover:text-bone-100 transition-colors"
                    >
                      {row.index}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-archivo, sans-serif)",
                      fontSize: "clamp(1.65rem, 2.8vw, 2.75rem)",
                      lineHeight: 1.14,
                      fontVariationSettings: "'wdth' 98",
                    }}
                    className="font-black uppercase tracking-tight text-ink-950 group-hover:text-bone-100 transition-colors"
                  >
                    {row.statement}
                  </h3>

                  <p className="font-sans text-sm sm:text-base text-ink-950/85 group-hover:text-bone-100/85 leading-relaxed transition-colors">
                    {row.source}
                  </p>
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
