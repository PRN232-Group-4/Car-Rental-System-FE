"use client";

import { ValidatedForm, useInlineValidation, InlineInput } from "@/components/forms/inline-validation";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BadgeCheck, Building2, Check, Mail, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { getAccountProfile, updateAccountProfile } from "@/features/profile/api";
import { getFacilities, getStaffById, updateStaff } from "./api";
import type { StaffDto } from "./api";
import DriverLicenseProfile from "./DriverLicenseProfile";
import AccountAvatar from "@/components/ui/AccountAvatar";
import { FormField as Field } from "@/components/ui/FormField";
import { useAuth } from "@/features/auth";

export default function StaffProfileForm() {
  const { user, refreshProfile } = useAuth();
  const [staff, setStaff] = useState<StaffDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const validation = useInlineValidation();
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const account = await getAccountProfile();
          if (!active) return;
          const adminCheck = (account.roles ?? []).some(
            (r) => r.toLowerCase() === "admin",
          );
          setIsAdmin(adminCheck);

          const facilities = await getFacilities().catch(() => []);
          const facility = facilities.find((f) => f.id === account.facilityId);

          let staffData: StaffDto | null = null;
          if (adminCheck && account.staffId != null) {
            try {
              staffData = await getStaffById(account.staffId);
            } catch {
              // Fallback to synthesizing profile from account
            }
          }

          if (!staffData) {
            const roleList = (account.roles ?? []).map((r) => r.toLowerCase());
            let computedRole = account.departmentName || "Nhân viên";
            if (roleList.includes("admin")) computedRole = "Quản trị viên";
            else if (roleList.includes("manager")) computedRole = "Quản lý";
            else if (roleList.includes("customerservice")) computedRole = "Chăm sóc khách hàng";
            else if (roleList.includes("maintenance")) computedRole = "Kỹ thuật viên";
            else if (roleList.includes("driver")) computedRole = "Tài xế";

            staffData = {
              id: account.staffId ?? 0,
              userId: 0,
              email: account.email ?? null,
              fullName: account.fullName ?? null,
              phone: account.phone ?? null,
              departmentId: account.departmentId ?? null,
              departmentName: account.departmentName ?? null,
              facilityId: account.facilityId ?? null,
              facilityName: facility?.name ?? null,
              hiredDate: null,
              isDriver:
                roleList.includes("driver") ||
                account.departmentName?.toLowerCase() === "driver",
              licenseNumber: null,
              licenseType: null,
              licenseIssueDate: null,
              licenseExpiryDate: null,
              licenseImageUrl: null,
              rating: null,
              isActive: true,
              staffRole: computedRole,
            };
          }

          if (active) {
            setStaff(staffData);
            setError("");
          }
        } catch (loadError) {
          if (active) {
            setError(messageOf(loadError, "Không thể tải hồ sơ nhân viên."));
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!staff) return;
    const form = new FormData(event.currentTarget);
    const newFullName = String(form.get("fullName") ?? "").trim();
    const newPhone = String(form.get("phone") ?? "").trim();

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      // 1. Cập nhật hồ sơ tài khoản (dành cho mọi vai trò mà không lo 403)
      await updateAccountProfile({
        fullName: newFullName,
        phone: newPhone,
        gender: "other",
      });

      // 2. Nếu là Admin và có staffId, cập nhật thêm bản ghi staff
      if (isAdmin && staff.id > 0) {
        try {
          await updateStaff(staff.id, {
            fullName: newFullName,
            phone: newPhone,
            departmentId: staff.departmentId,
            facilityId: staff.facilityId,
            hiredDate: staff.hiredDate,
            isDriver: staff.isDriver,
            licenseNumber: staff.licenseNumber,
            licenseType: staff.licenseType,
            licenseIssueDate: staff.licenseIssueDate,
            licenseExpiryDate: staff.licenseExpiryDate,
            licenseImageUrl: staff.licenseImageUrl,
            staffRole: staff.staffRole ?? "",
          });
        } catch {
          // Bỏ qua lỗi staff nếu updateAccountProfile đã thành công
        }
      }

      setStaff((prev) => (prev ? { ...prev, fullName: newFullName, phone: newPhone } : null));
      await refreshProfile();
      setSaved(true);
    } catch (saveError) {
      setError(validation.report(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Hồ sơ của tôi</h2>
        <p className="mt-2 text-sm text-ink-2">Xem và cập nhật thông tin liên hệ của bạn.</p>
      </div>
      {loading && <p role="status" className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-2">Đang tải hồ sơ...</p>}
      {error && <p role="alert" className="rounded-xl border border-danger-bg bg-danger-bg/50 px-4 py-3 text-sm text-danger">{error}</p>}

      {staff && (
        <>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
          <div className="relative bg-stage-ink border-b border-white/10 px-6 pb-6 pt-8 sm:px-8">
            <div className="absolute right-8 top-6 hidden opacity-10 sm:block"><UserRound className="h-32 w-32 text-white" /></div>
            <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <AccountAvatar src={user?.avatarUrl} name={staff.fullName ?? staff.email} size={76} className="h-[76px] w-[76px] rounded-2xl border border-white/20 bg-surface/10 text-2xl font-bold text-white shadow-lg" />
              <div className="text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold">{staff.fullName ?? staff.email}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary-tint"><BadgeCheck className="h-3.5 w-3.5" />{staff.isActive ? "Đang hoạt động" : "Tạm ngưng"}</span>
                </div>
                <p className="mt-1 text-sm text-ink-3">{staff.staffRole ?? "Nhân viên"} {staff.id > 0 ? `· Mã nhân viên ${staff.id}` : ""}</p>
              </div>
            </div>
          </div>

          <ValidatedForm validation={validation} key={staff.id} onSubmit={submit} onChange={() => setSaved(false)} className="p-5 sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound className="h-5 w-5" /></div>
              <div><h3 className="font-bold text-ink">Thông tin cá nhân</h3><p className="mt-1 text-xs text-ink-3">Cập nhật thông tin liên hệ của nhân viên.</p></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Họ và tên" htmlFor="fullName" icon={<UserRound className="h-4 w-4" />}><InlineInput name="fullName" required defaultValue={staff.fullName ?? ""} autoComplete="name" className="admin-input" /></Field>
              <Field label="Email công việc" htmlFor="email" icon={<Mail className="h-4 w-4" />}><InlineInput type="email" readOnly value={staff.email ?? ""} className="admin-input bg-sunken text-ink-3" /></Field>
              <Field label="Số điện thoại" htmlFor="phone" icon={<Phone className="h-4 w-4" />}><InlineInput name="phone" required defaultValue={staff.phone ?? ""} autoComplete="tel" className="admin-input" /></Field>
              <Field label="Phòng ban" htmlFor="departmentName" icon={<Building2 className="h-4 w-4" />}><InlineInput readOnly value={staff.departmentName ?? "Chưa phân công"} className="admin-input bg-sunken text-ink-3" /></Field>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-sunken p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ink-3" />
              <div><p className="text-sm font-semibold text-ink">Thông tin công việc</p><p className="mt-1 text-xs leading-5 text-ink-2">{staff.staffRole ?? "Nhân viên"} · {staff.facilityName ?? "Chưa phân công chi nhánh"}. Liên hệ quản trị viên để thay đổi chức vụ hoặc chi nhánh.</p></div>
            </div>
            <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
              <p aria-live="polite" className="text-sm font-medium text-success">{saved ? "Đã lưu hồ sơ nhân viên." : ""}</p>
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-e1 transition hover:bg-primary-hover disabled:opacity-60">{saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
            </div>
          </ValidatedForm>
        </div>
        {staff.isDriver && <DriverLicenseProfile staff={staff} onUpdated={setStaff} />}
        </>
      )}
    </div>
  );
}


function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
