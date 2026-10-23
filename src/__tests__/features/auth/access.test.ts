import { describe, expect, it } from "vitest";
import {
  hasRole,
  hasAnyRole,
  normalizePathname,
  canAccessRoute,
  ROUTE_ACCESS_RULES,
} from "@/features/auth/access";

describe("access.ts (RBAC Permissions & Route Access)", () => {
  it("defines route access rules with valid patterns and roles", () => {
    expect(ROUTE_ACCESS_RULES.length).toBeGreaterThan(0);
    expect(ROUTE_ACCESS_RULES.some((r) => r.pattern === "/admin/users")).toBe(true);
    expect(ROUTE_ACCESS_RULES.some((r) => r.pattern === "/admin")).toBe(true);
  });

  describe("hasRole", () => {
    it("returns true when role matches case-insensitively", () => {
      expect(hasRole(["Customer"], "Customer")).toBe(true);
      expect(hasRole(["customer"], "Customer")).toBe(true);
      expect(hasRole(["Admin"], "admin")).toBe(true);
      expect(hasRole(["CustomerService"], "customerservice")).toBe(true);
      expect(hasRole([" Staff "], "staff")).toBe(true);
    });

    it("returns false when role is not present or userRoles is empty", () => {
      expect(hasRole(["Customer"], "Admin")).toBe(false);
      expect(hasRole([], "Customer")).toBe(false);
      expect(hasRole(null, "Customer")).toBe(false);
      expect(hasRole(undefined, "Customer")).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("returns true when user has at least one matching role", () => {
      expect(hasAnyRole(["Customer"], ["Admin", "Customer"])).toBe(true);
      expect(hasAnyRole(["Staff", "CustomerService"], ["Manager", "CustomerService"])).toBe(true);
      expect(hasAnyRole(["admin"], ["ADMIN"])).toBe(true);
    });

    it("returns false when user has none of the allowed roles", () => {
      expect(hasAnyRole(["Customer"], ["Admin", "Manager", "Staff"])).toBe(false);
      expect(hasAnyRole([], ["Admin"])).toBe(false);
      expect(hasAnyRole(null, ["Admin"])).toBe(false);
      expect(hasAnyRole(["Customer"], [])).toBe(false);
    });
  });

  describe("normalizePathname", () => {
    it("cleans trailing slashes, search params, and hashes", () => {
      expect(normalizePathname("/admin/")).toBe("/admin");
      expect(normalizePathname("/admin/users/?page=1&sort=name")).toBe("/admin/users");
      expect(normalizePathname("/booking#step-2")).toBe("/booking");
      expect(normalizePathname("admin/users")).toBe("/admin/users");
      expect(normalizePathname("/")).toBe("/");
      expect(normalizePathname("")).toBe("/");
    });
  });

  describe("canAccessRoute (Longest Prefix Match & Access Rules)", () => {
    it("allows public routes without authentication or roles", () => {
      expect(canAccessRoute("/", null)).toBe(true);
      expect(canAccessRoute("/find", null)).toBe(true);
      expect(canAccessRoute("/find?city=hcm", undefined)).toBe(true);
      expect(canAccessRoute("/vehicles/detail?id=1", null)).toBe(true);
      expect(canAccessRoute("/forbidden", null)).toBe(true);
      expect(canAccessRoute("/login", null)).toBe(true);
      expect(canAccessRoute("/register", null)).toBe(true);
    });

    it("enforces Admin-only access on /admin/users, /admin/roles, /admin/departments, /admin/facilities", () => {
      const adminRoles = ["Admin"];
      const managerRoles = ["Manager"];
      const staffRoles = ["Staff"];

      expect(canAccessRoute("/admin/users", adminRoles)).toBe(true);
      expect(canAccessRoute("/admin/users/add", adminRoles)).toBe(true);
      expect(canAccessRoute("/admin/users", managerRoles)).toBe(false);
      expect(canAccessRoute("/admin/users", staffRoles)).toBe(false);
      expect(canAccessRoute("/admin/users", null)).toBe(false);

      expect(canAccessRoute("/admin/roles", adminRoles)).toBe(true);
      expect(canAccessRoute("/admin/roles", managerRoles)).toBe(false);

      expect(canAccessRoute("/admin/departments", adminRoles)).toBe(true);
      expect(canAccessRoute("/admin/facilities", adminRoles)).toBe(true);
    });

    it("enforces Longest Prefix Match over general /admin rule", () => {
      // General /admin allows Staff, but /admin/users specifically requires Admin
      const staffRoles = ["Staff"];
      expect(canAccessRoute("/admin", staffRoles)).toBe(true);
      expect(canAccessRoute("/admin/users", staffRoles)).toBe(false);
    });

    it("allows Manager and Admin on /admin/staffs, /admin/policies, /admin/dashboard", () => {
      expect(canAccessRoute("/admin/staffs", ["Manager"])).toBe(true);
      expect(canAccessRoute("/admin/staffs", ["Admin"])).toBe(true);
      expect(canAccessRoute("/admin/staffs", ["Staff"])).toBe(false);

      expect(canAccessRoute("/admin/policies", ["Manager"])).toBe(true);
      expect(canAccessRoute("/admin/policies", ["CustomerService"])).toBe(false);

      expect(canAccessRoute("/admin/dashboard", ["Manager"])).toBe(true);
      expect(canAccessRoute("/admin/dashboard", ["Staff"])).toBe(false);
    });

    it("allows CustomerService on dispatch and rentals", () => {
      const csRoles = ["CustomerService"];
      expect(canAccessRoute("/admin/dispatch", csRoles)).toBe(true);
      expect(canAccessRoute("/admin/rentals", csRoles)).toBe(true);
      expect(canAccessRoute("/admin/policies", csRoles)).toBe(false);
    });

    /**
     * Bất biến: mọi role mà quy tắc route cho phép vào `/admin/reports` phải vào được cả trang chi tiết
     * `/admin/reports/detail` — trang này chỉ đi tiếp từ danh sách báo cáo sự cố.
     * Trước đây cổng `AuthGate` của trang chi tiết thiếu `Maintenance` nên role này bị chặn giữa đường.
     */
    it("keeps the report detail page open for every role the report list allows", () => {
      for (const role of ["Staff", "CustomerService", "Maintenance", "Manager"]) {
        expect(canAccessRoute("/admin/reports", [role])).toBe(true);
        expect(canAccessRoute("/admin/reports/detail", [role])).toBe(true);
      }
      expect(canAccessRoute("/admin/reports/detail", ["Customer"])).toBe(false);
      expect(canAccessRoute("/admin/reports/detail", null)).toBe(false);
    });

    it("allows Driver, Admin, Manager, Staff on /staff portal", () => {
      expect(canAccessRoute("/staff", ["Driver"])).toBe(true);
      expect(canAccessRoute("/staff", ["Admin"])).toBe(true);
      expect(canAccessRoute("/staff", ["Customer"])).toBe(false);
      expect(canAccessRoute("/staff", null)).toBe(false);
    });

    it("enforces Customer role on personal customer routes", () => {
      expect(canAccessRoute("/driver-license", ["Customer"])).toBe(true);
      expect(canAccessRoute("/driver-license", ["Staff"])).toBe(false);
      expect(canAccessRoute("/my-subscriptions", ["Customer"])).toBe(true);
      expect(canAccessRoute("/my-subscriptions", ["Admin"])).toBe(false);
      expect(canAccessRoute("/rental-contract", ["Customer"])).toBe(true);
    });

    it("allows any authenticated user on general booking and account routes", () => {
      expect(canAccessRoute("/booking", ["Customer"])).toBe(true);
      expect(canAccessRoute("/booking", ["Staff"])).toBe(true);
      expect(canAccessRoute("/booking", null)).toBe(false);
      expect(canAccessRoute("/booking", [])).toBe(false);

      expect(canAccessRoute("/invoices", ["Customer"])).toBe(true);
      expect(canAccessRoute("/invoices", null)).toBe(false);

      expect(canAccessRoute("/payment-history", ["Customer"])).toBe(true);
      expect(canAccessRoute("/payment-history", null)).toBe(false);

      expect(canAccessRoute("/profile", ["Customer"])).toBe(true);
      expect(canAccessRoute("/profile", null)).toBe(false);
    });
  });
});
