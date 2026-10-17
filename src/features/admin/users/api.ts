import { Role, ROLES } from "@/features/auth/roles";
import {
  AdminUserDetail,
  UserFilterParams,
  UserPageResult,
} from "./types";
import { ApiProblemError } from "@/api/api-client";

// Regex nhận diện các trường nhạy cảm tuyệt đối không được rò rỉ ra ngoài UI
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /otp/i,
  /salt/i,
  /ticket/i,
];

/**
 * Loại bỏ toàn bộ các trường nhạy cảm khỏi dữ liệu người dùng
 */
export function sanitizeUserRecord<T extends object>(record: T): T {
  const sanitized = { ...record } as Record<string, unknown>;
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) {
      delete sanitized[key];
    }
  }
  return sanitized as T;
}

function createProblem(
  status: number,
  title: string,
  detail: string,
  code?: string
): ApiProblemError {
  return new ApiProblemError(status, title, { title, detail, code });
}

// Mock Store nội bộ cho module Quản lý người dùng
let MOCK_USERS_DB: AdminUserDetail[] = [
  {
    id: 1,
    email: "admin@thongdong.vn",
    fullName: "Nguyễn Văn Quản Trị",
    phone: "0901234567",
    avatarUrl: "",
    roles: ["Admin"],
    isActive: true,
    hasStaffProfile: true,
    hasCustomerProfile: false,
    createdAt: "2026-01-10T08:00:00Z",
    gender: "Nam",
    emailVerified: true,
    lastLoginAt: "2026-10-15T14:20:00Z",
    staff: {
      id: 1,
      department: "Ban Giám Đốc",
      facility: "Trụ sở Quận 1, TP.HCM",
      isDriver: false,
    },
  },
  {
    id: 2,
    email: "manager.hcm@thongdong.vn",
    fullName: "Trần Thị Quản Lý",
    phone: "0902345678",
    avatarUrl: "",
    roles: ["Manager"],
    isActive: true,
    hasStaffProfile: true,
    hasCustomerProfile: false,
    createdAt: "2026-01-15T09:30:00Z",
    gender: "Nữ",
    emailVerified: true,
    lastLoginAt: "2026-10-15T11:00:00Z",
    staff: {
      id: 2,
      department: "Vận Hành Đội Xe",
      facility: "Chi nhánh Tân Bình, TP.HCM",
      isDriver: false,
    },
  },
  {
    id: 3,
    email: "staff.phuc@thongdong.vn",
    fullName: "Lê Hoàng Phúc",
    phone: "0903456789",
    avatarUrl: "",
    roles: ["Staff", "CustomerService"],
    isActive: true,
    hasStaffProfile: true,
    hasCustomerProfile: false,
    createdAt: "2026-02-01T10:15:00Z",
    gender: "Nam",
    emailVerified: true,
    lastLoginAt: "2026-10-14T16:45:00Z",
    staff: {
      id: 3,
      department: "Chăm Sóc Khách Hàng",
      facility: "Trụ sở Quận 1, TP.HCM",
      isDriver: false,
    },
  },
  {
    id: 4,
    email: "driver.nam@thongdong.vn",
    fullName: "Võ Hải Nam",
    phone: "0904567890",
    avatarUrl: "",
    roles: ["Driver"],
    isActive: true,
    hasStaffProfile: true,
    hasCustomerProfile: false,
    createdAt: "2026-02-10T08:30:00Z",
    gender: "Nam",
    emailVerified: true,
    lastLoginAt: "2026-10-15T06:10:00Z",
    staff: {
      id: 4,
      department: "Đội Tài Xế",
      facility: "Chi nhánh Tân Bình, TP.HCM",
      isDriver: true,
      licenseExpiry: "2029-05-20",
      rating: 4.9,
    },
  },
  {
    id: 5,
    email: "cust.huy@gmail.com",
    fullName: "Đặng Gia Huy",
    phone: "0912345678",
    avatarUrl: "",
    roles: ["Customer"],
    isActive: true,
    hasStaffProfile: false,
    hasCustomerProfile: true,
    createdAt: "2026-03-01T14:00:00Z",
    gender: "Nam",
    emailVerified: true,
    lastLoginAt: "2026-10-15T09:05:00Z",
    customer: {
      id: 101,
      licenseStatus: "approved",
      licenseNumber: "790123456789",
      licenseType: "B2",
      licenseExpiry: "2032-12-31",
      licenseImgUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
      loyaltyPoint: 450,
    },
  },
  {
    id: 6,
    email: "cust.linh@outlook.com",
    fullName: "Phạm Thùy Linh",
    phone: "0918765432",
    avatarUrl: "",
    roles: ["Customer"],
    isActive: true,
    hasStaffProfile: false,
    hasCustomerProfile: true,
    createdAt: "2026-03-15T11:20:00Z",
    gender: "Nữ",
    emailVerified: true,
    lastLoginAt: "2026-10-13T20:15:00Z",
    customer: {
      id: 102,
      licenseStatus: "pending",
      licenseNumber: "520987654321",
      licenseType: "B1",
      licenseExpiry: "2030-08-15",
      licenseImgUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
      loyaltyPoint: 120,
    },
  },
  {
    id: 7,
    email: "cust.hoang@yahoo.com",
    fullName: "Bùi Minh Hoàng",
    phone: "0987123456",
    avatarUrl: "",
    roles: ["Customer"],
    isActive: false,
    hasStaffProfile: false,
    hasCustomerProfile: true,
    createdAt: "2026-04-05T07:45:00Z",
    gender: "Nam",
    emailVerified: true,
    lastLoginAt: "2026-09-20T10:00:00Z",
    customer: {
      id: 103,
      licenseStatus: "rejected",
      licenseNumber: "750112233445",
      licenseType: "B2",
      licenseExpiry: "2025-01-01",
      loyaltyPoint: 0,
    },
    lockInfo: {
      reason: "Vi phạm điều khoản: Không thanh toán phí phạt quá giờ",
      by: "admin@thongdong.vn",
      at: "2026-09-21T08:00:00Z",
    },
  },
  {
    id: 8,
    email: "tech.tuan@thongdong.vn",
    fullName: "Đỗ Anh Tuấn",
    phone: "0933445566",
    avatarUrl: "",
    roles: ["Maintenance"],
    isActive: true,
    hasStaffProfile: true,
    hasCustomerProfile: false,
    createdAt: "2026-04-12T13:10:00Z",
    gender: "Nam",
    emailVerified: true,
    lastLoginAt: "2026-10-15T07:30:00Z",
    staff: {
      id: 5,
      department: "Kỹ Thuật & Bảo Trì",
      facility: "Xưởng Dịch Vụ Bình Thạnh, TP.HCM",
      isDriver: false,
    },
  },
  {
    id: 9,
    email: "admin2.tri@thongdong.vn",
    fullName: "Trịnh Minh Trí",
    phone: "0944556677",
    avatarUrl: "",
    roles: ["Admin", "Manager"],
    isActive: true,
    hasStaffProfile: true,
    hasCustomerProfile: false,
    createdAt: "2026-05-01T08:00:00Z",
    gender: "Nam",
    emailVerified: true,
    lastLoginAt: "2026-10-15T15:00:00Z",
    staff: {
      id: 6,
      department: "Hệ Thống & Bảo Mật",
      facility: "Trụ sở Quận 1, TP.HCM",
      isDriver: false,
    },
  },
  {
    id: 10,
    email: "cust.an@gmail.com",
    fullName: "Vũ Thúy An",
    phone: "0966778899",
    avatarUrl: "",
    roles: ["Customer"],
    isActive: true,
    hasStaffProfile: false,
    hasCustomerProfile: true,
    createdAt: "2026-05-20T16:30:00Z",
    gender: "Nữ",
    emailVerified: true,
    lastLoginAt: "2026-10-12T18:20:00Z",
    customer: {
      id: 104,
      licenseStatus: "approved",
      licenseNumber: "800334455667",
      licenseType: "B1",
      licenseExpiry: "2035-10-10",
      loyaltyPoint: 890,
    },
  },
];

