"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { InlineInput, InlineError, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { startPasswordReset, verifyPasswordReset } from "../api";
import { ApiClientError } from "@/api/api-client";

type Step = "request" | "verify" | "success";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const validation = useInlineValidation();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleRequestSubmit = async () => {
    setSubmitting(true);
    setGeneralError("");
    try {
      await startPasswordReset(email);
      setStep("verify");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setGeneralError(err.message);
      } else {
        setGeneralError("Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng kiểm tra lại email.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySubmit = async () => {
    if (newPassword.length < 6) {
      validation.setField("newPassword", "Mật khẩu mới yêu cầu tối thiểu 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      validation.setField("confirmPassword", "Mật khẩu xác nhận không khớp.");
      return;
    }

    setSubmitting(true);
    setGeneralError("");
    try {
      await verifyPasswordReset({ email, otp, newPassword });
      setStep("success");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setGeneralError(err.message);
      } else {
        setGeneralError("Mã xác thực không hợp lệ hoặc đã hết hạn.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="glass-1 rounded-3xl p-6 sm:p-8 shadow-e2 border border-line text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-ink">Đặt lại mật khẩu thành công!</h2>
        <p className="text-xs sm:text-sm text-ink-3">
          Mật khẩu tài khoản của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bằng mật khẩu mới.
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-e1 transition-all cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="glass-1 rounded-3xl p-6 sm:p-8 shadow-e2 border border-line space-y-5">
        <div>
          <h2 className="text-xl font-bold text-ink">Nhập mã xác thực</h2>
          <p className="text-xs text-ink-3 mt-1">
            Mã OTP đã được gửi về email <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến hoặc thư rác.
          </p>
        </div>

        {generalError && (
          <div role="alert" aria-live="assertive" className="p-3 rounded-xl bg-danger-bg border border-danger/20 text-danger text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <ValidatedForm validation={validation} onSubmit={handleVerifySubmit} className="space-y-4">
          <div>
            <label htmlFor="otp-input" className="block text-xs font-bold text-ink-2 uppercase tracking-wider mb-1">
              Mã OTP (6 chữ số)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-3">
                <KeyRound className="w-4 h-4" />
              </div>
              <InlineInput
                id="otp-input"
                name="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full pl-9 pr-3 py-2.5 bg-surface text-ink text-xs sm:text-sm rounded-xl border border-line-strong focus:border-primary outline-none"
              />
            </div>
            <InlineError name="otp" inputId="otp-input" />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-xs font-bold text-ink-2 uppercase tracking-wider mb-1">
              Mật khẩu mới
            </label>
            <InlineInput
              id="new-password"
              name="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full px-3 py-2.5 bg-surface text-ink text-xs sm:text-sm rounded-xl border border-line-strong focus:border-primary outline-none"
            />
            <InlineError name="newPassword" inputId="new-password" />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-bold text-ink-2 uppercase tracking-wider mb-1">
              Xác nhận mật khẩu mới
            </label>
            <InlineInput
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-3 py-2.5 bg-surface text-ink text-xs sm:text-sm rounded-xl border border-line-strong focus:border-primary outline-none"
            />
            <InlineError name="confirmPassword" inputId="confirm-password" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-e1 transition-all cursor-pointer disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận đổi mật khẩu"}
          </button>
        </ValidatedForm>
      </div>
    );
  }

  return (
    <div className="glass-1 rounded-3xl p-6 sm:p-8 shadow-e2 border border-line space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Quên mật khẩu</h2>
        <p className="text-xs text-ink-3 mt-1">
          Nhập địa chỉ email đăng ký tài khoản của bạn để nhận mã khôi phục mật khẩu.
        </p>
      </div>

      {generalError && (
        <div role="alert" aria-live="assertive" className="p-3 rounded-xl bg-danger-bg border border-danger/20 text-danger text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      <ValidatedForm validation={validation} onSubmit={handleRequestSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="block text-xs font-bold text-ink-2 uppercase tracking-wider mb-1">
            Địa chỉ Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-3">
              <Mail className="w-4 h-4" />
            </div>
            <InlineInput
              id="forgot-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3 py-2.5 bg-surface text-ink text-xs sm:text-sm rounded-xl border border-line-strong focus:border-primary outline-none"
            />
          </div>
          <InlineError name="email" inputId="forgot-email" />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-e1 transition-all cursor-pointer disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Gửi mã khôi phục</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs font-semibold text-primary hover:underline">
            Quay lại trang đăng nhập
          </Link>
        </div>
      </ValidatedForm>
    </div>
  );
}
