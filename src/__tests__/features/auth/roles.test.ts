import { describe, expect, it } from "vitest";
import {
  ROLES,
  ROLE_LABELS,
  ROLE_CATEGORIES,
  ROLE_CATEGORY_LABELS,
  STAFF_PORTAL_ROLES,
  DRIVER_PORTAL_ROLES,
  MANAGEMENT_ROLES,
  CUSTOMER_ROLES,
  isRole,
  normalizeRole,
  isStaffPortalRole,
  isDriverRole,
  isCustomerRole,
  isManagementRole,
} from "@/features/auth/roles";

describe("roles.ts (7 Backend Roles & Predicates)", () => {
  it("defines exactly all 7 roles matching backend contract snapshot", () => {
    expect(ROLES).toHaveLength(7);
    expect(ROLES).toContain("Customer");
    expect(ROLES).toContain("Staff");
    expect(ROLES).toContain("Admin");
    expect(ROLES).toContain("Driver");
    expect(ROLES).toContain("Maintenance");
    expect(ROLES).toContain("Manager");
    expect(ROLES).toContain("CustomerService");
  });

  it("provides Vietnamese display labels for every role", () => {
    ROLES.forEach((role) => {
      expect(ROLE_LABELS[role]).toBeDefined();
      expect(typeof ROLE_LABELS[role]).toBe("string");
      expect(ROLE_LABELS[role].length).toBeGreaterThan(0);
    });
    expect(ROLE_LABELS.Customer).toBe("Khách hàng");
    expect(ROLE_LABELS.Staff).toBe("Nhân viên vận hành");
    expect(ROLE_LABELS.Admin).toBe("Quản trị viên");
    expect(ROLE_LABELS.Driver).toBe("Tài xế");
    expect(ROLE_LABELS.Maintenance).toBe("Kỹ thuật viên");
    expect(ROLE_LABELS.Manager).toBe("Quản lý vận hành");
    expect(ROLE_LABELS.CustomerService).toBe("Chăm sóc khách hàng");
  });

  it("maps all roles to valid role categories", () => {
    ROLES.forEach((role) => {
      const category = ROLE_CATEGORIES[role];
      expect(category).toBeDefined();
      expect(ROLE_CATEGORY_LABELS[category]).toBeDefined();
    });
    expect(ROLE_CATEGORIES.Admin).toBe("management");
    expect(ROLE_CATEGORIES.Manager).toBe("management");
    expect(ROLE_CATEGORIES.Staff).toBe("operations");
    expect(ROLE_CATEGORIES.CustomerService).toBe("operations");
    expect(ROLE_CATEGORIES.Maintenance).toBe("technical");
    expect(ROLE_CATEGORIES.Driver).toBe("driver");
    expect(ROLE_CATEGORIES.Customer).toBe("customer");
  });

  it("groups roles into appropriate portals", () => {
    expect(STAFF_PORTAL_ROLES).toEqual(
      expect.arrayContaining(["Admin", "Manager", "Staff", "CustomerService", "Maintenance"]),
    );
    expect(STAFF_PORTAL_ROLES).not.toContain("Customer");

    expect(DRIVER_PORTAL_ROLES).toEqual(
      expect.arrayContaining(["Driver", "Admin", "Manager", "Staff"]),
    );

    expect(MANAGEMENT_ROLES).toEqual(
      expect.arrayContaining(["Admin", "Manager"]),
    );

    expect(CUSTOMER_ROLES).toEqual(["Customer"]);
  });

  describe("predicate helpers", () => {
    it("isRole validates roles case-insensitively and rejects invalid values", () => {
      expect(isRole("Admin")).toBe(true);
      expect(isRole("admin")).toBe(true);
      expect(isRole("ADMIN")).toBe(true);
      expect(isRole("customerservice")).toBe(true);
      expect(isRole("SuperUser")).toBe(false);
      expect(isRole("")).toBe(false);
      expect(isRole(null)).toBe(false);
      expect(isRole(undefined)).toBe(false);
      expect(isRole(123)).toBe(false);
    });

    it("normalizeRole formats string to PascalCase Role or returns null", () => {
      expect(normalizeRole("admin")).toBe("Admin");
      expect(normalizeRole(" CUSTOMERSERVICE ")).toBe("CustomerService");
      expect(normalizeRole("driver")).toBe("Driver");
      expect(normalizeRole("maintenance")).toBe("Maintenance");
      expect(normalizeRole("manager")).toBe("Manager");
      expect(normalizeRole("customer")).toBe("Customer");
      expect(normalizeRole("staff")).toBe("Staff");
      expect(normalizeRole("unknown_role")).toBeNull();
    });

    it("isStaffPortalRole returns true for staff portal roles only", () => {
      expect(isStaffPortalRole("Admin")).toBe(true);
      expect(isStaffPortalRole("manager")).toBe(true);
      expect(isStaffPortalRole("Staff")).toBe(true);
      expect(isStaffPortalRole("CustomerService")).toBe(true);
      expect(isStaffPortalRole("Maintenance")).toBe(true);
      expect(isStaffPortalRole("Customer")).toBe(false);
      expect(isStaffPortalRole("Driver")).toBe(false);
    });

    it("isDriverRole returns true only for driver role", () => {
      expect(isDriverRole("Driver")).toBe(true);
      expect(isDriverRole("driver")).toBe(true);
      expect(isDriverRole("Staff")).toBe(false);
      expect(isDriverRole("Customer")).toBe(false);
    });

    it("isCustomerRole returns true only for customer role", () => {
      expect(isCustomerRole("Customer")).toBe(true);
      expect(isCustomerRole("customer")).toBe(true);
      expect(isCustomerRole("Admin")).toBe(false);
    });

    it("isManagementRole returns true for Admin and Manager", () => {
      expect(isManagementRole("Admin")).toBe(true);
      expect(isManagementRole("manager")).toBe(true);
      expect(isManagementRole("Staff")).toBe(false);
      expect(isManagementRole("Customer")).toBe(false);
    });
  });
});