/**
 * Đếm số lượng Admin đang hoạt động trong hệ thống
 */
function countActiveAdmins(): number {
  return MOCK_USERS_DB.filter(
    (u) => u.isActive && u.roles.includes("Admin")
  ).length;
}

/**
 * Lấy danh sách người dùng với phân trang, tìm kiếm và bộ lọc
 */
export async function getAdminUsers(
  params: UserFilterParams = {}
): Promise<UserPageResult> {
  // Giả lập độ trễ mạng tự nhiên 120ms
  await new Promise((r) => setTimeout(r, 120));

  let filtered = [...MOCK_USERS_DB];

  // 1. Tìm kiếm chuỗi (email / họ tên / điện thoại)
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
    );
  }

  // 2. Lọc vai trò
  if (params.role && params.role !== "all") {
    filtered = filtered.filter((u) => u.roles.includes(params.role as Role));
  }

  // 3. Lọc trạng thái hoạt động
  if (params.isActive && params.isActive !== "all") {
    const shouldBeActive = params.isActive === "active";
    filtered = filtered.filter((u) => u.isActive === shouldBeActive);
  }

  // 4. Lọc hồ sơ
  if (params.profile && params.profile !== "all") {
    if (params.profile === "customer") {
      filtered = filtered.filter((u) => u.hasCustomerProfile);
    } else if (params.profile === "staff") {
      filtered = filtered.filter((u) => u.hasStaffProfile);
    } else if (params.profile === "none") {
      filtered = filtered.filter((u) => !u.hasCustomerProfile && !u.hasStaffProfile);
    }
  }

  // 5. Sắp xếp
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";
  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "createdAt") {
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "fullName") {
      cmp = a.fullName.localeCompare(b.fullName, "vi");
    } else if (sortBy === "email") {
      cmp = a.email.localeCompare(b.email);
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const totalCount = filtered.length;
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, params.pageSize || 10);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((u) => {
    const sanitized = sanitizeUserRecord(u);
    return {
      id: sanitized.id,
      email: sanitized.email,
      fullName: sanitized.fullName,
      phone: sanitized.phone,
      avatarUrl: sanitized.avatarUrl,
      roles: sanitized.roles,
      isActive: sanitized.isActive,
      hasStaffProfile: sanitized.hasStaffProfile,
      hasCustomerProfile: sanitized.hasCustomerProfile,
      createdAt: sanitized.createdAt,
    };
  });

  return {
    items,
    page,
    pageSize,
    totalCount,
  };
}

