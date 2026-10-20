"use client";

import { useState } from "react";
import { Loader2, Phone, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatVnd } from "@/lib/format";
import { useCancellationPreview, useCancelTrip } from "../hooks";
import { ApiProblemError } from "@/api";
import type { TripDetail } from "../types";

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  trip: TripDetail;
  onSuccess?: () => void;
}

const PRESET_REASONS = [
  "Thay đổi lịch trình công tác / du lịch",
  "Tìm được phương tiện di chuyển khác",
  "Thời tiết không thuận lợi",
  "Có việc khẩn cấp đột xuất",
  "Khác (nhập chi tiết)",
];

export function CancelDialog({ open, onClose, trip, onSuccess }: CancelDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>(PRESET_REASONS[0]!);
  const [customReason, setCustomReason] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: preview, isLoading: previewLoading } = useCancellationPreview(trip.id, open);
  const cancelMutation = useCancelTrip();

  const handleConfirm = async () => {
    setErrorMessage(null);
    const finalReason =
      selectedReason === "Khác (nhập chi tiết)" ? customReason.trim() : selectedReason;

    if (!finalReason) {
      toast.error("Vui lòng chọn hoặc nhập lý do hủy chuyến");
      return;
    }

    try {
      await cancelMutation.mutateAsync({
        rentalId: trip.id,
        reason: finalReason,
      });

      toast.success("Đã hủy chuyến đi thành công");
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiProblemError) {
        if (err.title === "SELF_CANCEL_NOT_ALLOWED") {
          setErrorMessage(
            `Đã đến hoặc quá thời điểm nhận xe. Hệ thống không cho phép tự hủy trực tuyến. Vui lòng gọi trực tiếp hotline chi nhánh (${
              trip.facility?.phone || "028 3822 9999"
            }) để được nhân viên hỗ trợ xử lý.`
          );
        } else {
          setErrorMessage(err.detail || "Không thể hủy chuyến đi này");
        }
      } else {
        setErrorMessage("Đã xảy ra lỗi kết nối khi xử lý hủy đơn.");
      }
    }
  };

  const isPending = cancelMutation.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={`Xác nhận hủy chuyến đi #${trip.id}`}
      description="Vui lòng kiểm tra kỹ chính sách hoàn tiền trước khi xác nhận hủy bỏ hợp đồng."
      size="md"
    >
      <div className="space-y-5">
        {/* Khối xem trước hoàn tiền từ backend preview */}
        {previewLoading ? (
          <div className="flex items-center justify-center p-6 bg-td-chalk rounded text-xs text-td-muted">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span>Đang tải thông tin hoàn tiền theo hợp đồng...</span>
          </div>
        ) : preview ? (
          <div className="bg-td-chalk border border-td-rule rounded p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between font-bold text-td-ink text-sm font-sans">
              <span>Ước tính phí phạt & Hoàn tiền</span>
              <span className={preview.cancellationFee === 0 ? "text-success" : "text-warning"}>
                {preview.cancellationFee === 0 ? "Hủy miễn phí" : `Giữ lại ${100 - preview.refundPercentage}%`}
              </span>
            </div>

            <div className="space-y-1.5 text-td-ink">
              <div className="flex justify-between">
                <span>Tổng giá trị đơn:</span>
                <span>{formatVnd(trip.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-danger">
                <span>Phí hủy giữ lại:</span>
                <span>-{formatVnd(preview.cancellationFee)}</span>
              </div>
              <div className="border-t border-td-rule pt-1.5 flex justify-between font-bold text-td-ink text-sm">
                <span>Số tiền hoàn trả dự kiến:</span>
                <span className="text-success">{formatVnd(preview.refundAmount)}</span>
              </div>
            </div>

            {preview.rulesExplanation && (
              <p className="text-[11px] text-td-muted font-sans leading-relaxed pt-1">
                {preview.rulesExplanation}
              </p>
            )}
          </div>
        ) : null}

        {/* Lựa chọn lý do hủy */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-td-ink mb-2">
            Lý do bạn muốn hủy chuyến <span className="text-primary">*</span>
          </label>
          <div className="space-y-2">
            {PRESET_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-2.5 p-2.5 rounded border border-td-rule bg-td-white hover:bg-td-chalk cursor-pointer text-xs text-td-ink transition-colors"
              >
                <input
                  type="radio"
                  name="cancel_reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === "Khác (nhập chi tiết)" && (
            <div className="mt-2.5">
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                maxLength={500}
                placeholder="Nhập lý do cụ thể của bạn (tối đa 500 ký tự)..."
                className="w-full p-3 rounded border border-td-rule bg-td-white text-td-ink text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-[10px] text-td-muted block text-right">
                {customReason.length}/500 ký tự
              </span>
            </div>
          )}
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 bg-danger-bg/40 border border-danger/20 rounded text-xs text-danger">
            <ShieldAlert className="w-4 h-4 text-danger shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold">Không thể hủy chuyến:</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Hotline chi nhánh hỗ trợ */}
        {trip.facility?.phone && (
          <div className="flex items-center justify-between text-xs text-td-muted pt-2 border-t border-td-rule">
            <span>Cần trợ giúp ngay lập tức?</span>
            <a
              href={`tel:${trip.facility.phone}`}
              className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline font-mono"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{trip.facility.phone}</span>
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Quay lại
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            disabled={isPending || previewLoading || preview?.canCancel === false}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                <span>Đang xử lý hủy...</span>
              </>
            ) : (
              <span>Xác nhận hủy chuyến đi</span>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
