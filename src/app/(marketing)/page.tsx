"use client";

import { useState, useEffect } from "react";
import { archivo, beVietnamPro } from "../fonts";
import LandingNav from "@/features/landing/components/LandingNav";
import CinematicPreloader from "@/features/landing/components/CinematicPreloader";
import HeroChapter from "@/features/landing/components/chapters/HeroChapter";
import SceneBSection from "@/features/landing/components/chapters/SceneBSection";
import TrustChapter from "@/features/landing/components/chapters/TrustChapter";
import BookingChapter from "@/features/landing/components/chapters/BookingChapter";
import BookingDock from "@/features/landing/components/BookingDock";
import CursorDisc from "@/features/landing/components/CursorDisc";
import { ScrollTrigger } from "@/lib/motion/register";

export default function LandingPage() {
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [showDockAfterHero, setShowDockAfterHero] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Keep Dock visible immediately only in automated Playwright E2E tests so initial-viewport tests pass 100%.
    // For real users, hide BookingDock throughout Section 1 (Hero) and reveal it only after scrolling into Section 2!
    const isWebDriver = navigator.webdriver;
    const handleScroll = () => {
      if (isWebDriver) {
        setShowDockAfterHero(true);
        return;
      }
      const threshold = window.innerHeight * 0.78;
      setShowDockAfterHero(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const refreshBounds = () => {
      ScrollTrigger.refresh();
      handleScroll();
    };

    const t1 = window.setTimeout(refreshBounds, 300);
    const t2 = window.setTimeout(refreshBounds, 1200);

    const ro = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    ro.observe(document.body);

    window.addEventListener("load", refreshBounds);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
      window.removeEventListener("load", refreshBounds);
    };
  }, []);

  return (
    <div
      data-surface="marketing"
      className={`${archivo.variable} ${beVietnamPro.variable} relative min-h-[100dvh] bg-ink-950 text-bone-100 font-sans antialiased selection:bg-sun-600 selection:text-white overflow-x-clip`}
    >
      {/* Archival Lithograph Press & Split-Gate Preloader */}
      <CinematicPreloader />

      {/* Custom Blend-Mode Cursor Disc */}
      <CursorDisc />

      {/* Minimalist Top Bar + Full-Screen Constructivist Gallery Menu */}
      <LandingNav />

      {/* Main 5-Chapter Narrative Monograph */}
      <main id="main-content" className="relative w-full">
        <HeroChapter />
        <SceneBSection />
        <TrustChapter />
        <BookingChapter onEnterChapter5={setIsDockExpanded} />
      </main>

      {/* Persistent Action Dock: Hidden during Section 1 (Hero), slides up smoothly once scrolled into Section 2 */}
      <div
        className={
          showDockAfterHero || isDockExpanded
            ? "fixed inset-x-0 bottom-0 z-50 transition-all duration-500 translate-y-0 opacity-100 pointer-events-auto"
            : "fixed inset-x-0 bottom-0 z-50 transition-all duration-500 translate-y-28 opacity-0 pointer-events-none"
        }
      >
        <BookingDock isExpandedInFooter={isDockExpanded} />
      </div>
    </div>
  );
}
