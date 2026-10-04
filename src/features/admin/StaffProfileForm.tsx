"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BadgeCheck, Building2, Check, Mail, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { getAccountProfile } from "@/features/profile/api";
import { getStaffById, updateStaff } from "./api";
import type { StaffDto } from "./api";
import DriverLicenseProfile from "./DriverLicenseProfile";

export default function StaffProfileForm() {
  const [staff, setStaff] = useState<StaffDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const account = await getAccountProfile();
          if (account.staffId == null) throw new Error("Tài khoản hiện tại chưa được liên kết với hồ sơ nhân viên.");
          setStaff(await getStaffById(account.staffId));
        } catch (loadError) {
          setError(messageOf(loadError, "Không thể tải hồ sơ nhân viên."));
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!staff) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await updateStaff(staff.id, {
        fullName: String(form.get("fullName") ?? ""),
        phone: String(form.get("phone") ?? ""),
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
      setStaff(updated);
      setSaved(true);
    } catch (saveError) {
      setError(messageOf(saveError, "Không thể lưu hồ sơ nhân viên."));
    } finally {
      setSaving(false);
    }
  };

  const initials = (staff?.fullName ?? staff?.email ?? "ST")
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Tài khoản nhân viên</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Hồ sơ của tôi</h2>
        <p className="mt-2 text-sm text-slate-500">Xem và cập nhật thông tin liên hệ của bạn.</p>
      </div>
      {loading && <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Đang tải hồ sơ...</p>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {staff && (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
            <div className="relative bg-gradient-to-r from-[#10231f] to-[#175942] px-6 pb-6 pt-8 sm:px-8">
              <div className="absolute right-8 top-6 hidden opacity-10 sm:block"><UserRound className="h-32 w-32 text-white" /></div>
              <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <span className="flex h-[76px] w-[76px] items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-bold text-white shadow-lg">{initials}</span>
                <div className="text-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold">{staff.fullName ?? staff.email}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-100"><BadgeCheck className="h-3.5 w-3.5" />{staff.isActive ? "Đang hoạt động" : "Tạm ngưng"}</span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-100/80">{staff.staffRole ?? "Nhân viên"} · Mã nhân viên {staff.id}</p>
                </div>
              </div>
            </div>

            <form key={staff.id} onSubmit={submit} onChange={() => setSaved(false)} className="p-5 sm:p-8">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><UserRound className="h-5 w-5" /></div>
                <div><h3 className="font-bold text-slate-900">Thông tin cá nhân</h3><p className="mt-1 text-xs text-slate-500">Cập nhật thông tin liên hệ của nhân viên.</p></div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Họ và tên" icon={<UserRound className="h-4 w-4" />}><input name="fullName" required defaultValue={staff.fullName ?? ""} autoComplete="name" className="admin-input" /></Field>
                <Field label="Email công việc" icon={<Mail className="h-4 w-4" />}><input type="email" readOnly value={staff.email ?? ""} className="admin-input bg-slate-50 text-slate-500" /></Field>
                <Field label="Số điện thoại" icon={<Phone className="h-4 w-4" />}><input name="phone" required defaultValue={staff.phone ?? ""} autoComplete="tel" className="admin-input" /></Field>
                <Field label="Phòng ban" icon={<Building2 className="h-4 w-4" />}><input readOnly value={staff.departmentName ?? "Chưa phân công"} className="admin-input bg-slate-50 text-slate-500" /></Field>
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <div><p className="text-sm font-semibold text-slate-800">Thông tin công việc</p><p className="mt-1 text-xs leading-5 text-slate-500">{staff.staffRole ?? "Nhân viên"} · {staff.facilityName ?? "Chưa phân công chi nhánh"}. Liên hệ quản trị viên để thay đổi chức vụ hoặc chi nhánh.</p></div>
              </div>
              <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                <p aria-live="polite" className="text-sm font-medium text-emerald-700">{saved ? "Đã lưu hồ sơ nhân viên." : ""}</p>
                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:bg-emerald-800 disabled:opacity-60">{saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
              </div>
            </form>
          </div>
          {staff.isDriver && <DriverLicenseProfile staff={staff} onUpdated={setStaff} />}
        </>
      )}
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div><label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><span className="text-slate-400">{icon}</span>{label}</label>{children}</div>;
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
