"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

const CHAPTER_3_STEPS = [
  {
    step: "01",
    title: "XÁC MINH TRỰC TUYẾN",
    desc: "Đối chiếu tài khoản và giấy phép lái xe trực tiếp trên nền tảng số chỉ trong một lần duy nhất. Không giữ giấy tờ gốc, không thủ tục bản cứng tại quầy.",
  },
  {
    step: "02",
    title: "NHẬN XE TẠI TRẠM",
    desc: "Phương tiện sẵn sàng tại hệ thống trạm trung tâm sau quy trình kiểm định kỹ thuật đa điểm. Mở khóa kỹ thuật số và khởi hành ngay theo lịch trình của bạn.",
  },
  {
    step: "03",
    title: "TRẢ XE VÀ HOÀN CỌC",
    desc: "Nghiệm thu minh bạch bằng dữ liệu đối soát trực quan ngay khi kết thúc chuyến đi. Toàn bộ khoản đặt cọc được hệ thống hoàn trả tự động qua cổng thanh toán.",
  },
];

export default function SceneBSection() {
  const containerRef = useRef<HTMLElement>(null);

  // Act II Refs (Grand Tour Poster on Warm Archival Paper)
  const act2Ref = useRef<HTMLDivElement>(null);
  const kineticTopLineRef = useRef<HTMLDivElement>(null);
  const kineticBottomLineRef = useRef<HTMLDivElement>(null);
  const posterWrapRef = useRef<HTMLDivElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);

  // Act III Refs (Kinetic Editorial Strips on Warm Archival Paper)
  const act3Ref = useRef<HTMLDivElement>(null);
  const act3HeadingRef = useRef<HTMLHeadingElement>(null);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            kineticTopLineRef.current,
            kineticBottomLineRef.current,
            posterImgRef.current,
            act3HeadingRef.current,
          ],
          { clearProps: "all", opacity: 1 }
        );
        ruleRefs.current.forEach((r) => {
          if (r) gsap.set(r, { scaleX: 1 });
        });
        rowRefs.current.forEach((row) => {
          if (row) gsap.set(row, { opacity: 1, y: 0 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Act II Kinetic Opposing Typography + Poster Scale Scrub
        if (act2Ref.current) {
          const act2Tl = gsap.timeline({
            scrollTrigger: {
              trigger: act2Ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          });

          if (kineticTopLineRef.current) {
            act2Tl.fromTo(
              kineticTopLineRef.current,
              { xPercent: 12 },
              { xPercent: -12, ease: "none" },
              0
            );
          }

          if (kineticBottomLineRef.current) {
            act2Tl.fromTo(
              kineticBottomLineRef.current,
              { xPercent: -10 },
              { xPercent: 10, ease: "none" },
              0
            );
          }

          if (posterImgRef.current) {
            act2Tl.fromTo(
              posterImgRef.current,
              { scale: 0.92, yPercent: 6 },
              { scale: 1.04, yPercent: -6, ease: "none" },
              0
            );
          }
        }

        // 2. Act III Kinetic Editorial Strips Choreography
        if (act3HeadingRef.current) {
          gsap.fromTo(
            act3HeadingRef.current,
            { yPercent: 40, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.9,
              ease: "expo.out",
              scrollTrigger: {
                trigger: act3HeadingRef.current,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        rowRefs.current.forEach((row, idx) => {
          const rule = ruleRefs.current[idx];
          const title = titleRefs.current[idx];
          if (!row) return;

          if (rule) {
            gsap.fromTo(
              rule,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 1.0,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: row,
                  start: "top 88%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }

          if (title) {
            gsap.fromTo(
              title,
              { xPercent: -6, opacity: 0.2 },
              {
                xPercent: 0,
                opacity: 1,
                duration: 0.85,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: row,
                  start: "top 85%",
                  toggleActions: "play none none reverse",
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

  return (
    <section
      ref={containerRef}
      id="cung-duong"
      className="relative w-full scene-b bg-bone-100 text-ink-950 select-none overflow-hidden"
    >
      {/* ================= ACT II: MONUMENTAL POSTER 2 SHOWCASE ON WARM ARCHIVAL PAPER ================= */}
      <div
        ref={act2Ref}
        className="relative w-full pt-24 sm:pt-32 pb-16 sm:pb-24 px-6 sm:px-12 lg:px-20"
      >
        {/* Opposing Kinetic Typography Banner across the Archival Paper Canvas */}
        <div className="max-w-7xl mx-auto overflow-hidden mb-8 sm:mb-12">
          <div
            ref={kineticTopLineRef}
            className="will-change-transform"
          >
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.75rem, 8.2vw, 9.8rem)",
                lineHeight: 0.92,
                fontVariationSettings: "'wdth' 76",
              }}
              className="font-black uppercase tracking-tight text-ink-950 whitespace-nowrap"
            >
              ĐƯỜNG DÀI LÀ ĐỂ
            </h2>
          </div>

          <div
            ref={kineticBottomLineRef}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-2 will-change-transform"
          >
            <p className="font-sans text-sm sm:text-base text-ink-950/80 max-w-md leading-relaxed order-2 md:order-1">
              Hành trình không đo bằng vận tốc tối đa, mà bằng sự tĩnh tại khi làm chủ cỗ máy cơ khí giữa thiên nhiên hùng vĩ.
            </p>
            <span
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "clamp(2.75rem, 8.2vw, 9.8rem)",
                lineHeight: 0.92,
                fontVariationSettings: "'wdth' 118",
              }}
              className="font-black uppercase tracking-tight text-ink-950 whitespace-nowrap order-1 md:order-2 md:ml-auto"
            >
              ĐI CHẬM.
            </span>
          </div>
        </div>

        {/* Seamless Full-Scale Poster 2 Artwork (`mix-blend-mode: multiply` dissolves the paper edge 100% into `bg-bone-100`) */}
        <div
          ref={posterWrapRef}
          className="relative w-full max-w-[1540px] mx-auto overflow-hidden"
        >
          <img
            ref={posterImgRef}
            src="/assets/posters/poster-mountain-grand-tour.webp"
            alt="The Supercar — Speed Meets Nature Lithograph"
            style={{ mixBlendMode: "multiply" }}
            className="w-full h-auto object-contain pointer-events-none will-change-transform"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {/* ================= ACT III: KINETIC EDITORIAL STRIPS ON WARM ARCHIVAL PAPER ================= */}
      <div
        ref={act3Ref}
        id="quy-trinh"
        className="relative w-full py-20 sm:py-28 px-6 sm:px-12 lg:px-20"
      >
        <div className="max-w-7xl mx-auto">
          {/* Monumental Section Heading */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-16">
            <div className="overflow-hidden">
              <h2
                ref={act3HeadingRef}
                style={{
                  fontFamily: "var(--font-archivo, sans-serif)",
                  fontSize: "clamp(3rem, 7.8vw, 9.2rem)",
                  lineHeight: 0.92,
                  fontVariationSettings: "'wdth' 110",
                }}
                className="font-black uppercase tracking-tight text-ink-950 will-change-transform"
              >
                NHẸ NHƯ KHÔNG.
              </h2>
            </div>
            <p className="font-sans text-base sm:text-lg text-ink-950/80 max-w-md leading-relaxed">
              Ba bước chuẩn hóa loại bỏ hoàn toàn ma sát thủ tục hành chính. Nhận xe và hoàn trả bằng điện thoại.
            </p>
          </div>

          {/* 3 Full-Width Kinetic Typographic Strips (Zero Boxes, Pure Editorial Architecture) */}
          <div className="divide-y-0">
            {CHAPTER_3_STEPS.map((item, idx) => (
              <div
                key={item.step}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="group relative w-full py-12 sm:py-16 transition-colors duration-300 hover:bg-ink-950 hover:text-bone-100 px-4 sm:px-8 -mx-4 sm:-mx-8"
              >
                {/* Self-Drawing 2px Woodblock Ink Rule */}
                <div
                  ref={(el) => {
                    ruleRefs.current[idx] = el;
                  }}
                  style={{ transformOrigin: "left center" }}
                  className="absolute top-0 left-0 right-0 h-[2px] bg-ink-950 will-change-transform"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-baseline">
                  {/* Col 1-2: Giant Condensed Index */}
                  <div className="lg:col-span-2">
                    <span
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(3.25rem, 6vw, 6.5rem)",
                        lineHeight: 0.88,
                        fontVariationSettings: "'wdth' 65",
                      }}
                      className="font-black text-ink-950 group-hover:text-bone-100 transition-colors duration-300 block"
                    >
                      {item.step}
                    </span>
                  </div>

                  {/* Col 3-8: Monumental Step Title */}
                  <div
                    className={
                      idx % 2 === 1
                        ? "lg:col-span-6 lg:col-start-4"
                        : "lg:col-span-6 lg:col-start-3"
                    }
                  >
                    <h3
                      ref={(el) => {
                        titleRefs.current[idx] = el;
                      }}
                      style={{
                        fontFamily: "var(--font-archivo, sans-serif)",
                        fontSize: "clamp(2rem, 4.4vw, 4.8rem)",
                        lineHeight: 0.98,
                        fontVariationSettings: "'wdth' 102",
                      }}
                      className="font-black uppercase tracking-tight text-ink-950 group-hover:text-bone-100 transition-transform duration-300 group-hover:translate-x-3 will-change-transform"
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Col 9-12: Crisp Editorial Copy */}
                  <div className="lg:col-span-4 lg:col-start-9">
                    <p className="font-sans text-sm sm:text-base text-ink-950/80 group-hover:text-bone-100/85 leading-relaxed transition-colors duration-300">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {/* Bottom Closing Ink Rule */}
            <div className="w-full h-[2px] bg-ink-950" />
          </div>
        </div>
      </div>
    </section>
  );
}
