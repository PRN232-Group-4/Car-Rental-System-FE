import React, { Suspense } from "react";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import AuthStage from "@/components/layout/AuthStage";

export const metadata = {
  title: "Quên mật khẩu | Thong Dong - Hệ Thống Thuê Xe",
  description:
    "Khôi phục mật khẩu tài khoản Thong Dong của bạn qua email xác thực.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthStage backHref="/login" backLabel="Về trang đăng nhập">
      <Suspense fallback={<div className="bg-surface p-8 text-center text-xs text-ink-3">Đang tải...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthStage>
  );
}
