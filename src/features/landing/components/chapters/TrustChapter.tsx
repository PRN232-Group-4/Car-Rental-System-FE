
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const TRUST_WORDS = ["TIN", "CẬY", "BẰNG", "DỮ", "KIỆN."];

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

  const stageRef = useRef<HTMLDivElement>(null);

  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const blueprintSvgRef = useRef<SVGSVGElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);

  // 4 Card Vault Refs
  const bladeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardShutterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardNumRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            blueprintSvgRef.current,
            spineRef.current,
            posterImgRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
        wordRefs.current.forEach((w) => {
          if (w) gsap.set(w, { clearProps: "all", opacity: 1 });
        });
        bladeRefs.current.forEach((b) => {
          if (b) gsap.set(b, { clearProps: "all", opacity: 1 });
        });
        cardShutterRefs.current.forEach((s) => {
          if (s) gsap.set(s, { scaleX: 0 });
        });
        cardNumRefs.current.forEach((n) => {
          if (n) gsap.set(n, { clearProps: "all", opacity: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Section 3 -> 4: the paper stage opens as a disc growing from its top edge over the ink of Section 3.
        // The disc first grows to cover one viewport, then snaps to cover the whole stage so lower content is never clipped.
        const stage = stageRef.current;
        if (stage) {
          const viewportRadius = () => Math.hypot(stage.offsetWidth / 2, window.innerHeight);
          const stageRadius = () => Math.hypot(stage.offsetWidth / 2, stage.offsetHeight) + 2;

          gsap
            .timeline({
              scrollTrigger: {
                trigger: stage,
                start: "top bottom",
                end: "top 15%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              stage,
              { clipPath: "circle(0px at 50% 0px)" },
              { clipPath: () => `circle(${viewportRadius()}px at 50% 0px)`, ease: "none", duration: 0.96 }
            )
            .to(stage, { clipPath: () => `circle(${stageRadius()}px at 50% 0px)`, ease: "none", duration: 0.04 });
        }

        // 2. UNIQUE TYPOGRAPHY MOTION #4: 3D Perspective Word Cascade (Zero black box bug on `TIN CẬY BẰNG`!)
        const validWords = wordRefs.current.filter(Boolean);
        if (validWords.length > 0) {
          gsap.fromTo(
            validWords,
            {
              yPercent: 110,
              rotateX: -80,
              skewX: 12,
              opacity: 0,
            },
            {
              yPercent: 0,
              rotateX: 0,
              skewX: 0,
              opacity: 1,
              stagger: 0.07,
              ease: "none",
              scrollTrigger: {
                trigger: validWords[0],
                start: "top 88%",
                end: "top 35%",
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
            { scale: 0.93 },
            { scale: 1.03, ease: "none" },
            0
          );
        }

        // 3. 4-CARD VAULT CHOREOGRAPHY (Cards 01, 02, 03, 04 ALL execute a dramatic 3D Unfold + Armor Shutter Wipe right in the active viewport!)
        bladeRefs.current.forEach((blade, idx) => {
          const shutter = cardShutterRefs.current[idx];
          const num = cardNumRefs.current[idx];
          if (!blade) return;

          const isLeft = idx % 2 === 0;

          const cardTl = gsap.timeline({
            scrollTrigger: {
              trigger: blade,
              start: "top 82%",
              end: "top 34%",
              scrub: true,
            },
          });

          cardTl.fromTo(
            blade,
            {
              xPercent: isLeft ? -26 : 26,
              y: 64,
              rotateY: isLeft ? -28 : 28,
              rotateX: 18,
              scale: 0.88,
              opacity: 0.1,
            },
            {
              xPercent: 0,
              y: 0,
              rotateY: 0,
              rotateX: 0,
              scale: 1,
              opacity: 1,
              ease: "power2.out",
            },
            0
          );

          if (shutter) {
            cardTl.fromTo(
              shutter,
              { scaleX: 1 },
              { scaleX: 0, ease: "power2.inOut" },
              0.08
            );
          }

          if (num) {
            cardTl.fromTo(
              num,
              { yPercent: 100 },
              { yPercent: 0, ease: "power2.out" },
              0.12
            );
          }
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
      className="relative w-full bg-ink-950 text-ink-950 select-none overflow-hidden"
    >
      {/* Main Archival Blueprint Stage */}
      <div
        ref={stageRef}
        className="relative w-full bg-bone-100 text-ink-950 pt-16 sm:pt-24 pb-24 sm:pb-36 px-8 sm:px-14 lg:px-24 overflow-hidden"
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
          {/* 1. Editorial Exhibition Header with Clean 3D Perspective Word Cascade (Zero Black Box Bug!) */}
          <div
            style={{ perspective: "1000px" }}
            className="border-b-2 border-ink-950 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8"
          >
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
                {TRUST_WORDS.map((word, wIdx) => (
                  <span
                    key={word}
                    className="inline-block overflow-hidden pt-[0.2em] pb-[0.06em] -mt-[0.16em]"
                  >
                    <span
                      ref={(el) => {
                        wordRefs.current[wIdx] = el;
                      }}
                      className={
                        wIdx >= 3
                          ? "inline-block text-lake-600 will-change-transform"
                          : "inline-block text-ink-950 will-change-transform"
                      }
                    >
                      {word}
                    </span>
                  </span>
                ))}
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

          {/* 3. Asymmetric Central-Spine Cantilever Architecture (Index numbers 01-04 placed on the LEFT so `04` NEVER collides with the fixed top-right MENU button!) */}
          <div
            style={{ perspective: "1400px" }}
            className="relative pt-8 pb-4"
          >
            <div
              ref={spineRef}
              aria-hidden="true"
              style={{ transformOrigin: "top center" }}
              className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-lake-600 will-change-transform"
            />

            <div className="space-y-10 lg:space-y-6">
              {TRUST_BLADES.map((blade, idx) => {
                const isLeft = blade.side === "left";
                return (
                  <div
                    key={blade.key}
                    ref={(el) => {
                      bladeRefs.current[idx] = el;
                    }}
                    className="relative grid grid-cols-1 lg:grid-cols-12 items-center will-change-transform"
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
                            ? "relative overflow-hidden bg-ink-950 text-bone-100 p-8 sm:p-10 border-t-4 border-lake-400 shadow-2xl"
                            : "relative overflow-hidden bg-bone-100 text-ink-950 p-8 sm:p-10 border-2 border-ink-950 border-t-8 border-t-sun-600 shadow-2xl"
                        }
                      >
                        {/* Sliding Mechanical Armor Shutter (`scaleX: 1 -> 0` on scroll!) */}
                        <div
                          ref={(el) => {
                            cardShutterRefs.current[idx] = el;
                          }}
                          aria-hidden="true"
                          style={{
                            transformOrigin: isLeft ? "right center" : "left center",
                            zIndex: 20,
                          }}
                          className={
                            idx % 2 === 0
                              ? "absolute inset-0 bg-lake-600 pointer-events-none will-change-transform"
                              : "absolute inset-0 bg-ink-950 pointer-events-none will-change-transform"
                          }
                        />

                        {/* Left-Anchored Index Number + Right Category Badge (Never collides with top-right MENU button!) */}
                        <div className="flex items-center justify-between border-b border-current/20 pb-4 mb-6">
                          <div className="flex items-baseline gap-4">
                            <div className="overflow-hidden pt-1">
                              <span
                                ref={(el) => {
                                  cardNumRefs.current[idx] = el;
                                }}
                                style={{
                                  fontFamily: "var(--font-archivo, sans-serif)",
                                  fontSize: "clamp(3.25rem, 5vw, 5.25rem)",
                                  lineHeight: 0.88,
                                  fontVariationSettings: "'wdth' 64",
                                }}
                                className={
                                  idx % 2 === 0
                                    ? "font-black text-lake-400 inline-block will-change-transform"
                                    : "font-black text-sun-600 inline-block will-change-transform"
                                }
                              >
                                {blade.index}
                              </span>
                            </div>

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
                          </div>

                          <span className="text-xs tracking-[0.22em] font-sans font-bold opacity-40">
                            ////
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

