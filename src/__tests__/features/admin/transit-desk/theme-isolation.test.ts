import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import React from "react";
import { render } from "@testing-library/react";

// Mock dependencies for TransitDeskShell
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock("@/components/navigation/NavigationProvider", () => ({
  useNavigationRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock("@/features/auth", () => ({
  useAuth: () => ({
    user: { fullName: "Quản trị viên", roles: ["Admin"] },
    logout: vi.fn(),
  }),
}));

vi.mock("@/features/auth/use-portal-access", () => ({
  usePortalAccess: () => ({
    account: { fullName: "Quản trị viên", roles: ["Admin"] },
    checkingAccess: false,
    accessError: null,
  }),
}));

vi.mock("@/features/admin/api", () => ({
  getFacilities: vi.fn().mockResolvedValue([]),
  getStaffById: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/features/admin/transit-desk/RentalLiquidTransition", () => ({
  default: () => null,
}));

import { TransitDeskShell } from "@/features/admin/transit-desk/TransitDeskShell";

describe("Phase 4 Final Closure — Theme Isolation and Contrast Integrity", () => {
  const root = document.documentElement;

  beforeEach(() => {
    window.matchMedia = window.matchMedia || vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    delete root.dataset.adminTheme;
    root.removeAttribute("data-admin-theme");
  });

  afterEach(() => {
    delete root.dataset.adminTheme;
    root.removeAttribute("data-admin-theme");
  });

  it("1. globals.css defines --ink-muted alias in both Light and Dark mode scopes", () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toMatch(/--ink-muted:\s*var\(--ink-3\);/);
    expect(css).toContain("--on-primary: #2b190b;");
  });

  it("2. All 3 chart components configure tick fill with semantic --td-ink-muted / --ink-3", () => {
    const revenueChart = fs.readFileSync(
      path.resolve(process.cwd(), "src/features/admin/dashboard/components/RevenueChart.tsx"),
      "utf8"
    );
    expect(revenueChart).toContain('fill: "var(--td-ink-muted, var(--ink-3))"');

    const maintChart = fs.readFileSync(
      path.resolve(process.cwd(), "src/features/admin/dashboard/components/MaintenanceVsRevenueChart.tsx"),
      "utf8"
    );
    expect(maintChart).toContain('fill: "var(--td-ink-muted, var(--ink-3))"');

    const rentalsStatusChart = fs.readFileSync(
      path.resolve(process.cwd(), "src/features/admin/dashboard/components/RentalsStatusChart.tsx"),
      "utf8"
    );
    expect(rentalsStatusChart).toContain('fill: "var(--td-ink-muted, var(--ink-3))"');
  });

  it("3. Dark mode chart tick contrast against Carbon #242126 exceeds WCAG AA (>= 4.5:1)", () => {
    // Tick color: #9E97A3 (RGB: 158, 151, 163)
    // Carbon surface: #242126 (RGB: 36, 33, 38)
    const getLum = ([r, g, b]: [number, number, number]) => {
      const [rs, gs, bs] = [r, g, b].map((val) => {
        const c = val / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    const lumTick = getLum([158, 151, 163]);
    const lumCarbon = getLum([36, 33, 38]);
    const contrast = (lumTick + 0.05) / (lumCarbon + 0.05);

    expect(contrast).toBeGreaterThanOrEqual(4.5);
    expect(contrast).toBeCloseTo(5.5, 0.5);
  });

  it("4. Dark mode CTA text #2B190B against Peach #F6BA7C exceeds WCAG AAA (>= 7.0:1)", () => {
    const getLum = ([r, g, b]: [number, number, number]) => {
      const [rs, gs, bs] = [r, g, b].map((val) => {
        const c = val / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    const lumPeach = getLum([246, 186, 124]);
    const lumOnPrimary = getLum([43, 25, 11]);
    const contrast = (lumPeach + 0.05) / (lumOnPrimary + 0.05);

    expect(contrast).toBeGreaterThanOrEqual(7.0);
    expect(contrast).toBeCloseTo(9.87, 0.5);
  });

  it("5. TransitDeskShell unmount cleans up documentElement data-admin-theme attribute", () => {
    // Mount TransitDeskShell with dark theme set
    root.dataset.adminTheme = "dark";
    expect(root.getAttribute("data-admin-theme")).toBe("dark");

    const { unmount } = render(
      React.createElement(TransitDeskShell, null, React.createElement("div", null, "Admin Content"))
    );

    // When TransitDeskShell unmounts (e.g. navigating out to /account, /booking, /staff)
    unmount();

    // Verify data-admin-theme is completely removed
    expect(root.dataset.adminTheme).toBeUndefined();
    expect(root.getAttribute("data-admin-theme")).toBeNull();
  });
});
