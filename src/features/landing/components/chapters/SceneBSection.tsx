"use client";

import { useRef } from "react";
import { ScanFace, KeyRound, ShieldCheck } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const CHAPTER_3_CARDS = [
  {
    step: "01",
    roman: "I",
    code: "PLATE // VERIFY-01",
    tag: "ĐỊNH DANH SỐ HÓA",
    title: "XÁC MINH TRỰC TUYẾN",
    metric: "100% KHÔNG GIẤY TỜ GỐC",
    icon: ScanFace,
    specs: [
      { label: "PHƯƠNG THỨC", value: "CCCD CHIP & GPLX" },
      { label: "THỦ TỤC", value: "KHÔNG GIỮ BẢN CỨNG" },
    ],
    desc: "Đối chiếu tài khoản và giấy phép lái xe trực tiếp trên nền tảng số chỉ trong một lần duy nhất. Không giữ giấy tờ gốc tại quầy.",
  },
  {
    step: "02",
    roman: "II",
    code: "PLATE // UNLOCK-02",
    tag: "BÀN GIAO CHUẨN XÁC",
    title: "NHẬN XE TẠI TRẠM",
    metric: "CHÌA KHÓA KỸ THUẬT SỐ",
    icon: KeyRound,
    specs: [
      { label: "TRẠNG THÁI", value: "KIỂM ĐỊNH ĐA ĐIỂM" },
      { label: "KÍCH HOẠT", value: "MỞ KHÓA TRỰC TIẾP" },
    ],
    desc: "Phương tiện sẵn sàng tại hệ thống trạm trung tâm sau quy trình kiểm định kỹ thuật thực tế. Mở khóa xe qua ứng dụng và khởi hành.",
  },
  {
    step: "03",
    roman: "III",
    code: "PLATE // SETTLE-03",
    tag: "ĐỐI SOÁT TỰ ĐỘNG",
    title: "TRẢ XE VÀ HOÀN CỌC",
    metric: "HOÀN CỌC QUA PAYOS",
    icon: ShieldCheck,
    specs: [
      { label: "NGHIỆM THU", value: "BIÊN BẢN SỐ HÓA" },
      { label: "THANH TOÁN", value: "HOÀN CỌC TỰ ĐỘNG" },
    ],
    desc: "Nghiệm thu minh bạch bằng dữ liệu đối soát trực quan ngay khi kết thúc hành trình. Toàn bộ khoản đặt cọc được xử lý hoàn trả tự động.",
  },
];