/**
 * Lấy thông tin chi tiết một tài khoản người dùng
 */
export async function getAdminUserById(id: number): Promise<AdminUserDetail | null> {
  await new Promise((r) => setTimeout(r, 80));
  const user = MOCK_USERS_DB.find((u) => u.id === id);
  if (!user) return null;
  return sanitizeUserRecord(user);
}

/**
 * Cập nhật trạng thái hoạt động (Khóa / Mở khóa tài khoản)
 */
export async function setUserActiveStatus({
  userId,
  isActive,
  reason,
  currentActorId,
  currentActorEmail,
}: {
  userId: number;
  isActive: boolean;
  reason?: string;
  currentActorId?: number;
  currentActorEmail?: string;
}): Promise<AdminUserDetail> {
  await new Promise((r) => setTimeout(r, 100));

  const target = MOCK_USERS_DB.find((u) => u.id === userId);
  if (!target) {
    throw createProblem(404, "Không tìm thấy người dùng", `Tài khoản với mã #${userId} không tồn tại.`);
  }

  // 1. Bảo vệ tự thân: Không cho phép tự khóa chính mình
  if (
    ((currentActorId && target.id === currentActorId) ||
      (currentActorEmail && target.email.toLowerCase() === currentActorEmail.toLowerCase())) &&
    !isActive
  ) {
    throw createProblem(400, "Hành động bị từ chối", "Bạn không thể tự khóa tài khoản quản trị của chính mình.");
  }

  // 2. Bảo vệ Admin cuối cùng: Không cho khóa nếu là Admin duy nhất còn hoạt động
  if (!isActive && target.roles.includes("Admin") && countActiveAdmins() <= 1) {
    throw createProblem(
      409,
      "Xung đột quy tắc bảo mật",
      "Hệ thống phải duy trì ít nhất 1 Quản trị viên (Admin) hoạt động.",
      "LAST_ADMIN"
    );
  }

  // Yêu cầu lý do bắt buộc khi khóa
  if (!isActive && (!reason || reason.trim().length < 5)) {
    throw createProblem(400, "Lý do không hợp lệ", "Vui lòng nhập lý do khóa tài khoản cụ thể (tối thiểu 5 ký tự).");
  }

  target.isActive = isActive;
  if (!isActive) {
    target.lockInfo = {
      reason: reason?.trim(),
      by: currentActorEmail || "Admin",
      at: new Date().toISOString(),
    };
  } else {
    target.lockInfo = null;
  }

  return sanitizeUserRecord(target);
}

