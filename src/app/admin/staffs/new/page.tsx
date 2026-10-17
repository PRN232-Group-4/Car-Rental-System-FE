"use client";

import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import StaffShell from "@/features/admin/StaffShell";
import { AuthGate } from "@/features/auth/AuthGate";
import { useCreateStaff, useDepartments, useFacilities } from "@/features/admin/staff/hooks";
import { PERMITTED_LICENSE_TYPES } from "@/features/admin/staff/license-utils";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { UserPlus, ArrowLeft, Car } from "lucide-react";

function CreateStaffContent() {
  const router = useRouter();
  const createStaffMutation = useCreateStaff();
  const { data: departments = [] } = useDepartments();
  const { data: facilities = [] } = useFacilities();

  const [userId, setUserId] = useState<string>("6");
  const [departmentId, setDepartmentId] = useState<number>(1);
  const [facilityId, setFacilityId] = useState<number>(1);
  const [hiredDate, setHiredDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isDriver, setIsDriver] = useState<boolean>(false);

  // License fields
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseType, setLicenseType] = useState("B2");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsedUserId = parseInt(userId, 10);
    if (!parsedUserId || parsedUserId <= 0) {
      setValidationError("Vui lòng nhập mã tài khoản người dùng hợp lệ.");
      return;
    }

    if (isDriver && expiryDate && issueDate) {
      if (new Date(expiryDate) <= new Date(issueDate)) {
        setValidationError("Ngày hết hạn GPLX phải sau ngày cấp.");
        return;
      }
    }

    try {
      const created = await createStaffMutation.mutateAsync({
        userId: parsedUserId,
        departmentId,
        facilityId,
        hiredDate,
        isDriver,
        license: isDriver && licenseNumber.trim()
          ? {
              number: licenseNumber.trim(),
              type: licenseType,
              issueDate: issueDate || undefined,
              expiryDate: expiryDate || undefined,
            }
          : undefined,
      });

      router.push(`/admin/staffs/detail?id=${created.id}`);
    } catch {
      // Toast lỗi đã hiển thị ở hook mutation
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Back Button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/staffs")}
          className="text-ink-3 hover:text-ink cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Quay lại danh sách</span>
        </Button>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-e1 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <UserPlus className="w-4 h-4" />
            <span>Thêm Mới Hồ Sơ</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-ink tracking-tight">
            Tạo Hồ Sơ Nhân Viên / Tài Xế
          </h1>
          <p className="mt-1 text-xs text-ink-3">
            Liên kết tài khoản người dùng có sẵn trong hệ thống với hồ sơ công tác tại phòng ban hoặc trạm điều phối.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2 border-t border-line">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Mã tài khoản người dùng (User ID)"
              required
              helperText="Nhập ID tài khoản đã tạo tại phân hệ Quản lý Người dùng"
            >
              <input
                type="number"
                min="1"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Ví dụ: 6"
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm font-mono text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </FormField>

            <FormField label="Ngày vào làm việc" required>
              <input
                type="date"
                value={hiredDate}
                onChange={(e) => setHiredDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </FormField>

            <FormField label="Phòng ban trực thuộc" required>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(parseInt(e.target.value, 10))}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Trạm / Cơ sở công tác" required>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(parseInt(e.target.value, 10))}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Tùy chọn tài xế */}
          <div className="rounded-2xl border border-line bg-canvas p-5 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDriver}
                onChange={(e) => setIsDriver(e.target.checked)}
                className="h-4 w-4 rounded border-line text-primary focus:ring-primary/20"
              />
              <span className="text-sm font-bold text-ink flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                Đăng ký nhân sự làm Tài Xế Chuyên Nghiệp
              </span>
            </label>

            {isDriver && (
              <div className="space-y-4 pt-3 border-t border-line/60">
                <p className="text-xs text-ink-3">
                  Nhập thông tin giấy phép lái xe ban đầu phục vụ thẩm định điều phối chuyến đi:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Số GPLX">
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="Ví dụ: 790123456789"
                      className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm font-mono text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </FormField>

                  <FormField label="Hạng bằng">
                    <select
                      value={licenseType}
                      onChange={(e) => setLicenseType(e.target.value)}
                      className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm font-bold text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </FormField>

                  <FormField label="Ngày hết hạn">
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {validationError && (
            <div className="rounded-xl border border-danger/30 bg-danger-bg/40 p-3 text-xs font-medium text-danger">
              {validationError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/admin/staffs")}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createStaffMutation.isPending}
            >
              {createStaffMutation.isPending ? "Đang tạo..." : "Xác nhận tạo hồ sơ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateStaffPage() {
  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
      <StaffShell>
        <Suspense fallback={<div className="h-40 rounded-2xl bg-surface animate-pulse" />}>
          <CreateStaffContent />
        </Suspense>
      </StaffShell>
    </AuthGate>
  );
}
