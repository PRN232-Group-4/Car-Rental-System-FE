"use client";

import { InlineError, ValidatedForm, useInlineValidation, InlineInput } from "@/components/forms/inline-validation";

import React, { useEffect, useState } from "react";
import Link from "@/components/navigation/NavigationLink";
import { useSearchParams } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAccountProfile } from "@/features/profile/api";
import { getLoginPortalPath } from "../portal-routing";

async function resolveDestination(
  roles: string[],
  redirectUrl: string | null,
): Promise<string> {
  if (redirectUrl) return redirectUrl;
  const normalized = roles.map((role) => role.toLocaleLowerCase());
  const isStaffLike = normalized.some((role) => role === "staff" || role === "driver");
  let staffAccount = null;
  if (isStaffLike && !normalized.includes("admin")) {
    staffAccount = await getAccountProfile();
  }
  return getLoginPortalPath(roles, staffAccount);
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("next") || searchParams.get("redirect");

  const { login, user, isLoading: authLoading, isAuthenticated } = useAuth();
  const googleStatus = searchParams.get("google");
  const registeredEmail = searchParams.get("registered");
  const validation = useInlineValidation();
  const [email, setEmail] = useState(() => registeredEmail || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    googleStatus === "unavailable"
      ? "Đăng nhập Google chưa được cấu hình. Vui lòng dùng email và mật khẩu."
      : googleStatus === "error"
        ? "Đăng nhập Google thất bại: tài khoản chưa tồn tại trong hệ thống."
        : null,
  );

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;
    let active = true;
    void resolveDestination(user.roles ?? [], redirectUrl)
      .then((destination) => {
        if (active) router.replace(destination);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, user, redirectUrl, router]);

  const googleSessionError =
    googleStatus === "ok" && !authLoading && !isAuthenticated
      ? "Google đã xác thực nhưng trình duyệt không nhận được phiên đăng nhập."
      : null;
  const shownError = errorMessage ?? googleSessionError;
  const [successMessage, setSuccessMessage] = useState<string | null>(() =>
    registeredEmail ? "Đăng ký thành công! Vui lòng nhập mật khẩu để đăng nhập." : null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    setSubmitting(true);
    try {
      const user = await login({
        email: cleanEmail,
        password,
        rememberMe,
      });

      let destination: string;
      try {
        destination = await resolveDestination(user.roles ?? [], redirectUrl);
      } catch {
        setErrorMessage(
          "Đăng nhập thành công nhưng không thể tải thông tin phòng ban để xác định cổng nhân viên. Vui lòng tải lại trang hoặc thử lại.",
        );
        return;
      }

      setSuccessMessage(`Chào mừng trở lại, ${user.fullName}! Đang chuyển hướng...`);
      setTimeout(() => {
        router.push(destination);
      }, 1000);
    } catch (err: unknown) {
      if (!validation.report(err)) return;
      setErrorMessage(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Main Solid Form Card */}
      <div className="bg-surface rounded-2xl p-6 sm:p-7 shadow-e2 border border-line text-ink">
        <div className="mb-4">
          <h1 className="text-2xl font-black tracking-tight text-ink">
            Đăng nhập
          </h1>
          <p className="text-xs text-ink-3 mt-1 font-normal">
            Nhập email và mật khẩu để tiếp tục lịch trình của bạn.
          </p>
        </div>

        {/* Error Alert Box */}
        {shownError && (
          <div className="mb-3.5 p-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{shownError}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mb-3.5 p-3 rounded-xl bg-primary-tint border border-primary/30 text-warning text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        <ValidatedForm
          validation={validation}
          validate={() =>
            password.length < 6
              ? { password: "Mật khẩu yêu cầu tối thiểu 6 ký tự." }
              : {}
          }
          onSubmit={handleSubmit}
          className="space-y-3.5"
        >
          {/* Email field */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-bold text-ink-2 mb-1 uppercase tracking-wider"
            >
              Địa chỉ Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-3">
                <Mail className="w-4 h-4" />
              </div>
              <InlineInput
                showError={false}
                name="email"
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-surface hover:bg-surface-raised focus:bg-surface text-ink text-xs sm:text-sm rounded-xl border border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink-3"
                autoComplete="email"
              />
            </div>
            <InlineError name="email" inputId="login-email" />
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-ink-2 uppercase tracking-wider"
              >
                Mật khẩu
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-3">
                <Lock className="w-4 h-4" />
              </div>
              <InlineInput
                showError={false}
                name="password"
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-surface hover:bg-surface-raised focus:bg-surface text-ink text-xs sm:text-sm rounded-xl border border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink-3"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-3 hover:text-ink cursor-pointer"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <InlineError name="password" inputId="login-password" />
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <InlineInput
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-line-strong cursor-pointer"
              />
              <span className="text-xs text-ink-3 font-medium">Ghi nhớ đăng nhập</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-1 py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-e1 hover:shadow-e2 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </ValidatedForm>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-2 text-ink-3 font-medium">Hoặc</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <a
          href="/api/auth/google"
          className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-semibold text-ink bg-surface hover:bg-surface-raised border border-line-strong shadow-xs transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Đăng nhập với Google</span>
        </a>

        {/* Switch to Register */}
        <div className="mt-4 pt-3 border-t border-line text-center text-xs text-ink-3">
          Chưa có tài khoản Thong Dong?{" "}
          <Link
            href="/register"
            className="font-bold text-primary hover:underline"
          >
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
