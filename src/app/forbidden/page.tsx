"use client";

import Link from "@/components/navigation/NavigationLink";
import { ShieldAlert, ArrowLeft, Home, LogIn } from "lucide-react";
import { useAuth } from "@/features/auth";
import { getLoginPortalPath } from "@/features/auth/portal-routing";

export default function ForbiddenPage() {
  const { user, isAuthenticated } = useAuth();

  const portalHref = isAuthenticated && user?.roles
    ? getLoginPortalPath(user.roles)
    : "/";

  return (
    <main className="min-h-dvh bg-canvas text-ink flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger shadow-e1">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Truy cập bị từ chối
          </h1>
          <p className="text-sm text-ink-3 leading-relaxed max-w-sm mx-auto">
            Tài khoản hiện tại không có đủ quyền để truy cập trang này. Vui lòng quay về khu vực được phân quyền hoặc liên hệ quản trị viên.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href={portalHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-e1 transition hover:bg-primary-hover"
              >
                <ArrowLeft className="w-4 h-4" />
                Về cổng được phân quyền
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink hover:bg-canvas transition"
              >
                <Home className="w-4 h-4" />
                Trang chủ
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-e1 transition hover:bg-primary-hover"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập lại
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
