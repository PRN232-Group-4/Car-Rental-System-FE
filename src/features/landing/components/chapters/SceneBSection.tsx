"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const CHAPTER_3_STEPS = [
  {
    step: "01",
    tag: "ĐỊNH DANH SỐ HÓA",
    title: "XÁC MINH TRỰC TUYẾN",
    metric: "100% ONLINE",
    desc: "Đối chiếu tài khoản và hồ sơ lái xe trực tiếp trên nền tảng số. Loại bỏ hoàn toàn thủ tục giấy tờ bản cứng và thời gian chờ đợi tại quầy.",
  },
  {
    step: "02",
    tag: "BÀN GIAO CHUẨN XÁC",
    title: "NHẬN XE TẠI TRẠM",
    metric: "CHÌA KHÓA SỐ",
    desc: "Phương tiện sẵn sàng tại hệ thống trạm trung tâm sau quy trình kiểm định kỹ thuật đa điểm. Kích hoạt khóa xe trực tiếp qua ứng dụng.",
  },
  {
    step: "03",
    tag: "ĐỐI SOÁT TỰ ĐỘNG",
    title: "TRẢ XE VÀ HOÀN CỌC",
    metric: "CỔNG PAYOS",
    desc: "Nghiệm thu minh bạch bằng dữ liệu đối soát trực quan sau hành trình. Toàn bộ khoản đặt cọc được xử lý hoàn trả tự động theo cam kết.",
  },
];

