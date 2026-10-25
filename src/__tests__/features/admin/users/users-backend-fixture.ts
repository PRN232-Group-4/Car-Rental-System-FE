import type { AdministrativeUser } from "@/features/admin/users/api";

export const adminUser: AdministrativeUser = {
  id: 1, email: "admin@thongdong.vn", fullName: "Nguyễn Văn Quản Trị", phone: "0901234567", avatarUrl: null,
  gender: null, isActive: true, createdAt: "2026-01-10T08:00:00Z", roles: ["Admin"], customerId: null, staffId: 27,
};
export const managerUser: AdministrativeUser = {
  ...adminUser, id: 2, email: "manager.hcm@thongdong.vn", fullName: "Trần Thị Quản Lý", roles: ["Manager"], staffId: null,
};
export const lockedUser: AdministrativeUser = {
  ...adminUser, id: 7, email: "locked@example.test", fullName: "Người dùng bị khóa", isActive: false, roles: ["Customer"], staffId: null, customerId: 101,
};
export const usersPage = (items = [adminUser, managerUser, lockedUser]) => ({ items, page: 1, pageSize: 100, totalCount: items.length });
