/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Camera, Eye, ImageOff, Maximize2, Upload, X } from "lucide-react";
import { InlineError, InlineInput } from "@/components/forms/inline-validation";
import type { useInlineValidation } from "@/components/forms/inline-validation";

/**
 * Định dạng ảnh GPLX được chấp nhận. Khớp đúng whitelist của backend
 * `PATCH /api/customer/license` (JPEG, PNG, GIF, WebP) để ảnh không bị từ chối sau khi người dùng đã chờ upload.
 */
export const LICENSE_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
export const LICENSE_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp";
/** Giới hạn dung lượng dùng chung với backend và mọi biểu mẫu GPLX. */
export const LICENSE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const LICENSE_IMAGE_HELP_TEXT = "Định dạng JPG, PNG, GIF hoặc WEBP · Tối đa 5 MB.";

export type InlineValidation = ReturnType<typeof useInlineValidation>;

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Kiểm tra tệp ảnh GPLX trước khi gửi. Trả về thông báo lỗi tiếng Việt kèm cách sửa,
 * hoặc undefined khi tệp hợp lệ.
 */
export function validateLicenseImageFile(file: File): string | undefined {
  const type = (file.type || "").toLowerCase();
  if (!type || !(LICENSE_IMAGE_MIME_TYPES as readonly string[]).includes(type)) {
    return "Ảnh phải là tệp JPG, PNG, GIF hoặc WEBP. Vui lòng chọn lại ảnh chụp giấy phép.";
  }
  if (!file.size) {
    return "Tệp ảnh rỗng hoặc không đọc được. Vui lòng chọn ảnh khác.";
  }
  if (file.size > LICENSE_IMAGE_MAX_BYTES) {
    return `Ảnh ${formatFileSize(file.size)} vượt quá giới hạn 5 MB. Vui lòng chọn ảnh nhỏ hơn.`;
  }
  return undefined;
}

export interface LicenseImageFieldProps {
  /** Tên trường trong `useInlineValidation` của biểu mẫu cha. */
  name: string;
  /** id của input file, dùng để liên kết `aria-describedby` với thông báo lỗi. */
  inputId: string;
  /** Đối tượng validation của biểu mẫu cha. */
  validation: InlineValidation;
  /** Ảnh mới người dùng vừa chọn (chưa gửi lên máy chủ). */
  value: File | null;
  onChange: (file: File | null) => void;
  /** Ảnh GPLX đã lưu trên hồ sơ, hiển thị khi chưa chọn ảnh mới. */
  existingUrl?: string | null;
  /** Khóa toàn bộ thao tác (đang gửi hồ sơ). */
  disabled?: boolean;
  /** Hiển thị trạng thái đang tải ảnh lên/đang gửi hồ sơ. */
  busy?: boolean;
  label: string;
  helpText?: string;
  className?: string;
}

/**
 * Trường tải ảnh GPLX dùng chung cho `/driver-license` và `/profile`.
 *
 * - Xem trước ảnh ngay sau khi chọn tệp (object URL) hoặc ảnh đã có trên hồ sơ.
 * - Cho phép xóa/chọn lại ảnh trước khi gửi.
 * - Kiểm tra định dạng và dung lượng, báo lỗi tiếng Việt ngay dưới vùng tải.
 * - Phóng to ảnh trong hộp thoại có khóa tiêu điểm và đóng bằng Escape.
 * - Giải phóng object URL khi đổi ảnh hoặc unmount.
 */