export default function SceneBSection() {
  const containerRef = useRef<HTMLElement>(null);
  const act2Ref = useRef<HTMLDivElement>(null);
  const haiVanImgRef = useRef<HTMLImageElement>(null);
  const ch2HeadlineRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);

  const act3Ref = useRef<HTMLDivElement>(null);
  const act3CircleRef = useRef<HTMLDivElement>(null);
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
        // 1. Act II Full-Bleed Hai Van Parallax Choreography
        if (act2Ref.current) {
          const act2Tl = gsap.timeline({
            scrollTrigger: {
              trigger: act2Ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          });

          if (haiVanImgRef.current) {
            act2Tl.fromTo(
              haiVanImgRef.current,
              { scale: 1.14, yPercent: -10 },
              { scale: 1.0, yPercent: 12, ease: "none" },
              0
            );
          }

          if (ch2HeadlineRef.current) {
            act2Tl.fromTo(
              ch2HeadlineRef.current,
              { yPercent: 18 },
              { yPercent: -16, ease: "none" },
              0
            );
          }

          if (carRef.current) {
            act2Tl.fromTo(
              carRef.current,
              { xPercent: 14, scale: 0.9 },
              { xPercent: -8, scale: 1.06, ease: "none" },
              0
            );
          }

          if (mistRef.current) {
            act2Tl.fromTo(
              mistRef.current,
              { xPercent: 10, opacity: 0.35 },
              { xPercent: -14, opacity: 0.65, ease: "none" },
              0
            );
          }
        }

        // 2. Act III Constructivist Circle Parallax & Hairline Ledger Reveal
        if (act3Ref.current && act3CircleRef.current) {
          gsap.fromTo(
            act3CircleRef.current,
            { yPercent: 15, scale: 0.92 },
            {
              yPercent: -15,
              scale: 1.05,
              ease: "none",
              scrollTrigger: {
                trigger: act3Ref.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            }
          );
        }

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
                  start: "top 86%",
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
                start: "top 84%",
                end: "bottom 20%",
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
      className="relative w-full scene-b bg-ink-950 text-bone-100 select-none"
    >
      {/* ================= ACT II: FULL-BLEED HAI VAN WOODCUT STAGE ================= */}
      <div
        ref={act2Ref}
        className="relative w-full min-h-[100svh] flex flex-col justify-between overflow-hidden border-b border-bone-100/20"
      >
        {/* 1. Full-Viewport Hai Van Woodcut Artwork (Sun on Left, Dark Charcoal Sky on Top-Right) */}
        <picture className="absolute inset-0 w-full h-full block pointer-events-none" style={{ zIndex: 10 }}>
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
            className="w-full h-full object-cover object-center pointer-events-none will-change-transform"
            loading="lazy"
            decoding="async"
          />
        </picture>

        {/* 2. Drifting Mist & Lithograph Grain */}
        <div
          ref={mistRef}
          aria-hidden="true"
          style={{ zIndex: 15, mixBlendMode: "screen", opacity: 0.45 }}
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

        {/* 3. Top-Right Constructivist Statement (Positioned in the Dark Sky Zone on the Right, balancing the Orange Sun on the Left) */}
        <div
          style={{ zIndex: 30 }}
          className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 pt-16 sm:pt-24 flex justify-end"
        >
          <div
            ref={ch2HeadlineRef}
            className="w-full lg:w-[56%] bg-ink-950/90 border border-bone-100/25 p-6 sm:p-10 rounded-none will-change-transform"
          >
            {/* Poster 2 Signature Motif: SPEED / MEETS / NATURE + Dual Vertical Bar */}
            <div className="flex items-center justify-between border-b border-bone-100/20 pb-4 mb-6">
              <div className="text-[10px] sm:text-[11px] tracking-[0.26em] uppercase font-semibold text-bone-100/75">
                <span>ACT II // HAI VAN COASTAL PASS</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] tracking-[0.26em] uppercase font-semibold text-sun-400">
                  SPEED · MEETS · NATURE
                </span>
                <div className="flex flex-col gap-1" aria-hidden="true">
                  <span className="w-1.5 h-3.5 bg-sun-600 block" />
                  <span className="w-1.5 h-3.5 bg-bone-100/60 block" />
                </div>
              </div>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.25rem, 4.8vw, 5.2rem)",
                lineHeight: 1.0,
                fontVariationSettings: "'wdth' 92",
              }}
              className="font-black uppercase tracking-tight text-bone-100"
            >
              «ĐƯỜNG DÀI LÀ ĐỂ ĐI CHẬM.»
            </h2>

            <p className="font-sans text-sm sm:text-base text-bone-100/85 mt-4 leading-relaxed">
              Hành trình không đo bằng vận tốc tối đa, mà bằng sự tĩnh tại khi làm chủ cỗ máy cơ khí trên từng khúc cua giữa đèo cao và vịnh biển.
            </p>
          </div>
        </div>

        {/* 4. Bottom Constructivist Coastal Overlook Plinth + Cornering Car (Solidly Grounded, Never Floating on Water) */}
        <div style={{ zIndex: 30 }} className="relative w-full mt-auto pt-24">
          {/* Architectural Road Plinth */}
          <div className="relative w-full bg-ink-950 border-t-2 border-sun-600 px-4 sm:px-8 lg:px-14 py-8 sm:py-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase font-semibold text-lake-400">
                  <span>COASTAL HORIZON AXIS</span>
                  <span className="w-8 border-t border-lake-400/50" />
                  <span>16.2000° N</span>
                </div>
                <p className="font-display font-bold uppercase tracking-wider text-sm sm:text-base text-bone-100">
                  PORSCHE · MERCEDES-AMG · LAMBORGHINI
                </p>
                <p className="font-sans text-xs text-bone-100/65">
                  Đội xe hiệu năng cao bảo dưỡng chính hãng, sẵn sàng cho những hành trình xuyên cung đường biển.
                </p>
              </div>
            </div>
          </div>

          {/* Cornering Lithograph Car Anchored on the Overlook Plinth */}
          <div
            ref={carRef}
            style={{
              zIndex: 35,
              width: "clamp(300px, 44vw, 720px)",
            }}
            className="relative lg:absolute lg:right-[6%] lg:bottom-4 mx-auto -mt-20 lg:mt-0 pointer-events-none will-change-transform"
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
                alt="Siêu xe trên cung đường đèo"
                className="w-full h-auto object-contain pointer-events-none contrast-125 brightness-95 drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </div>

      {/* ================= ACT III: TEXTURED CONSTRUCTIVIST PROTOCOL STAGE ================= */}
      <div
        ref={act3Ref}
        id="quy-trinh"
        className="relative w-full bg-ink-800 py-24 sm:py-32 px-4 sm:px-8 lg:px-14 overflow-hidden border-b border-bone-100/20"
      >
        {/* 1. Rich Lithograph Woodcut Underlay & Paper Grain (Eliminates Bland Flat Black Background) */}
        <div
          aria-hidden="true"
          style={{ zIndex: 1, opacity: 0.16 }}
          className="absolute inset-0 pointer-events-none"
        >
          <img
            src="/assets/landing/scene-a-dalat-full-1920.webp"
            alt=""
            className="w-full h-full object-cover object-center grayscale contrast-150 pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div
          aria-hidden="true"
          style={{ zIndex: 2, mixBlendMode: "screen", opacity: 0.45 }}
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

        {/* 2. Constructivist Giant Background Circle & Vertical Sun Spine */}
        <div
          ref={act3CircleRef}
          aria-hidden="true"
          style={{ zIndex: 3 }}
          className="absolute -right-[12vw] top-[10%] w-[62vw] max-w-[760px] aspect-square rounded-full bg-ink-950/90 border border-bone-100/15 pointer-events-none will-change-transform"
        />
        <div
          aria-hidden="true"
          style={{ zIndex: 4 }}
          className="hidden lg:block absolute top-0 bottom-0 right-[18%] w-2 bg-sun-600/80 pointer-events-none"
        />

        {/* 3. Architectural 12-Column Grid Lines */}
        <div
          aria-hidden="true"
          style={{ zIndex: 4 }}
          className="absolute inset-0 pointer-events-none max-w-7xl mx-auto border-x border-bone-100/10"
        />

        {/* 4. Foreground Content */}
        <div style={{ zIndex: 10 }} className="relative max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-16">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase font-semibold text-sun-400 mb-3">
                <span className="inline-block w-2 h-2 rounded-full bg-sun-600" />
                <span>ACT III // THE PROTOCOL</span>
                <span className="w-10 border-t border-sun-400/50" />
                <span>SEAMLESS HANDOVER</span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.75rem, 6.5vw, 6.75rem)",
                  lineHeight: 0.96,
                  fontVariationSettings: "'wdth' 112",
                }}
                className="font-black uppercase tracking-tight text-bone-100"
              >
                NHẸ NHƯ KHÔNG.
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="font-sans text-sm sm:text-base text-bone-100/85 leading-relaxed border-l-2 border-sun-600 pl-4">
                Ba bước chuẩn hóa loại bỏ hoàn toàn ma sát thủ tục hành chính. Nhận xe và hoàn trả bằng điện thoại.
              </p>
            </div>
          </div>

          {/* 3 Monumental Asymmetric Hairline Plates */}
          <div className="space-y-6">
            {CHAPTER_3_STEPS.map((item, idx) => (
              <div
                key={item.step}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="relative w-full bg-ink-950/90 border border-bone-100/15 p-6 sm:p-10 rounded-none will-change-transform"
              >
                {/* Animated Top Accent Rule (scaleX 0 -> 1) */}
                <div
                  ref={(el) => {
                    ruleRefs.current[idx] = el;
                  }}
                  style={{ transformOrigin: "left center" }}
                  className="absolute top-0 left-0 right-0 h-[2px] bg-sun-600 will-change-transform"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Col 1-2: Giant Constructivist Step Number */}
                  <div className="lg:col-span-2 flex items-center gap-4">
                    <span
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(3.25rem, 5.5vw, 5.5rem)",
                        lineHeight: 0.9,
                        fontVariationSettings: "'wdth' 68",
                      }}
                      className="font-black text-sun-400"
                    >
                      {item.step}
                    </span>
                  </div>

                  {/* Col 3-7: Step Title & Tag */}
                  <div
                    className={
                      idx % 2 === 1
                        ? "lg:col-span-5 lg:col-start-4"
                        : "lg:col-span-5 lg:col-start-3"
                    }
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] tracking-[0.24em] uppercase font-semibold text-bone-100/60">
                        {item.tag}
                      </span>
                      <span className="w-6 border-t border-bone-100/25" />
                      <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-sun-400">
                        {item.metric}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(1.75rem, 3.2vw, 3.25rem)",
                        lineHeight: 1.05,
                        fontVariationSettings: "'wdth' 105",
                      }}
                      className="font-black uppercase tracking-tight text-bone-100"
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Col 8-12: Description */}
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
