"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/register";

interface ChapterItem {
  id: string;
  name: string;
  shortLabel: string;
  href: string;
}

const CHAPTERS: ChapterItem[] = [
  { id: "gioi-thieu", name: "Giới thiệu", shortLabel: "01", href: "#gioi-thieu" },
  { id: "showroom-3d", name: "Showroom 3D", shortLabel: "02", href: "#showroom-3d" },
  { id: "danh-muc-xe", name: "Đội xe", shortLabel: "03", href: "#danh-muc-xe" },
  { id: "chi-nhanh", name: "Mạng lưới trạm", shortLabel: "04", href: "#chi-nhanh" },
  { id: "cong-nghe", name: "Kiểm định 2 chiều", shortLabel: "05", href: "#cong-nghe" },
  { id: "quy-trinh", name: "Quy trình 4 bước", shortLabel: "06", href: "#quy-trinh" },
  { id: "goi-thue-bao", name: "Gói thuê bao", shortLabel: "07", href: "#goi-thue-bao" },
];

/**
 * Clean floating chapter rail on desktop viewport margin.
 * Strictly hidden on mobile (<1024px) to preserve view space.
 * Auto-hides on footer (#lien-he) to avoid overlapping links.
 */
export default function ChapterRail() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const triggers: ScrollTrigger[] = [];

      CHAPTERS.forEach((ch, idx) => {
        const target = document.querySelector(ch.href);
        if (!target) return;

        const st = ScrollTrigger.create({
          trigger: target,
          start: "top center",
          end: "bottom center",
          refreshPriority: -1, // Calculate after pinned sections settle
          onEnter: () => setActiveIndex(idx),
          onEnterBack: () => setActiveIndex(idx),
        });

        triggers.push(st);
      });

      // Auto-hide ChapterRail when scrolling into footer (#lien-he)
      const footer = document.querySelector("#lien-he");
      if (footer) {
        const footerSt = ScrollTrigger.create({
          trigger: footer,
          start: "top 85%",
          end: "bottom bottom",
          refreshPriority: -1,
          onEnter: () => gsap.to(containerRef.current, { autoAlpha: 0, duration: 0.25 }),
          onLeaveBack: () => gsap.to(containerRef.current, { autoAlpha: 1, duration: 0.25 }),
        });
        triggers.push(footerSt);
      }

      return () => {
        triggers.forEach((st) => st.kill());
      };
    },
    { scope: containerRef }
  );

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      ref={containerRef}
      aria-label="Điều hướng theo chương mục"
      className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3 pointer-events-auto select-none"
    >
      {CHAPTERS.map((ch, idx) => {
        const isActive = idx === activeIndex;
        return (
          <a
            key={ch.id}
            href={ch.href}
            onClick={(e) => handleScrollTo(e, ch.href)}
            aria-label={`${ch.name} (Chương ${ch.shortLabel})`}
            aria-current={isActive ? "true" : undefined}
            className="group flex items-center gap-2.5 py-1 px-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
          >
            {/* Label Tooltip: Only visible on hover / focus */}
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all duration-200 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 -translate-x-1 group-hover:translate-x-0 group-focus-visible:translate-x-0 shadow-sm whitespace-nowrap ${
                isActive
                  ? "bg-stage-ink text-white ring-1 ring-white/10"
                  : "bg-surface border border-line-strong text-ink-2"
              }`}
            >
              {ch.name}
            </span>

            {/* Indicator Dot: Always visible, subtle 2.5x2.5 dot */}
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? "w-2.5 h-2.5 bg-primary ring-4 ring-primary/25"
                  : "w-2.5 h-2.5 bg-line-strong group-hover:bg-primary/60"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
