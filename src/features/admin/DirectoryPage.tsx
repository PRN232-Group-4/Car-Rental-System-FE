"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Building2, Check, ChevronLeft, ChevronRight, KeyRound, Pencil, Plus, Search, Trash2, UsersRound } from "lucide-react";
import {
  createDepartment,
  createFacility,
  createStaff,
  deleteDepartment,
  deleteFacility,
  deleteStaff,
  getDepartments,
  getFacilities,
  getStaff,
  updateDepartment,
  updateFacility,
  updateStaff,
} from "./api";
import type { OrganizationUnitDto, StaffDto } from "./api";

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

const pageInfo: Record<Directory, { title: string; description: string; firstColumn: string; secondColumn: string; thirdColumn: string; icon: typeof Building2 }> = {
  departments: { title: "Departments", description: "Danh sách phòng ban trong tổ chức.", firstColumn: "Phòng ban", secondColumn: "Tên phòng ban", thirdColumn: "Mã", icon: Building2 },
  facilities: { title: "Facilities", description: "Danh sách chi nhánh và địa chỉ.", firstColumn: "Chi nhánh", secondColumn: "Địa chỉ", thirdColumn: "Mã", icon: Building2 },
  staffs: { title: "Staffs", description: "Nhân viên, vai trò và phân công chi nhánh.", firstColumn: "Nhân viên", secondColumn: "Vai trò / Phòng ban", thirdColumn: "Chi nhánh", icon: UsersRound },
  roles: { title: "Role", description: "Các vai trò hiện được gán cho nhân viên.", firstColumn: "Vai trò", secondColumn: "Nguồn", thirdColumn: "Số nhân viên", icon: KeyRound },
};

