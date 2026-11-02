"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";
import SceneLayerStack from "../SceneLayerStack";

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
  const stageRef = useRef<HTMLDivElement>(null);

  // Layers in Scene B
  const backdropRef = useRef<HTMLDivElement>(null);
  const cliffRoadRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const rocksRef = useRef<HTMLDivElement>(null);

  // Headlines in headline-slot
  const ch2TitleRef = useRef<HTMLDivElement>(null);
  const ch3TitleRef = useRef<HTMLDivElement>(null);

  // Rows in flow
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (ch2TitleRef.current) gsap.set(ch2TitleRef.current, { opacity: 1, y: 0 });
        if (ch3TitleRef.current) gsap.set(ch3TitleRef.current, { opacity: 0 });
        if (mistRef.current) gsap.set(mistRef.current, { opacity: 0.6 });
        rowRefs.current.forEach((row) => {
          if (row) gsap.set(row, { opacity: 1 });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Sticky stage ScrollTrigger
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            pin: false,
          },
        });

        // 0 – 0.15: Tiêu đề chương 2 vào
        if (ch2TitleRef.current) {
          tl.fromTo(
            ch2TitleRef.current,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
            0
          );
        }

        // Car scale 0.92 -> 1.04 và dịch chuyển nhẹ
        if (carRef.current) {
          tl.fromTo(
            carRef.current,
            { scale: 0.92, yPercent: 4 },
            { scale: 1.04, yPercent: -4, duration: 1, ease: "none" },
            0
          );
        }

        // Parallax lớp đá tiền cảnh b6 và nền b0
        if (rocksRef.current) {
          tl.to(rocksRef.current, { yPercent: -20, ease: "none", duration: 1 }, 0);
        }
        if (backdropRef.current) {
          tl.to(backdropRef.current, { yPercent: -8, ease: "none", duration: 1 }, 0);
        }

        // 0.30 – 0.45: Typography handoff:
        // Tiêu đề Ch2 trượt lên và mờ dần
        if (ch2TitleRef.current) {
          tl.to(
            ch2TitleRef.current,
            { opacity: 0, y: -40, duration: 0.12, ease: "power2.in" },
            0.30
          );
        }

        // Tiêu đề Ch3 mọc từ dưới lên trong headline-slot
        if (ch3TitleRef.current) {
          tl.fromTo(
            ch3TitleRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
            0.33
          );

          // 0.45 – 0.55: Tiêu đề Ch3 trượt lên và ẩn đi để nhường chỗ cho .rows-ch3
          tl.to(
            ch3TitleRef.current,
            { opacity: 0, y: -48, duration: 0.10, ease: "power2.in" },
            0.45
          );
        }

        // 0.40 – 0.90: Sương b5-mist dày dần (opacity 0.4 -> 0.8)
        if (mistRef.current) {
          tl.fromTo(
            mistRef.current,
            { opacity: 0.4 },
            { opacity: 0.8, duration: 0.50, ease: "none" },
            0.40
          );
        }
      });

      // Hairline rows self-draw and active center row highlighting
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
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        if (content) {
          gsap.fromTo(
            content,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: 0.15,
              ease: "power2.out",
              scrollTrigger: {
                trigger: row,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        // Focus opacity 1 ở giữa màn hình, 0.25 ở xa
        gsap.to(row, {
          opacity: 1,
          scrollTrigger: {
            trigger: row,
            start: "top center+=100",
            end: "bottom center-=100",
            toggleActions: "play reverse play reverse",
            onEnter: () => gsap.to(row, { opacity: 1, duration: 0.3 }),
            onLeave: () => gsap.to(row, { opacity: 0.25, duration: 0.3 }),
            onEnterBack: () => gsap.to(row, { opacity: 1, duration: 0.3 }),
            onLeaveBack: () => gsap.to(row, { opacity: 0.25, duration: 0.3 }),
          },
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
      className="relative w-full scene-b bg-ink-950 text-bone-100 select-none"
    >
      {/*
        .stage: position: sticky; top: 0; height: 100svh; margin-bottom: -100svh; overflow: hidden;
        Bên trong là các lớp b0–b6 (z 10–50) và .headline-slot
      */}
      <div
        ref={stageRef}
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          marginBottom: "-100svh",
          overflow: "hidden",
        }}
        className="w-full stage"
      >
        <SceneLayerStack
          scene="B"
          className="absolute inset-0 w-full h-full"
          layerRefs={{
            "b0-backdrop": backdropRef,
            "b3-cliff-road": cliffRoadRef,
            "b4-car": carRef,
            "b5-mist": mistRef,
            "b6-fg-rocks": rocksRef,
          }}
        />

        {/* .headline-slot: hai tiêu đề chương 2 và 3 xếp chồng tuyệt đối (z-60) */}
        <div
          style={{ zIndex: 60 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none px-6 text-center"
        >
          {/* Chương 2 Tiêu đề */}
          <div
            ref={ch2TitleRef}
            className="max-w-4xl mx-auto will-change-transform"
          >
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "var(--fs-statement)",
                lineHeight: 1.1,
              }}
              className="font-black uppercase tracking-tight text-bone-100"
            >
              «Đường dài là để đi chậm.»
            </h2>
            <p className="font-sans text-sm sm:text-base text-bone-100/70 max-w-xl mx-auto mt-4 leading-relaxed">
              Chiếc xe là không gian để tĩnh lặng. Cung đường là đích đến.
            </p>
          </div>

          {/* Chương 3 Tiêu đề Typography Handoff */}
          <div
            ref={ch3TitleRef}
            className="absolute max-w-4xl mx-auto will-change-transform opacity-0"
          >
            <h2
              style={{
                fontFamily: "var(--font-archivo, sans-serif)",
                fontSize: "var(--fs-statement)",
                lineHeight: 1.1,
              }}
              className="font-black uppercase tracking-tight text-bone-100"
            >
              XÁC MINH · NHẬN XE · TRẢ XE
            </h2>
          </div>
        </div>
      </div>

      {/*
        .flow: nội dung cuộn bình thường, position: relative, z-index 60,
        gồm khoảng đệm ~160vh cho chương 2 rồi các hàng hairline của chương 3
      */}
      <div
        style={{ position: "relative", zIndex: 60 }}
        className="flow w-full pointer-events-auto"
      >
        {/* Khoảng đệm cho cảnh và tiêu đề Chương 2 */}
        <div className="spacer-ch2 h-[150vh] w-full pointer-events-none" />

        {/* Các hàng hairline của Chương 3 */}
        <div className="rows-ch3 w-full max-w-6xl mx-auto px-6 sm:px-12 pb-32 space-y-16">
          {CHAPTER_3_STEPS.map((item, idx) => (
            <div
              key={item.step}
              ref={(el) => {
                rowRefs.current[idx] = el;
              }}
              className="group relative transition-opacity duration-300 opacity-25"
            >
              {/* Hairline rule 1px self-drawing from left to right */}
              <div className="hairline-rule w-full border-t border-rule mb-6 will-change-transform" />

              {/* Lưới 12 cột bất đối xứng: Cột 1-2 số bước, Cột 3-12 tuyên ngôn, Cột 3-8 mô tả */}
              <div className="row-content grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-2">
                  <span className="font-display font-black text-3xl sm:text-4xl text-bone-100/60 block">
                    {item.step}
                  </span>
                </div>
                <div className="md:col-span-10 space-y-3">
                  <h3
                    style={{
                      fontFamily: "var(--font-archivo, sans-serif)",
                      fontSize: "clamp(1.75rem, 3.8vw, 3.5rem)",
                      lineHeight: 1.15,
                    }}
                    className="font-black uppercase tracking-tight text-bone-100"
                  >
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm sm:text-base text-bone-100/70 max-w-2xl leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
