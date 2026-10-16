import { describe, expect, it } from "vitest";
import {
  getNavigation,
  PUBLIC_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
  CUSTOMER_NAV_ITEMS,
  DRIVER_NAV_ITEMS,
} from "@/config/navigation";

describe("navigation.ts (Centralized Navigation & Role Filtering)", () => {
  it("returns all public navigation items regardless of roles", () => {
    const guestNav = getNavigation(null, "public");
    const adminNav = getNavigation(["Admin"], "public");

    expect(guestNav).toEqual(PUBLIC_NAV_ITEMS);
    expect(adminNav).toEqual(PUBLIC_NAV_ITEMS);
    expect(guestNav.some((item) => item.href === "/#tim-xe")).toBe(true);
  });

  describe("admin navigation", () => {
    it("returns full admin menu for Admin role including system administration items", () => {
      const adminNav = getNavigation(["Admin"], "admin");
      const hrefs = adminNav.map((item) => item.href);

      expect(hrefs).toContain("/admin");
      expect(hrefs).toContain("/admin/departments");
      expect(hrefs).toContain("/admin/facilities");
      expect(hrefs).toContain("/admin/staffs");
      expect(hrefs).toContain("/admin/roles");
      expect(hrefs).toContain("/admin/policies");
      expect(hrefs).toContain("/admin/rentals");
      expect(hrefs).toContain("/admin/dispatch");
      expect(hrefs).toContain("/admin/vehicles");
      expect(hrefs.length).toBe(ADMIN_NAV_ITEMS.length);
    });

    it("filters out Admin-only items for Manager role while keeping management items", () => {
      const managerNav = getNavigation(["Manager"], "admin");
      const hrefs = managerNav.map((item) => item.href);

      expect(hrefs).toContain("/admin");
      expect(hrefs).toContain("/admin/policies"); // Manager allowed
      expect(hrefs).toContain("/admin/rentals");
      expect(hrefs).not.toContain("/admin/departments"); // Admin only
      expect(hrefs).not.toContain("/admin/facilities"); // Admin only
      expect(hrefs).not.toContain("/admin/roles"); // Admin only
      expect(hrefs).not.toContain("/admin/staffs"); // Admin only
    });

    it("filters out management and admin items for Staff role", () => {
      const staffNav = getNavigation(["Staff"], "admin");
      const hrefs = staffNav.map((item) => item.href);

      expect(hrefs).toContain("/admin");
      expect(hrefs).toContain("/admin/rentals");
      expect(hrefs).toContain("/admin/vehicles");
      expect(hrefs).toContain("/admin/inspections");
      expect(hrefs).not.toContain("/admin/policies"); // Manager/Admin only
      expect(hrefs).not.toContain("/admin/roles");
      expect(hrefs).not.toContain("/admin/facilities");
    });

    it("includes dispatch for CustomerService role", () => {
      const csNav = getNavigation(["CustomerService"], "admin");
      const hrefs = csNav.map((item) => item.href);

      expect(hrefs).toContain("/admin/dispatch");
      expect(hrefs).toContain("/admin/rentals");
      expect(hrefs).not.toContain("/admin/policies");
      expect(hrefs).not.toContain("/admin/departments");
    });
  });

  describe("customer navigation", () => {
    it("returns full customer hub menu for Customer role", () => {
      expect(CUSTOMER_NAV_ITEMS.length).toBeGreaterThan(0);
      const customerNav = getNavigation(["Customer"], "customer");
      const hrefs = customerNav.map((item) => item.href);

      expect(hrefs).toContain("/booking");
      expect(hrefs).toContain("/driver-license");
      expect(hrefs).toContain("/rental-contract");
      expect(hrefs).toContain("/my-subscriptions");
      expect(hrefs).toContain("/invoices");
      expect(hrefs).toContain("/payment-history");
      expect(hrefs).toContain("/report-incident");
    });

    it("filters out customer-specific items if user does not have Customer role", () => {
      const nonCustomerNav = getNavigation(["Staff"], "customer");
      const hrefs = nonCustomerNav.map((item) => item.href);

      expect(hrefs).toContain("/booking");
      expect(hrefs).toContain("/invoices");
      expect(hrefs).not.toContain("/driver-license");
      expect(hrefs).not.toContain("/rental-contract");
      expect(hrefs).not.toContain("/my-subscriptions");
    });
  });

  describe("driver navigation", () => {
    it("returns driver portal item for Driver role", () => {
      expect(DRIVER_NAV_ITEMS.length).toBeGreaterThan(0);
      const driverNav = getNavigation(["Driver"], "driver");
      expect(driverNav.map((item) => item.href)).toContain("/staff");
    });

    it("returns empty driver items for Customer role", () => {
      const driverNav = getNavigation(["Customer"], "driver");
      expect(driverNav).toHaveLength(0);
    });
  });
});
