
import { useRef } from "react";
import { ScanFace, KeyRound, ShieldCheck } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const ACT2_WORDS_TOP = ["ĐƯỜNG", "DÀI", "LÀ", "ĐỂ"];
const ACT3_TITLE_CHARS = ["N", "H", "Ẹ", "\u00A0", "N", "H", "Ư", "\u00A0", "K", "H", "Ô", "N", "G", "."];

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
    desc: "Nghiệm thu minh bạch bằng dữ liệu đối soát trực quan ngay khi kết thúc hành trình. Toàn bộ khoản đặt cọc được hệ thống xử lý hoàn trả tự động.",
  },
];

export default function SceneBSection() {
  const containerRef = useRef<HTMLElement>(null);

  // Act II Refs (Pulled-Up Paper Stage + Variable-Font Width Wave Typography)
  const act2Ref = useRef<HTMLDivElement>(null);
  const act2ContentRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const act2WordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bottomKineticRef = useRef<HTMLSpanElement>(null);
  const leftPillarRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const compassSvgRef = useRef<SVGSVGElement>(null);

  // Unique Section 2 -> Section 3 Transition: Center-Out Horizontal Split Iris Gate!
  const irisGateWrapRef = useRef<HTMLDivElement>(null);
  const irisCoreRef = useRef<HTMLDivElement>(null);
  const irisLaserRef = useRef<HTMLDivElement>(null);

  // Act III Refs (Odometer Cylinder Character Roll + 3D Fanning & Flipping Tarot Card Deck)
  const act3TrackRef = useRef<HTMLDivElement>(null);
  const act3AstrolabeRef = useRef<SVGSVGElement>(null);
  const act3CharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cardSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardInnerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        act2WordRefs.current.forEach((w) => {
          if (w) gsap.set(w, { clearProps: "all", opacity: 1 });
        });
        act3CharRefs.current.forEach((c) => {
          if (c) gsap.set(c, { clearProps: "all", opacity: 1 });
        });
        gsap.set(
          [
            act2ContentRef.current,
            marqueeTrackRef.current,
            bottomKineticRef.current,
            leftPillarRef.current,
            posterImgRef.current,
            compassSvgRef.current,
            irisCoreRef.current,
            act3AstrolabeRef.current,
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
        // 1. UNIQUE TYPOGRAPHY MOTION #2 (Act II): Variable-Font Width Elastic Wave (`fontVariationSettings: 'wdth' 58 -> 118`)
        // Zero overflow clipping so Vietnamese letters are NEVER cut in half like in `image_daf141.jpg`!
        const validAct2Words = act2WordRefs.current.filter(Boolean);
        if (validAct2Words.length > 0 && act2Ref.current) {
          gsap.fromTo(
            validAct2Words,
            {
              fontVariationSettings: "'wdth' 58",
              y: 36,
              opacity: 0.15,
            },
            {
              fontVariationSettings: "'wdth' 108",
              y: 0,
              opacity: 1,
              stagger: 0.08,
              ease: "none",
              scrollTrigger: {
                trigger: act2Ref.current,
                start: "top 92%",
                end: "top 35%",
                scrub: true,
              },
            }
          );
        }

        if (bottomKineticRef.current && act2Ref.current) {
          gsap.fromTo(
            bottomKineticRef.current,
            {
              fontVariationSettings: "'wdth' 62",
              xPercent: -12,
            },
            {
              fontVariationSettings: "'wdth' 122",
              xPercent: 0,
              ease: "none",
              scrollTrigger: {
                trigger: act2Ref.current,
                start: "top 85%",
                end: "top 25%",
                scrub: true,
              },
            }
          );
        }

        if (act2Ref.current) {
          const act2Tl = gsap.timeline({
            scrollTrigger: {
              trigger: act2Ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });

          if (marqueeTrackRef.current) {
            act2Tl.fromTo(
              marqueeTrackRef.current,
              { xPercent: 0 },
              { xPercent: -22, ease: "none" },
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
              { scale: 0.93 },
              { scale: 1.03, ease: "none" },
              0
            );
          }

          if (compassSvgRef.current) {
            act2Tl.fromTo(
              compassSvgRef.current,
              { rotate: -120 },
              { rotate: 120, ease: "none" },
              0
            );
          }
        }

        // 2. UNIQUE SECTION 2 -> SECTION 3 TRANSITION: Center-Out Horizontal Split Iris Gate!
        // A glowing Vermilion laser line cracks across the center of the screen and expands vertically (`scaleY: 0 -> 1`) to open Section 3's dark stage!
        if (irisGateWrapRef.current && irisCoreRef.current && irisLaserRef.current) {
          const irisTl = gsap.timeline({
            scrollTrigger: {
              trigger: irisGateWrapRef.current,
              start: "top 92%",
              end: "bottom 35%",
              scrub: true,
            },
          });

          irisTl
            .fromTo(
              irisLaserRef.current,
              { scaleX: 0 },
              { scaleX: 1, ease: "none", duration: 0.3 },
              0
            )
            .fromTo(
              irisCoreRef.current,
              { scaleY: 0 },
              { scaleY: 1, ease: "none", duration: 0.7 },
              0.2
            );
        }

        // 3. UNIQUE TYPOGRAPHY MOTION #3 (Act III): 3D Cylindrical Odometer Character Spin (`rotateX: 110deg/-110deg -> 0deg`)
        if (act3AstrolabeRef.current && act3TrackRef.current) {
          gsap.fromTo(
            act3AstrolabeRef.current,
            { rotate: 0 },
            {
              rotate: 160,
              ease: "none",
              scrollTrigger: {
                trigger: act3TrackRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }

        const validAct3Chars = act3CharRefs.current.filter(Boolean);
        if (validAct3Chars.length > 0 && act3TrackRef.current) {
          gsap.fromTo(
            validAct3Chars,
            {
              yPercent: (idx) => (idx % 2 === 0 ? -100 : 100),
              rotateX: (idx) => (idx % 2 === 0 ? 90 : -90),
              opacity: 0,
            },
            {
              yPercent: 0,
              rotateX: 0,
              opacity: 1,
              stagger: 0.03,
              ease: "none",
              scrollTrigger: {
                trigger: act3TrackRef.current,
                start: "top 85%",
                end: "top 30%",
                scrub: true,
              },
            }
          );
        }

        // 4. Act III: 3-Card Curved Fan-Out & 180° 3D Flip Choreography!
        if (act3TrackRef.current && window.innerWidth >= 1024) {
          const c0 = cardSlotRefs.current[0];
          const c1 = cardSlotRefs.current[1];
          const c2 = cardSlotRefs.current[2];
          const in0 = cardInnerRefs.current[0];
          const in1 = cardInnerRefs.current[1];
          const in2 = cardInnerRefs.current[2];

          if (c0 && c1 && c2 && in0 && in1 && in2) {
            gsap.set(c0, { xPercent: 105, y: 0, rotateZ: 0, scale: 0.94, zIndex: 20 });
            gsap.set(c1, { xPercent: 0, y: 0, rotateZ: 0, scale: 1, zIndex: 30 });
            gsap.set(c2, { xPercent: -105, y: 0, rotateZ: 0, scale: 0.94, zIndex: 10 });
            gsap.set([in0, in1, in2], { rotateY: 180 });

            const cardTl = gsap.timeline({
              scrollTrigger: {
                trigger: act3TrackRef.current,
                start: "top 55%",
                end: "bottom 88%",
                scrub: true,
              },
            });

            // STEP A: Emerge from center card & curve downward like fanning a deck of cards
            cardTl
              .to(
                c0,
                {
                  xPercent: 0,
                  y: 64,
                  rotateZ: -13,
                  scale: 0.98,
                  ease: "power2.out",
                  duration: 0.42,
                },
                0
              )
              .to(
                c1,
                {
                  xPercent: 0,
                  y: -18,
                  rotateZ: 0,
                  scale: 1,
                  ease: "power2.out",
                  duration: 0.42,
                },
                0
              )
              .to(
                c2,
                {
                  xPercent: 0,
                  y: 64,
                  rotateZ: 13,
                  scale: 0.98,
                  ease: "power2.out",
                  duration: 0.42,
                },
                0
              );

            // STEP B: Align horizontally into a level row
            cardTl.to(
              [c0, c1, c2],
              {
                y: 0,
                rotateZ: 0,
                scale: 1,
                ease: "power2.inOut",
                duration: 0.26,
              },
              0.42
            );

            // STEP C: 180° 3D Flip (`rotateY: 180 -> 0`)
            cardTl.to(
              [in1, in0, in2],
              {
                rotateY: 0,
                stagger: 0.06,
                ease: "power2.inOut",
                duration: 0.34,
              },
              0.60
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
      className="relative w-full scene-b bg-bone-100 text-ink-950 select-none"
    >
      {/* ================= ACT II: ASYMMETRIC 12-COLUMN EDITORIAL SPREAD ================= */}
      <div
        ref={act2Ref}
        className="relative w-full bg-bone-100 pt-14 sm:pt-20 pb-24 sm:pb-32 px-8 sm:px-14 lg:px-24 overflow-hidden"
      >
        {/* Rich Constructivist SVG Topographic & Clinometer Schematic Background */}
        <svg
          ref={compassSvgRef}
          aria-hidden="true"
          viewBox="0 0 600 600"
          className="hidden lg:block absolute -right-28 top-12 w-[540px] h-[540px] text-ink-950/[0.08] pointer-events-none will-change-transform"
        >
          <circle cx="300" cy="300" r="270" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" />
          <circle cx="300" cy="300" r="210" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="145" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="20" y1="300" x2="580" y2="300" stroke="currentColor" strokeWidth="1.5" />
          <line x1="300" y1="20" x2="300" y2="580" stroke="currentColor" strokeWidth="1.5" />
          <polygon points="300,35 290,65 310,65" fill="currentColor" />
        </svg>

        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none grid grid-cols-4 lg:grid-cols-12 px-8 sm:px-14 lg:px-24"
        >
          <div className="border-l border-ink-950/[0.08] h-full" />
          <div className="hidden lg:block lg:col-start-5 border-l border-ink-950/[0.08] h-full" />
          <div className="hidden lg:block lg:col-start-9 border-l border-ink-950/[0.08] h-full" />
          <div className="col-start-4 lg:col-start-12 border-r border-ink-950/[0.08] h-full" />
        </div>

        {/* Direct bg-bone-100 without z-index isolation so Poster 2's multiply blend is 100% seamless! */}
        <div ref={act2ContentRef} className="max-w-[1600px] mx-auto bg-bone-100">
          {/* Scroll-Scrubbed Kinetic Telemetry Marquee Ribbon */}
          <div className="w-full overflow-hidden border-y-2 border-ink-950 py-2.5 mb-10 bg-bone-100">
            <div
              ref={marqueeTrackRef}
              className="flex items-center gap-10 whitespace-nowrap text-[11px] tracking-[0.28em] uppercase font-sans font-black text-ink-950 will-change-transform"
            >
              <span>02 // GRAND TOURING MANIFESTO</span>
              <span className="text-sun-600">////</span>
              <span>SPEED · MEETS · NATURE</span>
              <span className="text-sun-600">////</span>
              <span>PORSCHE 911 · MERCEDES-AMG · LAMBORGHINI</span>
              <span className="text-sun-600">////</span>
              <span>ĐÀ LẠT · ĐÈO HẢI VÂN · DUYÊN HẢI</span>
              <span className="text-sun-600">////</span>
              <span>POWER · PRECISION · FREEDOM</span>
            </div>
          </div>

          {/* Unclipped Variable-Font Width Wave Headline (NEVER cuts letters horizontally!) */}
          <div className="mb-12 sm:mb-16 pointer-events-none px-2">
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.5rem, 6.8vw, 8.8rem)",
                lineHeight: 1.15,
              }}
              className="font-black uppercase tracking-tight text-ink-950 flex flex-wrap items-baseline gap-x-[0.24em]"
            >
              {ACT2_WORDS_TOP.map((word, wIdx) => (
                <span
                  key={word}
                  ref={(el) => {
                    act2WordRefs.current[wIdx] = el;
                  }}
                  style={{ fontVariationSettings: "'wdth' 96" }}
                  className="inline-block will-change-transform"
                >
                  {word}
                </span>
              ))}
            </h2>

            <div className="flex items-center justify-end gap-6 mt-1">
              <span className="hidden md:block flex-1 max-w-sm h-[3px] bg-ink-950" />
              <span
                ref={bottomKineticRef}
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.5rem, 6.8vw, 8.8rem)",
                  lineHeight: 1.15,
                  fontVariationSettings: "'wdth' 115",
                }}
                className="font-black uppercase tracking-tight text-sun-600 whitespace-nowrap will-change-transform"
              >
                «ĐI CHẬM.»
              </span>
            </div>
          </div>

          {/* 12-Column Asymmetric Editorial Spread: Left 4 Cols Story Pillar + Right 8 Cols Seamless Poster 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-bone-100">
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

            {/* Right 8 Columns: Seamless Poster 2 Masterpiece */}
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

      {/* ================= UNIQUE SECTION 2 -> SECTION 3 TRANSITION: CENTER-OUT HORIZONTAL SPLIT IRIS GATE ================= */}
      <div
        ref={irisGateWrapRef}
        aria-hidden="true"
        className="relative w-full h-[24svh] bg-bone-100 flex items-center justify-center overflow-hidden pointer-events-none"
      >
        {/* Center Horizontal Vermilion Laser Seam */}
        <div
          ref={irisLaserRef}
          style={{ transformOrigin: "center center" }}
          className="w-full h-2 bg-sun-600 z-10 will-change-transform"
        />
        {/* Expanding Obsidian Iris Gate (Opens simultaneously upward & downward from the center seam!) */}
        <div
          ref={irisCoreRef}
          style={{ transformOrigin: "center center", transform: "scaleY(0)" }}
          className="absolute inset-0 w-full h-full bg-ink-950 border-y-4 border-sun-600 will-change-transform"
        />
      </div>

      {/* ================= ACT III: 3D CARD DECK FAN-OUT (CURVED ARC) & 180° FLIP STAGE ================= */}
      <div
        ref={act3TrackRef}
        id="quy-trinh"
        className="relative w-full lg:h-[225svh] bg-ink-950"
      >
        <div className="lg:sticky lg:top-0 w-full min-h-[100svh] bg-ink-950 text-bone-100 py-14 sm:py-16 px-6 sm:px-12 lg:px-20 flex flex-col justify-between overflow-hidden">
          {/* Rich Constructivist Rotating SVG Astrolabe & Radial Grid Background */}
          <svg
            ref={act3AstrolabeRef}
            aria-hidden="true"
            viewBox="0 0 800 800"
            className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] text-bone-100/[0.07] pointer-events-none will-change-transform"
          >
            <circle cx="400" cy="400" r="370" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 12" />
            <circle cx="400" cy="400" r="290" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="400" cy="400" r="200" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 8" />
            <line x1="30" y1="400" x2="770" y2="400" stroke="currentColor" strokeWidth="1" />
            <line x1="400" y1="30" x2="400" y2="770" stroke="currentColor" strokeWidth="1" />
            <line x1="138" y1="138" x2="662" y2="662" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="662" y1="138" x2="138" y2="662" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
          </svg>

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

          {/* Stage Header with 3D Cylindrical Odometer Character Roll */}
          <div
            style={{ perspective: "1000px" }}
            className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-bone-100/20 pb-5"
          >
            <div>
              <span className="text-xs tracking-[0.28em] uppercase font-sans font-bold text-sun-400 block mb-1.5">
                03 // BỘ BA THẺ BÀI QUY TRÌNH SỐ HÓA
              </span>
              <h2
                aria-label="NHẸ NHƯ KHÔNG."
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(2.5rem, 5.8vw, 6.8rem)",
                  lineHeight: 1.12,
                  fontVariationSettings: "'wdth' 108",
                }}
                className="font-black uppercase tracking-tight text-bone-100 flex overflow-hidden pt-[0.2em] pb-[0.06em] -mt-[0.16em]"
              >
                {ACT3_TITLE_CHARS.map((ch, idx) => (
                  <span
                    key={idx}
                    ref={(el) => {
                      act3CharRefs.current[idx] = el;
                    }}
                    className="inline-block will-change-transform"
                  >
                    {ch}
                  </span>
                ))}
              </h2>
            </div>

            <p className="font-sans text-xs sm:text-sm text-bone-100/80 max-w-md leading-relaxed border-l-4 border-sun-600 pl-4">
              Cuộn để xòe bộ thẻ hành trình từ lá giữa theo hình cánh quạt, dàn ngang hàng và lật mở 3 bước bàn giao chìa khóa số.
            </p>
          </div>

          {/* 3-Card Fanning & 3D Flipping Stage */}
          <div
            style={{ perspective: "1600px" }}
            className="relative z-20 w-full max-w-[1440px] mx-auto my-auto py-4 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
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
                  className="w-full h-[375px] sm:h-[395px] will-change-transform"
                >
                  <div
                    ref={(el) => {
                      cardInnerRefs.current[idx] = el;
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative w-full h-full will-change-transform"
                  >
                    {/* CARD FRONT FACE */}
                    <div
                      style={{ backfaceVisibility: "hidden" }}
                      className="absolute inset-0 w-full h-full bg-bone-100 text-ink-950 border-2 border-bone-100 p-6 sm:p-7 flex flex-col justify-between shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b-2 border-ink-950 pb-3">
                        <span
                          style={{
                            fontFamily: "var(--font-archivo, sans-serif)",
                            fontSize: "clamp(2.75rem, 3.8vw, 4.2rem)",
                            lineHeight: 0.88,
                            fontVariationSettings: "'wdth' 66",
                          }}
                          className="font-black text-sun-600"
                        >
                          {card.step}
                        </span>

                        <div className="text-right">
                          <span className="text-[9px] tracking-[0.24em] uppercase font-sans font-bold text-ink-950/60 block">
                            {card.code}
                          </span>
                          <span className="text-[11px] tracking-[0.2em] uppercase font-sans font-black text-ink-950 mt-0.5 block">
                            {card.tag}
                          </span>
                        </div>
                      </div>

                      <div className="my-auto py-3 space-y-2.5">
                        <div className="inline-flex items-center gap-2 bg-ink-950 text-bone-100 px-3 py-1 text-[10px] tracking-[0.22em] uppercase font-sans font-bold">
                          <Icon className="w-3.5 h-3.5 text-sun-400" />
                          <span>{card.metric}</span>
                        </div>

                        <h3
                          style={{
                            fontFamily: "var(--font-archivo, sans-serif)",
                            fontSize: "clamp(1.6rem, 2.2vw, 2.3rem)",
                            lineHeight: 1.1,
                            fontVariationSettings: "'wdth' 100",
                          }}
                          className="font-black uppercase tracking-tight text-ink-950"
                        >
                          {card.title}
                        </h3>

                        <p className="font-sans text-xs sm:text-sm text-ink-950/85 leading-relaxed font-medium">
                          {card.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t-2 border-ink-950 grid grid-cols-2 gap-3">
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

                    {/* CARD BACK FACE */}
                    <div
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                      className="absolute inset-0 w-full h-full bg-ink-950 text-bone-100 border-2 border-sun-600 p-5 flex flex-col justify-between shadow-2xl"
                    >
                      <div className="w-full h-full border border-bone-100/30 p-5 flex flex-col items-center justify-between relative overflow-hidden">
                        <div className="w-full flex items-center justify-between text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-sun-400">
                          <span>THONG DONG</span>
                          <span>PLATE {card.roman}</span>
                        </div>

                        <div className="relative w-32 h-32 rounded-full border-2 border-sun-600 flex items-center justify-center bg-ink-800">
                          <div className="w-20 h-20 rounded-full bg-sun-600 flex items-center justify-center">
                            <span
                              style={{
                                fontFamily: "var(--font-archivo, sans-serif)",
                                fontVariationSettings: "'wdth' 68",
                              }}
                              className="font-black text-3xl text-bone-100"
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

          <div className="relative z-10 w-full max-w-[1600px] mx-auto pt-3 border-t border-bone-100/15 flex items-center justify-between text-[10px] tracking-[0.26em] uppercase font-sans text-bone-100/60">
            <span>GỘP 1 TỤ → XÒE CONG HÌNH QUẠT → DÀN NGANG & LẬT 3D</span>
            <span className="text-sun-400">01 / 02 / 03</span>
          </div>
        </div>
      </div>
    </section>
  );
}

