import { describe, expect, it } from "vitest";
import { getLoginPortalPath } from "./portal-routing";
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

  it("sends Staff in the Driver department to the driver portal", () => {
    expect(getLoginPortalPath(["Staff"], driverAccount)).toBe("/staff");
  });

  it("leaves non-driver staff on the public home page", () => {
    expect(
      getLoginPortalPath(["Staff"], {
        ...driverAccount,
        departmentName: "Operations",
      }),
    ).toBe("/");
  });

  it("leaves customers on the public home page", () => {
    expect(getLoginPortalPath(["Customer"])).toBe("/");
  });
});
