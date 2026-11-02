"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const CHAPTER_3_STEPS = [
  {
    step: "01",
    watermark: "VERIFY",
    tag: "ĐỊNH DANH SỐ HÓA",
    title: "XÁC MINH TRỰC TUYẾN",
    specs: [
      { label: "PHƯƠNG THỨC", value: "CCCD CHIP & GPLX" },
      { label: "THỦ TỤC", value: "100% KHÔNG GIẤY TỜ GỐC" },
    ],
    desc: "Đối chiếu tài khoản và giấy phép lái xe trực tiếp trên nền tảng số chỉ trong một lần duy nhất. Không giữ giấy tờ bản cứng tại quầy.",
  },
  {
    step: "02",
    watermark: "UNLOCK",
    tag: "BÀN GIAO CHUẨN XÁC",
    title: "NHẬN XE TẠI TRẠM",
    specs: [
      { label: "TRẠNG THÁI", value: "KIỂM ĐỊNH ĐA ĐIỂM" },
      { label: "KÍCH HOẠT", value: "CHÌA KHÓA KỸ THUẬT SỐ" },
    ],
    desc: "Phương tiện sẵn sàng tại hệ thống trạm trung tâm sau quy trình kiểm định kỹ thuật thực tế. Mở khóa xe trực tiếp qua ứng dụng và khởi hành.",
  },
  {
    step: "03",
    watermark: "SETTLE",
    tag: "ĐỐI SOÁT TỰ ĐỘNG",
    title: "TRẢ XE VÀ HOÀN CỌC",
    specs: [
      { label: "NGHIỆM THU", value: "BIÊN BẢN SỐ HÓA" },
      { label: "THANH TOÁN", value: "HOÀN CỌC TỰ ĐỘNG PAYOS" },
    ],
    desc: "Nghiệm thu minh bạch bằng dữ liệu đối soát trực quan ngay khi kết thúc hành trình. Toàn bộ khoản đặt cọc được hệ thống xử lý hoàn trả tự động.",
  },
];

