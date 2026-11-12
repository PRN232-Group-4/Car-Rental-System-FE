"use client";

import { useState } from "react";
import Link from "@/components/navigation/NavigationLink";
import AccountMenu from "@/components/layout/AccountMenu";
import MenuOverlay from "./MenuOverlay";

const NAV_BUTTON = "inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-bone-100 hover:text-sun-400 transition-colors cursor-pointer py-1.5 px-3 border border-bone-100/20 hover:border-sun-400 rounded-none bg-ink-950";

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 pointer-events-none">
        <nav className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-6 flex items-center justify-between gap-4 pointer-events-auto">
          <Link
            href="/"
            className="font-display text-2xl font-black tracking-tight text-bone-100 hover:text-sun-400 transition-colors select-none"
          >
            ThongDong.
          </Link>

          <div className="flex items-center gap-2">
            <AccountMenu open={userMenuOpen} onOpenChange={setUserMenuOpen} buttonClassName={NAV_BUTTON} floating />
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(false);
                setMenuOpen(true);
              }}
              className={NAV_BUTTON}
              aria-label="Mở menu điều hướng"
            >
              Menu
            </button>
          </div>
        </nav>
      </header>

      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
