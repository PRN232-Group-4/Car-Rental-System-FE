"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { getDashboardData } from "@/features/admin/api";
import { parseDashboardSnapshot, getDashboardFleet } from "@/features/admin/dashboard-data";
import { useReports } from "@/features/admin/reports/hooks";
import { getReportTypeLabel, getWaitTimeText, isSlaBreached } from "@/features/admin/reports/report-status";
import CreateVehicleButton from "@/features/admin/CreateVehicleButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { ArrowRight, Clock, RefreshCw } from "lucide-react";

export function OperatingPulse() {
  const { hasRole } = useAuth();
  const canManage = hasRole("admin") || hasRole("manager");

  // 1. Dashboard snapshot query
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => parseDashboardSnapshot(await getDashboardData()),
    staleTime: 30_000,
    retry: false,
  });

  // 2. Fleet breakdown query
  const fleetQuery = useQuery({
    queryKey: ["admin-dashboard-fleet"],
    queryFn: getDashboardFleet,
    staleTime: 30_000,
    retry: false,
  });

  // 3. Real pending incident reports query
  const reportsQuery = useReports({ status: "pending" });

  const data = dashboardQuery.data;
  const isLoading = dashboardQuery.isPending || fleetQuery.isPending;
  const isError = dashboardQuery.isError;

  // Format currency
  const formatMoney = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "—";
    return `${new Intl.NumberFormat("vi-VN").format(val)} ₫`;
  };

  // Format number
  const formatNum = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "—";
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  // Compute fleet counts
  const fleetCounts = useMemo(() => {
    const items = fleetQuery.data ?? [];
    const available = items.find((i) => i.key === "available")?.value ?? 0;
    const rented = items.find((i) => i.key === "rented")?.value ?? 0;
    const maintenance = items.find((i) => i.key === "maintenance")?.value ?? 0;
    const other = items.find((i) => i.key === "other")?.value ?? 0;
    const total = available + rented + maintenance + other;
    return { total, available, rented, maintenance, other };
  }, [fleetQuery.data]);

  // Priority reports queue (top 4 pending)
  const pendingQueue = useMemo(() => {
    const list = reportsQuery.data?.items ?? [];
    return list.slice(0, 4);
  }, [reportsQuery.data?.items]);

  // Current date in GMT+7
  const todayStr = useMemo(() => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = String(now.getFullYear()).slice(-2);
    return `${d}.${m}/${y}`;
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Folio Top / Masthead Summary */}
      <div className="flex flex-col justify-between gap-6 border-b border-td-rule pb-6 lg:flex-row lg:items-end">
        <div className="flex items-start gap-5">
          <span className="font-mono text-xs font-bold text-td-oxide border-t-2 border-td-oxide pt-1 min-w-[42px]">
            01<br />OPS
          </span>
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">
              TRẠM VẬN HÀNH · CA TRỰC ĐIỀU HÀNH
            </span>
            <h1 className="mt-1 font-sans text-3xl font-bold tracking-tight text-td-ink sm:text-4xl md:text-5xl">
              Ca trực <em className="italic text-td-teal">đang diễn ra.</em>
            </h1>
            <p className="mt-2 max-w-xl text-xs sm:text-sm text-td-muted leading-relaxed">
              Các mốc quyết định trong một hành trình thuê xe. Tập trung vào sự cố sắp vượt hạn SLA và đơn cần bàn giao tại trạm.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-start lg:self-end">
          <div className="border-l border-td-rule pl-4 text-right">
            <span className="block font-mono text-[10px] text-td-muted tracking-wider">
              NHẬT KÝ CA · ASIA/HO_CHI_MINH
            </span>
            <strong className="block font-sans text-3xl font-bold tracking-tight text-td-ink">
              {todayStr}
            </strong>
          </div>
          {canManage && <CreateVehicleButton />}
        </div>
      </div>

      {isError && (
        <ErrorState
          message="Không thể tải dữ liệu chỉ số tổng quan. Vui lòng thử lại."
          onRetry={() => void dashboardQuery.refetch()}
        />
      )}

      {/* 2. Operational Track (Lifecycle Track) */}
      <section aria-label="Vòng đời vận hành" className="border-y-2 border-td-ink py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stop 1: Renting */}
          <div className="relative border-l border-td-rule pl-5 first:border-l-0">
            <span className="block font-mono text-[11px] text-td-muted uppercase font-semibold">
              01 · Đang lưu hành
            </span>
            <strong className="mt-2 block font-sans text-4xl font-bold text-td-ink tracking-tight">
              {isLoading ? <Skeleton className="h-10 w-24" /> : formatNum(data?.renting)}
            </strong>
            <span className="mt-2 block font-mono text-xs text-td-muted">
              Đơn thuê đang trong hành trình
            </span>
          </div>

          {/* Stop 2: Maintenance */}
          <div className="relative border-l border-td-rule pl-5">
            <span className="block font-mono text-[11px] text-td-muted uppercase font-semibold">
              02 · Bảo dưỡng
            </span>
            <strong className={`mt-2 block font-sans text-4xl font-bold tracking-tight ${data?.maintenance && data.maintenance > 0 ? "text-td-oxide" : "text-td-ink"}`}>
              {isLoading ? <Skeleton className="h-10 w-24" /> : formatNum(data?.maintenance)}
            </strong>
            <span className="mt-2 block font-mono text-xs text-td-muted">
              Phiếu kỹ thuật đang mở
            </span>
          </div>

          {/* Stop 3: Active Subscriptions */}
          <div className="relative border-l border-td-rule pl-5">
            <span className="block font-mono text-[11px] text-td-muted uppercase font-semibold">
              03 · Gói hiệu lực
            </span>
            <strong className="mt-2 block font-sans text-4xl font-bold text-td-ink tracking-tight">
              {isLoading ? <Skeleton className="h-10 w-24" /> : formatNum(data?.activeSubscriptions)}
            </strong>
            <span className="mt-2 block font-mono text-xs text-td-muted">
              Gói hội viên đang hoạt động
            </span>
          </div>

          {/* Stop 4: Paid Revenue */}
          <div className="relative border-l border-td-rule pl-5">
            <span className="block font-mono text-[11px] text-td-muted uppercase font-semibold">
              04 · Doanh thu lũy kế
            </span>
            <strong className="mt-2 block font-sans text-3xl font-bold text-td-ink tracking-tight">
              {isLoading ? <Skeleton className="h-10 w-32" /> : formatMoney(data?.revenue)}
            </strong>
            <span className="mt-2 block font-mono text-xs text-td-muted">
              Tổng hóa đơn đã thanh toán
            </span>
          </div>
        </div>
      </section>

      {/* 3. Operational Workspace: Triage Queue + Instrument Plate */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Priority Queue (Đến lượt xử lý) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-baseline justify-between border-b border-td-ink pb-3">
            <h2 className="font-sans text-2xl font-bold text-td-ink">
              Đến lượt xử lý
            </h2>
            <span className="font-mono text-xs text-td-muted uppercase tracking-wider">
              SORTED · SLA ATTENTION
            </span>
          </div>

          {reportsQuery.isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-16 w-full rounded" />
              <Skeleton className="h-16 w-full rounded" />
              <Skeleton className="h-16 w-full rounded" />
            </div>
          ) : pendingQueue.length === 0 ? (
            <div className="border border-td-rule bg-td-white p-6 text-center">
              <p className="font-mono text-xs text-td-muted">
                Hiện không có sự cố nào đang chờ xử lý tại trạm.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-td-rule border-b border-td-rule">
              {pendingQueue.map((report, idx) => {
                const isOverdue = isSlaBreached(report.createdAt, report.status);
                const waitStr = getWaitTimeText(report.createdAt, report.resolvedAt);

                return (
                  <Link
                    key={report.id}
                    href={`/admin/reports?id=${report.id}`}
                    className="grid grid-cols-12 items-center gap-4 py-4 px-2 hover:bg-td-chalk/50 transition-colors cursor-pointer group"
                  >
                    <div className="col-span-1 font-mono text-xl font-bold text-td-oxide">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="col-span-8 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-td-muted">
                          SỰ CỐ #{report.id} · {getReportTypeLabel(report.type)}
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-td-ink truncate mt-0.5">
                        {report.descriptionPreview || "Không có tóm tắt nội dung"}
                      </div>
                      <div className="text-xs text-td-muted mt-1">
                        Khách: {report.customer.fullName}
                      </div>
                    </div>
                    <div className="col-span-3 text-right">
                      <div className={`font-mono text-xs font-bold ${isOverdue ? "text-td-oxide" : "text-td-ink"}`}>
                        {waitStr}
                      </div>
                      <span className="font-mono text-[10px] text-td-muted uppercase">
                        {isOverdue ? "QUÁ HẠN SLA" : "CHỜ PHẢN HỒI"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-2 font-mono text-xs font-bold text-td-ink hover:text-td-oxide transition-colors"
            >
              <span>Xem toàn bộ danh sách sự cố trạm</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Instrument Plate (Công cụ phân phối đội xe) */}
        <aside className="lg:col-span-5 rounded border border-td-rule bg-td-white p-6 text-td-ink flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-td-rule pb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-td-muted">
                INSTRUMENT · FLEET CAPACITY
              </span>
              <button
                type="button"
                onClick={() => void fleetQuery.refetch()}
                aria-label="Cập nhật đội xe"
                className="text-td-muted hover:text-td-ink cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${fleetQuery.isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="my-6">
              <div className="font-sans text-5xl font-bold tracking-tight text-td-ink">
                {isLoading ? <Skeleton className="h-14 w-32" /> : fleetCounts.available}
                <span className="ml-3 font-mono text-sm tracking-normal text-td-muted">
                  / {fleetCounts.total} XE SẴN SÀNG
                </span>
              </div>
              <p className="mt-2 text-xs text-td-muted leading-relaxed">
                Số lượng phương tiện có thể bàn giao ngay theo thời gian thực từ dữ liệu cơ sở hệ thống.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-td-rule pt-4 font-mono text-xs">
            <div>
              <span className="block text-[10px] text-td-muted uppercase">ĐANG THUÊ</span>
              <strong className="text-base text-td-ink">{fleetCounts.rented}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-td-muted uppercase">BẢO DƯỠNG</span>
              <strong className="text-base text-td-oxide">{fleetCounts.maintenance}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-td-muted uppercase">TẠM NGƯNG</span>
              <strong className="text-base text-td-muted">{fleetCounts.other}</strong>
            </div>
          </div>
        </aside>
      </div>

      {/* 4. Operations Bottom Strip: Task shortcuts */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 border-t border-td-rule pt-6">
        <Link
          href="/admin/rentals"
          className="p-5 border border-td-rule bg-td-white hover:border-td-ink transition-colors rounded group"
        >
          <span className="font-mono text-[10px] font-bold text-td-muted uppercase">01 · VẬN HÀNH</span>
          <h3 className="mt-1 font-semibold text-base text-td-ink group-hover:text-td-oxide transition-colors">
            Bàn giao & Nhận xe
          </h3>
          <p className="mt-2 text-xs text-td-muted">
            Tra cứu đơn thuê, gán tài xế và chuyển trạng thái hành trình theo biên bản kiểm tra.
          </p>
        </Link>

        <Link
          href="/admin/vehicles"
          className="p-5 border border-td-rule bg-td-white hover:border-td-ink transition-colors rounded group"
        >
          <span className="font-mono text-[10px] font-bold text-td-muted uppercase">02 · ĐỘI XE</span>
          <h3 className="mt-1 font-semibold text-base text-td-ink group-hover:text-td-oxide transition-colors">
            Sổ phương tiện
          </h3>
          <p className="mt-2 text-xs text-td-muted">
            Tra cứu biển số, đối chiếu lịch sử bảo dưỡng và quản lý trạng thái phương tiện tại các trạm.
          </p>
        </Link>

        <Link
          href="/admin/inspections"
          className="p-5 border border-td-rule bg-td-white hover:border-td-ink transition-colors rounded group"
        >
          <span className="font-mono text-[10px] font-bold text-td-muted uppercase">03 · BẰNG CHỨNG</span>
          <h3 className="mt-1 font-semibold text-base text-td-ink group-hover:text-td-oxide transition-colors">
            Biên bản kiểm tra xe
          </h3>
          <p className="mt-2 text-xs text-td-muted">
            Lưu ảnh hiện trường, chỉ số công tơ mét và mức pin/nhiên liệu trước và sau thuê.
          </p>
        </Link>
      </div>
    </div>
  );
}

export default OperatingPulse;
