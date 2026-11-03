
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const TRUST_BLADES = [
  {
    index: "01",
    side: "left",
    key: "PHÁP NHÂN VẬN TẢI",
    metric: "100% HỢP ĐỒNG SỐ",
    statement: "DOANH NGHIỆP VẬN TẢI ĐƯỢC CẤP PHÉP",
    source: "Hợp đồng thuê xe điện tử có giá trị pháp lý toàn diện · Hồ sơ pháp nhân minh bạch.",
  },
  {
    index: "02",
    side: "right",
    key: "BẢO HIỂM TOÀN DIỆN",
    metric: "BẢO LÃNH HIỆN TRƯỜNG 24/7",
    statement: "BẢO HIỂM VẬT CHẤT VÀ THÂN VỎ 100%",
    source: "Mọi chuyến đi đều đi kèm gói bảo hiểm vật chất xe và hỗ trợ kỹ thuật hiện trường.",
  },
  {
    index: "03",
    side: "left",
    key: "HOÀN CỌC MINH BẠCH",
    metric: "TỰ ĐỘNG QUA PAYOS",
    statement: "ĐỐI SOÁT TỰ ĐỘNG QUA CỔNG PAYOS",
    source: "Biên bản kiểm định số hóa đối chiếu trước và sau chuyến đi · Không phát sinh phí ẩn.",
  },
  {
    index: "04",
    side: "right",
    key: "ĐỘI XE TUYỂN CHỌN",
    metric: "SỞ HỮU TRỰC TIẾP",
    statement: "PORSCHE · MERCEDES-AMG · LAMBORGHINI",
    source: "100% phương tiện thuộc đội xe chuẩn hóa, bảo dưỡng định kỳ theo tiêu chuẩn hãng.",
  },
];

