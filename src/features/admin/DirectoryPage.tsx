"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import {
  createDepartment,
  createFacility,
  createStaff,
  deleteDepartment,
  deleteFacility,
  deleteStaff,
  getDepartments,
  getFacilities,
  getRoles,
  getStaff,
  updateDepartment,
  updateFacility,
  updateStaff,
} from "./api";
import type { OrganizationUnitDto, RoleDto, StaffDto } from "./api";
import { useAuth } from "@/features/auth";
import { notifyApiError, notifyError, notifySuccess } from "@/components/ui/Toaster";
import { InlineInput, InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { AdminFilterBar, AdminFilterField, AdminFilterButton } from "@/components/admin/AdminFilters";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { Skeleton } from "@/components/ui/Skeleton";
import { TransitFolio, TransitFolioMetric } from "@/features/admin/transit-desk/TransitFolio";
import MapboxMap from "@/components/maps/MapboxMap";

type Directory = "departments" | "facilities" | "staffs" | "roles";
type Row = {
  id: number;
  name: string;
  description: string;
  detail: string;
  active: boolean;
  source?: StaffDto;
};
type FormValues = Record<string, string>;

const pageInfo: Record<Directory, { title: string; description: string; columns: string[] }> = {
  departments: { title: "Phòng ban", description: "Danh sách phòng ban trong tổ chức.", columns: ["Phòng ban"] },
  facilities: { title: "Chi nhánh", description: "Danh sách chi nhánh và địa chỉ.", columns: ["Chi nhánh", "Địa chỉ"] },
  staffs: { title: "Nhân viên", description: "Nhân viên, vai trò và phân công chi nhánh.", columns: ["Nhân viên", "Vai trò / Phòng ban", "Chi nhánh"] },
  roles: { title: "Vai trò", description: "Các vai trò hiện được gán cho nhân viên.", columns: ["Vai trò", "Nguồn", "Số nhân viên"] },
};

export default function DirectoryPage({ directory }: { directory: Directory }) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const isManager = hasRole("manager");
  // Admin quản trị tài khoản/vai trò; Manager vận hành cơ sở và nhân sự.
  const canModify = (isAdmin || isManager) && directory !== "roles";

  const info = pageInfo[directory];
  const [rows, setRows] = useState<Row[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [departments, setDepartments] = useState<OrganizationUnitDto[]>([]);
  const [facilities, setFacilities] = useState<OrganizationUnitDto[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Row | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mapAddress, setMapAddress] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const validation = useInlineValidation();

  const load = useCallback(async () => {
    setError("");
    try {
      if (directory === "departments") {
        const departmentData = await getDepartments();
        setRows(departmentData.map(toOrganizationRow));
        setTotalCount(departmentData.length);
      } else if (directory === "facilities") {
        const facilityData = await getFacilities();
        setRows(facilityData.map(toOrganizationRow));
        setTotalCount(facilityData.length);
      } else if (directory === "staffs") {
        if (!canModify) {
          notifyError("Bạn cần quyền Quản lý vận hành hoặc Quản trị viên để xem danh sách nhân sự.");
          setRows([]);
          setTotalCount(0);
          return;
        }
        const [departmentData, facilityData, staffPage] = await Promise.all([
          getDepartments(),
          getFacilities(),
          getStaff({ search: search.trim() || undefined, page, pageSize }),
        ]);
        setDepartments(departmentData);
        setFacilities(facilityData);
        setRows((staffPage.items ?? []).map(toStaffRow));
        setTotalCount(staffPage.totalCount);
      } else {
        if (!isAdmin) {
          notifyError("Bạn cần quyền Quản trị viên (Admin) để xem danh sách vai trò hệ thống.");
          setRows([]);
          setTotalCount(0);
          return;
        }
        const rolePage = await getRoles({ page: 1, pageSize: 100 });
        setRows((rolePage.items ?? []).map(toRoleRow));
        setTotalCount(rolePage.totalCount);
      }
    } catch (loadError) {
      notifyApiError(loadError, `Không thể tải ${info.title.toLocaleLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [directory, info.title, canModify, isAdmin, page, pageSize, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  const openForm = (row?: Row) => {
    setEditing(row ?? null);
    setMapAddress(null);
    if (directory === "departments") setValues({ name: row?.name ?? "" });
    else if (directory === "facilities") setValues({ name: row?.name ?? "", address: row?.description ?? "" });
    else if (directory === "staffs") {
      const staff = row?.source;
      const initialRole = staff?.staffRole ?? (staff?.isDriver ? "Driver" : "CustomerService");
      setValues({
        email: staff?.email ?? "",
        fullName: staff?.fullName ?? "",
        password: "",
        phone: staff?.phone ?? "",
        departmentId: staff?.departmentId ? String(staff.departmentId) : "",
        facilityId: staff?.facilityId ? String(staff.facilityId) : "",
        hiredDate: staff?.hiredDate?.slice(0, 10) ?? "",
        staffRole: initialRole,
        licenseNumber: staff?.licenseNumber ?? "",
        licenseType: staff?.licenseType ?? "B2",
        licenseIssueDate: staff?.licenseIssueDate?.slice(0, 10) ?? "",
        licenseExpiryDate: staff?.licenseExpiryDate?.slice(0, 10) ?? "",
      });
    }
    setError("");
    validation.reset();
    setFormOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const isEditing = Boolean(editing);
      if (directory === "departments") {
        if (editing) await updateDepartment(editing.id, values.name.trim());
        else await createDepartment(values.name.trim());
      } else if (directory === "facilities") {
        const body = { name: values.name.trim(), address: values.address.trim() };
        if (editing) await updateFacility(editing.id, body);
        else await createFacility(body);
      } else if (directory === "staffs") {
        const isDriver = values.staffRole === "Driver";
        const role = values.staffRole?.trim() || "CustomerService";
        const common = {
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
          departmentId: values.departmentId ? Number(values.departmentId) : null,
          facilityId: values.facilityId ? Number(values.facilityId) : null,
          hiredDate: values.hiredDate || null,
          isDriver,
          licenseNumber: isDriver ? (values.licenseNumber?.trim() || null) : null,
          licenseType: isDriver ? (values.licenseType?.trim() || null) : null,
          licenseIssueDate: isDriver ? (values.licenseIssueDate || null) : null,
          licenseExpiryDate: isDriver ? (values.licenseExpiryDate || null) : null,
          licenseImageUrl: editing?.source?.licenseImageUrl ?? null,
          staffRole: role,
        };
        if (editing) await updateStaff(editing.id, common);
        else await createStaff({
          ...common,
          email: values.email.trim(),
          password: values.password,
        });
      }
      setFormOpen(false);
      notifySuccess(isEditing ? "Đã cập nhật thông tin." : "Đã thêm mới thành công.");
      await load();
    } catch (submitError) {
      const message = validation.report(submitError);
      setError(message);
      notifyError(message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Xóa "${row.name}"?`)) return;
    try {
      if (directory === "departments") await deleteDepartment(row.id);
      else if (directory === "facilities") await deleteFacility(row.id);
      else if (directory === "staffs") await deleteStaff(row.id);
      notifySuccess(`Đã xóa "${row.name}".`);
      await load();
    } catch (deleteError) {
      notifyApiError(deleteError, "Không thể xóa mục này.");
    }
  };

  const fields = directory === "departments"
    ? [{ key: "name", label: "Tên phòng ban", required: true }]
    : directory === "facilities"
      ? [{ key: "name", label: "Tên chi nhánh", required: true }, { key: "address", label: "Địa chỉ", required: true }]
      : [
          { key: "fullName", label: "Họ và tên", required: true },
          { key: "phone", label: "Số điện thoại", required: true },
          ...(!editing ? [{ key: "email", label: "Email", type: "email", required: true }] : []),
          ...(!editing ? [{ key: "password", label: "Mật khẩu khởi tạo", type: "password", required: true }] : []),
          { key: "staffRole", label: "Vai trò", type: "staffRole", required: true },
          { key: "hiredDate", label: "Ngày nhận việc", type: "date" },
          { key: "departmentId", label: "Phòng ban", type: "department" },
          { key: "facilityId", label: "Chi nhánh", type: "facility" },
          ...(values.staffRole === "Driver"
            ? [
                { key: "licenseNumber", label: "Số giấy phép lái xe", required: true },
                { key: "licenseExpiryDate", label: "Ngày hết hạn GPLX", type: "date", required: true },
                { key: "licenseType", label: "Hạng GPLX (B1, B2, C...)" },
                { key: "licenseIssueDate", label: "Ngày cấp GPLX", type: "date" },
              ]
            : []),
        ];

  return (
    <div className="space-y-6">
      <TransitFolio
        title={info.title}
        description={info.description}
      >
        <TransitFolioMetric
          label="Tổng số"
          value={loading ? <Skeleton className="h-8 w-16" /> : String(totalCount)}
        />
        {canModify && (
          <button
            type="button"
            onClick={() => openForm()}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded bg-td-oxide px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-td-oxide-hover"
          >
            <Plus className="h-4 w-4" /> Thêm mới
          </button>
        )}
      </TransitFolio>
      {directory === "roles" && <p className="pl-3 text-xs text-td-muted">Số tài khoản là số người dùng được gán vai trò tương ứng (nguồn: /api/roles).</p>}

      {directory === "staffs" && <AdminFilterBar description="Tìm nhân viên theo tên hoặc email." actions={
        <AdminFilterButton variant="secondary" disabled={!search} onClick={() => { setSearch(""); setPage(1); }}>Đặt lại</AdminFilterButton>
      }>
        <AdminFilterField label="Tìm nhân viên" htmlFor="staff-filter-search" icon={Search}>
          <input id="staff-filter-search" value={search} onChange={(event) => { setSearch(event.currentTarget.value); setPage(1); }} placeholder="Tìm theo tên hoặc email..." />
        </AdminFilterField>
      </AdminFilterBar>}

      <AdminTableCard>
        <div className="border-b border-td-rule pb-2 pt-3"><h3 className="text-sm font-bold text-td-ink">Danh sách {info.title.toLocaleLowerCase()}</h3><p className="mt-1 text-xs text-td-muted">{loading ? "Đang tải..." : `${rows.length} mục`}</p></div>

        <AdminTable aria-busy={loading} className="min-w-[640px]">
          <caption className="sr-only">Danh sách {info.title.toLocaleLowerCase()}</caption>
          <thead>
            <tr>
              {info.columns.map((column) => <th key={column} scope="col">{column}</th>)}
              <th scope="col">Trạng thái</th>
              {canModify && <th scope="col" data-actions>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <AdminTableSkeleton columns={info.columns.length + (canModify ? 2 : 1)} /> : rows.map((row) => (
              <tr key={row.id}>
                <td className="font-semibold text-td-ink">{row.name}</td>
                {info.columns.slice(1).map((column, index) => (
                  <td key={column} className="text-td-muted"><span className="block max-w-[320px] truncate" title={[row.description, row.detail][index] || undefined}>{[row.description, row.detail][index] || "—"}</span></td>
                ))}
                <td><AdminStatusBadge domain="activity" status={row.active ? "active" : "inactive"}>{row.active ? "Đang hoạt động" : "Tạm ngưng"}</AdminStatusBadge></td>
                {canModify && (
                  <td data-actions>
                    <div className="flex justify-end gap-1">
                      <AdminRowAction action="edit" label={`Sửa ${row.name}`} onClick={() => openForm(row)} />
                      <AdminRowAction action="delete" label={`Xóa ${row.name}`} onClick={() => void remove(row)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!loading && rows.length === 0 && <AdminTableEmptyRow colSpan={info.columns.length + (canModify ? 2 : 1)}>Không có dữ liệu.</AdminTableEmptyRow>}
          </tbody>
        </AdminTable>
        {directory === "staffs" && (
          <div className="flex flex-col gap-3 border-t border-td-rule py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-[11px] text-td-muted">
              <span>Trang {page} / {pageCount} · {totalCount} nhân viên</span>
              <InlineSelect value={pageSize} onChange={(event) => { setPageSize(Number(event.currentTarget.value)); setPage(1); }} aria-label="Số nhân viên mỗi trang" className="rounded border border-td-rule bg-transparent px-2 py-1 text-xs text-td-ink outline-none focus:border-td-ink">
                {[10, 20, 50].map((size) => <option key={size} value={size}>{size} mỗi trang</option>)}
              </InlineSelect>
            </div>
            <nav aria-label="Phân trang nhân viên" className="flex items-center gap-2">
              <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Trang trước" className="rounded border border-td-rule p-1.5 text-td-ink transition hover:bg-td-chalk disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" disabled={page >= pageCount || loading} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Trang sau" className="rounded border border-td-rule p-1.5 text-td-ink transition hover:bg-td-chalk disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </nav>
          </div>
        )}
      </AdminTableCard>

      {formOpen && (
        <FormDialog title={`${editing ? "Chỉnh sửa" : "Thêm mới"} · ${info.title}`} onClose={() => setFormOpen(false)} busy={saving}>
            <ValidatedForm validation={validation} onSubmit={submit}>
              <div className={`grid gap-x-4 gap-y-2.5 ${directory === "staffs" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                {fields.map((field) => (
                  <div key={field.key} className={directory !== "staffs" ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-td-ink">
                      <span className="mb-1 block">{field.label}</span>
                      {field.type === "department" || field.type === "facility" ? (
                        <InlineSelect name={field.key} className="admin-input !py-1.5 !px-3 text-xs sm:text-sm" value={values[field.key] ?? ""} onChange={(event) => {
                          const value = event.currentTarget.value;
                          setValues((current) => ({ ...current, [field.key]: value }));
                        }}>
                          <option value="">Chưa phân công</option>
                          {(field.type === "department" ? departments : facilities).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </InlineSelect>
                      ) : field.type === "staffRole" ? (
                        <InlineSelect name={field.key} className="admin-input !py-1.5 !px-3 text-xs sm:text-sm" value={values[field.key] ?? "CustomerService"} onChange={(event) => {
                          const role = event.currentTarget.value;
                          setValues((current) => ({
                            ...current,
                            staffRole: role,
                          }));
                        }}>
                          <option value="CustomerService">Chăm sóc khách hàng (Customer Service)</option>
                          <option value="Driver">Tài xế (Driver)</option>
                          <option value="Maintenance">Kỹ thuật viên (Maintenance)</option>
                        </InlineSelect>
                      ) : (
                        <InlineInput name={field.key} type={field.type ?? "text"} required={field.required} value={values[field.key] ?? ""} onChange={(event) => {
                          const value = event.currentTarget.value;
                          setValues((current) => ({ ...current, [field.key]: value }));
                        }} className="admin-input !py-1.5 !px-3 text-xs sm:text-sm" />
                      )}
                    </label>
                  </div>
                ))}
              </div>
              {directory === "facilities" && <div className="mt-4 space-y-3">
                <button type="button" disabled={!mapAddress && !values.address?.trim()} onClick={() => setMapAddress((current) => current ? null : values.address?.trim() || null)} className="rounded border border-td-rule bg-transparent px-4 py-2 text-sm font-semibold text-td-ink hover:bg-td-chalk disabled:opacity-60">{mapAddress ? "Ẩn bản đồ" : "Xem địa chỉ trên bản đồ"}</button>
                {mapAddress && <><p className="text-xs text-td-muted">Đang xem: {mapAddress}</p><MapboxMap title="Vị trí cơ sở" location={mapAddress} /></>}
              </div>}
              {error && <p role="alert" className="mt-2.5 whitespace-pre-line text-xs font-medium text-danger bg-danger/10 p-2 rounded border border-danger/20">{error}</p>}
              <FormDialogFooter>
                <button type="button" disabled={saving} onClick={() => setFormOpen(false)} className="rounded border border-td-rule px-4 py-2 text-sm font-semibold text-td-ink hover:bg-td-chalk disabled:opacity-60">Hủy</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded bg-td-oxide px-4 py-2 text-sm font-semibold text-white hover:bg-td-oxide-hover disabled:opacity-60"><Check className="h-4 w-4" />{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
              </FormDialogFooter>
            </ValidatedForm>
        </FormDialog>
      )}
    </div>
  );
}

function toOrganizationRow(item: OrganizationUnitDto): Row {
  return { id: item.id, name: item.name ?? "", description: item.address ?? "", detail: "", active: true };
}

function toStaffRow(staff: StaffDto): Row {
  return {
    id: staff.id,
    name: staff.fullName?.trim() || staff.email?.trim() || "Chưa có tên nhân viên",
    description: [staff.staffRole, staff.departmentName].filter(Boolean).join(" · "),
    detail: staff.facilityName ?? "Chưa phân công",
    active: staff.isActive,
    source: staff,
  };
}

const roleDescriptions: Record<string, string> = {
  Admin: "Quản trị viên toàn quyền hệ thống",
  Manager: "Quản lý đội xe, lịch trình và vận hành",
  CustomerService: "Chăm sóc khách hàng, duyệt GPLX và đối soát",
  Driver: "Tài xế vận hành các chuyến xe được giao",
  Maintenance: "Kỹ thuật viên kiểm định và bảo dưỡng xe",
  Staff: "Vai trò cơ sở cho nhân sự nội bộ",
  Customer: "Khách hàng sử dụng dịch vụ thuê xe",
};

function toRoleRow(role: RoleDto): Row {
  return {
    id: role.id,
    name: role.name,
    description: roleDescriptions[role.name] ?? (role.isSystem ? "" : "Vai trò tuỳ chỉnh"),
    detail: `${role.userCount} tài khoản`,
    // Danh mục vai trò không có trạng thái riêng; vai trò tồn tại nghĩa là đang dùng.
    active: true,
  };
}
