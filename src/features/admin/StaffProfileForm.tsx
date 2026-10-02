"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const staff = {
  name: "Nguyễn Minh Anh",
  code: "TD-ST-0248",
  role: "Quản lý chi nhánh",
  department: "Vận hành",
  facility: "Chi nhánh Quận 1",
  email: "minhanh@thongdong.vn",
  phone: "090 123 4567",
};

export default function StaffProfileForm() {
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          Tài khoản nhân viên
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Hồ sơ của tôi
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Xem và cập nhật thông tin liên hệ của bạn.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
        <div className="relative bg-gradient-to-r from-[#10231f] to-[#175942] px-6 pb-6 pt-8 sm:px-8">
          <div className="absolute right-8 top-6 hidden opacity-10 sm:block">
            <UserRound className="h-32 w-32 text-white" />
          </div>
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="flex h-[76px] w-[76px] items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-bold text-white shadow-lg">
              MA
            </span>
            <div className="text-white">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold">{staff.name}</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                  <BadgeCheck className="h-3.5 w-3.5" /> Đang hoạt động
                </span>
              </div>
              <p className="mt-1 text-sm text-emerald-100/80">
                {staff.role} · Mã nhân viên {staff.code}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          onChange={() => setSaved(false)}
          className="p-5 sm:p-8"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Thông tin cá nhân</h3>
              <p className="mt-1 text-xs text-slate-500">
                Các trường có dấu * là bắt buộc.
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Họ và tên" icon={<UserRound className="h-4 w-4" />}>
              <input
                name="name"
                required
                defaultValue={staff.name}
                autoComplete="name"
                className="admin-input"
              />
            </Field>
            <Field label="Email công việc" icon={<Mail className="h-4 w-4" />}>
              <input
                name="email"
                type="email"
                required
                defaultValue={staff.email}
                autoComplete="email"
                className="admin-input"
              />
            </Field>
            <Field label="Số điện thoại" icon={<Phone className="h-4 w-4" />}>
              <input
                name="phone"
                type="tel"
                required
                defaultValue={staff.phone}
                autoComplete="tel"
                className="admin-input"
              />
            </Field>
            <Field label="Phòng ban" icon={<Building2 className="h-4 w-4" />}>
              <input
                name="department"
                defaultValue={staff.department}
                readOnly
                className="admin-input bg-slate-50 text-slate-500"
              />
            </Field>
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Thông tin công việc
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {staff.role} · {staff.facility}. Liên hệ quản trị viên để cập
                nhật chức vụ hoặc chi nhánh.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
            <p
              aria-live="polite"
              className="text-sm font-medium text-emerald-700"
            >
              {saved
                ? "Biểu mẫu hợp lệ. API sẽ lưu thay đổi khi được tích hợp."
                : ""}
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:bg-emerald-800"
            >
              {saved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Đã kiểm tra" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