export default function TrustChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const deckStageRef = useRef<HTMLDivElement>(null);
  const blockShutter1Ref = useRef<HTMLDivElement>(null);
  const blockShutter2Ref = useRef<HTMLDivElement>(null);
  const blueprintSvgRef = useRef<SVGSVGElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const bladeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            deckStageRef.current,
            blueprintSvgRef.current,
            spineRef.current,
            posterImgRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
        if (blockShutter1Ref.current) gsap.set(blockShutter1Ref.current, { scaleX: 0 });
        if (blockShutter2Ref.current) gsap.set(blockShutter2Ref.current, { scaleX: 0 });
        bladeRefs.current.forEach((b) => {
          if (b) gsap.set(b, { clearProps: "all", opacity: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. UNIQUE SECTION 3 -> SECTION 4 TRANSITION: 3D Isometric Blueprint Sheet Unfold (`rotateX: 28deg, rotateZ: -2.5deg, scale: 0.86 -> 0`)
        if (deckStageRef.current) {
          gsap.fromTo(
            deckStageRef.current,
            { rotateX: 28, rotateZ: -2.5, scale: 0.86, y: 80 },
            {
              rotateX: 0,
              rotateZ: 0,
              scale: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 95%",
                end: "top 22%",
                scrub: true,
              },
            }
          );
        }

        // 2. UNIQUE TYPOGRAPHY MOTION #4: Dual-Color Lithograph Ink-Roller Block Stamp
        if (blockShutter1Ref.current && blockShutter2Ref.current) {
          gsap.fromTo(
            [blockShutter1Ref.current, blockShutter2Ref.current],
            { scaleX: 1 },
            {
              scaleX: 0,
              stagger: 0.14,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 78%",
                end: "top 28%",
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

        if (blueprintSvgRef.current) {
          masterTl.fromTo(
            blueprintSvgRef.current,
            { rotate: -90 },
            { rotate: 90, ease: "none" },
            0
          );
        }

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

        // 3. Asymmetric Cantilever Spine Blades
        bladeRefs.current.forEach((blade, idx) => {
          if (!blade) return;
          const isLeft = idx % 2 === 0;

          gsap.fromTo(
            blade,
            { xPercent: isLeft ? 16 : -16, y: 40, opacity: 0.15 },
            {
              xPercent: 0,
              y: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: blade,
                start: "top 95%",
                end: "top 40%",
                scrub: true,
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
      style={{ perspective: "1600px" }}
      className="relative w-full bg-ink-950 select-none overflow-hidden pt-8"
    >
      {/* 3D Unfolding Archival Blueprint Sheet */}
      <div
        ref={deckStageRef}
        style={{ transformOrigin: "center top" }}
        className="relative w-full bg-bone-100 text-ink-950 border-t-8 border-lake-600 py-24 sm:py-36 px-8 sm:px-14 lg:px-24 overflow-hidden will-change-transform"
      >
        {/* Rich Constructivist SVG Blueprint Schematic & Architectural Grid */}
        <svg
          ref={blueprintSvgRef}
          aria-hidden="true"
          viewBox="0 0 600 600"
          className="hidden lg:block absolute -left-28 top-20 w-[520px] h-[520px] text-lake-600/[0.10] pointer-events-none will-change-transform"
        >
          <circle cx="300" cy="300" r="270" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="14 8" />
          <circle cx="300" cy="300" r="210" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="140" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="20" y1="300" x2="580" y2="300" stroke="currentColor" strokeWidth="1.5" />
          <line x1="300" y1="20" x2="300" y2="580" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none grid grid-cols-4 lg:grid-cols-12 px-8 sm:px-14 lg:px-24"
        >
          <div className="border-l border-ink-950/[0.08] h-full" />
          <div className="hidden lg:block lg:col-start-7 border-l border-ink-950/[0.08] h-full" />
          <div className="col-start-4 lg:col-start-12 border-r border-ink-950/[0.08] h-full" />
        </div>

        {/* Direct bg-bone-100 without z-index isolation so Poster 1 blends 100.0% into #E9E4D8! */}
        <div className="max-w-[1600px] mx-auto bg-bone-100 space-y-16 sm:space-y-24">
          {/* 1. Editorial Exhibition Header with Dual-Color Lithograph Ink-Roller Stamp */}
          <div className="border-b-2 border-ink-950 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-2">
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
                className="font-black uppercase tracking-tight text-ink-950 flex flex-wrap items-baseline gap-x-[0.24em]"
              >
                <span className="relative inline-block overflow-hidden pt-[0.14em] pb-[0.04em]">
                  <span>TIN CẬY BẰNG</span>
                  <span
                    ref={blockShutter1Ref}
                    style={{ transformOrigin: "right center" }}
                    className="absolute inset-0 bg-ink-950 pointer-events-none will-change-transform"
                  />
                </span>

                <span className="relative inline-block overflow-hidden pt-[0.14em] pb-[0.04em]">
                  <span className="text-lake-600">DỮ KIỆN.</span>
                  <span
                    ref={blockShutter2Ref}
                    style={{ transformOrigin: "right center" }}
                    className="absolute inset-0 bg-lake-600 pointer-events-none will-change-transform"
                  />
                </span>
              </h2>
            </div>

            <p className="font-sans text-base sm:text-lg text-ink-950/85 max-w-md leading-relaxed font-medium border-l-4 border-lake-600 pl-5">
              Không dùng lời hứa quảng cáo. Mọi chuyến đi đều được bảo chứng bằng pháp nhân rõ ràng, bảo hiểm vật chất toàn diện và cơ chế hoàn cọc tự động.
            </p>
          </div>

          {/* 2. Deterministic 16:9 Container + Seamless Poster 1 Masterpiece */}
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

          {/* 3. Asymmetric Central-Spine Cantilever Architecture */}
          <div className="relative pt-8 pb-4">
            <div
              ref={spineRef}
              aria-hidden="true"
              style={{ transformOrigin: "top center" }}
              className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-lake-600 will-change-transform"
            />

            <div className="space-y-10 lg:space-y-0">
              {TRUST_BLADES.map((blade, idx) => {
                const isLeft = blade.side === "left";
                return (
                  <div
                    key={blade.key}
                    ref={(el) => {
                      bladeRefs.current[idx] = el;
                    }}
                    className={`relative grid grid-cols-1 lg:grid-cols-12 items-center ${
                      idx > 0 ? "lg:-mt-12" : ""
                    } will-change-transform`}
                  >
                    <div
                      className={
                        isLeft
                          ? "lg:col-span-6 lg:pr-10"
                          : "lg:col-span-6 lg:col-start-7 lg:pl-10"
                      }
                    >
                      <div
                        className={
                          idx % 2 === 0
                            ? "bg-ink-950 text-bone-100 p-8 sm:p-10 border-t-4 border-lake-400 shadow-2xl"
                            : "bg-bone-100 text-ink-950 p-8 sm:p-10 border-2 border-ink-950 border-t-8 border-t-sun-600 shadow-2xl"
                        }
                      >
                        <div className="flex items-baseline justify-between border-b border-current/20 pb-4 mb-6">
                          <div>
                            <span
                              style={{
                                fontSize: "var(--fs-micro)",
                                letterSpacing: "var(--ls-micro)",
                              }}
                              className={
                                idx % 2 === 0
                                  ? "font-sans font-bold text-lake-400 uppercase block"
                                  : "font-sans font-bold text-lake-600 uppercase block"
                              }
                            >
                              {blade.key}
                            </span>
                            <span className="text-[10px] tracking-[0.24em] uppercase font-sans font-bold opacity-65 mt-1 block">
                              {blade.metric}
                            </span>
                          </div>

                          <span
                            style={{
                              fontFamily: "var(--font-archivo, sans-serif)",
                              fontSize: "clamp(3.25rem, 5vw, 5.25rem)",
                              lineHeight: 0.88,
                              fontVariationSettings: "'wdth' 64",
                            }}
                            className={
                              idx % 2 === 0
                                ? "font-black text-lake-400"
                                : "font-black text-sun-600"
                            }
                          >
                            {blade.index}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontFamily: "var(--font-archivo, sans-serif)",
                            fontSize: "clamp(1.75rem, 2.6vw, 2.75rem)",
                            lineHeight: 1.1,
                            fontVariationSettings: "'wdth' 98",
                          }}
                          className="font-black uppercase tracking-tight mb-3"
                        >
                          {blade.statement}
                        </h3>

                        <p className="font-sans text-sm sm:text-base opacity-85 leading-relaxed">
                          {blade.source}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

