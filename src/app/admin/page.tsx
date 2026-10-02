import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Plus,
  UsersRound,
} from "lucide-react";

const metrics = [
  { label: "Đơn thuê hôm nay", value: "28", change: "+12,5%", icon: ClipboardCheck, tone: "emerald" },
  { label: "Phương tiện sẵn sàng", value: "64", change: "72% đội xe", icon: CarFront, tone: "blue" },
  { label: "Khách hàng mới", value: "16", change: "+8,2%", icon: UsersRound, tone: "violet" },
  { label: "Doanh thu tháng", value: "248,6 tr", change: "+14,3%", icon: CircleDollarSign, tone: "amber" },
] as const;

const recentBookings = [
  { id: "TD-2026-0814", customer: "Trần Hoàng Nam", vehicle: "Toyota Vios 2024", time: "09:20", status: "Đang thuê", statusStyle: "bg-blue-50 text-blue-700" },
  { id: "TD-2026-0813", customer: "Lê Ngọc Hà", vehicle: "VinFast VF 5 Plus", time: "09:05", status: "Chờ nhận xe", statusStyle: "bg-amber-50 text-amber-700" },
  { id: "TD-2026-0812", customer: "Phạm Minh Khoa", vehicle: "Honda City 2023", time: "08:42", status: "Đã xác nhận", statusStyle: "bg-emerald-50 text-emerald-700" },
  { id: "TD-2026-0811", customer: "Nguyễn Thảo Vy", vehicle: "Yamaha Grande 2024", time: "08:16", status: "Hoàn tất", statusStyle: "bg-slate-100 text-slate-600" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <CalendarDays className="h-4 w-4 text-emerald-700" />
            Thứ Sáu, ngày 02 tháng 10, 2026
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Chào buổi sáng, Minh Anh 👋</h2>
          <p className="mt-2 text-sm text-slate-500">Đây là tình hình hoạt động tại chi nhánh của bạn hôm nay.</p>
        </div>
        <Link href="/admin/vehicles/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:bg-emerald-800">
          <Plus className="h-4 w-4" />
          Thêm phương tiện
        </Link>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
        <p><span className="font-bold">Dữ liệu minh họa.</span> Số liệu dashboard sẽ được kết nối với hệ thống khi tích hợp API quản trị.</p>
      </div>

      <section aria-label="Chỉ số hoạt động" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, change, icon: Icon, tone }) => {
          const colors = {
            emerald: "bg-emerald-50 text-emerald-700",
            blue: "bg-sky-50 text-sky-700",
            violet: "bg-violet-50 text-violet-700",
            amber: "bg-amber-50 text-amber-700",
          };
          return (
            <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="h-5 w-5" /></span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <ArrowUpRight className="h-3.5 w-3.5" />{change}
                </span>
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="font-bold text-slate-900">Đơn thuê gần đây</h3>
              <p className="mt-1 text-xs text-slate-500">Các đơn được cập nhật tại chi nhánh</p>
            </div>
            <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900">
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr><th className="px-6 py-3">Mã đơn / Khách hàng</th><th className="px-4 py-3">Phương tiện</th><th className="px-4 py-3">Giờ tạo</th><th className="px-6 py-3">Trạng thái</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="text-sm">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{booking.customer}</p>
                      <p className="mt-1 text-xs text-slate-400">{booking.id}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{booking.vehicle}</td>
                    <td className="px-4 py-4 text-slate-500">{booking.time}</td>
                    <td className="px-6 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${booking.statusStyle}`}>{booking.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">Danh sách demo · 4 đơn gần nhất</div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Tình trạng đội xe</h3>
              <p className="mt-1 text-xs text-slate-500">Theo trạng thái hiện tại</p>
            </div>
            <CarFront className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="my-6 flex items-center gap-5">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full" style={{ background: "conic-gradient(#059669 0% 72%, #f59e0b 72% 86%, #e2e8f0 86% 100%)" }}>
              <div className="flex h-[82px] w-[82px] flex-col items-center justify-center rounded-full bg-white">
                <span className="text-xl font-bold text-slate-900">89</span>
                <span className="text-[10px] text-slate-400">phương tiện</span>
              </div>
            </div>
            <div className="space-y-3 text-xs">
              <FleetLegend color="bg-emerald-600" label="Sẵn sàng" value="64" />
              <FleetLegend color="bg-amber-500" label="Đang thuê" value="12" />
              <FleetLegend color="bg-slate-300" label="Bảo dưỡng" value="13" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-xs">
            <span className="font-medium text-emerald-900">Tỷ lệ sẵn sàng</span>
            <span className="font-bold text-emerald-800">72%</span>
          </div>
          <Link href="/admin/vehicles/new" className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800">
            Quản lý phương tiện <ArrowDownRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

function FleetLegend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-slate-500">{label}</span>
      <span className="ml-auto font-bold text-slate-800">{value}</span>
    </div>
  );
}
