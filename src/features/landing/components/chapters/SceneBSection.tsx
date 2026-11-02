"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const CHAPTER_3_STEPS = [
  {
    step: "01",
    tag: "ĐỊNH DANH SỐ HÓA",
    title: "XÁC MINH TRỰC TUYẾN",
    desc: "Đối chiếu tài khoản và giấy phép lái xe trực tiếp trên nền tảng số chỉ trong một lần duy nhất. Không giữ giấy tờ gốc, không thủ tục bản cứng tại quầy.",
  },
  {
    step: "02",
    tag: "BÀN GIAO CHUẨN XÁC",
    title: "NHẬN XE TẠI TRẠM",
    desc: "Phương tiện sẵn sàng tại hệ thống trạm trung tâm sau quy trình kiểm định kỹ thuật đa điểm. Mở khóa kỹ thuật số và khởi hành ngay theo lịch trình của bạn.",
  },
  {
    step: "03",
    tag: "ĐỐI SOÁT TỰ ĐỘNG",
    title: "TRẢ XE VÀ HOÀN CỌC",
    desc: "Nghiệm thu minh bạch bằng dữ liệu đối soát trực quan ngay khi kết thúc chuyến đi. Toàn bộ khoản đặt cọc được hệ thống hoàn trả tự động qua cổng thanh toán.",
  },
];

