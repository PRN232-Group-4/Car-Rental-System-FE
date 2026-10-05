import { describe, expect, it } from "vitest";
import { getLoginPortalPath } from "./portal-routing";
import { isAdminOrStaffAccount } from "@/features/profile/api";
import type { AccountProfile } from "@/features/profile/api";

const driverAccount: AccountProfile = {
  email: "driver@example.com",
  fullName: "Driver",
  gender: null,
  phone: null,
  avatarUrl: null,
  roles: ["Staff"],
  staffId: 12,
  departmentId: 3,
  departmentName: "Driver",
  facilityId: 2,
};

describe("getLoginPortalPath", () => {
  it("sends Admin users to the admin portal", () => {
    expect(getLoginPortalPath(["Admin", "Staff"])).toBe("/admin");
  });

  it("sends Manager users to the admin portal", () => {
    expect(getLoginPortalPath(["Manager"])).toBe("/admin");
  });

  it("sends Staff in the Driver department to the driver portal", () => {
    expect(getLoginPortalPath(["Staff"], driverAccount)).toBe("/staff");
  });

  it("sends non-driver staff to the admin portal", () => {
    expect(
      getLoginPortalPath(["Staff"], {
        ...driverAccount,
        departmentName: "Operations",
      }),
    ).toBe("/admin");
  });

  it("leaves customers on the public home page", () => {
    expect(getLoginPortalPath(["Customer"])).toBe("/");
  });
});

describe("isAdminOrStaffAccount", () => {
  it("cho phép Admin dù không có phòng ban", () => {
    expect(isAdminOrStaffAccount({ ...driverAccount, roles: ["Admin"], departmentName: null })).toBe(true);
  });

  it("cho phép Manager dù không có phòng ban", () => {
    expect(isAdminOrStaffAccount({ ...driverAccount, roles: ["Manager"], departmentName: null })).toBe(true);
  });

  it("cho phép Staff ngoài phòng Driver", () => {
    expect(isAdminOrStaffAccount({ ...driverAccount, departmentName: "Operations" })).toBe(true);
  });

  it("chặn tài xế (phòng Driver) — họ thuộc /staff", () => {
    expect(isAdminOrStaffAccount(driverAccount)).toBe(false);
  });

  it("chặn khách hàng", () => {
    expect(isAdminOrStaffAccount({ ...driverAccount, roles: ["Customer"], departmentName: null })).toBe(false);
  });

  it("không phân biệt hoa/thường của role", () => {
    expect(isAdminOrStaffAccount({ ...driverAccount, roles: ["ADMIN"] })).toBe(true);
  });
});
