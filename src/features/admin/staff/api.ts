import { backendApiClient } from "@/api/backend-api-client";
import { getDepartments as fetchDepartments, getFacilities as fetchFacilities, getStaff, getStaffById as getStaffRecord, type PagedResult, type StaffDto } from "@/features/admin/api";
import { getLicenseState } from "./license-utils";
import type { AssignableDriver, AssignDriverInput, CreateStaffInput, DriverScheduleItem, StaffDetail, StaffFilterParams, StaffPageResult, UpdateLicenseInput, UpdateStaffInput } from "./types";

export async function getDepartments() {
  return (await fetchDepartments()).map((unit) => ({ id: unit.id, name: unit.name ?? "" }));
}
export async function getFacilities() {
  return (await fetchFacilities()).map((unit) => ({ id: unit.id, name: unit.name ?? "", address: unit.address ?? undefined }));
}

export function mapStaff(record: StaffDto): StaffDetail {
  return {
    id: record.id, userId: record.userId, fullName: record.fullName ?? "", email: record.email ?? "",
    phone: record.phone, isActive: record.isActive, isDriver: record.isDriver, rating: record.rating,
    department: record.departmentId ? { id: record.departmentId, name: record.departmentName ?? "" } : null,
    facility: record.facilityId ? { id: record.facilityId, name: record.facilityName ?? "" } : null,
    hiredDate: record.hiredDate ?? undefined,
    roles: record.staffRole ? [record.staffRole] : [],
    license: {
      number: record.licenseNumber ?? undefined, type: record.licenseType ?? undefined,
      issueDate: record.licenseIssueDate ?? undefined, expiryDate: record.licenseExpiryDate ?? undefined,
      imgUrl: record.licenseImageUrl ?? undefined,
    },
  };
}

export async function fetchAllStaff(): Promise<StaffDetail[]> {
  const items: StaffDetail[] = [];
  let page = 1;
  while (true) {
    const result = await getStaff({ page, pageSize: 100 });
    if (!result || !Array.isArray(result.items)) throw new Error("Dữ liệu nhân viên không hợp lệ. Vui lòng thử lại.");
    items.push(...result.items.map(mapStaff));
    if (items.length >= result.totalCount) return items;
    if (!result.items.length) throw new Error("Chưa tải đủ danh sách nhân viên. Vui lòng thử lại.");
    page++;
  }
}

export async function getStaffList(params: StaffFilterParams = {}): Promise<StaffPageResult> {
  let filtered = await fetchAllStaff();
  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter((s) => [s.fullName, s.email, s.phone, s.license?.number].some((value) => value?.toLowerCase().includes(q)));
  }
  if (params.departmentId && params.departmentId !== "all") filtered = filtered.filter((s) => s.department?.id === Number(params.departmentId));
  if (params.facilityId && params.facilityId !== "all") filtered = filtered.filter((s) => s.facility?.id === Number(params.facilityId));
  if (params.isDriver && params.isDriver !== "all") filtered = filtered.filter((s) => s.isDriver === (params.isDriver === "driver"));
  if (params.isActive && params.isActive !== "all") filtered = filtered.filter((s) => s.isActive === (params.isActive === "active"));
  if (params.licenseStatus && params.licenseStatus !== "all") filtered = filtered.filter((s) => getLicenseState(s.license?.expiryDate).state === params.licenseStatus);
  const sortBy = params.sortBy ?? "hiredDate";
  filtered.sort((a, b) => {
    const comparison = sortBy === "rating" ? (a.rating ?? -1) - (b.rating ?? -1)
      : String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? ""), "vi");
    return params.sortOrder === "asc" ? comparison : -comparison;
  });
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), totalCount: filtered.length, page, pageSize };
}

export async function getStaffById(id: number): Promise<StaffDetail> {
  return mapStaff(await getStaffRecord(id));
}

export async function createStaff(input: CreateStaffInput): Promise<StaffDetail> {
  // Membership PUTs link an existing account; retries are idempotent if a later step fails.
  await backendApiClient.put(`departments/${input.departmentId}/members/${input.userId}`, {});
  const current = await backendApiClient.put<StaffDto>(`facilities/${input.facilityId}/members/${input.userId}`, {});
  return mapStaff(await backendApiClient.put<StaffDto>(`staff/${current.id}`, {
    ...updateBody(current), hiredDate: input.hiredDate, isDriver: input.isDriver,
    staffRole: input.isDriver ? "Driver" : current.staffRole === "Driver" ? null : current.staffRole,
    ...(input.license ? {
      licenseNumber: input.license.number ?? null, licenseType: input.license.type ?? null,
      licenseIssueDate: input.license.issueDate || null, licenseExpiryDate: input.license.expiryDate || null,
      licenseImageUrl: input.license.imgUrl || null,
    } : {}),
  }));
}

