"use client";

import { useRef } from "react";
import Link from "@/components/navigation/NavigationLink";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

interface BookingChapterProps {
  onEnterChapter5?: (isInView: boolean) => void;
}

export default function BookingChapter({ onEnterChapter5 }: BookingChapterProps) {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (textRef.current) gsap.set(textRef.current, { opacity: 1, y: 0 });
        if (carRef.current) gsap.set(carRef.current, { opacity: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom bottom",
            scrub: true,
            onEnter: () => onEnterChapter5?.(true),
            onLeaveBack: () => onEnterChapter5?.(false),
          },
        });

        if (carRef.current) {
          tl.to(carRef.current, { yPercent: -10, ease: "none" }, 0);
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
      className="relative w-full min-h-[100svh] bg-ink-950 text-bone-100 flex flex-col justify-between select-none overflow-hidden"
    >
      {/* 1. Nền tranh Cảnh A nguyên bản liền mạch (object-cover object-center, z-10) */}
      <picture className="absolute inset-0 w-full h-full block pointer-events-none" style={{ zIndex: 10 }}>
        <source
          type="image/avif"
          srcSet="/assets/landing/scene-a-dalat-full-3840.avif 3840w, /assets/landing/scene-a-dalat-full-2880.avif 2880w, /assets/landing/scene-a-dalat-full-1920.avif 1920w, /assets/landing/scene-a-dalat-full-1280.avif 1280w, /assets/landing/scene-a-dalat-full-960.avif 960w, /assets/landing/scene-a-dalat-full-640.avif 640w"
        />
        <source
          type="image/webp"
          srcSet="/assets/landing/scene-a-dalat-full-3840.webp 3840w, /assets/landing/scene-a-dalat-full-2880.webp 2880w, /assets/landing/scene-a-dalat-full-1920.webp 1920w, /assets/landing/scene-a-dalat-full-1280.webp 1280w, /assets/landing/scene-a-dalat-full-960.webp 960w, /assets/landing/scene-a-dalat-full-640.webp 640w"
        />
        <img
          src="/assets/landing/scene-a-dalat-full-1920.webp"
          alt="Hoàng hôn Đà Lạt"
          className="w-full h-full object-cover object-center pointer-events-none brightness-75"
          loading="lazy"
          decoding="async"
        />
      </picture>

      {/* 2. Lớp xe a4-car (z-20) ở nửa dưới khung hình */}
      <div
        ref={carRef}
        style={{
          position: "absolute",
          bottom: "12%",
          left: "35%",
          width: "clamp(240px, 30vw, 500px)",
          zIndex: 20,
        }}
        className="pointer-events-none will-change-transform"
      >
        <picture className="w-full block">
          <source
            type="image/avif"
            srcSet="/assets/landing/a4-car-1280.avif 1280w, /assets/landing/a4-car-960.avif 960w, /assets/landing/a4-car-640.avif 640w"
          />
          <source
            type="image/webp"
            srcSet="/assets/landing/a4-car-1280.webp 1280w, /assets/landing/a4-car-960.webp 960w, /assets/landing/a4-car-640.webp 640w"
          />
          <img
            src="/assets/landing/a4-car-1280.webp"
            alt="Porsche"
            className="w-full h-auto object-contain pointer-events-none drop-shadow-2xl"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>

      {/* 3. Chữ «ĐI THÔI.» đặt ở vùng bầu trời trống phía trên (top: 18%), tuyệt đối KHÔNG đè lên xe */}
      <div
        ref={textRef}
        style={{
          position: "absolute",
          top: "18%",
          left: 0,
          right: 0,
          zIndex: 30,
        }}
        className="flex flex-col items-center justify-center text-center pointer-events-none px-6"
      >
        <h2
          style={{
            fontFamily: "var(--font-archivo, sans-serif)",
            fontSize: "clamp(2.75rem, 7vw, 7rem)",
            lineHeight: 1.05,
          }}
          className="font-black uppercase tracking-tight text-bone-100 drop-shadow-lg"
        >
          «Đi thôi.»
        </h2>
        <p className="font-sans text-sm sm:text-base text-bone-100/90 max-w-md mx-auto mt-4 leading-relaxed drop-shadow">
          Chọn trạm. Chọn giờ. Lên đường cùng cỗ máy của bạn.
        </p>
      </div>

      {/* Khoảng đệm để nội dung không bị che */}
      <div className="h-[70svh] w-full pointer-events-none" />

      {/* 4. 1-Line Minimalist Footer & Attribution (z-40) */}
      <footer
        style={{ position: "relative", zIndex: 40 }}
        className="w-full max-w-6xl mx-auto px-6 sm:px-12 pb-24 pt-12 border-t border-rule space-y-4 text-xs text-bone-100/60"
      >
        {/* CC BY 4.0 Attribution */}
        <div className="leading-relaxed border-b border-rule pb-3 text-[11px] text-bone-100/50">
          <strong className="text-bone-100 font-medium">
            Ghi nhận bản quyền mô hình 3D (CC BY 4.0):
          </strong>{" "}
          1975 Porsche 911 (930) Turbo tác quyền bởi Karol Miklas; Porsche 911 Carrera 4S (2026 Edition) tác quyền bởi Martin Trafas / 3D Automotive Design Lab. Được tích hợp và tối ưu hoá hiển thị theo giấy phép Creative Commons Attribution 4.0 International.
        </div>

        {/* 1-Line Bottom bar matching E2E test assertions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <span>
            © 2026 Hệ thống cho thuê xe Thong Dong. Toàn bộ quyền được bảo lưu. · Liên hệ: support@vrs.vn
          </span>
          <div className="flex items-center gap-6">
            <Link href="/find" className="hover:text-sun-600 transition-colors">
              ĐỘI XE
            </Link>
            <Link href="/facilities" className="hover:text-sun-600 transition-colors">
              CHI NHÁNH
            </Link>
            <Link href="/inspection" className="hover:text-sun-600 transition-colors">
              KIỂM ĐỊNH 3D
            </Link>
          </div>
        </div>
      </footer>
    </section>
  );
}
