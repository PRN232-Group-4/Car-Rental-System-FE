"use client";

import { useState } from "react";
import Link from "@/components/navigation/NavigationLink";
import {
  Car,
  Wrench,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/time";
import {
  getReportStatusMeta,
  getReportTypeLabel,
  getWaitTimeText,
  isSlaBreached,
} from "../report-status";
import { useUpdateReportStatus } from "../hooks";
import { CreateMaintenanceModal } from "./CreateMaintenanceModal";
import type { ReportDetail } from "../types";

interface ReportDetailViewProps {
  report: ReportDetail;
  onRefresh?: () => void;
}

export function ReportDetailView({ report }: ReportDetailViewProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [maintModalOpen, setMaintModalOpen] = useState(false);

  const statusMutation = useUpdateReportStatus();
  const statusMeta = getReportStatusMeta(report.status);
  const isOverdue = isSlaBreached(report.createdAt, report.status);
  const waitTimeStr = getWaitTimeText(report.createdAt, report.resolvedAt);

  const handleAccept = async () => {
    await statusMutation.mutateAsync({
      id: report.id,
      status: "in_progress",
    });
  };

  const handleResolve = async () => {
    await statusMutation.mutateAsync({
      id: report.id,
      status: "resolved",
    });
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối báo cáo.");
      return;
    }
    setRejectError("");
    await statusMutation.mutateAsync({
      id: report.id,
      status: "rejected",
      reason: rejectReason.trim(),
    });
    setRejectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner cảnh báo SLA nếu quá hạn 24h */}
      {isOverdue && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded border border-danger/30 bg-danger-bg p-4 text-xs font-semibold text-danger"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-danger" />
          <span>
            Cảnh báo quá hạn SLA: Báo cáo này đã chờ xử lý hơn 24 giờ ({waitTimeStr}). Cần ưu tiên giải quyết ngay.
          </span>
        </div>
      )}

      {/* Header tóm tắt */}
      <div className="flex flex-col justify-between gap-4 border-b border-td-rule pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-bold text-td-ink">Báo cáo #{report.id}</span>
            <AdminStatusBadge domain="report" status={report.status}>{statusMeta.label}</AdminStatusBadge>
            <span className="rounded border border-td-rule bg-td-white px-2.5 py-0.5 text-xs font-medium text-td-ink">
              {getReportTypeLabel(report.type)}
            </span>
            {isOverdue && (
              <span className="rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-white">
                Quá hạn SLA
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-td-muted">
            Gửi lúc {formatDateTime(report.createdAt, "dd/MM/yyyy HH:mm")} · Thời gian chờ: {waitTimeStr}
          </p>
        </div>

        {/* Thanh tác vụ trạng thái */}
        <div className="flex flex-wrap items-center gap-2">
          {report.status === "new" && (
            <Button
              type="button"
              size="sm"
              isLoading={statusMutation.isPending}
              onClick={handleAccept}
            >
              Tiếp nhận xử lý
            </Button>
          )}

          {report.status === "in_progress" && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="border-success text-success hover:bg-success-bg"
              isLoading={statusMutation.isPending}
              onClick={handleResolve}
            >
              <CheckCircle className="h-4 w-4" />
              <span>Giải quyết sự cố</span>
            </Button>
          )}

          {(report.status === "new" || report.status === "in_progress") && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-danger hover:bg-danger-bg hover:text-danger"
              onClick={() => {
                setRejectReason("");
                setRejectError("");
                setRejectModalOpen(true);
              }}
            >
              <XCircle className="h-4 w-4" />
              <span>Từ chối</span>
            </Button>
          )}

          {/* Tạo phiếu bảo dưỡng nếu có xe/đơn thuê và chưa có bảo dưỡng */}
          {!report.maintenanceId && (report.status === "new" || report.status === "in_progress") && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setMaintModalOpen(true)}
            >
              <Wrench className="h-4 w-4 text-td-oxide" />
              <span>Tạo phiếu bảo dưỡng</span>
            </Button>
          )}
        </div>
      </div>

      {/* Nội dung chi tiết - CHỐNG XSS: Render văn bản thuần */}
      <section className="rounded border border-td-rule bg-td-white p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-td-muted">Nội dung phản ánh</h3>
        <div className="mt-3 whitespace-pre-wrap rounded border border-td-rule bg-td-chalk p-4 text-sm leading-relaxed text-td-ink">
          {report.description}
        </div>

        {report.imageUrls && report.imageUrls.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-td-muted">Hình ảnh đính kèm từ khách ({report.imageUrls.length}):</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {report.imageUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="group relative block h-20 w-24 overflow-hidden rounded border border-td-rule bg-td-chalk"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Ảnh minh chứng #${i + 1}`} className="h-full w-full object-cover transition group-hover:scale-105" />
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Thông tin Khách hàng & Ngữ cảnh liên kết */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Khối khách hàng */}
        <section className="flex flex-col justify-between rounded border border-td-rule bg-td-white p-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-td-muted">
              <User className="h-4 w-4 text-td-oxide" />
              <span>Khách hàng phản ánh</span>
            </div>
            <div className="mt-3 space-y-1.5 text-sm">
              <p className="font-semibold text-td-ink">{report.customer.fullName}</p>
              {report.customer.phone && (
                <p className="font-mono text-xs text-td-ink">Điện thoại: {report.customer.phone}</p>
              )}
              {report.customer.email && (
                <p className="font-mono text-xs text-td-ink">Email: {report.customer.email}</p>
              )}
            </div>
          </div>
          <div className="mt-4 border-t border-td-rule pt-3">
            <Link
              href={`/admin/users/detail?id=${report.customer.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-td-oxide hover:underline"
            >
              <span>Xem hồ sơ người dùng</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* Khối liên kết: Đơn thuê hoặc Phiếu bảo dưỡng */}
        <section className="flex flex-col justify-between rounded border border-td-rule bg-td-white p-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-td-muted">
              <Car className="h-4 w-4 text-td-oxide" />
              <span>Ngữ cảnh liên kết</span>
            </div>

            {report.rental ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-td-ink">Đơn thuê #{report.rental.id}</span>
                  <AdminStatusBadge domain="rental" status={report.rental.status || "rented"}>
                    {report.rental.status || "Đang thuê"}
                  </AdminStatusBadge>
                </div>
                <p className="font-semibold text-td-oxide">{report.rental.vehicleName}</p>
                {report.rental.licensePlate && (
                  <p className="font-mono text-td-muted">Biển số: {report.rental.licensePlate}</p>
                )}
                <p className="text-td-muted">
                  Thời gian: {formatDateTime(report.rental.start, "dd/MM HH:mm")} → {formatDateTime(report.rental.end, "dd/MM HH:mm")}
                </p>
                {report.rental.driverName && (
                  <p className="text-td-muted">Tài xế phục vụ: {report.rental.driverName}</p>
                )}
              </div>
            ) : report.maintenance ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-td-ink">Phiếu bảo dưỡng #{report.maintenance.id}</span>
                  <AdminStatusBadge domain="maintenance" status={report.maintenance.status || "in_progress"}>
                    {report.maintenance.status ?? "Đang thực hiện"}
                  </AdminStatusBadge>
                </div>
                <p className="font-semibold text-td-oxide">{report.maintenance.type}</p>
                {report.maintenance.cost && (
                  <p className="font-mono text-td-ink">
                    Chi phí: {report.maintenance.cost.toLocaleString("vi-VN")} đ
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded border border-td-rule bg-td-chalk p-4 text-center text-xs text-td-muted">
                Báo cáo chung, không gắn với đơn thuê hay phiếu bảo dưỡng nào.
              </div>
            )}
          </div>

          {report.rental && (
            <div className="mt-4 border-t border-td-rule pt-3">
              <Link
                href={`/admin/rentals?id=${report.rental.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-td-oxide hover:underline"
              >
                <span>Xem chi tiết đơn vận hành</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Nhật ký lịch sử thay đổi trạng thái (nếu có) */}
      {report.history && report.history.length > 0 && (
        <section className="rounded border border-td-rule bg-td-white p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-td-muted">
            <Clock className="h-4 w-4 text-td-oxide" />
            <span>Nhật ký xử lý báo cáo</span>
          </div>
          <ol className="mt-4 space-y-3 border-l-2 border-td-rule pl-4 text-xs">
            {report.history.map((h, idx) => (
              <li key={idx} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-td-rule bg-td-oxide" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-td-ink">{h.by || "Hệ thống"}</span>
                  <span className="font-mono text-td-muted">{formatDateTime(h.at, "dd/MM/yyyy HH:mm")}</span>
                </div>
                <p className="mt-0.5 text-td-ink">
                  Trạng thái: <strong className="text-td-ink">{getReportStatusMeta(h.to).label}</strong>
                  {h.reason && <span className="text-td-muted"> — {h.reason}</span>}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Modal từ chối báo cáo có lý do bắt buộc */}
      <Modal
        open={rejectModalOpen}
        onOpenChange={(open) => !open && setRejectModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-danger">
            <ShieldAlert className="h-5 w-5" />
            <span>Từ chối báo cáo sự cố #{report.id}</span>
          </div>
        }
        description="Vui lòng cung cấp lý do từ chối để lưu vào nhật ký và phản hồi cho khách hàng nếu cần."
        size="md"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4 pt-2">
          {rejectError && (
            <div className="rounded border border-danger/30 bg-danger-bg p-3 text-xs text-danger">
              {rejectError}
            </div>
          )}

          <div>
            <label htmlFor="reject-reason" className="block text-xs font-semibold text-td-ink">
              Lý do từ chối <span className="text-danger">*</span>
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              placeholder="Ví dụ: Sự cố do lỗi thao tác của người dùng, không thuộc phạm vi hỗ trợ kỹ thuật..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-1 w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink placeholder:text-td-muted focus:outline-none focus:ring-1 focus:ring-danger"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-td-rule pt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="danger"
              isLoading={statusMutation.isPending}
            >
              Xác nhận từ chối
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal tạo phiếu bảo dưỡng */}
      <CreateMaintenanceModal
        open={maintModalOpen}
        onClose={() => setMaintModalOpen(false)}
        report={report}
      />
    </div>
  );
}
