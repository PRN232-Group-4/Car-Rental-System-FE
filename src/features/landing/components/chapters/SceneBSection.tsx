"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const ACT2_WORDS_LINE1 = ["ĐƯỜNG", "DÀI", "LÀ", "ĐỂ"];
const ACT2_WORDS_LINE2 = ["ĐI", "CHẬM."];

const ACT3_WORDS = ["NHẸ", "NHƯ", "KHÔNG."];

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

  // Act II Refs
  const act2Ref = useRef<HTMLDivElement>(null);
  const act2WordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const act2RuleRef = useRef<HTMLDivElement>(null);
  const posterWrapRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);

  // Transition Curtain between Act II (Paper) and Act III (Dark Ink Monolith)
  const monolithCurtainRef = useRef<HTMLDivElement>(null);

  // Act III Refs
  const act3Ref = useRef<HTMLDivElement>(null);
  const act3WordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        act2WordRefs.current.forEach((w) => {
          if (w) gsap.set(w, { clearProps: "all", opacity: 1 });
        });
        act3WordRefs.current.forEach((w) => {
          if (w) gsap.set(w, { clearProps: "all", opacity: 1 });
        });
        ruleRefs.current.forEach((r) => {
          if (r) gsap.set(r, { scaleX: 1 });
        });
        rowRefs.current.forEach((row) => {
          if (row) gsap.set(row, { opacity: 1, y: 0 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Act II: Per-Word Masked Kinetic Typography Stagger (Zero Clipping, Diacritic-Safe!)
        const validAct2Words = act2WordRefs.current.filter(Boolean);
        if (validAct2Words.length > 0 && act2Ref.current) {
          gsap.fromTo(
            validAct2Words,
            { yPercent: 115, rotateZ: 4, opacity: 0 },
            {
              yPercent: 0,
              rotateZ: 0,
              opacity: 1,
              duration: 1.0,
              stagger: 0.07,
              ease: "expo.out",
              scrollTrigger: {
                trigger: act2Ref.current,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (act2RuleRef.current && act2Ref.current) {
          gsap.fromTo(
            act2RuleRef.current,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.1,
              ease: "expo.inOut",
              scrollTrigger: {
                trigger: act2Ref.current,
                start: "top 78%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Poster 2 Smooth Scale & Parallax Scrub
        if (posterImgRef.current && posterWrapRef.current) {
          gsap.fromTo(
            posterImgRef.current,
            { scale: 0.9, yPercent: 8 },
            {
              scale: 1.03,
              yPercent: -6,
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

        // 2. Section Transition: Expanding Dark Ink Monolith Stage from 92% width to 100% Full-Bleed
        if (monolithCurtainRef.current && act3Ref.current) {
          gsap.fromTo(
            monolithCurtainRef.current,
            { scaleX: 0.9, y: 40 },
            {
              scaleX: 1,
              y: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: act3Ref.current,
                start: "top 95%",
                end: "top 30%",
                scrub: 0.5,
              },
            }
          );
        }

        // 3. Act III: Kinetic Per-Word Title + Self-Drawing Rules + Index Number Reveal
        const validAct3Words = act3WordRefs.current.filter(Boolean);
        if (validAct3Words.length > 0 && act3Ref.current) {
          gsap.fromTo(
            validAct3Words,
            { yPercent: 115, rotateZ: 4, opacity: 0 },
            {
              yPercent: 0,
              rotateZ: 0,
              opacity: 1,
              duration: 1.0,
              stagger: 0.08,
              ease: "expo.out",
              scrollTrigger: {
                trigger: act3Ref.current,
                start: "top 78%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        rowRefs.current.forEach((row, idx) => {
          const rule = ruleRefs.current[idx];
          const num = numRefs.current[idx];
          if (!row) return;

          if (rule) {
            gsap.fromTo(
              rule,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 1.0,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: row,
                  start: "top 86%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }

          if (num) {
            gsap.fromTo(
              num,
              { yPercent: 100, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 0.85,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: row,
                  start: "top 84%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }

          gsap.fromTo(
            row,
            { y: 32, opacity: 0.2 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: row,
                start: "top 84%",
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

  let wordCounter = 0;

  return (
    <section
      ref={containerRef}
      id="cung-duong"
      className="relative w-full scene-b bg-bone-100 text-ink-950 select-none overflow-hidden"
    >
      {/* ================= ACT II: GRAND TOUR POSTER 2 ON WARM ARCHIVAL PAPER ================= */}
      <div
        ref={act2Ref}
        className="relative w-full pt-20 sm:pt-28 pb-20 sm:pb-28 px-6 sm:px-12 lg:px-20"
      >
        <div className="max-w-7xl mx-auto">
          {/* Kinetic Split-Word Vietnamese Headline (100% Unclipped, Generous Diacritic Padding!) */}
          <div className="flex flex-col gap-2 mb-10 sm:mb-14">
            {/* Line 1: ĐƯỜNG DÀI LÀ ĐỂ */}
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.5rem, 6.8vw, 7.8rem)",
                lineHeight: 1.15,
                fontVariationSettings: "'wdth' 82",
              }}
              className="font-black uppercase tracking-tight text-ink-950 flex flex-wrap items-baseline gap-x-[0.26em] gap-y-2"
            >
              {ACT2_WORDS_LINE1.map((word) => {
                const idx = wordCounter++;
                return (
                  <span
                    key={word}
                    className="inline-block overflow-hidden pt-[0.22em] pb-[0.08em] -mt-[0.18em]"
                  >
                    <span
                      ref={(el) => {
                        act2WordRefs.current[idx] = el;
                      }}
                      className="inline-block will-change-transform"
                    >
                      {word}
                    </span>
                  </span>
                );
              })}
            </h2>

            {/* Line 2: Subtitle on Left + "ĐI CHẬM." Anchored Safely on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pt-2">
              <div className="lg:col-span-6 space-y-4">
                <div
                  ref={act2RuleRef}
                  style={{ transformOrigin: "left center" }}
                  className="w-full max-w-xs h-[2px] bg-sun-600 will-change-transform"
                />
                <p className="font-sans text-sm sm:text-base text-ink-950/85 max-w-lg leading-relaxed font-medium">
                  Hành trình không đo bằng vận tốc tối đa, mà bằng sự tĩnh tại khi làm chủ cỗ máy cơ khí giữa thiên nhiên hùng vĩ.
                </p>
              </div>

              <div className="lg:col-span-6 flex lg:justify-end">
                <div
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(2.5rem, 6.8vw, 7.8rem)",
                    lineHeight: 1.15,
                    fontVariationSettings: "'wdth' 112",
                  }}
                  className="font-black uppercase tracking-tight text-sun-600 flex flex-wrap items-baseline gap-x-[0.24em]"
                >
                  {ACT2_WORDS_LINE2.map((word) => {
                    const idx = wordCounter++;
                    return (
                      <span
                        key={word}
                        className="inline-block overflow-hidden pt-[0.22em] pb-[0.08em] -mt-[0.18em]"
                      >
                        <span
                          ref={(el) => {
                            act2WordRefs.current[idx] = el;
                          }}
                          className="inline-block will-change-transform"
                        >
                          {word}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Seamless Poster 2 Masterpiece (`brightness(1.07) contrast(1.08)` + `multiply` makes the poster paper 100% invisible against `bg-bone-100`) */}
          <div
            ref={posterWrapRef}
            className="relative w-full max-w-[1480px] mx-auto overflow-hidden"
          >
            <img
              ref={posterImgRef}
              src="/assets/posters/poster-mountain-grand-tour.webp"
              alt="The Supercar — Speed Meets Nature"
              style={{
                mixBlendMode: "multiply",
                filter: "brightness(1.07) contrast(1.08)",
              }}
              className="w-full h-auto object-contain pointer-events-none will-change-transform"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      {/* ================= ACT III: EXPANDING DARK INK MONOLITH STAGE (Section Transition + 3 Kinetic Steps) ================= */}
      <div ref={act3Ref} id="quy-trinh" className="relative w-full py-8 sm:py-12">
        {/* Expanding Monolith Curtain (Scrubs from 90% width to 100% full-bleed on scroll) */}
        <div
          ref={monolithCurtainRef}
          style={{ transformOrigin: "center top" }}
          className="relative w-full bg-ink-950 text-bone-100 py-24 sm:py-32 px-6 sm:px-12 lg:px-20 overflow-hidden will-change-transform"
        >
          {/* Constructivist Vertical Sun Spine */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-0 bottom-0 right-[8%] w-3 bg-sun-600 pointer-events-none"
          />

          {/* Tactile Lithograph Dust */}
          <div
            aria-hidden="true"
            style={{ mixBlendMode: "screen", opacity: 0.4 }}
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

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Diacritic-Safe Kinetic Word-Stagger Heading */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-16">
              <div className="lg:col-span-8">
                <h2
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(2.75rem, 6.8vw, 7.6rem)",
                    lineHeight: 1.15,
                    fontVariationSettings: "'wdth' 106",
                  }}
                  className="font-black uppercase tracking-tight text-bone-100 flex flex-wrap items-baseline gap-x-[0.26em]"
                >
                  {ACT3_WORDS.map((word, wIdx) => (
                    <span
                      key={word}
                      className="inline-block overflow-hidden pt-[0.22em] pb-[0.08em] -mt-[0.18em]"
                    >
                      <span
                        ref={(el) => {
                          act3WordRefs.current[wIdx] = el;
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
                <p className="font-sans text-sm sm:text-base text-bone-100/80 leading-relaxed border-l-2 border-sun-600 pl-4">
                  Ba bước chuẩn hóa loại bỏ hoàn toàn ma sát thủ tục hành chính. Nhận xe và hoàn trả bằng điện thoại.
                </p>
              </div>
            </div>

            {/* 3 Strictly Aligned Constructivist Hairline Rows (Fixed Column Alignment!) */}
            <div className="divide-y-0">
              {CHAPTER_3_STEPS.map((item, idx) => (
                <div
                  key={item.step}
                  ref={(el) => {
                    rowRefs.current[idx] = el;
                  }}
                  className="group relative w-full py-12 sm:py-14 transition-colors duration-300 hover:bg-ink-800/80 px-4 sm:px-6 -mx-4 sm:-mx-6 will-change-transform"
                >
                  {/* Self-Drawing 2px Accent Rule */}
                  <div
                    ref={(el) => {
                      ruleRefs.current[idx] = el;
                    }}
                    style={{ transformOrigin: "left center" }}
                    className="absolute top-0 left-0 right-0 h-[2px] bg-bone-100/35 group-hover:bg-sun-600 transition-colors duration-300 will-change-transform"
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-baseline">
                    {/* Col 1-2: Giant Masked Index Number */}
                    <div className="lg:col-span-2 overflow-hidden pt-2">
                      <span
                        ref={(el) => {
                          numRefs.current[idx] = el;
                        }}
                        style={{
                          fontFamily: "var(--font-archivo, sans-serif)",
                          fontSize: "clamp(3.25rem, 5.5vw, 5.8rem)",
                          lineHeight: 1.0,
                          fontVariationSettings: "'wdth' 68",
                        }}
                        className="font-black text-sun-400 inline-block will-change-transform"
                      >
                        {item.step}
                      </span>
                    </div>

                    {/* Col 3-7: Strictly Aligned Monumental Step Title */}
                    <div className="lg:col-span-5">
                      <span className="text-[11px] tracking-[0.24em] uppercase font-sans font-bold text-bone-100/60 block mb-2">
                        {item.tag}
                      </span>
                      <h3
                        style={{
                          fontFamily: "var(--font-archivo, sans-serif)",
                          fontSize: "clamp(1.85rem, 3.4vw, 3.5rem)",
                          lineHeight: 1.14,
                          fontVariationSettings: "'wdth' 100",
                        }}
                        className="font-black uppercase tracking-tight text-bone-100 transition-transform duration-300 group-hover:translate-x-2"
                      >
                        {item.title}
                      </h3>
                    </div>

                    {/* Col 8-12: Description */}
                    <div className="lg:col-span-5">
                      <p className="font-sans text-sm sm:text-base text-bone-100/80 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="w-full h-[2px] bg-bone-100/35" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
