"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/navigation/NavigationLink";
import { ArrowRight, CalendarDays, CarFront, CircleDollarSign, ClipboardCheck, UsersRound } from "lucide-react";
import { getDashboardData } from "@/features/admin/api";
import { useAuth } from "@/features/auth";
import CreateVehicleButton from "@/features/admin/CreateVehicleButton";
import { StatCard } from "@/components/ui/StatCard";
import { SkeletonStat } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { DashboardCharts } from "@/features/admin/DashboardCharts";
import { parseDashboardSnapshot } from "@/features/admin/dashboard-data";

export default function AdminDashboardPage() {
  const { hasRole } = useAuth();
  const dashboard = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => parseDashboardSnapshot(await getDashboardData()),
    staleTime: 30_000,
    retry: false,
  });
  const loading = dashboard.isPending;
  const error = dashboard.isError ? "Không thể tải số liệu tổng quan. Vui lòng thử lại." : "";
  const data = dashboard.data;
  const entries = data ? [
    { label: "Tổng doanh thu hóa đơn đã thanh toán", value: data.revenue === null ? "—" : `${new Intl.NumberFormat("vi-VN").format(data.revenue)} ₫` },
    { label: "Đơn đang thuê", value: data.renting === null ? "—" : new Intl.NumberFormat("vi-VN").format(data.renting) },
    { label: "Phiếu bảo dưỡng đang mở", value: data.maintenance === null ? "—" : new Intl.NumberFormat("vi-VN").format(data.maintenance) },
    { label: "Gói thuê còn hiệu lực", value: data.activeSubscriptions === null ? "—" : new Intl.NumberFormat("vi-VN").format(data.activeSubscriptions) },
  ] : [];

  const isAdmin = hasRole("admin");
  const isManager = hasRole("manager");
  const canManage = isAdmin || isManager;

  const icons = [CircleDollarSign, ClipboardCheck, CarFront, UsersRound];

  const adminLinks = [
    { label: "Dashboard biểu đồ", href: "/admin/dashboard", visible: canManage },
    { label: "Báo cáo sự cố", href: "/admin/reports", visible: true },
    { label: "Đánh giá nhân sự", href: "/admin/reviews", visible: canManage },
    { label: "Quản lý phương tiện", href: "/admin/vehicles", visible: true },
    { label: "Loại phương tiện", href: "/admin/vehicle-types", visible: true },
    { label: "Chính sách thuê xe", href: "/admin/policies", visible: canManage },
    { label: "Gói đăng ký", href: "/admin/subscription-plans", visible: true },
    { label: "Phòng ban", href: "/admin/departments", visible: isAdmin },
    { label: "Chi nhánh", href: "/admin/facilities", visible: true },
    { label: "Nhân viên", href: "/admin/staffs", visible: isAdmin },
    { label: "Hồ sơ nhân viên", href: "/admin/profile", visible: true },
  ].filter((item) => item.visible);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            Tổng quan hệ thống
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Dashboard quản trị</h2>
          <p className="mt-2 text-sm text-ink-3">Các chỉ số được tải trực tiếp từ API quản trị.</p>
        </div>
        {canManage && <CreateVehicleButton />}
      </div>

      {error && <ErrorState message={error} onRetry={() => void dashboard.refetch()} />}

      {loading && (
        <section aria-label="Đang tải chỉ số" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonStat key={index} />
          ))}
        </section>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="rounded-xl border border-line bg-surface px-4 py-5 text-sm text-ink-3">
          API chưa trả về chỉ số dashboard.
        </p>
      )}

      {!loading && !error && entries.length > 0 && (
        <section aria-label="Chỉ số hoạt động" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {entries.map((entry, index) => {
            const Icon = icons[index % icons.length];
            return (
              <StatCard
                key={entry.label}
                icon={Icon}
                label={entry.label}
                value={entry.value}
              />
            );
          })}
        </section>
      )}

      <DashboardCharts data={data} loading={loading} error={error} onRetry={() => { void dashboard.refetch(); }} />

      <section className="rounded-2xl border border-line bg-surface p-5 shadow-e1 sm:p-6">
        <h3 className="font-bold text-ink">Quản lý hệ thống</h3>
        <p className="mt-1 text-sm text-ink-3">Truy cập nhanh các trang quản trị đã kết nối.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {adminLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              {label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
