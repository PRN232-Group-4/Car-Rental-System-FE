"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const CHAPTER_3_STEPS = [
  {
    step: "01",
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

  // Act II Refs (Seamless Borderless Poster 2 Mural on Direct bg-bone-100 Parent)
  const act2Ref = useRef<HTMLDivElement>(null);
  const act2StageRef = useRef<HTMLDivElement>(null);
  const topKineticRef = useRef<HTMLDivElement>(null);
  const bottomKineticRef = useRef<HTMLDivElement>(null);
  const posterWrapRef = useRef<HTMLDivElement>(null);
  const specsStripRef = useRef<HTMLDivElement>(null);

  // Act III Refs (Bold 3-Pillar Staggered Constructivist Triptych)
  const act3Ref = useRef<HTMLDivElement>(null);
  const act3StageRef = useRef<HTMLDivElement>(null);
  const act3HeadingRef = useRef<HTMLHeadingElement>(null);
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            act2StageRef.current,
            topKineticRef.current,
            bottomKineticRef.current,
            posterWrapRef.current,
            specsStripRef.current,
            act3StageRef.current,
            act3HeadingRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
        ruleRefs.current.forEach((r) => {
          if (r) gsap.set(r, { scaleX: 1 });
        });
        pillarRefs.current.forEach((p) => {
          if (p) gsap.set(p, { clearProps: "all", opacity: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Visceral Section-to-Section Entry Transform (Hero -> Act II)
        if (act2Ref.current && act2StageRef.current) {
          gsap.fromTo(
            act2StageRef.current,
            { scale: 0.92, y: 70 },
            {
              scale: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: act2Ref.current,
                start: "top 98%",
                end: "top 22%",
                scrub: true,
              },
            }
          );

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
              { xPercent: 5 },
              { xPercent: -4, ease: "none" },
              0
            );
          }

          if (bottomKineticRef.current) {
            act2ScrollTl.fromTo(
              bottomKineticRef.current,
              { xPercent: -5 },
              { xPercent: 4, ease: "none" },
              0
            );
          }

          // Animate the wrapper (NOT the img directly) so mix-blend-mode: multiply stays 100% intact!
          if (posterWrapRef.current) {
            act2ScrollTl.fromTo(
              posterWrapRef.current,
              { scale: 0.94, y: 30 },
              { scale: 1.02, y: -20, ease: "none" },
              0
            );
          }

          if (specsStripRef.current) {
            act2ScrollTl.fromTo(
              specsStripRef.current,
              { y: 40, opacity: 0.3 },
              { y: 0, opacity: 1, ease: "none" },
              0.1
            );
          }
        }

        // 2. Visceral Section-to-Section Transition (Act II Paper -> Act III Dark Ink Triptych)
        if (act3Ref.current && act3StageRef.current) {
          gsap.fromTo(
            act3StageRef.current,
            { clipPath: "inset(10% 5% 10% 5%)", scale: 0.95 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: act3Ref.current,
                start: "top 96%",
                end: "top 20%",
                scrub: true,
              },
            }
          );
        }

        if (act3HeadingRef.current && act3Ref.current) {
          gsap.fromTo(
            act3HeadingRef.current,
            { xPercent: -10, opacity: 0.15 },
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

        // 3. Act III: Differential 3-Pillar Vertical Cascade Transform (`scrub: true`)
        pillarRefs.current.forEach((pillar, idx) => {
          const rule = ruleRefs.current[idx];
          const num = numRefs.current[idx];
          if (!pillar) return;

          const startY = (idx + 1) * 75;

          const pillarTl = gsap.timeline({
            scrollTrigger: {
              trigger: act3Ref.current,
              start: "top 80%",
              end: "center center",
              scrub: true,
            },
          });

          pillarTl.fromTo(
            pillar,
            { y: startY, opacity: 0.25 },
            { y: 0, opacity: 1, ease: "none" },
            0
          );

          if (rule) {
            pillarTl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
          }

          if (num) {
            pillarTl.fromTo(
              num,
              { yPercent: 70 },
              { yPercent: 0, ease: "none" },
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
      {/* ================= ACT II: SEAMLESS POSTER 2 MURAL ON WARM ARCHIVAL PAPER ================= */}
      {/* CRITICAL FIX: No z-index isolation on inner wrapper, and explicit bg-bone-100 on the direct parent of <img> so mix-blend-mode: multiply blends 100% into #E9E4D8 with ZERO white box! */}
      <div
        ref={act2Ref}
        className="relative w-full bg-bone-100 pt-20 sm:pt-28 pb-24 sm:pb-32 px-8 sm:px-14 lg:px-24 overflow-hidden"
      >
        <div
          ref={act2StageRef}
          style={{ transformOrigin: "center top" }}
          className="max-w-[1600px] mx-auto bg-bone-100 will-change-transform"
        >
          {/* Top Constructivist Telemetry Bar */}
          <div className="flex items-center justify-between border-b-2 border-ink-950 pb-4 mb-8 text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-ink-950">
            <span>02 // GRAND TOURING MANIFESTO</span>
            <div className="flex items-center gap-3">
              <span className="text-sun-600">SPEED · MEETS · NATURE</span>
              <span className="w-2.5 h-2.5 rounded-full bg-sun-600 inline-block" />
            </div>
          </div>

          {/* Counter-Sliding Monumental Headline (Separated cleanly above Poster 2 so it NEVER collides with the sun!) */}
          <div className="mb-10 sm:mb-14 pointer-events-none px-2">
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
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-2 will-change-transform"
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

          {/* Direct bg-bone-100 Parent + Unisolated <img style={{ mixBlendMode: 'multiply' }}> = 100% Seamless Paper Blend! */}
          <div
            ref={posterWrapRef}
            className="w-full max-w-[1520px] mx-auto bg-bone-100 will-change-transform"
          >
            <img
              src="/assets/posters/poster-mountain-grand-tour.webp"
              alt="The Supercar — Speed Meets Nature"
              style={{
                mixBlendMode: "multiply",
                filter: "brightness(1.06) contrast(1.08)",
              }}
              className="w-full h-auto block object-contain pointer-events-none"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Bottom 3-Column Constructivist Telemetry Strip */}
          <div
            ref={specsStripRef}
            className="mt-12 pt-8 border-t-2 border-ink-950 grid grid-cols-1 md:grid-cols-3 gap-8 will-change-transform"
          >
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
      </div>

      {/* ================= ACT III: BOLD 3-PILLAR STAGGERED CONSTRUCTIVIST TRIPTYCH ================= */}
      <div ref={act3Ref} id="quy-trinh" className="relative w-full bg-bone-100">
        <div
          ref={act3StageRef}
          className="relative w-full bg-ink-950 text-bone-100 py-24 sm:py-36 px-8 sm:px-14 lg:px-24 overflow-hidden will-change-transform"
        >
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-16 sm:pb-24 border-b border-bone-100/20">
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

            {/* 3 Staggered Constructivist Monolith Pillars (Cascades vertically into alignment on scroll!) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-12">
              {CHAPTER_3_STEPS.map((item, idx) => (
                <div
                  key={item.step}
                  ref={(el) => {
                    pillarRefs.current[idx] = el;
                  }}
                  className="group relative bg-ink-800/90 border border-bone-100/20 p-8 sm:p-10 flex flex-col justify-between transition-colors duration-300 hover:bg-bone-100 hover:text-ink-950 will-change-transform"
                >
                  {/* 1:1 Scroll-Scrubbed 4px Vermilion Top Laser Bar */}
                  <div
                    ref={(el) => {
                      ruleRefs.current[idx] = el;
                    }}
                    style={{ transformOrigin: "left center" }}
                    className="absolute top-0 left-0 right-0 h-[4px] bg-sun-600 will-change-transform"
                  />

                  <div>
                    {/* Top Index + Tag */}
                    <div className="flex items-baseline justify-between border-b border-bone-100/15 group-hover:border-ink-950/20 pb-6 mb-8">
                      <div className="overflow-hidden pt-1">
                        <span
                          ref={(el) => {
                            numRefs.current[idx] = el;
                          }}
                          style={{
                            fontFamily: "var(--font-archivo, sans-serif)",
                            fontSize: "clamp(4.25rem, 6vw, 6.5rem)",
                            lineHeight: 0.9,
                            fontVariationSettings: "'wdth' 66",
                          }}
                          className="font-black text-sun-400 group-hover:text-sun-600 inline-block transition-colors will-change-transform"
                        >
                          {item.step}
                        </span>
                      </div>

                      <span className="text-[11px] tracking-[0.24em] uppercase font-sans font-bold text-bone-100/60 group-hover:text-ink-950/70 transition-colors">
                        {item.tag}
                      </span>
                    </div>

                    {/* Monumental Step Title */}
                    <h3
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(2rem, 3vw, 3.25rem)",
                        lineHeight: 1.12,
                        fontVariationSettings: "'wdth' 100",
                      }}
                      className="font-black uppercase tracking-tight text-bone-100 group-hover:text-ink-950 mb-4 transition-colors"
                    >
                      {item.title}
                    </h3>

                    <p className="font-sans text-sm sm:text-base text-bone-100/80 group-hover:text-ink-950/85 leading-relaxed transition-colors">
                      {item.desc}
                    </p>
                  </div>

                  {/* Structured Technical Readout Footer inside Pillar */}
                  <div className="mt-10 pt-6 border-t border-bone-100/15 group-hover:border-ink-950/20 grid grid-cols-2 gap-4">
                    {item.specs.map((spec) => (
                      <div key={spec.label}>
                        <span className="text-[10px] tracking-[0.22em] uppercase font-sans font-semibold text-bone-100/50 group-hover:text-ink-950/60 block">
                          {spec.label}
                        </span>
                        <span className="font-display font-bold uppercase tracking-wider text-xs sm:text-sm text-sun-400 group-hover:text-sun-600 mt-1 block">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