export default function SceneBSection() {
  const containerRef = useRef<HTMLElement>(null);

  // Act II Refs (Bold Constructivist Spread with Poster 2)
  const act2Ref = useRef<HTMLDivElement>(null);
  const topKineticRef = useRef<HTMLDivElement>(null);
  const bottomKineticRef = useRef<HTMLDivElement>(null);
  const posterMountRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const manifestoBoxRef = useRef<HTMLDivElement>(null);

  // Act III Refs (Full-Bleed Kinetic Step Monolith)
  const act3Ref = useRef<HTMLDivElement>(null);
  const act3StageRef = useRef<HTMLDivElement>(null);
  const act3HeadingRef = useRef<HTMLHeadingElement>(null);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stepTitleRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            act2Ref.current,
            topKineticRef.current,
            bottomKineticRef.current,
            posterMountRef.current,
            posterImgRef.current,
            manifestoBoxRef.current,
            act3StageRef.current,
            act3HeadingRef.current,
          ],
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
        // 1. Instantaneous Section Entry Transition (Hero -> Act II) locked 1:1 with scroll (`scrub: true`)
        if (act2Ref.current) {
          gsap.fromTo(
            act2Ref.current,
            { clipPath: "inset(0% 6% 0% 6%)", y: 60 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: act2Ref.current,
                start: "top 98%",
                end: "top 20%",
                scrub: true,
              },
            }
          );

          // Opposing Horizontal Kinetic Typography Scrub across the viewport
          const act2ScrollTl = gsap.timeline({
            scrollTrigger: {
              trigger: act2Ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });

          if (topKineticRef.current) {
            act2ScrollTl.fromTo(
              topKineticRef.current,
              { xPercent: 14 },
              { xPercent: -10, ease: "none" },
              0
            );
          }

          if (bottomKineticRef.current) {
            act2ScrollTl.fromTo(
              bottomKineticRef.current,
              { xPercent: -14 },
              { xPercent: 8, ease: "none" },
              0
            );
          }

          if (posterImgRef.current) {
            act2ScrollTl.fromTo(
              posterImgRef.current,
              { scale: 1.12, yPercent: -6 },
              { scale: 1.0, yPercent: 6, ease: "none" },
              0
            );
          }

          if (manifestoBoxRef.current) {
            act2ScrollTl.fromTo(
              manifestoBoxRef.current,
              { yPercent: 28 },
              { yPercent: -18, ease: "none" },
              0
            );
          }
        }

        // 2. Instantaneous Section Transition (Act II Paper -> Act III Dark Ink Monolith) via 1:1 Clip-Path Iris
        if (act3Ref.current && act3StageRef.current) {
          gsap.fromTo(
            act3StageRef.current,
            { clipPath: "inset(8% 5% 8% 5%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: {
                trigger: act3Ref.current,
                start: "top 96%",
                end: "top 18%",
                scrub: true,
              },
            }
          );
        }

        if (act3HeadingRef.current && act3Ref.current) {
          gsap.fromTo(
            act3HeadingRef.current,
            { xPercent: -12, opacity: 0.15 },
            {
              xPercent: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: act3Ref.current,
                start: "top 90%",
                end: "top 30%",
                scrub: true,
              },
            }
          );
        }

        // 3. Act III: 1:1 Scroll-Scrubbed Step Rows (Zero Delay — Rules, Giant Numbers & Titles animate directly with scroll!)
        rowRefs.current.forEach((row, idx) => {
          const rule = ruleRefs.current[idx];
          const num = numRefs.current[idx];
          const title = stepTitleRefs.current[idx];
          if (!row) return;

          const rowTl = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              start: "top 95%",
              end: "top 35%",
              scrub: true,
            },
          });

          if (rule) {
            rowTl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
          }
          if (num) {
            rowTl.fromTo(
              num,
              { yPercent: 85, opacity: 0.1 },
              { yPercent: 0, opacity: 1, ease: "none" },
              0
            );
          }
          if (title) {
            rowTl.fromTo(
              title,
              { xPercent: idx % 2 === 0 ? 12 : -12, opacity: 0.15 },
              { xPercent: 0, opacity: 1, ease: "none" },
              0
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
      id="cung-duong"
      className="relative w-full scene-b bg-bone-100 text-ink-950 select-none overflow-hidden"
    >
      {/* ================= ACT II: BOLD ASYMMETRIC CONSTRUCTIVIST SPREAD (Poster 2 + Kinetic Counter-Sliding Type) ================= */}
      <div
        ref={act2Ref}
        className="relative w-full pt-20 sm:pt-28 pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 border-t-4 border-sun-600 will-change-transform"
      >
        <div className="max-w-[1640px] mx-auto">
          {/* Kinetic Counter-Sliding Monumental Headline (100% Unbroken Single Lines, Generous Vietnamese Diacritic Headroom!) */}
          <div className="relative z-20 mb-8 sm:mb-12 pointer-events-none">
            <div ref={topKineticRef} className="will-change-transform">
              <h2
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.75rem, 8.2vw, 10.2rem)",
                  lineHeight: 1.15,
                  fontVariationSettings: "'wdth' 76",
                }}
                className="font-black uppercase tracking-tight text-ink-950 whitespace-nowrap pt-[0.16em]"
              >
                ĐƯỜNG DÀI LÀ ĐỂ
              </h2>
            </div>

            <div
              ref={bottomKineticRef}
              className="flex items-center justify-end gap-6 -mt-[1vw] will-change-transform"
            >
              <span className="hidden md:block flex-1 max-w-xs h-[3px] bg-ink-950" />
              <span
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.75rem, 8.2vw, 10.2rem)",
                  lineHeight: 1.15,
                  fontVariationSettings: "'wdth' 114",
                }}
                className="font-black uppercase tracking-tight text-sun-600 whitespace-nowrap pt-[0.16em]"
              >
                «ĐI CHẬM.»
              </span>
            </div>
          </div>

          {/* Bold 12-Column Overlapping Poster Architecture (Eliminates the timid centered beige box!) */}
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Left Overlapping Constructivist Manifesto Monolith (Cols 1-4) */}
            <div
              ref={manifestoBoxRef}
              style={{ zIndex: 25 }}
              className="lg:col-span-4 bg-ink-950 text-bone-100 p-8 sm:p-10 border-l-4 border-sun-600 lg:-mr-16 lg:mb-10 will-change-transform"
            >
              <div className="flex items-center justify-between text-[11px] tracking-[0.24em] uppercase font-bold text-sun-400 pb-4 mb-5 border-b border-bone-100/20">
                <span>GRAND TOURING</span>
                <span>SPEED MEETS NATURE</span>
              </div>
              <p className="font-sans text-base sm:text-lg text-bone-100/90 leading-relaxed">
                Hành trình không đo bằng vận tốc tối đa, mà bằng sự tĩnh tại khi làm chủ cỗ máy cơ khí trên từng khúc cua giữa thiên nhiên hùng vĩ.
              </p>
              <div className="mt-6 pt-4 border-t border-bone-100/15 flex items-center justify-between text-[11px] tracking-[0.22em] uppercase font-bold text-bone-100/70">
                <span>POWER / PRECISION / FREEDOM</span>
                <span className="w-3 h-3 rounded-full bg-sun-600 inline-block" />
              </div>
            </div>

            {/* Right Oversized Architectural Gallery Mount for Poster 2 (Cols 5-12) */}
            <div
              ref={posterMountRef}
              style={{ zIndex: 15 }}
              className="lg:col-span-8 bg-ink-950 p-2 sm:p-4 border-2 border-ink-950 overflow-hidden"
            >
              <div className="relative w-full overflow-hidden bg-bone-100">
                <img
                  ref={posterImgRef}
                  src="/assets/posters/poster-mountain-grand-tour.webp"
                  alt="The Supercar — Speed Meets Nature"
                  className="w-full h-auto object-cover pointer-events-none will-change-transform"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ACT III: FULL-BLEED KINETIC MONOLITH LEDGER ================= */}
      <div ref={act3Ref} id="quy-trinh" className="relative w-full">
        <div
          ref={act3StageRef}
          className="relative w-full bg-ink-950 text-bone-100 py-24 sm:py-36 px-6 sm:px-12 lg:px-20 overflow-hidden will-change-transform"
        >
          {/* Constructivist Vertical Vermilion Spine */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-0 bottom-0 right-[6%] w-3 bg-sun-600 pointer-events-none"
          />

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

          <div className="relative z-10 max-w-[1640px] mx-auto">
            {/* Full-Width Monumental Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-16 sm:pb-20">
              <div className="lg:col-span-8 overflow-hidden pt-4">
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

            {/* 3 Colossal Full-Width Kinetic Rows */}
            <div>
              {CHAPTER_3_STEPS.map((item, idx) => (
                <div
                  key={item.step}
                  ref={(el) => {
                    rowRefs.current[idx] = el;
                  }}
                  className="group relative w-full py-12 sm:py-16 transition-colors duration-300 hover:bg-ink-800 px-4 sm:px-8 -mx-4 sm:-mx-8"
                >
                  {/* 1:1 Scroll-Scrubbed 2px Accent Rule */}
                  <div
                    ref={(el) => {
                      ruleRefs.current[idx] = el;
                    }}
                    style={{ transformOrigin: "left center" }}
                    className="absolute top-0 left-0 right-0 h-[2px] bg-sun-600 will-change-transform"
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-baseline">
                    {/* Col 1-2: Colossal Constructivist Step Number */}
                    <div className="lg:col-span-2 overflow-hidden pt-2">
                      <span
                        ref={(el) => {
                          numRefs.current[idx] = el;
                        }}
                        style={{
                          fontFamily: "var(--font-archivo, sans-serif)",
                          fontSize: "clamp(4rem, 7.5vw, 8.5rem)",
                          lineHeight: 0.95,
                          fontVariationSettings: "'wdth' 66",
                        }}
                        className="font-black text-sun-400 inline-block will-change-transform"
                      >
                        {item.step}
                      </span>
                    </div>

                    {/* Col 3-8: Monumental Step Title (Scrubs horizontally into alignment on scroll) */}
                    <div className="lg:col-span-6">
                      <span className="text-xs tracking-[0.26em] uppercase font-sans font-bold text-bone-100/60 block mb-2">
                        {item.tag}
                      </span>
                      <h3
                        ref={(el) => {
                          stepTitleRefs.current[idx] = el;
                        }}
                        style={{
                          fontFamily: "var(--font-archivo, sans-serif)",
                          fontSize: "clamp(2.25rem, 4.6vw, 5.2rem)",
                          lineHeight: 1.12,
                          fontVariationSettings: "'wdth' 102",
                        }}
                        className="font-black uppercase tracking-tight text-bone-100 will-change-transform"
                      >
                        {item.title}
                      </h3>
                    </div>

                    {/* Col 9-12: Description */}
                    <div className="lg:col-span-4">
                      <p className="font-sans text-base sm:text-lg text-bone-100/85 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="w-full h-[2px] bg-bone-100/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
