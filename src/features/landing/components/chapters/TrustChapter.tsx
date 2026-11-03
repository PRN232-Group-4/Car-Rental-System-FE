"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const TRUST_VAULTS = [
  {
    index: "01",
    key: "PHÁP NHÂN VẬN TẢI",
    metric: "100% HỢP ĐỒNG SỐ",
    statement: "DOANH NGHIỆP VẬN TẢI ĐƯỢC CẤP PHÉP",
    source: "Hợp đồng thuê xe điện tử có giá trị pháp lý toàn diện · Hồ sơ pháp nhân minh bạch.",
    dark: true,
  },
  {
    index: "02",
    key: "BẢO HIỂM TOÀN DIỆN",
    metric: "BẢO LÃNH HIỆN TRƯỜNG 24/7",
    statement: "BẢO HIỂM VẬT CHẤT VÀ THÂN VỎ 100%",
    source: "Mọi chuyến đi đều đi kèm gói bảo hiểm vật chất xe và hỗ trợ kỹ thuật hiện trường.",
    dark: false,
  },
  {
    index: "03",
    key: "HOÀN CỌC MINH BẠCH",
    metric: "TỰ ĐỘNG QUA PAYOS",
    statement: "ĐỐI SOÁT TỰ ĐỘNG QUA CỔNG PAYOS",
    source: "Biên bản kiểm định số hóa đối chiếu trước và sau chuyến đi · Không phát sinh phí ẩn.",
    dark: false,
  },
  {
    index: "04",
    key: "ĐỘI XE TUYỂN CHỌN",
    metric: "SỞ HỮU TRỰC TIẾP",
    statement: "PORSCHE · MERCEDES-AMG · LAMBORGHINI",
    source: "100% phương tiện thuộc đội xe chuẩn hóa, bảo dưỡng định kỳ theo tiêu chuẩn hãng.",
    dark: true,
  },
];

