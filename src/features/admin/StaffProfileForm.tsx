"use client";

import { notifyError, notifySuccess } from "@/components/ui/Toaster";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { ValidatedForm, useInlineValidation, InlineInput } from "@/components/forms/inline-validation";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Check, Save, ShieldCheck } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAccountProfile, updateAccountProfile } from "@/features/profile/api";
import { getFacilities, getStaffById, updateStaff } from "./api";
import type { StaffDto } from "./api";
import DriverLicenseProfile from "./DriverLicenseProfile";
import AccountAvatar from "@/components/ui/AccountAvatar";
import { FormField as Field } from "@/components/ui/FormField";
import { useAuth } from "@/features/auth";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { formatAdminDate } from "@/lib/date-time";
import ChangePasswordForm from "@/features/profile/components/ChangePasswordForm";

export default function StaffProfileForm() {
  const { user, refreshProfile } = useAuth();
  const [staff, setStaff] = useState<StaffDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const validation = useInlineValidation();
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [gender, setGender] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const account = await getAccountProfile();
          if (!active) return;
          const adminCheck = (account.roles ?? []).some(
            (r) => r.toLowerCase() === "admin",
          );
          setIsAdmin(adminCheck);
          setGender(account.gender ?? "");

          let staffData: StaffDto | null = null;
          // Mọi vai trò đều cần hồ sơ nhân sự của chính mình (hồ sơ, GPLX, ca trực).
          // Admin không có bản ghi staff thì rơi xuống nhánh tổng hợp từ tài khoản.
          if (account.staffId != null) {
            try {
              staffData = await getStaffById(account.staffId);
            } catch {
              // Không có quyền hoặc chưa có bản ghi staff → tổng hợp từ tài khoản
            }
          }

          if (!staffData) {
            const roleList = (account.roles ?? []).map((r) => r.toLowerCase());
            let computedRole = account.departmentName || "Nhân viên";
            if (roleList.includes("admin")) computedRole = "Quản trị viên";
            else if (roleList.includes("manager")) computedRole = "Quản lý";
            else if (roleList.includes("customerservice")) computedRole = "Chăm sóc khách hàng";
            else if (roleList.includes("maintenance")) computedRole = "Kỹ thuật viên";
            else if (roleList.includes("driver")) computedRole = "Tài xế";

            staffData = {
              id: account.staffId ?? 0,
              userId: 0,
              email: account.email ?? null,
              fullName: account.fullName ?? null,
              phone: account.phone ?? null,
              departmentId: account.departmentId ?? null,
              departmentName: account.departmentName ?? null,
              facilityId: account.facilityId ?? null,
              facilityName: account.facilityName ?? null,
              hiredDate: null,
              isDriver:
                roleList.includes("driver") ||
                account.departmentName?.toLowerCase() === "driver",
              licenseNumber: null,
              licenseType: null,
              licenseIssueDate: null,
              licenseExpiryDate: null,
              licenseImageUrl: null,
              rating: null,
              isActive: true,
              staffRole: computedRole,
            };
          }

          if ("facilityName" in account) {
            staffData = { ...staffData, facilityId: account.facilityId ?? null, facilityName: account.facilityName ?? null };
          }

          if (active) {
            setStaff(staffData);
            setError("");
          }

          // Tên cơ sở chỉ bổ sung cho hồ sơ; lỗi/chậm tải danh mục không được
          // chặn việc xem và cập nhật tài khoản (kể cả admin không có staff).
          const facilityId = staffData.facilityId;
          if (facilityId != null && !staffData.facilityName && adminCheck && !("facilityName" in account)) {
            void getFacilities()
              .then((facilities) => {
                const facility = facilities.find((item) => item.id === facilityId);
                if (active && facility) {
                  setStaff((current) => current?.facilityId === facilityId
                    ? { ...current, facilityName: facility.name }
                    : current);
                }
              })
              .catch(() => { /* Danh mục phụ không ảnh hưởng hồ sơ tài khoản. */ });
          }
        } catch (loadError) {
          if (active) {
            setError(messageOf(loadError, "Không thể tải hồ sơ nhân viên."));
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!staff) return;
    const form = new FormData(event.currentTarget);
    const newFullName = String(form.get("fullName") ?? "").trim();
    const newPhone = String(form.get("phone") ?? "").trim();

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      // 1. Cập nhật hồ sơ tài khoản (dành cho mọi vai trò mà không lo 403)
      await updateAccountProfile({
        fullName: newFullName,
        phone: newPhone,
        gender,
      });

      // 2. Nếu là Admin và có staffId, cập nhật thêm bản ghi staff
      if (isAdmin && staff.id > 0) {
        try {
          await updateStaff(staff.id, {
            fullName: newFullName,
            phone: newPhone,
            departmentId: staff.departmentId,
            facilityId: staff.facilityId,
            hiredDate: staff.hiredDate,
            isDriver: staff.isDriver,
            licenseNumber: staff.licenseNumber,
            licenseType: staff.licenseType,
            licenseIssueDate: staff.licenseIssueDate,
            licenseExpiryDate: staff.licenseExpiryDate,
            licenseImageUrl: staff.licenseImageUrl,
            staffRole: staff.staffRole ?? "",
          });
        } catch {
          // Bỏ qua lỗi staff nếu updateAccountProfile đã thành công
        }
      }

      setStaff((prev) => (prev ? { ...prev, fullName: newFullName, phone: newPhone } : null));
      await refreshProfile();
      setSaved(true);
      notifySuccess("Đã cập nhật hồ sơ cá nhân.");
    } catch (saveError) {
      const message = validation.report(saveError);
      setError(message);
      notifyError(message);
    } finally {
      setSaving(false);
    }
  };

  const identityRows = staff
    ? [
        { term: "Email", detail: staff.email ?? "—" },
        { term: "Số điện thoại", detail: staff.phone ?? "Chưa cập nhật" },
        { term: "Vai trò", detail: staff.staffRole ?? "Nhân viên" },
        { term: "Phòng ban", detail: staff.departmentName ?? "Chưa phân công" },
        { term: "Cơ sở trực", detail: staff.facilityName ?? "Chưa phân công" },
        {
          term: "Ngày nhận việc",
          detail: staff.hiredDate ? formatAdminDate(staff.hiredDate) : "Chưa cập nhật",
        },
      ]
    : [];

  return (
    <div className="space-y-7">
      <TransitFolio
        title="Hồ sơ của tôi"
        description="Xem và cập nhật thông tin liên hệ của bạn."
      >
        <div className="border-l border-td-rule pl-4 text-right">
          <span className="block text-xs text-td-muted">Vai trò</span>
          <strong className="block text-sm font-bold text-td-ink">
            {staff?.staffRole?.trim() || "Nhân sự vận hành"}
          </strong>
          <span className="mt-1 block text-xs text-td-muted">
            {staff?.facilityName?.trim() || "Chưa gán trạm"}
          </span>
        </div>
      </TransitFolio>

      {loading && <FormSkeleton label="Đang tải hồ sơ..." fields={4} />}
      {error && (
        <p role="alert" className="border-l border-danger pl-3 text-sm text-danger">
          {error}
        </p>
      )}

      {staff && (
        <>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Hồ sơ định danh */}
            <aside aria-label="Thông tin định danh nhân viên" className="lg:col-span-4">
              <div className="rounded border border-td-rule bg-td-white p-6">
                <div className="flex items-start gap-4 border-b border-td-rule pb-5">
                  <AccountAvatar
                    src={user?.avatarUrl}
                    name={staff.fullName ?? staff.email}
                    size={64}
                    className="h-16 w-16 rounded border border-td-rule bg-td-chalk font-mono text-lg font-bold text-td-oxide"
                  />
                  <div className="min-w-0 space-y-1">
                    <span className="block text-xs text-td-muted">
                      {staff.email || "Tài khoản cá nhân"}
                    </span>
                    <p className="truncate font-sans text-lg font-bold tracking-tight text-td-ink">
                      {staff.fullName ?? staff.email}
                    </p>
                    <AdminStatusBadge
                      domain="activity"
                      status={staff.isActive ? "active" : "inactive"}
                    >
                      {staff.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                    </AdminStatusBadge>
                  </div>
                </div>

                <dl className="divide-y divide-td-rule font-mono text-xs">
                  {identityRows.map((row) => (
                    <div key={row.term} className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-td-muted">{row.term}</dt>
                      <dd className="text-right font-semibold text-td-ink">{row.detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <p className="mt-4 flex items-start gap-2 border-l border-td-oxide pl-3 text-xs leading-relaxed text-td-muted">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-td-oxide" aria-hidden="true" />
                Chức vụ, phòng ban và cơ sở trực do quản trị viên cập nhật theo hồ sơ nhân sự.
              </p>
            </aside>

            {/* Biểu mẫu liên hệ */}
            <div className="lg:col-span-8">
              <ValidatedForm
                validation={validation}
                key={staff.id}
                onSubmit={submit}
                onChange={() => setSaved(false)}
                className="rounded border border-td-rule bg-td-white p-5 sm:p-7"
              >
                <div className="border-b border-td-rule pb-3">
                  <h2 className="text-sm font-bold text-td-ink">Thông tin liên hệ</h2>
                  <p className="mt-1 font-mono text-[11px] text-td-muted">
                    Chỉ họ tên và số điện thoại có thể tự cập nhật.
                  </p>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field label="Họ và tên" htmlFor="fullName">
                    <InlineInput
                      name="fullName"
                      required
                      defaultValue={staff.fullName ?? ""}
                      autoComplete="name"
                      className="admin-input"
                    />
                  </Field>
                  <Field label="Số điện thoại" htmlFor="phone">
                    <InlineInput
                      name="phone"
                      required
                      defaultValue={staff.phone ?? ""}
                      autoComplete="tel"
                      className="admin-input"
                    />
                  </Field>
                  <Field label="Email công việc" htmlFor="email">
                    <InlineInput
                      type="email"
                      readOnly
                      value={staff.email ?? ""}
                      className="admin-input bg-td-chalk text-td-muted"
                    />
                  </Field>
                  <Field label="Phòng ban" htmlFor="departmentName">
                    <InlineInput
                      readOnly
                      value={staff.departmentName ?? "Chưa phân công"}
                      className="admin-input bg-td-chalk text-td-muted"
                    />
                  </Field>
                </div>

                <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-td-rule pt-4 sm:flex-row sm:items-center">
                  <p aria-live="polite" className="font-mono text-[11px] text-success">
                    {saved ? "Đã lưu hồ sơ nhân viên." : ""}
                  </p>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded bg-td-oxide px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-td-oxide-hover disabled:opacity-60"
                  >
                    {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </ValidatedForm>
            </div>
          </div>

          {staff.isDriver && <DriverLicenseProfile staff={staff} onUpdated={setStaff} />}
          <ChangePasswordForm />
        </>
      )}
    </div>
  );
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
