import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStaffAccountOptions } from "@/features/admin/staff/account-options";
import { createStaff, getStaffList, getStaffById, updateStaff, updateStaffLicense } from "@/features/admin/staff/api";
import { driverStaff, directoryUsers, pageOf } from "./staff-backend-fixture";

const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock("@/api/backend-api-client", () => ({ backendApiClient: client }));

describe("Nhân sự sử dụng dữ liệu API thật", () => {
  beforeEach(() => vi.resetAllMocks());

  it("tải email và vai trò ở mọi trang tài khoản", async () => {
    client.get.mockResolvedValueOnce({ ...pageOf([directoryUsers[0]]), totalCount: 2 })
      .mockResolvedValueOnce({ ...pageOf([directoryUsers[1]]), page: 2, totalCount: 2 });

    const result = await getStaffAccountOptions();
    expect(result.map((user) => user.email)).toEqual(["driver@example.test", "technician@example.test"]);
    expect(result[0].roles).toEqual(["Staff", "Driver"]);
    expect(client.get).toHaveBeenNthCalledWith(2, "users", { page: 2, pageSize: 100 });
  });

  it("không trả danh sách thiếu nếu một trang tài khoản bị lỗi", async () => {
    client.get.mockResolvedValueOnce({ ...pageOf([directoryUsers[0]]), totalCount: 2 }).mockRejectedValueOnce(new Error("Network"));
    await expect(getStaffAccountOptions()).rejects.toThrow("Network");
  });

  it("đọc tên cơ sở từ hồ sơ và lọc trước phân trang trên toàn bộ kết quả API", async () => {
    client.get.mockResolvedValueOnce({ ...pageOf([{ ...driverStaff, id: 26, facilityId: 30 }]), totalCount: 2 })
      .mockResolvedValueOnce({ ...pageOf([driverStaff]), page: 2, totalCount: 2 });

    const result = await getStaffList({ facilityId: "31", page: 1, pageSize: 10 });
    expect(result.totalCount).toBe(1);
    expect(result.items[0]).toMatchObject({ id: 27, email: "driver@example.test", facility: { id: 31, name: "Trạm thực tế" }, isDriver: true });
    expect(client.get).toHaveBeenNthCalledWith(2, "staff", { page: 2, pageSize: 100 });
  });

  it("vai trò Driver được dùng khi cờ nhân sự cũ false", async () => {
    client.get.mockResolvedValue(driverStaff);
    const result = await getStaffById(27);
    expect(result.isDriver).toBe(true);
    expect(result.license?.number).toBe("GPLX-42");
    expect(result.roles).toEqual(["Staff", "Driver"]);
  });

  it("vai trò tài khoản có thẩm quyền khi cờ cũ vẫn còn true", async () => {
    client.get.mockResolvedValue({ ...driverStaff, isDriver: true, roles: ["Maintenance"] });
    expect((await getStaffById(27)).isDriver).toBe(false);
  });

  it("tạo liên kết tài khoản không gửi mật khẩu hoặc cho phép tự đặt Driver", async () => {
    client.post.mockResolvedValue(driverStaff);
    await createStaff({ userId: 42, departmentId: 9, facilityId: 31, hiredDate: "2026-10-21", isDriver: true,
      license: { number: "GPLX-42", type: "B2", expiryDate: "2030-01-01" } });
    expect(client.post).toHaveBeenCalledWith("staff/from-user", {
      userId: 42, departmentId: 9, facilityId: 31, hiredDate: "2026-10-21", licenseNumber: "GPLX-42", licenseType: "B2",
      licenseIssueDate: null, licenseExpiryDate: "2030-01-01", licenseImageUrl: null,
    });
  });

  it("giữ đầy đủ GPLX và thông tin tài khoản khi đổi phòng ban, cơ sở", async () => {
    client.get.mockResolvedValue(driverStaff);
    client.put.mockResolvedValue(driverStaff);
    await updateStaff({ staffId: 27, departmentId: 10, facilityId: 32, isDriver: false });
    expect(client.put).toHaveBeenCalledWith("staff/27", expect.objectContaining({
      fullName: driverStaff.fullName, phone: driverStaff.phone, departmentId: 10, facilityId: 32, isDriver: true,
      licenseNumber: driverStaff.licenseNumber, licenseType: driverStaff.licenseType, licenseImageUrl: driverStaff.licenseImageUrl,
      licenseIssueDate: driverStaff.licenseIssueDate, licenseExpiryDate: driverStaff.licenseExpiryDate,
      staffRole: "Driver", gender: "Female", address: "TP.HCM",
    }));
  });

  it("lưu GPLX trên backend và giữ cơ sở công tác", async () => {
    client.get.mockResolvedValue(driverStaff);
    client.put.mockResolvedValue(driverStaff);
    await updateStaffLicense({ staffId: 27, license: { number: "GPLX-MOI", type: "D", issueDate: "2025-01-01", expiryDate: "2035-01-01", imgUrl: "https://example.test/new.png" } });
    expect(client.put).toHaveBeenCalledWith("staff/27", expect.objectContaining({
      departmentId: 9, facilityId: 31, licenseNumber: "GPLX-MOI", licenseType: "D", licenseExpiryDate: "2035-01-01", licenseImageUrl: "https://example.test/new.png",
    }));
  });
});
