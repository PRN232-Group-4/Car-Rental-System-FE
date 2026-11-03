"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const CHAPTER_3_STEPS = [
  {
    step: "01",
    code: "SYS // VERIFY-01",
    tag: "ĐỊNH DANH SỐ HÓA",
    title: "XÁC MINH TRỰC TUYẾN",
    metric: "100% KHÔNG GIẤY TỜ GỐC",
    desc: "Đối chiếu tài khoản và giấy phép lái xe trực tiếp trên nền tảng số chỉ trong một lần duy nhất. Không giữ giấy tờ bản cứng tại quầy.",
  },
  {
    step: "02",
    code: "SYS // UNLOCK-02",
    tag: "BÀN GIAO CHUẨN XÁC",
    title: "NHẬN XE TẠI TRẠM",
    metric: "KÍCH HOẠT CHÌA KHÓA SỐ",
    desc: "Phương tiện sẵn sàng tại hệ thống trạm trung tâm sau quy trình kiểm định kỹ thuật thực tế. Mở khóa xe trực tiếp qua ứng dụng và khởi hành.",
  },
  {
    step: "03",
    code: "SYS // SETTLE-03",
    tag: "ĐỐI SOÁT TỰ ĐỘNG",
    title: "TRẢ XE VÀ HOÀN CỌC",
    metric: "TỰ ĐỘNG QUA CỔNG PAYOS",
    desc: "Nghiệm thu minh bạch bằng dữ liệu đối soát trực quan ngay khi kết thúc hành trình. Toàn bộ khoản đặt cọc được hệ thống xử lý hoàn trả tự động.",
  },
];

