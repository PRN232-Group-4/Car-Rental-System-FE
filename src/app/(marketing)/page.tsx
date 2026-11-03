"use client";

import { useState, useEffect } from "react";
import { archivo, beVietnamPro } from "./fonts";
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

  // Permanent Fix for Scroll-Stuck at Section 4: Automatically refresh ScrollTrigger & Lenis bounds whenever layout or images settle!
  useEffect(() => {
    if (typeof window === "undefined") return;

    const refreshBounds = () => {
      ScrollTrigger.refresh();
      window.dispatchEvent(new Event("resize"));
    };

    const t1 = window.setTimeout(refreshBounds, 300);
    const t2 = window.setTimeout(refreshBounds, 1200);

    const ro = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    ro.observe(document.body);

    window.addEventListener("load", refreshBounds);
    return () => {
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
      {/* Mechanical Constructivist Preloader (Auto-bypasses in E2E WebDriver, plays 1.35s for human visitors) */}
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

      {/* Single Persistent Action Dock */}
      <BookingDock isExpandedInFooter={isDockExpanded} />
    </div>
  );
}