/**
 * Gán vai trò mới cho người dùng
 */
export async function assignUserRole({
  userId,
  role,
}: {
  userId: number;
  role: Role;
}): Promise<AdminUserDetail> {
  await new Promise((r) => setTimeout(r, 100));

  const target = MOCK_USERS_DB.find((u) => u.id === userId);
  if (!target) {
    throw createProblem(404, "Không tìm thấy người dùng", `Tài khoản với mã #${userId} không tồn tại.`);
  }

  if (!ROLES.includes(role)) {
    throw createProblem(400, "Vai trò không hợp lệ", `Vai trò '${role}' không tồn tại trong danh mục hệ thống.`);
  }

  if (!target.roles.includes(role)) {
    target.roles = [...target.roles, role];
  }

  return sanitizeUserRecord(target);
}

/**
 * Gỡ vai trò của người dùng
 */
export async function removeUserRole({
  userId,
  role,
  currentActorId,
  currentActorEmail,
}: {
  userId: number;
  role: Role;
  currentActorId?: number;
  currentActorEmail?: string;
}): Promise<AdminUserDetail> {
  await new Promise((r) => setTimeout(r, 100));

  const target = MOCK_USERS_DB.find((u) => u.id === userId);
  if (!target) {
    throw createProblem(404, "Không tìm thấy người dùng", `Tài khoản với mã #${userId} không tồn tại.`);
  }

  // 1. Bảo vệ tự thân: Không cho tự gỡ vai trò Admin của chính mình
  if (
    ((currentActorId && target.id === currentActorId) ||
      (currentActorEmail && target.email.toLowerCase() === currentActorEmail.toLowerCase())) &&
    role === "Admin"
  ) {
    throw createProblem(400, "Hành động bị từ chối", "Bạn không thể tự gỡ vai trò Quản trị viên (Admin) của chính mình.");
  }

  // 2. Bảo vệ Admin cuối cùng: Không cho gỡ vai trò Admin nếu chỉ còn 1 Admin
  if (role === "Admin" && target.isActive && countActiveAdmins() <= 1) {
    throw createProblem(
      409,
      "Xung đột quy tắc bảo mật",
      "Không thể gỡ vai trò Admin của quản trị viên duy nhất còn lại trong hệ thống.",
      "LAST_ADMIN"
    );
  }

  target.roles = target.roles.filter((r) => r !== role);
  return sanitizeUserRecord(target);
}

/**
 * Thu hồi mọi phiên đăng nhập của người dùng
 */
