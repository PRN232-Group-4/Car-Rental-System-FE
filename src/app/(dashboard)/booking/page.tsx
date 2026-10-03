"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Car,
  Package,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  CreditCard,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVehicles, Vehicle } from "@/features/vehicles";
import { getMySubscriptions, CustomerSubscription } from "@/features/subscriptions";
import { getCustomerLicense, CustomerLicense } from "@/features/licenses";
import { defaultApiClient } from "@/api/default-api-client";

export default function DatXePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">Đang tải biểu mẫu đặt xe...</div>}>
      <DatXeForm />
    </Suspense>
  );
}

function DatXeForm() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const queryVehicleId = searchParams.get("vehicleId");
  const querySubscriptionId = searchParams.get("subscriptionId");

  // Fetch Vehicles
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: () => getVehicles(),
  });

  // Fetch My Subscriptions
  const { data: mySubscriptions = [] } = useQuery<CustomerSubscription[]>({
    queryKey: ["my-subscriptions"],
    queryFn: getMySubscriptions,
  });

  // Fetch GPLX License
  const { data: license } = useQuery<CustomerLicense | null>({
    queryKey: ["customer-license"],
    queryFn: getCustomerLicense,
  });

  // Booking mode: "direct" | "subscription"
  const [bookingMode, setBookingMode] = useState<"direct" | "subscription">(
    querySubscriptionId ? "subscription" : "direct"
  );

  // Form inputs
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | string>(
    queryVehicleId || ""
  );
  const [selectedSubId, setSelectedSubId] = useState<number | string>(
    querySubscriptionId || ""
  );

  // Defaults: start tomorrow 8:00 AM, end tomorrow 6:00 PM (10 hours)
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const [startDate, setStartDate] = useState(tomorrow);
  const [startTime, setStartTime] = useState("08:00");
  const [endDate, setEndDate] = useState(tomorrow);
  const [endTime, setEndTime] = useState("18:00");
  const [hasDriver, setHasDriver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    bookingId: string | number;
    isSubscription: boolean;
    invoiceId?: number;
  } | null>(null);

  const activeSubs = useMemo(() => mySubscriptions.filter((s) => s.status === "active"), [mySubscriptions]);

  // Selected vehicle & subscription objects derived purely without cascading renders
  const selectedVehicle = useMemo(() => {
    if (selectedVehicleId) {
      const found = vehicles.find((v) => String(v.id) === String(selectedVehicleId));
      if (found) return found;
    }
    return vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  const selectedSubscription = useMemo(() => {
    if (selectedSubId) {
      const found = activeSubs.find((s) => String(s.id) === String(selectedSubId));
      if (found) return found;
    }
    return activeSubs[0] || null;
  }, [activeSubs, selectedSubId]);

  // Calculate duration in hours
  const durationHours = useMemo(() => {
    try {
      const start = new Date(`${startDate}T${startTime}:00`);
      const end = new Date(`${endDate}T${endTime}:00`);
      const diffMs = end.getTime() - start.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      return Math.max(0, Math.round(hours * 10) / 10);
    } catch {
      return 0;
    }
  }, [startDate, startTime, endDate, endTime]);

  // Check if subscription has enough hours
  const isSubscriptionInsufficient = useMemo(() => {
    if (bookingMode !== "subscription" || !selectedSubscription) return false;
    return selectedSubscription.remainingHours < durationHours;
  }, [bookingMode, selectedSubscription, durationHours]);

  // Direct rental cost breakdown
  const pricing = useMemo(() => {
    if (!selectedVehicle) return { rentalFee: 0, vat: 0, deposit: 0, total: 0 };
    const baseFee = (selectedVehicle.hourlyPrice || 100000) * durationHours;
    const vat = Math.round(baseFee * 0.1);
    const deposit = 2000000; // Tiền cọc tiêu chuẩn
    return {
      rentalFee: baseFee,
      vat,
      deposit,
      total: baseFee + vat + deposit,
    };
  }, [selectedVehicle, durationHours]);

  // Submit Handler
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (durationHours <= 0) {
      setErrorMessage("Thời gian trả xe phải sau thời gian nhận xe tối thiểu 1 giờ.");
      return;
    }

    if (!selectedVehicle) {
      setErrorMessage("Vui lòng chọn phương tiện cần thuê.");
      return;
    }

    // Gate direct rental on driver license approval (FE-29 / P5.1)
    if (bookingMode === "direct") {
      if (license?.status !== "approved") {
        setErrorMessage("Bạn chưa có Giấy phép lái xe được phê duyệt. Vui lòng xác minh GPLX để tiếp tục.");
        return;
      }
    }

    // Gate subscription on remaining hours
    if (bookingMode === "subscription") {
      if (!selectedSubscription) {
        setErrorMessage("Vui lòng chọn gói thuê bao còn hiệu lực.");
        return;
      }
      if (selectedSubscription.remainingHours < durationHours) {
        setErrorMessage(
          `Gói thuê bao không đủ số giờ còn lại (yêu cầu ${durationHours} giờ, còn lại ${selectedSubscription.remainingHours} giờ).`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${endDate}T${endTime}:00`).toISOString();

      const payload = {
        vehicleId: Number(selectedVehicle.id),
        startTime: startDateTime,
        endTime: endDateTime,
        hasDriver,
        subscriptionId: bookingMode === "subscription" ? Number(selectedSubscription?.id) : null,
      };

      const res = await defaultApiClient.post<{ id?: number; rentalId?: number; invoiceId?: number }>(
        "rentals/hourly",
        payload
      );

      const bookingId = res?.id || res?.rentalId || `TD-${Date.now().toString().slice(-6)}`;

      if (bookingMode === "subscription") {
        // Invalidate subscription queries so remaining hours refresh immediately
        queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
        setSuccessResult({
          message: "Đặt xe bằng gói thuê bao thành công! Số giờ dự kiến đã được giữ chỗ trong gói của bạn.",
          bookingId,
          isSubscription: true,
        });
      } else {
        // Direct rental: Create or redirect to invoice
        setSuccessResult({
          message: "Đặt xe trực tiếp thành công! Vui lòng hoàn tất thanh toán tiền cọc và hoá đơn thuê xe.",
          bookingId,
          isSubscription: false,
          invoiceId: res?.invoiceId || (typeof bookingId === "number" ? bookingId : 1),
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo yêu cầu thuê xe.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
          <Car className="w-3.5 h-3.5 text-emerald-600" />
          <span>Đặt xe trực tuyến</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Tạo đơn thuê xe
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Linh hoạt lựa chọn thuê trực tiếp thanh toán từng lượt hoặc sử dụng gói thuê bao đã mua.
        </p>
      </div>

      {/* Success Modal / Banner */}
      {successResult && (
        <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-black text-neutral-900">Đặt xe thành công!</h2>
            <p className="text-xs font-semibold text-neutral-500 mt-1">
              Mã đơn đặt xe: <span className="text-emerald-700 font-bold font-mono">#{successResult.bookingId}</span>
            </p>
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
              {successResult.message}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {successResult.isSubscription ? (
              <Link
                href="/my-subscriptions"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Xem gói thuê của tôi
              </Link>
            ) : (
              <Link
                href="/invoices"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Thanh toán hoá đơn & Tiền cọc</span>
              </Link>
            )}
            <button
              onClick={() => setSuccessResult(null)}
              className="px-6 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-semibold text-sm transition-all"
            >
              Đặt thêm chuyến khác
            </button>
          </div>
        </div>
      )}

      {/* Booking Form Card */}
      {!successResult && (
        <form onSubmit={handleBooking} className="space-y-8">
          {/* Step 1: Mode Switcher */}
          <div className="p-2 rounded-2xl bg-neutral-200/60 grid grid-cols-2 gap-2 max-w-md">
            <button
              type="button"
              onClick={() => setBookingMode("direct")}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                bookingMode === "direct"
                  ? "bg-white text-neutral-900 shadow-md"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Thuê trực tiếp (Trả từng lượt)</span>
            </button>

            <button
              type="button"
              onClick={() => setBookingMode("subscription")}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                bookingMode === "subscription"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Dùng gói thuê bao</span>
            </button>
          </div>

          {/* Alert / Warning for GPLX (Direct rental) */}
          {bookingMode === "direct" && license?.status !== "approved" && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Yêu cầu xác minh Giấy phép lái xe</p>
                  <p className="text-amber-800 mt-0.5">
                    Để thuê xe trực tiếp, bạn cần gửi ảnh chụp và số GPLX hợp lệ để hệ thống phê duyệt.
                  </p>
                </div>
              </div>
              <Link
                href="/driver-license"
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors"
              >
                Cập nhật GPLX
              </Link>
            </div>
          )}

          {/* Subscription Selector (When booking with subscription) */}
          {bookingMode === "subscription" && (
            <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900">
                  Chọn gói thuê bao áp dụng
                </h3>
                <Link
                  href="/subscriptions"
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Mua thêm gói mới
                </Link>
              </div>

              {activeSubs.length === 0 ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
                  <span>Bạn hiện không có gói thuê bao nào đang hoạt động.</span>
                  <Link
                    href="/subscriptions"
                    className="font-bold underline ml-2"
                  >
                    Mua gói ngay
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeSubs.map((sub) => {
                    const isSelected = String(selectedSubId) === String(sub.id);
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubId(sub.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/50"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-neutral-900">
                            {sub.planName}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-700">
                            Còn {sub.remainingHours}h / {sub.totalHours}h
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          Hạn dùng: {new Date(sub.endDate).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {isSubscriptionInsufficient && selectedSubscription && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Chuyến đi này kéo dài <strong>{durationHours} giờ</strong>, vượt quá số giờ còn lại trong gói (
                    <strong>{selectedSubscription.remainingHours} giờ</strong>).
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Vehicle Selection */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              Chọn phương tiện di chuyển
            </h3>

            {isLoadingVehicles ? (
              <div className="h-40 rounded-2xl bg-neutral-100 animate-pulse" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => {
                  const isSelected = String(selectedVehicleId) === String(v.id);
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-3 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/40 shadow-xs"
                          : "border-neutral-200 hover:border-neutral-300 bg-white"
                      }`}
                    >
                      <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                        <img
                          src={v.imageUrl}
                          alt={v.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-neutral-900 truncate">
                          {v.name}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {v.categoryLabel} · {v.seats} chỗ
                        </div>
                        <div className="text-xs font-bold text-emerald-600 mt-2">
                          {v.hourlyPrice.toLocaleString("vi-VN")} đ/h
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Schedule Time */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              Thời gian nhận và trả xe
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pickup Time */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Thời gian nhận xe</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                  />
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              {/* Return Time */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Thời gian trả xe</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                  />
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-600 pt-2">
              <span className="font-semibold">
                Thời lượng thuê dự kiến: <strong>{durationHours} giờ</strong>
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasDriver}
                  onChange={(e) => setHasDriver(e.target.checked)}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Yêu cầu kèm tài xế chuyên nghiệp</span>
              </label>
            </div>
          </div>

          {/* Pricing & Summary Card */}
          <div className="p-6 rounded-3xl bg-neutral-900 text-white shadow-xl space-y-4">
            <h3 className="text-base font-bold tracking-tight">Chi phí dự toán</h3>

            {bookingMode === "subscription" ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Hình thức:</span>
                  <span className="font-bold text-emerald-400">Trừ vào gói thuê bao</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Số giờ dự kiến trừ:</span>
                  <span className="font-bold">{durationHours} giờ</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Phí VAT & Tiền cọc:</span>
                  <span className="text-emerald-400 font-bold">0 đ (Miễn phí)</span>
                </div>
                <div className="pt-3 border-t border-neutral-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-emerald-400">0 đ</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Tiền thuê ({durationHours}h x {selectedVehicle?.hourlyPrice?.toLocaleString("vi-VN")}đ):</span>
                  <span className="font-bold">{pricing.rentalFee.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Thuế VAT (10%):</span>
                  <span className="font-bold">{pricing.vat.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Tiền đặt cọc hoàn lại:</span>
                  <span className="font-bold">{pricing.deposit.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="pt-3 border-t border-neutral-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {pricing.total.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Submit Action Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                submitting ||
                (bookingMode === "subscription" && isSubscriptionInsufficient) ||
                (bookingMode === "direct" && license?.status !== "approved")
              }
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý đơn đặt xe...</span>
                </>
              ) : (
                <>
                  <span>
                    {bookingMode === "subscription"
                      ? "Xác nhận đặt xe bằng gói"
                      : "Tiếp tục sang bước thanh toán"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
