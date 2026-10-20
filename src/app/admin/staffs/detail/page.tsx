"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthGate } from "@/features/auth/AuthGate";
import {
  useStaff,
  useUpdateStaff,
  useUpdateStaffLicense,
  useDepartments,
  useFacilities,
  useDriverSchedules,
} from "@/features/admin/staff/hooks";
import { LicenseBadge } from "@/features/admin/staff/components/LicenseBadge";
import { LicenseUploader } from "@/features/admin/staff/components/LicenseUploader";
import { PERMITTED_LICENSE_TYPES, getLicenseState } from "@/features/admin/staff/license-utils";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate } from "@/lib/time";
import type {
  StaffDetail,
  StaffDepartment,
  StaffFacility,
  DriverScheduleItem,
} from "@/features/admin/staff/types";
import { StaffRatingPanel } from "@/features/admin/reviews/components/StaffRatingPanel";
import { useRatingSummary, useReviews } from "@/features/admin/reviews/hooks";
import {
  ArrowLeft,
  Car,
  Star,
  AlertTriangle,
  Clock,
  ExternalLink,
  User,
} from "lucide-react";

type ActiveTab = "profile" | "license" | "schedules" | "activity" | "reviews";

interface StaffDetailViewProps {
  staff: StaffDetail;
  departments: StaffDepartment[];
  facilities: StaffFacility[];
  schedules: DriverScheduleItem[];
}