export async function revokeUserSessions(userId: number): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 80));
  const target = MOCK_USERS_DB.find((u) => u.id === userId);
  if (!target) {
    throw createProblem(404, "Không tìm thấy người dùng", `Tài khoản với mã #${userId} không tồn tại.`);
  }
  return { success: true };
}

/**
 * Duyệt hoặc từ chối GPLX của khách hàng (Hỗ trợ snapshot BE Nhóm 2)
 */
export async function reviewCustomerLicense({
  customerId,
  status,
}: {
  customerId: number;
  status: "approved" | "rejected";
}): Promise<AdminUserDetail> {
  await new Promise((r) => setTimeout(r, 100));
  const target = MOCK_USERS_DB.find((u) => u.customer?.id === customerId);
  if (!target || !target.customer) {
    throw createProblem(404, "Không tìm thấy hồ sơ khách hàng", `Khách hàng #${customerId} không tồn tại.`);
  }

  target.customer.licenseStatus = status;
  return sanitizeUserRecord(target);
}

/**
 * Điều chỉnh điểm thưởng khách hàng (Gọi API BE-27 hoặc mock fallback)
 */
export async function adjustCustomerLoyalty({
  customerId,
  points,
  reason,
}: {
  customerId: number;
  points: number;
  reason: string;
}): Promise<AdminUserDetail> {
  await new Promise((r) => setTimeout(r, 100));

  if (points === 0) {
    throw createProblem(400, "Điểm điều chỉnh không hợp lệ", "Số điểm điều chỉnh phải khác 0.");
  }

  if (!reason || reason.trim().length < 5 || reason.trim().length > 255) {
    throw createProblem(400, "Lý do không hợp lệ", "Lý do điều chỉnh điểm phải từ 5 đến 255 ký tự.");
  }

  const target = MOCK_USERS_DB.find((u) => u.customer?.id === customerId);
  if (!target || !target.customer) {
    throw createProblem(404, "Không tìm thấy hồ sơ khách hàng", `Khách hàng #${customerId} không tồn tại.`);
  }

  const currentPoints = target.customer.loyaltyPoint || 0;
  if (currentPoints + points < 0) {
    throw createProblem(409, "Không đủ điểm thưởng", "Số dư điểm thưởng của khách hàng không thể âm.", "INSUFFICIENT_POINTS");
  }

  target.customer.loyaltyPoint = currentPoints + points;
  return sanitizeUserRecord(target);
}

/**
 * Reset mock store về trạng thái khởi tạo (Phục vụ kiểm thử cô lập)
 */
export function resetMockUsersDb(): void {
  MOCK_USERS_DB = [
    {
      id: 1,
      email: "admin@thongdong.vn",
      fullName: "Nguyễn Văn Quản Trị",
      phone: "0901234567",
      avatarUrl: "",
      roles: ["Admin"],
      isActive: true,
      hasStaffProfile: true,
      hasCustomerProfile: false,
      createdAt: "2026-01-10T08:00:00Z",
      gender: "Nam",
      emailVerified: true,
      lastLoginAt: "2026-10-15T14:20:00Z",
      staff: {
        id: 1,
        department: "Ban Giám Đốc",
        facility: "Trụ sở Quận 1, TP.HCM",
        isDriver: false,
      },
    },
    {
      id: 2,
      email: "manager.hcm@thongdong.vn",
      fullName: "Trần Thị Quản Lý",
      phone: "0902345678",
      avatarUrl: "",
      roles: ["Manager"],
      isActive: true,
      hasStaffProfile: true,
      hasCustomerProfile: false,
      createdAt: "2026-01-15T09:30:00Z",
      gender: "Nữ",
      emailVerified: true,
      lastLoginAt: "2026-10-15T11:00:00Z",
      staff: {
        id: 2,
        department: "Vận Hành Đội Xe",
        facility: "Chi nhánh Tân Bình, TP.HCM",
        isDriver: false,
      },
    },
  ];
}
