"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Check, ShieldCheck, MapPin, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { createRentalBooking } from "../api";
import type { RentalBookingResponse } from "../types";
import type { Vehicle } from "@/features/vehicles";
import { Button } from "@/components/ui/Button";

interface BookingModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export default function BookingModal({ vehicle, onClose }: BookingModalProps) {
  const [rentalHours, setRentalHours] = useState<number>(24);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<RentalBookingResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap & Escape key handler per A6 & A12 accessibility
  useEffect(() => {
    if (!vehicle) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [vehicle, onClose]);

  if (!vehicle) return null;

  // Calculation according to DESIGN.md Section 22 & 23
  const driverFeePerHour = 40000;
  const baseRentalPrice = (vehicle.hourlyPrice + driverFeePerHour) * rentalHours;
  const vatAmount = baseRentalPrice * 0.1;
  const depositAmount = (baseRentalPrice + vatAmount) * 0.1;
  const totalAmount = baseRentalPrice + vatAmount;

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await createRentalBooking({
        vehicleId: vehicle.id,
        facilityId: vehicle.facilityId,
        rentalType: "hourly",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + rentalHours * 3600000).toISOString(),
        hasDriver: true,
        customerName: "Khách hàng Thong Dong",
        customerPhone: "0901234567",
        customerEmail: "khachhang@thongdong.vn",
      });
      setBookingResult(res);
      setBookingSuccess(true);
    } catch (err) {
      console.error("Booking error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Không thể gửi yêu cầu đặt xe. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--scrim-modal)] cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="glass-3 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elevation-2 cursor-default"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface/95 z-10">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-primary">
              Xác nhận thông tin & bảng giá minh bạch
            </span>
            <h3 id="booking-modal-title" className="text-xl font-bold text-ink mt-0.5">
              {vehicle.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại đặt xe"
            className="w-10 h-10 rounded-full bg-canvas hover:bg-surface-elevated border border-border flex items-center justify-center text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookingSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-elevation-1">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-2xl font-bold text-ink">
              Gửi yêu cầu thuê xe thành công
            </h4>
            <p className="text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
              Mã đơn: <strong className="text-ink">{bookingResult?.bookingId || "TD-881920"}</strong>. Đơn đang ở trạng thái <span className="text-amber-800 font-semibold">Chờ xác nhận (pending)</span>. Nhân viên chi nhánh {vehicle.facilityName} sẽ liên hệ xác minh GPLX và gửi link thanh toán cọc PayOS trong ít phút.
            </p>
            <div className="pt-4">
              <Button onClick={onClose} variant="primary">
                Đóng thông báo
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Vehicle preview bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-canvas border border-border">
              <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden shrink-0 bg-stage-ink">
                <Image
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 w-full text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-surface border border-border text-ink">
                    {vehicle.categoryLabel}
                  </span>
                  <span className="text-xs text-ink-subtle">Đời {vehicle.year}</span>
                </div>
                <p className="text-sm font-bold text-ink">{vehicle.name}</p>
                <p className="text-xs text-ink-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{vehicle.facilityName}</span>
                </p>
              </div>
            </div>

            {/* Config Duration & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                  Thời lượng thuê dự kiến
                </span>
                <div className="flex items-center gap-2" role="group" aria-label="Chọn thời lượng thuê">
                  {[6, 12, 24, 48].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      aria-pressed={rentalHours === hours}
                      onClick={() => setRentalHours(hours)}
                      className={`flex-1 min-h-[44px] py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        rentalHours === hours
                          ? "bg-primary border-primary text-white shadow-elevation-1"
                          : "bg-surface hover:bg-surface-elevated text-ink border-border"
                      }`}
                    >
                      {hours} giờ
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                  Hình thức điều khiển
                </span>
                <div
                  className="min-h-[44px] py-2 px-3 text-xs font-bold rounded-xl border border-primary/20 bg-primary/5 text-ink flex items-center justify-center gap-2"
                  aria-label="Mọi chuyến thuê đều kèm tài xế chuyên nghiệp"
                >
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Kèm tài xế chuyên nghiệp (+40.000đ/giờ)</span>
                </div>
              </div>
            </div>

            {/* Price breakdown table */}
            <div className="rounded-2xl p-5 bg-canvas border border-border space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-ink-muted border-b border-border pb-2">
                Chi tiết dự toán chi phí (Áp dụng theo chính sách đang kích hoạt)
              </div>
              
              <div className="flex justify-between text-sm text-ink-muted">
                <span>
                  Đơn giá thuê ({rentalHours} giờ x {(vehicle.hourlyPrice + driverFeePerHour).toLocaleString("vi-VN")}đ)
                </span>
                <span className="font-semibold text-ink">
                  {baseRentalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="flex justify-between text-sm text-ink-muted">
                <span className="flex items-center gap-1">
                  <span>Thuế VAT (10%)</span>
                </span>
                <span className="font-semibold text-ink">
                  {vatAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="flex justify-between text-sm text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Tiền đặt cọc xe (10% - Hoàn trả tự động sau kiểm định)</span>
                </span>
                <span className="font-bold">
                  {depositAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-ink">
                    Tổng tiền thanh toán thuê
                  </span>
                  <span className="text-xs text-ink-subtle block">
                    (Chưa tính cọc hoàn lại sau chuyến đi)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">
                    {totalAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Trust disclaimer */}
            <div className="text-xs text-ink-muted flex items-start gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                Không phát sinh phí ẩn. Khách hàng nhận biên bản kiểm định 2 chiều trước khi lăn bánh. Cọc được hoàn tự động về tài khoản nguồn qua cổng PayOS ngay khi hoàn tất kiểm tra trả xe.
              </span>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-danger text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1 justify-center"
              >
                Quay lại
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                variant="primary"
                className="flex-2 justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>Xác nhận gửi yêu cầu</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