export default function DirectoryPage({ directory }: { directory: Directory }) {
  const info = pageInfo[directory];
  const Icon = info.icon;
  const [rows, setRows] = useState<Row[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [departments, setDepartments] = useState<OrganizationUnitDto[]>([]);
  const [facilities, setFacilities] = useState<OrganizationUnitDto[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Row | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      if (directory === "departments") {
        const departmentData = await getDepartments();
        setRows(departmentData.map((item) => toOrganizationRow(item, false)));
        setTotalCount(departmentData.length);
      } else if (directory === "facilities") {
        const facilityData = await getFacilities();
        setRows(facilityData.map((item) => toOrganizationRow(item, true)));
        setTotalCount(facilityData.length);
      } else if (directory === "staffs") {
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
        const firstPage = await getStaff({ page: 1, pageSize: 100 });
        const staffList = [...(firstPage.items ?? [])];
        const extraPages = Math.ceil(firstPage.totalCount / 100) - 1;
        if (extraPages > 0) {
          const additional = await Promise.all(
            Array.from({ length: extraPages }, (_, index) =>
              getStaff({ page: index + 2, pageSize: 100 }),
            ),
          );
          for (const staffPage of additional) staffList.push(...(staffPage.items ?? []));
        }
        const grouped = new Map<string, StaffDto[]>();
        for (const staff of staffList) {
          const role = staff.staffRole?.trim();
          if (!role) continue;
          grouped.set(role, [...(grouped.get(role) ?? []), staff]);
        }
        const roleRows = Array.from(grouped, ([role, members]) => ({
          id: members[0].id,
          name: role,
          description: "Lấy từ staffRole của nhân viên",
          detail: `${members.length} tài khoản`,
          active: members.some((member) => member.isActive),
        }));
        setRows(roleRows);
        setTotalCount(roleRows.length);
      }
    } catch (loadError) {
      setError(messageOf(loadError, `Không thể tải ${info.title.toLocaleLowerCase()}.`));
    } finally {
      setLoading(false);
    }
  }, [directory, info.title, page, pageSize, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  const openForm = (row?: Row) => {
    setEditing(row ?? null);
    if (directory === "departments") setValues({ name: row?.name ?? "" });
    else if (directory === "facilities") setValues({ name: row?.name ?? "", address: row?.description ?? "" });
    else if (directory === "staffs") {
      const staff = row?.source;
      setValues({
        email: staff?.email ?? "",
        fullName: staff?.fullName ?? "",
        password: "",
        phone: staff?.phone ?? "",
        departmentId: staff?.departmentId ? String(staff.departmentId) : "",
        facilityId: staff?.facilityId ? String(staff.facilityId) : "",
        hiredDate: staff?.hiredDate?.slice(0, 10) ?? "",
        staffRole: staff?.staffRole ?? "",
        isDriver: staff?.isDriver ? "true" : "false",
        licenseNumber: staff?.licenseNumber ?? "",
      });
    }
    setError("");
    setFormOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (directory === "departments") {
        if (editing) await updateDepartment(editing.id, values.name.trim());
        else await createDepartment(values.name.trim());
      } else if (directory === "facilities") {
        const body = { name: values.name.trim(), address: values.address.trim() };
        if (editing) await updateFacility(editing.id, body);
        else await createFacility(body);
      } else if (directory === "staffs") {
        const existingStaff = editing?.source;
        const common = {
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
          departmentId: values.departmentId ? Number(values.departmentId) : null,
          facilityId: values.facilityId ? Number(values.facilityId) : null,
          hiredDate: values.hiredDate || null,
          isDriver: values.isDriver === "true",
          licenseNumber: values.licenseNumber.trim() || null,
          licenseType: existingStaff?.licenseType ?? null,
          licenseIssueDate: existingStaff?.licenseIssueDate ?? null,
          licenseExpiryDate: existingStaff?.licenseExpiryDate ?? null,
          licenseImageUrl: existingStaff?.licenseImageUrl ?? null,
          staffRole: values.staffRole.trim(),
        };
        if (editing) await updateStaff(editing.id, common);
        else await createStaff({
          ...common,
          email: values.email.trim(),
          password: values.password,
        });
      }
      setFormOpen(false);
      await load();
    } catch (submitError) {
      setError(messageOf(submitError, "Không thể lưu thay đổi."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Xóa "${row.name}"?`)) return;
    setError("");
    try {
      if (directory === "departments") await deleteDepartment(row.id);
      else if (directory === "facilities") await deleteFacility(row.id);
      else if (directory === "staffs") await deleteStaff(row.id);
      await load();
    } catch (deleteError) {
      setError(messageOf(deleteError, "Không thể xóa mục này."));
    }
  };

  const fields = directory === "departments"
    ? [{ key: "name", label: "Tên phòng ban", required: true }]
    : directory === "facilities"
      ? [{ key: "name", label: "Tên chi nhánh", required: true }, { key: "address", label: "Địa chỉ", required: true }]
      : [
          { key: "fullName", label: "Họ và tên", required: true },
          ...(!editing ? [{ key: "email", label: "Email", type: "email", required: true }] : []),
          ...(!editing ? [{ key: "password", label: "Mật khẩu khởi tạo", type: "password", required: true }] : []),
          { key: "phone", label: "Số điện thoại", required: true },
          { key: "staffRole", label: "Vai trò", required: true },
          { key: "hiredDate", label: "Ngày nhận việc", type: "date" },
          { key: "departmentId", label: "Phòng ban", type: "department" },
          { key: "facilityId", label: "Chi nhánh", type: "facility" },
          { key: "isDriver", label: "Tài khoản tài xế", type: "boolean" },
          ...(values.isDriver === "true" ? [{ key: "licenseNumber", label: "Số giấy phép lái xe" }] : []),
        ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><Icon className="h-6 w-6" /></span>
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Quản trị hệ thống</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{info.title}</h2></div>
        </div>
        {directory !== "roles" && <button type="button" onClick={() => openForm()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"><Plus className="h-4 w-4" /> Thêm mới</button>}
      </div>
      <p className="text-sm text-slate-500">{info.description}</p>
      {directory === "roles" && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Swagger chưa có API quản lý danh mục vai trò; danh sách được tổng hợp từ vai trò đang gán cho nhân viên.</p>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Danh sách {info.title.toLocaleLowerCase()}</h3><p className="mt-1 text-xs text-slate-400">{loading ? "Đang tải..." : `${rows.length} mục`}</p></div>
        {directory === "staffs" && <div className="border-b border-slate-100 p-4"><label className="relative block max-w-lg"><span className="sr-only">Tìm nhân viên</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.currentTarget.value); setPage(1); }} placeholder="Tìm theo tên hoặc email..." className="admin-input admin-search-input" /></label></div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">{info.firstColumn}</th><th className="px-5 py-3">{info.secondColumn}</th><th className="px-5 py-3">{info.thirdColumn}</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="text-sm">
                  <td className="px-5 py-4 font-semibold text-slate-800">{row.name}</td><td className="px-5 py-4 text-slate-600">{row.description || "—"}</td><td className="px-5 py-4 text-slate-600">{row.detail || "—"}</td>
                  <td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${row.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{row.active ? "Đang hoạt động" : "Tạm ngưng"}</span></td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-1">{directory !== "roles" && <><button type="button" onClick={() => openForm(row)} aria-label={`Sửa ${row.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void remove(row)} aria-label={`Xóa ${row.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></>}</div></td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">Không có dữ liệu.</td></tr>}
            </tbody>
          </table>
        </div>
        {directory === "staffs" && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Trang {page} / {pageCount} · {totalCount} nhân viên</span>
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.currentTarget.value)); setPage(1); }} aria-label="Số nhân viên mỗi trang" className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                {[10, 20, 50].map((size) => <option key={size} value={size}>{size} mỗi trang</option>)}
              </select>
            </div>
            <nav aria-label="Phân trang nhân viên" className="flex items-center gap-2">
              <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Trang trước" className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" disabled={page >= pageCount || loading} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Trang sau" className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </nav>
          </div>
        )}
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="directory-dialog-title" className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <h3 id="directory-dialog-title" className="border-b border-slate-100 px-5 py-4 font-bold text-slate-900">{editing ? "Chỉnh sửa" : "Thêm mới"} · {info.title}</h3>
            <form onSubmit={submit} className="space-y-4 p-5">
              {fields.map((field) => (
                <label key={field.key} className="block text-sm font-semibold text-slate-700">
                  <span className="mb-2 block">{field.label}</span>
                  {field.type === "department" || field.type === "facility" ? (
                    <select className="admin-input" value={values[field.key] ?? ""} onChange={(event) => {
                      const value = event.currentTarget.value;
                      setValues((current) => ({ ...current, [field.key]: value }));
                    }}>
                      <option value="">Chưa phân công</option>
                      {(field.type === "department" ? departments : facilities).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  ) : field.type === "boolean" ? (
                    <select className="admin-input" value={values[field.key] ?? "false"} onChange={(event) => {
                      const value = event.currentTarget.value;
                      setValues((current) => ({ ...current, [field.key]: value }));
                    }}><option value="false">Không</option><option value="true">Có</option></select>
                  ) : (
                    <input type={field.type ?? "text"} required={field.required} value={values[field.key] ?? ""} onChange={(event) => {
                      const value = event.currentTarget.value;
                      setValues((current) => ({ ...current, [field.key]: value }));
                    }} className="admin-input" />
                  )}
                </label>
              ))}
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Hủy</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Check className="h-4 w-4" />{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function toOrganizationRow(item: OrganizationUnitDto, facility: boolean): Row {
  return { id: item.id, name: item.name ?? "", description: facility ? item.address ?? "" : item.name ?? "", detail: `#${item.id}`, active: true };
}

function toStaffRow(staff: StaffDto): Row {
  return {
    id: staff.id,
    name: staff.fullName ?? staff.email ?? `Staff #${staff.id}`,
    description: [staff.staffRole, staff.departmentName].filter(Boolean).join(" · "),
    detail: staff.facilityName ?? "Chưa phân công",
    active: staff.isActive,
    source: staff,
  };
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
