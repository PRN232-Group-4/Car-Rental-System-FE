"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 sm:px-6">
      <nav className="glass-nav specular-border w-full max-w-6xl rounded-2xl px-5 py-3 transition-all duration-300">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Name & Logo - Unified Single Row Lockup without rounded box */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group whitespace-nowrap py-0.5 select-none">
            <Image
              src="/logo-car.png"
              alt="Thong Dong Logo"
              width={48}
              height={22}
              className="h-5 sm:h-6 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-[#059669] transition-colors">
              Thong Dong
            </span>
          </Link>

          {/* Desktop Navigation Links - Text Only, 1 Single Row */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 whitespace-nowrap">
            <a
              href="#tim-xe"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-[#059669] rounded-xl hover:bg-white/60 transition-colors"
            >
              Thuê xe
            </a>
            <a
              href="#chi-nhanh"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-[#059669] rounded-xl hover:bg-white/60 transition-colors"
            >
              Chi nhánh
            </a>
            <a
              href="#goi-thue-bao"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-[#059669] rounded-xl hover:bg-white/60 transition-colors"
            >
              Gói thuê bao
            </a>
            <a
              href="#quy-trinh"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-[#059669] rounded-xl hover:bg-white/60 transition-colors"
            >
              Hướng dẫn
            </a>
            <a
              href="#kiem-dinh"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-[#059669] rounded-xl hover:bg-white/60 transition-colors"
            >
              Kiểm định
            </a>
          </div>

          {/* Right Action buttons - Text Only, 1 Single Row */}
          <div className="hidden sm:flex items-center gap-2.5 whitespace-nowrap">
            <button
              type="button"
              className="px-3.5 py-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Đăng nhập
            </button>
            <a
              href="#tim-xe"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-md shadow-[#059669]/25 hover:shadow-lg hover:shadow-[#059669]/35 transition-all duration-300 cursor-pointer"
            >
              Đăng ký
            </a>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 flex items-center justify-center text-neutral-700 hover:text-neutral-900 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div id="mobile-nav-menu" className="md:hidden pt-4 pb-2 border-t border-neutral-200/60 mt-3 space-y-1">
            <a
              href="#tim-xe"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Thuê xe
            </a>
            <a
              href="#chi-nhanh"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Chi nhánh
            </a>
            <a
              href="#goi-thue-bao"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Gói thuê bao
            </a>
            <a
              href="#quy-trinh"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Hướng dẫn
            </a>
            <a
              href="#kiem-dinh"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Phiếu kiểm định xe
            </a>
            <div className="pt-3 border-t border-neutral-200/60 flex flex-col gap-2">
              <button
                type="button"
                className="w-full py-2.5 text-sm font-semibold text-neutral-700 bg-neutral-100 rounded-xl"
              >
                Đăng nhập
              </button>
              <a
                href="#tim-xe"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-sm font-semibold text-center text-white bg-[#059669] rounded-xl"
              >
                Đăng ký tài khoản
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