export default function SceneBSection() {
  const containerRef = useRef<HTMLElement>(null);

  // Act II Refs (Grand Tour Poster 2 + Architectural Blueprint Matrix)
  const act2Ref = useRef<HTMLDivElement>(null);
  const topKineticRef = useRef<HTMLDivElement>(null);
  const bottomKineticRef = useRef<HTMLDivElement>(null);
  const compassSvgRef = useRef<SVGSVGElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const act2ShuttersRef = useRef<(HTMLDivElement | null)[]>([]);

  // Act III Refs (Full-Viewport Kinetic Horizontal-Shift Decks — ZERO SaaS Cards!)
  const act3Ref = useRef<HTMLDivElement>(null);
  const act3HeadingRef = useRef<HTMLHeadingElement>(null);
  const act3WheelRef = useRef<SVGSVGElement>(null);
  const deckRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const act3ShuttersRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            topKineticRef.current,
            bottomKineticRef.current,
            compassSvgRef.current,
            posterImgRef.current,
            act3HeadingRef.current,
            act3WheelRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
        act2ShuttersRef.current.forEach((s) => {
          if (s) gsap.set(s, { scaleY: 0 });
        });
        act3ShuttersRef.current.forEach((s) => {
          if (s) gsap.set(s, { scaleY: 0 });
        });
        deckRefs.current.forEach((d) => {
          if (d) gsap.set(d, { clearProps: "all", opacity: 1 });
        });
        ruleRefs.current.forEach((r) => {
          if (r) gsap.set(r, { scaleX: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Act II: Kinetic Opposing Typography + Rotating Constructivist Compass + Seamless Poster Zoom (`scrub: true`)
        if (act2Ref.current) {
          const act2Tl = gsap.timeline({
            scrollTrigger: {
              trigger: act2Ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });

          if (topKineticRef.current) {
            act2Tl.fromTo(
              topKineticRef.current,
              { xPercent: 6 },
              { xPercent: -4, ease: "none" },
              0
            );
          }

          if (bottomKineticRef.current) {
            act2Tl.fromTo(
              bottomKineticRef.current,
              { xPercent: -6 },
              { xPercent: 4, ease: "none" },
              0
            );
          }

          if (compassSvgRef.current) {
            act2Tl.fromTo(
              compassSvgRef.current,
              { rotate: -90 },
              { rotate: 90, ease: "none" },
              0
            );
          }

          if (posterImgRef.current) {
            act2Tl.fromTo(
              posterImgRef.current,
              { scale: 0.94 },
              { scale: 1.03, ease: "none" },
              0
            );
          }

          // 5-Column Obsidian Shutters Rising at the Bottom of Act II to Transition into Act III!
          const validAct2Shutters = act2ShuttersRef.current.filter(Boolean);
          if (validAct2Shutters.length > 0) {
            act2Tl.fromTo(
              validAct2Shutters,
              { scaleY: 0 },
              {
                scaleY: 1,
                stagger: 0.05,
                ease: "none",
                duration: 0.35,
              },
              0.62
            );
          }
        }

        // 2. Act III: Rotating Telemetry Ring + Alternating Horizontal-Shift Architectural Decks (Zero SaaS Cards!)
        if (act3Ref.current) {
          if (act3WheelRef.current) {
            gsap.fromTo(
              act3WheelRef.current,
              { rotate: 0 },
              {
                rotate: 180,
                ease: "none",
                scrollTrigger: {
                  trigger: act3Ref.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            );
          }

          if (act3HeadingRef.current) {
            gsap.fromTo(
              act3HeadingRef.current,
              { xPercent: -10, opacity: 0.15 },
              {
                xPercent: 0,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: act3Ref.current,
                  start: "top 88%",
                  end: "top 30%",
                  scrub: true,
                },
              }
            );
          }

          deckRefs.current.forEach((deck, idx) => {
            const rule = ruleRefs.current[idx];
            const num = numRefs.current[idx];
            if (!deck) return;

            const dir = idx % 2 === 0 ? -10 : 10;

            const deckTl = gsap.timeline({
              scrollTrigger: {
                trigger: deck,
                start: "top 95%",
                end: "top 35%",
                scrub: true,
              },
            });

            if (rule) {
              deckTl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
            }

            deckTl.fromTo(
              deck,
              { xPercent: dir, opacity: 0.15 },
              { xPercent: 0, opacity: 1, ease: "none" },
              0
            );

            if (num) {
              deckTl.fromTo(
                num,
                { yPercent: 80 },
                { yPercent: 0, ease: "none" },
                0
              );
            }
          });

          // 5-Column Archival Paper Shutters Rising at the Bottom of Act III to Transition into Act IV!
          const validAct3Shutters = act3ShuttersRef.current.filter(Boolean);
          if (validAct3Shutters.length > 0) {
            gsap.fromTo(
              validAct3Shutters,
              { scaleY: 0 },
              {
                scaleY: 1,
                stagger: 0.05,
                ease: "none",
                scrollTrigger: {
                  trigger: act3Ref.current,
                  start: "bottom 45%",
                  end: "bottom top",
                  scrub: true,
                },
              }
            );
          }
        }
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="cung-duong"
      className="relative w-full scene-b bg-bone-100 text-ink-950 select-none overflow-hidden"
    >
      {/* ================= ACT II: ARCHITECTURAL BLUEPRINT PAPER & SEAMLESS POSTER 2 MURAL ================= */}
      {/* CRITICAL: ZERO `will-change-transform` or `z-index` on the wrapper holding the `multiply` image so browser compositing blends 100.0% into `bg-bone-100`! */}
      <div
        ref={act2Ref}
        className="relative w-full bg-bone-100 pt-20 sm:pt-28 pb-36 sm:pb-48 px-8 sm:px-14 lg:px-24 overflow-hidden"
      >
        {/* Architectural Blueprint Grid & Constructivist Compass Background (Replaces Bland Solid Color!) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none grid grid-cols-4 lg:grid-cols-12 px-8 sm:px-14 lg:px-24"
        >
          <div className="border-l border-ink-950/[0.07] h-full" />
          <div className="hidden lg:block lg:col-start-4 border-l border-ink-950/[0.07] h-full" />
          <div className="hidden lg:block lg:col-start-7 border-l border-ink-950/[0.07] h-full" />
          <div className="hidden lg:block lg:col-start-10 border-l border-ink-950/[0.07] h-full" />
          <div className="col-start-4 lg:col-start-12 border-r border-ink-950/[0.07] h-full" />
        </div>

        {/* Rotating SVG Constructivist Clinometer Dial */}
        <svg
          ref={compassSvgRef}
          aria-hidden="true"
          viewBox="0 0 400 400"
          className="hidden lg:block absolute -right-24 top-16 w-[380px] h-[380px] text-ink-950/[0.08] pointer-events-none will-change-transform"
        >
          <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1.5" />
          <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        <div className="max-w-[1600px] mx-auto bg-bone-100">
          {/* Top Constructivist Telemetry Bar */}
          <div className="flex items-center justify-between border-b-2 border-ink-950 pb-4 mb-10 text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-ink-950">
            <span>02 // GRAND TOURING MANIFESTO</span>
            <div className="flex items-center gap-3">
              <span className="text-sun-600">SPEED · MEETS · NATURE</span>
              <span className="w-2.5 h-2.5 rounded-full bg-sun-600 inline-block" />
            </div>
          </div>

          {/* Asymmetric Editorial Header (High above Poster 2 so it NEVER collides with the Sun!) */}
          <div className="mb-12 sm:mb-16 pointer-events-none px-2">
            <div ref={topKineticRef} className="will-change-transform">
              <h2
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.5rem, 7.2vw, 9.2rem)",
                  lineHeight: 1.14,
                  fontVariationSettings: "'wdth' 76",
                }}
                className="font-black uppercase tracking-tight text-ink-950 whitespace-nowrap pt-[0.14em]"
              >
                ĐƯỜNG DÀI LÀ ĐỂ
              </h2>
            </div>

            <div
              ref={bottomKineticRef}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-3 will-change-transform"
            >
              <p className="font-sans text-sm sm:text-base text-ink-950/85 max-w-md leading-relaxed font-medium order-2 md:order-1 border-l-4 border-sun-600 pl-4">
                Hành trình không đo bằng vận tốc tối đa, mà bằng sự tĩnh tại khi làm chủ cỗ máy cơ khí trên từng khúc cua giữa thiên nhiên hùng vĩ.
              </p>

              <span
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.5rem, 7.2vw, 9.2rem)",
                  lineHeight: 1.14,
                  fontVariationSettings: "'wdth' 112",
                }}
                className="font-black uppercase tracking-tight text-sun-600 whitespace-nowrap pt-[0.14em] order-1 md:order-2 md:ml-auto"
              >
                «ĐI CHẬM.»
              </span>
            </div>
          </div>

          {/* Deterministic 16:9 Container + Unisolated `bg-bone-100` Parent + `brightness(1.16) contrast(1.14)` = 100% Invisible Paper Edge & Zero Scroll-Lock! */}
          <div className="w-full max-w-[1520px] mx-auto aspect-[16/9] bg-bone-100 overflow-hidden">
            <img
              ref={posterImgRef}
              src="/assets/posters/poster-mountain-grand-tour.webp"
              alt="The Supercar — Speed Meets Nature"
              style={{
                mixBlendMode: "multiply",
                filter: "brightness(1.16) contrast(1.14)",
              }}
              className="w-full h-full block object-contain pointer-events-none"
              decoding="async"
            />
          </div>

          {/* Bottom 3-Column Constructivist Telemetry Strip */}
          <div className="mt-12 pt-8 border-t-2 border-ink-950 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-l-2 border-ink-950 pl-4">
              <span className="text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-sun-600 block">
                01 // CUNG ĐƯỜNG ĐÈO & BIỂN
              </span>
              <p className="font-display font-black uppercase text-lg sm:text-xl text-ink-950 mt-1">
                ĐÀ LẠT · HẢI VÂN · DUYÊN HẢI
              </p>
            </div>
            <div className="border-l-2 border-ink-950 pl-4">
              <span className="text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-sun-600 block">
                02 // ĐỘI HÌNH TUYỂN CHỌN
              </span>
              <p className="font-display font-black uppercase text-lg sm:text-xl text-ink-950 mt-1">
                PORSCHE · MERCEDES-AMG · LAMBORGHINI
              </p>
            </div>
            <div className="border-l-2 border-ink-950 pl-4">
              <span className="text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-sun-600 block">
                03 // TRẢI NGHIỆM CẦM LÁI
              </span>
              <p className="font-display font-black uppercase text-lg sm:text-xl text-ink-950 mt-1">
                TỰ DO HÀNH TRÌNH · KHÔNG GIỚI HẠN
              </p>
            </div>
          </div>
        </div>

        {/* 5-Column Rising Obsidian Shutters at Bottom of Act II (Wipes Paper into Act III Dark Ink Stage!) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[32svh] grid grid-cols-5 pointer-events-none"
        >
          {[0, 1, 2, 3, 4].map((colIdx) => (
            <div
              key={colIdx}
              ref={(el) => {
                act2ShuttersRef.current[colIdx] = el;
              }}
              style={{ transformOrigin: "bottom center", transform: "scaleY(0)" }}
              className="w-full h-full bg-ink-950 border-t-4 border-sun-600 will-change-transform"
            />
          ))}
        </div>
      </div>

      {/* ================= ACT III: FULL-BLEED KINETIC HORIZONTAL-SHIFT DECKS (ZERO SaaS Cards!) ================= */}
      <div
        ref={act3Ref}
        id="quy-trinh"
        className="relative w-full bg-ink-950 text-bone-100 pt-20 sm:pt-28 pb-36 sm:pb-48 px-8 sm:px-14 lg:px-24 overflow-hidden"
      >
        {/* Architectural Swiss Grid Lines + Rotating Constructivist Telemetry Wheel */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none grid grid-cols-4 lg:grid-cols-12 px-8 sm:px-14 lg:px-24"
        >
          <div className="border-l border-bone-100/[0.06] h-full" />
          <div className="hidden lg:block lg:col-start-4 border-l border-bone-100/[0.06] h-full" />
          <div className="hidden lg:block lg:col-start-9 border-l border-bone-100/[0.06] h-full" />
          <div className="col-start-4 lg:col-start-12 border-r border-bone-100/[0.06] h-full" />
        </div>

        <svg
          ref={act3WheelRef}
          aria-hidden="true"
          viewBox="0 0 500 500"
          className="hidden lg:block absolute -left-32 top-1/3 w-[520px] h-[520px] text-bone-100/[0.05] pointer-events-none will-change-transform"
        >
          <circle cx="250" cy="250" r="230" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="12 12" />
          <circle cx="250" cy="250" r="170" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="250" x2="480" y2="250" stroke="currentColor" strokeWidth="1.5" />
          <line x1="250" y1="20" x2="250" y2="480" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        {/* Tactile Lithograph Dust */}
        <div
          aria-hidden="true"
          style={{ mixBlendMode: "screen", opacity: 0.42 }}
          className="absolute inset-0 pointer-events-none"
        >
          <img
            src="/assets/landing/a7-dust-1920.webp"
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto">
          {/* Full-Width Monumental Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-16 sm:pb-24">
            <div className="lg:col-span-8 overflow-hidden pt-2">
              <span className="text-xs tracking-[0.28em] uppercase font-sans font-bold text-sun-400 block mb-3">
                03 // QUY TRÌNH BÀN GIAO TỨC THÌ
              </span>
              <h2
                ref={act3HeadingRef}
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(3.25rem, 8.2vw, 10rem)",
                  lineHeight: 1.12,
                  fontVariationSettings: "'wdth' 108",
                }}
                className="font-black uppercase tracking-tight text-bone-100 will-change-transform"
              >
                NHẸ NHƯ KHÔNG.
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="font-sans text-base sm:text-lg text-bone-100/85 leading-relaxed border-l-4 border-sun-600 pl-5">
                Ba bước chuẩn hóa loại bỏ hoàn toàn ma sát thủ tục hành chính. Nhận xe và hoàn trả bằng điện thoại.
              </p>
            </div>
          </div>

          {/* 3 Alternating Horizontal-Shift Architectural Decks (Zero Cards!) */}
          <div>
            {CHAPTER_3_STEPS.map((item, idx) => (
              <div
                key={item.step}
                ref={(el) => {
                  deckRefs.current[idx] = el;
                }}
                className="group relative w-full py-14 sm:py-20 transition-colors duration-300 hover:bg-bone-100 hover:text-ink-950 px-6 sm:px-10 -mx-6 sm:-mx-10 will-change-transform"
              >
                {/* 1:1 Scroll-Scrubbed 3px Vermilion Laser Rule */}
                <div
                  ref={(el) => {
                    ruleRefs.current[idx] = el;
                  }}
                  style={{ transformOrigin: idx % 2 === 0 ? "left center" : "right center" }}
                  className="absolute top-0 left-0 right-0 h-[3px] bg-sun-600 will-change-transform"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Col 1-3: Colossal Step Index + Code */}
                  <div className="lg:col-span-3 flex items-baseline gap-6">
                    <div className="overflow-hidden pt-2">
                      <span
                        ref={(el) => {
                          numRefs.current[idx] = el;
                        }}
                        style={{
                          fontFamily: "var(--font-archivo, sans-serif)",
                          fontSize: "clamp(4.5rem, 8vw, 9rem)",
                          lineHeight: 0.9,
                          fontVariationSettings: "'wdth' 64",
                        }}
                        className="font-black text-sun-400 group-hover:text-sun-600 inline-block transition-colors will-change-transform"
                      >
                        {item.step}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-bone-100/50 group-hover:text-ink-950/60 block">
                        {item.code}
                      </span>
                      <span className="text-xs tracking-[0.22em] uppercase font-sans font-bold text-sun-400 group-hover:text-sun-600 block">
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  {/* Col 4-8: Monumental Step Title & Metric Pill-Free Banner */}
                  <div className="lg:col-span-5 space-y-3">
                    <h3
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(2.25rem, 4.4vw, 4.8rem)",
                        lineHeight: 1.08,
                        fontVariationSettings: "'wdth' 102",
                      }}
                      className="font-black uppercase tracking-tight text-bone-100 group-hover:text-ink-950 transition-colors"
                    >
                      {item.title}
                    </h3>
                    <div className="inline-flex items-center gap-3 border-l-4 border-sun-600 pl-3">
                      <span className="text-xs tracking-[0.24em] uppercase font-sans font-bold text-bone-100/90 group-hover:text-ink-950">
                        {item.metric}
                      </span>
                    </div>
                  </div>

                  {/* Col 9-12: Crisp Editorial Copy */}
                  <div className="lg:col-span-4">
                    <p className="font-sans text-base sm:text-lg text-bone-100/85 group-hover:text-ink-950/85 leading-relaxed transition-colors">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="w-full h-[3px] bg-bone-100/30" />
          </div>
        </div>

        {/* 5-Column Rising Archival Paper Shutters at Bottom of Act III (Wipes Dark Ink into Act IV's Warm Paper!) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[32svh] grid grid-cols-5 pointer-events-none"
        >
          {[0, 1, 2, 3, 4].map((colIdx) => (
            <div
              key={colIdx}
              ref={(el) => {
                act3ShuttersRef.current[colIdx] = el;
              }}
              style={{ transformOrigin: "bottom center", transform: "scaleY(0)" }}
              className="w-full h-full bg-bone-100 border-t-4 border-lake-600 will-change-transform"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
