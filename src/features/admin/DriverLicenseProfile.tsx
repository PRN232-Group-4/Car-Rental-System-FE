"use client";

import { InlineError, ValidatedForm, useInlineValidation, InlineInput } from "@/components/forms/inline-validation";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Check,
  FileCheck,
  Save,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { uploadLicenseImage } from "@/features/profile/api";
import { updateStaff } from "./api";
import type { StaffDto } from "./api";
import { useAuth } from "@/features/auth";

export default function DriverLicenseProfile({
  staff,
  onUpdated,
}: {
  staff: StaffDto;
  onUpdated: (staff: StaffDto) => void;
}) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const validation = useInlineValidation();
  const [error, setError] = useState("");
  const [editingApprovedLicense, setEditingApprovedLicense] = useState(false);
  const licenseComplete = Boolean(
    staff.licenseNumber &&
      staff.licenseType &&
      staff.licenseExpiryDate &&
      staff.licenseImageUrl,
  );
  const isApproved = staff.licenseStatus?.trim().toLocaleLowerCase() === "approved";
  const personalComplete = Boolean(staff.fullName && staff.phone);

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";
    setError("");
    setSaved(false);
    if (!selectedFile) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
      setFile(null);
      validation.setField("imageUrl", "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      validation.setField("imageUrl", "Tệp vượt quá 10 MB. Vui lòng chọn tệp nhỏ hơn.");
      return;
    }
    validation.clear("imageUrl");
    setFile(selectedFile);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const licenseNumber = String(form.get("licenseNumber") ?? "").trim();
    const licenseType = String(form.get("licenseType") ?? "").trim();
    const licenseIssueDate = String(form.get("licenseIssueDate") ?? "") || null;
    const licenseExpiryDate = String(form.get("licenseExpiryDate") ?? "") || null;

    if (!licenseNumber || !licenseType || !licenseExpiryDate) {
      setError("Vui lòng điền số giấy phép, hạng giấy phép và ngày hết hạn.");
      return;
    }
    if (!file && !staff.licenseImageUrl) {
      setError("Vui lòng tải lên ảnh giấy phép lái xe.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const licenseImageUrl = file
        ? extractImageUrl(await uploadLicenseImage(file))
        : staff.licenseImageUrl;
      if (!licenseImageUrl) {
        throw new Error("Tải ảnh thành công nhưng API không trả về URL ảnh.");
      }

      const updated = await updateStaff(staff.id, {
        fullName: staff.fullName ?? "",
        phone: staff.phone ?? "",
        departmentId: staff.departmentId,
        facilityId: staff.facilityId,
        hiredDate: staff.hiredDate,
        isDriver: staff.isDriver,
        licenseNumber,
        licenseType,
        licenseIssueDate,
        licenseExpiryDate,
        licenseImageUrl,
        staffRole: staff.staffRole ?? "",
      });
      onUpdated(updated);
      setFile(null);
      setSaved(true);
    } catch (submitError) {
      setError(validation.report(submitError, { licenseimageurl: "imageUrl" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section
        aria-label="Tiến trình xác minh hồ sơ"
        className="rounded-2xl border border-line bg-surface p-5 shadow-elevation-1 sm:p-7"
      >
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-bold text-ink">Trạng thái hồ sơ tài xế</h3>
            <p className="mt-1 text-sm text-ink-muted">
              Tiến trình kiểm duyệt và xác thực giấy phép lái xe trong hệ thống.
            </p>
          </div>
          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
              isApproved
                ? "bg-primary/10 text-primary"
                : licenseComplete
                  ? "bg-amber-50 text-amber-800"
                  : "bg-sunken text-ink-muted"
            }`}
          >
            {isApproved
              ? "ĐÃ XÁC MINH"
              : staff.licenseStatus?.trim()
                ? staff.licenseStatus.toLocaleUpperCase().replaceAll("_", " ")
                : licenseComplete
                  ? "CHỜ XÁC MINH"
                  : "CHƯA HOÀN TẤT"}
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <ProgressStep
            number="01"
            title="Thông tin cá nhân"
            description={
              personalComplete
                ? "Đã có thông tin cơ bản"
                : "Cập nhật thông tin cơ bản"
            }
            complete={personalComplete}
          />
          <ProgressStep
            number="02"
            title="Giấy phép lái xe"
            description={
              licenseComplete
                ? "Đã tải thông tin giấy phép"
                : "Tải lên ảnh giấy phép"
            }
            complete={licenseComplete}
          />
          <ProgressStep
            number="03"
            title="Phê duyệt"
            description={isApproved ? "Đã xác minh" : "Chờ quản trị viên xác minh"}
            complete={isApproved}
          />
        </div>
      </section>

      {!isAdmin ? (
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-elevation-1 sm:p-7 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">
                Thông tin giấy phép lái xe
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                Hồ sơ giấy phép lái xe được lưu trong hệ thống nhân sự.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-canvas p-4">
              <span className="text-xs text-ink-muted">Số giấy phép lái xe</span>
              <p className="text-sm font-semibold text-ink mt-1">{staff.licenseNumber || "Chưa cập nhật"}</p>
            </div>
            <div className="rounded-xl border border-line bg-canvas p-4">
              <span className="text-xs text-ink-muted">Hạng giấy phép</span>
              <p className="text-sm font-semibold text-ink mt-1">{staff.licenseType || "Chưa cập nhật"}</p>
            </div>
            <div className="rounded-xl border border-line bg-canvas p-4">
              <span className="text-xs text-ink-muted">Ngày cấp</span>
              <p className="text-sm font-semibold text-ink mt-1">{staff.licenseIssueDate?.slice(0, 10) || "—"}</p>
            </div>
            <div className="rounded-xl border border-line bg-canvas p-4">
              <span className="text-xs text-ink-muted">Ngày hết hạn</span>
              <p className="text-sm font-semibold text-ink mt-1">{staff.licenseExpiryDate?.slice(0, 10) || "—"}</p>
            </div>
          </div>

          {staff.licenseImageUrl && (
            <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas p-3">
              <FileCheck className="h-5 w-5 shrink-0 text-primary" />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                Ảnh giấy phép lái xe đã được lưu trên hệ thống
              </p>
            </div>
          )}

          <p className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-5 text-primary">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
            Thông tin giấy phép lái xe do Quản trị viên cập nhật và xác thực theo hồ sơ nhân sự. Nếu cần thay đổi thông tin, vui lòng liên hệ ban quản trị.
          </p>
        </section>
      ) : isApproved && !editingApprovedLicense ? (
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-elevation-1 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BadgeCheck className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-bold text-ink">Giấy phép đã được xác minh</h3>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                Thông tin tải lên đã được phê duyệt. Nếu bạn đã gia hạn giấy phép, bạn có thể gửi thông tin mới để cập nhật hồ sơ.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingApprovedLicense(true)}
            aria-expanded={editingApprovedLicense}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-surface px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            <FileCheck className="h-4 w-4" />
            Cập nhật giấy phép đã gia hạn
          </button>
        </section>
      ) : (
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-elevation-1 sm:p-7">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BadgeCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-ink">
              Giấy phép lái xe
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Tải lên giấy phép hợp lệ để quản trị viên xác minh.
            </p>
          </div>
        </div>

        <ValidatedForm validation={validation} validate={() => !file && !staff.licenseImageUrl ? { imageUrl: "Vui lòng tải lên ảnh giấy phép lái xe." } : {}} key={`driver-license-${staff.id}`} onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-ink">
              Số giấy phép lái xe
              <InlineInput
                name="licenseNumber"
                required
                defaultValue={staff.licenseNumber ?? ""}
                className="admin-input mt-2"
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Hạng giấy phép
              <InlineInput
                name="licenseType"
                required
                placeholder="A1, B1, B2..."
                defaultValue={staff.licenseType ?? ""}
                className="admin-input mt-2"
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Ngày cấp
              <InlineInput
                name="licenseIssueDate"
                type="date"
                defaultValue={staff.licenseIssueDate?.slice(0, 10) ?? ""}
                className="admin-input mt-2"
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Ngày hết hạn
              <InlineInput
                name="licenseExpiryDate"
                type="date"
                required
                defaultValue={staff.licenseExpiryDate?.slice(0, 10) ?? ""}
                className="admin-input mt-2"
              />
            </label>
          </div>

          <InlineInput showError={false} name="imageUrl" id="staff-license-image"
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={selectFile}
            className="sr-only"
            aria-label="Chọn ảnh giấy phép lái xe"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-canvas px-5 py-6 text-center transition hover:border-primary hover:bg-primary/5"
          >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-primary shadow-sm">
              <Upload className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold text-ink">
              {file ? "Chọn ảnh khác" : "Nhấn để tải ảnh giấy phép"}
            </span>
            <span className="mt-2 text-xs text-ink-muted">
              JPG, PNG hoặc WEBP · Tối đa 10 MB
            </span>
          </button>

          <InlineError name="imageUrl" inputId="staff-license-image" />
          {(file || staff.licenseImageUrl) && (
            <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas p-3">
              <FileCheck className="h-5 w-5 shrink-0 text-primary" />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                {file?.name ?? "Ảnh giấy phép đã tải lên"}
              </p>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label="Bỏ ảnh đã chọn"
                  className="rounded-lg p-2 text-ink-muted hover:bg-surface"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="flex items-start gap-2 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm font-medium text-primary">
              Đã lưu giấy phép. Hồ sơ đang chờ quản trị viên xác minh.
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-elevation-1 transition hover:bg-primary-hover disabled:opacity-60"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Đang lưu..." : "Lưu giấy phép"}
          </button>
        </ValidatedForm>
      </section>
      )}
    </div>
  );
}

function extractImageUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value !== "object" || value === null) return "";
  for (const key of ["url", "imageUrl", "fileUrl", "mainImageUrl"]) {
    const url = (value as Record<string, unknown>)[key];
    if (typeof url === "string") return url;
  }
  return "";
}

function ProgressStep({
  number,
  title,
  description,
  complete,
}: {
  number: string;
  title: string;
  description: string;
  complete: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 ${
        complete
          ? "border-primary/20 bg-primary/5"
          : "border-line bg-surface"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
          complete
            ? "bg-primary text-white"
            : "bg-sunken text-ink-muted"
        }`}
      >
        {complete ? <Check className="h-5 w-5" /> : number}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-muted">
          {description}
        </span>
      </span>
    </div>
  );
}
