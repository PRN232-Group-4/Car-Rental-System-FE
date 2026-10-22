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
} from "@/features/auth/roles";
import {
  hasRole,
  hasAnyRole,
  normalizePathname,
  canAccessRoute,
} from "@/features/auth/access";

describe("Challenger M2-Fix: Adversarial Boundary & Stress Harness", () => {
  // =========================================================================
  // 1. Extreme Normalization Mutations
  // =========================================================================
  describe("1. normalizePathname - Boundary Mutations & Path Normalization", () => {
    it("handles extreme consecutive slash mutations", () => {
      expect(normalizePathname("////")).toBe("/");
      expect(normalizePathname("///admin///users///")).toBe("/admin/users");
      expect(normalizePathname("//admin//")).toBe("/admin");
      expect(normalizePathname("/admin//////")).toBe("/admin");
    });

    it("handles backslash normalization (Windows path separators)", () => {
      expect(normalizePathname("\\admin\\users")).toBe("/admin/users");
      expect(normalizePathname("\\\\admin\\\\users\\\\")).toBe("/admin/users");
      expect(normalizePathname("/admin\\users/123\\details")).toBe("/admin/users/123/details");
    });

    it("handles multiple consecutive and trailing dot segments (/./)", () => {
      expect(normalizePathname("/admin/./users")).toBe("/admin/users");
      expect(normalizePathname("/admin/./././users")).toBe("/admin/users");
      expect(normalizePathname("/./admin/users")).toBe("/admin/users");
      expect(normalizePathname("/admin/users/.")).toBe("/admin/users");
      expect(normalizePathname("/admin/users/./")).toBe("/admin/users");
    });

    it("handles query params, hashes, and whitespace stripping combined", () => {
      expect(normalizePathname("  /admin/users?id=123&sort=asc#top  ")).toBe("/admin/users");
      expect(normalizePathname("  /booking#summary?leak=false  ")).toBe("/booking");
      expect(normalizePathname("?queryOnly=true")).toBe("/");
      expect(normalizePathname("#hashOnly")).toBe("/");
    });

    it("handles mixed case paths by converting to canonical lowercase", () => {
      expect(normalizePathname("/ADMIN/USERS")).toBe("/admin/users");
      expect(normalizePathname("/Admin/Facilities/New")).toBe("/admin/facilities/new");
      expect(normalizePathname("/sTaFf/ShIfTs")).toBe("/staff/shifts");
      expect(normalizePathname("/pRoFiLe")).toBe("/profile");
    });

    it("handles hostile non-string and empty inputs gracefully without throwing", () => {
      expect(normalizePathname("")).toBe("/");
      expect(normalizePathname("   ")).toBe("/");
      expect(normalizePathname(null as unknown as string)).toBe("/");
      expect(normalizePathname(undefined as unknown as string)).toBe("/");
      expect(normalizePathname(123 as unknown as string)).toBe("/");
      expect(normalizePathname({} as unknown as string)).toBe("/");
      expect(normalizePathname([] as unknown as string)).toBe("/");
    });
  });

  // =========================================================================
  // 2. hasRole & hasAnyRole Defensive Boundary Testing
  // =========================================================================
  describe("2. hasRole & hasAnyRole Defensive Hardening", () => {
    it("hasRole handles corrupted userRoles and requiredRole permutations", () => {
      expect(hasRole(null, "Admin")).toBe(false);
      expect(hasRole(undefined, "Admin")).toBe(false);
      expect(hasRole([], "Admin")).toBe(false);
      expect(hasRole("not-an-array" as unknown as readonly string[], "Admin")).toBe(false);
      expect(hasRole(123 as unknown as readonly string[], "Admin")).toBe(false);
      expect(hasRole({} as unknown as readonly string[], "Admin")).toBe(false);

      // Malformed array contents
      expect(hasRole([null as unknown as string, undefined as unknown as string, 123 as unknown as string], "Admin")).toBe(false);
      expect(hasRole(["", "   "], "Admin")).toBe(false);
      expect(hasRole(["Customer", null as unknown as string], "Customer")).toBe(true);

      // Malformed target role
      expect(hasRole(["Admin"], null as unknown as string)).toBe(false);
      expect(hasRole(["Admin"], undefined as unknown as string)).toBe(false);
      expect(hasRole(["Admin"], "")).toBe(false);
      expect(hasRole(["Admin"], "   ")).toBe(false);
      expect(hasRole(["Admin"], 123 as unknown as string)).toBe(false);
      expect(hasRole(["Admin"], {} as unknown as string)).toBe(false);

      // Case and whitespace insensitivity
      expect(hasRole(["  ADMIN  "], "admin")).toBe(true);
      expect(hasRole(["staff"], "   STAFF   ")).toBe(true);
    });

    it("hasAnyRole handles corrupt arguments and non-array types without throwing", () => {
      expect(hasAnyRole(null, null)).toBe(false);
      expect(hasAnyRole(undefined, undefined)).toBe(false);
      expect(hasAnyRole([], [])).toBe(false);
      expect(hasAnyRole("Admin" as unknown as readonly string[], ["Admin"])).toBe(false);
      expect(hasAnyRole(["Admin"], "Admin" as unknown as readonly string[])).toBe(false);

      // Arrays with non-string and empty elements
      expect(hasAnyRole([null as unknown as string, ""], ["Admin"])).toBe(false);
      expect(hasAnyRole(["Admin"], [null as unknown as string, ""])).toBe(false);
      expect(hasAnyRole(["   "], ["   "])).toBe(false);

      // Valid matches with whitespace and differing case
      expect(hasAnyRole(["  Customer  "], ["customer"])).toBe(true);
      expect(hasAnyRole(["Customer"], ["  CUSTOMER  "])).toBe(true);
      expect(hasAnyRole(["Staff", null as unknown as string], ["Driver", "staff"])).toBe(true);
    });
  });

  // =========================================================================
  // 3. canAccessRoute - Longest Prefix Match & Boundary Authorization
  // =========================================================================
  describe("3. canAccessRoute - Longest Prefix Match & Security Enforcement", () => {
    it("strictly prevents Staff from accessing /admin/users across slash/dot mutations", () => {
      const staffRoles = ["Staff"];
      const adminRoles = ["Admin"];

      // Variations that previously bypassed LPM by matching /admin instead of /admin/users
      const attackPaths = [
        "/admin/users",
        "/admin//users",
        "/admin///users",
        "/admin/./users",
        "/admin/././users",
        "/admin/users/",
        "/admin/users///",
        "\\admin\\users",
        "/ADMIN/USERS",
        "/Admin//Users",
        "/admin/users?query=test",
        "/admin/users#target",
      ];

      for (const path of attackPaths) {
        // Staff MUST be denied
        expect(canAccessRoute(path, staffRoles)).toBe(false);
        // Admin MUST be allowed
        expect(canAccessRoute(path, adminRoles)).toBe(true);
        // Unauthenticated visitor MUST be denied
        expect(canAccessRoute(path, null)).toBe(false);
        expect(canAccessRoute(path, [])).toBe(false);
      }
    });

    it("strictly prevents bypass on Admin-only routes (/admin/roles, /departments)", () => {
      const adminOnlyRoutes = [
        "/admin/roles",
        "/admin//roles",
        "/admin/departments",
        "/admin/./departments",
      ];

      for (const route of adminOnlyRoutes) {
        expect(canAccessRoute(route, ["Admin"])).toBe(true);
        expect(canAccessRoute(route, ["Manager"])).toBe(false);
        expect(canAccessRoute(route, ["Staff"])).toBe(false);
        expect(canAccessRoute(route, ["CustomerService"])).toBe(false);
        expect(canAccessRoute(route, ["Maintenance"])).toBe(false);
        expect(canAccessRoute(route, ["Driver"])).toBe(false);
        expect(canAccessRoute(route, ["Customer"])).toBe(false);
        expect(canAccessRoute(route, null)).toBe(false);
      }
    });

    it("verifies authenticated-only routes strictly deny non-authenticated inputs", () => {
      const authRoutes = ["/booking", "/invoices", "/payment-history", "/report-incident", "/profile"];

      for (const route of authRoutes) {
        // Authenticated users with valid string roles allowed
        expect(canAccessRoute(route, ["Customer"])).toBe(true);
        expect(canAccessRoute(route, ["Driver"])).toBe(true);
        expect(canAccessRoute(route, ["Staff"])).toBe(true);

        // Anonymous or corrupted userRoles denied
        expect(canAccessRoute(route, null)).toBe(false);
        expect(canAccessRoute(route, undefined)).toBe(false);
        expect(canAccessRoute(route, [])).toBe(false);
        expect(canAccessRoute(route, [""])).toBe(false);
        expect(canAccessRoute(route, ["   "])).toBe(false);
        expect(canAccessRoute(route, [null as unknown as string])).toBe(false);
      }
    });

    it("verifies unmapped paths allow any visitor", () => {
      expect(canAccessRoute("/vehicles", null)).toBe(true);
      expect(canAccessRoute("/vehicles/detail", null)).toBe(true);
      expect(canAccessRoute("/about", null)).toBe(true);
      expect(canAccessRoute("/", null)).toBe(true);
    });

    it("handles non-string pathname in canAccessRoute gracefully without throwing", () => {
      expect(canAccessRoute(null as unknown as string, null)).toBe(true);
      expect(canAccessRoute(undefined as unknown as string, null)).toBe(true);
      expect(canAccessRoute(123 as unknown as string, null)).toBe(true);
    });
  });

  // =========================================================================
  // 4. roles.ts Helper Functions Defensive Boundary
  // =========================================================================
  describe("4. roles.ts Helpers - Defensive Boundary", () => {
    it("normalizeRole rejects invalid, empty, or whitespace strings", () => {
      expect(normalizeRole("")).toBeNull();
      expect(normalizeRole("   ")).toBeNull();
      expect(normalizeRole("SuperAdmin")).toBeNull();
      expect(normalizeRole(null)).toBeNull();
      expect(normalizeRole(undefined)).toBeNull();
      expect(normalizeRole(123)).toBeNull();
      expect(normalizeRole({})).toBeNull();
      expect(normalizeRole([])).toBeNull();
    });

    it("isRole accurately identifies valid roles irrespective of case/whitespace", () => {
      expect(isRole("Admin")).toBe(true);
      expect(isRole("admin")).toBe(true);
      expect(isRole("  ADMIN  ")).toBe(true);
      expect(isRole("CustomerService")).toBe(true);
      expect(isRole("customerservice")).toBe(true);
      expect(isRole("fake_role")).toBe(false);
      expect(isRole(null)).toBe(false);
    });

    it("predicate helpers safely evaluate against corrupt inputs without throwing", () => {
      const predicates = [isStaffPortalRole, isDriverRole, isCustomerRole, isManagementRole];
      const badInputs = [null, undefined, 123, {}, [], "", "   ", "InvalidRole"];

      for (const pred of predicates) {
        for (const input of badInputs) {
          expect(pred(input)).toBe(false);
        }
      }
    });

    it("ensures all 7 contract roles map correctly in metadata dictionaries", () => {
      expect(ROLES).toHaveLength(7);
      for (const r of ROLES) {
        expect(typeof ROLE_LABELS[r]).toBe("string");
        expect(ROLE_LABELS[r].length).toBeGreaterThan(0);
        const cat = ROLE_CATEGORIES[r];
        expect(cat).toBeDefined();
        expect(typeof ROLE_CATEGORY_LABELS[cat]).toBe("string");
        expect(ROLE_CATEGORY_LABELS[cat].length).toBeGreaterThan(0);
      }
    });
  });
});