export default function SceneBSection() {
  const containerRef = useRef<HTMLElement>(null);

  // Exclusive 5-Column Venetian Step Transition (ONLY between Section 1 & Section 2!)
  const stepShuttersWrapRef = useRef<HTMLDivElement>(null);
  const stepShuttersRef = useRef<(HTMLDivElement | null)[]>([]);

  // Act II Refs (Asymmetric 4+8 Editorial Spread with Seamless Poster 2)
  const act2Ref = useRef<HTMLDivElement>(null);
  const topKineticRef = useRef<HTMLDivElement>(null);
  const bottomKineticRef = useRef<HTMLDivElement>(null);
  const leftPillarRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const compassSvgRef = useRef<SVGSVGElement>(null);

  // Act III Refs (3D Fanning & Flipping Tarot Card Stage!)
  const act3TrackRef = useRef<HTMLDivElement>(null);
  const act3StageRef = useRef<HTMLDivElement>(null);
  const act3HeadingRef = useRef<HTMLDivElement>(null);
  const cardSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardInnerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        stepShuttersRef.current.forEach((s) => {
          if (s) gsap.set(s, { scaleY: 1 });
        });
        gsap.set(
          [
            topKineticRef.current,
            bottomKineticRef.current,
            leftPillarRef.current,
            posterImgRef.current,
            act3StageRef.current,
            act3HeadingRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
        cardSlotRefs.current.forEach((slot) => {
          if (slot) gsap.set(slot, { clearProps: "all", opacity: 1 });
        });
        cardInnerRefs.current.forEach((inner) => {
          if (inner) gsap.set(inner, { rotateY: 0 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. EXCLUSIVE Section 1 -> Section 2 Transition: 5-Column Venetian Steps
        // Starts IMMEDIATELY as Section 2's top edge enters the bottom of viewport (`top 100%`) and finishes 100% by `top 55%` (Zero delay when reaching Section 2!)
        const validShutters = stepShuttersRef.current.filter(Boolean);
        if (validShutters.length > 0 && act2Ref.current) {
          gsap.fromTo(
            validShutters,
            { scaleY: 0 },
            {
              scaleY: 1,
              stagger: 0.05,
              ease: "none",
              scrollTrigger: {
                trigger: act2Ref.current,
                start: "top 100%",
                end: "top 55%",
                scrub: true,
              },
            }
          );
        }

        // 2. Act II: Asymmetric Editorial Spread Choreography
        if (act2Ref.current) {
          const act2Tl = gsap.timeline({
            scrollTrigger: {
              trigger: act2Ref.current,
              start: "top 90%",
              end: "bottom top",
              scrub: true,
            },
          });

          if (topKineticRef.current) {
            act2Tl.fromTo(
              topKineticRef.current,
              { xPercent: 5 },
              { xPercent: -4, ease: "none" },
              0
            );
          }

          if (bottomKineticRef.current) {
            act2Tl.fromTo(
              bottomKineticRef.current,
              { xPercent: -5 },
              { xPercent: 4, ease: "none" },
              0
            );
          }

          if (leftPillarRef.current) {
            act2Tl.fromTo(
              leftPillarRef.current,
              { y: 40 },
              { y: -20, ease: "none" },
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

          if (compassSvgRef.current) {
            act2Tl.fromTo(
              compassSvgRef.current,
              { rotate: -90 },
              { rotate: 90, ease: "none" },
              0
            );
          }
        }

        // 3. UNIQUE Section 2 -> Section 3 Transition (Diagonal Guillotine Wipe) + 3-Card Curved Fan-Out & 3D Flip Choreography!
        if (act3TrackRef.current && act3StageRef.current) {
          // Diagonal Slash Transition into Section 3
          gsap.fromTo(
            act3StageRef.current,
            { clipPath: "polygon(0% 12%, 100% 0%, 100% 100%, 0% 100%)" },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              ease: "none",
              scrollTrigger: {
                trigger: act3TrackRef.current,
                start: "top 95%",
                end: "top 25%",
                scrub: true,
              },
            }
          );

          // Desktop (>1024px): Full 3-Stage Card Choreography (Stacked Center -> Curved Fan-Out -> Level Row & 180° 3D Flip)
          if (window.innerWidth >= 1024) {
            const c0 = cardSlotRefs.current[0];
            const c1 = cardSlotRefs.current[1];
            const c2 = cardSlotRefs.current[2];
            const in0 = cardInnerRefs.current[0];
            const in1 = cardInnerRefs.current[1];
            const in2 = cardInnerRefs.current[2];

            if (c0 && c1 && c2 && in0 && in1 && in2) {
              // Initial Stacked State at Center (All 3 cards stacked at the middle column, showing their ornate Card Backs `rotateY: 180`)
              gsap.set(c0, { xPercent: 105, y: 0, rotateZ: 0, zIndex: 20 });
              gsap.set(c1, { xPercent: 0, y: 0, rotateZ: 0, zIndex: 30 });
              gsap.set(c2, { xPercent: -105, y: 0, rotateZ: 0, zIndex: 10 });
              gsap.set([in0, in1, in2], { rotateY: 180 });

              const cardTl = gsap.timeline({
                scrollTrigger: {
                  trigger: act3TrackRef.current,
                  start: "top 65%",
                  end: "bottom 85%",
                  scrub: true,
                },
              });

              // PHASE 1 (0.0 -> 0.45): Fan Out from Center Card in a Downward Curved Arc ("tách ra từ lá ở giữa cong xuống như xòe bộ bài")
              cardTl
                .to(
                  c0,
                  {
                    xPercent: 0,
                    y: 48,
                    rotateZ: -10,
                    ease: "power2.out",
                    duration: 0.45,
                  },
                  0
                )
                .to(
                  c1,
                  {
                    xPercent: 0,
                    y: -16,
                    rotateZ: 0,
                    ease: "power2.out",
                    duration: 0.45,
                  },
                  0
                )
                .to(
                  c2,
                  {
                    xPercent: 0,
                    y: 48,
                    rotateZ: 10,
                    ease: "power2.out",
                    duration: 0.45,
                  },
                  0
                );

              // PHASE 2 (0.45 -> 0.72): Straighten into a Horizontal Row (`y: 0, rotateZ: 0`)
              cardTl
                .to(
                  [c0, c1, c2],
                  {
                    y: 0,
                    rotateZ: 0,
                    ease: "power2.inOut",
                    duration: 0.27,
                  },
                  0.45
                );

              // PHASE 3 (0.62 -> 1.0): 180° 3D Flip (`rotateY: 180 -> 0`) revealing the front information!
              cardTl.to(
                [in1, in0, in2],
                {
                  rotateY: 0,
                  stagger: 0.06,
                  ease: "power2.inOut",
                  duration: 0.35,
                },
                0.62
              );
            }
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
      className="relative w-full scene-b bg-bone-100 text-ink-950 select-none"
    >
      {/* EXCLUSIVE SECTION 1 -> SECTION 2 TRANSITION: 5-Column Staggered Venetian Steps Overlapping Hero's Bottom Seam */}
      <div
        ref={stepShuttersWrapRef}
        aria-hidden="true"
        style={{ zIndex: 35 }}
        className="relative -mt-[20svh] w-full h-[20svh] grid grid-cols-5 pointer-events-none"
      >
        {[0, 1, 2, 3, 4].map((colIdx) => (
          <div
            key={colIdx}
            ref={(el) => {
              stepShuttersRef.current[colIdx] = el;
            }}
            style={{ transformOrigin: "bottom center", transform: "scaleY(0)" }}
            className="w-full h-full bg-bone-100 border-t-4 border-sun-600 will-change-transform"
          />
        ))}
      </div>

      {/* ================= ACT II: ASYMMETRIC 12-COLUMN EDITORIAL SPREAD (4-Col Story Pillar + 8-Col Seamless Poster 2) ================= */}
      <div
        ref={act2Ref}
        className="relative w-full bg-bone-100 pt-12 sm:pt-16 pb-28 sm:pb-36 px-8 sm:px-14 lg:px-24 overflow-hidden"
      >
        {/* Tactile Inverted Paper Fiber Texture + Architectural Grid Lines */}
        <div
          aria-hidden="true"
          style={{ mixBlendMode: "multiply", opacity: 0.14 }}
          className="absolute inset-0 pointer-events-none"
        >
          <img
            src="/assets/landing/a7-dust-1920.webp"
            alt=""
            className="w-full h-full object-cover invert pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none grid grid-cols-4 lg:grid-cols-12 px-8 sm:px-14 lg:px-24"
        >
          <div className="border-l border-ink-950/[0.08] h-full" />
          <div className="hidden lg:block lg:col-start-5 border-l border-ink-950/[0.08] h-full" />
          <div className="hidden lg:block lg:col-start-9 border-l border-ink-950/[0.08] h-full" />
          <div className="col-start-4 lg:col-start-12 border-r border-ink-950/[0.08] h-full" />
        </div>

        {/* Rotating SVG Constructivist Clinometer Dial */}
        <svg
          ref={compassSvgRef}
          aria-hidden="true"
          viewBox="0 0 400 400"
          className="hidden lg:block absolute -right-20 top-10 w-[360px] h-[360px] text-ink-950/[0.08] pointer-events-none will-change-transform"
        >
          <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1.5" />
          <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        {/* CRITICAL: Direct bg-bone-100 without z-index isolation so Poster 2's multiply blend is 100% seamless! */}
        <div className="max-w-[1600px] mx-auto bg-bone-100">
          {/* Top Constructivist Telemetry Bar */}
          <div className="flex items-center justify-between border-b-2 border-ink-950 pb-4 mb-10 text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-ink-950">
            <span>02 // GRAND TOURING MANIFESTO</span>
            <div className="flex items-center gap-3">
              <span className="text-sun-600">SPEED · MEETS · NATURE</span>
              <span className="w-2.5 h-2.5 rounded-full bg-sun-600 inline-block" />
            </div>
          </div>

          {/* Counter-Sliding Monumental Headline */}
          <div className="mb-12 sm:mb-16 pointer-events-none px-2">
            <div ref={topKineticRef} className="will-change-transform">
              <h2
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.5rem, 7.2vw, 9.2rem)",
                  lineHeight: 1.12,
                  fontVariationSettings: "'wdth' 76",
                }}
                className="font-black uppercase tracking-tight text-ink-950 whitespace-nowrap pt-[0.12em]"
              >
                ĐƯỜNG DÀI LÀ ĐỂ
              </h2>
            </div>

            <div
              ref={bottomKineticRef}
              className="flex items-center justify-end gap-6 -mt-[0.8vw] will-change-transform"
            >
              <span className="hidden md:block flex-1 max-w-sm h-[3px] bg-ink-950" />
              <span
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.5rem, 7.2vw, 9.2rem)",
                  lineHeight: 1.12,
                  fontVariationSettings: "'wdth' 112",
                }}
                className="font-black uppercase tracking-tight text-sun-600 whitespace-nowrap pt-[0.12em]"
              >
                «ĐI CHẬM.»
              </span>
            </div>
          </div>

          {/* 12-Column Asymmetric Editorial Spread: Left 4 Cols Story Pillar + Right 8 Cols Seamless Poster 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-bone-100">
            {/* Left 4 Columns: Architectural Narrative & Route Specs */}
            <div
              ref={leftPillarRef}
              className="lg:col-span-4 space-y-8 border-t-4 border-ink-950 pt-6 will-change-transform"
            >
              <div className="flex items-baseline justify-between">
                <span
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(3.5rem, 5vw, 5.5rem)",
                    lineHeight: 0.9,
                    fontVariationSettings: "'wdth' 64",
                  }}
                  className="font-black text-sun-600"
                >
                  02
                </span>
                <span className="text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-ink-950/60">
                  ALPINE EDITION
                </span>
              </div>

              <p className="font-sans text-base sm:text-lg text-ink-950/90 leading-relaxed font-medium border-l-4 border-sun-600 pl-4">
                Hành trình không đo bằng vận tốc tối đa, mà bằng sự tĩnh tại khi làm chủ cỗ máy cơ khí trên từng khúc cua giữa thiên nhiên hùng vĩ.
              </p>

              <div className="divide-y divide-ink-950/20 border-y border-ink-950/20">
                <div className="py-4">
                  <span className="text-[10px] tracking-[0.24em] uppercase font-sans font-bold text-sun-600 block">
                    CUNG ĐƯỜNG BIỂU TƯỢNG
                  </span>
                  <span className="font-display font-black uppercase text-base sm:text-lg text-ink-950 mt-0.5 block">
                    ĐÀ LẠT · ĐÈO HẢI VÂN · DUYÊN HẢI
                  </span>
                </div>
                <div className="py-4">
                  <span className="text-[10px] tracking-[0.24em] uppercase font-sans font-bold text-sun-600 block">
                    ĐỘI HÌNH TUYỂN CHỌN
                  </span>
                  <span className="font-display font-black uppercase text-base sm:text-lg text-ink-950 mt-0.5 block">
                    PORSCHE · MERCEDES-AMG · LAMBORGHINI
                  </span>
                </div>
                <div className="py-4">
                  <span className="text-[10px] tracking-[0.24em] uppercase font-sans font-bold text-sun-600 block">
                    CHUẨN VẬN HÀNH
                  </span>
                  <span className="font-display font-black uppercase text-base sm:text-lg text-ink-950 mt-0.5 block">
                    CHÌA KHÓA SỐ · TỰ DO HÀNH TRÌNH
                  </span>
                </div>
              </div>
            </div>

            {/* Right 8 Columns: Seamless Poster 2 Masterpiece (Direct `bg-bone-100` parent + `brightness(1.16) contrast(1.14)` + `multiply` = 100% Invisible Paper Box!) */}
            <div className="lg:col-span-8 w-full aspect-[16/9] bg-bone-100 overflow-hidden">
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
          </div>
        </div>
      </div>

      {/* ================= ACT III: 3D CARD DECK FAN-OUT (CURVED ARC) & 180° FLIP STAGE ================= */}
      <div
        ref={act3TrackRef}
        id="quy-trinh"
        className="relative w-full lg:h-[215svh] bg-bone-100"
      >
        <div
          ref={act3StageRef}
          className="lg:sticky lg:top-0 w-full min-h-[100svh] bg-ink-950 text-bone-100 py-20 sm:py-24 px-6 sm:px-12 lg:px-20 flex flex-col justify-between overflow-hidden will-change-transform"
        >
          {/* Tactile Lithograph Dust & Constructivist Center Axis */}
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

          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 h-[1px] bg-bone-100/15 pointer-events-none"
          />

          {/* Stage Header */}
          <div
            ref={act3HeadingRef}
            className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-bone-100/20 pb-6"
          >
            <div>
              <span className="text-xs tracking-[0.28em] uppercase font-sans font-bold text-sun-400 block mb-2">
                03 // BỘ BA THẺ BÀI QUY TRÌNH SỐ HÓA
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.75rem, 6.5vw, 7.8rem)",
                  lineHeight: 1.08,
                  fontVariationSettings: "'wdth' 108",
                }}
                className="font-black uppercase tracking-tight text-bone-100"
              >
                NHẸ NHƯ KHÔNG.
              </h2>
            </div>

            <p className="font-sans text-sm sm:text-base text-bone-100/80 max-w-md leading-relaxed border-l-4 border-sun-600 pl-4">
              Cuộn để xòe bộ thẻ hành trình và lật mở 3 bước bàn giao chìa khóa số không thủ tục giấy tờ.
            </p>
          </div>

          {/* 3-Card Fanning & 3D Flipping Stage */}
          <div
            style={{ perspective: "1600px" }}
            className="relative z-20 w-full max-w-[1480px] mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-center"
          >
            {CHAPTER_3_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.step}
                  ref={(el) => {
                    cardSlotRefs.current[idx] = el;
                  }}
                  style={{ perspective: "1500px" }}
                  className="w-full h-[430px] sm:h-[460px] will-change-transform"
                >
                  {/* 3D Preserved Inner Flipper */}
                  <div
                    ref={(el) => {
                      cardInnerRefs.current[idx] = el;
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative w-full h-full will-change-transform"
                  >
                    {/* ================= CARD FRONT FACE (Revealed after 180° Flip: Warm Archival Paper Lithograph Card) ================= */}
                    <div
                      style={{ backfaceVisibility: "hidden" }}
                      className="absolute inset-0 w-full h-full bg-bone-100 text-ink-950 border-2 border-bone-100 p-7 sm:p-8 flex flex-col justify-between shadow-2xl"
                    >
                      {/* Top Accent Bar inside Card */}
                      <div className="flex items-center justify-between border-b-2 border-ink-950 pb-4">
                        <span
                          style={{
                            fontFamily: "var(--font-archivo, sans-serif)",
                            fontSize: "clamp(3.25rem, 4.5vw, 4.75rem)",
                            lineHeight: 0.88,
                            fontVariationSettings: "'wdth' 66",
                          }}
                          className="font-black text-sun-600"
                        >
                          {card.step}
                        </span>

                        <div className="text-right">
                          <span className="text-[10px] tracking-[0.24em] uppercase font-sans font-bold text-ink-950/60 block">
                            {card.code}
                          </span>
                          <span className="text-xs tracking-[0.2em] uppercase font-sans font-black text-ink-950 mt-0.5 block">
                            {card.tag}
                          </span>
                        </div>
                      </div>

                      {/* Middle Title & Description */}
                      <div className="my-auto py-4 space-y-3">
                        <div className="inline-flex items-center gap-2 bg-ink-950 text-bone-100 px-3 py-1 text-[10px] tracking-[0.22em] uppercase font-sans font-bold">
                          <Icon className="w-3.5 h-3.5 text-sun-400" />
                          <span>{card.metric}</span>
                        </div>

                        <h3
                          style={{
                            fontFamily: "var(--font-archivo, sans-serif)",
                            fontSize: "clamp(1.75rem, 2.5vw, 2.6rem)",
                            lineHeight: 1.08,
                            fontVariationSettings: "'wdth' 100",
                          }}
                          className="font-black uppercase tracking-tight text-ink-950"
                        >
                          {card.title}
                        </h3>

                        <p className="font-sans text-sm text-ink-950/85 leading-relaxed font-medium">
                          {card.desc}
                        </p>
                      </div>

                      {/* Bottom Spec Telemetry Stamp */}
                      <div className="pt-4 border-t-2 border-ink-950 grid grid-cols-2 gap-3">
                        {card.specs.map((sp) => (
                          <div key={sp.label}>
                            <span className="text-[9px] tracking-[0.22em] uppercase font-sans font-bold text-ink-950/55 block">
                              {sp.label}
                            </span>
                            <span className="font-display font-black uppercase text-xs text-sun-600 mt-0.5 block">
                              {sp.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ================= CARD BACK FACE (Visible when Stacked & Fanning Out: Ornate Constructivist Tarot Back) ================= */}
                    <div
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                      className="absolute inset-0 w-full h-full bg-ink-950 text-bone-100 border-2 border-sun-600 p-6 flex flex-col justify-between shadow-2xl"
                    >
                      {/* Inner Constructivist Geometric Frame */}
                      <div className="w-full h-full border border-bone-100/30 p-6 flex flex-col items-center justify-between relative overflow-hidden">
                        <div className="w-full flex items-center justify-between text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-sun-400">
                          <span>THONG DONG</span>
                          <span>PLATE {card.roman}</span>
                        </div>

                        {/* Ornate Center Sun-Disc & Crosshair Seal */}
                        <div className="relative w-36 h-36 rounded-full border-2 border-sun-600 flex items-center justify-center bg-ink-800">
                          <div className="w-24 h-24 rounded-full bg-sun-600 flex items-center justify-center">
                            <span
                              style={{
                                fontFamily: "var(--font-archivo, sans-serif)",
                                fontVariationSettings: "'wdth' 68",
                              }}
                              className="font-black text-4xl text-bone-100"
                            >
                              {card.roman}
                            </span>
                          </div>
                        </div>

                        <div className="w-full text-center space-y-1">
                          <span className="text-[10px] tracking-[0.28em] uppercase font-sans font-bold text-bone-100/70 block">
                            {card.tag}
                          </span>
                          <div className="flex items-center justify-center gap-1 pt-1">
                            <span className="w-3 h-1 bg-sun-600 inline-block" />
                            <span className="w-3 h-1 bg-sun-600 inline-block" />
                            <span className="w-3 h-1 bg-sun-600 inline-block" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Stage Progress Indicator */}
          <div className="relative z-10 w-full max-w-[1600px] mx-auto pt-4 border-t border-bone-100/15 flex items-center justify-between text-[10px] tracking-[0.26em] uppercase font-sans text-bone-100/60">
            <span>STACKED DECK → CURVED FAN-OUT → 3D FLIP REVEAL</span>
            <span className="text-sun-400">01 / 02 / 03</span>
          </div>
        </div>
      </div>
    </section>
  );
}
