"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/navigation/NavigationLink";
import { X, ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  {
    index: "01",
    label: "ĐỘI XE TUYỂN CHỌN",
    sub: "Porsche · Mercedes-AMG · Lamborghini",
    href: "/find",
    preview: "/assets/posters/poster-bugatti-heritage.webp",
    tag: "ENGINEERING LEGENDS",
  },
  {
    index: "02",
    label: "MẠNG LƯỚI TRẠM",
    sub: "Hệ thống trạm bàn giao trung tâm TP. Hồ Chí Minh",
    href: "/facilities",
    preview: "/assets/landing/scene-a-dalat-full-1920.webp",
    tag: "CENTRAL STATIONS",
  },
  {
    index: "03",
    label: "KIỂM ĐỊNH KỸ THUẬT 3D",
    sub: "Tiêu chuẩn đối soát đa điểm & chìa khóa số",
    href: "/inspection",
    preview: "/assets/posters/poster-mountain-grand-tour.webp",
    tag: "DIGITAL VERIFICATION",
  },
  {
    index: "04",
    label: "GÓI HỘI VIÊN",
    sub: "Đặc quyền linh hoạt theo giờ & dài hạn",
    href: "/subscriptions",
    preview: "/assets/landing/b0-backdrop-1920.webp",
    tag: "PRIVATE MEMBERSHIP",
  },
  {
    index: "05",
    label: "ĐĂNG KÝ THÀNH VIÊN",
    sub: "Xác minh hồ sơ lái xe trực tuyến một lần",
    href: "/register",
    preview: "/assets/posters/poster-mountain-grand-tour.webp",
    tag: "DRIVER ONBOARDING",
  },
  {
    index: "06",
    label: "ĐĂNG NHẬP",
    sub: "Quản lý hành trình & lịch sử đặt xe",
    href: "/login",
    preview: "/assets/landing/scene-a-dalat-full-1920.webp",
    tag: "MEMBER PORTAL",
  },
];

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bladeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useGSAP(
    () => {
      if (!isOpen || !overlayRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        // Unique Diagonal Constructivist Slash Wipe (Zero 5-column shutter repetition!)
        if (stageRef.current) {
          tl.fromTo(
            stageRef.current,
            { clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 0.75,
              ease: "expo.inOut",
            },
            0
          );
        }

        // 3D Split-Flap Mechanical Blade Flip (`rotateX: -80deg -> 0deg`)
        const validBlades = bladeRefs.current.filter(Boolean);
        if (validBlades.length > 0) {
          tl.fromTo(
            validBlades,
            { rotateX: -80, y: 28, opacity: 0 },
            {
              rotateX: 0,
              y: 0,
              opacity: 1,
              duration: 0.75,
              stagger: 0.055,
              ease: "power3.out",
            },
            0.25
          );
        }

        if (previewBoxRef.current) {
          tl.fromTo(
            previewBoxRef.current,
            { x: 40, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8 },
            0.35
          );
        }
      });
    },
    { dependencies: [isOpen], scope: overlayRef }
  );

  if (!isOpen) return null;

  const activeItem = MENU_ITEMS[activeIdx] ?? MENU_ITEMS[0];

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng"
      style={{ zIndex: 85 }}
      className="fixed inset-0 w-full h-[100dvh] select-none overflow-hidden"
    >
      <div
        ref={stageRef}
        className="relative w-full h-full bg-ink-950 text-bone-100 overflow-y-auto overflow-x-hidden flex flex-col justify-between will-change-transform"
      >
        {/* Tactile Lithograph Dust & Constructivist Racing Spine */}
        <div
          aria-hidden="true"
          style={{ mixBlendMode: "screen", opacity: 0.38 }}
          className="fixed inset-0 pointer-events-none"
        >
          <img
            src="/assets/landing/a7-dust-1920.webp"
            alt=""
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        <div
          aria-hidden="true"
          className="hidden lg:block fixed top-0 bottom-0 left-[58.333%] w-3 bg-sun-600 pointer-events-none"
        />

        {/* Top Masthead Bar */}
        <div className="relative z-10 w-full max-w-[1640px] mx-auto px-6 sm:px-12 lg:px-20 pt-7 pb-5 border-b border-bone-100/20 flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="font-display font-black text-2xl sm:text-3xl tracking-tight text-bone-100"
          >
            ThongDong<span className="text-sun-600">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-3 text-[11px] tracking-[0.26em] uppercase font-sans font-bold text-bone-100/60">
            <span>EXHIBITION DIRECTORY</span>
            <span className="w-8 border-t border-bone-100/30" />
            <span className="text-sun-400">01 — 06</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 border border-bone-100/40 bg-ink-800 hover:bg-sun-600 hover:border-sun-600 hover:text-white px-5 py-2.5 text-xs tracking-[0.22em] uppercase font-sans font-bold transition-colors rounded-none cursor-pointer"
          >
            <span>ĐÓNG [ESC]</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center 12-Column Split Constructivist Stage */}
        <div
          style={{ perspective: "1200px" }}
          className="relative z-10 w-full max-w-[1640px] mx-auto px-6 sm:px-12 lg:px-20 py-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          {/* Left 7 Columns: 3D Split-Flap Typographic Index */}
          <nav className="lg:col-span-7 divide-y divide-bone-100/15 border-y border-bone-100/15">
            {MENU_ITEMS.map((item, idx) => {
              const isActive = idx === activeIdx;
              return (
                <div
                  key={item.href}
                  ref={(el) => {
                    bladeRefs.current[idx] = el;
                  }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  style={{ transformOrigin: "top center" }}
                  className="will-change-transform"
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group py-5 sm:py-6 px-4 -mx-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 transition-colors duration-200 hover:bg-bone-100 hover:text-ink-950"
                  >
                    <div className="flex items-baseline gap-5">
                      <span
                        style={{
                          fontFamily: "var(--font-archivo, sans-serif)",
                          fontVariationSettings: "'wdth' 68",
                        }}
                        className={
                          isActive
                            ? "font-black text-2xl sm:text-3xl text-sun-400 group-hover:text-sun-600"
                            : "font-black text-2xl sm:text-3xl text-bone-100/45 group-hover:text-ink-950"
                        }
                      >
                        {item.index}
                      </span>

                      <span
                        style={{
                          fontFamily: "var(--font-archivo, sans-serif)",
                          fontSize: "clamp(1.75rem, 3.3vw, 3.4rem)",
                          lineHeight: 1.08,
                          fontVariationSettings: isActive ? "'wdth' 108" : "'wdth' 88",
                        }}
                        className="font-black uppercase tracking-tight transition-all duration-300 group-hover:translate-x-2"
                      >
                        {item.label}
                      </span>
                    </div>

                    <span className="font-sans text-xs sm:text-sm text-bone-100/65 group-hover:text-ink-950/80 transition-colors">
                      {item.sub}
                    </span>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right 5 Columns: Live Interactive Lithograph Plate Preview */}
          <div
            ref={previewBoxRef}
            className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-bone-100 text-ink-950 p-6 border-2 border-bone-100 will-change-transform"
          >
            <div className="flex items-center justify-between border-b-2 border-ink-950 pb-3 mb-4 text-[11px] tracking-[0.24em] uppercase font-sans font-bold">
              <span>ARCHIVAL PLATE // {activeItem.index}</span>
              <span className="text-sun-600">{activeItem.tag}</span>
            </div>

            <div className="relative w-full aspect-[16/10] overflow-hidden bg-bone-100">
              <img
                src={activeItem.preview}
                alt={activeItem.label}
                className="w-full h-full object-cover object-center transition-transform duration-500 scale-105"
              />
            </div>

            <div className="mt-5 pt-4 border-t-2 border-ink-950 flex items-center justify-between">
              <div>
                <span className="font-display font-black uppercase text-lg text-ink-950 block">
                  {activeItem.label}
                </span>
                <span className="font-sans text-xs text-ink-950/75 block">
                  {activeItem.sub}
                </span>
              </div>
              <span className="w-10 h-10 rounded-full bg-sun-600 text-white flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Constructivist Footer Strip */}
        <div className="relative z-10 w-full max-w-[1640px] mx-auto px-6 sm:px-12 lg:px-20 py-5 border-t border-bone-100/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] tracking-[0.22em] uppercase font-sans text-bone-100/60">
          <div className="flex items-center gap-3">
            <span className="w-3 h-1.5 bg-sun-600 inline-block" />
            <span className="w-3 h-1.5 bg-sun-600 inline-block" />
            <span className="w-3 h-1.5 bg-sun-600 inline-block" />
            <span className="ml-2">THONG DONG · PORSCHE · MERCEDES-AMG · LAMBORGHINI</span>
          </div>
          <span>TP. HỒ CHÍ MINH · SUPPORT@VRS.VN</span>
        </div>
      </div>
    </div>
  );
}
