"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  MessageSquareWarning,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useReports } from "@/features/admin/reports/hooks";
import {
  getReportStatusMeta,
  getReportTypeLabel,
  getWaitTimeText,
  isSlaBreached,
} from "@/features/admin/reports/report-status";
import { ReportDrawer } from "@/features/admin/reports/components/ReportDrawer";
import type { ReportListItem, ReportFilterParams } from "@/features/admin/reports/types";
import { formatDateTime } from "@/lib/time";
import TransitDeskStatus from "./TransitDeskStatus";
import { TransitFolio, TransitFolioMetric } from "./TransitFolio";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { RentalVehiclePhotos } from "@/features/admin/VehiclePhotos";

const subscribeNoChange = () => () => {};
const getReportIdFromUrl = () => {
  const id = new URLSearchParams(window.location.search).get("id");
  const parsed = id ? Number(id) : Number.NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export function IncidentTriage() {
  const [filters, setFilters] = useState<ReportFilterParams>({});
  const [search, setSearch] = useState("");
  const [manualReportId, setManualReportId] = useState<number | null>(null);
  const [drawerReportId, setDrawerReportId] = useState<number | null>(null);

  // Đọc ?id= từ URL một lần ở client (null khi SSR) để không phải setState trong effect.
  const urlReportId = useSyncExternalStore(subscribeNoChange, getReportIdFromUrl, () => null);
  const selectedReportId = manualReportId ?? urlReportId;

  const { data, isLoading, isError, error, refetch } = useReports(filters);

  const reports = useMemo(() => data?.items ?? [], [data]);

  // Filter by search query
  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => {
      const match = `${r.id} ${r.customer.fullName} ${r.descriptionPreview} ${getReportTypeLabel(r.type)}`.toLowerCase();
      return match.includes(q);
    });
  }, [reports, search]);

  // Selected incident object
  const activeReport = useMemo(() => {
    if (selectedReportId) {
      const found = reports.find((r) => r.id === selectedReportId);
      if (found) return found;
    }
    return reports[0] || null;
  }, [reports, selectedReportId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Folio Top */}
      <TransitFolio
        index="03"
        tag="TRI"
        kicker="TIẾP NHẬN & XỬ LÝ · SỰ CỐ"
        title={<>Xử lý khiếu nại & <span className="text-td-teal">báo cáo sự cố.</span></>}
        description="Bàn ưu tiên xử lý sự cố. Đọc thời hạn phản hồi trước, mở bằng chứng sau. Không giấu công việc khẩn cấp trong các badge nhiều màu."
      >
        <TransitFolioMetric
          label="INCIDENT QUEUE · TỔNG HỒ SƠ"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : String(reports.length).padStart(2, "0")}
        />
      </TransitFolio>

      {/* Toolbar: Search + Filter status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-td-ink pb-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-td-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mã số, tên khách hàng, nội dung..."
              aria-label="Tìm sự cố"
              className="w-full border-b border-td-rule bg-transparent py-1.5 pl-8 pr-3 font-mono text-xs text-td-ink placeholder-td-muted outline-none focus:border-td-ink"
            />
          </div>

          {/* Status buttons */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {[
              { id: undefined, label: "Tất cả" },
              { id: "new", label: "Mới tiếp nhận" },
              { id: "in_progress", label: "Đang xử lý" },
              { id: "resolved", label: "Đã giải quyết" },
            ].map((btn) => {
              const isSelected = filters.status === btn.id;
              return (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, status: btn.id }))}
                  className={`border-b-2 px-3 py-1 font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? "border-td-oxide text-td-oxide"
                      : "border-transparent text-td-muted hover:text-td-ink"
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        <span className="font-mono text-xs text-td-muted">
          {filteredReports.length} hồ sơ trong hàng đợi
        </span>
      </div>

      {isError && <ErrorState message={error instanceof Error ? error.message : "Không thể tải báo cáo."} onRetry={() => { void refetch(); }} />}
      <p role="status" className="text-xs text-td-muted">API chưa cung cấp mốc thời gian để tính SLA hoặc thông tin khách hàng của báo cáo.</p>
      {/* Triage Grid: SLA-sorted list (Left) + Active Casefile (Right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 border-t border-td-ink pt-6">
        {/* Left Column: Triage List */}
        <div className="lg:col-span-5 border-r border-td-rule pr-0 lg:pr-6 space-y-2">
          <div className="flex items-center justify-between border-b border-td-rule pb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-td-muted">
            <span>HÀNG ĐỢI / THEO SLA</span>
            <span>THỜI HẠN</span>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-20 w-full rounded" />
              <Skeleton className="h-20 w-full rounded" />
              <Skeleton className="h-20 w-full rounded" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-td-muted">
              Không có sự cố nào trong bộ lọc này.
            </div>
          ) : (
            <div className="divide-y divide-td-rule">
              {filteredReports.map((report, idx) => {
                const isSelected = activeReport?.id === report.id;
                const isClosed = report.status === "resolved" || report.status === "rejected";
                const isOverdue = isSlaBreached(report.createdAt, report.status);
                const waitStr = getWaitTimeText(report.createdAt, report.resolvedAt);

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setManualReportId(report.id)}
                    className={`grid w-full grid-cols-12 items-start gap-3 py-3.5 px-2 text-left transition-colors cursor-pointer relative ${
                      isSelected ? "bg-td-chalk/70" : "hover:bg-td-chalk/30"
                    }`}
                  >
                    {/* Active marker on left */}
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-td-oxide"
                      />
                    )}

                    <div className="col-span-2 font-mono text-xl font-bold text-td-oxide">
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    <div className="col-span-7 min-w-0">
                      <div className="flex items-center gap-1 truncate">
                        <span className="font-mono text-xs text-td-muted">#{report.id} ·</span>
                        <strong className="text-xs font-semibold text-td-ink truncate">{report.customer.fullName}</strong>
                      </div>
                      <span className="font-mono text-[10px] text-td-muted block uppercase mt-0.5">
                        {getReportTypeLabel(report.type)}
                      </span>
                      <p className="line-clamp-2 text-[11px] text-td-muted mt-1 leading-normal">
                        {report.descriptionPreview}
                      </p>
                    </div>

                    <div className="col-span-3 text-right">
                      <div className={`font-mono text-xs font-bold ${!isClosed && isOverdue ? "text-td-oxide" : "text-td-ink"}`}>
                        {waitStr}
                      </div>
                      <span className="font-mono text-[9px] text-td-muted uppercase block">
                        {isClosed ? "Đã giải quyết" : !report.createdAt ? "Chưa có mốc thời gian" : (isOverdue ? "Quá hạn" : "Trong hạn")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Casefile Evidence & Actions */}
        <div className="lg:col-span-7 space-y-6">
          {activeReport ? (
            <div className="bg-td-white border border-td-rule rounded p-6 space-y-6">
              {/* Casefile Top */}
              <div className="flex items-start justify-between border-b border-td-rule pb-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-td-muted">
                    HỒ SƠ BẰNG CHỨNG SỰ CỐ #{activeReport.id}
                  </span>
                  <h2 className="mt-1 font-sans text-2xl font-bold text-td-ink tracking-tight">
                    {getReportTypeLabel(activeReport.type)}
                  </h2>
                </div>

                <div className="text-right">
                  <TransitDeskStatus domain="report" status={activeReport.status}>
                    {getReportStatusMeta(activeReport.status).label}
                  </TransitDeskStatus>
                  <span className="font-mono text-[10px] text-td-muted block mt-1">
                    {activeReport.createdAt ? formatDateTime(activeReport.createdAt, "dd/MM/yyyy HH:mm") : "Chưa có mốc thời gian"}
                  </span>
                </div>
              </div>

              {/* Context metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-td-rule pb-4 font-mono text-xs">
                <div>
                  <span className="text-td-muted uppercase text-[10px] block">Khách hàng</span>
                  <strong className="text-td-ink block mt-0.5">
                    {activeReport.customer.fullName} · {activeReport.customer.phone}
                  </strong>
                  <span className="text-td-muted text-[11px] block">{activeReport.customer.email}</span>
                </div>

                <div>
                  <span className="text-td-muted uppercase text-[10px] block">Đơn thuê liên quan</span>
                  {activeReport.rentalId ? (
                    <Link
                      href={`/admin/rentals?rentalId=${activeReport.rentalId}`}
                      className="font-bold text-td-ink hover:text-td-oxide inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>Đơn #{activeReport.rentalId}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-td-muted block mt-0.5">Không gán đơn thuê</span>
                  )}
                  {activeReport.rental && (
                    <span className="text-td-muted text-[11px] block">{activeReport.rental.vehicleName}</span>
                  )}
                </div>

                <div>
                  <span className="text-td-muted uppercase text-[10px] block">Phiếu bảo dưỡng</span>
                  {activeReport.maintenance ? (
                    <Link
                      href="/admin/maintenance"
                      className="font-bold text-td-ink hover:text-td-oxide inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>Phiếu #{activeReport.maintenance.id}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-td-muted block mt-0.5">Chưa tạo phiếu kỹ thuật</span>
                  )}
                </div>
              </div>

              {activeReport.rentalId && <RentalVehiclePhotos rentalId={activeReport.rentalId} />}

              {/* Description & Narrative */}
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-td-muted block mb-2">
                  NỘI DUNG TRÌNH BÁO
                </span>
                <p className="text-sm text-td-ink leading-relaxed bg-td-paper p-4 rounded border border-td-rule">
                  {activeReport.descriptionPreview || "Không có nội dung mô tả sự cố."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-td-rule pt-4">
                <Link
                  href={`/admin/reports/detail?id=${activeReport.id}`}
                  className="font-mono text-xs font-bold text-td-ink hover:text-td-oxide inline-flex items-center gap-1.5"
                >
                  <span>Mở hồ sơ chi tiết và bản đồ tọa độ</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setDrawerReportId(activeReport.id)}
                  className="rounded bg-td-ink px-4 py-2 font-mono text-xs font-bold text-white hover:bg-td-teal transition-colors cursor-pointer"
                >
                  Xử lý & Cập nhật trạng thái
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-td-rule bg-td-white rounded p-16 text-center font-mono text-xs text-td-muted">
              Chọn một sự cố trong hàng đợi bên trái để mở hồ sơ đối chiếu bằng chứng.
            </div>
          )}
        </div>
      </div>

      {/* Drawer for Actions */}
      <ReportDrawer
        reportId={drawerReportId}
        onClose={() => {
          setDrawerReportId(null);
          void refetch();
        }}
      />
    </div>
  );
}

export default IncidentTriage;
