import { describe, expect, it } from "vitest";
import {
  ROLES,
  ROLE_LABELS,
  ROLE_CATEGORIES,
  ROLE_CATEGORY_LABELS,
  isRole,
  normalizeRole,
  isStaffPortalRole,
  isDriverRole,
  isCustomerRole,
  isManagementRole,
  type Role,
} from "@/features/auth/roles";
import {
  hasRole,
  hasAnyRole,
  normalizePathname,
  canAccessRoute,
} from "@/features/auth/access";

describe("RBAC Stress-Testing & Vulnerability Suite", () => {
  // =========================================================================
  // 1. Boundary Paths & Normalization
  // =========================================================================
  describe("1. Boundary Paths & Normalization", () => {
    it("handles root path '/'", () => {
      expect(normalizePathname("/")).toBe("/");
      expect(canAccessRoute("/", null)).toBe(true);
      expect(canAccessRoute("/", [])).toBe(true);
      expect(canAccessRoute("/", ["Customer"])).toBe(true);
      expect(canAccessRoute("/", ["Admin"])).toBe(true);
    });

    it("handles unmapped routes as public", () => {
      expect(canAccessRoute("/unknown-route", null)).toBe(true);
      expect(canAccessRoute("/about-us", null)).toBe(true);
      expect(canAccessRoute("/contact", null)).toBe(true);
      expect(canAccessRoute("/pricing", null)).toBe(true);
    });

    it("handles nested routes under /admin/users/", () => {
      expect(canAccessRoute("/admin/users/123", ["Admin"])).toBe(true);
      expect(canAccessRoute("/admin/users/123/edit", ["Admin"])).toBe(true);
      expect(canAccessRoute("/admin/users/123", ["Staff"])).toBe(false);
      expect(canAccessRoute("/admin/users/123", ["Manager"])).toBe(false);
      expect(canAccessRoute("/admin/users/123", null)).toBe(false);
    });

    it("handles routes with query parameters", () => {
      expect(normalizePathname("/admin/vehicles?status=active")).toBe("/admin/vehicles");
      expect(canAccessRoute("/admin/vehicles?status=active", ["Staff"])).toBe(true);
      expect(canAccessRoute("/admin/vehicles?status=active", ["Customer"])).toBe(false);

      expect(normalizePathname("/admin/users?page=2&limit=50")).toBe("/admin/users");
      expect(canAccessRoute("/admin/users?page=2&limit=50", ["Admin"])).toBe(true);
      expect(canAccessRoute("/admin/users?page=2&limit=50", ["Staff"])).toBe(false);
    });

    it("handles routes with hashes", () => {
      expect(normalizePathname("/booking#step-2")).toBe("/booking");
      expect(canAccessRoute("/booking#step-2", ["Customer"])).toBe(true);
      expect(canAccessRoute("/booking#step-2", null)).toBe(false);

      expect(normalizePathname("/admin/policies#cancellation")).toBe("/admin/policies");
      expect(canAccessRoute("/admin/policies#cancellation", ["Manager"])).toBe(true);
      expect(canAccessRoute("/admin/policies#cancellation", ["Staff"])).toBe(false);
    });

    it("handles single trailing slashes", () => {
      expect(normalizePathname("/admin/")).toBe("/admin");
      expect(normalizePathname("/admin/users/")).toBe("/admin/users");
      expect(normalizePathname("/staff/")).toBe("/staff");

      expect(canAccessRoute("/admin/", ["Staff"])).toBe(true);
      expect(canAccessRoute("/admin/users/", ["Staff"])).toBe(false);
      expect(canAccessRoute("/admin/users/", ["Admin"])).toBe(true);
    });

    it("boundary test: empty or whitespace paths", () => {
      expect(normalizePathname("")).toBe("/");
      expect(normalizePathname("   ")).toBe("/");
      expect(canAccessRoute("", null)).toBe(true);
      expect(canAccessRoute("   ", null)).toBe(true);
    });

    // --- Adversarial & Failure Scenarios ---

    it("[SECURITY VULNERABILITY #1] consecutive slashes '/admin//users' must NOT grant Staff access to Admin-only route", () => {
      // In a secure RBAC guard, path normalization should collapse consecutive slashes.
      // If uncollapsed, /admin//users startsWith('/admin/') but not '/admin/users/',
      // matching the general /admin rule and granting Staff access!
      const canStaffAccess = canAccessRoute("/admin//users", ["Staff"]);
      expect(canStaffAccess).toBe(false);
    });

    it("[SECURITY VULNERABILITY #2] uppercase path variations '/Admin/users' must NOT bypass authentication for anonymous guests", () => {
      // In a secure guard, path normalization must be case-insensitive (e.g. .toLowerCase()).
      // Currently, /Admin/users matches 0 rules and defaults to public (true)!
      const canGuestAccess = canAccessRoute("/Admin/users", null);
      expect(canGuestAccess).toBe(false);
    });

    it("[SECURITY VULNERABILITY #2b] uppercase path variations '/Profile' must NOT bypass authentication for anonymous guests", () => {
      const canGuestAccess = canAccessRoute("/Profile", null);
      expect(canGuestAccess).toBe(false);
    });

    it("[SECURITY VULNERABILITY #2c] uppercase path variations '/Staff' must NOT bypass authentication for anonymous guests", () => {
      const canGuestAccess = canAccessRoute("/Staff", null);
      expect(canGuestAccess).toBe(false);
    });

    it("[SECURITY VULNERABILITY #1b] dot segments '/admin/./users' must NOT grant Staff access to Admin-only route", () => {
      const canStaffAccess = canAccessRoute("/admin/./users", ["Staff"]);
      expect(canStaffAccess).toBe(false);
    });

    it("[DEFENSIVE EDGE CASE #3] normalizePathname should collapse multiple trailing slashes '/admin///'", () => {
      expect(normalizePathname("/admin///")).toBe("/admin");
    });
  });

  // =========================================================================
  // 2. Longest Prefix Matching (LPM) Precedence
  // =========================================================================
  describe("2. Longest Prefix Matching Precedence", () => {
    it("/admin/users strictly requires Admin even though /admin allows Staff", () => {
      expect(canAccessRoute("/admin", ["Staff"])).toBe(true);
      expect(canAccessRoute("/admin/users", ["Staff"])).toBe(false);
      expect(canAccessRoute("/admin/users", ["Admin"])).toBe(true);
      expect(canAccessRoute("/admin/users", ["Manager"])).toBe(false);
      expect(canAccessRoute("/admin/users", ["CustomerService"])).toBe(false);
      expect(canAccessRoute("/admin/users", ["Maintenance"])).toBe(false);
      expect(canAccessRoute("/admin/users", ["Driver"])).toBe(false);
      expect(canAccessRoute("/admin/users", ["Customer"])).toBe(false);
    });

    it("/admin/roles strictly requires Admin only", () => {
      expect(canAccessRoute("/admin/roles", ["Admin"])).toBe(true);
      expect(canAccessRoute("/admin/roles", ["Manager"])).toBe(false);
      expect(canAccessRoute("/admin/roles", ["Staff"])).toBe(false);
      expect(canAccessRoute("/admin/roles", null)).toBe(false);
    });

    it("/admin/departments strictly requires Admin only", () => {
      expect(canAccessRoute("/admin/departments", ["Admin"])).toBe(true);
      expect(canAccessRoute("/admin/departments", ["Manager"])).toBe(false);
      expect(canAccessRoute("/admin/departments", ["Staff"])).toBe(false);
      expect(canAccessRoute("/admin/departments", null)).toBe(false);
    });

    it("/admin/facilities requires Admin or Manager", () => {
      expect(canAccessRoute("/admin/facilities", ["Admin"])).toBe(true);
      expect(canAccessRoute("/admin/facilities", ["Manager"])).toBe(true);
      expect(canAccessRoute("/admin/facilities", ["Staff"])).toBe(false);
      expect(canAccessRoute("/admin/facilities", null)).toBe(false);
    });

    it("/admin/staffs, /admin/policies, /admin/reviews, /admin/dashboard require Admin or Manager", () => {
      const routes = ["/admin/staffs", "/admin/policies", "/admin/reviews", "/admin/dashboard"];
      for (const route of routes) {
        expect(canAccessRoute(route, ["Admin"])).toBe(true);
        expect(canAccessRoute(route, ["Manager"])).toBe(true);
        expect(canAccessRoute(route, ["Staff"])).toBe(false);
        expect(canAccessRoute(route, ["CustomerService"])).toBe(false);
        expect(canAccessRoute(route, ["Maintenance"])).toBe(false);
        expect(canAccessRoute(route, ["Driver"])).toBe(false);
        expect(canAccessRoute(route, ["Customer"])).toBe(false);
        expect(canAccessRoute(route, null)).toBe(false);
      }
    });

    it("/admin/dispatch allows CustomerService in addition to Staff, Manager, Admin", () => {
      expect(canAccessRoute("/admin/dispatch", ["CustomerService"])).toBe(true);
      expect(canAccessRoute("/admin/dispatch", ["Staff"])).toBe(true);
      expect(canAccessRoute("/admin/dispatch", ["Manager"])).toBe(true);
      expect(canAccessRoute("/admin/dispatch", ["Admin"])).toBe(true);
      expect(canAccessRoute("/admin/dispatch", ["Maintenance"])).toBe(false);
      expect(canAccessRoute("/admin/dispatch", ["Driver"])).toBe(false);
      expect(canAccessRoute("/admin/dispatch", ["Customer"])).toBe(false);
      expect(canAccessRoute("/admin/dispatch", null)).toBe(false);
    });

    it("/admin/drivers allows Staff, Manager, Admin (not CustomerService)", () => {
      expect(canAccessRoute("/admin/drivers", ["Staff"])).toBe(true);
      expect(canAccessRoute("/admin/drivers", ["Manager"])).toBe(true);
      expect(canAccessRoute("/admin/drivers", ["Admin"])).toBe(true);
      expect(canAccessRoute("/admin/drivers", ["CustomerService"])).toBe(false);
      expect(canAccessRoute("/admin/drivers", ["Maintenance"])).toBe(false);
      expect(canAccessRoute("/admin/drivers", ["Driver"])).toBe(false);
      expect(canAccessRoute("/admin/drivers", null)).toBe(false);
    });

    it("/staff portal allows Driver, Admin, Manager, Staff", () => {
      expect(canAccessRoute("/staff", ["Driver"])).toBe(true);
      expect(canAccessRoute("/staff", ["Admin"])).toBe(true);
      expect(canAccessRoute("/staff", ["Manager"])).toBe(true);
      expect(canAccessRoute("/staff", ["Staff"])).toBe(true);
      expect(canAccessRoute("/staff", ["CustomerService"])).toBe(false);
      expect(canAccessRoute("/staff", ["Maintenance"])).toBe(false);
      expect(canAccessRoute("/staff", ["Customer"])).toBe(false);
      expect(canAccessRoute("/staff", null)).toBe(false);
    });

    it("Customer-only routes strictly allow Customer only", () => {
      const customerRoutes = ["/driver-license", "/my-subscriptions", "/rental-contract"];
      for (const route of customerRoutes) {
        expect(canAccessRoute(route, ["Customer"])).toBe(true);
        expect(canAccessRoute(route, ["Admin"])).toBe(false);
        expect(canAccessRoute(route, ["Staff"])).toBe(false);
        expect(canAccessRoute(route, ["Driver"])).toBe(false);
        expect(canAccessRoute(route, ["Manager"])).toBe(false);
        expect(canAccessRoute(route, null)).toBe(false);
      }
    });

    it("Authenticated routes allow any authenticated user but deny guests", () => {
      const authRoutes = ["/booking", "/invoices", "/payment-history", "/report-incident", "/profile"];
      for (const route of authRoutes) {
        expect(canAccessRoute(route, ["Customer"])).toBe(true);
        expect(canAccessRoute(route, ["Staff"])).toBe(true);
        expect(canAccessRoute(route, ["Admin"])).toBe(true);
        expect(canAccessRoute(route, ["Driver"])).toBe(true);
        expect(canAccessRoute(route, null)).toBe(false);
        expect(canAccessRoute(route, undefined)).toBe(false);
        expect(canAccessRoute(route, [])).toBe(false);
      }
    });
  });

  // =========================================================================
  // 3. Null, Undefined, Malformed & Hostile Inputs
  // =========================================================================
  describe("3. Null, Undefined, Malformed & Hostile Inputs", () => {
    describe("hasRole edge cases", () => {
      it("returns false gracefully on null, undefined, and empty array", () => {
        expect(hasRole(null, "Admin")).toBe(false);
        expect(hasRole(undefined, "Admin")).toBe(false);
        expect(hasRole([], "Admin")).toBe(false);
      });

      it("handles whitespace in user roles and target role", () => {
        expect(hasRole(["  Admin  "], "admin")).toBe(true);
        expect(hasRole(["Admin"], "  admin  ")).toBe(true);
      });

      it("[CRASH BUG #4] handles array with null or undefined elements without throwing", () => {
        let threw = false;
        try {
          hasRole([null as unknown as string], "Admin");
          hasRole(["Customer", null as unknown as string], "Admin");
          hasRole(["Customer", undefined as unknown as string], "Customer");
        } catch {
          threw = true;
        }
        expect(threw).toBe(false);
      });

      it("[CRASH BUG #5] handles null, undefined, or empty requiredRole without throwing", () => {
        let threw = false;
        try {
          hasRole(["Customer"], null as unknown as string);
          hasRole(["Customer"], undefined as unknown as string);
        } catch {
          threw = true;
        }
        expect(threw).toBe(false);
      });
    });

    describe("hasAnyRole edge cases", () => {
      it("returns false on null, undefined, or empty arrays", () => {
        expect(hasAnyRole(null, ["Admin"])).toBe(false);
        expect(hasAnyRole(undefined, ["Admin"])).toBe(false);
        expect(hasAnyRole([], ["Admin"])).toBe(false);
        expect(hasAnyRole(["Admin"], [])).toBe(false);
        expect(hasAnyRole(["Admin"], null as unknown as readonly string[])).toBe(false);
        expect(hasAnyRole(["Admin"], undefined as unknown as readonly string[])).toBe(false);
      });

      it("[CRASH BUG #6] handles userRoles containing null or non-strings without throwing", () => {
        let threw = false;
        try {
          hasAnyRole(["Admin", null as unknown as string], ["Admin"]);
          hasAnyRole([null as unknown as string], ["Admin"]);
          hasAnyRole([undefined as unknown as string], ["Admin"]);
        } catch {
          threw = true;
        }
        expect(threw).toBe(false);
      });

      it("[CRASH BUG #7] handles allowedRoles containing null or non-strings without throwing", () => {
        let threw = false;
        try {
          hasAnyRole(["Admin"], ["Admin", null as unknown as string]);
          hasAnyRole(["Admin"], [null as unknown as string]);
        } catch {
          threw = true;
        }
        expect(threw).toBe(false);
      });
    });

    describe("roles.ts helper edge cases", () => {
      it("isRole safely returns false for non-string, null, and undefined", () => {
        expect(isRole(null)).toBe(false);
        expect(isRole(undefined)).toBe(false);
        expect(isRole(123)).toBe(false);
        expect(isRole({})).toBe(false);
        expect(isRole([])).toBe(false);
        expect(isRole("")).toBe(false);
        expect(isRole("   ")).toBe(false);
      });

      it("[CRASH BUG #8] normalizeRole safely handles null, undefined, non-string, or unknown values", () => {
        expect(normalizeRole("unknown")).toBeNull();
        expect(normalizeRole("")).toBeNull();
        expect(normalizeRole("   ")).toBeNull();

        let threw = false;
        try {
          normalizeRole(null as unknown as string);
          normalizeRole(undefined as unknown as string);
          normalizeRole(123 as unknown as string);
        } catch {
          threw = true;
        }
        expect(threw).toBe(false);
      });

      it("[CRASH BUG #9] isStaffPortalRole safely handles null or invalid values", () => {
        let threw = false;
        try {
          isStaffPortalRole(null as unknown as string);
          isStaffPortalRole(undefined as unknown as string);
        } catch {
          threw = true;
        }
        expect(threw).toBe(false);
      });

      it("[CRASH BUG #10] isDriverRole, isCustomerRole, isManagementRole safely handle null or invalid values", () => {
        let threw = false;
        try {
          isDriverRole(null as unknown as string);
          isCustomerRole(null as unknown as string);
          isManagementRole(null as unknown as string);
        } catch {
          threw = true;
        }
        expect(threw).toBe(false);
      });
    });
  });

  // =========================================================================
  // 4. Contract Specifications: All 7 Roles
  // =========================================================================
  describe("4. Contract Specifications: All 7 Roles", () => {
    const expectedRoles: Role[] = [
      "Customer",
      "Staff",
      "Admin",
      "Driver",
      "Maintenance",
      "Manager",
      "CustomerService",
    ];

    it("verifies exactly all 7 roles exist in ROLES array", () => {
      expect(ROLES).toHaveLength(7);
      expect([...ROLES].sort()).toEqual([...expectedRoles].sort());
    });

    it("verifies every role has a Vietnamese label, category, and category label", () => {
      for (const role of expectedRoles) {
        expect(ROLE_LABELS[role]).toBeTruthy();
        const cat = ROLE_CATEGORIES[role];
        expect(cat).toBeTruthy();
        expect(ROLE_CATEGORY_LABELS[cat]).toBeTruthy();
      }
    });

    it("verifies helper predicates classify roles accurately", () => {
      // isDriverRole
      expect(isDriverRole("Driver")).toBe(true);
      expect(isDriverRole("driver")).toBe(true);
      expect(isDriverRole("Staff")).toBe(false);

      // isCustomerRole
      expect(isCustomerRole("Customer")).toBe(true);
      expect(isCustomerRole("customer")).toBe(true);
      expect(isCustomerRole("Admin")).toBe(false);

      // isManagementRole
      expect(isManagementRole("Admin")).toBe(true);
      expect(isManagementRole("Manager")).toBe(true);
      expect(isManagementRole("Staff")).toBe(false);
      expect(isManagementRole("Customer")).toBe(false);

      // isStaffPortalRole
      expect(isStaffPortalRole("Admin")).toBe(true);
      expect(isStaffPortalRole("Manager")).toBe(true);
      expect(isStaffPortalRole("Staff")).toBe(true);
      expect(isStaffPortalRole("CustomerService")).toBe(true);
      expect(isStaffPortalRole("Maintenance")).toBe(true);
      expect(isStaffPortalRole("Driver")).toBe(false);
      expect(isStaffPortalRole("Customer")).toBe(false);
    });
  });
});
