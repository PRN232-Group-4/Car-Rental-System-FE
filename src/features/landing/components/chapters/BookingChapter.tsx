"use client";

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
  const sunsetViewportRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subBoxRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            sunsetViewportRef.current,
            bgImgRef.current,
            headlineRef.current,
            subBoxRef.current,
            carRef.current,
            mistRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. UNIQUE Section 4 -> Section 5 Transition: Expanding Widescreen Cinema Horizon Aperture
        // Applied STRICTLY to `sunsetViewportRef` (the 95svh Sunset Stage), so it NEVER creates an awkward dome cut!
        if (sunsetViewportRef.current) {
          gsap.fromTo(
            sunsetViewportRef.current,
            { clipPath: "inset(32% 6% 32% 6%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 95%",
                end: "top 20%",
                scrub: true,
              },
            }
          );
        }

        // 2. Bespoke Section 5 Typography Motion: Radial Scale-Down & Letter-Spacing Compression Lock + Car Over-Footer Drive
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 88%",
            end: "bottom bottom",
            scrub: true,
            onEnter: () => onEnterChapter5?.(true),
            onLeaveBack: () => onEnterChapter5?.(false),
          },
        });

        if (bgImgRef.current) {
          tl.fromTo(
            bgImgRef.current,
            { scale: 1.18, yPercent: -10 },
            { scale: 1.0, yPercent: 6, ease: "none" },
            0
          );
        }

        if (headlineRef.current) {
          tl.fromTo(
            headlineRef.current,
            { scale: 1.28, letterSpacing: "0.18em", opacity: 0.2 },
            { scale: 1.0, letterSpacing: "-0.02em", opacity: 1, ease: "none" },
            0
          );
        }

        if (subBoxRef.current) {
          tl.fromTo(
            subBoxRef.current,
            { y: 36, opacity: 0.2 },
            { y: 0, opacity: 1, ease: "none" },
            0.08
          );
        }

        if (carRef.current) {
          tl.fromTo(
            carRef.current,
            { xPercent: 18, yPercent: 6, scale: 0.88 },
            { xPercent: -4, yPercent: 0, scale: 1.06, ease: "none" },
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
      className="relative w-full bg-bone-100 select-none overflow-hidden"
    >
      {/* ================= PART 1: HAI VAN SUNSET DEPARTURE STAGE (Note: NO overflow-hidden at bottom so Car at z-50 stands ON TOP OF Footer!) ================= */}
      <div
        ref={sunsetViewportRef}
        className="relative w-full min-h-[92svh] bg-ink-950 text-bone-100 flex flex-col justify-between pt-28 sm:pt-32 will-change-transform"
      >
        {/* 1. Full-Bleed Hai Van Sunset Woodcut (`b0-backdrop`) */}
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

        {/* 2. Drifting Coastal Mist */}
        <div
          ref={mistRef}
          aria-hidden="true"
          style={{ zIndex: 12, mixBlendMode: "screen", opacity: 0.45 }}
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

        {/* 3. Unbroken Single-Line Monumental Departure Headline (Positioned with pt-28/32 so it NEVER collides with the top-right MENU button!) */}
        <div
          style={{ zIndex: 30 }}
          className="relative w-full max-w-[1640px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col items-end text-right pointer-events-none"
        >
          <span className="text-xs tracking-[0.28em] uppercase font-sans font-bold text-sun-400 block mb-2">
            05 // KHỞI HÀNH NGAY HÔM NAY
          </span>

          <h2
            ref={headlineRef}
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "clamp(2.75rem, 6.8vw, 8.2rem)",
              lineHeight: 1.15,
              fontVariationSettings: "'wdth' 108",
              transformOrigin: "right center",
            }}
            className="font-black uppercase text-bone-100 whitespace-nowrap pt-[0.16em] drop-shadow-2xl will-change-transform"
          >
            «ĐI THÔI.»
          </h2>

          <div
            ref={subBoxRef}
            className="mt-4 bg-ink-950/90 p-4 sm:p-5 border-r-4 border-sun-600 max-w-md will-change-transform"
          >
            <p className="font-sans text-sm sm:text-base text-bone-100/95 leading-relaxed font-medium">
              Chọn trạm nhận xe và khung giờ khởi hành ngay tại thanh điều khiển phía dưới.
            </p>
          </div>
        </div>

        {/* 4. Cornering Lithograph Car (`b4-car`) at z-50 Standing Directly ON TOP OF the Footer Layer! */}
        <div
          style={{ zIndex: 50 }}
          className="relative w-full mt-auto pt-16 pointer-events-none"
        >
          <div
            ref={carRef}
            style={{
              width: "clamp(320px, 48vw, 800px)",
            }}
            className="relative ml-auto mr-[6%] sm:mr-[10%] -mb-14 sm:-mb-20 pointer-events-none will-change-transform"
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

      {/* ================= PART 2: COMPREHENSIVE 4-COLUMN ARCHITECTURAL FOOTER (z-20, Sitting UNDERNEATH the z-50 Car Tires!) ================= */}
      <footer
        style={{ zIndex: 20 }}
        className="relative w-full bg-ink-950 border-t-4 border-sun-600 px-6 sm:px-12 lg:px-20 pt-24 sm:pt-28 pb-32 text-bone-100"
      >
        <div className="max-w-[1640px] mx-auto space-y-12">
          {/* 4-Column Luxury Editorial Directory */}
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

          {/* CC BY 4.0 3D Attribution & Copyright Bar (Matches E2E assertions 100%) */}
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
