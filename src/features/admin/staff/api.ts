import { ApiProblemError } from "@/api/api-client";
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

function createProblem(
  status: number,
  title: string,
  detail: string,
  code?: string
): ApiProblemError {
  return new ApiProblemError(status, title, { title, detail, code });
}

export const MOCK_DEPARTMENTS: StaffDepartment[] = [
  { id: 1, name: "Ban Giám Đốc" },
  { id: 2, name: "Phòng Vận Hành & Điều Phối" },
  { id: 3, name: "Đội Tài Xế Chuyên Nghiệp" },
  { id: 4, name: "Phòng Kỹ Thuật & Bảo Trì" },
  { id: 5, name: "Bộ Phận Chăm Sóc Khách Hàng" },
];

export const MOCK_FACILITIES: StaffFacility[] = [
  { id: 1, name: "Trụ sở Quận 1, TP.HCM", address: "123 Lê Duẩn, P. Bến Nghé, Q.1" },
  { id: 2, name: "Trạm Tân Bình (Sân Bay)", address: "45 Trường Sơn, P.2, Q. Tân Bình" },
  { id: 3, name: "Chi nhánh Hoàn Kiếm, Hà Nội", address: "88 Lý Thường Kiệt, Q. Hoàn Kiếm" },
  { id: 4, name: "Trạm Đà Nẵng Hải Châu", address: "12 Bạch Đằng, Q. Hải Châu, Đà Nẵng" },
];

