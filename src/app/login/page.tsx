import React, { Suspense } from "react";
import LoginForm from "@/features/auth/components/LoginForm";
import AuthStage from "@/components/layout/AuthStage";

export const metadata = {
  title: "Đăng nhập | Thong Dong - Hệ Thống Thuê Xe",
  description:
    "Đăng nhập tài khoản Thong Dong để quản lý lịch trình thuê xe, hợp đồng và các ưu đãi thành viên.",
};

export default function LoginPage() {
  return (
    <AuthStage backHref="/" backLabel="Về trang chủ">
      <Suspense fallback={<div className="bg-surface p-8 text-center text-xs text-ink-3">Đang tải biểu mẫu...</div>}>
        <LoginForm />
      </Suspense>
    </AuthStage>
  );
}
