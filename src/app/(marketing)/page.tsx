"use client";

import { useState } from "react";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import LandingNav from "@/features/landing/components/LandingNav";
import BookingDock from "@/features/landing/components/BookingDock";
import CursorDisc from "@/features/landing/components/CursorDisc";
import HeroChapter from "@/features/landing/components/chapters/HeroChapter";
import SceneBSection from "@/features/landing/components/chapters/SceneBSection";
import TrustChapter from "@/features/landing/components/chapters/TrustChapter";
import BookingChapter from "@/features/landing/components/chapters/BookingChapter";
import { archivo } from "./fonts";

export default function Home() {
  const [isChapter5Active, setIsChapter5Active] = useState(false);

  return (
    <SmoothScrollProvider>
      <main
        id="main-content"
        tabIndex={-1}
        data-surface="marketing"
        className={`${archivo.variable} overflow-x-clip w-full max-w-full min-h-[100svh] relative text-bone-100 flex flex-col selection:bg-sun-600/30 selection:text-white bg-ink-950 focus:outline-none cursor-default`}
      >
        {/* Subtle Cursor Disc (14px difference, hidden on touch/reduced-motion) */}
        <CursorDisc />

        {/* Minimalist Landing Navigation (Logo + Menu text link) */}
        <LandingNav />

        {/* Chương 1: Hero (Cảnh A - Đà Lạt bình minh, đan xen z-index đa bình diện) */}
        <HeroChapter />

        {/* Chương 2 & 3: Cung đường & Nhẹ như không (Cảnh B - Sticky Stage, Typography Handoff) */}
        <SceneBSection />

        {/* Chương 4: Tin cậy (Hairline Grid 12 cột, micro caps keys, c4-trust-car) */}
        <TrustChapter />

        {/* Chương 5: Đặt xe (Cảnh A Outro - Mặt trời hạ, Dock mở rộng, CC-BY Footer) */}
        <BookingChapter onEnterChapter5={setIsChapter5Active} />

        {/* Single Action CTA: Booking Dock (Nút đĩa sun-600 72px duy nhất) */}
        <BookingDock isExpanded={isChapter5Active} />
      </main>
    </SmoothScrollProvider>
  );
}