// Mock database staff
const MOCK_STAFFS_DB: StaffDetail[] = [
  {
    id: 1,
    userId: 1,
    fullName: "Nguyễn Văn Quản Trị",
    email: "admin@thongdong.vn",
    phone: "0901234567",
    avatarUrl: "",
    department: MOCK_DEPARTMENTS[0],
    facility: MOCK_FACILITIES[0],
    isDriver: false,
    isActive: true,
    rating: null,
    roles: ["Admin"],
    hiredDate: "2024-01-15",
    gender: "Nam",
    address: "Quận 1, TP.HCM",
    license: null,
    totalTrips: 0,
  },
  {
    id: 2,
    userId: 2,
    fullName: "Trần Thị Quản Lý",
    email: "manager.hcm@thongdong.vn",
    phone: "0902345678",
    avatarUrl: "",
    department: MOCK_DEPARTMENTS[1],
    facility: MOCK_FACILITIES[0],
    isDriver: false,
    isActive: true,
    rating: null,
    roles: ["Manager"],
    hiredDate: "2024-03-01",
    gender: "Nữ",
    address: "Bình Thạnh, TP.HCM",
    license: null,
    totalTrips: 0,
  },
  {
    id: 3,
    userId: 3,
    fullName: "Lê Văn Điều Phối",
    email: "staff.dispatch@thongdong.vn",
    phone: "0903456789",
    avatarUrl: "",
    department: MOCK_DEPARTMENTS[1],
    facility: MOCK_FACILITIES[1],
    isDriver: false,
    isActive: true,
    rating: null,
    roles: ["Staff"],
    hiredDate: "2024-06-15",
    gender: "Nam",
    address: "Tân Bình, TP.HCM",
    license: null,
    totalTrips: 0,
  },
  {
    id: 4,
    userId: 4,
    fullName: "Phạm Hùng Cường (Tài xế VIP)",
    email: "driver.cuong@thongdong.vn",
    phone: "0904567890",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    department: MOCK_DEPARTMENTS[2],
    facility: MOCK_FACILITIES[0],
    isDriver: true,
    isActive: true,
    rating: 4.95,
    roles: ["Driver"],
    hiredDate: "2025-01-10",
    gender: "Nam",
    address: "Quận 7, TP.HCM",
    license: {
      number: "790123456789",
      type: "D",
      issueDate: "2020-05-10",
      expiryDate: "2029-05-10", // Còn hạn dài
      imgUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
    },
    totalTrips: 248,
    activeTripId: 101,
  },
  {
    id: 5,
    userId: 5,
    fullName: "Võ Thành Nam (Tài xế Sắp hết hạn)",
    email: "driver.nam@thongdong.vn",
    phone: "0905678901",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    department: MOCK_DEPARTMENTS[2],
    facility: MOCK_FACILITIES[1],
    isDriver: true,
    isActive: true,
    rating: 4.82,
    roles: ["Driver"],
    hiredDate: "2025-02-20",
    gender: "Nam",
    address: "Gò Vấp, TP.HCM",
    license: {
      number: "790987654321",
      type: "B2",
      issueDate: "2021-11-05",
      expiryDate: "2026-11-05", // Sắp hết hạn trong ~19 ngày tính từ 2026-10-17
      imgUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
    },
    totalTrips: 115,
  },
  {
    id: 6,
    userId: 8,
    fullName: "Đỗ Minh Quân (Tài xế Đã hết hạn)",
    email: "driver.quan@thongdong.vn",
    phone: "0906789012",
    avatarUrl: "",
    department: MOCK_DEPARTMENTS[2],
    facility: MOCK_FACILITIES[0],
    isDriver: true,
    isActive: true,
    rating: 4.65,
    roles: ["Driver"],
    hiredDate: "2025-04-01",
    gender: "Nam",
    address: "Thủ Đức, TP.HCM",
    license: {
      number: "790555666777",
      type: "B2",
      issueDate: "2021-09-01",
      expiryDate: "2026-09-01", // Đã quá hạn hơn 1 tháng
      imgUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
    },
    totalTrips: 64,
  },
  {
    id: 7,
    userId: 9,
    fullName: "Nguyễn Hải Đăng (Tài xế Tạm dừng)",
    email: "driver.dang@thongdong.vn",
    phone: "0907890123",
    avatarUrl: "",
    department: MOCK_DEPARTMENTS[2],
    facility: MOCK_FACILITIES[2],
    isDriver: true,
    isActive: false, // Bị khóa / ngừng hoạt động
    rating: 4.4,
    roles: ["Driver"],
    hiredDate: "2025-05-15",
    gender: "Nam",
    address: "Đống Đa, Hà Nội",
    license: {
      number: "010333444555",
      type: "C",
      issueDate: "2022-01-10",
      expiryDate: "2028-01-10",
      imgUrl: "",
    },
    totalTrips: 42,
  },
  {
    id: 8,
    userId: 10,
    fullName: "Hoàng Gia Bảo (Nhân viên mới)",
    email: "staff.bao@thongdong.vn",
    phone: "0908901234",
    avatarUrl: "",
    department: MOCK_DEPARTMENTS[3],
    facility: MOCK_FACILITIES[0],
    isDriver: false,
    isActive: true,
    rating: null,
    roles: ["Maintenance"],
    hiredDate: "2026-09-01",
    gender: "Nam",
    address: "Quận 4, TP.HCM",
    license: null,
    totalTrips: 0,
  },
];

// Mock database lịch trình tài xế
const MOCK_SCHEDULES_DB: DriverScheduleItem[] = [
  {
    assignmentId: 201,
    rentalId: 101,
    driverStaffId: 4, // Phạm Hùng Cường
    driverName: "Phạm Hùng Cường (Tài xế VIP)",
    vehicleId: 1,
    vehicleName: "VF 9 Plus Đẳng Cấp",
    licensePlate: "51K-999.88",
    start: "2026-10-18T08:00:00Z",
    end: "2026-10-18T18:00:00Z",
    bufferMinutes: 60,
    status: "assigned",
    note: "Đón khách tại Sân bay Tân Sơn Nhất đi Vũng Tàu",
  },
  {
    assignmentId: 202,
    rentalId: 102,
    driverStaffId: 4, // Phạm Hùng Cường
    driverName: "Phạm Hùng Cường (Tài xế VIP)",
    vehicleId: 2,
    vehicleName: "VF 8 Eco Sang Trọng",
    licensePlate: "51K-888.66",
    start: "2026-10-19T09:00:00Z",
    end: "2026-10-19T17:00:00Z",
    bufferMinutes: 60,
    status: "assigned",
    note: "Đưa đón đối tác hội nghị Quận 1",
  },
  {
    assignmentId: 203,
    rentalId: 103,
    driverStaffId: 5, // Võ Thành Nam
    driverName: "Võ Thành Nam (Tài xế Sắp hết hạn)",
    vehicleId: 3,
    vehicleName: "VF 7 Plus Thể Thao",
    licensePlate: "51H-777.99",
    start: "2026-10-18T13:00:00Z",
    end: "2026-10-18T21:00:00Z",
    bufferMinutes: 60,
    status: "assigned",
    note: "Chuyến thuê theo giờ nội thành",
  },
];

