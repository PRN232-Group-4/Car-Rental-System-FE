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
  const irisStageRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            irisStageRef.current,
            bgImgRef.current,
            headlineRef.current,
            ruleRef.current,
            carRef.current,
            mistRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. UNIQUE Section 4 -> Section 5 Transition: Expanding Circular Sun-Iris Portal (`clipPath: circle(18% at 50% 38%) -> circle(120% at 50% 50%)`)
        if (irisStageRef.current) {
          gsap.fromTo(
            irisStageRef.current,
            { clipPath: "circle(18% at 50% 35%)" },
            {
              clipPath: "circle(125% at 50% 50%)",
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 95%",
                end: "top 18%",
                scrub: true,
              },
            }
          );
        }

        // 2. 1:1 Scroll-Scrubbed Finale Choreography
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%",
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

        if (headlineRef.current) {
          tl.fromTo(
            headlineRef.current,
            { xPercent: 12, opacity: 0.2 },
            { xPercent: 0, opacity: 1, ease: "none" },
            0
          );
        }

        if (ruleRef.current) {
          tl.fromTo(
            ruleRef.current,
            { scaleX: 0 },
            { scaleX: 1, ease: "none" },
            0.05
          );
        }

        if (carRef.current) {
          tl.fromTo(
            carRef.current,
            { xPercent: 18, yPercent: 6, scale: 0.88 },
            { xPercent: -4, yPercent: -2, scale: 1.05, ease: "none" },
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
      {/* Expanding Circular Sun-Iris Portal Stage */}
      <div
        ref={irisStageRef}
        className="relative w-full bg-ink-950 text-bone-100 flex flex-col justify-between overflow-hidden will-change-transform"
      >
        {/* ================= PART 1: HAI VAN SUNSET DEPARTURE STAGE ================= */}
        <div className="relative w-full min-h-[95svh] flex flex-col justify-between pt-20 overflow-hidden">
          {/* 1. Full-Bleed Hai Van Sunset Woodcut (`b0-backdrop` — Orange Sun on Left, Dark Night Sky on Right) */}
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

          {/* 2. Drifting Coastal Mist */}
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

          {/* 3. Unbroken Single-Line Monumental Departure Headline */}
          <div
            ref={headlineRef}
            style={{ zIndex: 30 }}
            className="relative w-full max-w-[1640px] mx-auto px-6 sm:px-12 lg:px-20 pt-6 sm:pt-10 flex flex-col items-end text-right pointer-events-none will-change-transform"
          >
            <span className="text-xs tracking-[0.28em] uppercase font-sans font-bold text-sun-400 block mb-2">
              05 // KHỞI HÀNH NGAY HÔM NAY
            </span>

            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.75rem, 6.8vw, 8.2rem)",
                lineHeight: 1.15,
                fontVariationSettings: "'wdth' 108",
              }}
              className="font-black uppercase tracking-tight text-bone-100 whitespace-nowrap pt-[0.16em] drop-shadow-2xl"
            >
              «ĐI THÔI.»
            </h2>

            <div
              ref={ruleRef}
              style={{ transformOrigin: "right center" }}
              className="w-36 sm:w-56 h-[3px] bg-sun-600 my-4 will-change-transform"
            />

            <p className="font-sans text-base sm:text-lg text-bone-100/95 max-w-md leading-relaxed font-medium drop-shadow-lg bg-ink-950/85 p-4 border-r-4 border-sun-600">
              Chọn trạm nhận xe và khung giờ khởi hành ngay tại thanh điều khiển phía dưới.
            </p>
          </div>

          {/* 4. Cornering Lithograph Car (`b4-car`) */}
          <div style={{ zIndex: 35 }} className="relative w-full mt-auto pt-16">
            <div
              ref={carRef}
              style={{
                width: "clamp(320px, 46vw, 760px)",
              }}
              className="relative ml-auto mr-[6%] sm:mr-[10%] -mb-8 sm:-mb-12 z-20 pointer-events-none will-change-transform"
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

        {/* ================= PART 2: COMPREHENSIVE 4-COLUMN ARCHITECTURAL FOOTER COLOPHON ================= */}
        <footer className="relative z-40 w-full bg-ink-950 border-t-4 border-sun-600 px-6 sm:px-12 lg:px-20 pt-16 pb-32 text-bone-100">
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
                <div className="space-y-2.5 text-xs sm:text-sm text-bone-100/80 font-sans">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-sun-400 shrink-0 mt-0.5" />
                    <span>Hệ thống trạm trung tâm Quận 1, Quận 2 (Thảo Điền), Quận 7 — TP. Hồ Chí Minh</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-sun-400 shrink-0" />
                    <span>Hotline Concierge: 1900 8888</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-sun-400 shrink-0" />
                    <span>Email hỗ trợ: support@vrs.vn</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-sun-400 shrink-0" />
                    <span>Khung giờ bàn giao trạm: 07:00 – 22:00</span>
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
      </div>
    </section>
  );
}
