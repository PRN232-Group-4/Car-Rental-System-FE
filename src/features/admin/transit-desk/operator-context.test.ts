import { expect, it } from "vitest";
import { operatorContext } from "./operator-context";

it.each(["Admin", "Manager", "Maintenance", "CustomerService", "Staff"])("reads the actual assigned facility for %s", (role) => {
  expect(operatorContext({ roles: [role], facilityId: 108, facilityName: "Cơ sở Cần Thơ" }).facility).toBe("Cơ sở Cần Thơ");
});

it("does not invent a central facility for an unassigned or incomplete account", () => {
  expect(operatorContext({ facilityId: null, facilityName: "Tên cơ sở cũ" }).facility).toBe("Chưa phân công cơ sở");
  expect(operatorContext({ facilityId: 3 }).facility).toBe("Chưa tải được tên cơ sở");
});

it("uses account role and department instead of calling all operators dispatchers", () => {
  expect(operatorContext({ roles: ["Maintenance"], departmentName: "Kỹ thuật" }).jobTitle).toBe("Kỹ thuật viên · Kỹ thuật");
});