export function resetMockStaffDb(): void {
  // Reset function phục vụ test
}

/**
 * Lấy danh sách nhân viên có bộ lọc và phân trang
 */
export async function getStaffList(
  params: StaffFilterParams = {}
): Promise<StaffPageResult> {
  await new Promise((r) => setTimeout(r, 80));

  let filtered = [...MOCK_STAFFS_DB];

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
  const sortBy = params.sortBy || "hiredDate";
  const sortOrder = params.sortOrder || "desc";
  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "hiredDate") {
      cmp = new Date(a.hiredDate || 0).getTime() - new Date(b.hiredDate || 0).getTime();
    } else if (sortBy === "fullName") {
      cmp = a.fullName.localeCompare(b.fullName, "vi");
    } else if (sortBy === "rating") {
      cmp = (a.rating || 0) - (b.rating || 0);
    } else if (sortBy === "email") {
      cmp = a.email.localeCompare(b.email);
    }
    return sortOrder === "asc" ? cmp : -cmp;
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
export async function getStaffById(id: number): Promise<StaffDetail | null> {
  await new Promise((r) => setTimeout(r, 60));
  const staff = MOCK_STAFFS_DB.find((s) => s.id === id);
  return staff ? { ...staff } : null;
}

/**
 * Tạo hồ sơ nhân viên mới
 */
export async function createStaff(input: CreateStaffInput): Promise<StaffDetail> {
  await new Promise((r) => setTimeout(r, 120));

  // Kiểm tra user đã có hồ sơ staff chưa
  const existing = MOCK_STAFFS_DB.find((s) => s.userId === input.userId);
  if (existing) {
    throw createProblem(
      409,
      "Hồ sơ nhân viên đã tồn tại",
      `Tài khoản mã #${input.userId} đã được liên kết với hồ sơ nhân viên #${existing.id}.`,
      "STAFF_ALREADY_EXISTS"
    );
  }

  const department = MOCK_DEPARTMENTS.find((d) => d.id === input.departmentId) || null;
  const facility = MOCK_FACILITIES.find((f) => f.id === input.facilityId) || null;

  const newStaff: StaffDetail = {
    id: Math.max(...MOCK_STAFFS_DB.map((s) => s.id), 0) + 1,
    userId: input.userId,
    fullName: `Nhân viên Mới #${input.userId}`,
    email: `staff.user${input.userId}@thongdong.vn`,
    phone: "0912345678",
    avatarUrl: "",
    department,
    facility,
    isDriver: input.isDriver,
    isActive: true,
    rating: input.isDriver ? 5.0 : null,
    roles: input.isDriver ? ["Driver", "Staff"] : ["Staff"],
    hiredDate: input.hiredDate,
    gender: "Nam",
    address: facility?.address || "TP.HCM",
    license: input.license || null,
    totalTrips: 0,
  };

  MOCK_STAFFS_DB.unshift(newStaff);
  return { ...newStaff };
}

/**
 * Cập nhật thông tin phòng ban, cơ sở và vai trò tài xế
 */
