"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./transit-desk.module.css";

export function IncidentTriage() {
  const [filters, setFilters] = useState<ReportFilterParams>({});
  const [search, setSearch] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [drawerReportId, setDrawerReportId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const idStr = params.get("id");
      if (idStr) setSelectedReportId(Number(idStr));
    }
  }, []);

  const { data, isLoading, refetch } = useReports(filters);

  const reports = data?.items ?? [];

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
      <div className="flex flex-col justify-between gap-6 border-b border-td-rule pb-6 sm:flex-row sm:items-end">
        <div className="flex items-start gap-5">
          <span className="font-mono text-xs font-bold text-td-oxide border-t-2 border-td-oxide pt-1 min-w-[42px]">
            03<br />TRI
          </span>
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">
              TIẾP NHẬN & XỬ LÝ · SỰ CỐ
            </span>
            <h1 className="mt-1 font-sans text-3xl font-bold tracking-tight text-td-ink sm:text-4xl md:text-5xl">
              Xử lý khiếu nại & Báo cáo sự cố
            </h1>
            <p className="mt-2 max-w-xl text-xs sm:text-sm text-td-muted leading-relaxed">
              Bàn ưu tiên xử lý sự cố. Đọc thời hạn phản hồi trước, mở bằng chứng sau. Không giấu công việc khẩn cấp trong các badge nhiều màu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-end">
          <div className="border-l border-td-rule pl-4 text-right">
            <span className="block font-mono text-[10px] text-td-muted tracking-wider">
              INCIDENT QUEUE · TỔNG HỒ SƠ
            </span>
            <strong className="block font-sans text-3xl font-bold tracking-tight text-td-ink">
              {isLoading ? <Skeleton className="h-8 w-16" /> : String(reports.length).padStart(2, "0")}
            </strong>
          </div>
        </div>
      </div>

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
              { id: "pending", label: "Mới tiếp nhận" },
              { id: "investigating", label: "Đang xử lý" },
              { id: "resolved", label: "Đã giải quyết" },
              { id: "dismissed", label: "Đã từ chối" },
            ].map((btn) => {
              const isSelected = filters.status === btn.id;
              return (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, status: btn.id as any }))}
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
                const isUrgent = !isClosed && isOverdue;
                const waitStr = getWaitTimeText(report.createdAt, report.resolvedAt);

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReportId(report.id)}
                    className={`grid w-full grid-cols-12 items-start gap-3 py-3.5 px-2 text-left transition-colors cursor-pointer relative ${
                      isSelected ? "bg-td-chalk/70" : "hover:bg-td-chalk/30"
                    } ${isUrgent ? styles.incidentOverduePulse : ""}`}
                  >
                    {/* Active marker on left */}
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-td-oxide"
                      />
                    )}

                    <div className="col-span-2 font-mono text-xl font-bold text-td-oxide flex items-center gap-1.5">
                      {isUrgent && (
                        <span
                          className={styles.incidentRadarDot}
                          aria-label="Sự cố khẩn cấp quá hạn SLA"
                          title="Sự cố khẩn cấp quá hạn SLA"
                        />
                      )}
                      <span>{String(idx + 1).padStart(2, "0")}</span>
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
                        {isClosed ? "Đã giải quyết" : (isOverdue ? "Quá hạn" : "Trong hạn")}
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
            <div className="bg-td-white border border-td-rule rounded-lg p-6 space-y-6">
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
                    {formatDateTime(activeReport.createdAt, "dd/MM/yyyy HH:mm")}
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
                  {activeReport.rental ? (
                    <Link
                      href={`/admin/rentals?rentalId=${activeReport.rental.id}`}
                      className="font-bold text-td-ink hover:text-td-oxide inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>Đơn #{activeReport.rental.id}</span>
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
            <div className="border border-td-rule bg-td-white rounded-lg p-16 text-center font-mono text-xs text-td-muted">
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
