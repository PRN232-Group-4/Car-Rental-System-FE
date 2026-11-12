"use client";

import { useState, useRef } from "react";
import Link from "@/components/navigation/NavigationLink";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/register";
import MenuOverlay from "@/features/landing/components/MenuOverlay";
import AccountMenu from "./AccountMenu";
import styles from "./Navbar.module.css";

// Same masthead as the landing (LandingNav): wordmark + MENU opening the gallery overlay.
// On paper pages it sits on a solid ink bar so it stays readable.
const BAR_BUTTON = "inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-bone-100 hover:text-sun-400 transition-colors cursor-pointer py-1 px-2.5 border border-bone-100/20 hover:border-sun-400 rounded-none bg-ink-950";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Giữ ngữ cảnh và thương hiệu mà không che khuất nội dung đọc khi người dùng cuộn xuống.
  useGSAP(
    () => {
      const navEl = navRef.current;
      if (!navEl || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(navEl, { yPercent: 0, scale: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const trigger = ScrollTrigger.create({
          start: "top -40",
          onUpdate: (self) => {
            const currentScrollY = self.scroll();
            const scrollingDown = self.direction === 1;
            // Ẩn thanh bar khi cuộn xuống quá 100px, hiện lại ngay khi cuộn ngược lên
            if (scrollingDown && currentScrollY > 100) {
              gsap.to(navEl, {
                yPercent: -120,
                duration: 0.32,
                ease: "power2.inOut",
                overwrite: "auto",
              });
            } else if (!scrollingDown) {
              gsap.to(navEl, {
                yPercent: 0,
                duration: 0.32,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
          },
        });

        return () => trigger.kill();
      });

      return () => mm.revert();
    },
    { scope: navRef }
  );

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-sun-600 focus:text-white font-bold text-xs pointer-events-auto"
        >
          Bỏ qua điều hướng
        </a>
        <nav
          ref={navRef}
          className={`${styles.navbar} w-full bg-ink-950 text-bone-100 border-b border-bone-100/15 pointer-events-auto`}
        >
          <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 py-3 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="font-display text-xl font-black tracking-tight text-bone-100 hover:text-sun-400 transition-colors select-none"
            >
              ThongDong.
            </Link>

            <div className="flex items-center gap-2">
              <AccountMenu open={userMenuOpen} onOpenChange={setUserMenuOpen} buttonClassName={BAR_BUTTON} />

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  setMenuOpen(true);
                }}
                className={BAR_BUTTON}
                aria-label="Mở menu điều hướng"
              >
                Menu
              </button>
            </div>
          </div>
        </nav>
      </header>

      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
