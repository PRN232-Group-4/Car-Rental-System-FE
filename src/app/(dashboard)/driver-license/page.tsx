"use client";

import { ValidatedForm, useInlineValidation, InlineInput, InlineSelect } from "@/components/forms/inline-validation";

import React, { Suspense, useState } from "react";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  FileCheck,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { getCustomerLicense, saveCustomerLicense, CustomerLicense } from "@/features/licenses";
import { hasCustomerLicense } from "@/features/licenses/booking-license";
import BookingLicenseReturn from "@/features/licenses/components/BookingLicenseReturn";
import LicenseImageField from "@/features/licenses/components/LicenseImageField";

export default function GPLXPage() {
  const queryClient = useQueryClient();
  const { data: license, isPending, error } = useQuery<CustomerLicense | null>({
    queryKey: ["customer-license"],
    queryFn: getCustomerLicense,
  });

  const getStatusBadge = (status?: string) => {
    const key = status?.toLowerCase() ?? "";
    if (key === "approved") return <StatusBadge status="approved">Đã xác minh (Hợp lệ)</StatusBadge>;
    if (key === "rejected") return <StatusBadge status="rejected">Bị từ chối duyệt</StatusBadge>;
    if (key === "pending") return <StatusBadge status="pending">Đang chờ duyệt</StatusBadge>;
    return <StatusBadge status="unavailable">Chưa cập nhật</StatusBadge>;
  };

  return (
    <div className="space-y-8">
      <TransitFolio
        index="09"
        tag="KH"
        kicker="KHÁCH HÀNG · HỒ SƠ LÁI XE"
        title={<>Giấy phép <em className="italic text-td-teal">lái xe.</em></>}
        description="Hệ thống yêu cầu xác minh GPLX hợp lệ và còn hạn trước khi bạn có thể nhận xe thuê trực tiếp."
      >
        {getStatusBadge(hasCustomerLicense(license) ? license?.status : undefined)}
      </TransitFolio>

      <Suspense fallback={null}>
        <BookingLicenseReturn license={license} />
      </Suspense>

      {/* Current Status Card */}
      <div className="p-6 rounded bg-td-white border border-td-rule shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-primary-tint text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-td-muted font-semibold uppercase tracking-wider">
              Trạng thái hồ sơ lái xe
            </div>
            <div className="mt-1">{getStatusBadge(hasCustomerLicense(license) ? license?.status : undefined)}</div>
          </div>
        </div>

        {hasCustomerLicense(license) && license?.status === "approved" ? (
          <div className="text-xs text-primary bg-primary-tint px-3.5 py-2 rounded border border-primary/30 max-w-xs">
            Bạn đã đủ điều kiện thuê trực tiếp tất cả các dòng xe ô tô và xe máy trong hệ thống.
          </div>
        ) : (
          <div className="text-xs text-warning bg-primary-tint px-3.5 py-2 rounded border border-primary/30 max-w-xs">
            Vui lòng điền thông tin và tải ảnh chụp rõ nét để nhân viên kích hoạt quyền nhận xe.
          </div>
        )}
      </div>

      {/* Form rendered with key to synchronize initial state without effects */}
      {isPending ? <p role="status">Đang tải hồ sơ GPLX...</p> : error ? <p role="alert" className="text-danger">Không thể tải hồ sơ GPLX. Vui lòng kiểm tra kết nối và tải lại trang.</p> : <LicenseEditForm license={license} queryClient={queryClient} />}
    </div>
  );
}

