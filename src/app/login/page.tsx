import React, { Suspense } from "react";
import Link from "@/components/navigation/NavigationLink";
import { ChevronLeft } from "lucide-react";
import LoginForm from "@/features/auth/components/LoginForm";
import AuthBackground from "@/components/layout/AuthBackground";

export const metadata = {
  title: "Đăng nhập | Thong Dong - Hệ Thống Thuê Xe",
  description:
    "Đăng nhập tài khoản Thong Dong để quản lý lịch trình thuê xe, hợp đồng và các ưu đãi thành viên.",
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh w-full overflow-y-auto flex flex-col bg-canvas relative selection:bg-primary/15 selection:text-primary">
      {/* Background CAD Grid & Aero Blueprint đồng bộ với Landing Page */}
      <AuthBackground />

      {/* Top Header Bar */}
      <header className="shrink-0 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group whitespace-nowrap py-0.5 select-none"
        >
          <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-ink group-hover:text-primary transition-colors">
            ThongDong.
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-ink-3 hover:text-ink hover:bg-surface transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ</span>
        </Link>
      </header>

      {/* Main Content: Single focused card perfectly centered in viewport */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col justify-center">
        <Suspense fallback={<div className="p-8 text-center text-xs text-ink-3">Đang tải biểu mẫu...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