export async function updateStaff(input: UpdateStaffInput): Promise<StaffDetail> {
  await new Promise((r) => setTimeout(r, 100));

  const target = MOCK_STAFFS_DB.find((s) => s.id === input.staffId);
  if (!target) {
    throw createProblem(404, "Không tìm thấy nhân viên", `Hồ sơ nhân viên #${input.staffId} không tồn tại.`);
  }

  if (input.departmentId !== undefined) {
    target.department = MOCK_DEPARTMENTS.find((d) => d.id === input.departmentId) || null;
  }

  if (input.facilityId !== undefined) {
    target.facility = MOCK_FACILITIES.find((f) => f.id === input.facilityId) || null;
  }

  if (input.isDriver !== undefined) {
    target.isDriver = input.isDriver;
  }

  return { ...target };
}

/**
 * Cập nhật giấy phép lái xe
 */
export async function updateStaffLicense(input: UpdateLicenseInput): Promise<StaffDetail> {
  await new Promise((r) => setTimeout(r, 100));

  const target = MOCK_STAFFS_DB.find((s) => s.id === input.staffId);
  if (!target) {
    throw createProblem(404, "Không tìm thấy nhân viên", `Hồ sơ nhân viên #${input.staffId} không tồn tại.`);
  }

  // Validate ngày hết hạn > ngày cấp
  if (input.license.issueDate && input.license.expiryDate) {
    const issue = new Date(input.license.issueDate);
    const expiry = new Date(input.license.expiryDate);
    if (expiry <= issue) {
      throw createProblem(400, "Ngày hết hạn không hợp lệ", "Ngày hết hạn GPLX phải sau ngày cấp.");
    }
  }

  target.license = { ...input.license };
  return { ...target };
}

/**
 * Lấy lịch trình tài xế theo khoảng thời gian
 */
export async function getDriverSchedules({
  from,
  to,
  driverStaffId,
  facilityId,
}: {
  from?: string;
  to?: string;
  driverStaffId?: number;
  facilityId?: number;
}): Promise<DriverScheduleItem[]> {
  await new Promise((r) => setTimeout(r, 90));

  let items = [...MOCK_SCHEDULES_DB];

  if (driverStaffId) {
    items = items.filter((s) => s.driverStaffId === driverStaffId);
  }

  if (facilityId) {
    const driverIdsInFacility = MOCK_STAFFS_DB.filter(
      (s) => s.facility?.id === facilityId && s.isDriver
    ).map((s) => s.id);
    items = items.filter((s) => driverIdsInFacility.includes(s.driverStaffId));
  }

  if (from) {
    const fromTime = new Date(from).getTime();
    items = items.filter((s) => new Date(s.end).getTime() >= fromTime);
  }

  if (to) {
    const toTime = new Date(to).getTime();
    items = items.filter((s) => new Date(s.start).getTime() <= toTime);
  }

  return items;
}

/**
 * Lấy danh sách tài xế có thể gán cho một đơn thuê cụ thể
 * Trả về: danh sách có cờ eligible, xếp tài xế hợp lệ lên đầu
 */
