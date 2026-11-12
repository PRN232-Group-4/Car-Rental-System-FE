"use client";

import { ValidatedForm, useInlineValidation, InlineInput, InlineSelect } from "@/components/forms/inline-validation";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import {
  AlertCircle,
  BadgeCheck,
  Check,
  Clock3,
  Mail,
  Phone,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  getAccountProfile,
  getCustomerLicense,
  updateAccountProfile,
} from "../api";
import { saveCustomerLicense } from "@/features/licenses/api";
import { hasCustomerLicense } from "@/features/licenses/booking-license";
import LicenseImageField from "@/features/licenses/components/LicenseImageField";
import { ApiClientError } from "@/api/api-client";
import { useAuth } from "@/features/auth";
import ChangePasswordForm from "./ChangePasswordForm";
import Link from "@/components/navigation/NavigationLink";

type ProfileDetails = {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
};

export default function ProfileManager() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [details, setDetails] = useState<ProfileDetails>({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
  });
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseId, setLicenseId] = useState<number | null>(null);
  const [licenseType, setLicenseType] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [licenseImageUrl, setLicenseImageUrl] = useState("");
  const [licenseStatus, setLicenseStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
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
          setLicenseId(license.id ?? null);
          setLicenseNumber(license.number ?? "");
          setLicenseType(license.type ?? "");
          setIssueDate(license.issueDate?.slice(0, 10) ?? "");
          setExpiryDate(license.expiryDate?.slice(0, 10) ?? "");
          setLicenseImageUrl(license.imageUrl ?? "");
          setLicenseStatus(hasCustomerLicense(license) ? license.status ?? "" : "");
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

  const updateDetails = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.currentTarget;
    setDetails((current) => ({ ...current, [name]: value }));
    setProfileSaved(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingLicense || isLoading || isPendingStatus(licenseStatus)) return;
    if (!selectedFile) {
      validation.setField("imageUrl", "Vui lòng chọn ảnh GPLX từ thiết bị để gửi hồ sơ.");
      return;
    }
    setIsSubmittingLicense(true);
    setFileError("");
    try {
      const license = await saveCustomerLicense({
        ...(licenseId != null ? { licenseId } : {}),
        number: licenseNumber.trim(),
        type: licenseType.trim(),
        issueDate,
        expiryDate,
        file: selectedFile,
      });
      setLicenseImageUrl(license.imageUrl ?? "");
      setLicenseId(license.id ?? null);
      const status = license.status ?? "pending";
      setLicenseStatus(status);
      setSelectedFile(null);
      setIsPending(isPendingStatus(status));
    } catch (submitError) {
      setFileError(validation.report(submitError, { number: "licenseNumber", type: "licenseType", file: "imageUrl" }));
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

  const statusLabel = formatLicenseStatus(licenseStatus);
  const hasPendingStatus = isPendingStatus(licenseStatus) || isPending;

  return (
    <div className="relative text-td-ink">
      <main className="relative z-10 w-full">
        <TransitFolio
          title="Quản lý hồ sơ"
          description="Cập nhật thông tin và xác minh giấy phép lái xe để sẵn sàng cho chuyến đi tiếp theo."
        >
          <StatusBadge
            status={
              licenseStatus.toLowerCase().includes("approved")
                ? "approved"
                : hasPendingStatus
                  ? "pending"
                  : "unavailable"
            }
          >
            {statusLabel}
          </StatusBadge>
        </TransitFolio>

        {isLoading && <p role="status" className="mb-5 rounded border border-td-rule bg-td-white px-4 py-3 text-sm text-td-muted">Đang tải hồ sơ...</p>}
        {pageError && <p role="alert" className="mb-5 rounded border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{pageError}</p>}

        <section aria-label="Tiến trình xác minh hồ sơ" className="mb-8 rounded border border-td-rule bg-td-white p-5 sm:p-7">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-td-ink">Trạng thái hồ sơ tài xế</h2>
              <p className="mt-1 text-sm text-td-muted">Hoàn tất các bước dưới đây để xác minh tài khoản.</p>
            </div>
            <StatusBadge
              status={
                licenseStatus.toLowerCase().includes("approved")
                  ? "approved"
                  : hasPendingStatus
                    ? "pending"
                    : "unavailable"
              }
            >
              {licenseStatus ? licenseStatus.replaceAll("_", " ") : "Chưa hoàn tất"}
            </StatusBadge>
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
          <section className="rounded border border-td-rule bg-td-white p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-td-ink">Thông tin cá nhân</h2>
                <p className="mt-1 text-sm text-td-muted">Thông tin liên hệ và nhận diện tài khoản.</p>
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
                  className="w-full rounded border border-td-rule bg-td-white/75 px-4 py-3 text-sm text-td-ink outline-none transition placeholder:text-td-muted focus:border-primary focus:bg-td-white focus:ring-4 focus:ring-primary/10"
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
                  className="w-full rounded border border-td-rule bg-td-white/75 px-4 py-3 text-sm text-td-ink outline-none transition placeholder:text-td-muted focus:border-primary focus:bg-td-white focus:ring-4 focus:ring-primary/10"
                  required
                  readOnly
                  aria-describedby="email-readonly-help"
                />
              </FormField>
              <p id="email-readonly-help" className="-mt-3 text-xs text-td-muted">Email tài khoản không thể thay đổi qua API hồ sơ.</p>
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
                    className="w-full rounded border border-td-rule bg-td-white/75 px-4 py-3 text-sm text-td-ink outline-none transition placeholder:text-td-muted focus:border-primary focus:bg-td-white focus:ring-4 focus:ring-primary/10"
                    required
                  />
                </FormField>
                <FormField label="Giới tính" htmlFor="gender" icon={<UserRound className="h-4 w-4" />}>
                  <InlineSelect id="gender" name="gender" value={details.gender} onChange={updateDetails} className="w-full rounded border border-td-rule bg-td-white/75 px-4 py-3 text-sm text-td-ink outline-none transition focus:border-primary focus:bg-td-white focus:ring-4 focus:ring-primary/10">
                    <option value="">Chọn giới tính</option>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                    <option value="Other">Khác</option>
                  </InlineSelect>
                </FormField>
              </div>
              <div className="flex flex-col items-start justify-between gap-3 border-t border-td-rule/70 pt-5 sm:flex-row sm:items-center">
                <p aria-live="polite" className="text-sm text-primary font-medium">
                  {profileSaved ? "Thông tin đã được lưu." : ""}
                </p>
                <button
                  type="submit"
                  disabled={isSavingProfile || isLoading}
                  className="rounded bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {isSavingProfile ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </ValidatedForm>
          </section>

          <div className="space-y-6">
            <section className="rounded border border-td-rule bg-td-white p-5 sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-td-ink">Giấy phép lái xe</h2>
                  <p className="mt-1 text-sm text-td-muted">Tải lên giấy phép hợp lệ để xác minh danh tính.</p>
                  <Link href="/driver-license" className="mt-2 inline-block text-sm text-primary underline">Quản lý tất cả GPLX và thêm giấy phép khác</Link>
                </div>
              </div>

              <ValidatedForm validation={validation} validate={() => ({
                issueDate: issueDate && expiryDate && issueDate > expiryDate ? "Ngày cấp không được sau ngày hết hạn. Vui lòng kiểm tra lại." : undefined,
                imageUrl: !selectedFile ? "Vui lòng chọn ảnh GPLX từ thiết bị để gửi hồ sơ." : undefined,
                expiryDate: expiryDate && new Date(`${expiryDate}T23:59:59`) < new Date() ? "Giấy phép lái xe đã hết hạn, không thể sử dụng để thuê xe." : undefined,
              })} onSubmit={handleSubmit}>
                <p className="mb-4 text-sm text-td-muted">Tất cả thông tin và ảnh GPLX đều bắt buộc khi gửi duyệt.</p>
                <div className="mb-5 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-td-ink">Số giấy phép lái xe *<InlineInput name="licenseNumber" value={licenseNumber} onChange={(event) => setLicenseNumber(event.currentTarget.value)} required className="admin-input mt-2" /></label>
                  <label className="block text-sm font-semibold text-td-ink">Hạng giấy phép *<InlineInput name="licenseType" value={licenseType} onChange={(event) => setLicenseType(event.currentTarget.value)} required placeholder="A1, B1, B2..." className="admin-input mt-2" /></label>
                  <label className="block text-sm font-semibold text-td-ink">Ngày cấp *<InlineInput name="issueDate" type="date" value={issueDate} onChange={(event) => setIssueDate(event.currentTarget.value)} required className="admin-input mt-2" /></label>
                  <label className="block text-sm font-semibold text-td-ink">Ngày hết hạn *<InlineInput name="expiryDate" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.currentTarget.value)} required className="admin-input mt-2" /></label>
                </div>
                <LicenseImageField
                  label="Ảnh giấy phép lái xe *"
                  name="imageUrl"
                  inputId="license-file"
                  validation={validation}
                  value={selectedFile}
                  onChange={setSelectedFile}
                  existingUrl={licenseImageUrl || null}
                  busy={isSubmittingLicense}
                />

                {fileError && (
                  <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-danger">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {fileError}
                  </p>
                )}

                {hasPendingStatus && (
                  <div role="status" className="mt-4 flex gap-3 rounded border border-primary/30 bg-primary-tint p-4 text-warning">
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
                  disabled={isPendingStatus(licenseStatus) || isSubmittingLicense || isLoading}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded bg-primary px-5 py-3.5 text-sm font-bold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-td-chalk disabled:shadow-none"
                >
                  {isSubmittingLicense ? <Clock3 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  {isSubmittingLicense ? "Đang gửi..." : hasPendingStatus ? "Đang chờ phê duyệt" : "Gửi giấy phép để xét duyệt"}
                </button>
              </ValidatedForm>
            </section>

            <aside className="rounded border border-info/30 bg-info-bg p-5">
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
        {!isLoading && isAuthenticated && <ChangePasswordForm />}
      </main>

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
    <div className={`flex items-center gap-3 rounded border p-4 ${
      complete
        ? "border-primary/30 bg-primary-tint/70"
        : active
          ? "border-primary/30 bg-primary-tint/70"
          : "border-td-rule/80 bg-td-white/50"
    }`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded text-xs font-bold ${
        complete
          ? "bg-primary text-white"
          : active
            ? "bg-primary text-white"
            : "bg-td-chalk text-td-muted"
      }`}>
        {complete ? <Check className="h-5 w-5" /> : number}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-td-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-td-muted">{description}</span>
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
      <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 text-sm font-semibold text-td-ink">
        <span className="text-td-muted">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
