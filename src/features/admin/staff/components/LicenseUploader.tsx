/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from "react";
import { Upload, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { uploadLicenseImageMock } from "../api";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

export interface LicenseUploaderProps {
  currentUrl?: string;
  onUploadSuccess: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function LicenseUploader({
  currentUrl,
  onUploadSuccess,
  onRemove,
  disabled = false,
}: LicenseUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);

    // Kiểm tra định dạng MIME
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrorMessage("Định dạng không hợp lệ. Chỉ chấp nhận tệp JPG, PNG hoặc WebP.");
      return;
    }

    // Kiểm tra kích thước <= 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage("Tệp vượt quá kích thước 5 MB cho phép.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadLicenseImageMock(file);
      onUploadSuccess(res.url);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Tải ảnh thất bại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {currentUrl ? (
        <div className="relative overflow-hidden rounded border border-td-rule bg-td-paper p-3">
          <div className="flex items-center gap-4">
            <div
              onClick={() => setPreviewOpen(true)}
              className="relative h-20 w-32 shrink-0 overflow-hidden rounded border border-td-rule bg-td-white cursor-pointer group"
            >
              {/* Ảnh GPLX preview */}
              <img
                src={currentUrl}
                alt="Ảnh GPLX"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-scrim/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Đã tải lên ảnh mặt trước GPLX</span>
              </div>
              <p className="text-xs text-td-muted">
                Hình ảnh lưu trữ bảo mật, được xác thực để kiểm tra trước khi bàn giao xe.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-td-oxide hover:underline cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem chi tiết</span>
                </button>
                <span className="text-line">•</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-td-ink hover:text-td-ink cursor-pointer"
                  >
                    Thay ảnh khác
                  </button>
                )}
                <span className="text-line">•</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => setRemoveConfirmOpen(true)}
                    className="text-xs font-bold text-danger hover:underline cursor-pointer"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-td-oxide bg-td-oxide/5"
              : "border-td-rule bg-td-white hover:border-td-oxide/50 hover:bg-td-paper"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded bg-td-chalk text-td-muted mb-3">
            {isUploading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-td-oxide border-t-transparent" />
            ) : (
              <Upload className="w-6 h-6 text-td-oxide" />
            )}
          </div>
          <p className="text-sm font-bold text-td-ink">
            {isUploading ? "Đang xử lý tải ảnh lên..." : "Kéo thả ảnh hoặc nhấn để chọn tệp"}
          </p>
          <p className="mt-1 text-xs text-td-muted">
            Chấp nhận JPG, PNG, WebP (Tối đa 5 MB, cạnh dài tối thiểu 800px)
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded border border-danger/30 bg-danger-bg/40 p-3 text-xs font-medium text-danger">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Lightbox xem trước */}
      <Modal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title="Ảnh Giấy Phép Lái Xe"
        description="Bản chụp gốc giấy phép lái xe phục vụ kiểm tra hồ sơ pháp lý."
      >
        <div className="overflow-hidden rounded border border-td-rule bg-td-paper p-2">
          {currentUrl && (
            <img
              src={currentUrl}
              alt="Bản xem trước GPLX"
              className="max-h-[70vh] w-full rounded object-contain"
            />
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
            Đóng
          </Button>
        </div>
      </Modal>

      {/* Xác nhận xóa ảnh */}
      <ConfirmDialog
        open={removeConfirmOpen}
        onOpenChange={setRemoveConfirmOpen}
        title="Xác nhận gỡ ảnh GPLX"
        description="Bạn có chắc chắn muốn xóa bản ảnh chụp giấy phép lái xe hiện tại? Tài xế có thể bị tạm ngưng đủ điều kiện gán chuyến."
        confirmLabel="Xóa ảnh"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={() => {
          onRemove();
          setRemoveConfirmOpen(false);
        }}
      />
    </div>
  );
}
