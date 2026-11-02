"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const CHAPTER_3_STEPS = [
  {
    step: "01",
    tag: "ĐỊNH DANH SỐ",
    title: "XÁC MINH SỐ HÓA",
    desc: "Đối chiếu tài khoản và hồ sơ lái xe trực tiếp trên nền tảng trực tuyến. Loại bỏ hoàn toàn thủ tục giấy tờ rườm rà tại quầy.",
  },
  {
    step: "02",
    tag: "BÀN GIAO CHUẨN XÁC",
    title: "NHẬN XE TẠI TRẠM",
    desc: "Chìa khóa số kích hoạt ngay sau biên bản kiểm định tình trạng ngoại thất và kỹ thuật thực tế tại hệ thống trạm trung tâm.",
  },
  {
    step: "03",
    tag: "ĐỐI SOÁT TỰ ĐỘNG",
    title: "TRẢ XE VÀ HOÀN CỌC",
    desc: "Nghiệm thu minh bạch bằng dữ liệu đối soát trực quan. Toàn bộ khoản đặt cọc được hệ thống xử lý hoàn trả tự động qua cổng thanh toán.",
  },
];

export default function SceneBSection() {
  const containerRef = useRef<HTMLElement>(null);
  const act2TrackRef = useRef<HTMLDivElement>(null);
  const ch2HeadlineRef = useRef<HTMLDivElement>(null);
  const posterPlateRef = useRef<HTMLDivElement>(null);
  const haiVanImgRef = useRef<HTMLImageElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const progressSpineRef = useRef<HTMLDivElement>(null);

  const ch3SectionRef = useRef<HTMLDivElement>(null);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        ruleRefs.current.forEach((rule) => {
          if (rule) gsap.set(rule, { scaleX: 1 });
        });
        rowRefs.current.forEach((row) => {
          if (row) gsap.set(row, { opacity: 1, y: 0 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Act II Pinned Diptych Choreography (Counter-Parallax + Cornering Car)
        if (act2TrackRef.current) {
          const act2Tl = gsap.timeline({
            scrollTrigger: {
              trigger: act2TrackRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
            },
          });

          if (progressSpineRef.current) {
            act2Tl.fromTo(
              progressSpineRef.current,
              { scaleY: 0.15 },
              { scaleY: 1, ease: "none" },
              0
            );
          }

          if (haiVanImgRef.current) {
            act2Tl.fromTo(
              haiVanImgRef.current,
              { scale: 1.15, yPercent: -6 },
              { scale: 1.0, yPercent: 8, ease: "none" },
              0
            );
          }

          if (posterPlateRef.current) {
            act2Tl.fromTo(
              posterPlateRef.current,
              { yPercent: 16 },
              { yPercent: -14, ease: "none" },
              0
            );
          }

          if (carRef.current) {
            act2Tl.fromTo(
              carRef.current,
              { xPercent: 14, yPercent: 6, scale: 0.88 },
              { xPercent: -6, yPercent: -8, scale: 1.06, ease: "none" },
              0
            );
          }

          if (mistRef.current) {
            act2Tl.fromTo(
              mistRef.current,
              { xPercent: 10, opacity: 0.3 },
              { xPercent: -15, opacity: 0.7, ease: "none" },
              0
            );
          }

          if (ch2HeadlineRef.current) {
            act2Tl.fromTo(
              ch2HeadlineRef.current,
              { yPercent: 12 },
              { yPercent: -18, ease: "none" },
              0
            );
          }
        }

        // 2. Act III Hairline Grid Draw (scaleX 0 -> 1) + Staggered Row Focus
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
                  start: "top 85%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }

          gsap.fromTo(
            row,
            { y: 28, opacity: 0.25 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              ease: "power3.out",
              scrollTrigger: {
                trigger: row,
                start: "top 82%",
                end: "bottom 25%",
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
      id="cung-duong"
      className="relative w-full scene-b bg-ink-950 text-bone-100 select-none border-t border-bone-100/20"
    >
      {/* ================= ACT II: ASYMMETRICAL POSTER DIPTYCH (185svh Sticky Track) ================= */}
      <div ref={act2TrackRef} className="relative w-full h-[185svh]">
        <div className="sticky top-0 w-full h-[100svh] overflow-hidden flex flex-col justify-between px-4 sm:px-8 lg:px-14 py-16">
          {/* Constructivist Progress Spine */}
          <div
            ref={progressSpineRef}
            aria-hidden="true"
            style={{ zIndex: 25, transformOrigin: "top center" }}
            className="hidden lg:block absolute top-0 bottom-0 left-[41.666%] w-[3px] bg-sun-600 pointer-events-none"
          />

          {/* 12-Column Asymmetrical Diptych Stage */}
          <div className="relative w-full h-full grid grid-cols-1 lg:grid-cols-12 border border-bone-100/20 bg-ink-950">
            {/* LEFT COLUMN (Cols 1-5): Pure Dark Ink Stage (100% Contrast for Headline) + Poster 2 Art Plate */}
            <div
              style={{ zIndex: 30 }}
              className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 bg-ink-950 border-b lg:border-b-0 lg:border-r border-bone-100/20"
            >
              <div ref={ch2HeadlineRef} className="space-y-4 will-change-transform">
                <div className="flex items-center justify-between text-[11px] tracking-[0.24em] uppercase font-semibold text-bone-100/60 pb-3 border-b border-bone-100/15">
                  <span>ACT II // GRAND TOURING</span>
                  <span className="text-sun-400">SPEED MEETS NATURE</span>
                </div>

                <h2
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(2.25rem, 4.4vw, 4.75rem)",
                    lineHeight: 1.02,
                    fontVariationSettings: "'wdth' 85",
                  }}
                  className="font-black uppercase tracking-tight text-bone-100 pt-2"
                >
                  «ĐƯỜNG DÀI LÀ ĐỂ ĐI CHẬM.»
                </h2>

                <p className="font-sans text-sm sm:text-base text-bone-100/80 leading-relaxed max-w-md">
                  Hành trình không đo bằng vận tốc cực đại, mà bằng sự tĩnh tại khi làm chủ cỗ máy cơ khí giữa đèo cao và biển rộng.
                </p>
              </div>

              {/* Integrated Poster 2 Lithograph Plate (poster-mountain-grand-tour.webp) */}
              <div
                ref={posterPlateRef}
                className="hidden sm:block relative w-full mt-6 border border-bone-100/25 bg-ink-800 overflow-hidden rounded-none will-change-transform"
              >
                <img
                  src="/assets/posters/poster-mountain-grand-tour.webp"
                  alt="Grand Tour Mountain Lithograph Poster"
                  className="w-full h-44 lg:h-52 object-cover object-center pointer-events-none"
                  loading="lazy"
                  decoding="async"
                />
                <div className="px-4 py-2 bg-ink-950 border-t border-bone-100/20 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase text-bone-100/70">
                  <span>ARCHIVAL PLATE // 02</span>
                  <span>THE SUPERCAR · GRAND TOUR</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Cols 6-12): Hai Van Woodcut Panorama + Architectural Road Plinth for Car */}
            <div className="lg:col-span-7 relative min-h-[46svh] lg:h-full flex flex-col justify-end overflow-hidden bg-ink-800">
              {/* Hai Van Woodcut Backdrop */}
              <div className="relative w-full flex-1 overflow-hidden">
                <picture className="w-full h-full block pointer-events-none">
                  <source
                    type="image/avif"
                    srcSet="/assets/landing/b0-backdrop-3840.avif 3840w, /assets/landing/b0-backdrop-2880.avif 2880w, /assets/landing/b0-backdrop-1920.avif 1920w, /assets/landing/b0-backdrop-1280.avif 1280w"
                  />
                  <source
                    type="image/webp"
                    srcSet="/assets/landing/b0-backdrop-3840.webp 3840w, /assets/landing/b0-backdrop-2880.webp 2880w, /assets/landing/b0-backdrop-1920.webp 1920w, /assets/landing/b0-backdrop-1280.webp 1280w"
                  />
                  <img
                    ref={haiVanImgRef}
                    src="/assets/landing/b0-backdrop-1920.webp"
                    alt="Cung đường Đèo Hải Vân"
                    className="w-full h-full object-cover object-left-top pointer-events-none will-change-transform"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>

                {/* Drifting Sea Mist */}
                <div
                  ref={mistRef}
                  style={{ mixBlendMode: "screen", opacity: 0.45 }}
                  className="absolute inset-0 pointer-events-none will-change-transform"
                >
                  <img
                    src="/assets/landing/b5-mist-1920.webp"
                    alt=""
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Top-Right Technical Coordinate in Dark Sky Zone */}
                <div className="absolute top-5 right-6 text-right text-[10px] tracking-[0.24em] uppercase font-semibold text-bone-100/80 pointer-events-none">
                  <span className="block">HAI VAN PASS // COASTAL RIDGE</span>
                  <span className="text-bone-100/50">16.2000° N, 108.1333° E</span>
                </div>
              </div>

              {/* Architectural Asphalt Plinth (Grounds the Car solidly so it NEVER floats on water) */}
              <div className="relative w-full h-24 sm:h-32 bg-ink-950 border-t border-bone-100/30 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1.5 bg-sun-600 inline-block" />
                  <span className="w-3 h-1.5 bg-sun-600 inline-block" />
                  <span className="w-3 h-1.5 bg-sun-600 inline-block" />
                  <span className="text-[10px] tracking-[0.24em] uppercase text-bone-100/60 ml-2">
                    GRAND TOURER STAGE
                  </span>
                </div>
                <span className="text-[10px] tracking-[0.24em] uppercase text-bone-100/50">
                  REAR-AXLE STEERING · ACTIVE SUSPENSION
                </span>
              </div>

              {/* Cornering Lithograph Car (Anchored on the Road Plinth, overlapping the stage) */}
              <div
                ref={carRef}
                style={{
                  zIndex: 35,
                  width: "clamp(290px, 40vw, 680px)",
                }}
                className="absolute bottom-4 sm:bottom-6 right-4 sm:right-10 pointer-events-none will-change-transform"
              >
                <picture className="w-full block">
                  <source
                    type="image/avif"
                    srcSet="/assets/landing/b4-car-2000.avif 2000w, /assets/landing/b4-car-1920.avif 1920w, /assets/landing/b4-car-1280.avif 1280w, /assets/landing/b4-car-960.avif 960w"
                  />
                  <source
                    type="image/webp"
                    srcSet="/assets/landing/b4-car-2000.webp 2000w, /assets/landing/b4-car-1920.webp 1920w, /assets/landing/b4-car-1280.webp 1280w, /assets/landing/b4-car-960.webp 960w"
                  />
                  <img
                    src="/assets/landing/b4-car-1280.webp"
                    alt="Siêu xe ôm cua Đèo Hải Vân"
                    className="w-full h-auto object-contain pointer-events-none"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ACT III: MONUMENTAL 3-STEP HAIRLINE LEDGER ================= */}
      <div
        ref={ch3SectionRef}
        id="quy-trinh"
        className="relative w-full bg-ink-950 py-24 sm:py-32 px-4 sm:px-8 lg:px-14 border-t border-bone-100/20"
      >
        <div className="max-w-7xl mx-auto">
          {/* Editorial Section Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-14">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase font-semibold text-sun-400 mb-3">
                <span>ACT III // THE PROTOCOL</span>
                <span className="w-10 border-t border-sun-400/50" />
                <span>ZERO FRICTION</span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.5rem, 6.2vw, 6.5rem)",
                  lineHeight: 0.98,
                  fontVariationSettings: "'wdth' 110",
                }}
                className="font-black uppercase tracking-tight text-bone-100"
              >
                NHẸ NHƯ KHÔNG.
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="font-sans text-sm sm:text-base text-bone-100/75 leading-relaxed">
                Ba bước chuẩn hóa loại bỏ mọi thủ tục rườm rà. Nhận xe và hoàn trả bằng điện thoại với sự minh bạch tuyệt đối.
              </p>
            </div>
          </div>

          {/* 3 Monumental Asymmetric Hairline Rows */}
          <div className="space-y-4">
            {CHAPTER_3_STEPS.map((item, idx) => (
              <div
                key={item.step}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="relative w-full pb-12 pt-8 will-change-transform"
              >
                {/* Animated 1px Hairline Rule (scaleX 0 -> 1 from left) */}
                <div
                  ref={(el) => {
                    ruleRefs.current[idx] = el;
                  }}
                  style={{ transformOrigin: "left center" }}
                  className="absolute top-0 left-0 right-0 border-t border-bone-100/30 will-change-transform"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-baseline">
                  {/* Col 1-2: Monumental Constructivist Index Number */}
                  <div className="lg:col-span-2 flex items-baseline gap-4">
                    <span
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(3rem, 5.5vw, 5.5rem)",
                        lineHeight: 0.9,
                        fontVariationSettings: "'wdth' 68",
                      }}
                      className="font-black text-sun-400"
                    >
                      {item.step}
                    </span>
                    <span className="text-[10px] tracking-[0.24em] uppercase font-semibold text-bone-100/50 lg:hidden">
                      {item.tag}
                    </span>
                  </div>

                  {/* Col 3-7: Bold Statement Title (Asymmetrically indented on even row) */}
                  <div
                    className={
                      idx % 2 === 1
                        ? "lg:col-span-5 lg:col-start-4"
                        : "lg:col-span-5 lg:col-start-3"
                    }
                  >
                    <span className="hidden lg:block text-[10px] tracking-[0.24em] uppercase font-semibold text-bone-100/50 mb-2">
                      {item.tag}
                    </span>
                    <h3
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(1.75rem, 3.4vw, 3.4rem)",
                        lineHeight: 1.05,
                        fontVariationSettings: "'wdth' 105",
                      }}
                      className="font-black uppercase tracking-tight text-bone-100"
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Col 8-12: Editorial Description */}
                  <div className="lg:col-span-4 lg:col-start-9">
                    <p className="font-sans text-sm sm:text-base text-bone-100/80 leading-relaxed">
                      {item.desc}
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