export async function getAssignableDrivers(_rentalId: number): Promise<AssignableDriver[]> {
  void _rentalId;
  await new Promise((r) => setTimeout(r, 100));

  // Giả định đơn thuê rentalId diễn ra vào 2026-10-18T10:00Z -> 2026-10-18T16:00Z
  const rentalStart = new Date("2026-10-18T10:00:00Z").getTime();
  const rentalEnd = new Date("2026-10-18T16:00:00Z").getTime();
  const bufferMs = 60 * 60 * 1000; // 60 phút đệm

  const allDrivers = MOCK_STAFFS_DB.filter((s) => s.isDriver);

  const results: AssignableDriver[] = allDrivers.map((d) => {
    const reasons: string[] = [];

    // 1. Kiểm tra tài khoản hoạt động
    if (!d.isActive) {
      reasons.push("INACTIVE");
    }

    // 2. Kiểm tra giấy phép lái xe
    const licenseCalc = getLicenseState(d.license?.expiryDate);
    if (licenseCalc.state === "expired") {
      reasons.push("LICENSE_EXPIRED");
    } else if (licenseCalc.state === "expiring") {
      // Nếu hết hạn trước hoặc trong ngày thuê
      if (d.license?.expiryDate && new Date(d.license.expiryDate).getTime() <= rentalEnd) {
        reasons.push("LICENSE_EXPIRING");
      }
    } else if (licenseCalc.state === "missing") {
      reasons.push("NOT_DRIVER");
    }

    // 3. Kiểm tra trùng lịch (kể cả 60 phút đệm)
    const driverSchedules = MOCK_SCHEDULES_DB.filter(
      (s) => s.driverStaffId === d.id && s.status === "assigned"
    );

    for (const sched of driverSchedules) {
      const schedStartWithBuffer = new Date(sched.start).getTime() - bufferMs;
      const schedEndWithBuffer = new Date(sched.end).getTime() + bufferMs;

      // Khoảng thời gian [rentalStart, rentalEnd] giao với [schedStartWithBuffer, schedEndWithBuffer]
      const hasOverlap = rentalStart < schedEndWithBuffer && rentalEnd > schedStartWithBuffer;
      if (hasOverlap) {
        reasons.push("BUSY");
        break;
      }
    }

    const eligible = reasons.length === 0;

    return {
      staffId: d.id,
      fullName: d.fullName,
      phone: d.phone,
      avatarUrl: d.avatarUrl,
      rating: d.rating,
      licenseNumber: d.license?.number,
      licenseType: d.license?.type,
      licenseExpiry: d.license?.expiryDate,
      eligible,
      reasons,
    };
  });

  // Xếp tài xế eligible lên trước, sau đó sắp theo điểm đánh giá giảm dần
  results.sort((a, b) => {
    if (a.eligible && !b.eligible) return -1;
    if (!a.eligible && b.eligible) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  return results;
}

/**
 * Gán tài xế cho đơn thuê
 */
export async function assignDriverToRental(
  input: AssignDriverInput
): Promise<{ success: boolean; assignment: DriverScheduleItem }> {
  await new Promise((r) => setTimeout(r, 120));

  const driver = MOCK_STAFFS_DB.find((s) => s.id === input.driverStaffId);
  if (!driver) {
    throw createProblem(404, "Không tìm thấy tài xế", `Tài xế #${input.driverStaffId} không tồn tại.`);
  }

  // Giả định đơn thuê:
  const newAssignment: DriverScheduleItem = {
    assignmentId: Math.max(...MOCK_SCHEDULES_DB.map((s) => s.assignmentId), 0) + 1,
    rentalId: input.rentalId,
    driverStaffId: driver.id,
    driverName: driver.fullName,
    vehicleId: 1,
    vehicleName: "VinFast VF 9 Đẳng Cấp",
    licensePlate: "51K-999.88",
    start: "2026-10-20T08:00:00Z",
    end: "2026-10-20T17:00:00Z",
    bufferMinutes: 60,
    status: "assigned",
    note: `Lý do: ${input.reason}. Ghi chú: ${input.notes || "Không"}`,
  };

  MOCK_SCHEDULES_DB.push(newAssignment);
  return { success: true, assignment: newAssignment };
}

/**
 * Tải ảnh GPLX (Client mock upload tuân thủ mục 5)
 * Giới hạn: JPG/PNG/WebP <= 5MB
 */
export async function uploadLicenseImageMock(file: File): Promise<{ url: string }> {
  await new Promise((r) => setTimeout(r, 300));

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    throw createProblem(400, "Tệp quá lớn", "Kích thước ảnh GPLX không được vượt quá 5 MB.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw createProblem(
      400,
      "Định dạng không hỗ trợ",
      "Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WebP."
    );
  }

  // URL mock an toàn không đưa dữ liệu thực tế vào log
  const mockUrl = URL.createObjectURL(file);
  return { url: mockUrl };
}
