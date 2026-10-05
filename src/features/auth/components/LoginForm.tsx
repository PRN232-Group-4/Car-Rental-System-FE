"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiClientError } from "@/api/api-client";
import { getAccountProfile } from "@/features/profile/api";
import { getLoginPortalPath } from "../portal-routing";

interface DemoAccount {
  label: string;
  roleDescription: string;
  email: string;
  pass: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Khách hàng",
    roleDescription: "Đặt xe & xem hợp đồng",
    email: "customer@example.com",
    pass: "a-secure-password",
  },
  {
    label: "Quản trị viên (Admin)",
    roleDescription: "Toàn quyền quản trị hệ thống",
    email: "admin@thongdong.vn",
    pass: "a-secure-password",
  },
  {
    label: "Nhân viên điều phối",
    roleDescription: "Gán xe & bàn giao",
    email: "staff@thongdong.vn",
    pass: "a-secure-password",
  },
];

/** Cổng đích sau khi đăng nhập: ưu tiên ?next, còn lại suy ra từ role/phòng ban. */
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
  const [email, setEmail] = useState(() => registeredEmail || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    googleStatus === "unavailable"
      ? "Đăng nhập Google chưa được cấu hình trên hệ thống. Vui lòng đăng nhập bằng email và mật khẩu."
      : googleStatus === "error"
        ? "Đăng nhập Google thất bại hoặc đã bị huỷ: tài khoản Google này chưa tồn tại trong hệ thống Thong Dong."
        : null,
  );

  // Vừa quay về từ Google OAuth (?google=ok) → vào thẳng cổng tương ứng.
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;
    let active = true;
    void resolveDestination(user.roles ?? [], redirectUrl)
      .then((destination) => {
        if (active) router.replace(destination);
      })
      .catch(() => {
        // Không xác định được cổng → để người dùng ở lại trang đăng nhập.
      });
    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, user, redirectUrl, router]);

  // ?google=ok mà FE không có phiên = cookie không về đúng origin (đăng nhập qua domain BE thay vì
  // qua /api của FE). Suy ra trực tiếp từ state thay vì setState trong effect.
  const googleSessionError =
    googleStatus === "ok" && !authLoading && !isAuthenticated
      ? "Google đã xác thực thành công nhưng trình duyệt không nhận được phiên đăng nhập của Thong Dong. " +
        "Kiểm tra lại: nút Google phải trỏ tới /api/auth/google cùng origin với FE và redirect URI trong " +
        "Google Console phải là https://<fe-domain>/api/auth/google/callback."
      : null;
  const shownError = errorMessage ?? googleSessionError;
  const [successMessage, setSuccessMessage] = useState<string | null>(() =>
    registeredEmail ? "Đăng ký thành công! Vui lòng nhập mật khẩu để đăng nhập." : null
  );

  const handleSelectDemo = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.pass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }
    if (password.length < 12) {
      setErrorMessage("Mật khẩu tài khoản yêu cầu tối thiểu 12 ký tự theo chuẩn an toàn.");
      return;
    }

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
      if (err instanceof ApiClientError) {
        if (typeof err.data === "object" && err.data !== null && "detail" in err.data) {
          setErrorMessage(String((err.data as { detail: unknown }).detail));
        } else if (err.status === 401) {
          setErrorMessage("Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.");
        } else {
          setErrorMessage(err.message || "Đăng nhập không thành công. Vui lòng thử lại.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Quick Demo Credentials Pill Picker */}
      <div className="mb-6 p-3.5 rounded-2xl bg-canvas border border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Tài khoản mẫu thử nghiệm (Bấm để điền nhanh):</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((account) => {
            const isSelected = email === account.email;
            return (
              <button
                key={account.label}
                type="button"
                onClick={() => handleSelectDemo(account)}
                className={`px-2 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-elevation-1 font-semibold"
                    : "bg-surface hover:bg-surface-elevated text-ink-muted hover:text-ink border border-border"
                }`}
              >
                <div className="text-xs font-bold truncate leading-tight">{account.label}</div>
                <div
                  className={`text-xs truncate mt-0.5 ${
                    isSelected ? "text-emerald-100" : "text-ink-subtle"
                  }`}
                >
                  {account.roleDescription}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Solid Form Container */}
      <div className="bg-surface rounded-3xl p-7 sm:p-9 shadow-elevation-2 relative overflow-hidden border border-border text-ink">
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
            Đăng nhập
          </h2>
          <p className="text-sm text-ink-muted mt-1.5 leading-relaxed font-normal">
            Nhập email và mật khẩu của bạn để truy cập lịch trình thuê xe, gói thuê bao và ưu đãi.
          </p>
        </div>

        {/* Error Alert Box */}
        {shownError && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-snug">{shownError}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider"
            >
              Địa chỉ Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white/70 hover:bg-white focus:bg-white text-neutral-900 text-sm rounded-xl border border-neutral-300/80 focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/15 outline-none transition-all duration-200 placeholder:text-neutral-400"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
              >
                Mật khẩu
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#059669] hover:text-[#047857] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-3 bg-white/70 hover:bg-white focus:bg-white text-neutral-900 text-sm rounded-xl border border-neutral-300/80 focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/15 outline-none transition-all duration-200 placeholder:text-neutral-400"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 px-1">
              <span className="text-xs text-neutral-400">
                Tiêu chuẩn an toàn: tối thiểu 12 ký tự
              </span>
              {password.length > 0 && (
                <span
                  className={`text-xs font-medium ${
                    password.length >= 12 ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {password.length}/12 ký tự
                </span>
              )}
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] border-neutral-300 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-neutral-600">Ghi nhớ đăng nhập</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] shadow-lg shadow-[#059669]/25 hover:shadow-xl hover:shadow-[#059669]/35 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập ngay</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 px-3 text-neutral-400 font-medium">Hoặc đăng nhập với</span>
          </div>
        </div>

        {/* Google OAuth Button — PHẢI giữ đường dẫn CÙNG ORIGIN với FE (/api/auth/google).
            Worker (prod) và rewrite của next dev sẽ proxy sang BE, nhờ đó cookie phiên được set cho
            origin FE. Trỏ thẳng tới domain BE thì cookie nằm ở origin BE, FE không bao giờ có phiên. */}
        <a
          href="/api/auth/google"
          className="w-full py-2.5 px-4 flex items-center justify-center gap-2.5 rounded-xl text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/80 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
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
          <span>Tài khoản Google</span>
        </a>

        {/* Switch to Register */}
        <div className="mt-6 text-center text-xs sm:text-sm text-neutral-500">
          Chưa có tài khoản Thong Dong?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#059669] hover:text-[#047857] hover:underline"
          >
            Đăng ký tài khoản mới
          </Link>
        </div>

        {/* Security badge note */}
        <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Phiên đăng nhập bảo mật với SSL 256-bit & Redis Token Store</span>
        </div>
      </div>
    </div>
  );
}
