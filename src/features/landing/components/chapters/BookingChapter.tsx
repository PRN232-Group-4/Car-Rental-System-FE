
import { useRef } from "react";
import Link from "@/components/navigation/NavigationLink";
import { MapPin, Phone, Mail, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

interface BookingChapterProps {
  onEnterChapter5?: (isInView: boolean) => void;
}

export default function BookingChapter({ onEnterChapter5 }: BookingChapterProps) {
  const containerRef = useRef<HTMLElement>(null);

  // Unique Section 4 -> Section 5 Transition: Full-Bleed Triple-Blade Diagonal Speed Wipe (Zero cream borders!)
  const transitionBridgeRef = useRef<HTMLDivElement>(null);
  const slashVermilionRef = useRef<HTMLDivElement>(null);
  const slashBlueRef = useRef<HTMLDivElement>(null);
  const slashInkRef = useRef<HTMLDivElement>(null);

  // Section 5 Stage & Editorial Typography Refs
  const bgImgRef = useRef<HTMLImageElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const svgDialRef = useRef<SVGSVGElement>(null);
  const leftTitleFillRef = useRef<HTMLDivElement>(null);
  const rightTitleRef = useRef<HTMLHeadingElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            slashVermilionRef.current,
            slashBlueRef.current,
            slashInkRef.current,
            bgImgRef.current,
            mistRef.current,
            svgDialRef.current,
            leftTitleFillRef.current,
            rightTitleRef.current,
            carRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. UNIQUE Section 4 -> Section 5 Transition: Full-Width Triple-Blade Diagonal Speed Wipe
        // Sweeps Vermilion -> Racing Blue -> Obsidian Ink across 100vw with ZERO cream side margins!
        if (
          transitionBridgeRef.current &&
          slashVermilionRef.current &&
          slashBlueRef.current &&
          slashInkRef.current
        ) {
          const bridgeTl = gsap.timeline({
            scrollTrigger: {
              trigger: transitionBridgeRef.current,
              start: "top 96%",
              end: "bottom 30%",
              scrub: true,
            },
          });

          bridgeTl
            .fromTo(
              slashVermilionRef.current,
              { xPercent: -105 },
              { xPercent: 0, ease: "none" },
              0
            )
            .fromTo(
              slashBlueRef.current,
              { xPercent: 105 },
              { xPercent: 0, ease: "none" },
              0.08
            )
            .fromTo(
              slashInkRef.current,
              { yPercent: 100 },
              { yPercent: 0, ease: "none" },
              0.16
            );
        }

        // 2. Section 5 Editorial Finale Choreography + Car Driving OVER the Footer Layer!
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            end: "bottom bottom",
            scrub: true,
            onEnter: () => onEnterChapter5?.(true),
            onLeaveBack: () => onEnterChapter5?.(false),
          },
        });

        if (bgImgRef.current) {
          tl.fromTo(
            bgImgRef.current,
            { scale: 1.16, yPercent: -8 },
            { scale: 1.0, yPercent: 6, ease: "none" },
            0
          );
        }

        if (svgDialRef.current) {
          tl.fromTo(
            svgDialRef.current,
            { rotate: -80 },
            { rotate: 80, ease: "none" },
            0
          );
        }

        if (leftTitleFillRef.current) {
          tl.fromTo(
            leftTitleFillRef.current,
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
            0
          );
        }

        if (rightTitleRef.current) {
          tl.fromTo(
            rightTitleRef.current,
            {
              xPercent: 14,
              fontVariationSettings: "'wdth' 70",
              opacity: 0.25,
            },
            {
              xPercent: 0,
              fontVariationSettings: "'wdth' 118",
              opacity: 1,
              ease: "none",
            },
            0
          );
        }

        // Foreground Car (`b4-car` at z-50) physically drives forward & overlaps ON TOP OF the Footer!
        if (carRef.current) {
          tl.fromTo(
            carRef.current,
            { xPercent: 24, y: -24, scale: 0.88 },
            { xPercent: -6, y: 18, scale: 1.08, ease: "none" },
            0
          );
        }

        if (mistRef.current) {
          tl.fromTo(
            mistRef.current,
            { xPercent: -15, opacity: 0.3 },
            { xPercent: 12, opacity: 0.65, ease: "none" },
            0
          );
        }
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="dat-xe"
      className="relative w-full bg-ink-950 text-bone-100 select-none overflow-hidden"
    >
      {/* ================= UNIQUE SECTION 4 -> SECTION 5 TRANSITION: FULL-BLEED TRIPLE-BLADE DIAGONAL WIPE ================= */}
      <div
        ref={transitionBridgeRef}
        aria-hidden="true"
        className="relative w-full h-[26svh] bg-bone-100 overflow-hidden pointer-events-none"
      >
        <div
          ref={slashVermilionRef}
          style={{ clipPath: "polygon(0% 0%, 78% 100%, 0% 100%)" }}
          className="absolute inset-0 w-full h-full bg-sun-600 will-change-transform"
        />
        <div
          ref={slashBlueRef}
          style={{ clipPath: "polygon(100% 0%, 100% 100%, 18% 100%)" }}
          className="absolute inset-0 w-full h-full bg-lake-600 will-change-transform"
        />
        <div
          ref={slashInkRef}
          style={{ clipPath: "polygon(0% 42%, 100% 0%, 100% 100%, 0% 100%)" }}
          className="absolute inset-0 w-full h-full bg-ink-950 will-change-transform"
        />
      </div>

      {/* ================= PART 1: DEDICATED UPPER CONSTRUCTIVIST TYPOGRAPHY DECK (100% Separated from White Clouds!) ================= */}
      <div className="relative z-30 w-full bg-ink-950 pt-10 sm:pt-14 pb-10 px-6 sm:px-12 lg:px-20 border-b border-bone-100/20">
        {/* Constructivist SVG Horizon Compass Dial */}
        <svg
          ref={svgDialRef}
          aria-hidden="true"
          viewBox="0 0 500 500"
          className="hidden lg:block absolute right-[8%] -top-24 w-[420px] h-[420px] text-bone-100/[0.07] pointer-events-none will-change-transform"
        >
          <circle cx="250" cy="250" r="220" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
          <circle cx="250" cy="250" r="160" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="250" x2="480" y2="250" stroke="currentColor" strokeWidth="1" />
          <line x1="250" y1="20" x2="250" y2="480" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="max-w-[1640px] mx-auto">
          {/* Top Telemetry Strip */}
          <div className="flex items-center justify-between text-[11px] tracking-[0.28em] uppercase font-sans font-bold text-bone-100/70 pb-4 mb-8 border-b border-bone-100/15">
            <span>05 // THE GRAND DEPARTURE</span>
            <span className="text-sun-400">CHỌN TRẠM · NHẬN KHÓA SỐ · KHỞI HÀNH</span>
          </div>

          {/* Monumental Asymmetric Split-Horizon Typography (Zero Cloud Collision, Pure Awwwards Editorial Hierarchy!) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Left 7 Columns: Hollow Stroke-to-Solid Fill Statement */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative inline-block">
                <div
                  aria-hidden="true"
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(2.4rem, 5.6vw, 6.8rem)",
                    lineHeight: 1.08,
                    fontVariationSettings: "'wdth' 88",
                    WebkitTextStroke: "1.5px rgba(233, 228, 216, 0.45)",
                    color: "transparent",
                  }}
                  className="font-black uppercase tracking-tight whitespace-nowrap select-none"
                >
                  CỖ MÁY ĐÃ SẴN SÀNG.
                </div>

                <div
                  ref={leftTitleFillRef}
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(2.4rem, 5.6vw, 6.8rem)",
                    lineHeight: 1.08,
                    fontVariationSettings: "'wdth' 88",
                  }}
                  className="absolute inset-0 font-black uppercase tracking-tight text-bone-100 whitespace-nowrap will-change-transform"
                >
                  CỖ MÁY ĐÃ SẴN SÀNG.
                </div>
              </div>

              <p className="font-sans text-sm sm:text-base text-bone-100/80 max-w-xl leading-relaxed border-l-4 border-sun-600 pl-4">
                Chọn chi nhánh tiếp nhận và khung giờ khởi hành tại thanh điều khiển phía dưới. Hệ thống tự động giữ xe và kích hoạt hợp đồng số tức thì.
              </p>
            </div>

            {/* Right 5 Columns: Variable-Width Expanding «ĐI THÔI.» */}
            <div className="lg:col-span-5 flex lg:justify-end">
              <h2
                ref={rightTitleRef}
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(3.25rem, 7.2vw, 8.8rem)",
                  lineHeight: 1.05,
                  fontVariationSettings: "'wdth' 115",
                }}
                className="font-black uppercase tracking-tight text-sun-400 whitespace-nowrap will-change-transform"
              >
                «ĐI THÔI.»
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PART 2: FULL-BLEED HAI VAN SUNSET PANORAMA STAGE ================= */}
      <div className="relative z-10 w-full h-[64svh] min-h-[480px] overflow-hidden">
        <picture className="absolute inset-0 w-full h-full block pointer-events-none" style={{ zIndex: 5 }}>
          <source
            type="image/avif"
            srcSet="/assets/landing/b0-backdrop-3840.avif 3840w, /assets/landing/b0-backdrop-2880.avif 2880w, /assets/landing/b0-backdrop-1920.avif 1920w, /assets/landing/b0-backdrop-1280.avif 1280w"
          />
          <source
            type="image/webp"
            srcSet="/assets/landing/b0-backdrop-3840.webp 3840w, /assets/landing/b0-backdrop-2880.webp 2880w, /assets/landing/b0-backdrop-1920.webp 1920w, /assets/landing/b0-backdrop-1280.webp 1280w"
          />
          <img
            ref={bgImgRef}
            src="/assets/landing/b0-backdrop-1920.webp"
            alt="Hoàng hôn Đèo Hải Vân"
            className="w-full h-full object-cover object-center pointer-events-none will-change-transform"
            loading="lazy"
            decoding="async"
          />
        </picture>

        <div
          ref={mistRef}
          aria-hidden="true"
          style={{ zIndex: 12, mixBlendMode: "screen", opacity: 0.45 }}
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
      </div>

      {/* ================= PART 3: UNCLIPPED FOREGROUND CAR (`z-45`) DRIVING DIRECTLY ON TOP OF THE FOOTER (`z-20`)! ================= */}
      {/* Placed OUTSIDE the overflow-hidden panorama stage so its tires and chassis physically overlap and drive across the Footer's top border! */}
      <div
        style={{ zIndex: 45 }}
        className="relative w-full max-w-[1640px] mx-auto -mt-48 sm:-mt-64 -mb-16 sm:-mb-24 pointer-events-none px-6 sm:px-12"
      >
        <div
          ref={carRef}
          style={{
            width: "clamp(320px, 48vw, 820px)",
          }}
          className="ml-auto mr-[2%] sm:mr-[6%] pointer-events-none will-change-transform"
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
              alt="Porsche 911 trên cung đường biển"
              className="w-full h-auto object-contain pointer-events-none contrast-125 brightness-95 drop-shadow-2xl"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </div>

      {/* ================= PART 4: COMPREHENSIVE 4-COLUMN ARCHITECTURAL FOOTER (`z-20`, Sitting UNDERNEATH the `z-45` Car!) ================= */}
      <footer
        style={{ zIndex: 20 }}
        className="relative w-full bg-ink-950 border-t-4 border-sun-600 px-6 sm:px-12 lg:px-20 pt-24 sm:pt-28 pb-32 text-bone-100"
      >
        <div className="max-w-[1640px] mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-bone-100/20">
            {/* Col 1 (4 cols): Brand Identity & Philosophy */}
            <div className="lg:col-span-4 space-y-4">
              <div className="font-display font-black text-3xl tracking-tight text-bone-100">
                ThongDong<span className="text-sun-600">.</span>
              </div>
              <p className="font-sans text-sm text-bone-100/75 leading-relaxed max-w-sm">
                Hệ thống cho thuê siêu xe và xe sang hiệu năng cao. Bàn giao chìa khóa số chuẩn xác, kiểm định kỹ thuật đa điểm và đối soát hoàn cọc tự động.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-sans font-bold text-sun-400">
                <ShieldCheck className="w-4 h-4" />
                <span>100% ĐỘI XE BẢO HIỂM VẬT CHẤT TOÀN DIỆN</span>
              </div>
            </div>

            {/* Col 2 (3 cols): Navigation Directory */}
            <div className="lg:col-span-3 space-y-3">
              <span className="text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-sun-400 block mb-4">
                KHÁM PHÁ HỆ THỐNG
              </span>
              <ul className="space-y-2.5 text-sm font-sans">
                <li>
                  <Link href="/find" className="inline-flex items-center gap-1.5 text-bone-100/80 hover:text-sun-400 transition-colors">
                    <span>Đội xe tuyển chọn (Fleet)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link href="/facilities" className="inline-flex items-center gap-1.5 text-bone-100/80 hover:text-sun-400 transition-colors">
                    <span>Mạng lưới trạm bàn giao</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link href="/inspection" className="inline-flex items-center gap-1.5 text-bone-100/80 hover:text-sun-400 transition-colors">
                    <span>Trạm mô phỏng kiểm định 3D</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link href="/subscriptions" className="inline-flex items-center gap-1.5 text-bone-100/80 hover:text-sun-400 transition-colors">
                    <span>Gói thuê bao hội viên</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 (2 cols): Account & Onboarding */}
            <div className="lg:col-span-2 space-y-3">
              <span className="text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-lake-400 block mb-4">
                KHÁCH HÀNG
              </span>
              <ul className="space-y-2.5 text-sm font-sans">
                <li>
                  <Link href="/register" className="text-bone-100/80 hover:text-bone-100 transition-colors">
                    Đăng ký thành viên
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-bone-100/80 hover:text-bone-100 transition-colors">
                    Đăng nhập hệ thống
                  </Link>
                </li>
                <li>
                  <Link href="/my-rentals" className="text-bone-100/80 hover:text-bone-100 transition-colors">
                    Quản lý chuyến đi
                  </Link>
                </li>
                <li>
                  <Link href="/driver-license" className="text-bone-100/80 hover:text-bone-100 transition-colors">
                    Hồ sơ giấy phép lái xe
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4 (3 cols): Concierge & Operations */}
            <div className="lg:col-span-3 space-y-3">
              <span className="text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-sun-400 block mb-4">
                TRUNG TÂM ĐIỀU HÀNH
              </span>
              <div className="space-y-2.5 text-xs sm:text-base text-bone-100/80 font-sans">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-sun-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">Hệ thống trạm trung tâm Quận 1, Quận 2 (Thảo Điền), Quận 7 — TP. Hồ Chí Minh</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-sun-400 shrink-0" />
                  <span className="text-xs sm:text-sm">Hotline Concierge: 1900 8888</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-sun-400 shrink-0" />
                  <span className="text-xs sm:text-sm">Email hỗ trợ: support@vrs.vn</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-sun-400 shrink-0" />
                  <span className="text-xs sm:text-sm">Khung giờ bàn giao trạm: 07:00 – 22:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* CC BY 4.0 3D Attribution & Copyright Bar */}
          <div className="space-y-4 text-xs text-bone-100/60">
            <div className="leading-relaxed border-b border-bone-100/15 pb-4 text-[11px] text-bone-100/50">
              <strong className="text-bone-100 font-medium">
                Ghi nhận bản quyền mô hình 3D (CC BY 4.0):
              </strong>{" "}
              1975 Porsche 911 (930) Turbo tác quyền bởi Karol Miklas; Porsche 911 Carrera 4S (2026 Edition) tác quyền bởi Martin Trafas / 3D Automotive Design Lab. Được tích hợp và tối ưu hoá hiển thị theo giấy phép Creative Commons Attribution 4.0 International.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[11px] tracking-wider">
              <span>
                © 2026 Hệ thống cho thuê xe Thong Dong. Toàn bộ quyền được bảo lưu.
              </span>
              <div className="flex items-center gap-6 font-semibold">
                <Link href="/find" className="hover:text-sun-400 transition-colors">
                  ĐỘI XE
                </Link>
                <Link href="/facilities" className="hover:text-sun-400 transition-colors">
                  CHI NHÁNH
                </Link>
                <Link href="/inspection" className="hover:text-sun-400 transition-colors">
                  KIỂM ĐỊNH 3D
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}

