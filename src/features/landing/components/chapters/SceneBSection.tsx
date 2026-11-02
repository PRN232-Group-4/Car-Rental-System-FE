"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const CHAPTER_3_STEPS = [
  {
    step: "01",
    title: "XÁC MINH SỐ HÓA",
    desc: "Đối chiếu tài khoản và hồ sơ lái xe trực tiếp bằng điện thoại. [CẦN DỮ LIỆU: cơ chế đối chiếu định danh tự động và thời gian hoàn tất].",
  },
  {
    step: "02",
    title: "NHẬN XE",
    desc: "Chìa khóa số kích hoạt sau biên bản kiểm định tình trạng thực tế. [CẦN DỮ LIỆU: danh sách điểm nhận xe và quy trình bàn giao vật lý].",
  },
  {
    step: "03",
    title: "TRẢ XE VÀ HOÀN CỌC",
    desc: "Nghiệm thu minh bạch bằng hình ảnh đối soát. Toàn bộ tiền cọc hoàn trả theo hạn mức quy định. [CẦN DỮ LIỆU: thời gian cam kết đối soát PayOS].",
  },
];

export default function SceneBSection() {
  const containerRef = useRef<HTMLElement>(null);
  const ch2TitleRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (ch2TitleRef.current) gsap.set(ch2TitleRef.current, { opacity: 1, y: 0 });
        if (carRef.current) gsap.set(carRef.current, { opacity: 1 });
        rowRefs.current.forEach((row) => {
          if (row) gsap.set(row, { opacity: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Subtle scroll parallax on car
        if (carRef.current) {
          gsap.to(carRef.current, {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
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
      className="relative w-full scene-b bg-ink-950 text-bone-100 select-none"
    >
      {/* ================= CHƯƠNG 2: CUNG ĐƯỜNG HẢI VÂN ================= */}
      <div className="relative w-full min-h-[90svh] flex flex-col justify-center px-6 sm:px-12 md:px-16 overflow-hidden">
        {/* Nền tranh Cảnh B nguyên bản liền mạch (object-cover object-center, z-10) */}
        <picture className="absolute inset-0 w-full h-full block pointer-events-none" style={{ zIndex: 10 }}>
          <source
            type="image/avif"
            srcSet="/assets/landing/b0-backdrop-3840.avif 3840w, /assets/landing/b0-backdrop-2880.avif 2880w, /assets/landing/b0-backdrop-1920.avif 1920w, /assets/landing/b0-backdrop-1280.avif 1280w, /assets/landing/b0-backdrop-960.avif 960w, /assets/landing/b0-backdrop-640.avif 640w"
          />
          <source
            type="image/webp"
            srcSet="/assets/landing/b0-backdrop-3840.webp 3840w, /assets/landing/b0-backdrop-2880.webp 2880w, /assets/landing/b0-backdrop-1920.webp 1920w, /assets/landing/b0-backdrop-1280.webp 1280w, /assets/landing/b0-backdrop-960.webp 960w, /assets/landing/b0-backdrop-640.webp 640w"
          />
          <img
            src="/assets/landing/b0-backdrop-1920.webp"
            alt="Đèo Hải Vân"
            className="w-full h-full object-cover object-center pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </picture>

        {/* Lớp xe b4-car (z-20): Khóa kích thước clamp(260px, 30vw, 500px) ở góc dưới bên phải */}
        <div
          ref={carRef}
          style={{
            position: "absolute",
            bottom: "10%",
            right: "6%",
            width: "clamp(260px, 30vw, 500px)",
            zIndex: 20,
          }}
          className="pointer-events-none will-change-transform"
        >
          <picture className="w-full block">
            <source
              type="image/avif"
              srcSet="/assets/landing/b4-car-2000.avif 2000w, /assets/landing/b4-car-1920.avif 1920w, /assets/landing/b4-car-1280.avif 1280w, /assets/landing/b4-car-960.avif 960w, /assets/landing/b4-car-640.avif 640w"
            />
            <source
              type="image/webp"
              srcSet="/assets/landing/b4-car-2000.webp 2000w, /assets/landing/b4-car-1920.webp 1920w, /assets/landing/b4-car-1280.webp 1280w, /assets/landing/b4-car-960.webp 960w, /assets/landing/b4-car-640.webp 640w"
            />
            <img
              src="/assets/landing/b4-car-1280.webp"
              alt="Mercedes-AMG"
              className="w-full h-auto object-contain pointer-events-none drop-shadow-2xl"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>

        {/* Lớp sương b5-mist (z-25, screen, opacity 0.35) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 25,
            mixBlendMode: "screen",
            opacity: 0.35,
          }}
          className="w-full h-full pointer-events-none"
        >
          <img
            src="/assets/landing/b5-mist-1920.webp"
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Tiêu đề Chương 2 (z-30): Hiển thị rõ ràng 100%, không bị che khuất */}
        <div
          ref={ch2TitleRef}
          style={{ zIndex: 30 }}
          className="relative max-w-2xl text-left pointer-events-none py-16"
        >
          <h2
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "var(--fs-statement)",
              lineHeight: 1.1,
            }}
            className="font-black uppercase tracking-tight text-bone-100 drop-shadow-md"
          >
            «Đường dài là để đi chậm.»
          </h2>
          <p className="font-sans text-sm sm:text-base text-bone-100/90 max-w-lg mt-4 leading-relaxed drop-shadow">
            Chiếc xe là không gian để tĩnh lặng. Cung đường là đích đến.
          </p>
        </div>
      </div>

      {/* ================= CHƯƠNG 3: QUY TRÌNH MINH BẠCH ================= */}
      <div id="quy-trinh" className="relative w-full bg-ink-950 py-20 sm:py-24 px-6 sm:px-12 md:px-16" style={{ zIndex: 30 }}>
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Tiêu đề Chương 3 */}
          <div className="mb-12">
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "var(--fs-statement)",
                lineHeight: 1.1,
              }}
              className="font-black uppercase tracking-tight text-bone-100"
            >
              Đến nơi. Không phải kết thúc.
            </h2>
            <p className="font-sans text-sm sm:text-base text-bone-100/70 max-w-xl mt-3 leading-relaxed">
              Mọi quy trình bàn giao và nghiệm thu được số hóa liền mạch, rõ ràng.
            </p>
          </div>

          {/* 3 Hàng Hairline Grid (01 / 02 / 03) */}
          <div className="space-y-10 w-full">
            {CHAPTER_3_STEPS.map((item, idx) => (
              <div
                key={item.step}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="relative w-full opacity-100"
              >
                {/* Đường kẻ ngang 1px chạy hết chiều ngang container */}
                <div
                  style={{ borderColor: "rgba(233, 228, 216, 0.25)" }}
                  className="w-full border-t mb-6"
                />

                {/* Lưới 12 cột */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-2">
                    <span className="font-display font-black text-3xl sm:text-4xl text-bone-100/70 block">
                      {item.step}
                    </span>
                  </div>
                  <div className="md:col-span-10 space-y-2">
                    <h3
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(1.5rem, 3.2vw, 2.5rem)",
                        lineHeight: 1.15,
                      }}
                      className="font-black uppercase tracking-tight text-bone-100"
                    >
                      {item.title}
                    </h3>
                    <p className="font-sans text-sm sm:text-base text-bone-100/80 max-w-3xl leading-relaxed">
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
