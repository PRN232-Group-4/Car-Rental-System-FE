"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";
import manifestData from "../../data/manifest.json";
import type { LayerItem } from "../SceneLayerStack";

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

          const rule = row.querySelector(".hairline-rule");
          const content = row.querySelector(".row-content");

          if (rule) {
            gsap.fromTo(
              rule,
              { scaleX: 0, transformOrigin: "left" },
              {
                scaleX: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: row,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              }
            );
          }

          if (content) {
            gsap.fromTo(
              content,
              { opacity: 0, y: 12 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: row,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              }
            );
          }
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const trustCarLayer = (manifestData.layers as LayerItem[]).find((l) => l.id === "c4-trust-car");

  return (
    <section
      ref={containerRef}
      id="tin-cay"
      className="relative w-full min-h-[100dvh] bg-ink-950 text-bone-100 py-24 sm:py-32 px-6 sm:px-12 select-none"
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="mb-20">
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
          <p className="font-sans text-sm sm:text-base text-bone-100/70 max-w-2xl mt-4 leading-relaxed">
            Mọi dịch vụ vận hành đều neo trên cam kết có cơ sở và đối soát minh bạch.
          </p>
        </div>

        {/* 12-Column Hairline Grid */}
        <div className="space-y-12">
          {TRUST_DATA_ROWS.map((row, idx) => (
            <div
              key={row.key}
              ref={(el) => {
                rowRefs.current[idx] = el;
              }}
              className="relative"
            >
              <div className="hairline-rule w-full border-t border-rule mb-6 will-change-transform" />

              <div className="row-content grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Cột 1–3: Tên mục (micro caps, khóa dữ kiện) */}
                <div className="md:col-span-3">
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

                {/* Cột 4–12: Dữ kiện cỡ lớn kèm nguồn nhỏ */}
                <div className="md:col-span-9 space-y-2">
                  <h3
                    style={{
                      fontFamily: "var(--font-archivo, sans-serif)",
                      fontSize: "clamp(1.25rem, 2.2vw, 2.25rem)",
                      lineHeight: 1.25,
                    }}
                    className="font-black uppercase tracking-tight text-bone-100"
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

        {/* Trust Car Illustration Area (Bản 3.2: c4-trust-car) */}
        <div className="mt-20 pt-12 border-t border-rule flex flex-col items-center">
          <div className="w-full max-w-3xl aspect-[16/9] relative flex items-center justify-center">
            {trustCarLayer?.isPlaceholder ? (
              <div className="w-full h-full border border-rule bg-ink-800/80 text-bone-100/60 font-mono text-xs flex flex-col items-center justify-center p-4 text-center">
                <span className="font-semibold text-sun-600">
                  [THIẾU ASSET: c4-trust-car.png]
                </span>
                <span className="text-[10px] text-bone-100/40 mt-1">
                  Minh họa xe đồ họa phong cách tranh khắc cho chương Tin cậy
                </span>
              </div>
            ) : (
              <picture className="w-full h-full block">
                <img
                  src={trustCarLayer?.variants?.[0]?.webp || "/assets/landing/c4-trust-car.png"}
                  alt="Minh họa xe đội Thong Dong"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
