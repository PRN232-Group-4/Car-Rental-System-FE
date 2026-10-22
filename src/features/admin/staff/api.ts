import { backendApiClient } from "@/api/backend-api-client";
import type { StaffDto, PagedResult, OrganizationUnitDto } from "@/features/admin/api";
import { getFacilities as getRealFacilities } from "@/features/admin/api";
import { hasDriverRole } from "./account-options";
import { getLicenseState } from "./license-utils";
import type {
  StaffDetail,
  StaffFilterParams,
  StaffPageResult,
  DriverScheduleItem,
  AssignableDriver,
  AssignDriverInput,
  CreateStaffInput,
  UpdateStaffInput,
  UpdateLicenseInput,
  StaffDepartment,
  StaffFacility,
} from "./types";

export async function getStaffList(
  params: StaffFilterParams = {}
): Promise<StaffPageResult> {
  let filtered = await fetchAllStaff();

  // 1. Tìm kiếm
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.license?.number && s.license.number.includes(q))
    );
  }

  // 2. Lọc phòng ban
  if (params.departmentId && params.departmentId !== "all") {
    const depId = parseInt(params.departmentId, 10);
    filtered = filtered.filter((s) => s.department?.id === depId);
  }

  // 3. Lọc chi nhánh / cơ sở
  if (params.facilityId && params.facilityId !== "all") {
    const facId = parseInt(params.facilityId, 10);
    filtered = filtered.filter((s) => s.facility?.id === facId);
  }

  // 4. Lọc cờ tài xế
  if (params.isDriver && params.isDriver !== "all") {
    if (params.isDriver === "driver") {
      filtered = filtered.filter((s) => s.isDriver);
    } else if (params.isDriver === "staff") {
      filtered = filtered.filter((s) => !s.isDriver);
    }
  }

  // 5. Lọc trạng thái hoạt động
  if (params.isActive && params.isActive !== "all") {
    const shouldBeActive = params.isActive === "active";
    filtered = filtered.filter((s) => s.isActive === shouldBeActive);
  }

  // 6. Lọc trạng thái giấy phép
  if (params.licenseStatus && params.licenseStatus !== "all") {
    filtered = filtered.filter((s) => {
      const calc = getLicenseState(s.license?.expiryDate);
      return calc.state === params.licenseStatus;
    });
  }

  // 7. Sắp xếp
  const sortBy = params.sortBy || "id";
  const sortOrder = params.sortOrder || "desc";
  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "id") {
      cmp = a.id - b.id;
    } else if (sortBy === "hiredDate") {
      cmp = new Date(a.hiredDate || 0).getTime() - new Date(b.hiredDate || 0).getTime();
    } else if (sortBy === "fullName") {
      cmp = a.fullName.localeCompare(b.fullName, "vi");
    } else if (sortBy === "rating") {
      cmp = (a.rating || 0) - (b.rating || 0);
    } else if (sortBy === "email") {
      cmp = a.email.localeCompare(b.email);
    }
    return (sortOrder === "asc" ? cmp : -cmp) || b.id - a.id;
  });

  const totalCount = filtered.length;
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, params.pageSize || 10);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    page,
    pageSize,
    totalCount,
  };
}

/**
 * Lấy chi tiết hồ sơ nhân viên
 */
type BackendStaff = StaffDto & { roles?: string[]; avatarUrl?: string | null; gender?: string | null; address?: string | null; totalTrips?: number; activeTripId?: number | null };

export function mapStaff(staff: BackendStaff): StaffDetail {
  const roles = staff.roles ?? (staff.staffRole ? [staff.staffRole] : []);
  return {
    id: staff.id, userId: staff.userId, email: staff.email ?? "", fullName: staff.fullName ?? "", phone: staff.phone,
    avatarUrl: staff.avatarUrl, roles, isDriver: staff.roles ? hasDriverRole(staff.roles) : hasDriverRole(roles) || staff.isDriver, isActive: staff.isActive,
    department: staff.departmentId == null ? null : { id: staff.departmentId, name: staff.departmentName ?? "Chưa phân bổ" },
    facility: staff.facilityId == null ? null : { id: staff.facilityId, name: staff.facilityName ?? "Chưa phân bổ" },
    hiredDate: staff.hiredDate ?? undefined, gender: staff.gender, address: staff.address, rating: staff.rating,
    totalTrips: staff.totalTrips, activeTripId: staff.activeTripId,
    license: !staff.licenseNumber && !staff.licenseType && !staff.licenseImageUrl ? null : {
      number: staff.licenseNumber ?? undefined, type: staff.licenseType ?? undefined,
      issueDate: staff.licenseIssueDate ?? undefined, expiryDate: staff.licenseExpiryDate ?? undefined,
      imgUrl: staff.licenseImageUrl ?? undefined,
    },
  };
}

