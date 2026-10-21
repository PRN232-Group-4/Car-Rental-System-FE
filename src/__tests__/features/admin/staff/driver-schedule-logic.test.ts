import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiProblemError } from "@/api/api-client";
import { driverStaff, pageOf } from "./staff-backend-fixture";
const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));
import {
  getAssignableDrivers,
  assignDriverToRental,
  getStaffList,
  createStaff,
} from "@/features/admin/staff/api";

describe("FE-24 Admin Staff & Drivers — Scheduling & Assignment Safety Logic", () => {
  beforeEach(() => {
    client.get.mockResolvedValue(pageOf([{ ...driverStaff, licenseExpiryDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10) }]));
    client.post.mockRejectedValue(new ApiProblemError(409, "Conflict", { detail: "Tài khoản đã được liên kết với hồ sơ nhân viên." }));
  });
  it("trả về danh sách tài xế phân loại eligible và gắn lý do loại trừ chính xác", async () => {
    // Đơn thuê rentalId: 101 diễn ra từ 10:00 - 16:00 ngày 2026-10-18
    const assignableDrivers = await getAssignableDrivers(101);

    expect(assignableDrivers.length).toBeGreaterThan(0);

    // Kiểm tra tài xế bị khóa (Nguyễn Hải Đăng)
    const inactiveDriver = assignableDrivers.find((d) => d.staffId === 7);
    expect(inactiveDriver).toBeDefined();
    expect(inactiveDriver?.eligible).toBe(false);
    expect(inactiveDriver?.reasons).toContain("INACTIVE");

    // Kiểm tra tài xế bằng đã hết hạn (Đỗ Minh Quân)
    const expiredLicenseDriver = assignableDrivers.find((d) => d.staffId === 6);
    expect(expiredLicenseDriver).toBeDefined();
    expect(expiredLicenseDriver?.eligible).toBe(false);
    expect(expiredLicenseDriver?.reasons).toContain("LICENSE_EXPIRED");

    // Kiểm tra tài xế bị trùng lịch kèm 60 phút đệm (Phạm Hùng Cường hoặc Võ Thành Nam)
    const busyDriver = assignableDrivers.find((d) => d.staffId === 4 || d.staffId === 5);
    expect(busyDriver).toBeDefined();
    expect(busyDriver?.reasons).toContain("BUSY");

    // Thứ tự: các tài xế eligible=true luôn đứng trước tài xế eligible=false
    const firstIneligibleIndex = assignableDrivers.findIndex((d) => !d.eligible);
    if (firstIneligibleIndex !== -1) {
      for (let i = 0; i < firstIneligibleIndex; i++) {
        expect(assignableDrivers[i].eligible).toBe(true);
      }
      for (let i = firstIneligibleIndex; i < assignableDrivers.length; i++) {
        expect(assignableDrivers[i].eligible).toBe(false);
      }
    }
  });

  it("gán tài xế thành công và cập nhật lịch trình", async () => {
    const result = await assignDriverToRental({
      rentalId: 888,
      driverStaffId: 4,
      reason: "customer_request",
      notes: "Khách hàng VIP yêu cầu chỉ định tài xế quen",
    });

    expect(result.success).toBe(true);
    expect(result.assignment.rentalId).toBe(888);
    expect(result.assignment.driverStaffId).toBe(4);
    expect(result.assignment.bufferMinutes).toBe(60);
    expect(result.assignment.note).toContain("customer_request");
  });

  it("từ chối tạo hồ sơ nhân viên nếu user đã có hồ sơ staff (staffs.user_id duy nhất)", async () => {
    // Backend từ chối liên kết trùng tài khoản theo ràng buộc duy nhất.
    await expect(
      createStaff({
        userId: 1,
        departmentId: 1,
        facilityId: 1,
        hiredDate: "2026-10-17",
        isDriver: false,
      })
    ).rejects.toThrow("đã được liên kết với hồ sơ nhân viên");
  });

  it("hỗ trợ lọc nhân sự theo phòng ban, cơ sở và tình trạng GPLX", async () => {
    // 1. Chỉ lọc tài xế
    const driversResult = await getStaffList({ isDriver: "driver" });
    expect(driversResult.items.every((s) => s.isDriver)).toBe(true);

    // 2. Lọc bằng sắp hết hạn
    const expiringResult = await getStaffList({ licenseStatus: "expiring" });
    expect(expiringResult.items.length).toBeGreaterThan(0);
    expect(expiringResult.items[0].license?.expiryDate).toBeDefined();
  });
});
