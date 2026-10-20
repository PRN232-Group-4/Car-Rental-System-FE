"use client";
import { formatAdminDate } from "@/lib/date-time";

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
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

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
      <section aria-label="Tiến trình xác minh hồ sơ">
        <div className="flex flex-col justify-between gap-3 border-b border-td-ink pb-2 sm:flex-row sm:items-end">
          <div>
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-td-muted">
              Tiến trình xác minh hồ sơ tài xế
            </h3>
            <p className="mt-1 text-sm text-td-ink">
              Kiểm duyệt và xác thực giấy phép lái xe trong hệ thống.
            </p>
          </div>
          <AdminStatusBadge domain="license" status={staff.licenseStatus?.trim() || (licenseComplete ? "pending" : "incomplete")}>
            {isApproved
              ? "ĐÃ XÁC MINH"
              : staff.licenseStatus?.trim()
                ? staff.licenseStatus.toLocaleUpperCase().replaceAll("_", " ")
                : licenseComplete
                  ? "CHỜ XÁC MINH"
                  : "CHƯA HOÀN TẤT"}
          </AdminStatusBadge>
        </div>
        <div className="mt-4 grid grid-cols-1 divide-y divide-td-rule border-b border-td-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
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
        <section aria-label="Thông tin giấy phép lái xe" className="rounded border border-td-rule bg-td-white p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-td-rule pb-3">
            <div>
              <h3 className="text-sm font-bold text-td-ink">Giấy phép lái xe</h3>
              <p className="mt-1 font-mono text-[11px] text-td-muted">
                Hồ sơ giấy phép được lưu trong hệ thống nhân sự.
              </p>
            </div>
            <BadgeCheck className="h-5 w-5 shrink-0 text-td-oxide" aria-hidden="true" />
          </div>

          <dl className="divide-y divide-td-rule font-mono text-xs">
            {[
              { term: "Số giấy phép lái xe", detail: staff.licenseNumber || "Chưa cập nhật" },
              { term: "Hạng giấy phép", detail: staff.licenseType || "Chưa cập nhật" },
              { term: "Ngày cấp", detail: formatAdminDate(staff.licenseIssueDate) },
              { term: "Ngày hết hạn", detail: formatAdminDate(staff.licenseExpiryDate) },
            ].map((row) => (
              <div key={row.term} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-td-muted">{row.term}</dt>
                <dd className="text-right font-semibold text-td-ink">{row.detail}</dd>
              </div>
            ))}
          </dl>

          {staff.licenseImageUrl && (
            <p className="mt-4 flex items-center gap-2 border-t border-td-rule pt-3 font-mono text-[11px] text-td-muted">
              <FileCheck className="h-4 w-4 shrink-0 text-td-oxide" aria-hidden="true" />
              <span className="truncate">Ảnh giấy phép lái xe đã được lưu trên hệ thống</span>
            </p>
          )}

          <p className="mt-4 flex items-start gap-2 border-l-2 border-td-oxide pl-3 text-xs leading-relaxed text-td-muted">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-td-oxide" aria-hidden="true" />
            Thông tin giấy phép do quản trị viên cập nhật và xác thực theo hồ sơ nhân sự. Cần thay đổi, vui lòng liên hệ ban quản trị.
          </p>
        </section>
      ) : isApproved && !editingApprovedLicense ? (
        <section
          aria-label="Giấy phép đã xác minh"
          className="flex flex-col justify-between gap-4 border-l-2 border-td-oxide bg-td-white px-5 py-4 sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-td-oxide" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-bold text-td-ink">Giấy phép đã được xác minh</h3>
              <p className="mt-1 text-xs leading-relaxed text-td-muted">
                Thông tin tải lên đã được phê duyệt. Nếu bạn đã gia hạn giấy phép, hãy gửi thông tin mới để cập nhật hồ sơ.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingApprovedLicense(true)}
            aria-expanded={editingApprovedLicense}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded border border-td-rule px-3 py-2 text-xs font-bold text-td-ink transition-colors hover:bg-td-chalk"
          >
            <FileCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Cập nhật giấy phép đã gia hạn
          </button>
        </section>
      ) : (
      <section className="rounded border border-td-rule bg-td-white p-5 sm:p-7">
        <div className="border-b border-td-rule pb-3">
          <h3 className="text-sm font-bold text-td-ink">Tải lên giấy phép lái xe</h3>
          <p className="mt-1 font-mono text-[11px] text-td-muted">
            Giấy phép hợp lệ sẽ được quản trị viên xác minh.
          </p>
        </div>

        <ValidatedForm validation={validation} validate={() => !file && !staff.licenseImageUrl ? { imageUrl: "Vui lòng tải lên ảnh giấy phép lái xe." } : {}} key={`driver-license-${staff.id}`} onSubmit={submit} className="space-y-5">
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">
              Số giấy phép lái xe
              <InlineInput
                name="licenseNumber"
                required
                defaultValue={staff.licenseNumber ?? ""}
                className="admin-input mt-2"
              />
            </label>
            <label className="font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">
              Hạng giấy phép
              <InlineInput
                name="licenseType"
                required
                placeholder="A1, B1, B2..."
                defaultValue={staff.licenseType ?? ""}
                className="admin-input mt-2"
              />
            </label>
            <label className="font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">
              Ngày cấp
              <InlineInput
                name="licenseIssueDate"
                type="date"
                defaultValue={staff.licenseIssueDate?.slice(0, 10) ?? ""}
                className="admin-input mt-2"
              />
            </label>
            <label className="font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">
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
            className="flex min-h-36 w-full flex-col items-center justify-center rounded border border-dashed border-td-rule bg-td-paper px-5 py-6 text-center transition-colors hover:border-td-oxide"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded border border-td-rule bg-td-white text-td-oxide">
              <Upload className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold text-td-ink">
              {file ? "Chọn ảnh khác" : "Nhấn để tải ảnh giấy phép"}
            </span>
            <span className="mt-1 font-mono text-[11px] text-td-muted">
              JPG, PNG hoặc WEBP · tối đa 10 MB
            </span>
          </button>

          <InlineError name="imageUrl" inputId="staff-license-image" />
          {(file || staff.licenseImageUrl) && (
            <div className="flex items-center gap-3 border-t border-td-rule pt-3">
              <FileCheck className="h-4 w-4 shrink-0 text-td-oxide" aria-hidden="true" />
              <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-td-ink">
                {file?.name ?? "Ảnh giấy phép đã tải lên"}
              </p>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label="Bỏ ảnh đã chọn"
                  className="rounded p-2 text-td-muted hover:bg-td-white"
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
            <p role="status" className="text-sm font-medium text-td-oxide">
              Đã lưu giấy phép. Hồ sơ đang chờ quản trị viên xác minh.
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-td-oxide px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-td-oxide-hover disabled:opacity-60"
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
    <div className="px-0 py-3.5 sm:px-4 sm:first:pl-0 sm:last:pr-0">
      <span
        className={`flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider ${
          complete ? "text-td-ink" : "text-td-muted"
        }`}
      >
        {complete ? (
          <Check className="h-3.5 w-3.5 text-td-oxide" aria-hidden="true" />
        ) : (
          <span className="inline-block h-1.5 w-1.5 rounded-full border border-td-muted" aria-hidden="true" />
        )}
        {number} · {title}
      </span>
      <span className="mt-1 block text-xs text-td-muted">{description}</span>
    </div>
  );
}
