"use client";

import { InlineError, ValidatedForm, useInlineValidation, InlineInput, InlineSelect } from "@/components/forms/inline-validation";

import React, { useState } from "react";
import Image from "next/image";
import {
  FileCheck,
  ShieldCheck,
  AlertCircle,
  Clock,
  Upload,
  CheckCircle2,
  XCircle,
  Camera,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { getCustomerLicense, saveCustomerLicense, uploadLicensePhoto, CustomerLicense } from "@/features/licenses";

export default function GPLXPage() {
  const queryClient = useQueryClient();
  const { data: license } = useQuery<CustomerLicense | null>({
    queryKey: ["customer-license"],
    queryFn: getCustomerLicense,
  });

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-tint text-warning">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            Đã xác minh (Hợp lệ)
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-danger-bg text-danger">
            <XCircle className="w-3.5 h-3.5 text-danger" />
            Bị từ chối duyệt
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-tint text-warning">
            <Clock className="w-3.5 h-3.5 text-primary-graphic" />
            Đang chờ duyệt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sunken text-ink-3">
            Chưa cập nhật
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-tint border border-primary/30 text-warning text-xs font-bold mb-2">
          <FileCheck className="w-3.5 h-3.5 text-primary" />
          <span>Hồ sơ lái xe & Định danh điện tử</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Giấy phép lái xe (GPLX)
        </h1>
        <p className="text-sm text-ink-3 mt-1">
          Hệ thống yêu cầu xác minh GPLX hợp lệ và còn hạn trước khi bạn có thể nhận xe thuê trực tiếp.
        </p>
      </div>

      {/* Current Status Card */}
      <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-ink-3 font-semibold uppercase tracking-wider">
              Trạng thái hồ sơ lái xe
            </div>
            <div className="mt-1">{getStatusBadge(license?.status)}</div>
          </div>
        </div>

        {license?.status === "approved" ? (
          <div className="text-xs text-primary bg-primary-tint px-3.5 py-2 rounded-xl border border-primary/30 max-w-xs">
            Bạn đã đủ điều kiện thuê trực tiếp tất cả các dòng xe ô tô và xe máy trong hệ thống.
          </div>
        ) : (
          <div className="text-xs text-warning bg-primary-tint px-3.5 py-2 rounded-xl border border-primary/30 max-w-xs">
            Vui lòng điền thông tin và tải ảnh chụp rõ nét để nhân viên kích hoạt quyền nhận xe.
          </div>
        )}
      </div>

      {/* Form rendered with key to synchronize initial state without effects */}
      <LicenseEditForm key={license?.number || "none"} license={license} queryClient={queryClient} />
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
  const [imagePreview, setImagePreview] = useState<string | null>(() => license?.imageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      validation.setField("imageUrl", "Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, JPEG).");
      return;
    }

    validation.clear("imageUrl");
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      setStatusMessage(null);
      if (!licenseNumber.trim()) throw new Error("Vui lòng nhập số giấy phép lái xe.");
      if (!issueDate) throw new Error("Vui lòng chọn ngày cấp.");
      if (!expiryDate) throw new Error("Vui lòng chọn ngày hết hạn.");

      const exp = new Date(expiryDate);
      if (exp < new Date()) throw new Error("Giấy phép lái xe đã hết hạn, không thể sử dụng để thuê xe.");

      let uploadedUrl = imagePreview || "";
      if (selectedFile) {
        uploadedUrl = await uploadLicensePhoto(selectedFile);
      }

      return saveCustomerLicense({
        number: licenseNumber.trim(),
        type: licenseType,
        issueDate,
        expiryDate,
        imageUrl: uploadedUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-license"] });
      setStatusMessage({
        text: "Hồ sơ GPLX đã được gửi lên hệ thống và đang trong quá trình xét duyệt.",
        type: "success",
      });
    },
    onError: (err: Error) => {
      const message = validation.report(err, { number: "licenseNumber", type: "licenseType" });
      setStatusMessage(message ? { text: message, type: "error" } : null);
    },
  });

  return (
    <ValidatedForm validation={validation} validate={() => expiryDate && new Date(expiryDate) < new Date() ? { expiryDate: "Giấy phép lái xe đã hết hạn, không thể sử dụng để thuê xe." } : {}}
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate();
      }}
      className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6"
    >
      <h2 className="text-lg font-bold text-ink border-b border-line pb-3">
        Thông tin chi tiết giấy phép
      </h2>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-2.5 ${
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-2 mb-2">
            Số GPLX / Mã số thẻ *
          </label>
          <InlineInput name="licenseNumber"
            type="text"
            required
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="VD: 790123456789"
            className="w-full px-4 py-3 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-2 mb-2">
            Hạng giấy phép *
          </label>
          <InlineSelect name="licenseType"
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm font-semibold bg-surface"
          >
            <option value="B1">Hạng B1 (Số tự động)</option>
            <option value="B2">Hạng B2 (Ô tô đến 9 chỗ, số sàn/tự động)</option>
            <option value="C">Hạng C (Xe tải, chuyên dùng)</option>
            <option value="A1">Hạng A1 (Mô tô hai bánh dưới 175cc)</option>
            <option value="A2">Hạng A2 (Mô tô hai bánh từ 175cc trở lên)</option>
          </InlineSelect>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-2 mb-2">
            Ngày cấp *
          </label>
          <InlineInput name="issueDate"
            type="date"
            required
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-2 mb-2">
            Ngày hết hạn *
          </label>
          <InlineInput name="expiryDate"
            type="date"
            required
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm font-semibold"
          />
        </div>
      </div>

      {/* License Photo Upload & Preview */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-2 mb-2">
          Ảnh chụp mặt trước giấy phép lái xe
        </label>
        <div className="mt-2 flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border-2 border-dashed border-line bg-sunken/50 hover:bg-sunken transition-colors">
          {imagePreview ? (
            <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-line bg-surface shrink-0 shadow-xs">
              <Image
                src={imagePreview}
                alt="Ảnh GPLX"
                fill
                sizes="192px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-48 h-32 rounded-xl bg-sunken flex flex-col items-center justify-center text-ink-3 shrink-0 border border-line">
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-xs font-semibold">Chưa có ảnh</span>
            </div>
          )}

          <div className="space-y-2 flex-1 text-center sm:text-left">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-line-strong hover:border-line-strong text-ink-2 text-xs font-bold cursor-pointer shadow-xs transition-all">
              <Upload className="w-3.5 h-3.5 text-ink-3" />
              <span>Chọn ảnh từ thiết bị</span>
              <InlineInput showError={false} name="imageUrl" id="customer-license-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-ink-3">
              Định dạng JPG, PNG. Ảnh chụp rõ mặt trước, không bị loá sáng hay che khuất thông tin.
            </p>
          </div>
        </div>
      </div>

      <InlineError name="imageUrl" inputId="customer-license-image" />
      {/* Action Button */}
      <div className="pt-4 border-t border-line flex items-center justify-end">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
