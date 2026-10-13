"use client";

import { InlineError, ValidatedForm, useInlineValidation, InlineInput } from "@/components/forms/inline-validation";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Check,
  RotateCw,
  KeyRound,
  Loader2,
} from "lucide-react";
import {
  startRegistration,
  verifyRegistration,
  resendRegistrationOtp,
} from "../api";
import { ApiClientError } from "@/api/api-client";

type Step = "form" | "otp" | "success";

export default function RegisterForm() {
  const router = useRouter();
  const validation = useInlineValidation();

  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [resendCooldown, setResendCooldown] = useState(0);
  const canResend = resendCooldown === 0;

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const fillSampleData = () => {
    validation.reset();
    setFullName("Nguyễn Văn An");
    setEmail(`an.${Date.now().toString().slice(-4)}@example.com`);
    setPassword("matkhau123456");
    setConfirmPassword("matkhau123456");
    setAgreeTerms(true);
    setErrorMessage(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();

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
      if (!validation.report(err)) return;
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message || "Không thể khởi tạo đăng ký. Vui lòng thử lại.");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otp.trim();
    setSubmitting(true);
    try {
      await verifyRegistration({
        email: email.trim(),
        otp: cleanOtp,
      });

      setStep("success");
    } catch (err: unknown) {
      if (!validation.report(err)) return;
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Xác thực thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || submitting) return;
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await resendRegistrationOtp(email.trim());
      setResendCooldown(60);
      setSuccessMessage("Mã OTP mới đã được gửi lại tới email của bạn.");
    } catch (err: unknown) {
      if (!validation.report(err)) return;
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
    <div className="w-full">
      {/* Quick sample fill - 1 dòng gọn */}
      {step === "form" && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-surface-raised border border-line flex items-center justify-between">
          <span className="text-xs text-ink-3 font-medium">Thử nghiệm nhanh:</span>
          <button
            type="button"
            onClick={fillSampleData}
            className="px-2.5 py-1 text-xs font-bold text-primary bg-surface hover:bg-sunken rounded-lg border border-line shadow-2xs transition-colors cursor-pointer"
          >
            Điền mẫu tự động
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-line shadow-e2 text-ink">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === "form"
                  ? "bg-primary text-white"
                  : "bg-primary-tint text-primary font-bold"
              }`}
            >
              {step === "success" ? <Check className="w-3.5 h-3.5" /> : "1"}
            </div>
            <span
              className={`text-xs font-bold ${
                step === "form" ? "text-ink" : "text-ink-3"
              }`}
            >
              Thông tin
            </span>
          </div>

          <div className="flex-1 max-w-[60px] h-px bg-line mx-3" />

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === "otp"
                  ? "bg-primary text-white"
                  : step === "success"
                    ? "bg-primary-tint text-primary"
                    : "bg-sunken text-ink-3"
              }`}
            >
              {step === "success" ? <Check className="w-3.5 h-3.5" /> : "2"}
            </div>
            <span
              className={`text-xs font-bold ${
                step === "otp"
                  ? "text-ink"
                  : "text-ink-3"
              }`}
            >
              Xác thực OTP
            </span>
          </div>
        </div>

        {/* Card Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-black tracking-tight text-ink">
            {step === "form" && "Tạo tài khoản mới"}
            {step === "otp" && "Xác thực email"}
            {step === "success" && "Đăng ký thành công!"}
          </h1>
          <p className="text-xs text-ink-3 mt-1 font-normal">
            {step === "form" && "Đăng ký để bắt đầu trải nghiệm dịch vụ thuê xe Thong Dong"}
            {step === "otp" && `Nhập mã 6 chữ số gửi đến ${email}`}
            {step === "success" && "Tài khoản của bạn đã sẵn sàng sử dụng"}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-3.5 p-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && step !== "success" && (
          <div className="mb-3.5 p-3 rounded-xl bg-primary-tint border border-primary/30 text-warning text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === "form" && (
          <ValidatedForm
            validation={validation}
            validate={() => ({
              ...(fullName.trim().length < 2 ? { fullName: "Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự)." } : {}),
              ...(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? { email: "Vui lòng nhập địa chỉ email hợp lệ." } : {}),
              ...(password.length < 6 ? { password: "Mật khẩu yêu cầu tối thiểu 6 ký tự." } : {}),
              ...(password !== confirmPassword ? { confirmPassword: "Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại." } : {}),
              ...(!agreeTerms ? { agreeTerms: "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật để tiếp tục." } : {}),
            })}
            onSubmit={handleSubmitForm}
            className="space-y-3"
          >
            {/* Full Name */}
            <div>
              <label
                htmlFor="register-fullname"
                className="block text-xs font-bold text-ink-2 mb-1 uppercase tracking-wider"
              >
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-3">
                  <User className="w-4 h-4" />
                </div>
                <InlineInput
                  showError={false}
                  name="fullName"
                  id="register-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-surface hover:bg-surface-raised focus:bg-surface text-ink text-xs sm:text-sm rounded-xl border border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink-3"
                  autoComplete="name"
                />
              </div>
              <InlineError name="fullName" inputId="register-fullname" />
            </div>

            {/* Email field */}
            <div>
              <label
                htmlFor="register-email"
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
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-surface hover:bg-surface-raised focus:bg-surface text-ink text-xs sm:text-sm rounded-xl border border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink-3"
                  autoComplete="email"
                />
              </div>
              <InlineError name="email" inputId="register-email" />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-bold text-ink-2 mb-1 uppercase tracking-wider"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-3">
                  <Lock className="w-4 h-4" />
                </div>
                <InlineInput
                  showError={false}
                  name="password"
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-9 pr-10 py-2.5 bg-surface hover:bg-surface-raised focus:bg-surface text-ink text-xs sm:text-sm rounded-xl border border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink-3"
                  autoComplete="new-password"
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
              <InlineError name="password" inputId="register-password" />
            </div>

            {/* Confirm Password field */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-bold text-ink-2 mb-1 uppercase tracking-wider"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-3">
                  <Lock className="w-4 h-4" />
                </div>
                <InlineInput
                  showError={false}
                  name="confirmPassword"
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-9 pr-10 py-2.5 bg-surface hover:bg-surface-raised focus:bg-surface text-ink text-xs sm:text-sm rounded-xl border border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink-3"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-3 hover:text-ink cursor-pointer"
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <InlineError name="confirmPassword" inputId="register-confirm-password" />
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 pt-0.5">
              <InlineInput
                showError={false}
                name="agreeTerms"
                id="register-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 size-4 rounded border-line-strong text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="register-terms" className="text-xs text-ink-3 leading-snug cursor-pointer select-none">
                Đồng ý với{" "}
                <span className="font-semibold text-ink">Điều khoản dịch vụ</span> &{" "}
                <span className="font-semibold text-ink">Chính sách bảo mật</span>.
              </label>
            </div>
            <InlineError name="agreeTerms" inputId="register-terms" />

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary-hover shadow-e1 hover:shadow-e2 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Tiếp tục — Nhận mã OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </ValidatedForm>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === "otp" && (
          <ValidatedForm
            validation={validation}
            validate={() => (/^\d{6}$/.test(otp.trim()) ? {} : { otp: "Vui lòng nhập chính xác mã OTP gồm 6 chữ số." })}
            onSubmit={handleSubmitOtp}
            className="space-y-4 animate-in fade-in duration-200"
          >
            <div className="p-3.5 rounded-xl bg-surface-raised border border-line text-center">
              <KeyRound className="w-6 h-6 text-primary mx-auto mb-1.5" />
              <p className="text-xs text-ink-3">Mã xác thực đã gửi tới:</p>
              <p className="text-xs sm:text-sm font-bold text-ink mt-0.5">{email}</p>
            </div>

            <div>
              <label
                htmlFor="register-otp"
                className="block text-xs font-bold text-ink-2 mb-1 uppercase tracking-wider text-center"
              >
                Nhập mã OTP (6 chữ số)
              </label>
              <InlineInput
                name="otp"
                id="register-otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] text-xl font-mono py-2.5 bg-surface hover:bg-surface-raised focus:bg-surface text-ink rounded-xl border border-line-strong focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                className="text-ink-3 hover:text-ink transition-colors cursor-pointer"
              >
                ← Đổi email
              </button>

              <button
                type="button"
                disabled={!canResend || submitting}
                onClick={handleResend}
                className="font-bold text-primary hover:underline disabled:text-ink-3 disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3 h-3 ${submitting ? "animate-spin" : ""}`} />
                <span>{canResend ? "Gửi lại OTP" : `Gửi lại (${resendCooldown}s)`}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting || otp.length !== 6}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary-hover shadow-e1 hover:shadow-e2 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kích hoạt...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận & Hoàn tất</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </ValidatedForm>
        )}

        {/* STEP 3: Success State */}
        {step === "success" && (
          <div className="py-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-primary-tint text-primary flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-ink">Chúc mừng bạn!</h2>
              <p className="text-xs text-ink-3 max-w-xs mx-auto leading-relaxed">
                Tài khoản <strong>{email}</strong> đã được kích hoạt thành công.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/login?registered=${encodeURIComponent(email)}`)}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary-hover shadow-e1 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Switch to Login */}
        {step !== "success" && (
          <div className="mt-4 pt-3 border-t border-line text-center text-xs text-ink-3">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-bold text-primary hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