function StaffDetailView({
  staff,
  departments,
  facilities,
  schedules,
}: StaffDetailViewProps) {
  const router = useRouter();
  const updateStaffMutation = useUpdateStaff();
  const updateLicenseMutation = useUpdateStaffLicense();

  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  const { data: ratingSummary } = useRatingSummary(staff.id);
  const { data: staffReviews } = useReviews({ staffId: staff.id });

  // Form states cho tab Hồ sơ
  const [departmentId, setDepartmentId] = useState<number>(staff.department?.id || 1);
  const [facilityId, setFacilityId] = useState<number>(staff.facility?.id || 1);
  const [isDriver, setIsDriver] = useState<boolean>(staff.isDriver);
  const [profileDirty, setProfileDirty] = useState(false);

  // Form states cho tab Giấy phép
  const [licenseNumber, setLicenseNumber] = useState(staff.license?.number || "");
  const [licenseType, setLicenseType] = useState(staff.license?.type || "B2");
  const [issueDate, setIssueDate] = useState(staff.license?.issueDate || "");
  const [expiryDate, setExpiryDate] = useState(staff.license?.expiryDate || "");
  const [licenseImgUrl, setLicenseImgUrl] = useState(staff.license?.imgUrl || "");
  const [licenseDirty, setLicenseDirty] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);

  // Cảnh báo rời trang khi có thay đổi chưa lưu
  const isDirty = profileDirty || licenseDirty;
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStaffMutation.mutateAsync({
      staffId: staff.id,
      departmentId,
      facilityId,
      isDriver,
    });
    setProfileDirty(false);
  };

  const handleSaveLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseError(null);

    if (issueDate && expiryDate) {
      const issue = new Date(issueDate);
      const expiry = new Date(expiryDate);
      if (expiry <= issue) {
        setLicenseError("Ngày hết hạn GPLX phải sau ngày cấp.");
        return;
      }
    }

    await updateLicenseMutation.mutateAsync({
      staffId: staff.id,
      license: {
        number: licenseNumber.trim(),
        type: licenseType,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
        imgUrl: licenseImgUrl || undefined,
      },
    });
    setLicenseDirty(false);
  };

  const licenseCalc = getLicenseState(expiryDate);

  return (
    <div className="space-y-6">
      {/* 1. Nút quay lại */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (isDirty && !window.confirm("Bạn có thay đổi chưa lưu, vẫn muốn rời trang?")) {
              return;
            }
            router.push("/admin/staffs");
          }}
          className="text-td-muted hover:text-td-ink cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Danh sách nhân viên</span>
        </Button>
      </div>

      {/* 2. Folio + thẻ thông tin nhân viên */}
      <TransitFolio
        index="07"
        tag="ORG"
        kicker="TỔ CHỨC · HỒ SƠ NHÂN SỰ"
        title={<>Hồ sơ <em className="italic text-td-teal">nhân sự.</em></>}
        description="Thông tin công tác, giấy phép lái xe và lịch sử hoạt động của nhân viên tại trạm."
      />

      <div className="rounded border border-td-rule bg-td-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-td-rule bg-td-paper font-mono text-2xl font-black text-td-oxide shadow-xs">
              {staff.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(-2)
                .join("")
                .toUpperCase() || <User className="w-8 h-8 text-td-muted" />}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-td-ink">
                  {staff.fullName}
                </h2>
                <AdminStatusBadge domain="activity" status={staff.isActive ? "active" : "inactive"}>
                  {staff.isActive ? "Đang làm việc" : "Tạm ngừng"}
                </AdminStatusBadge>
                {staff.isDriver && (
                  <span className="rounded-full bg-td-chalk border border-td-oxide/30 px-2.5 py-0.5 text-xs font-bold text-td-oxide flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" />
                    Tài xế chuyên nghiệp
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-td-muted font-mono">
                <span>{staff.email}</span>
                <span>•</span>
                <span>{staff.phone || "Chưa có SĐT"}</span>
                <span>•</span>
                <Link
                  href={`/admin/users/detail?id=${staff.userId}`}
                  className="text-td-oxide hover:underline inline-flex items-center gap-1"
                >
                  <span>Tài khoản hệ thống #{staff.userId}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-td-rule pt-4 md:pt-0 md:pl-6">
            {staff.rating ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-black text-td-ink">
                  <Star className="w-5 h-5 text-td-oxide fill-td-oxide" />
                  <span>{staff.rating.toFixed(2)}</span>
                </div>
                <span className="text-[11px] text-td-muted">Điểm đánh giá</span>
              </div>
            ) : null}

            <div className="text-center">
              <span className="block text-xl font-black text-td-ink">{staff.totalTrips || 0}</span>
              <span className="text-[11px] text-td-muted">Chuyến hoàn tất</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Điều hướng Tab */}
      <div className="border-b border-td-rule flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "profile"
              ? "border-td-oxide text-td-oxide"
              : "border-transparent text-td-muted hover:text-td-ink"
          }`}
        >
          Thông Tin Hồ Sơ
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("license")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "license"
              ? "border-td-oxide text-td-oxide"
              : "border-transparent text-td-muted hover:text-td-ink"
          }`}
        >
          <span>Giấy Phép Lái Xe</span>
          <LicenseBadge expiryDate={staff.license?.expiryDate} showIcon={false} />
        </button>

        {staff.isDriver && (
          <button
            type="button"
            onClick={() => setActiveTab("schedules")}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "schedules"
                ? "border-td-oxide text-td-oxide"
                : "border-transparent text-td-muted hover:text-td-ink"
            }`}
          >
            <span>Lịch Trình & Chuyến Đi</span>
            <span className="rounded bg-td-chalk px-1.5 py-0.2 font-mono text-[11px] font-bold text-td-ink">
              {schedules.length}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "activity"
              ? "border-td-oxide text-td-oxide"
              : "border-transparent text-td-muted hover:text-td-ink"
          }`}
        >
          Hoạt Động & Nhật Ký
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "reviews"
              ? "border-td-oxide text-td-oxide"
              : "border-transparent text-td-muted hover:text-td-ink"
          }`}
        >
          <Star className="h-4 w-4 fill-td-oxide/30" />
          <span>Đánh Giá & Nhận Xét</span>
          {ratingSummary && (
            <span className="rounded bg-td-chalk px-1.5 py-0.2 font-mono text-[11px] font-bold text-td-ink">
              {ratingSummary.count}
            </span>
          )}
        </button>
      </div>

      {/* 4. Nội dung từng tab */}
      {/* Tab 1: Hồ sơ */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="rounded border border-td-rule bg-td-white p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Phòng ban làm việc" required>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(parseInt(e.target.value, 10));
                  setProfileDirty(true);
                }}
                className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Cơ sở / Trạm trực" required>
              <select
                value={facilityId}
                onChange={(e) => {
                  setFacilityId(parseInt(e.target.value, 10));
                  setProfileDirty(true);
                }}
                className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Ngày vào làm">
              <input
                type="text"
                disabled
                value={staff.hiredDate ? formatDate(staff.hiredDate, "dd/MM/yyyy") : "—"}
                className="h-11 w-full rounded border border-td-rule bg-td-chalk px-3 text-sm font-mono text-td-muted"
              />
            </FormField>

            <div className="flex flex-col justify-center space-y-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDriver}
                  onChange={(e) => {
                    setIsDriver(e.target.checked);
                    setProfileDirty(true);
                  }}
                  className="h-4 w-4 rounded border-td-rule text-td-oxide focus:ring-td-oxide/20"
                />
                <span className="text-sm font-bold text-td-ink">Đăng ký làm Tài xế chuyên nghiệp</span>
              </label>
              <p className="text-xs text-td-muted">
                Bật cờ này cho phép nhân viên được phân công vào các chuyến thuê xe có tài xế.
              </p>
            </div>
          </div>

          {/* Cảnh báo nếu bật isDriver nhưng chưa có GPLX */}
          {isDriver && (!staff.license || !staff.license.number) && (
            <div className="flex items-start gap-3 rounded border border-warning/40 bg-warning-bg/30 p-4 text-xs text-warning">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Chưa có thông tin giấy phép lái xe hợp lệ</p>
                <p className="mt-0.5">
                  Tài xế sẽ không thể được điều phối vào các đơn thuê thực tế cho đến khi GPLX được cập nhật đầy đủ và còn hạn.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-td-rule">
            <Button type="submit" variant="primary" disabled={!profileDirty || updateStaffMutation.isPending}>
              {updateStaffMutation.isPending ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Giấy phép lái xe */}
      {activeTab === "license" && (
        <form onSubmit={handleSaveLicense} className="rounded border border-td-rule bg-td-white p-6 sm:p-8 space-y-6">
          {/* Cảnh báo tình trạng hạn bằng */}
          {licenseCalc.state === "expired" && (
            <div className="flex items-start gap-3 rounded border border-danger/30 bg-danger-bg/40 p-4 text-xs text-danger">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Giấy phép lái xe đã hết hạn</p>
                <p className="mt-0.5">
                  Tài xế không được phép nhận bất kỳ chuyến thuê nào có khoảng thời gian sau ngày hết hạn.
                </p>
              </div>
            </div>
          )}

          {licenseCalc.state === "expiring" && (
            <div className="flex items-start gap-3 rounded border border-warning/40 bg-warning-bg/40 p-4 text-xs text-warning">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Giấy phép lái xe sắp hết hạn ({licenseCalc.daysRemaining} ngày còn lại)</p>
                <p className="mt-0.5">
                  Vui lòng nhắc nhở nhân viên hoàn tất thủ tục đổi bằng để tránh gián đoạn điều phối.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Số giấy phép lái xe" required>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => {
                  setLicenseNumber(e.target.value);
                  setLicenseDirty(true);
                }}
                placeholder="Ví dụ: 790123456789"
                className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm font-mono text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              />
            </FormField>

            <FormField label="Hạng giấy phép" required>
              <select
                value={licenseType}
                onChange={(e) => {
                  setLicenseType(e.target.value);
                  setLicenseDirty(true);
                }}
                className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm font-bold text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              >
                {PERMITTED_LICENSE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    Hạng {t}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Ngày cấp">
              <input
                type="date"
                value={issueDate}
                onChange={(e) => {
                  setIssueDate(e.target.value);
                  setLicenseDirty(true);
                }}
                className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              />
            </FormField>

            <FormField label="Ngày hết hạn" required error={licenseError || undefined}>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => {
                  setExpiryDate(e.target.value);
                  setLicenseDirty(true);
                  if (licenseError) setLicenseError(null);
                }}
                className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              />
            </FormField>
          </div>

          {/* Phần tải ảnh GPLX */}
          <div className="space-y-2 pt-2 border-t border-td-rule">
            <h4 className="text-sm font-bold text-td-ink">Bản chụp giấy phép lái xe</h4>
            <LicenseUploader
              currentUrl={licenseImgUrl}
              onUploadSuccess={(url) => {
                setLicenseImgUrl(url);
                setLicenseDirty(true);
              }}
              onRemove={() => {
                setLicenseImgUrl("");
                setLicenseDirty(true);
              }}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-td-rule">
            <Button type="submit" variant="primary" disabled={!licenseDirty || updateLicenseMutation.isPending}>
              {updateLicenseMutation.isPending ? "Đang lưu..." : "Lưu thông tin giấy phép"}
            </Button>
          </div>
        </form>
      )}

      {/* Tab 3: Lịch trình & Chuyến đi */}
      {activeTab === "schedules" && staff.isDriver && (
        <div className="rounded border border-td-rule bg-td-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-td-ink">Lịch Trình Công Tác</h3>
              <p className="text-xs text-td-muted">
                Các chuyến thuê đã được phân công cho tài xế {staff.fullName}.
              </p>
            </div>
            <Link href="/admin/drivers/schedule">
              <Button variant="secondary" size="sm">
                <span>Xem bảng lịch toàn hệ thống</span>
              </Button>
            </Link>
          </div>

          {schedules.length === 0 ? (
            <div className="rounded border border-td-rule bg-td-paper p-8 text-center text-xs text-td-muted">
              Hiện chưa có chuyến thuê nào được gán cho tài xế này trong tuần hiện tại.
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => (
                <div
                  key={s.assignmentId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded border border-td-rule bg-td-paper p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-td-ink">Đơn thuê #{s.rentalId}</span>
                      <span className="rounded bg-td-chalk px-2 py-0.5 text-xs font-bold text-td-oxide">
                        {s.vehicleName} ({s.licensePlate})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-td-muted font-mono">
                      <Clock className="w-3.5 h-3.5 text-td-oxide" />
                      <span>{formatDate(s.start, "HH:mm dd/MM/yyyy")}</span>
                      <span>—</span>
                      <span>{formatDate(s.end, "HH:mm dd/MM/yyyy")}</span>
                      <span className="rounded bg-td-chalk px-1.5 py-0.5 text-[10px] text-td-ink font-sans font-bold">
                        Đệm: {s.bufferMinutes || 60}p
                      </span>
                    </div>
                    {s.note && <p className="text-xs text-td-ink italic">{s.note}</p>}
                  </div>

                  <Link href={`/admin/rentals?id=${s.rentalId}`}>
                    <Button variant="secondary" size="sm">
                      <span>Chi tiết đơn</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Hoạt động */}
      {activeTab === "activity" && (
        <div className="rounded border border-td-rule bg-td-white p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-td-ink">Tổng Quan Hoạt Động</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded border border-td-rule bg-td-paper p-4 text-center">
              <span className="text-xs text-td-muted block">Trạng thái công tác</span>
              <span className="text-base font-bold text-td-ink mt-1 block">
                {staff.isActive ? "Đang hoạt động" : "Tạm khóa"}
              </span>
            </div>
            <div className="rounded border border-td-rule bg-td-paper p-4 text-center">
              <span className="text-xs text-td-muted block">Tổng số chuyến hoàn tất</span>
              <span className="text-base font-bold text-td-ink mt-1 block">
                {staff.totalTrips || 0} chuyến
              </span>
            </div>
            <div className="rounded border border-td-rule bg-td-paper p-4 text-center">
              <span className="text-xs text-td-muted block">Đánh giá trung bình</span>
              <span className="text-base font-bold text-td-ink mt-1 block">
                {staff.rating ? `${staff.rating.toFixed(2)} / 5.0 sao` : "Chưa có"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Đánh giá & Nhận xét */}
      {activeTab === "reviews" && (
        <div className="rounded border border-td-rule bg-td-white p-6 sm:p-8">
          <StaffRatingPanel
            staffId={staff.id}
            staffName={staff.fullName}
            summary={
              ratingSummary ?? {
                average: staff.rating ?? null,
                count: 0,
                distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
              }
            }
            recentReviews={staffReviews?.items ?? []}
          />
        </div>
      )}
    </div>
  );
}

function StaffDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idParam = searchParams.get("id");
  const staffId = idParam ? parseInt(idParam, 10) : 0;

  const { data: staff, isLoading, error } = useStaff(staffId);
  const { data: departments = [] } = useDepartments();
  const { data: facilities = [] } = useFacilities();
  const { data: schedules = [] } = useDriverSchedules({ driverStaffId: staffId });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded bg-td-chalk animate-pulse" />
        <div className="h-40 rounded bg-td-white animate-pulse" />
        <div className="h-96 rounded bg-td-white animate-pulse" />
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="py-8">
        <ErrorState
          title="Không tìm thấy nhân viên"
          message={error instanceof Error ? error.message : "Hồ sơ nhân viên không tồn tại hoặc đã bị xóa."}
          action={
            <Button variant="secondary" onClick={() => router.push("/admin/staffs")}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Quay lại danh sách</span>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <StaffDetailView
      key={staff.id}
      staff={staff}
      departments={departments}
      facilities={facilities}
      schedules={schedules}
    />
  );
}

export default function StaffDetailPage() {
  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
        <Suspense fallback={<div className="h-40 rounded bg-td-white animate-pulse" />}>
          <StaffDetailContent />
        </Suspense>
    </AuthGate>
  );
}