function LicenseEditForm({
  license,
  queryClient,
}: {
  license?: CustomerLicense | null;
  queryClient: QueryClient;
}) {
  const validation = useInlineValidation();
  const [licenseNumber, setLicenseNumber] = useState(() => license?.number || "");
  const [licenseType, setLicenseType] = useState(() => license?.type || "B2");
  const [issueDate, setIssueDate] = useState(() => license?.issueDate || "");
  const [expiryDate, setExpiryDate] = useState(() => license?.expiryDate || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      setStatusMessage(null);
      if (!licenseNumber.trim()) throw new Error("Vui lòng nhập số giấy phép lái xe.");
      if (!expiryDate) throw new Error("Vui lòng chọn ngày hết hạn.");

      if (!selectedFile) throw new Error("Vui lòng chọn ảnh GPLX để gửi hồ sơ.");

      return saveCustomerLicense({
        number: licenseNumber.trim(),
        type: licenseType,
        issueDate,
        expiryDate,
        file: selectedFile,
      });
    },
    onSuccess: (savedLicense) => {
      queryClient.setQueryData(["customer-license"], savedLicense);
      setSelectedFile(null);
      setStatusMessage({
        text: "Hồ sơ GPLX đã được gửi lên hệ thống và đang trong quá trình xét duyệt.",
        type: "success",
      });
    },
    onError: (err: Error) => {
      const message = validation.report(err, { number: "licenseNumber", type: "licenseType", file: "file", imageurl: "file" });
      setStatusMessage(message ? { text: err instanceof TypeError ? "Không thể kết nối máy chủ. Hồ sơ chưa được lưu, vui lòng thử lại." : message, type: "error" } : null);
    },
  });

  return (
    <ValidatedForm validation={validation} validate={() => ({
      issueDate: issueDate && expiryDate && issueDate > expiryDate ? "Ngày cấp không được sau ngày hết hạn. Vui lòng kiểm tra lại." : undefined,
      expiryDate: expiryDate && new Date(`${expiryDate}T23:59:59`) < new Date() ? "Giấy phép lái xe đã hết hạn, không thể sử dụng để thuê xe." : undefined,
      file: !selectedFile ? "Vui lòng chọn ảnh GPLX từ thiết bị để gửi hồ sơ." : undefined,
    })}
      onSubmit={(e) => {
        e.preventDefault();
        if (!saveMutation.isPending) saveMutation.mutate();
      }}
      className="p-6 sm:p-8 rounded bg-td-white border border-td-rule shadow-sm space-y-6"
    >
      <h2 className="text-lg font-bold text-td-ink border-b border-td-rule pb-3">
        Thông tin chi tiết giấy phép
      </h2>

      {statusMessage && (
        <div
          role={statusMessage.type === "error" ? "alert" : "status"}
          className={`p-4 rounded text-sm font-semibold flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-primary-tint border border-primary/30 text-warning"
              : "bg-danger-bg border border-danger/30 text-danger"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <fieldset disabled={saveMutation.isPending} className="contents">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="license-number" className="block text-xs font-bold uppercase tracking-wider text-td-ink mb-2">
            Số GPLX / Mã số thẻ *
          </label>
          <InlineInput id="license-number" name="licenseNumber"
            type="text"
            required
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="VD: 790123456789"
            className="w-full px-4 py-3 rounded border border-td-rule focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm font-semibold"
          />
        </div>

        <div>
          <label htmlFor="license-type" className="block text-xs font-bold uppercase tracking-wider text-td-ink mb-2">
            Hạng giấy phép *
          </label>
          <InlineSelect id="license-type" name="licenseType" required
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value)}
            className="w-full px-4 py-3 rounded border border-td-rule focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm font-semibold bg-td-white"
          >
            <option value="B1">Hạng B1 (Số tự động)</option>
            <option value="B2">Hạng B2 (Ô tô đến 9 chỗ, số sàn/tự động)</option>
            <option value="C">Hạng C (Xe tải, chuyên dùng)</option>
            <option value="A1">Hạng A1 (Mô tô hai bánh dưới 175cc)</option>
            <option value="A2">Hạng A2 (Mô tô hai bánh từ 175cc trở lên)</option>
          </InlineSelect>
        </div>

        <div>
          <label htmlFor="license-issue-date" className="block text-xs font-bold uppercase tracking-wider text-td-ink mb-2">
            Ngày cấp *
          </label>
          <InlineInput id="license-issue-date" name="issueDate"
            type="date"
            required
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full px-4 py-3 rounded border border-td-rule focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm font-semibold"
          />
        </div>

        <div>
          <label htmlFor="license-expiry-date" className="block text-xs font-bold uppercase tracking-wider text-td-ink mb-2">
            Ngày hết hạn *
          </label>
          <InlineInput id="license-expiry-date" name="expiryDate"
            type="date"
            required
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-4 py-3 rounded border border-td-rule focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm font-semibold"
          />
        </div>
      </div>

      <LicenseImageField
        label="Ảnh chụp mặt trước giấy phép lái xe *"
        name="file"
        inputId="customer-license-image"
        validation={validation}
        value={selectedFile}
        onChange={setSelectedFile}
        existingUrl={license?.imageUrl ?? null}
        disabled={saveMutation.isPending}
        busy={saveMutation.isPending}
      />
      </fieldset>
      {/* Action Button */}
      <div className="pt-4 border-t border-td-rule flex items-center justify-end">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-6 py-3 rounded bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xử lý & lưu hồ sơ...</span>
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4" />
              <span>Cập nhật hồ sơ GPLX</span>
            </>
          )}
        </button>
      </div>
    </ValidatedForm>
  );
}
