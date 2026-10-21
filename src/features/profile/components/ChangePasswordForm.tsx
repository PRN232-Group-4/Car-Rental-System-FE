"use client";

import { useEffect, useRef, useState } from "react";
import { InlineInput, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { notifyError, notifySuccess } from "@/components/ui/Toaster";
import { useNavigationRouter } from "@/components/navigation/NavigationProvider";
import { useAuth } from "@/features/auth";
import { changePassword, sendPasswordChangeOtp } from "../api";

export default function ChangePasswordForm() {
  const { user, logout } = useAuth();
  const router = useNavigationRouter();
  const validation = useInlineValidation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const otpInput = useRef<HTMLInputElement>(null);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    // Profile data can finish loading after Next.js attempts to scroll to the hash.
    if (window.location.hash === "#change-password") {
      section.current?.scrollIntoView({ block: "start" });
    }
  }, []);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function sendOtp() {
    if (pending.current || cooldown > 0) return;
    if (!currentPassword) {
      validation.show({ currentPassword: "Vui lòng nhập mật khẩu hiện tại." });
      return;
    }
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await sendPasswordChangeOtp(currentPassword);
      setSent(true);
      setOtp("");
      validation.clear("otp");
      setCooldown(60);
      notifySuccess("Đã gửi OTP xác nhận đổi mật khẩu về email của bạn.");
      window.setTimeout(() => otpInput.current?.focus(), 0);
    } catch (cause) {
      const message = validation.report(cause);
      setError(message);
      if (message) notifyError(message);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function submit() {
    if (pending.current) return;
    if (!sent) { await sendOtp(); return; }
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await changePassword({ currentPassword, newPassword, otp });
      setCurrentPassword(""); setNewPassword(""); setConfirmation(""); setOtp("");
      notifySuccess("Đã đổi mật khẩu. Vui lòng đăng nhập lại.");
      await logout();
      router.replace("/login");
    } catch (cause) {
      const message = validation.report(cause);
      setError(message);
      if (message) notifyError(message);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <section ref={section} id="change-password" aria-label="Đổi mật khẩu" className="mt-6 scroll-mt-36 rounded border border-td-rule bg-td-white p-5 sm:p-7">
      <h2 className="text-sm font-bold text-td-ink">Đổi mật khẩu</h2>
      <p className="mt-2 text-sm text-td-muted">Xác nhận bằng mã OTP gửi tới {user?.email || "email tài khoản"}. Sau khi đổi, bạn cần đăng nhập lại trên các thiết bị.</p>
      <ValidatedForm className="mt-5 space-y-5" validation={validation} aria-busy={busy}
        validate={() => sent ? {
          otp: /^[0-9]{6}$/.test(otp) ? undefined : "Vui lòng nhập mã OTP gồm 6 chữ số.",
          newPassword: newPassword.length >= 6 && newPassword.length <= 20 ? undefined : "Mật khẩu phải có từ 6 đến 20 ký tự.",
          confirmation: confirmation === newPassword ? undefined : "Mật khẩu xác nhận chưa khớp. Vui lòng nhập lại.",
        } : { currentPassword: currentPassword ? undefined : "Vui lòng nhập mật khẩu hiện tại." }}
        onSubmit={() => void submit()}>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <FormField label="Mật khẩu hiện tại" htmlFor="change-current-password">
          <InlineInput id="change-current-password" name="currentPassword" type="password" autoComplete="current-password" required
            className="admin-input" readOnly={busy} value={currentPassword} onChange={event => {
              setCurrentPassword(event.target.value);
              if (sent) { setSent(false); setOtp(""); validation.reset(); }
            }} />
        </FormField>
        {sent && <>
          <p role="status" className="border-l-2 border-td-oxide pl-3 text-sm text-td-muted">OTP đã được gửi. Vui lòng kiểm tra hộp thư đến hoặc thư rác.</p>
          <FormField label="Mã OTP" htmlFor="change-password-otp">
            <InlineInput ref={otpInput} id="change-password-otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code"
              required maxLength={6} pattern="[0-9]{6}" className="admin-input" readOnly={busy} value={otp}
              onChange={event => setOtp(event.target.value.replace(/\D/g, ""))} />
          </FormField>
          <FormField label="Mật khẩu mới" htmlFor="change-new-password">
            <InlineInput id="change-new-password" name="newPassword" type="password" autoComplete="new-password" required
              className="admin-input" readOnly={busy} value={newPassword} onChange={event => setNewPassword(event.target.value)} />
          </FormField>
          <FormField label="Xác nhận mật khẩu mới" htmlFor="change-confirm-password">
            <InlineInput id="change-confirm-password" name="confirmation" type="password" autoComplete="new-password" required
              className="admin-input" readOnly={busy} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
          </FormField>
        </>}
        <div className="flex flex-wrap gap-3 border-t border-td-rule pt-4">
          <Button type="submit" isLoading={busy} disabled={busy || (!sent && cooldown > 0)}>
            {sent ? "Xác nhận đổi mật khẩu" : cooldown > 0 ? `Gửi OTP (${cooldown}s)` : "Gửi OTP xác nhận"}
          </Button>
          {sent && <Button type="button" variant="secondary" disabled={busy || cooldown > 0} onClick={() => void sendOtp()}>
            {cooldown > 0 ? `Gửi lại OTP (${cooldown}s)` : "Gửi lại OTP"}
          </Button>}
        </div>
      </ValidatedForm>
    </section>
  );
}
