"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CarFront, CircleDollarSign, ClipboardCheck, UsersRound } from "lucide-react";
import { getDashboardData } from "@/features/admin/api";

type DashboardEntry = { label: string; value: string };

export default function AdminDashboardPage() {
  const [entries, setEntries] = useState<DashboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void getDashboardData()
        .then((data) => setEntries(toEntries(data)))
        .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu dashboard."))
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const icons = [ClipboardCheck, CarFront, UsersRound, CircleDollarSign];

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500"><CalendarDays className="h-4 w-4 text-emerald-700" />Tổng quan hệ thống</div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Dashboard quản trị</h2>
          <p className="mt-2 text-sm text-slate-500">Các chỉ số được tải trực tiếp từ API quản trị.</p>
        </div>
        <Link href="/admin/vehicles/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:bg-emerald-800">
          <CarFront className="h-4 w-4" /> Thêm phương tiện
        </Link>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {loading && <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Đang tải dữ liệu dashboard...</p>}
      {!loading && !error && entries.length === 0 && <p className="rounded-xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-600">API chưa trả về chỉ số dashboard.</p>}

      <section aria-label="Chỉ số hoạt động" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {entries.map((entry, index) => {
          const Icon = icons[index % icons.length];
          return (
            <article key={entry.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span>
              <p className="mt-5 text-sm font-medium text-slate-500">{entry.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{entry.value}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="font-bold text-slate-900">Quản lý hệ thống</h3>
        <p className="mt-1 text-sm text-slate-500">Truy cập nhanh các trang quản trị đã kết nối.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Phương tiện", "/admin/vehicles"],
            ["Loại phương tiện", "/admin/vehicle-types"],
            ["Chính sách thuê", "/admin/policies"],
            ["Gói đăng ký", "/admin/subscription-plans"],
            ["Phòng ban", "/admin/departments"],
            ["Chi nhánh", "/admin/facilities"],
            ["Nhân viên", "/admin/staffs"],
            ["Hồ sơ của tôi", "/admin/profile"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800">
              {label}<ArrowRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function toEntries(data: unknown): DashboardEntry[] {
  if (typeof data !== "object" || data === null) return [];
  return Object.entries(data)
    .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value) || value === null)
    .map(([key, value]) => ({
      label: key.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/^./, (letter) => letter.toLocaleUpperCase()),
      value: value === null ? "—" : String(value),
    }));
}
