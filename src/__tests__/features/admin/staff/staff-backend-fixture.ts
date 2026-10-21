import type { StaffDto } from "@/features/admin/api";

export const driverStaff = {
  id: 27, userId: 42, email: "driver@example.test", fullName: "Tài xế thực tế", phone: "0901234567",
  departmentId: 9, departmentName: "Đội tài xế", facilityId: 31, facilityName: "Trạm thực tế",
  hiredDate: "2026-10-21", isDriver: false, roles: ["Staff", "Driver"], staffRole: "Staff", isActive: true,
  licenseNumber: "GPLX-42", licenseType: "B2", licenseIssueDate: "2020-01-01", licenseExpiryDate: "2030-01-01",
  licenseImageUrl: "https://example.test/license.png", rating: null, gender: "Female", avatarUrl: null, address: "TP.HCM",
} satisfies StaffDto & { roles: string[]; gender: string; avatarUrl: null; address: string };

export const directoryUsers = [
  { id: 42, email: "driver@example.test", fullName: "Tài xế thực tế", roles: ["Staff", "Driver"], isActive: true, staffId: null },
  { id: 43, email: "technician@example.test", fullName: "Kỹ thuật viên", roles: ["Maintenance"], isActive: true, staffId: null },
  { id: 44, email: "linked@example.test", fullName: "Đã có hồ sơ", roles: ["Driver"], isActive: true, staffId: 99 },
];

export const pageOf = <T,>(items: T[]) => ({ items, page: 1, pageSize: 100, totalCount: items.length });