export default function SceneBSection() {
  const containerRef = useRef<HTMLElement>(null);

  // Act II Refs (Seamless Borderless Poster 2 Mural + Extended Constructivist Horizon)
  const act2Ref = useRef<HTMLDivElement>(null);
  const topKineticRef = useRef<HTMLDivElement>(null);
  const bottomKineticRef = useRef<HTMLDivElement>(null);
  const horizonAxisRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const bgWatermarkRef = useRef<HTMLDivElement>(null);

  // Act III Refs (Dark Ink Constructivist Switchboard + Live Scroll Progress Gauge)
  const act3Ref = useRef<HTMLDivElement>(null);
  const act3StageRef = useRef<HTMLDivElement>(null);
  const act3GaugeFillRef = useRef<HTMLDivElement>(null);
  const act3HeadingRef = useRef<HTMLHeadingElement>(null);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stepTitleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const watermarkRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            topKineticRef.current,
            bottomKineticRef.current,
            horizonAxisRef.current,
            posterImgRef.current,
            bgWatermarkRef.current,
            act3StageRef.current,
            act3GaugeFillRef.current,
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
        // 1. Act II: Safe-Bounded Counter-Sliding Kinetic Typography + Poster Scale (`scrub: true`)
        if (act2Ref.current) {
          const act2ScrollTl = gsap.timeline({
            scrollTrigger: {
              trigger: act2Ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });

          // Safe horizontal range (-3% to +3%) so "ĐƯỜNG DÀI LÀ ĐỂ" NEVER clips the left viewport edge!
          if (topKineticRef.current) {
            act2ScrollTl.fromTo(
              topKineticRef.current,
              { xPercent: 4 },
              { xPercent: -3, ease: "none" },
              0
            );
          }

          if (bottomKineticRef.current) {
            act2ScrollTl.fromTo(
              bottomKineticRef.current,
              { xPercent: -5 },
              { xPercent: 3, ease: "none" },
              0
            );
          }

          if (horizonAxisRef.current) {
            act2ScrollTl.fromTo(
              horizonAxisRef.current,
              { scaleX: 0 },
              { scaleX: 1, ease: "none" },
              0.05
            );
          }

          if (posterImgRef.current) {
            act2ScrollTl.fromTo(
              posterImgRef.current,
              { scale: 0.92, yPercent: 6 },
              { scale: 1.04, yPercent: -5, ease: "none" },
              0
            );
          }

          if (bgWatermarkRef.current) {
            act2ScrollTl.fromTo(
              bgWatermarkRef.current,
              { xPercent: 15 },
              { xPercent: -18, ease: "none" },
              0
            );
          }
        }

        // 2. Act II -> Act III Monolith Curtain Expansion + Live Vertical Scroll Gauge (`scrub: true`)
        if (act3Ref.current && act3StageRef.current) {
          gsap.fromTo(
            act3StageRef.current,
            { clipPath: "inset(6% 4% 6% 4%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: {
                trigger: act3Ref.current,
                start: "top 95%",
                end: "top 20%",
                scrub: true,
              },
            }
          );
        }

        if (act3GaugeFillRef.current && act3Ref.current) {
          gsap.fromTo(
            act3GaugeFillRef.current,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: act3Ref.current,
                start: "top 60%",
                end: "bottom 40%",
                scrub: true,
              },
            }
          );
        }

        if (act3HeadingRef.current && act3Ref.current) {
          gsap.fromTo(
            act3HeadingRef.current,
            { xPercent: -8, opacity: 0.15 },
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

        // 3. Act III: 1:1 Scroll-Scrubbed Step Rows + Background Kinetic Watermarks
        rowRefs.current.forEach((row, idx) => {
          const rule = ruleRefs.current[idx];
          const num = numRefs.current[idx];
          const title = stepTitleRefs.current[idx];
          const wm = watermarkRefs.current[idx];
          if (!row) return;

          const rowTl = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              start: "top 95%",
              end: "top 32%",
              scrub: true,
            },
          });

          if (rule) {
            rowTl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
          }
          if (num) {
            rowTl.fromTo(
              num,
              { yPercent: 80, opacity: 0.1 },
              { yPercent: 0, opacity: 1, ease: "none" },
              0
            );
          }
          if (title) {
            rowTl.fromTo(
              title,
              { xPercent: 8, opacity: 0.15 },
              { xPercent: 0, opacity: 1, ease: "none" },
              0
            );
          }
          if (wm) {
            rowTl.fromTo(
              wm,
              { xPercent: 20, opacity: 0 },
              { xPercent: -8, opacity: 0.06, ease: "none" },
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
      style={{ zIndex: 20 }}
      className="relative w-full scene-b bg-bone-100 text-ink-950 select-none overflow-hidden shadow-2xl"
    >
      {/* ================= ACT II: BORDERLESS CONSTRUCTIVIST MURAL (Slides Over Sticky Hero!) ================= */}
      <div
        ref={act2Ref}
        className="relative w-full pt-20 sm:pt-28 pb-24 sm:pb-36 px-8 sm:px-14 lg:px-24 border-t-4 border-sun-600 overflow-hidden"
      >
        {/* Giant Background Kinetic Watermark Typography */}
        <div
          ref={bgWatermarkRef}
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-archivo, sans-serif)",
            fontSize: "clamp(8rem, 22vw, 28rem)",
            lineHeight: 0.85,
            fontVariationSettings: "'wdth' 62",
          }}
          className="absolute top-[38%] left-0 font-black uppercase text-ink-950/[0.04] whitespace-nowrap pointer-events-none will-change-transform"
        >
          GRAND TOURING · SPEED MEETS NATURE
        </div>

        {/* Full-Viewport Constructivist Horizon Line (Extends Poster 2's Horizon across 100vw!) */}
        <div
          ref={horizonAxisRef}
          aria-hidden="true"
          style={{ transformOrigin: "left center" }}
          className="absolute left-0 right-0 top-[58%] h-[2px] bg-ink-950/25 pointer-events-none will-change-transform"
        />

        <div className="relative z-10 max-w-[1600px] mx-auto">
          {/* Top Constructivist Telemetry Strip */}
          <div className="flex items-center justify-between border-b-2 border-ink-950 pb-4 mb-8 text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-ink-950">
            <span>02 // GRAND TOURING MANIFESTO</span>
            <div className="flex items-center gap-3">
              <span className="text-sun-600">SPEED · MEETS · NATURE</span>
              <span className="w-2.5 h-2.5 rounded-full bg-sun-600 inline-block" />
            </div>
          </div>

          {/* Safe-Bounded Counter-Sliding Monumental Headline (Guaranteed ZERO Left/Right Clipping!) */}
          <div className="relative z-20 mb-6 sm:mb-10 pointer-events-none px-2 sm:px-4">
            <div ref={topKineticRef} className="will-change-transform">
              <h2
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.5rem, 7.2vw, 9.2rem)",
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
              className="flex flex-col md:flex-row md:items-center justify-between gap-6 -mt-[0.6vw] will-change-transform"
            >
              <p className="font-sans text-sm sm:text-base text-ink-950/85 max-w-md leading-relaxed font-medium order-2 md:order-1 border-l-4 border-sun-600 pl-4">
                Hành trình không đo bằng vận tốc tối đa, mà bằng sự tĩnh tại khi làm chủ cỗ máy cơ khí trên từng khúc cua giữa thiên nhiên hùng vĩ.
              </p>

              <span
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.5rem, 7.2vw, 9.2rem)",
                  lineHeight: 1.15,
                  fontVariationSettings: "'wdth' 112",
                }}
                className="font-black uppercase tracking-tight text-sun-600 whitespace-nowrap pt-[0.16em] order-1 md:order-2 md:ml-auto"
              >
                «ĐI CHẬM.»
              </span>
            </div>
          </div>

          {/* Seamless Borderless Poster 2 Mural (`brightness(1.18) contrast(1.15)` pushes paper to pure 255 white so `multiply` dissolves 100% of the box edge into `bg-bone-100`!) */}
          <div className="relative w-full max-w-[1560px] mx-auto -mt-4 sm:-mt-8">
            <img
              ref={posterImgRef}
              src="/assets/posters/poster-mountain-grand-tour.webp"
              alt="The Supercar — Speed Meets Nature"
              style={{
                mixBlendMode: "multiply",
                filter: "brightness(1.18) contrast(1.15)",
              }}
              className="w-full h-auto object-contain pointer-events-none will-change-transform"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      {/* ================= ACT III: DARK INK CONSTRUCTIVIST SWITCHBOARD (With Live Scroll Gauge & Technical Specs) ================= */}
      <div ref={act3Ref} id="quy-trinh" className="relative w-full">
        <div
          ref={act3StageRef}
          className="relative w-full bg-ink-950 text-bone-100 py-24 sm:py-36 px-6 sm:px-12 lg:px-20 overflow-hidden will-change-transform"
        >
          {/* Live Scroll-Linked Vertical Vermilion Gauge on Right Edge */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-0 bottom-0 right-[4%] w-[4px] bg-bone-100/15 pointer-events-none"
          >
            <div
              ref={act3GaugeFillRef}
              style={{ transformOrigin: "top center" }}
              className="w-full h-full bg-sun-600 will-change-transform"
            />
          </div>

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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-16 sm:pb-20">
              <div className="lg:col-span-8 overflow-hidden pt-4">
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

            {/* 3 High-Density Constructivist Switchboard Rows (Eliminates Empty Middle Space!) */}
            <div>
              {CHAPTER_3_STEPS.map((item, idx) => (
                <div
                  key={item.step}
                  ref={(el) => {
                    rowRefs.current[idx] = el;
                  }}
                  className="group relative w-full py-12 sm:py-16 transition-colors duration-300 hover:bg-ink-800/90 px-4 sm:px-8 -mx-4 sm:-mx-8 overflow-hidden"
                >
                  {/* 1:1 Scroll-Scrubbed 2px Accent Rule */}
                  <div
                    ref={(el) => {
                      ruleRefs.current[idx] = el;
                    }}
                    style={{ transformOrigin: "left center" }}
                    className="absolute top-0 left-0 right-0 h-[2px] bg-sun-600 will-change-transform"
                  />

                  {/* Giant Kinetic Background Watermark */}
                  <div
                    ref={(el) => {
                      watermarkRefs.current[idx] = el;
                    }}
                    aria-hidden="true"
                    style={{
                      fontFamily: "var(--font-archivo, sans-serif)",
                      fontSize: "clamp(6rem, 14vw, 16rem)",
                      lineHeight: 0.85,
                      fontVariationSettings: "'wdth' 62",
                    }}
                    className="absolute right-8 bottom-0 font-black uppercase text-bone-100 opacity-0 pointer-events-none will-change-transform"
                  >
                    {item.watermark}
                  </div>

                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Col 1-2: Colossal Constructivist Step Number */}
                    <div className="lg:col-span-2 overflow-hidden pt-2">
                      <span
                        ref={(el) => {
                          numRefs.current[idx] = el;
                        }}
                        style={{
                          fontFamily: "var(--font-archivo, sans-serif)",
                          fontSize: "clamp(4.25rem, 7.5vw, 8.5rem)",
                          lineHeight: 0.95,
                          fontVariationSettings: "'wdth' 66",
                        }}
                        className="font-black text-sun-400 inline-block will-change-transform"
                      >
                        {item.step}
                      </span>
                    </div>

                    {/* Col 3-6: Monumental Step Title */}
                    <div className="lg:col-span-4">
                      <span className="text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-bone-100/60 block mb-2">
                        {item.tag}
                      </span>
                      <h3
                        ref={(el) => {
                          stepTitleRefs.current[idx] = el;
                        }}
                        style={{
                          fontFamily: "var(--font-archivo, sans-serif)",
                          fontSize: "clamp(2rem, 3.8vw, 4.2rem)",
                          lineHeight: 1.12,
                          fontVariationSettings: "'wdth' 100",
                        }}
                        className="font-black uppercase tracking-tight text-bone-100 will-change-transform"
                      >
                        {item.title}
                      </h3>
                    </div>

                    {/* Col 7-9: Architectural Telemetry Spec Readout (Fills the middle gap with structured authority!) */}
                    <div className="lg:col-span-3 border-l border-bone-100/20 pl-6 space-y-4">
                      {item.specs.map((spec) => (
                        <div key={spec.label}>
                          <span className="text-[10px] tracking-[0.24em] uppercase font-sans font-semibold text-bone-100/50 block">
                            {spec.label}
                          </span>
                          <span className="font-display font-bold uppercase tracking-wider text-sm sm:text-base text-sun-400 mt-0.5 block">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Col 10-12: Description */}
                    <div className="lg:col-span-3">
                      <p className="font-sans text-sm sm:text-base text-bone-100/85 leading-relaxed">
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
