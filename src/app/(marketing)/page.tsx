"use client";

import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import {
  CinematicPreloader,
  LandingNav,
  BookingDock,
  HeroChapter,
  RoadChapter,
  EffortlessChapter,
  TrustChapter,
  BookingChapter,
} from "@/features/landing";
import { cormorant, archivo } from "./fonts";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <main
        id="main-content"
        tabIndex={-1}
        data-surface="marketing"
        className={`${cormorant.variable} ${archivo.variable} overflow-x-clip w-full max-w-full min-h-[100dvh] relative text-ink-950 flex flex-col selection:bg-sun-600/20 selection:text-sun-400 bg-ink-950 focus:outline-none pb-24 sm:pb-32`}
      >
        <CinematicPreloader />

        <LandingNav />

        {/* 01. Chương I: Hero — Siêu xe. Không vội. */}
        <HeroChapter />

        {/* 02. Chương II: Cung đường — Đường dài là để đi chậm. */}
        <RoadChapter />

        {/* 03. Chương III: Trải nghiệm — Nhẹ như không. */}
        <EffortlessChapter />

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