// PUT replaces the staff profile: retain every field not edited by this form.
function updateBody(record: StaffDto) {
  return {
    fullName: record.fullName, phone: record.phone, departmentId: record.departmentId,
    facilityId: record.facilityId, hiredDate: record.hiredDate, isDriver: record.isDriver,
    licenseNumber: record.licenseNumber, licenseType: record.licenseType,
    licenseIssueDate: record.licenseIssueDate, licenseExpiryDate: record.licenseExpiryDate,
    licenseImageUrl: record.licenseImageUrl, staffRole: record.staffRole,
  };
}

export async function updateStaff(input: UpdateStaffInput): Promise<StaffDetail> {
  const current = await getStaffRecord(input.staffId);
  return mapStaff(await backendApiClient.put<StaffDto>(`staff/${input.staffId}`, {
    ...updateBody(current),
    departmentId: input.departmentId ?? current.departmentId,
    facilityId: input.facilityId ?? current.facilityId,
    isDriver: input.isDriver ?? current.isDriver,
    staffRole: input.isDriver === true ? "Driver" : input.isDriver === false && current.staffRole === "Driver" ? null : current.staffRole,
  }));
}

export async function updateStaffLicense(input: UpdateLicenseInput): Promise<StaffDetail> {
  const current = await getStaffRecord(input.staffId);
  return mapStaff(await backendApiClient.put<StaffDto>(`staff/${input.staffId}`, {
    ...updateBody(current), licenseNumber: input.license.number ?? null, licenseType: input.license.type ?? null,
    licenseIssueDate: input.license.issueDate || null, licenseExpiryDate: input.license.expiryDate || null,
    licenseImageUrl: input.license.imgUrl || null,
  }));
}

export async function getDriverSchedules(params: { from?: string; to?: string; driverStaffId?: number; facilityId?: number } = {}): Promise<DriverScheduleItem[]> {
  type ScheduleEntry = { assignmentId: number; rentalId: number; vehicleId: number; driverStaffId: number; driverName?: string; startTime: string; endTime: string };
  const entries: ScheduleEntry[] = [];
  let page = 1;
  while (true) {
    const result = await backendApiClient.get<PagedResult<ScheduleEntry> | ScheduleEntry[]>("drivers/schedule", {
      from: params.from, to: params.to, driverStaffId: params.driverStaffId, page, pageSize: 100,
    });
    if (Array.isArray(result)) {
      entries.push(...result);
      break;
    }
    if (!result || !Array.isArray(result.items) || result.page !== page || !Number.isSafeInteger(result.totalCount) || result.totalCount < 0) {
      throw new Error("Dữ liệu lịch trình không hợp lệ. Vui lòng thử lại.");
    }
    entries.push(...result.items);
    if (entries.length >= result.totalCount) break;
    if (!result.items.length) throw new Error("Chưa tải đủ lịch trình tài xế. Vui lòng thử lại.");
    page++;
  }
  let items: DriverScheduleItem[] = entries.map((entry) => ({ ...entry, start: entry.startTime, end: entry.endTime, status: "assigned" }));
  if (params.facilityId) {
    const staff = await fetchAllStaff();
    const ids = new Set(staff.filter((s) => s.facility?.id === params.facilityId).map((s) => s.id));
    items = items.filter((entry) => ids.has(entry.driverStaffId));
  }
  return items;
}

export function getAssignableDrivers(rentalId: number): Promise<AssignableDriver[]> {
  return backendApiClient.get<AssignableDriver[]>(`rentals/${rentalId}/assignable-drivers`, { eligibleOnly: false });
}

export async function assignDriverToRental(input: AssignDriverInput): Promise<void> {
  await backendApiClient.post(`rentals/${input.rentalId}/assignments/driver`, {
    driverStaffId: input.driverStaffId, reason: input.reason, note: input.notes,
  });
}

export async function uploadLicenseImage(file: File): Promise<{ url: string }> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WebP. Vui lòng chọn lại ảnh.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Ảnh GPLX phải nhỏ hơn hoặc bằng 5 MB. Vui lòng chọn ảnh nhỏ hơn.");
  const body = new FormData();
  body.append("file", file);
  const result = await backendApiClient.post<{ secureUrl: string | null }>("media/staff-license", body);
  if (!result?.secureUrl || !/^https?:\/\//i.test(result.secureUrl)) throw new Error("Máy chủ chưa trả URL ảnh hợp lệ. Vui lòng thử tải lại.");
  return { url: result.secureUrl };
}
