"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VehicleImage from "@/components/ui/VehicleImage";
import { BookingModal } from "@/features/rentals";
import { getVehicleById } from "@/features/vehicles/api";
import type { Vehicle } from "@/features/vehicles/types";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ArrowLeft,
  MapPin,
  Zap,
  Users,
  Cog,
  Fuel,
  BatteryCharging,
  Gauge,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function VehicleDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-canvas text-ink flex items-center justify-center p-6">
          <p className="text-sm font-semibold text-ink-3">Đang tải thông tin phương tiện...</p>
        </div>
      }
    >
      <VehicleDetailContent />
    </Suspense>
  );
}

function VehicleDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const mode = searchParams.get("mode") === "longterm" ? "longterm" : "hourly";
  const facilityId = searchParams.get("facilityId") || "";
  const startDate = searchParams.get("startDate") || "";
  const startTime = searchParams.get("startTime") || "";
  const endDate = searchParams.get("endDate") || "";
  const endTime = searchParams.get("endTime") || "";

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Không tìm thấy mã phương tiện.");
      return;
    }

    setLoading(true);
    setError(null);
    getVehicleById(id)
      .then((data) => {
        if (data) {
          setVehicle(data);
        } else {
          setError(`Không tìm thấy phương tiện với mã '${id}'.`);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Lỗi tải thông tin phương tiện.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val) + " ₫";
  };

  const bookingUrl = (() => {
    const params = new URLSearchParams();
    if (id) params.set("vehicleId", id);
    params.set("mode", mode);
    if (facilityId) params.set("facilityId", facilityId);
    if (startDate && startTime) {
      params.set("startTime", `${startDate}T${startTime}`);
    }
    if (endDate && endTime) {
      params.set("endTime", `${endDate}T${endTime}`);
    }
    return `/booking?${params.toString()}`;
  })();

  return (
    <div className="min-h-dvh bg-canvas text-ink flex flex-col selection:bg-primary/20 selection:text-warning">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/find"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-ink-3 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách xe</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : error || !vehicle ? (
          <div className="p-12 rounded-2xl bg-surface border border-line text-center space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-danger mx-auto" />
            <h2 className="text-lg font-bold text-ink">Không tìm thấy xe</h2>
            <p className="text-xs text-ink-3 leading-relaxed">
              {error || "Xe này hiện không khả dụng hoặc đã bị thay đổi thông tin."}
            </p>
            <Link
              href="/find"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
            >
              Xem các phương tiện khác
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Images, Specs, Policies */}
            <div className="lg:col-span-8 space-y-8">
              {/* Main Image Stage */}
              <div className="rounded-3xl bg-surface border border-line overflow-hidden shadow-e1">
                <div className="relative aspect-[16/9] w-full bg-sunken">
                  <VehicleImage
                    src={vehicle.imageUrl}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase bg-stage-ink text-white border border-white/20 shadow-xs">
                      {vehicle.categoryLabel}
                    </span>
                    {vehicle.category.includes("electric") && (
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase bg-primary text-white shadow-sm flex items-center gap-1.5">
                        <Zap className="w-3 h-3" />
                        <span>100% THUẦN ĐIỆN</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-surface text-ink border border-line shadow-xs">
                    Năm sản xuất: {vehicle.year}
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight text-balance">
                      {vehicle.name}
                    </h1>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-success-bg text-success border border-success/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sẵn sàng lăn bánh</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>Chi nhánh: {vehicle.facilityName}</span>
                  </div>

                  {vehicle.description && (
                    <p className="mt-4 text-sm text-ink-2 leading-relaxed text-pretty">
                      {vehicle.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-e1">
                <h3 className="text-lg font-bold text-ink mb-5 flex items-center gap-2">
                  <Cog className="w-5 h-5 text-primary" />
                  <span>Thông số kỹ thuật phương tiện</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-sunken space-y-1">
                    <span className="text-xs text-ink-3 font-semibold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Số chỗ ngồi</span>
                    </span>
                    <span className="font-bold text-ink text-sm sm:text-base block">
                      {vehicle.seats ? `${vehicle.seats} chỗ` : "Tiêu chuẩn"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sunken space-y-1">
                    <span className="text-xs text-ink-3 font-semibold flex items-center gap-1.5">
                      <Cog className="w-3.5 h-3.5 text-primary" />
                      <span>Hộp số / Truyền động</span>
                    </span>
                    <span className="font-bold text-ink text-sm sm:text-base block">
                      {vehicle.transmission}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sunken space-y-1">
                    <span className="text-xs text-ink-3 font-semibold flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-primary" />
                      <span>Nhiên liệu</span>
                    </span>
                    <span className="font-bold text-ink text-sm sm:text-base block">
                      {vehicle.fuelType || "Xăng tiêu chuẩn"}
                    </span>
                  </div>

                  {vehicle.batteryCapacity && (
                    <div className="p-3.5 rounded-2xl bg-sunken space-y-1">
                      <span className="text-xs text-ink-3 font-semibold flex items-center gap-1.5">
                        <BatteryCharging className="w-3.5 h-3.5 text-primary" />
                        <span>Dung lượng pin</span>
                      </span>
                      <span className="font-bold text-primary text-sm sm:text-base block">
                        {vehicle.batteryCapacity}
                      </span>
                    </div>
                  )}

                  {vehicle.maxRange && (
                    <div className="p-3.5 rounded-2xl bg-sunken space-y-1">
                      <span className="text-xs text-ink-3 font-semibold flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-primary" />
                        <span>Tầm hoạt động</span>
                      </span>
                      <span className="font-bold text-ink text-sm sm:text-base block">
                        {vehicle.maxRange}
                      </span>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-sunken space-y-1">
                    <span className="text-xs text-ink-3 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span>Kiểm định kỹ thuật</span>
                    </span>
                    <span className="font-bold text-success text-sm sm:text-base block">
                      12 Hạng Mục Đạt Chuẩn
                    </span>
                  </div>
                </div>
              </div>

              {/* Rental Policy & Guarantees */}
              <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-e1 space-y-4">
                <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Chính sách thuê & Cam kết Thong Dong</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-ink-2">
                  <div className="p-4 rounded-2xl bg-canvas border border-line space-y-1.5">
                    <span className="font-bold text-ink flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Bàn giao số hóa 3 phút</span>
                    </span>
                    <p className="text-xs text-ink-3 leading-relaxed">
                      Biên bản kiểm định ảnh 360° trực tuyến. Nhận và trả xe nhanh chóng bằng mã QR trên ứng dụng.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-canvas border border-line space-y-1.5">
                    <span className="font-bold text-ink flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Hoàn cọc tự động qua PayOS</span>
                    </span>
                    <p className="text-xs text-ink-3 leading-relaxed">
                      Cọc thuê được giải tỏa tự động vào tài khoản ngân hàng trong vòng 5 phút sau khi hoàn tất kiểm tra xe.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Sticky Pricing & Action Console */}
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-line shadow-e2 space-y-5">
                <h2 className="text-sm font-bold text-ink">
                  Báo giá niêm yết
                </h2>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-black text-primary tabular-nums">
                      {formatVND(mode === "hourly" ? vehicle.hourlyPrice : vehicle.monthlyPrice)}
                    </span>
                    <span className="text-xs font-semibold text-ink-3">
                      {mode === "hourly" ? " / giờ" : " / tháng"}
                    </span>
                  </div>

                  <span className="text-xs text-ink-3 block mt-1">
                    Đã bao gồm bảo hiểm trách nhiệm & phí đường bộ
                  </span>
                </div>

                <div className="pt-4 border-t border-line space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-3">Hình thức thuê:</span>
                    <span className="font-bold text-ink">
                      {mode === "hourly" ? "Thuê theo giờ" : "Thuê dài hạn"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-3">Điểm nhận xe:</span>
                    <span className="font-bold text-ink truncate max-w-[180px]">
                      {vehicle.facilityName}
                    </span>
                  </div>
                </div>

                <div className="pt-3 space-y-2.5">
                  <Link
                    href={bookingUrl}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-primary/20 transition-all text-center cursor-pointer"
                  >
                    <span>Tiến hành đặt xe</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full text-xs font-bold"
                  >
                    <span>Đặt nhanh qua hộp thoại</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingModalOpen && vehicle && (
        <BookingModal
          vehicle={vehicle}
          onClose={() => setBookingModalOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}
