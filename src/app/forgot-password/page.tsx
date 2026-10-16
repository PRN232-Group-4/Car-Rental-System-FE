import React, { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AuthBackground from "@/components/layout/AuthBackground";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata = {
  title: "Quên mật khẩu | Thong Dong - Hệ Thống Thuê Xe",
  description: "Khôi phục mật khẩu tài khoản Thong Dong của bạn qua email xác thực.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="h-dvh w-full overflow-hidden flex flex-col bg-canvas relative selection:bg-primary/15 selection:text-primary">
      <AuthBackground />

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
          href="/login"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-ink-3 hover:text-ink hover:bg-surface transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Về trang đăng nhập</span>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 flex flex-col justify-center pb-6">
        <Suspense fallback={<div className="p-8 text-center text-xs text-ink-3">Đang tải...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
