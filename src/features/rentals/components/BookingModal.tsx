"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Check, ShieldCheck, MapPin, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { createRentalBooking } from "../api";
import type { RentalBookingResponse } from "../types";
import type { Vehicle } from "@/features/vehicles";

interface BookingModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export default function BookingModal({ vehicle, onClose }: BookingModalProps) {
  const [rentalHours, setRentalHours] = useState<number>(24); // default 24h (1 day)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<RentalBookingResponse | null>(null);

  // Keyboard navigation & body scroll lock (Priority 1 & 2 in ui-ux-pro-max)
  useEffect(() => {
    if (!vehicle) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
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
  const driverFeePerHour = 40000; // mọi chuyến thuê đều kèm tài xế (không có tự lái)
  const baseRentalPrice = (vehicle.hourlyPrice + driverFeePerHour) * rentalHours;
  const vatAmount = baseRentalPrice * 0.1; // 10% VAT
  const depositAmount = (baseRentalPrice + vatAmount) * 0.1; // 10% deposit
  const totalAmount = baseRentalPrice + vatAmount;

  const handleConfirm = async () => {
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card specular-border bg-white/95 backdrop-blur-3xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl cursor-default"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/60 flex items-center justify-between sticky top-0 bg-white/85 backdrop-blur-2xl z-10">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#059669]">
              Xác nhận thông tin & bảng giá minh bạch
            </span>
            <h3 id="booking-modal-title" className="text-xl font-bold text-neutral-900 mt-0.5">
              {vehicle.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại đặt xe"
            className="w-11 h-11 rounded-full glass-pill flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookingSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#ecfdf5] border border-emerald-300/60 text-[#059669] rounded-full flex items-center justify-center mx-auto shadow-md shadow-[#059669]/15">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-2xl font-bold text-neutral-900">
              Gửi yêu cầu thuê xe thành công
            </h4>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Mã đơn: <strong className="text-neutral-900">{bookingResult?.bookingId || "TD-881920"}</strong>. Đơn đang ở trạng thái <span className="text-amber-700 font-semibold">Chờ xác nhận (pending)</span>. Nhân viên chi nhánh {vehicle.facilityName} sẽ liên hệ xác minh GPLX và gửi link thanh toán cọc PayOS trong ít phút.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#059669] text-white font-semibold rounded-xl text-sm hover:bg-[#047857] transition-colors cursor-pointer shadow-md shadow-[#059669]/25"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Vehicle preview bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl glass-sub border border-white/80">
              <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden shrink-0">
                <Image
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 w-full text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                    {vehicle.categoryLabel}
                  </span>
                  <span className="text-xs text-neutral-500">Đời {vehicle.year}</span>
                </div>
                <p className="text-sm font-bold text-neutral-900">{vehicle.name}</p>
                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                  <span>{vehicle.facilityName}</span>
                </p>
              </div>
            </div>

            {/* Config Duration & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
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
                          ? "bg-[#059669] border-[#059669] text-white shadow-md shadow-[#059669]/25"
                          : "glass-pill text-neutral-800 hover:bg-white"
                      }`}
                    >
                      {hours} giờ
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Hình thức điều khiển
                </span>
                <div
                  className="min-h-[44px] py-2 px-3 text-xs font-bold rounded-xl border border-emerald-300/50 bg-emerald-50/70 text-emerald-800 flex items-center justify-center gap-2"
                  aria-label="Mọi chuyến thuê đều kèm tài xế chuyên nghiệp"
                >
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  <span>Kèm tài xế chuyên nghiệp (+40.000đ/giờ)</span>
                </div>
              </div>
            </div>

            {/* Price breakdown table - EXACTLY as specified in DESIGN.md Section 23 */}
            <div className="glass-sub rounded-2xl p-5 border border-white/70 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200/60 pb-2">
                Chi tiết dự toán chi phí (Áp dụng theo chính sách đang kích hoạt)
              </div>
              
              <div className="flex justify-between text-sm text-neutral-700">
                <span>
                  Đơn giá thuê ({rentalHours} giờ x {(vehicle.hourlyPrice + driverFeePerHour).toLocaleString("vi-VN")}đ)
                </span>
                <span className="font-semibold text-neutral-900">
                  {baseRentalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="flex justify-between text-sm text-neutral-700">
                <span className="flex items-center gap-1">
                  <span>Thuế VAT (10%)</span>
                </span>
                <span className="font-semibold text-neutral-900">
                  {vatAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="flex justify-between text-sm text-amber-800 bg-amber-50/70 backdrop-blur-md p-2.5 rounded-xl border border-amber-200/60">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Tiền đặt cọc xe (10% - Hoàn trả tự động sau kiểm định)</span>
                </span>
                <span className="font-bold">
                  {depositAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-200/70 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-neutral-900">
                    Tổng tiền thanh toán thuê
                  </span>
                  <span className="text-xs text-neutral-500 block">
                    (Chưa tính cọc hoàn lại sau chuyến đi)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#059669]">
                    {totalAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Trust disclaimer */}
            <div className="text-xs text-neutral-500 flex items-start gap-2 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Không phát sinh phí ẩn. Khách hàng nhận biên bản kiểm định 2 chiều trước khi lăn bánh. Cọc được hoàn tự động về tài khoản nguồn qua cổng PayOS ngay khi hoàn tất kiểm tra trả xe.
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-2 py-3 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-lg shadow-[#059669]/30 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <span>Xác nhận gửi yêu cầu</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
