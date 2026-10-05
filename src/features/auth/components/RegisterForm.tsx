"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
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
  RotateCw,
  KeyRound,
  Check,
} from "lucide-react";
import { startRegistration, verifyRegistration, resendRegistrationOtp } from "../api";
import { ApiClientError } from "@/api/api-client";

type Step = "form" | "otp" | "success";

export default function RegisterForm() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>("form");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP field
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const canResend = resendCooldown === 0;

  // Status & feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Resend timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCooldown]);

  // Quick fill sample for fast testing
  const handleQuickFill = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFullName("Nguyễn Văn An");
    setEmail(`khachhang${randomSuffix}@example.com`);
    setPassword("Matkhau123456!");
    setConfirmPassword("Matkhau123456!");
    setAgreeTerms(true);
    setErrorMessage(null);
  };

  // Submit Step 1: Start Registration
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanFullName || cleanFullName.length < 2) {
      setErrorMessage("Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự).");
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Mật khẩu yêu cầu tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật để tiếp tục.");
      return;
    }

    setSubmitting(true);
    try {
      await startRegistration({
        fullName: cleanFullName,
        email: cleanEmail,
        password,
      });

      setStep("otp");
      setResendCooldown(60);
      setSuccessMessage(`Mã xác thực đã được gửi tới ${cleanEmail}. Vui lòng kiểm tra hộp thư.`);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (typeof err.data === "object" && err.data !== null && "detail" in err.data) {
          setErrorMessage(String((err.data as { detail: unknown }).detail));
        } else {
          setErrorMessage(err.message || "Không thể khởi tạo đăng ký. Vui lòng thử lại.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Step 2: Verify OTP
  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage("Vui lòng nhập chính xác mã OTP gồm 6 chữ số.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyRegistration({
        email: email.trim(),
        otp: cleanOtp,
      });

      setStep("success");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (typeof err.data === "object" && err.data !== null && "detail" in err.data) {
          setErrorMessage(String((err.data as { detail: unknown }).detail));
        } else {
          setErrorMessage(err.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Xác thực thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend || submitting) return;
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await resendRegistrationOtp(email.trim());
      setResendCooldown(60);
      setSuccessMessage("Mã OTP mới đã được gửi lại tới email của bạn.");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message || "Không thể gửi lại mã OTP lúc này.");
      } else {
        setErrorMessage("Lỗi khi gửi lại OTP. Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Quick Sample Fill Pill for testing */}
      {step === "form" && (
        <div className="mb-5 p-3 rounded-2xl glass-sub border border-emerald-500/25 bg-emerald-50/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Thử nghiệm nhanh:</span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 rounded-lg border border-emerald-200 shadow-2xs transition-colors cursor-pointer"
          >
            Điền mẫu tự động
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 bg-white/95 shadow-xl transition-all duration-300">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === "form"
                  ? "bg-[#059669] text-white ring-4 ring-[#059669]/15"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {step === "success" ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <span
              className={`text-xs font-semibold ${
                step === "form" ? "text-neutral-900" : "text-neutral-500"
              }`}
            >
              Thông tin
            </span>
          </div>

          <div className="w-10 h-0.5 bg-neutral-200" />

          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === "otp"
                  ? "bg-[#059669] text-white ring-4 ring-[#059669]/15"
                  : step === "success"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {step === "success" ? <Check className="w-4 h-4" /> : "2"}
            </div>
            <span
              className={`text-xs font-semibold ${
                step === "otp"
                  ? "text-neutral-900"
                  : step === "success"
                    ? "text-neutral-500"
                    : "text-neutral-400"
              }`}
            >
              Xác thực OTP
            </span>
          </div>
        </div>

        {/* Card Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            {step === "form" && "Tạo tài khoản mới"}
            {step === "otp" && "Xác thực địa chỉ Email"}
            {step === "success" && "Đăng ký thành công!"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {step === "form" && "Gia nhập Thong Dong để trải nghiệm dịch vụ thuê xe hiện đại"}
            {step === "otp" && `Nhập mã 6 chữ số đã được gửi đến hộp thư ${email}`}
            {step === "success" && "Tài khoản của bạn đã được kích hoạt và sẵn sàng sử dụng"}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && step !== "success" && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === "form" && (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="register-fullname"
                className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider"
              >
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="register-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="w-full pl-10 pr-4 py-3 bg-white/70 hover:bg-white focus:bg-white text-neutral-900 text-sm rounded-xl border border-neutral-300/80 focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/15 outline-none transition-all duration-200 placeholder:text-neutral-400"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider"
              >
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="register-email"
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
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-11 py-3 bg-white/70 hover:bg-white focus:bg-white text-neutral-900 text-sm rounded-xl border border-neutral-300/80 focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/15 outline-none transition-all duration-200 placeholder:text-neutral-400"
                  autoComplete="new-password"
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
            </div>

            {/* Confirm Password field */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-10 pr-11 py-3 bg-white/70 hover:bg-white focus:bg-white text-neutral-900 text-sm rounded-xl border border-neutral-300/80 focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/15 outline-none transition-all duration-200 placeholder:text-neutral-400"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="register-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 size-4 rounded border-neutral-300 text-[#059669] focus:ring-[#059669]/20 cursor-pointer"
              />
              <label htmlFor="register-terms" className="text-xs text-neutral-600 leading-relaxed cursor-pointer select-none">
                Tôi đồng ý với{" "}
                <span className="font-semibold text-neutral-800">Điều khoản sử dụng</span> và{" "}
                <span className="font-semibold text-neutral-800">Chính sách bảo mật</span> của Thong Dong.
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] shadow-md shadow-[#059669]/25 hover:shadow-lg hover:shadow-[#059669]/35 focus:ring-4 focus:ring-[#059669]/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý đăng ký...</span>
                </>
              ) : (
                <>
                  <span>Tiếp tục — Nhận mã OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === "otp" && (
          <form onSubmit={handleSubmitOtp} className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-center">
              <KeyRound className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-500">Mã xác thực 6 số đã được gửi tới:</p>
              <p className="text-sm font-bold text-neutral-900 mt-0.5">{email}</p>
            </div>

            <div>
              <label
                htmlFor="register-otp"
                className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider text-center"
              >
                Nhập mã OTP (6 chữ số)
              </label>
              <input
                id="register-otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3.5 bg-white hover:bg-neutral-50 focus:bg-white text-neutral-900 rounded-xl border border-neutral-300 focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/15 outline-none transition-all duration-200"
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                ← Thay đổi email
              </button>

              <button
                type="button"
                disabled={!canResend || submitting}
                onClick={handleResend}
                className="font-semibold text-emerald-700 hover:text-emerald-800 disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${submitting ? "animate-spin" : ""}`} />
                <span>{canResend ? "Gửi lại mã OTP" : `Gửi lại sau (${resendCooldown}s)`}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting || otp.length !== 6}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] shadow-md shadow-[#059669]/25 hover:shadow-lg hover:shadow-[#059669]/35 focus:ring-4 focus:ring-[#059669]/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kích hoạt tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận & Hoàn tất</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Success State */}
        {step === "success" && (
          <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-neutral-900">Chúc mừng bạn!</h3>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
                Tài khoản <strong>{email}</strong> đã được kích hoạt thành công. Bạn có thể đăng nhập ngay để bắt đầu thuê xe.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/login?registered=${encodeURIComponent(email)}`)}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#059669] hover:bg-[#047857] shadow-md shadow-[#059669]/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Switch to Login */}
        {step !== "success" && (
          <div className="mt-6 pt-5 border-t border-neutral-100 text-center text-xs sm:text-sm text-neutral-500">
            Đã có tài khoản Thong Dong?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#059669] hover:text-[#047857] hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {/* Security badge note */}
        <div className="mt-5 pt-3 border-t border-neutral-200/50 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Thông tin được mã hóa bảo mật chuẩn SSL 256-bit</span>
        </div>
      </div>
    </div>
  );
}
