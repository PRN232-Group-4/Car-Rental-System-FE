"use client";

import { useState } from "react";
import Link from "@/components/navigation/NavigationLink";
import MenuOverlay from "./MenuOverlay";

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 pointer-events-none">
        <nav className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-6 flex items-center justify-between pointer-events-auto">
          <Link
            href="/"
            className="font-display text-2xl font-black tracking-tight text-bone-100 hover:text-sun-400 transition-colors select-none"
          >
            ThongDong.
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="text-xs font-mono uppercase tracking-widest text-bone-100 hover:text-sun-400 transition-colors cursor-pointer py-1.5 px-3 border border-bone-100/20 hover:border-sun-400 rounded-none bg-ink-950"
            aria-label="Mở menu điều hướng"
          >
            Menu
          </button>
        </nav>
      </header>

      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
