
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

  // Unique Section 4 -> Section 5 Transition: 7-Louver Horizontal Venetian Blind Flip (Flips away the cream paper slats in 3D!)
  const louverOverlayRef = useRef<HTMLDivElement>(null);
  const louverRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Section 5 Uncut Full-Viewport Hai Van Stage & Split-Horizon Magnetic Convergence Typography Refs
  const bgImgRef = useRef<HTMLImageElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const svgDialRef = useRef<SVGSVGElement>(null);
  const leftWordRef = useRef<HTMLSpanElement>(null);
  const rightWordRef = useRef<HTMLSpanElement>(null);
  const connectorBarRef = useRef<HTMLSpanElement>(null);
  const subBoxRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        louverRefs.current.forEach((l) => {
          if (l) gsap.set(l, { scaleY: 0 });
        });
        gsap.set(
          [
            bgImgRef.current,
            mistRef.current,
            svgDialRef.current,
            leftWordRef.current,
            rightWordRef.current,
            subBoxRef.current,
            carRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
        if (connectorBarRef.current) gsap.set(connectorBarRef.current, { width: "0.28em" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. UNIQUE SECTION 4 -> SECTION 5 TRANSITION: 7-Louver Horizontal Venetian Blind 3D Flip!
        // As Section 5 enters, 7 horizontal full-width archival paper slats flip open in 3D (`scaleY: 1 -> 0` + `rotateX: 0 -> 90deg` staggered top-to-bottom), revealing the 100% UNCUT Hai Van Sunset painting!
        const validLouvers = louverRefs.current.filter(Boolean);
        if (validLouvers.length > 0) {
          gsap.fromTo(
            validLouvers,
            { scaleY: 1, rotateX: 0 },
            {
              scaleY: 0,
              rotateX: 85,
              stagger: 0.05,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 92%",
                end: "top 22%",
                scrub: true,
              },
            }
          );
        }

        // 2. UNIQUE TYPOGRAPHY MOTION #5: Split-Horizon Magnetic Convergence (`«ĐI` and `THÔI.»` slide in from opposite ends as the vermilion connector bar compresses into a single locked 1-line headline!)
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
            { scale: 1.15, yPercent: -6 },
            { scale: 1.0, yPercent: 6, ease: "none" },
            0
          );
        }

        if (svgDialRef.current) {
          tl.fromTo(
            svgDialRef.current,
            { rotate: -90 },
            { rotate: 90, ease: "none" },
            0
          );
        }

        if (leftWordRef.current && rightWordRef.current && connectorBarRef.current) {
          tl.fromTo(
            leftWordRef.current,
            { x: -80, opacity: 0.2 },
            { x: 0, opacity: 1, ease: "none", duration: 0.5 },
            0
          )
            .fromTo(
              rightWordRef.current,
              { x: 80, opacity: 0.2 },
              { x: 0, opacity: 1, ease: "none", duration: 0.5 },
              0
            )
            .fromTo(
              connectorBarRef.current,
              { width: "3.2em", backgroundColor: "var(--sun-600)" },
              { width: "0.28em", backgroundColor: "transparent", ease: "none", duration: 0.5 },
              0
            );
        }

        if (subBoxRef.current) {
          tl.fromTo(
            subBoxRef.current,
            { y: 36, opacity: 0.2 },
            { y: 0, opacity: 1, ease: "none", duration: 0.5 },
            0.1
          );
        }

        // 3. Foreground Car (`b4-car` at z-50) physically drives across the top of the Footer!
        if (carRef.current) {
          tl.fromTo(
            carRef.current,
            { xPercent: 22, y: -10, scale: 0.9 },
            { xPercent: -6, y: 12, scale: 1.06, ease: "none" },
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
      {/* ================= PART 1: 100% UNCUT FULL-VIEWPORT HAI VAN SUNSET STAGE (Zero Horizontal Black Block Cutting the Sun!) ================= */}
      <div className="relative w-full min-h-[100svh] flex flex-col justify-between pt-28 sm:pt-32">
        {/* UNIQUE SECTION 4 -> 5 TRANSITION OVERLAY: 7 Horizontal Venetian Blind Slats (`bg-bone-100`) that flip open in 3D from top to bottom! */}
        <div
          ref={louverOverlayRef}
          aria-hidden="true"
          style={{ zIndex: 42, perspective: "1000px" }}
          className="absolute inset-0 w-full h-full flex flex-col pointer-events-none"
        >
          {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              ref={(el) => {
                louverRefs.current[idx] = el;
              }}
              style={{ transformOrigin: "center top" }}
              className="w-full flex-1 bg-bone-100 border-b border-ink-950/10 -my-[1px] will-change-transform"
            />
          ))}
        </div>

        {/* 1. Full-Viewport Uninterrupted Hai Van Sunset Woodcut (`b0-backdrop` — 100% of the Orange Sun on the Left is intact!) */}
        <picture className="absolute inset-0 w-full h-full block pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
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

        

        {/* Rotating Constructivist SVG Horizon Dial in Top-Right Sky */}
        <svg
          ref={svgDialRef}
          aria-hidden="true"
          viewBox="0 0 500 500"
          style={{ zIndex: 10 }}
          className="hidden lg:block absolute right-[6%] top-[6%] w-[440px] h-[440px] text-bone-100/15 pointer-events-none will-change-transform"
        >
          <circle cx="250" cy="250" r="220" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
          <circle cx="250" cy="250" r="160" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="250" x2="480" y2="250" stroke="currentColor" strokeWidth="1" />
          <line x1="250" y1="20" x2="250" y2="480" stroke="currentColor" strokeWidth="1" />
        </svg>

        {/* 2. Drifting Coastal Mist */}
        <div
          ref={mistRef}
          aria-hidden="true"
          style={{ zIndex: 12, mixBlendMode: "screen", opacity: 0.42 }}
          className="absolute inset-0 pointer-events-none overflow-hidden will-change-transform"
        >
          <img
            src="/assets/landing/b5-mist-1920.webp"
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* 3. Split-Horizon Magnetic Convergence Typography (Guaranteed 100% Single Line in the Top-Right Night Sky!) */}
        <div
          style={{ zIndex: 30 }}
          className="relative w-full max-w-[1640px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col items-end text-right pointer-events-none"
        >
          <div className="inline-flex items-center gap-3 bg-ink-950/90 border border-bone-100/25 px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-sun-600 inline-block" />
            <span className="text-[10px] sm:text-xs tracking-[0.28em] uppercase font-sans font-bold text-sun-400">
              05 // KHỞI HÀNH NGAY HÔM NAY
            </span>
          </div>

          {/* Guaranteed Unbroken Single-Line Headline (`flex-nowrap whitespace-nowrap`) */}
          <h2
            aria-label="«ĐI THÔI.»"
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "clamp(2.75rem, 6.2vw, 7.6rem)",
              lineHeight: 1.12,
              fontVariationSettings: "'wdth' 110",
            }}
            className="font-black uppercase tracking-tight text-bone-100 flex flex-nowrap items-center justify-end whitespace-nowrap drop-shadow-2xl"
          >
            <span ref={leftWordRef} className="inline-block will-change-transform">
              «ĐI
            </span>
            <span
              ref={connectorBarRef}
              aria-hidden="true"
              style={{ width: "0.28em" }}
              className="inline-block h-[4px] mx-1 will-change-transform"
            />
            <span ref={rightWordRef} className="inline-block text-sun-400 will-change-transform">
              THÔI.»
            </span>
          </h2>

          <div
            ref={subBoxRef}
            className="mt-5 bg-ink-950/95 p-5 sm:p-6 border-r-4 border-sun-600 max-w-md shadow-2xl will-change-transform"
          >
            <div className="flex items-center justify-end gap-2 text-[10px] tracking-[0.26em] uppercase font-sans font-bold text-sun-400 mb-2">
              <span>CHỌN TRẠM · NHẬN KHÓA SỐ · LÊN ĐƯỜNG</span>
              <span>////</span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-bone-100/95 leading-relaxed font-medium">
              Chọn chi nhánh tiếp nhận và khung giờ khởi hành ngay tại thanh điều khiển phía dưới.
            </p>
          </div>
        </div>

        {/* 4. FOREGROUND PORSCHE (`z-50`) STRADDLING THE EXACT TOP BORDER OF THE FOOTER (`-mb-24 sm:-mb-36`)! */}
        {/* Half of the car's wheels and chassis sit physically ON TOP OF the Footer's orange top border and dark surface! */}
        <div
          style={{ zIndex: 50 }}
          className="relative w-full max-w-[1640px] mx-auto mt-auto pt-12 px-6 sm:px-12 pointer-events-none"
        >
          <div
            ref={carRef}
            style={{
              width: "clamp(320px, 48vw, 820px)",
            }}
            className="relative ml-auto mr-[2%] sm:mr-[6%] -mb-24 sm:-mb-36 pointer-events-none will-change-transform"
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
      </div>

      {/* ================= PART 2: COMPREHENSIVE 4-COLUMN ARCHITECTURAL FOOTER (`z-20`, Sitting UNDERNEATH the `z-50` Porsche Tires!) ================= */}
      <footer
        style={{ zIndex: 20 }}
        className="relative w-full bg-ink-950 border-t-4 border-sun-600 px-6 sm:px-12 lg:px-20 pt-32 sm:pt-40 pb-32 text-bone-100"
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