export default function TrustChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const vaultRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (leftDoorRef.current) gsap.set(leftDoorRef.current, { scaleX: 0 });
        if (rightDoorRef.current) gsap.set(rightDoorRef.current, { scaleX: 0 });
        gsap.set([spineRef.current, posterImgRef.current, headingRef.current], {
          clearProps: "all",
          opacity: 1,
        });
        vaultRefs.current.forEach((v) => {
          if (v) gsap.set(v, { clearProps: "all", opacity: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. UNIQUE Section 3 -> Section 4 Transition: Horizontal Split Barn-Door Reveal (Two dark ink doors slide open to the left and right!)
        if (leftDoorRef.current && rightDoorRef.current) {
          gsap.fromTo(
            [leftDoorRef.current, rightDoorRef.current],
            { scaleX: 1 },
            {
              scaleX: 0,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 95%",
                end: "top 30%",
                scrub: true,
              },
            }
          );
        }

        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        if (spineRef.current) {
          masterTl.fromTo(
            spineRef.current,
            { scaleY: 0 },
            { scaleY: 1, ease: "none" },
            0
          );
        }

        if (posterImgRef.current) {
          masterTl.fromTo(
            posterImgRef.current,
            { scale: 0.93 },
            { scale: 1.03, ease: "none" },
            0
          );
        }

        if (headingRef.current) {
          masterTl.fromTo(
            headingRef.current,
            { xPercent: -6 },
            { xPercent: 4, ease: "none" },
            0
          );
        }

        // 2. 3D Unfolding Constructivist Vault Modules (`rotateX: -55deg -> 0deg` + opposing horizontal slide!)
        vaultRefs.current.forEach((vault, idx) => {
          if (!vault) return;
          const fromX = idx % 2 === 0 ? -40 : 40;

          gsap.fromTo(
            vault,
            { rotateX: -50, x: fromX, y: 48, opacity: 0.15 },
            {
              rotateX: 0,
              x: 0,
              y: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: vault,
                start: "top 95%",
                end: "top 42%",
                scrub: true,
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
      className="relative w-full bg-bone-100 text-ink-950 py-24 sm:py-36 px-8 sm:px-14 lg:px-24 select-none overflow-hidden border-t-4 border-lake-600"
    >
      {/* UNIQUE Section 3 -> 4 Transition: Horizontal Split Barn-Doors (Zero 5-Column Shutter Repetition!) */}
      <div
        aria-hidden="true"
        style={{ zIndex: 40 }}
        className="absolute inset-x-0 top-0 h-[36svh] grid grid-cols-2 pointer-events-none"
      >
        <div
          ref={leftDoorRef}
          style={{ transformOrigin: "left center" }}
          className="w-full h-full bg-ink-950 border-r-2 border-lake-400 will-change-transform"
        />
        <div
          ref={rightDoorRef}
          style={{ transformOrigin: "right center" }}
          className="w-full h-full bg-ink-950 border-l-2 border-lake-400 will-change-transform"
        />
      </div>

      {/* Tactile Inverted Paper Fiber Texture + Continuous Racing Blue Central Spine */}
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
        ref={spineRef}
        aria-hidden="true"
        style={{ transformOrigin: "top center" }}
        className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-lake-600/25 pointer-events-none will-change-transform"
      />

      {/* CRITICAL: Direct bg-bone-100 without z-index isolation so Poster 1 blends 100.0% into #E9E4D8! */}
      <div className="max-w-[1600px] mx-auto bg-bone-100 space-y-16 sm:space-y-20">
        {/* 1. Editorial Exhibition Header */}
        <div className="border-b-2 border-ink-950 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div ref={headingRef} className="will-change-transform">
            <span className="text-xs tracking-[0.28em] uppercase font-sans font-bold text-lake-600 block mb-3">
              04 // ENGINEERING HERITAGE & VERIFIED TRUST
            </span>
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.75rem, 6.8vw, 8.2rem)",
                lineHeight: 1.14,
                fontVariationSettings: "'wdth' 98",
              }}
              className="font-black uppercase tracking-tight text-ink-950 pt-[0.14em]"
            >
              TIN CẬY BẰNG <span className="text-lake-600">DỮ KIỆN.</span>
            </h2>
          </div>

          <p className="font-sans text-base sm:text-lg text-ink-950/85 max-w-md leading-relaxed font-medium border-l-4 border-lake-600 pl-5">
            Không dùng lời hứa quảng cáo. Mọi chuyến đi đều được bảo chứng bằng pháp nhân rõ ràng, bảo hiểm vật chất toàn diện và cơ chế hoàn cọc tự động.
          </p>
        </div>

        {/* 2. Deterministic 16:9 Container + Seamless Poster 1 Masterpiece (`brightness(1.16) contrast(1.14)` + `multiply` on direct `bg-bone-100` parent = ZERO White Box!) */}
        <div className="w-full max-w-[1520px] mx-auto aspect-[16/9] bg-bone-100 overflow-hidden">
          <img
            ref={posterImgRef}
            src="/assets/posters/poster-bugatti-heritage.webp"
            alt="Engineering Heritage Constructivist Lithograph"
            style={{
              mixBlendMode: "multiply",
              filter: "brightness(1.16) contrast(1.14)",
            }}
            className="w-full h-full block object-contain pointer-events-none"
            decoding="async"
          />
        </div>

        {/* 3. Staggered 3D Unfolding Constructivist Vault Matrix (Completely distinct from Section 3's 3-Card Deck!) */}
        <div
          style={{ perspective: "1400px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 pt-4"
        >
          {TRUST_VAULTS.map((vault, idx) => (
            <div
              key={vault.key}
              ref={(el) => {
                vaultRefs.current[idx] = el;
              }}
              style={{ transformOrigin: "top center" }}
              className={
                vault.dark
                  ? "relative p-8 sm:p-12 bg-ink-950 text-bone-100 border-2 border-ink-950 border-t-8 border-t-lake-400 flex flex-col justify-between shadow-xl will-change-transform"
                  : "relative p-8 sm:p-12 bg-bone-100 text-ink-950 border-2 border-ink-950 border-t-8 border-t-sun-600 flex flex-col justify-between shadow-xl will-change-transform"
              }
            >
              <div className="flex items-start justify-between border-b border-current/20 pb-6 mb-8">
                <div className="space-y-1.5">
                  <span
                    style={{
                      fontSize: "var(--fs-micro)",
                      letterSpacing: "var(--ls-micro)",
                    }}
                    className={
                      vault.dark
                        ? "font-sans font-bold text-lake-400 uppercase block"
                        : "font-sans font-bold text-lake-600 uppercase block"
                    }
                  >
                    {vault.key}
                  </span>
                  <span className="text-[11px] tracking-[0.22em] uppercase font-sans font-bold opacity-70 block">
                    {vault.metric}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(3.75rem, 6vw, 6.5rem)",
                    lineHeight: 0.88,
                    fontVariationSettings: "'wdth' 64",
                  }}
                  className={
                    vault.dark
                      ? "font-black text-lake-400"
                      : "font-black text-sun-600"
                  }
                >
                  {vault.index}
                </span>
              </div>

              <div className="space-y-3">
                <h3
                  style={{
                    fontFamily: "var(--font-archivo, sans-serif)",
                    fontSize: "clamp(1.85rem, 3vw, 3.1rem)",
                    lineHeight: 1.1,
                    fontVariationSettings: "'wdth' 98",
                  }}
                  className="font-black uppercase tracking-tight"
                >
                  {vault.statement}
                </h3>

                <p className="font-sans text-sm sm:text-base opacity-85 leading-relaxed">
                  {vault.source}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-current/15 flex items-center justify-between text-[10px] tracking-[0.24em] uppercase font-sans font-bold opacity-60">
                <span>VERIFIED PROTOCOL // {vault.index}</span>
                <span>/////</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
