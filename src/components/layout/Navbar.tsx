"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Car,
  Package,
  FileText,
  CreditCard,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { useMounted } from "@/hooks/use-mounted";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mounted = useMounted();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
        if (window.location.hash) {
          window.history.pushState(null, "", "/");
        }
      }
    }
  };

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 sm:px-6">
      <nav className="glass-nav w-full max-w-6xl rounded-2xl px-5 py-3 transition-all duration-300">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Name & Logo - Unified Single Row Lockup without rounded box */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-2.5 group whitespace-nowrap py-0.5 select-none"
          >
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-[#059669] transition-colors">
              ThongDong
            </span>
          </Link>

          {/* Desktop Navigation Links - Text Only, 1 Single Row */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 whitespace-nowrap">
            <Link
              href="/#tim-xe"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-[#059669] rounded-xl hover:bg-white/60 transition-colors"
            >
              Thuê xe
            </Link>
            <Link
              href="/#chi-nhanh"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-[#059669] rounded-xl hover:bg-white/60 transition-colors"
            >
              Chi nhánh
            </Link>
            <Link
              href="/#goi-thue-bao"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-[#059669] rounded-xl hover:bg-white/60 transition-colors"
            >
              Gói thuê bao
            </Link>
            <Link
              href="/#quy-trinh"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-[#059669] rounded-xl hover:bg-white/60 transition-colors"
            >
              Hướng dẫn
            </Link>
            <Link
              href="/#kiem-dinh"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-[#059669] rounded-xl hover:bg-white/60 transition-colors"
            >
              Kiểm định
            </Link>
          </div>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-2.5 whitespace-nowrap">
            {mounted && isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white border border-neutral-200/80 text-sm font-medium text-neutral-800 transition-all cursor-pointer shadow-sm"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName}
                      width={24}
                      height={24}
                      unoptimized
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500/40"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center text-xs font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate font-semibold text-xs sm:text-sm">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl p-2 glass-card border border-white/80 bg-white/95 shadow-xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {user.roles.includes("Admin")
                            ? "Quản trị viên"
                            : user.roles.includes("Staff")
                              ? "Nhân viên"
                              : "Khách hàng"}
                        </span>
                      </div>
                    </div>

                    <div className="py-1 border-b border-neutral-100 mb-1 space-y-0.5">
                      <Link
                        href="/booking"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-xl transition-colors"
                      >
                        <Car className="size-3.5" />
                        <span>Đặt xe mới</span>
                      </Link>
                      <Link
                        href="/my-subscriptions"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-xl transition-colors"
                      >
                        <Package className="size-3.5" />
                        <span>Gói thuê của tôi</span>
                      </Link>
                      <Link
                        href="/invoices"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-xl transition-colors"
                      >
                        <FileText className="size-3.5" />
                        <span>Danh sách hoá đơn</span>
                      </Link>
                      <Link
                        href="/payment-history"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-xl transition-colors"
                      >
                        <CreditCard className="size-3.5" />
                        <span>Lịch sử thanh toán</span>
                      </Link>
                      <Link
                        href="/driver-license"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-xl transition-colors"
                      >
                        <FileCheck className="size-3.5" />
                        <span>Giấy phép lái xe (GPLX)</span>
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-md shadow-[#059669]/25 hover:shadow-lg hover:shadow-[#059669]/35 transition-all duration-300 cursor-pointer"
                >
                  Đăng ký
                </Link>
              </>
            )}
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
          <div
            id="mobile-nav-menu"
            className="md:hidden pt-4 pb-2 border-t border-neutral-200/60 mt-3 space-y-1"
          >
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Hồ sơ của tôi
            </Link>
            <a
              href="#tim-xe"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Thuê xe
            </a>
            <Link
              href="/#chi-nhanh"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Chi nhánh
            </Link>
            <Link
              href="/#goi-thue-bao"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Gói thuê bao
            </Link>
            <Link
              href="/#quy-trinh"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Hướng dẫn
            </Link>
            <Link
              href="/#kiem-dinh"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 rounded-lg hover:bg-neutral-100"
            >
              Phiếu kiểm định xe
            </Link>
            <div className="pt-3 border-t border-neutral-200/60 flex flex-col gap-2">
              {mounted && isAuthenticated && user ? (
                <div className="p-3 bg-white/80 rounded-xl border border-neutral-200/80">
                  <div className="flex items-center gap-2.5 mb-2">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.fullName}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-xs">
                        {user.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-neutral-900">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-sm font-semibold text-center text-neutral-700 bg-neutral-100 rounded-xl block"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-sm font-semibold text-center text-white bg-[#059669] rounded-xl block"
                  >
                    Đăng ký tài khoản
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
