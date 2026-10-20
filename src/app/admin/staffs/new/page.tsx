"use client";

import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/AuthGate";
import { useCreateStaff, useDepartments, useFacilities } from "@/features/admin/staff/hooks";
import { PERMITTED_LICENSE_TYPES } from "@/features/admin/staff/license-utils";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Car } from "lucide-react";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { useInlineValidation, ValidatedForm, InlineInput, InlineSelect } from "@/components/forms/inline-validation";

function CreateStaffContent() {
  const router = useRouter();
  const createStaffMutation = useCreateStaff();
  const { data: departments = [] } = useDepartments();
  const { data: facilities = [] } = useFacilities();

  const validation = useInlineValidation();
  const [userId, setUserId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [facilityId, setFacilityId] = useState<number>(0);
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
    if (createStaffMutation.isPending) return;
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
    } catch (error) {
      setValidationError(validation.report(error, { licenseexpirydate: "expiryDate", licenseissuedate: "issueDate", licensenumber: "licenseNumber", licensetype: "licenseType" }));
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
          className="text-td-muted hover:text-td-ink cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Quay lại danh sách</span>
        </Button>
      </div>

      <TransitFolio
        index="07"
        tag="ORG"
        kicker="TỔ CHỨC · HỒ SƠ NHÂN SỰ MỚI"
        title={<>Tạo hồ sơ <em className="italic text-td-teal">nhân viên / tài xế.</em></>}
        description="Liên kết tài khoản người dùng có sẵn trong hệ thống với hồ sơ công tác tại phòng ban hoặc trạm điều phối."
      />

      <div className="rounded border border-td-rule bg-td-white p-6 sm:p-8 space-y-6">
        <ValidatedForm validation={validation} validate={() => isDriver && expiryDate && issueDate && expiryDate <= issueDate ? { expiryDate: "Ngày hết hạn GPLX phải sau ngày cấp." } : {}} onSubmit={handleSubmit} className="space-y-6 pt-2 border-t border-td-rule">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Mã tài khoản người dùng (User ID)"
              required
              helperText="Nhập ID tài khoản đã tạo tại phân hệ Quản lý Người dùng"
            >
              <InlineInput
                name="userId" required
                type="number"
                min="1"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Ví dụ: 6"
                className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm font-mono text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              />
            </FormField>

            <FormField label="Ngày vào làm việc" required>
              <InlineInput
                name="hiredDate" required
                type="date"
                value={hiredDate}
                onChange={(e) => setHiredDate(e.target.value)}
                className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              />
            </FormField>

            <FormField label="Phòng ban trực thuộc" required>
              <InlineSelect
                name="departmentId" required
                value={departmentId || ""}
                onChange={(e) => setDepartmentId(parseInt(e.target.value, 10))}
                className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              >
                <option value="">Chọn phòng ban</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </InlineSelect>
            </FormField>

            <FormField label="Trạm / Cơ sở công tác" required>
              <InlineSelect
                name="facilityId" required
                value={facilityId || ""}
                onChange={(e) => setFacilityId(parseInt(e.target.value, 10))}
                className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
              >
                <option value="">Chọn cơ sở</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </InlineSelect>
            </FormField>
          </div>

          {/* Tùy chọn tài xế */}
          <div className="rounded border border-td-rule bg-td-paper p-5 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDriver}
                onChange={(e) => setIsDriver(e.target.checked)}
                className="h-4 w-4 rounded border-td-rule text-td-oxide focus:ring-td-oxide/20"
              />
              <span className="text-sm font-bold text-td-ink flex items-center gap-2">
                <Car className="w-4 h-4 text-td-oxide" />
                Đăng ký nhân sự làm Tài Xế Chuyên Nghiệp
              </span>
            </label>

            {isDriver && (
              <div className="space-y-4 pt-3 border-t border-td-rule/60">
                <p className="text-xs text-td-muted">
                  Nhập thông tin giấy phép lái xe ban đầu phục vụ thẩm định điều phối chuyến đi:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Số GPLX">
                    <InlineInput
                      name="licenseNumber"
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="Ví dụ: 790123456789"
                      className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm font-mono text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
                    />
                  </FormField>

                  <FormField label="Hạng bằng">
                    <InlineSelect
                      name="licenseType"
                      value={licenseType}
                      onChange={(e) => setLicenseType(e.target.value)}
                      className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm font-bold text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
                    >
                      {PERMITTED_LICENSE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          Hạng {t}
                        </option>
                      ))}
                    </InlineSelect>
                  </FormField>

                  <FormField label="Ngày cấp">
                    <InlineInput
                      name="issueDate"
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
                    />
                  </FormField>

                  <FormField label="Ngày hết hạn">
                    <InlineInput
                      name="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {validationError && (
            <div role="alert" className="rounded border border-danger/30 bg-danger-bg/40 p-3 text-xs font-medium text-danger">
              {validationError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-td-rule">
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
        </ValidatedForm>
      </div>
    </div>
  );
}

export default function CreateStaffPage() {
  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
        <Suspense fallback={<div className="h-40 rounded bg-td-white animate-pulse" />}>
          <CreateStaffContent />
        </Suspense>
    </AuthGate>
  );
}
