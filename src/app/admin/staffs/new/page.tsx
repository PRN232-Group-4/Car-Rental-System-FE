"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "@/features/auth/AuthGate";
import { useCreateStaff, useDepartments, useFacilities } from "@/features/admin/staff/hooks";
import { getStaffAccountOptions, hasDriverRole } from "@/features/admin/staff/account-options";
import { PERMITTED_LICENSE_TYPES } from "@/features/admin/staff/license-utils";
import { FormField } from "@/components/ui/FormField";
import { InlineInput, InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { format } from "date-fns";
import { nowGmt7 } from "@/lib/time";

function CreateStaffContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId") ?? "";
  const mutation = useCreateStaff();
  const users = useQuery({ queryKey: ["admin", "staff-account-options"], queryFn: getStaffAccountOptions });
  const departments = useDepartments();
  const facilities = useFacilities();
  const validation = useInlineValidation();
  const [userId, setUserId] = useState(initialUserId);
  const [departmentId, setDepartmentId] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [hiredDate, setHiredDate] = useState(() => format(nowGmt7(), "yyyy-MM-dd"));
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseType, setLicenseType] = useState("B2");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");
  const selected = users.data?.find((user) => user.id === Number(userId));
  const isDriver = hasDriverRole(selected?.roles);
  const loading = users.isLoading || departments.isLoading || facilities.isLoading;
  const loadError = users.error || departments.error || facilities.error;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || mutation.isPending) return;
    setError("");
    try {
      const created = await mutation.mutateAsync({
        userId: selected.id, departmentId: Number(departmentId), facilityId: Number(facilityId), hiredDate,
        isDriver,
        license: isDriver && licenseNumber.trim() ? {
          number: licenseNumber.trim(), type: licenseType, issueDate: issueDate || undefined, expiryDate: expiryDate || undefined,
        } : undefined,
      });
      router.push(`/admin/staffs/detail?id=${created.id}`);
    } catch (failure) {
      setError(validation.report(failure, { licensenumber: "licenseNumber", licensetype: "licenseType", licenseissuedate: "issueDate", licenseexpirydate: "expiryDate", license: "licenseNumber" }));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <TransitFolio
        title="Tạo hồ sơ nhân viên / tài xế"
        description="Chọn email tài khoản có sẵn và phân công phòng ban, cơ sở làm việc.">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/staffs")}>
          <ArrowLeft className="mr-1 h-4 w-4" />Quay lại danh sách
        </Button>
      </TransitFolio>
      {loading ? <FormSkeleton fields={4} label="Đang tải tài khoản và danh mục nhân sự..." /> : loadError ? (
        <div role="alert" className="pl-3 text-sm text-danger">
          Không thể tải danh mục nhân sự. Vui lòng thử lại.
          <Button variant="secondary" onClick={() => { void users.refetch(); void departments.refetch(); void facilities.refetch(); }}>Tải lại danh mục</Button>
        </div>
      ) : (
        <ValidatedForm validation={validation} onSubmit={submit} validate={() => ({
          userId: !selected || !selected.isActive || selected.staffId != null ? "Vui lòng chọn tài khoản đang hoạt động và chưa có hồ sơ nhân sự." : undefined,
          expiryDate: isDriver && issueDate && expiryDate && expiryDate < issueDate ? "Ngày hết hạn GPLX phải từ ngày cấp trở đi." : undefined,
        })} className="space-y-6 rounded border border-td-rule bg-td-white p-6 sm:p-8">
          {error && <p role="alert" className="pl-3 text-sm text-danger">{error}</p>}
          {selected && initialUserId === String(selected.id) && (
            <div className="rounded border border-td-rule bg-td-paper p-3 text-xs text-td-ink flex items-center justify-between">
              <span>Đang tạo hồ sơ nhân viên cho: <strong>{selected.fullName || selected.email}</strong> ({selected.email}).</span>
              <span className="font-mono text-[10px] text-td-muted">User ID: #{selected.id}</span>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            <FormField label="Email tài khoản" htmlFor="userId" required helperText="Vai trò của tài khoản quyết định hồ sơ tài xế và giấy phép lái xe.">
              <InlineSelect id="userId" name="userId" required value={userId} onChange={(event) => setUserId(event.target.value)} className="admin-input">
                <option value="">Chọn email tài khoản</option>
                {users.data?.map((user) => <option key={user.id} value={user.id} disabled={!user.isActive || user.staffId != null}>
                  {user.email}{user.fullName ? ` — ${user.fullName}` : ""}{user.staffId != null ? " (Đã có hồ sơ)" : !user.isActive ? " (Tạm ngưng)" : ""}
                </option>)}
              </InlineSelect>
            </FormField>
            <FormField label="Ngày vào làm việc" htmlFor="hiredDate" required>
              <InlineInput id="hiredDate" name="hiredDate" type="date" required value={hiredDate} onChange={(event) => setHiredDate(event.target.value)} className="admin-input" />
            </FormField>
            <FormField label="Phòng ban trực thuộc" htmlFor="departmentId" required>
              <InlineSelect id="departmentId" name="departmentId" required value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="admin-input">
                <option value="">Chọn phòng ban</option>
                {departments.data?.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </InlineSelect>
            </FormField>
            <FormField label="Trạm / Cơ sở công tác" htmlFor="facilityId" required>
              <InlineSelect id="facilityId" name="facilityId" required value={facilityId} onChange={(event) => setFacilityId(event.target.value)} className="admin-input">
                <option value="">Chọn cơ sở</option>
                {facilities.data?.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
              </InlineSelect>
            </FormField>
          </div>
          {selected && <p className="pl-3 text-xs text-td-muted">Vai trò tài khoản: {selected.roles.join(", ") || "Chưa có vai trò"}.{isDriver ? " Tài khoản có vai trò Driver; bổ sung giấy phép lái xe bên dưới." : " Thông tin giấy phép lái xe dành cho tài khoản có vai trò Driver."}</p>}
          {isDriver && <section aria-label="Giấy phép lái xe" className="space-y-4 border-t border-td-rule pt-5">
            <h2 className="text-sm font-bold text-td-ink">Giấy phép lái xe của tài xế</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Số GPLX" htmlFor="licenseNumber" required><InlineInput id="licenseNumber" name="licenseNumber" required value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} className="admin-input" /></FormField>
              <FormField label="Hạng bằng" htmlFor="licenseType"><InlineSelect id="licenseType" name="licenseType" value={licenseType} onChange={(event) => setLicenseType(event.target.value)} className="admin-input">{PERMITTED_LICENSE_TYPES.map((type) => <option key={type} value={type}>Hạng {type}</option>)}</InlineSelect></FormField>
              <FormField label="Ngày cấp" htmlFor="issueDate"><InlineInput id="issueDate" name="issueDate" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className="admin-input" /></FormField>
              <FormField label="Ngày hết hạn" htmlFor="expiryDate" required><InlineInput id="expiryDate" name="expiryDate" required type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className="admin-input" /></FormField>
            </div>
          </section>}
          <div className="flex flex-wrap justify-end gap-3 border-t border-td-rule pt-4">
            <Button type="button" variant="secondary" disabled={mutation.isPending} onClick={() => router.push("/admin/staffs")}>Hủy</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang tạo..." : "Xác nhận tạo hồ sơ"}</Button>
          </div>
        </ValidatedForm>
      )}
    </div>
  );
}

export default function CreateStaffPage() {
  return <AuthGate allowedRoles={["Admin"]}><Suspense fallback={<FormSkeleton fields={4} />}><CreateStaffContent /></Suspense></AuthGate>;
}
