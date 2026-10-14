"use client";

import { InlineError, ValidatedForm, useInlineValidation, InlineInput, InlineSelect } from "@/components/forms/inline-validation";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from "react";
import Link from "@/components/navigation/NavigationLink";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import {
  AlertCircle,
  BadgeCheck,
  Check,
  Clock3,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import {
  getAccountProfile,
  getCustomerLicense,
  updateAccountProfile,
  updateCustomerLicense,
  uploadLicenseImage,
} from "../api";
import { ApiClientError } from "@/api/api-client";
import { useAuth } from "@/features/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ProfileDetails = {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
};

export default function ProfileManager() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [details, setDetails] = useState<ProfileDetails>({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
  });
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [licenseImageUrl, setLicenseImageUrl] = useState("");
  const [licenseStatus, setLicenseStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const validation = useInlineValidation();
  const profileValidation = useInlineValidation();
  const [fileError, setFileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSubmittingLicense, setIsSubmittingLicense] = useState(false);
  const [pageError, setPageError] = useState("");

  // /profile nằm ngoài group (dashboard) nên tự chặn khách chưa đăng nhập,
  // đồng thời chỉ tải hồ sơ khi đã có phiên.
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/profile");
      return;
    }

    let active = true;
    void (async () => {
      try {
        const profile = await getAccountProfile();
        let license = null;
        try {
          license = await getCustomerLicense();
        } catch (licenseError) {
          if (!(licenseError instanceof ApiClientError) || licenseError.status !== 404) {
            throw licenseError;
          }
        }
        if (!active) return;
        setDetails({
          fullName: profile.fullName ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? "",
          gender: profile.gender ?? "",
        });
        if (license) {
          setLicenseNumber(license.number ?? "");
          setLicenseType(license.type ?? "");
          setIssueDate(license.issueDate?.slice(0, 10) ?? "");
          setExpiryDate(license.expiryDate?.slice(0, 10) ?? "");
          setLicenseImageUrl(license.imageUrl ?? "");
          setLicenseStatus(license.status ?? "");
        }
      } catch (loadError) {
        if (active) {
          setPageError(messageOf(loadError, "Không thể tải hồ sơ từ máy chủ."));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, router]);

  const updateDetails = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setDetails((current) => ({ ...current, [name]: value }));
    setProfileSaved(false);
  };

  const selectFile = (file?: File) => {
    setFileError("");
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setSelectedFile(null);
      validation.setField("imageUrl", "Vui lòng chọn ảnh JPG, PNG hoặc WEBP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      validation.setField("imageUrl", "Tệp vượt quá 10 MB. Vui lòng chọn tệp nhỏ hơn.");
      return;
    }

    validation.clear("imageUrl");
    setSelectedFile(file);
    setFileError("");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile && !licenseImageUrl) {
      setFileError("Vui lòng tải lên giấy phép lái xe trước khi gửi duyệt.");
      return;
    }
    setIsSubmittingLicense(true);
    setFileError("");
    try {
      let imageUrl = licenseImageUrl;
      if (selectedFile) {
        imageUrl = extractImageUrl(await uploadLicenseImage(selectedFile));
        if (!imageUrl) throw new Error("API tải ảnh không trả về URL.");
      }
      const license = await updateCustomerLicense({
        number: licenseNumber.trim(),
        type: licenseType.trim(),
        issueDate: issueDate || null,
        expiryDate,
        imageUrl,
      });
      setLicenseImageUrl(license.imageUrl ?? imageUrl);
      const status = license.status ?? "pending";
      setLicenseStatus(status);
      setSelectedFile(null);
      setIsPending(isPendingStatus(status));
    } catch (submitError) {
      setFileError(validation.report(submitError, { number: "licenseNumber", type: "licenseType" }));
    } finally {
      setIsSubmittingLicense(false);
    }
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setPageError("");
    try {
      const profile = await updateAccountProfile({
        fullName: details.fullName.trim(),
        gender: details.gender,
        phone: details.phone.trim(),
      });
      setDetails((current) => ({
        ...current,
        fullName: profile.fullName ?? current.fullName,
        email: profile.email ?? current.email,
        phone: profile.phone ?? current.phone,
        gender: profile.gender ?? current.gender,
      }));
      setProfileSaved(true);
    } catch (saveError) {
      setPageError(profileValidation.report(saveError));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const statusLabel = formatLicenseStatus(licenseStatus);
  const hasPendingStatus = isPendingStatus(licenseStatus) || isPending;

  return (
    <div className="relative min-h-[100dvh] bg-canvas text-ink">
      <div className="pointer-events-none absolute inset-0 z-0 bg-canvas" aria-hidden="true" />

      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-32 sm:px-6 lg:pt-36">
        <div className="mb-7 flex items-center gap-2 text-sm text-ink-3">
          <Link href="/" className="transition-colors hover:text-primary">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-ink-2">Hồ sơ của tôi</span>
        </div>

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">Tài khoản cá nhân</p>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Quản lý hồ sơ</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-3 sm:text-base">
              Cập nhật thông tin và xác minh giấy phép lái xe để sẵn sàng cho chuyến đi tiếp theo.
            </p>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
            hasPendingStatus
              ? "border-primary/30 bg-primary-tint text-warning"
              : licenseStatus.toLowerCase().includes("approved")
                ? "border-primary/30 bg-primary-tint text-warning"
                : "border-line bg-surface/80 text-ink-3"
          }`}>
            {hasPendingStatus ? <Clock3 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {statusLabel}
          </div>
        </div>

        {isLoading && <p role="status" className="mb-5 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-3">Đang tải hồ sơ...</p>}
        {pageError && <p role="alert" className="mb-5 rounded-xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{pageError}</p>}

        <section aria-label="Tiến trình xác minh hồ sơ" className="glass-card mb-8 rounded-3xl p-5 sm:p-7">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-ink">Trạng thái hồ sơ tài xế</h2>
              <p className="mt-1 text-sm text-ink-3">Hoàn tất các bước dưới đây để xác minh tài khoản.</p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
              hasPendingStatus ? "bg-primary-tint text-warning" : "bg-sunken text-ink-3"
            }`}>
              {licenseStatus ? licenseStatus.toLocaleUpperCase().replaceAll("_", " ") : "CHƯA HOÀN TẤT"}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ProgressStep
              number="01"
              title="Thông tin cá nhân"
              description={profileSaved ? "Đã lưu thông tin" : "Cập nhật thông tin cơ bản"}
              complete={profileSaved}
            />
            <ProgressStep
              number="02"
              title="Giấy phép lái xe"
              description={licenseStatus ? "Đã gửi tài liệu" : "Tải lên ảnh giấy phép"}
              complete={Boolean(licenseStatus)}
            />
            <ProgressStep
              number="03"
              title="Phê duyệt"
              description={statusLabel}
              complete={licenseStatus.toLowerCase().includes("approved")}
              active={hasPendingStatus}
            />
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="glass-card rounded-3xl p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Thông tin cá nhân</h2>
                <p className="mt-1 text-sm text-ink-3">Thông tin liên hệ và nhận diện tài khoản.</p>
              </div>
            </div>

            <ValidatedForm validation={profileValidation} onSubmit={handleSaveProfile} className="space-y-5">
              <FormField label="Họ và tên" htmlFor="fullName" icon={<UserRound className="h-4 w-4" />}>
                <InlineInput
                  id="fullName"
                  name="fullName"
                  value={details.fullName}
                  onChange={updateDetails}
                  autoComplete="name"
                  placeholder="Nhập họ và tên"
                  className="w-full rounded-xl border border-line bg-surface/75 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
                  required
                />
              </FormField>
              <FormField label="Email" htmlFor="email" icon={<Mail className="h-4 w-4" />}>
                <InlineInput
                  id="email"
                  name="email"
                  type="email"
                  value={details.email}
                  onChange={updateDetails}
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-line bg-surface/75 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
                  required
                  readOnly
                  aria-describedby="email-readonly-help"
                />
              </FormField>
              <p id="email-readonly-help" className="-mt-3 text-xs text-ink-3">Email tài khoản không thể thay đổi qua API hồ sơ.</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Số điện thoại" htmlFor="phone" icon={<Phone className="h-4 w-4" />}>
                  <InlineInput
                    id="phone"
                    name="phone"
                    type="tel"
                    value={details.phone}
                    onChange={updateDetails}
                    autoComplete="tel"
                    placeholder="090 123 4567"
                    className="w-full rounded-xl border border-line bg-surface/75 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
                    required
                  />
                </FormField>
                <FormField label="Giới tính" htmlFor="gender" icon={<UserRound className="h-4 w-4" />}>
                  <InlineSelect id="gender" name="gender" value={details.gender} onChange={(event) => setDetails((current) => ({ ...current, gender: event.currentTarget.value }))} className="w-full rounded-xl border border-line bg-surface/75 px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10">
                    <option value="">Chọn giới tính</option>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                    <option value="Other">Khác</option>
                  </InlineSelect>
                </FormField>
              </div>
              <div className="flex flex-col items-start justify-between gap-3 border-t border-line/70 pt-5 sm:flex-row sm:items-center">
                <p aria-live="polite" className="text-sm text-primary font-medium">
                  {profileSaved ? "Thông tin đã được lưu." : ""}
                </p>
                <button
                  type="submit"
                  disabled={isSavingProfile || isLoading}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-e1 transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {isSavingProfile ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </ValidatedForm>
          </section>

          <div className="space-y-6">
            <section className="glass-card rounded-3xl p-5 sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink">Giấy phép lái xe</h2>
                  <p className="mt-1 text-sm text-ink-3">Tải lên giấy phép hợp lệ để xác minh danh tính.</p>
                </div>
              </div>

              <ValidatedForm validation={validation} validate={() => !selectedFile && !licenseImageUrl ? { imageUrl: "Vui lòng tải lên giấy phép lái xe trước khi gửi duyệt." } : {}} onSubmit={handleSubmit}>
                <div className="mb-5 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-ink-2">Số giấy phép lái xe<InlineInput name="licenseNumber" value={licenseNumber} onChange={(event) => setLicenseNumber(event.currentTarget.value)} required className="admin-input mt-2" /></label>
                  <label className="block text-sm font-semibold text-ink-2">Hạng giấy phép<InlineInput name="licenseType" value={licenseType} onChange={(event) => setLicenseType(event.currentTarget.value)} required placeholder="A1, B1, B2..." className="admin-input mt-2" /></label>
                  <label className="block text-sm font-semibold text-ink-2">Ngày cấp<InlineInput name="issueDate" type="date" value={issueDate} onChange={(event) => setIssueDate(event.currentTarget.value)} className="admin-input mt-2" /></label>
                  <label className="block text-sm font-semibold text-ink-2">Ngày hết hạn<InlineInput name="expiryDate" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.currentTarget.value)} required className="admin-input mt-2" /></label>
                </div>
                <label
                  htmlFor="license-file"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-7 text-center transition ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-line-strong bg-surface/50 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <InlineInput showError={false} name="imageUrl"
                    ref={fileInputRef}
                    id="license-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-primary shadow-sm">
                    <Upload className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-ink">
                    {selectedFile ? "Chọn tệp khác" : "Nhấn để tải lên hoặc kéo thả tệp"}
                  </span>
                  <span className="mt-2 text-xs text-ink-3">JPG, PNG hoặc WEBP · Tối đa 10 MB</span>
                </label>

                <InlineError name="imageUrl" inputId="license-file" />
                {(selectedFile || licenseImageUrl) && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface/70 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{selectedFile?.name ?? "Ảnh giấy phép đã tải lên"}</p>
                      <p className="text-xs text-ink-3">{selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : licenseStatus || "Đã lưu"}</p>
                    </div>
                    {selectedFile && <button
                      type="button"
                      onClick={removeFile}
                      className="rounded-lg p-2 text-ink-3 transition hover:bg-sunken hover:text-ink-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Xóa tệp đã chọn"
                    >
                      <X className="h-4 w-4" />
                    </button>}
                  </div>
                )}

                {fileError && (
                  <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-danger">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {fileError}
                  </p>
                )}

                {hasPendingStatus && (
                  <div role="status" className="mt-4 flex gap-3 rounded-xl border border-primary/30 bg-primary-tint p-4 text-warning">
                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Hồ sơ đang chờ phê duyệt</p>
                      <p className="mt-1 text-xs leading-5 text-warning">
                        Chúng tôi sẽ thông báo khi giấy phép của bạn được kiểm tra xong.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={(!selectedFile && !licenseImageUrl) || isPendingStatus(licenseStatus) || isSubmittingLicense || isLoading}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-e1 transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sunken disabled:shadow-none"
                >
                  {isSubmittingLicense ? <Clock3 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  {isSubmittingLicense ? "Đang gửi..." : hasPendingStatus ? "Đang chờ phê duyệt" : "Gửi giấy phép để xét duyệt"}
                </button>
              </ValidatedForm>
            </section>

            <aside className="rounded-2xl border border-info/30 bg-info-bg p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-info" />
                <div>
                  <h3 className="text-sm font-bold text-info">Tài liệu an toàn và rõ nét</h3>
                  <p className="mt-1 text-sm leading-6 text-info">
                    Đảm bảo ảnh hiển thị đầy đủ thông tin, không bị lóa hoặc cắt mất góc. Chỉ sử dụng giấy phép còn hiệu lực.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function isPendingStatus(status: string | null | undefined): boolean {
  return Boolean(status && /pending|review|approval/i.test(status));
}

function formatLicenseStatus(status: string): string {
  if (!status) return "Chưa xác minh";
  if (isPendingStatus(status)) return "Chờ phê duyệt";
  if (/approved|verified/i.test(status)) return "Đã phê duyệt";
  if (/reject/i.test(status)) return "Chưa được phê duyệt";
  return status.replaceAll("_", " ");
}

function extractImageUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value !== "object" || value === null) return "";
  const data = value as Record<string, unknown>;
  for (const key of ["url", "imageUrl", "fileUrl", "mainImageUrl"]) {
    if (typeof data[key] === "string") return data[key];
  }
  return "";
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function ProgressStep({
  number,
  title,
  description,
  complete,
  active = false,
}: {
  number: string;
  title: string;
  description: string;
  complete: boolean;
  active?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-4 ${
      complete
        ? "border-primary/30 bg-primary-tint/70"
        : active
          ? "border-primary/30 bg-primary-tint/70"
          : "border-line/80 bg-surface/50"
    }`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
        complete
          ? "bg-primary text-white"
          : active
            ? "bg-primary text-white"
            : "bg-sunken text-ink-3"
      }`}>
        {complete ? <Check className="h-5 w-5" /> : number}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-3">{description}</span>
      </span>
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  icon,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-2">
        <span className="text-ink-3">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
