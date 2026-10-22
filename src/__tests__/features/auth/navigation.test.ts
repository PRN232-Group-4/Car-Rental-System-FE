import { describe, expect, it } from "vitest";
import { canAccessRoute } from "@/features/auth/access";
import {
  getNavigation,
  PUBLIC_NAV_ITEMS,
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
    it("unifies license review under customers queue for CS, Staff, and Manager", () => {
      for (const role of ["Staff", "CustomerService", "Manager"]) {
        const hrefs = getNavigation([role], "admin").map((item) => item.href);
        expect(hrefs).toContain("/admin/customers");
        expect(canAccessRoute("/admin/customers", [role])).toBe(true);
      }
      for (const role of ["Admin", "Maintenance", "Driver", "Customer"]) {
        expect(getNavigation([role], "admin").map((item) => item.href)).not.toContain("/admin/customers");
      }
    });

    it("returns system administration menu for Admin role without operational bloat", () => {
      const adminNav = getNavigation(["Admin"], "admin");
      const hrefs = adminNav.map((item) => item.href);

      expect(hrefs).toContain("/admin");
      expect(hrefs).toContain("/admin/departments");
      expect(hrefs).toContain("/admin/facilities");
      expect(hrefs).toContain("/admin/staffs");
      expect(hrefs).toContain("/admin/roles");
      expect(hrefs).toContain("/admin/users");
      expect(hrefs).toContain("/admin/audit-logs");
      expect(hrefs).toContain("/admin/profile");

      // Admin không thấy các module vận hành / chăm sóc & sự cố
      expect(hrefs).not.toContain("/admin/policies");
      expect(hrefs).not.toContain("/admin/rentals");
      expect(hrefs).not.toContain("/admin/dispatch");
      expect(hrefs).not.toContain("/admin/vehicles");
      expect(hrefs).not.toContain("/admin/reports");
      expect(hrefs).not.toContain("/admin/customers");
      expect(hrefs).not.toContain("/admin/handovers");
      expect(hrefs).not.toContain("/admin/inspections");
      expect(hrefs).not.toContain("/admin/maintenance");
      expect(hrefs.length).toBe(8);
    });

    it("filters out Admin-only items for Manager role while keeping management items", () => {
      const managerNav = getNavigation(["Manager"], "admin");
      const hrefs = managerNav.map((item) => item.href);

      expect(hrefs).toContain("/admin");
      expect(hrefs).toContain("/admin/dashboard");
      expect(hrefs).toContain("/admin/staffs");
      expect(hrefs).toContain("/admin/audit-logs"); // Manager xem nhật ký kiểm toán
      expect(hrefs).toContain("/admin/customers"); // Manager xem khách hàng và GPLX
      expect(hrefs).toContain("/admin/handovers"); // Manager giám sát bàn giao
      expect(hrefs).toContain("/admin/inspections"); // Manager giám sát kiểm tra xe
      expect(hrefs).toContain("/admin/maintenance"); // Manager duyệt chi phí bảo dưỡng
      expect(hrefs).toContain("/admin/policies");
      expect(hrefs).toContain("/admin/subscription-plans");
      expect(hrefs).toContain("/admin/vehicles");
      expect(hrefs).toContain("/admin/vehicle-types");
      expect(hrefs).toContain("/admin/rentals");
      expect(hrefs).toContain("/admin/dispatch");
      expect(hrefs).toContain("/admin/drivers/schedule");
      expect(hrefs).toContain("/admin/tracking");
      expect(hrefs).toContain("/admin/reviews");
      expect(hrefs).toContain("/admin/reports");

      expect(hrefs).not.toContain("/admin/users"); // route chỉ cho Admin
      expect(hrefs).not.toContain("/admin/departments"); // Admin only
      expect(hrefs).not.toContain("/admin/facilities"); // Admin only
      expect(hrefs).not.toContain("/admin/roles"); // Admin only
    });

    it("allocates branch operations and customer care to Staff role", () => {
      const staffNav = getNavigation(["Staff"], "admin");
      const hrefs = staffNav.map((item) => item.href);

      expect(hrefs).toContain("/admin");
      expect(hrefs).toContain("/admin/rentals");
      expect(hrefs).toContain("/admin/handovers");
      expect(hrefs).toContain("/admin/inspections");
      expect(hrefs).toContain("/admin/dispatch");
      expect(hrefs).toContain("/admin/drivers/schedule");
      expect(hrefs).toContain("/admin/tracking");
      expect(hrefs).toContain("/admin/reports");
      expect(hrefs).toContain("/admin/customers");
      expect(hrefs).toContain("/admin/vehicles");

      expect(hrefs).not.toContain("/admin/policies"); // Manager only
      expect(hrefs).not.toContain("/admin/subscription-plans");
      expect(hrefs).not.toContain("/admin/dashboard");
      expect(hrefs).not.toContain("/admin/reviews");
      expect(hrefs).not.toContain("/admin/roles");
      expect(hrefs).not.toContain("/admin/facilities");
      expect(hrefs).not.toContain("/admin/users");
      expect(hrefs).not.toContain("/admin/departments");
      expect(hrefs).not.toContain("/admin/audit-logs");
    });

    it("allocates customer care and booking support to CustomerService role without branch dispatch", () => {
      const csNav = getNavigation(["CustomerService"], "admin");
      const hrefs = csNav.map((item) => item.href);

      expect(hrefs).toContain("/admin");
      expect(hrefs).toContain("/admin/customers");
      expect(hrefs).toContain("/admin/reports");
      expect(hrefs).toContain("/admin/rentals");

      // CS rút khỏi bàn giao xe tại garage và điều phối tài xế tại trạm
      expect(hrefs).not.toContain("/admin/handovers");
      expect(hrefs).not.toContain("/admin/dispatch");
      expect(hrefs).not.toContain("/admin/drivers/schedule");
      expect(hrefs).not.toContain("/admin/maintenance");
      expect(hrefs).not.toContain("/admin/inspections");
      expect(hrefs).not.toContain("/admin/policies");
      expect(hrefs).not.toContain("/admin/departments");
      expect(hrefs).not.toContain("/admin/users");
      expect(hrefs).not.toContain("/admin/roles");
    });

    it("allocates technical fleet maintenance and incident visibility to Maintenance role", () => {
      const maintNav = getNavigation(["Maintenance"], "admin");
      const hrefs = maintNav.map((item) => item.href);

      expect(hrefs).toContain("/admin");
      expect(hrefs).toContain("/admin/inspections");
      expect(hrefs).toContain("/admin/maintenance");
      expect(hrefs).toContain("/admin/vehicles");
      expect(hrefs).toContain("/admin/reports"); // Xem sự cố kỹ thuật xe

      expect(hrefs).not.toContain("/admin/rentals");
      expect(hrefs).not.toContain("/admin/handovers");
      expect(hrefs).not.toContain("/admin/dispatch");
      expect(hrefs).not.toContain("/admin/policies");
      expect(hrefs).not.toContain("/admin/customers");
    });

    it("never offers an admin menu item the role cannot open", () => {
      const roleSets: string[][] = [
        ["Admin"],
        ["Manager"],
        ["Staff"],
        ["CustomerService"],
        ["Maintenance"],
        ["Driver"],
        ["Customer"],
        ["Staff", "CustomerService"],
        ["Manager", "CustomerService"],
        ["Staff", "Admin"],
        ["Maintenance", "CustomerService"],
        ["Customer", "Staff"],
      ];

      for (const roles of roleSets) {
        for (const item of getNavigation(roles, "admin")) {
          expect(canAccessRoute(item.href, roles), `${roles.join("+")} → ${item.href}`).toBe(true);
        }
      }
      expect(getNavigation(["Customer"], "admin")).toHaveLength(0);
      expect(getNavigation([], "admin")).toHaveLength(0);
    });

    it("keeps valid links for combined roles without picking a single role", () => {
      const combined = getNavigation(["Staff", "Admin"], "admin").map((item) => item.href);
      expect(combined).toContain("/admin/rentals"); // Staff cấp quyền
      expect(combined).toContain("/admin/users"); // Admin cấp quyền
      expect(combined).toContain("/admin/drivers/schedule");
      expect(combined).toContain("/admin/reports");

      const csAndStaff = getNavigation(["CustomerService", "Staff"], "admin").map((item) => item.href);
      expect(csAndStaff).toContain("/admin/rentals");
      expect(csAndStaff).toContain("/admin/reports");
      expect(csAndStaff).not.toContain("/admin/users");
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

    it("keeps guest customer items unfiltered by route access", () => {
      // Vùng customer không áp canAccessRoute: chỉ lọc theo role hiển thị như trước
      expect(getNavigation(null, "customer").map((item) => item.href)).toEqual([
        "/booking",
        "/nearby-vehicles",
        "/invoices",
        "/payment-history",
        "/report-incident",
      ]);
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
