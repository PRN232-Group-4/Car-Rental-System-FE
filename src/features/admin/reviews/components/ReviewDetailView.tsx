"use client";

import { useState } from "react";
import Link from "@/components/navigation/NavigationLink";
import {
  User,
  Car,
  EyeOff,
  Eye,
  MessageSquare,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Info,
} from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/time";
import { RatingStars } from "./RatingStars";
import {
  getReviewStatusMeta,
  STANDARD_HIDE_REASONS,
} from "../review-status";
import { useHideReview, useUnhideReview, useReplyReview } from "../hooks";
import type { ReviewDetail } from "../types";
import { RentalVehiclePhotos } from "@/features/admin/VehiclePhotos";

interface ReviewDetailViewProps {
  review: ReviewDetail;
  onRefresh?: () => void;
}

export function ReviewDetailView({ review }: ReviewDetailViewProps) {
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(STANDARD_HIDE_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [hideError, setHideError] = useState("");

  const [replyText, setReplyText] = useState(review.reply?.text ?? "");
  const [replyError, setReplyError] = useState("");
  const [isEditingReply, setIsEditingReply] = useState(!review.reply);

  const hideMutation = useHideReview();
  const unhideMutation = useUnhideReview();
  const replyMutation = useReplyReview();

  const statusMeta = getReviewStatusMeta(review.status);

  // Tính toán tác động điểm số
  const impact = review.impact;

  const handleConfirmHide = async (e: React.FormEvent) => {
    e.preventDefault();
    const reasonToSubmit =
      selectedReason === "Khác (vui lòng nhập giải trình chi tiết)"
        ? customReason.trim()
        : selectedReason;

    if (!reasonToSubmit) {
      setHideError("Vui lòng chọn hoặc nhập lý do ẩn đánh giá.");
      return;
    }
    setHideError("");
    await hideMutation.mutateAsync({
      id: review.id,
      reason: reasonToSubmit,
    });
    setHideModalOpen(false);
  };

  const handleUnhide = async () => {
    await unhideMutation.mutateAsync(review.id);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (trimmed.length < 5 || trimmed.length > 1000) {
      setReplyError("Nội dung phản hồi phải từ 5 đến 1000 ký tự.");
      return;
    }
    setReplyError("");
    await replyMutation.mutateAsync({
      id: review.id,
      replyText: trimmed,
    });
    setIsEditingReply(false);
  };

  return (
    <div className="space-y-6">
      <p role="status" className="text-xs text-td-muted">API chưa cung cấp kiểm duyệt, phản hồi hoặc tác động điểm số. Các thao tác này tạm khóa, không dùng dữ liệu giả.</p>
      {/* Cảnh báo nếu đánh giá bị người dùng báo cáo */}
      {review.status === "reported" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded border border-warning/30 bg-warning-bg p-4 text-xs font-semibold text-warning"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <div>
            <span className="font-bold">Đánh giá đang bị gắn cờ báo cáo vi phạm tiêu chuẩn cộng đồng:</span>{" "}
            Cần quản trị viên kiểm tra nội dung trước khi quyết định Giữ hiển thị hoặc Ẩn kiểm duyệt.
          </div>
        </div>
      )}

      {/* Thông tin header */}
      <div className="flex flex-col justify-between gap-4 border-b border-td-rule pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-bold text-td-ink">Đánh giá #{review.id}</span>
            <AdminStatusBadge domain="review" status={review.status}>{statusMeta.label}</AdminStatusBadge>
            <RatingStars rating={review.rating} size="md" />
          </div>
          <p className="mt-1 text-xs text-td-muted">
            Khách hàng <strong>{review.customerName}</strong> gửi lúc{" "}
            {formatDateTime(review.createdAt, "dd/MM/yyyy HH:mm")}
          </p>
        </div>

        {/* Thanh tác vụ kiểm duyệt: KHÔNG có nút xóa vĩnh viễn */}
        <div className="flex flex-wrap items-center gap-2">
          {review.status === "visible" && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="border-danger text-danger hover:bg-danger-bg"
              onClick={() => {
                setHideError("");
                setHideModalOpen(true);
              }}
            >
              <EyeOff className="h-4 w-4" />
              <span>Ẩn kiểm duyệt</span>
            </Button>
          )}

          {review.status === "reported" && (
            <>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="border-success text-success hover:bg-success-bg"
                isLoading={unhideMutation.isPending}
                onClick={handleUnhide}
              >
                <Eye className="h-4 w-4" />
                <span>Giữ hiển thị (Bác báo cáo)</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() => {
                  setHideError("");
                  setHideModalOpen(true);
                }}
              >
                <EyeOff className="h-4 w-4" />
                <span>Chấp nhận ẩn</span>
              </Button>
            </>
          )}

          {review.status === "hidden" && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              isLoading={unhideMutation.isPending}
              onClick={handleUnhide}
            >
              <Eye className="h-4 w-4" />
              <span>Hiện lại công khai</span>
            </Button>
          )}
        </div>
      </div>

      {/* Thông tin ẩn kiểm duyệt nếu đã ẩn */}
      {review.status === "hidden" && review.hiddenInfo && (
        <div className="rounded border border-td-rule bg-td-chalk p-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-td-ink">
            <Info className="h-4 w-4 text-td-muted" />
            <span>Thông tin kiểm duyệt đã ẩn</span>
          </div>
          <p className="mt-1 text-td-ink">
            Lý do: <strong className="text-danger">{review.hiddenInfo.reason}</strong>
          </p>
          <p className="mt-0.5 text-td-muted">
            Thực hiện bởi {review.hiddenInfo.by || "Quản trị viên"} lúc{" "}
            {formatDateTime(review.hiddenInfo.at, "dd/MM/yyyy HH:mm")}
          </p>
        </div>
      )}

      {/* Nội dung nhận xét - CHỐNG XSS: Render văn bản thuần */}
      <section className="rounded border border-td-rule bg-td-white p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-td-muted">Nội dung nhận xét</h3>
        <div className="mt-3 whitespace-pre-wrap rounded border border-td-rule bg-td-chalk p-4 text-sm leading-relaxed text-td-ink">
          {review.comment}
        </div>
      </section>

      {/* Thẻ nhân viên và đơn gốc */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Nhân sự được đánh giá */}
        <section className="flex flex-col justify-between rounded border border-td-rule bg-td-white p-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-td-muted">
              <User className="h-4 w-4 text-td-oxide" />
              <span>Nhân sự được đánh giá</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-td-chalk font-bold text-td-oxide">
                {review.staff.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-td-ink">{review.staff.fullName}</p>
                <p className="text-xs text-td-muted">
                  {review.staff.isDriver ? "Tài xế chuyên nghiệp" : "Nhân viên vận hành"} · {review.staff.departmentName || "Khối Vận Hành"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-td-rule pt-3">
            <Link
              href={`/admin/staffs/detail?id=${review.staff.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-td-oxide hover:underline"
            >
              <span>Xem hồ sơ & lịch sử nhân sự</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* Đơn thuê gốc */}
        <section className="flex flex-col justify-between rounded border border-td-rule bg-td-white p-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-td-muted">
              <Car className="h-4 w-4 text-td-oxide" />
              <span>Chuyến đi liên quan</span>
            </div>
            {review.rental ? (
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-td-ink">Đơn thuê #{review.rentalId}</span>
                  <AdminStatusBadge domain="rental" status={review.rental.status || "completed"}>
                    {review.rental.status || "Hoàn tất"}
                  </AdminStatusBadge>
                </div>
                <p className="font-semibold text-td-oxide">{review.rental.vehicleName}</p>
                <RentalVehiclePhotos rentalId={review.rentalId} />
                {review.rental.licensePlate && (
                  <p className="font-mono text-td-muted">Biển số: {review.rental.licensePlate}</p>
                )}
                <p className="text-td-muted">
                  Thời gian: {formatDateTime(review.rental.start, "dd/MM HH:mm")} → {formatDateTime(review.rental.end, "dd/MM HH:mm")}
                </p>
              </div>
            ) : (
              <div className="mt-3 text-xs text-td-muted">Đơn thuê #{review.rentalId}</div>
            )}
          </div>
          <div className="mt-4 border-t border-td-rule pt-3">
            <Link
              href={`/admin/rentals?id=${review.rentalId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-td-oxide hover:underline"
            >
              <span>Xem chi tiết hợp đồng đơn thuê</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>
      </div>

      {/* Phản hồi từ quản lý */}
      <section className="rounded border border-td-rule bg-td-white p-5">
        <div className="flex items-center justify-between border-b border-td-rule pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-td-oxide" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-td-muted">
              Phản hồi chính thức cho khách
            </h3>
          </div>
          {!isEditingReply && review.reply && (
            <button
              type="button"
              onClick={() => setIsEditingReply(true)}
              className="text-xs font-semibold text-td-oxide hover:underline"
            >
              Sửa phản hồi
            </button>
          )}
        </div>

        {isEditingReply ? (
          <form onSubmit={handleSendReply} className="mt-4 space-y-3">
            {replyError && (
              <div className="rounded border border-danger/30 bg-danger-bg p-3 text-xs text-danger">
                {replyError}
              </div>
            )}
            <label htmlFor="review-reply-text" className="sr-only">
              Nội dung phản hồi
            </label>
            <textarea
              id="review-reply-text"
              rows={3}
              placeholder="Nhập phản hồi từ đại diện Thong Dong gửi khách hàng (5 - 1000 ký tự)..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled title="API chưa hỗ trợ phản hồi đánh giá"
              className="w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink placeholder:text-td-muted focus:outline-none focus:ring-1 focus:ring-td-oxide"
            />
            <div className="flex items-center justify-end gap-2">
              {review.reply && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingReply(false)}
                >
                  Hủy
                </Button>
              )}
              <Button type="submit" size="sm" disabled title="API chưa hỗ trợ phản hồi đánh giá" isLoading={replyMutation.isPending}>
                Lưu phản hồi
              </Button>
            </div>
          </form>
        ) : review.reply ? (
          <div className="mt-4 rounded border border-td-rule bg-td-chalk p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-td-ink">{review.reply.by || "Đại diện Thong Dong"}</span>
              <span className="font-mono text-td-muted">{formatDateTime(review.reply.at, "dd/MM/yyyy HH:mm")}</span>
            </div>
            <p className="mt-2 text-td-ink leading-relaxed">{review.reply.text}</p>
          </div>
        ) : null}
      </section>

      {/* Modal Ẩn kiểm duyệt đánh giá */}
      <Modal
        open={hideModalOpen}
        onOpenChange={(open) => !open && setHideModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-danger">
            <ShieldAlert className="h-5 w-5" />
            <span>Ẩn kiểm duyệt đánh giá #{review.id}</span>
          </div>
        }
        description="Đánh giá bị ẩn sẽ không hiển thị công khai và không tính vào điểm trung bình của nhân sự."
        size="md"
      >
        <form onSubmit={handleConfirmHide} className="space-y-4 pt-2">
          {hideError && (
            <div className="rounded border border-danger/30 bg-danger-bg p-3 text-xs text-danger">
              {hideError}
            </div>
          )}

          {/* Cảnh báo công bằng: tác động điểm số */}
          {impact && (() => {
            const diff = impact.diff ?? Number((impact.averageAfter - impact.averageBefore).toFixed(2));
            return (
              <div className="rounded border border-td-rule bg-td-chalk p-3 text-xs">
                <span className="font-semibold text-td-ink">Cân nhắc tác động điểm số:</span> Ẩn đánh giá {review.rating} sao này sẽ thay đổi điểm trung bình của {review.staff.fullName} từ{" "}
                <strong>{impact.averageBefore.toFixed(2)}</strong> sang{" "}
                <strong className={diff > 0 ? "text-success" : "text-danger"}>
                  {impact.averageAfter.toFixed(2)} ({diff > 0 ? `+${diff}` : diff})
                </strong>.
              </div>
            );
          })()}

          <div>
            <label htmlFor="hide-reason-select" className="block text-xs font-semibold text-td-ink">
              Lý do kiểm duyệt bắt buộc <span className="text-danger">*</span>
            </label>
            <select
              id="hide-reason-select"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="mt-1 w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink focus:outline-none focus:ring-1 focus:ring-danger"
            >
              {STANDARD_HIDE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {selectedReason === "Khác (vui lòng nhập giải trình chi tiết)" && (
            <div>
              <label htmlFor="hide-custom-reason" className="block text-xs font-semibold text-td-ink">
                Chi tiết giải trình lý do ẩn
              </label>
              <textarea
                id="hide-custom-reason"
                rows={2}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập giải trình chi tiết vì sao ẩn đánh giá..."
                className="mt-1 w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink focus:outline-none focus:ring-1 focus:ring-danger"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-td-rule pt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setHideModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="danger"
              isLoading={hideMutation.isPending}
            >
              Xác nhận ẩn đánh giá
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
