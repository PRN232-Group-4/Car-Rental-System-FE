import React, { Suspense } from "react";
import RegisterForm from "@/features/auth/components/RegisterForm";
import AuthStage from "@/components/layout/AuthStage";

export const metadata = {
  title: "Đăng ký tài khoản | Thong Dong - Hệ Thống Thuê Xe",
  description:
    "Đăng ký tài khoản khách hàng Thong Dong để đặt xe ô tô xăng hoặc ô tô điện linh hoạt theo giờ hoặc dài hạn và mua các gói thuê bao tiết kiệm.",
};

export default function RegisterPage() {
  return (
    <AuthStage backHref="/" backLabel="Về trang chủ">
      <Suspense fallback={<div className="bg-surface p-8 text-center text-xs text-ink-3">Đang tải biểu mẫu...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthStage>
  );
}