export function LicenseImageField({
  name,
  inputId,
  validation,
  value,
  onChange,
  existingUrl,
  disabled = false,
  busy = false,
  label,
  helpText = LICENSE_IMAGE_HELP_TEXT,
  className = "",
}: LicenseImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const locked = disabled || busy;

  useEffect(() => {
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ với hệ thống object URL của trình duyệt; giá trị tệp đến từ props nên không thể tạo URL trong handler.
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const previewUrl = objectUrl ?? (existingUrl?.trim() ? existingUrl.trim() : null);
  const previewFailed = previewUrl !== null && failedUrl === previewUrl;
  const error = validation.errors[name];

  const selectFile = (file?: File | null) => {
    if (locked || !file) return;
    const message = validateLicenseImageFile(file);
    if (message) {
      onChange(null);
      validation.setField(name, message);
      return;
    }
    validation.clear(name);
    onChange(file);
  };

  const clearSelection = () => {
    if (locked) return;
    validation.clear(name);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const openPicker = () => {
    if (locked) return;
    inputRef.current?.click();
  };

  return (
    <div className={className}>
      <p className="mb-2 block text-xs font-bold uppercase tracking-wider text-td-ink">{label}</p>

      <InlineInput
        showError={false}
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={LICENSE_IMAGE_ACCEPT}
        aria-label={`${label} — chọn tệp ảnh từ thiết bị`}
        disabled={locked}
        onChange={(event) => {
          selectFile(event.currentTarget.files?.[0]);
          event.currentTarget.value = "";
        }}
        className="sr-only"
      />

      {previewUrl ? (
        <div
          data-validation-field={name}
          tabIndex={-1}
          className={`flex flex-col gap-5 rounded border-2 border-dashed bg-td-white p-4 sm:flex-row sm:items-center sm:p-5 ${
            error ? "border-danger" : "border-td-rule"
          }`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Xem ảnh giấy phép lái xe cỡ lớn"
            className="group relative h-32 w-full shrink-0 overflow-hidden rounded border border-td-rule bg-td-chalk sm:w-48"
          >
            {previewFailed ? (
              <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-td-muted">
                <ImageOff className="h-6 w-6" aria-hidden="true" />
                <span className="text-xs font-semibold">Không tải được ảnh xem trước</span>
              </span>
            ) : (
              <img
                src={previewUrl}
                alt="Ảnh giấy phép lái xe"
                onError={() => setFailedUrl(previewUrl)}
                className="h-full w-full object-cover"
              />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-stage-ink/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Maximize2 className="h-5 w-5" aria-hidden="true" />
              <span className="ml-2 text-xs font-bold">Phóng to</span>
            </span>
          </button>

          <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
            <p className="text-sm font-bold text-td-ink">
              {value ? "Ảnh mới đã chọn" : "Ảnh đang lưu trên hồ sơ"}
            </p>
            <p className="break-all text-xs text-td-muted">
              {value ? `${value.name} · ${formatFileSize(value.size)}` : helpText}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <button
                type="button"
                onClick={openPicker}
                disabled={locked}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded border border-td-rule bg-td-white px-3 py-2 text-xs font-bold text-td-ink transition-colors hover:border-td-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{value ? "Chọn ảnh khác" : "Chọn ảnh mới"}</span>
              </button>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded border border-td-rule px-3 py-2 text-xs font-bold text-td-ink transition-colors hover:border-td-ink"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Xem chi tiết</span>
              </button>
              {value && (
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={locked}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded border border-danger/40 px-3 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Bỏ ảnh đã chọn</span>
                </button>
              )}
            </div>
            {value && (
              <p className="text-xs text-td-muted">
                Ảnh chỉ được gửi khi bạn bấm lưu hồ sơ. Bỏ ảnh đã chọn sẽ giữ nguyên ảnh cũ trên hệ thống.
              </p>
            )}
            {busy && (
              <p role="status" aria-live="polite" className="text-xs font-semibold text-td-muted">
                Đang tải ảnh lên máy chủ...
              </p>
            )}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={locked ? -1 : 0}
          aria-disabled={locked}
          data-validation-field={name}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (locked) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!locked) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            selectFile(event.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed p-6 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-td-oxide sm:p-8 ${
            error ? "border-danger" : dragging ? "border-td-oxide bg-td-oxide/5" : "border-td-rule bg-td-chalk/50 hover:border-td-oxide/50"
          } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded bg-td-white text-td-oxide">
            {busy ? <Upload className="h-6 w-6 animate-pulse" aria-hidden="true" /> : <Camera className="h-6 w-6" aria-hidden="true" />}
          </span>
          <span className="text-sm font-bold text-td-ink">
            {busy ? "Đang tải ảnh lên..." : "Nhấn để chọn ảnh hoặc kéo thả tệp vào đây"}
          </span>
          <span className="text-xs text-td-muted">{helpText} Ảnh rõ nét, không lóa sáng hoặc che khuất thông tin.</span>
        </div>
      )}

      <InlineError name={name} inputId={inputId} />

      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-stage-ink/90" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 focus:outline-none sm:p-8">
            <Dialog.Title className="sr-only">Ảnh giấy phép lái xe cỡ lớn</Dialog.Title>
            <Dialog.Description className="sr-only">
              Nhấn Escape hoặc nút đóng để quay lại biểu mẫu.
            </Dialog.Description>
            <div className="max-h-[85dvh] w-full max-w-5xl overflow-auto rounded border border-td-rule bg-td-white p-2">
              {previewUrl && !previewFailed ? (
                <img
                  src={previewUrl}
                  alt="Ảnh giấy phép lái xe phóng to"
                  className="mx-auto max-h-[80dvh] w-auto object-contain"
                />
              ) : (
                <p className="p-6 text-center text-sm text-td-ink">Không tải được ảnh xem trước.</p>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Đóng xem ảnh"
                className="absolute right-4 top-4 inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full bg-stage-ink/80 p-2.5 text-white transition-colors hover:bg-danger"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default LicenseImageField;
