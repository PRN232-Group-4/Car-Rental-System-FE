"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const TRUST_DATA_ROWS = [
  {
    key: "PHÁP NHÂN",
    statement: "DOANH NGHIỆP VẬN TẢI ĐƯỢC CẤP PHÉP",
    source: "[CẦN DỮ LIỆU: Tên pháp nhân, mã số thuế và cơ quan cấp phép vận tải]",
  },
  {
    key: "BẢO HIỂM",
    statement: "BẢO HIỂM VẬT CHẤT VÀ THÂN VỎ TOÀN DIỆN",
    source: "[CẦN DỮ LIỆU: Đơn vị bảo hiểm đối tác và điều khoản bảo lãnh hiện trường]",
  },
  {
    key: "HOÀN CỌC",
    statement: "ĐỐI SOÁT TỰ ĐỘNG MINH BẠCH",
    source: "[CẦN DỮ LIỆU: Quy trình hoàn tiền và hạn mức thời gian qua PayOS]",
  },
  {
    key: "ĐỘI XE",
    statement: "PORSCHE · MERCEDES-AMG · LAMBORGHINI",
    source: "100% phương tiện thuộc sở hữu trực tiếp của đơn vị vận hành; không trung gian.",
  },
];

export default function TrustChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        rowRefs.current.forEach((row) => {
          if (row) gsap.set(row, { opacity: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        rowRefs.current.forEach((row) => {
          if (!row) return;
          gsap.fromTo(
            row,
            { opacity: 0.7, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: row,
                start: "top 90%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="tin-cay"
      className="relative w-full bg-ink-950 text-bone-100 py-16 sm:py-20 px-6 sm:px-12 select-none"
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="mb-12">
          <h2
            style={{
              fontFamily: "var(--font-archivo, sans-serif)",
              fontSize: "var(--fs-statement)",
              lineHeight: 1.1,
            }}
            className="font-black uppercase tracking-tight text-bone-100"
          >
            Tin cậy bằng dữ kiện.
          </h2>
          <p className="font-sans text-sm sm:text-base text-bone-100/70 max-w-2xl mt-3 leading-relaxed">
            Mọi dịch vụ vận hành đều neo trên cam kết có cơ sở và đối soát minh bạch.
          </p>
        </div>

        {/* 12-Column Layout: Cột 1–8 Các hàng dữ kiện, Cột 9–12 Hình xe a4-car gọn max-width 420px */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Cột 1–8: Các hàng dữ kiện */}
          <div className="lg:col-span-8 space-y-8">
            {TRUST_DATA_ROWS.map((row, idx) => (
              <div
                key={row.key}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="relative w-full opacity-100"
              >
                {/* Đường kẻ ngang 1px */}
                <div
                  style={{ borderColor: "rgba(233, 228, 216, 0.25)" }}
                  className="w-full border-t mb-4"
                />

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  {/* Cột 1–3: Tên mục (micro caps) */}
                  <div className="sm:col-span-4">
                    <span
                      style={{
                        fontSize: "var(--fs-micro)",
                        letterSpacing: "var(--ls-micro)",
                      }}
                      className="font-mono font-semibold text-bone-100/60 uppercase block pt-1"
                    >
                      {row.key}
                    </span>
                  </div>

                  {/* Cột 4–12: Nội dung dữ kiện */}
                  <div className="sm:col-span-8 space-y-1">
                    <h3
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                      }}
                      className="font-black text-lg sm:text-xl uppercase tracking-tight text-bone-100 leading-snug"
                    >
                      {row.statement}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-bone-100/60 leading-relaxed">
                      {row.source}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cột 9–12: Hình xe a4-car kích thước gọn max-width 420px (bỏ hộp xám) */}
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="w-full max-w-[420px]">
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
                  alt="Porsche 911"
                  className="w-full h-auto object-contain drop-shadow-2xl pointer-events-none"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
