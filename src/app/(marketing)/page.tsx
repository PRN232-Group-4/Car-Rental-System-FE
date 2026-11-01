"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { Hero, CinematicPreloader } from "@/features/landing";
import { cormorant, archivo } from "./fonts";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <main
        id="main-content"
        tabIndex={-1}
        data-surface="marketing"
        className={`${cormorant.variable} ${archivo.variable} overflow-x-clip w-full max-w-full min-h-[100dvh] relative text-ink flex flex-col selection:bg-sun-600/20 selection:text-sun-400 bg-canvas focus:outline-none`}
      >
        <CinematicPreloader />

        <Navbar />

        <div className="w-full min-h-[100dvh] flex flex-col">
          <div className="absolute inset-0 pointer-events-none z-0 bg-canvas" />

          <div className="relative z-10 w-full flex flex-col">
            {/* 01. Hero & Live Search Console */}
            <div id="gioi-thieu" className="relative w-full">
              <Hero />
            </div>

            {/* 08. Footer */}
            <div id="lien-he" className="relative w-full border-t border-line">
              <Footer />
            </div>
          </div>
        </div>
      </main>
    </SmoothScrollProvider>
  );
}
