"use client";

import React, { useState } from "react";
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã xác minh (Hợp lệ)
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Bị từ chối duyệt
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Đang chờ duyệt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
            Chưa cập nhật
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hồ sơ lái xe & Định danh điện tử</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Giấy phép lái xe (GPLX)
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Hệ thống yêu cầu xác minh GPLX hợp lệ và còn hạn trước khi bạn có thể nhận xe thuê trực tiếp.
        </p>
      </div>

      {/* Current Status Card */}
      <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
              Trạng thái hồ sơ lái xe
            </div>
            <div className="mt-1">{getStatusBadge(license?.status)}</div>
          </div>
        </div>

        {license?.status === "approved" ? (
          <div className="text-xs text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 max-w-xs">
            Bạn đã đủ điều kiện thuê trực tiếp tất cả các dòng xe ô tô và xe máy trong hệ thống.
          </div>
        ) : (
          <div className="text-xs text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 max-w-xs">
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
      setStatusMessage({ text: "Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, JPEG).", type: "error" });
      return;
    }

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
      setStatusMessage({ text: err.message || "Có lỗi xảy ra khi lưu thông tin GPLX.", type: "error" });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate();
      }}
      className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-6"
    >
      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
        Thông tin chi tiết giấy phép
      </h2>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Số GPLX / Mã số thẻ *
          </label>
          <input
            type="text"
            required
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="VD: 790123456789"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Hạng giấy phép *
          </label>
          <select
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold bg-white"
          >
            <option value="B1">Hạng B1 (Số tự động)</option>
            <option value="B2">Hạng B2 (Ô tô đến 9 chỗ, số sàn/tự động)</option>
            <option value="C">Hạng C (Xe tải, chuyên dùng)</option>
            <option value="A1">Hạng A1 (Mô tô hai bánh dưới 175cc)</option>
            <option value="A2">Hạng A2 (Mô tô hai bánh từ 175cc trở lên)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Ngày cấp *
          </label>
          <input
            type="date"
            required
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Ngày hết hạn *
          </label>
          <input
            type="date"
            required
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
          />
        </div>
      </div>

      {/* License Photo Upload & Preview */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
          Ảnh chụp mặt trước giấy phép lái xe
        </label>
        <div className="mt-2 flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
          {imagePreview ? (
            <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-neutral-200 bg-white shrink-0 shadow-xs">
              <img
                src={imagePreview}
                alt="Ảnh GPLX"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-48 h-32 rounded-xl bg-neutral-100 flex flex-col items-center justify-center text-neutral-400 shrink-0 border border-neutral-200">
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-xs font-semibold">Chưa có ảnh</span>
            </div>
          )}

          <div className="space-y-2 flex-1 text-center sm:text-left">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-700 text-xs font-bold cursor-pointer shadow-xs transition-all">
              <Upload className="w-3.5 h-3.5 text-neutral-500" />
              <span>Chọn ảnh từ thiết bị</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-neutral-500">
              Định dạng JPG, PNG. Ảnh chụp rõ mặt trước, không bị loá sáng hay che khuất thông tin.
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-neutral-100 flex items-center justify-end">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
    </form>
  );
}