export async function getStaffDepartments(): Promise<StaffDepartment[]> {
  const all: OrganizationUnitDto[] = [];
  for (let page = 1; ; page += 1) {
    const result = await backendApiClient.get<PagedResult<OrganizationUnitDto> | OrganizationUnitDto[]>("departments", { page, pageSize: 100 });
    if (Array.isArray(result)) return result.map((d) => ({ id: d.id, name: d.name ?? "" }));
    const items = result.items ?? [];
    all.push(...items);
    if (!items.length || all.length >= result.totalCount) return all.map((d) => ({ id: d.id, name: d.name ?? "" }));
  }
}

export async function getStaffFacilities(): Promise<StaffFacility[]> {
  return (await getRealFacilities()).map((f) => ({ id: f.id, name: f.name ?? "", address: f.address ?? undefined }));
}

export async function getStaffById(id: number): Promise<StaffDetail> {
  return mapStaff(await backendApiClient.get<BackendStaff>(`staff/${id}`));
}

export async function createStaff(input: CreateStaffInput): Promise<StaffDetail> {
  return mapStaff(await backendApiClient.post<BackendStaff>("staff/from-user", {
    userId: input.userId, departmentId: input.departmentId, facilityId: input.facilityId, hiredDate: input.hiredDate,
    licenseNumber: input.license?.number ?? null, licenseType: input.license?.type ?? null,
    licenseIssueDate: input.license?.issueDate || null, licenseExpiryDate: input.license?.expiryDate || null,
    licenseImageUrl: input.license?.imgUrl || null,
  }));
}

async function saveStaff(input: UpdateStaffInput, license?: UpdateLicenseInput["license"]): Promise<StaffDetail> {
  const current = await backendApiClient.get<BackendStaff>(`staff/${input.staffId}`);
  const isDriver = current.roles ? hasDriverRole(current.roles) : current.staffRole?.toLowerCase() === "driver" || current.isDriver;
  const staffRole = isDriver ? "Driver" : ["Maintenance", "CustomerService"].includes(current.staffRole ?? "") ? current.staffRole : null;
  return mapStaff(await backendApiClient.put<BackendStaff>(`staff/${input.staffId}`, {
    fullName: current.fullName, phone: current.phone,
    departmentId: input.departmentId ?? current.departmentId, facilityId: input.facilityId ?? current.facilityId,
    hiredDate: current.hiredDate, isDriver,
    licenseNumber: license ? license.number || null : current.licenseNumber,
    licenseType: license ? license.type || null : current.licenseType,
    licenseIssueDate: license ? license.issueDate || null : current.licenseIssueDate,
    licenseExpiryDate: license ? license.expiryDate || null : current.licenseExpiryDate,
    licenseImageUrl: license ? license.imgUrl || null : current.licenseImageUrl,
    staffRole, avatarUrl: current.avatarUrl, gender: current.gender, address: current.address,
  }));
}

export function updateStaff(input: UpdateStaffInput): Promise<StaffDetail> {
  return saveStaff(input);
}

export function updateStaffLicense(input: UpdateLicenseInput): Promise<StaffDetail> {
  return saveStaff({ staffId: input.staffId }, input.license);
}

/**
 * Lấy lịch trình tài xế theo khoảng thời gian
 */
export async function getDriverSchedules(params: { from?: string; to?: string; driverStaffId?: number; facilityId?: number } = {}): Promise<DriverScheduleItem[]> {
  type ScheduleEntry = { assignmentId: number; rentalId: number; vehicleId: number; driverStaffId: number; driverName?: string; startTime: string; endTime: string };
  const entries: ScheduleEntry[] = [];
  for (let page = 1; ; page++) {
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

export async function fetchAllStaff(): Promise<StaffDetail[]> {
  const records: StaffDetail[] = [];
  for (let page = 1; ; page += 1) {
    const result = await backendApiClient.get<PagedResult<BackendStaff>>("staff", { page, pageSize: 100 });
    if (!result || !Array.isArray(result.items)) throw new Error("Dữ liệu nhân viên không hợp lệ. Vui lòng thử lại.");
    records.push(...result.items.map(mapStaff));
    if (records.length >= result.totalCount) return records;
    if (!result.items.length) throw new Error("Chưa tải đủ danh sách nhân viên. Vui lòng thử lại.");
  }
}

export { getStaffDepartments as getDepartments, getStaffFacilities as getFacilities };
