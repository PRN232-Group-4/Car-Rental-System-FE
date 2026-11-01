"use client";

import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import LandingNav from "@/features/landing/components/LandingNav";
import BookingDock from "@/features/landing/components/BookingDock";
import CursorDisc from "@/features/landing/components/CursorDisc";
import ScrollDiscTransition from "@/features/landing/components/ScrollDiscTransition";
import HeroChapter from "@/features/landing/components/chapters/HeroChapter";
import RoadChapter from "@/features/landing/components/chapters/RoadChapter";
import EffortlessChapter from "@/features/landing/components/chapters/EffortlessChapter";
import TrustChapter from "@/features/landing/components/chapters/TrustChapter";
import BookingChapter from "@/features/landing/components/chapters/BookingChapter";
import { cormorant, archivo } from "./fonts";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <main
        id="main-content"
        tabIndex={-1}
        data-surface="marketing"
        className={`${cormorant.variable} ${archivo.variable} overflow-x-clip w-full max-w-full min-h-[100dvh] relative text-ink-950 flex flex-col selection:bg-sun-600/20 selection:text-sun-400 bg-ink-950 focus:outline-none pb-24 sm:pb-32 cursor-default`}
      >
        <CursorDisc />

        <LandingNav />

        {/* 01. Chương I: Hero — Siêu xe. Không vội. */}
        <HeroChapter />

        {/* Scroll Disc Transition into Lake */}
        <ScrollDiscTransition color="lake" />

        {/* 02. Chương II: Cung đường — Đường dài là để đi chậm. */}
        <RoadChapter />

        {/* Scroll Disc Transition into Sun */}
        <ScrollDiscTransition color="sun" />

        {/* 03. Chương III: Trải nghiệm — Nhẹ như không. */}
        <EffortlessChapter />

        {/* Scroll Disc Transition into Ink */}
        <ScrollDiscTransition color="ink" />

        {/* 04. Chương IV: Cam kết — Tin cậy bằng dữ kiện. */}
        <TrustChapter />

        {/* 05. Chương V: Khởi hành — Chọn xe. Chọn ngày. Lên đường. */}
        <BookingChapter />

        {/* Single Action CTA: Booking Dock */}
        <BookingDock />
      </main>
    </SmoothScrollProvider>
  );
}
