"use client";

import { useEffect, useCallback } from "react";
import Link from "@/components/navigation/NavigationLink";
import { X, ArrowRight } from "lucide-react";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { href: "/find", label: "Thuê xe", desc: "Đội xe hiệu năng cao & số hóa bàn giao", index: "01" },
  { href: "/facilities", label: "Chi nhánh", desc: "Hệ thống trạm tiếp nhận TP. Hồ Chí Minh", index: "02" },
  { href: "/inspection", label: "Kiểm định 3D", desc: "Mô phỏng tiêu chuẩn kỹ thuật số đa điểm", index: "03" },
  { href: "/subscriptions", label: "Gói thuê bao", desc: "Chương trình hội viên đặc quyền không ràng buộc", index: "04" },
  { href: "/register", label: "Đăng ký thành viên", desc: "Gia nhập cộng đồng người lái tinh hoa", index: "05" },
  { href: "/login", label: "Đăng nhập", desc: "Quản lý hành trình và hồ sơ cá nhân", index: "06" },
];

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng"
      className="fixed inset-0 z-50 bg-ink-950 text-bone-100 flex flex-col justify-between p-6 sm:p-12 md:p-16 select-none animate-in fade-in duration-200"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-bone-100/10 pb-6">
        <Link
          href="/"
          onClick={onClose}
          className="font-display text-2xl font-black tracking-tight text-bone-100 hover:text-sun-400 transition-colors"
        >
          ThongDong.
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-bone-100 hover:text-sun-400 transition-colors cursor-pointer py-2 px-3 border border-bone-100/20 hover:border-sun-400 rounded-none"
          aria-label="Đóng menu"
        >
          <span>Đóng [ESC]</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation links grid */}
      <nav className="my-auto py-8">
        <div className="max-w-4xl mx-auto divide-y divide-bone-100/10">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="group flex flex-col sm:flex-row sm:items-baseline justify-between py-5 sm:py-6 text-left transition-all"
            >
              <div className="flex items-baseline gap-4 sm:gap-6">
                <span className="font-mono text-xs text-sun-400">
                  {item.index}
                </span>
                <span className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-bone-100 group-hover:text-sun-400 transition-colors">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 sm:mt-0 text-xs text-bone-100/60 group-hover:text-bone-100 transition-colors">
                <span className="hidden sm:inline">{item.desc}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-sun-400" />
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer metadata */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-bone-100/10 pt-6 text-xs text-bone-100/40">
        <span className="font-mono uppercase tracking-widest">
          Riso Grand Tour — Siêu xe. Không vội.
        </span>
        <span className="font-sans">
          TP. Hồ Chí Minh · Hotline: 1900 8888 (24/7)
        </span>
      </div>
    </div>
  );
}
