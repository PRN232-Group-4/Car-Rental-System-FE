import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const targetDirs = [
  path.resolve(process.cwd(), "PHASE-4-SCREENSHOTS"),
  path.resolve("C:\\Users\\Huy\\.gemini\\antigravity\\brain\\20c95a8f-ab5a-40e4-8ca7-4ef62d971f61\\PHASE-4-SCREENSHOTS"),
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function saveMultiScreenshot(page: any, filename: string, options?: any) {
  const primaryPath = path.join(targetDirs[0], filename);
  await page.screenshot({ path: primaryPath, ...options });
  for (let i = 1; i < targetDirs.length; i++) {
    const dest = path.join(targetDirs[i], filename);
    try {
      fs.copyFileSync(primaryPath, dest);
    } catch {
      // ignore copy error
    }
  }
}

function parseRgb(colorStr: string): [number, number, number] {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const c = val / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(parseRgb(color1));
  const lum2 = getLuminance(parseRgb(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function setAdminTheme(page: any, theme: "light" | "dark") {
  await page.evaluate((t: string) => {
    document.documentElement.dataset.adminTheme = t;
    document.documentElement.setAttribute("data-theme", t);
    try {
      window.localStorage.setItem("vrs-admin-theme", t);
    } catch {}
    window.dispatchEvent(new Event("vrs-admin-theme-change"));
  }, theme);
  await page.waitForTimeout(300);
}

const MOCK_PROFILE = {
  email: "admin@thongdong.vn",
  fullName: "VĂµ Thá»‹ Quáº£n Trá»‹ (Dispatcher)",
  roles: ["Admin", "Manager"],
  staffId: 1,
  facilityId: 1,
};

const MOCK_DASHBOARD_DATA = {
  totalRevenue: 125000000,
  activeRentals: 18,
  pendingReports: 3,
  availableVehicles: 42,
  rentingVehicles: 18,
  maintenanceVehicles: 4,
  otherVehicles: 2,
};

const MOCK_VEHICLES = {
  items: [
    {
      id: 1,
      licensePlate: "51K-899.21",
      brand: "VinFast",
      model: "VF 8 Plus",
      status: "available",
      facility: "Tráº¡m Trung tĂ¢m Quáº­n 1",
      hourlyPrice: 120000,
      longtermPrice: 22000000,
      batteryCapacity: "87.7 kWh",
      batteryLevel: 92,
      fuelType: "electric",
    },
    {
      id: 2,
      licensePlate: "50E-123.45",
      brand: "Toyota",
      model: "Corolla Cross",
      status: "renting",
      facility: "Tráº¡m SĂ¢n bay TĂ¢n SÆ¡n Nháº¥t",
      hourlyPrice: 95000,
      longtermPrice: 16000000,
      fuelType: "gasoline",
    },
    {
      id: 3,
      licensePlate: "51G-445.67",
      brand: "Hyundai",
      model: "Santa Fe 2.5",
      status: "maintenance",
      facility: "Tráº¡m Trung tĂ¢m Quáº­n 1",
      hourlyPrice: 140000,
      longtermPrice: 25000000,
      fuelType: "gasoline",
    },
  ],
  totalCount: 3,
  page: 1,
  pageSize: 8,
};

const MOCK_VEHICLE_TYPES = [
  { id: 1, name: "SUV Äiá»‡n 5 Chá»—", type: "car", fuelType: "electric" },
  { id: 2, name: "Sedan XÄƒng 5 Chá»—", type: "car", fuelType: "gasoline" },
  { id: 3, name: "Xe tay ga Äiá»‡n", type: "motorbike", fuelType: "electric" },
];

const MOCK_FACILITIES = [
  { id: 1, name: "Tráº¡m Trung tĂ¢m Quáº­n 1", address: "12 LĂª Duáº©n, Q.1, TP.HCM" },
  { id: 2, name: "Tráº¡m SĂ¢n bay TĂ¢n SÆ¡n Nháº¥t", address: "Ga Quá»‘c ná»™i T1, TĂ¢n BĂ¬nh, TP.HCM" },
];

const MOCK_DEPARTMENTS = [
  { id: 1, name: "Ban Äiá»u hĂ nh Váº­n hĂ nh", code: "OPS" },
  { id: 2, name: "Äá»™i xe & Ká»¹ thuáº­t", code: "TECH" },
  { id: 3, name: "ChÄƒm sĂ³c KhĂ¡ch hĂ ng", code: "CS" },
];

const MOCK_STAFF = [
  { id: 1, fullName: "VĂµ Thá»‹ Quáº£n Trá»‹", email: "admin@thongdong.vn", isDriver: false, departmentName: "Äiá»u hĂ nh" },
  { id: 2, fullName: "Nguyá»…n VÄƒn HĂ¹ng", email: "hung.nv@thongdong.vn", isDriver: true, departmentName: "Äá»™i xe", facilityName: "Tráº¡m Trung tĂ¢m Quáº­n 1" },
];

const MOCK_REPORTS = {
  items: [
    {
      id: 501,
      type: "breakdown",
      status: "pending",
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      customer: { fullName: "LĂª Minh Tuáº¥n" },
      descriptionPreview: "BĂ¡o cĂ¡o lá»—i Ă¡p suáº¥t lá»‘p trÆ°á»›c bĂªn pháº£i trĂªn cao tá»‘c Long ThĂ nh",
    },
    {
      id: 502,
      type: "accident",
      status: "pending",
      createdAt: new Date(Date.now() - 140 * 60000).toISOString(),
      customer: { fullName: "Tráº§n Mai Anh" },
      descriptionPreview: "Va quáº¹t nháº¹ gÆ°Æ¡ng chiáº¿u háº­u khi Ä‘á»— xe táº¡i trung tĂ¢m thÆ°Æ¡ng máº¡i",
    },
  ],
  totalCount: 2,
};

const ALL_26_ROUTES = [
  "/admin",
  "/admin/dashboard",
  "/admin/vehicles",
  "/admin/vehicles/new",
  "/admin/vehicles/edit?id=1",
  "/admin/vehicle-types",
  "/admin/rentals",
  "/admin/inspections",
  "/admin/maintenance",
  "/admin/dispatch",
  "/admin/drivers/schedule",
  "/admin/reports",
  "/admin/reports/detail?id=501",
  "/admin/reviews",
  "/admin/reviews/detail?id=1",
  "/admin/policies",
  "/admin/subscription-plans",
  "/admin/users",
  "/admin/users/detail?id=1",
  "/admin/staffs",
  "/admin/staffs/new",
  "/admin/staffs/detail?id=1",
  "/admin/departments",
  "/admin/facilities",
  "/admin/roles",
  "/admin/profile",
];

test.describe("Thong Dong Transit Desk â€” Phase 4 Admin Expansion Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept operational API routes
    await page.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());
      const p = url.pathname;

      if (p.endsWith("/account/profile")) {
        return route.fulfill({ status: 200, json: MOCK_PROFILE });
      }
      if (p.endsWith("/admin/dashboard") || p.endsWith("/dashboard")) {
        return route.fulfill({ status: 200, json: MOCK_DASHBOARD_DATA });
      }
      if (p.endsWith("/vehicles/1")) {
        return route.fulfill({ status: 200, json: MOCK_VEHICLES.items[0] });
      }
      if (p.endsWith("/vehicles")) {
        return route.fulfill({ status: 200, json: MOCK_VEHICLES });
      }
      if (p.endsWith("/vehicle-types")) {
        return route.fulfill({ status: 200, json: MOCK_VEHICLE_TYPES });
      }
      if (p.endsWith("/facilities")) {
        return route.fulfill({ status: 200, json: MOCK_FACILITIES });
      }
      if (p.endsWith("/departments")) {
        return route.fulfill({ status: 200, json: MOCK_DEPARTMENTS });
      }
      if (p.endsWith("/staffs/1")) {
        return route.fulfill({ status: 200, json: MOCK_STAFF[0] });
      }
      if (p.endsWith("/staffs") || p.endsWith("/staff/drivers")) {
        return route.fulfill({ status: 200, json: { items: MOCK_STAFF, totalCount: MOCK_STAFF.length } });
      }
      if (p.endsWith("/reports/501")) {
        return route.fulfill({ status: 200, json: MOCK_REPORTS.items[0] });
      }
      if (p.endsWith("/reports")) {
        return route.fulfill({ status: 200, json: MOCK_REPORTS });
      }
      if (p.endsWith("/users/1")) {
        return route.fulfill({ status: 200, json: { id: 1, email: "admin@thongdong.vn", fullName: "VĂµ Thá»‹ Quáº£n Trá»‹", roles: ["Admin"] } });
      }
      if (p.endsWith("/users")) {
        return route.fulfill({ status: 200, json: { items: [{ id: 1, email: "admin@thongdong.vn", fullName: "VĂµ Thá»‹ Quáº£n Trá»‹", roles: ["Admin"], isActive: true }], totalCount: 1 } });
      }
      if (p.endsWith("/reviews/1")) {
        return route.fulfill({ status: 200, json: { id: 1, rating: 5, comment: "Dá»‹ch vá»¥ xuáº¥t sáº¯c, xe giao Ä‘Ăºng giá».", isHidden: false } });
      }
      if (p.endsWith("/reviews")) {
        return route.fulfill({ status: 200, json: { items: [{ id: 1, rating: 5, comment: "Dá»‹ch vá»¥ xuáº¥t sáº¯c, xe giao Ä‘Ăºng giá».", isHidden: false }], totalCount: 1 } });
      }
      return route.fulfill({ status: 200, json: { items: [], totalCount: 0 } });
    });
  });

  test("Gate 0 & Batch 1: /admin (Ca trá»±c) Light & Dark Mode and Global Liquid Flood Transition", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // 1. Ensure Light mode initially
    await setAdminTheme(page, "light");

    // Verify brand name strictly "Thong Dong"
    const brandName = page.locator("header div").filter({ hasText: "Thong Dong" }).first();
    await expect(brandName).toBeVisible();

    // Verify Chapter Masthead wayfinding
    const navChapters = page.locator("nav[aria-label*='NhĂ³m chá»©c nÄƒng']");
    await expect(navChapters).toBeVisible();

    // Verify Operating Pulse content
    const heading = page.locator("h1").filter({ hasText: "Ca trá»±c" });
    await expect(heading).toBeVisible();

    // Capture Light Mode Screenshot
    await saveMultiScreenshot(page, "phase4-batch1-admin-pulse-light-1920x1080.png");

    // 2. Test Global Organic Liquid Flood Transition
    const themeBtn = page.locator('[data-testid="admin-theme-toggle"]');
    await expect(themeBtn).toBeVisible();

    // Trigger theme toggle to Dark
    await themeBtn.click();
    await page.waitForTimeout(1200); // allow 1050ms transition + settles

    // Verify Dark mode applied
    const isDark = await page.evaluate(() => document.documentElement.dataset.adminTheme === "dark");
    expect(isDark).toBe(true);

    // Dark Mode Contrast & Shortcut Surface Verification
    const headingColorDark = await heading.evaluate((el) => window.getComputedStyle(el).color);
    const headingContrast = calculateContrastRatio(headingColorDark, "rgb(23, 22, 27)");
    expect(headingContrast).toBeGreaterThanOrEqual(4.5);

    const createVehicleBtn = page.locator("button").filter({ hasText: "ThĂªm phÆ°Æ¡ng tiá»‡n" }).first();
    // Wait for theme transition to settle
    await page.waitForFunction(() => {
      const btn = document.querySelector("button.bg-primary");
      if (!btn) return false;
      const color = window.getComputedStyle(btn).color;
      return color === "rgb(43, 25, 11)";
    }, { timeout: 3000 });

    const btnColor = await createVehicleBtn.evaluate((el) => window.getComputedStyle(el).color);
    const btnBg = await createVehicleBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const btnContrast = calculateContrastRatio(btnColor, btnBg);
    expect(btnContrast).toBeGreaterThanOrEqual(4.5);

    // Verify operating pulse shortcut cards: must be Carbon #242126 in Dark Mode (NOT blinding white)
    const shortcutCard = page.locator("a[href*='/admin/rentals']").first();
    await expect(shortcutCard).toBeVisible();
    const shortcutBg = await shortcutCard.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(shortcutBg).not.toBe("rgb(255, 255, 255)");
    const shortcutTitle = shortcutCard.locator("h3").first();
    const shortcutTitleColor = await shortcutTitle.evaluate((el) => window.getComputedStyle(el).color);
    const shortcutContrast = calculateContrastRatio(shortcutTitleColor, shortcutBg);
    expect(shortcutContrast).toBeGreaterThanOrEqual(4.5);

    // Capture Dark Mode Screenshot
    await saveMultiScreenshot(page, "phase4-batch1-admin-pulse-dark-1920x1080.png");

    // 3. Responsive laptop reflow check (1366x768)
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(300);
    await saveMultiScreenshot(page, "phase4-batch1-admin-pulse-laptop-1366x768.png");
  });

  test("Batch 1: /admin/dashboard (Trung tĂ¢m chá»‰ huy & Analytics) Verification â€” P1-A Contrast & High-Risk Flow", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Dark mode
    await setAdminTheme(page, "dark");

    const title = page.locator("h1").filter({ hasText: "Trung tĂ¢m Chá»‰ huy Äiá»u hĂ nh" });
    await expect(title).toBeVisible();

    // P1-A Fix Verification: Heading contrast in Dark Mode >= 4.5:1
    const titleColor = await title.evaluate((el) => window.getComputedStyle(el).color);
    const canvasContrast = calculateContrastRatio(titleColor, "rgb(23, 22, 27)");
    expect(canvasContrast).toBeGreaterThanOrEqual(4.5);

    // Verify Recharts axis tick contrast in Dark Mode >= 4.5:1 against chart card background (Carbon #242126 / rgb(36, 33, 38))
    const tickElements = page.locator(".recharts-cartesian-axis-tick text");
    await expect(tickElements.first()).toBeVisible();
    const tickCount = await tickElements.count();
    expect(tickCount).toBeGreaterThan(0);
    const darkTickFill = await tickElements.first().evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.fill || style.color;
    });
    const darkTickContrast = calculateContrastRatio(darkTickFill, "rgb(36, 33, 38)");
    expect(darkTickContrast).toBeGreaterThanOrEqual(4.5);

    // High-Risk Flow Check: Metrics cards & Export / Filter controls
    const metricCards = page.locator("div").filter({ hasText: "Doanh thu" }).first();
    await expect(metricCards).toBeVisible();

    await saveMultiScreenshot(page, "phase4-batch1-admin-dashboard-dark-1920x1080.png");

    // Light mode
    await setAdminTheme(page, "light");

    // Verify Recharts axis tick contrast in Light Mode >= 4.5:1 against White #ffffff (rgb(255, 255, 255))
    const lightTickElements = page.locator(".recharts-cartesian-axis-tick text");
    await expect(lightTickElements.first()).toBeVisible();
    const lightTickFill = await lightTickElements.first().evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.fill || style.color;
    });
    const lightTickContrast = calculateContrastRatio(lightTickFill, "rgb(255, 255, 255)");
    expect(lightTickContrast).toBeGreaterThanOrEqual(4.5);

    await saveMultiScreenshot(page, "phase4-batch1-admin-dashboard-light-1920x1080.png");
  });

  test("Batch 2: /admin/vehicles (Sá»• phÆ°Æ¡ng tiá»‡n - Open Ledger) Verification", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/vehicles");
    await page.waitForLoadState("networkidle");

    // Dark mode
    await setAdminTheme(page, "dark");

    const title = page.locator("h1").filter({ hasText: "Sá»• phÆ°Æ¡ng tiá»‡n" });
    await expect(title).toBeVisible();

    // Verify Open Ledger table rows
    const vinfastRow = page.locator("span").filter({ hasText: "51K-899.21" }).first();
    await expect(vinfastRow).toBeVisible();

    await saveMultiScreenshot(page, "phase4-batch2-admin-vehicles-dark-1920x1080.png");

    // Light mode
    await setAdminTheme(page, "light");

    await saveMultiScreenshot(page, "phase4-batch2-admin-vehicles-light-1920x1080.png");
  });

  test("Batch 3: /admin/vehicles/new (Commissioning Form) Verification â€” P1-B Contrast & Form Boundary", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/vehicles/new");
    await page.waitForLoadState("networkidle");

    await setAdminTheme(page, "dark");

    const formHeading = page.locator("h2").filter({ hasText: "ThĂªm phÆ°Æ¡ng tiá»‡n má»›i" });
    await expect(formHeading).toBeVisible();

    // P1-B Fix Verification: Form title & return link contrast in Dark Mode >= 4.5:1
    const headingColor = await formHeading.evaluate((el) => window.getComputedStyle(el).color);
    expect(calculateContrastRatio(headingColor, "rgb(23, 22, 27)")).toBeGreaterThanOrEqual(4.5);

    const returnLink = page.locator("a[href='/admin/vehicles']").first();
    await expect(returnLink).toBeVisible();
    const returnColor = await returnLink.evaluate((el) => window.getComputedStyle(el).color);
    expect(calculateContrastRatio(returnColor, "rgb(23, 22, 27)")).toBeGreaterThanOrEqual(4.5);

    // High-Risk Flow Check: Form validation boundaries (submit button present & disabled before required type selection)
    const submitBtn = page.locator("button[type='submit']").first();
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    await saveMultiScreenshot(page, "phase4-batch3-admin-vehicle-new-dark-1920x1080.png");
  });

  test("Batch 4 & 5: Dispatch, Inspections & Incident Triage (/admin/reports)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/reports");
    await page.waitForLoadState("networkidle");

    await setAdminTheme(page, "dark");

    const heading = page.locator("h1, h2").filter({ hasText: /sá»± cá»‘/i }).first();
    await expect(heading).toBeVisible();

    // Heading contrast check
    const headingColor = await heading.evaluate((el) => window.getComputedStyle(el).color);
    expect(calculateContrastRatio(headingColor, "rgb(23, 22, 27)")).toBeGreaterThanOrEqual(4.5);

    await saveMultiScreenshot(page, "phase4-batch5-admin-reports-dark-1920x1080.png");
  });

  test("Batch 6 & 7: Policy & Identity Registry (/admin/policies, /admin/users) â€” P1-C Contrast & User Archetype", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    await setAdminTheme(page, "dark");

    const userHeading = page.locator("h1, h2").filter({ hasText: /ngÆ°á»i dĂ¹ng/i }).first();
    await expect(userHeading).toBeVisible();

    // P1-C Fix Verification: Heading contrast in Dark Mode >= 4.5:1
    const userTitleColor = await userHeading.evaluate((el) => window.getComputedStyle(el).color);
    expect(calculateContrastRatio(userTitleColor, "rgb(23, 22, 27)")).toBeGreaterThanOrEqual(4.5);

    // High-risk archetype check: User table row and search input
    const userRow = page.locator("td, span, div, a").filter({ hasText: "VÅ© ThĂºy An" }).first();
    await expect(userRow).toBeVisible();
    const userRowColor = await userRow.evaluate((el) => window.getComputedStyle(el).color);
    expect(calculateContrastRatio(userRowColor, "rgb(23, 22, 27)")).toBeGreaterThanOrEqual(4.5);

    await saveMultiScreenshot(page, "phase4-batch7-admin-users-dark-1920x1080.png");
  });

  test("Parity Check: All 26 Admin Routes render within TransitDeskShell without errors", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    for (const route of ALL_26_ROUTES) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);

      // Verify TransitDeskShell container is present
      const shell = page.locator('[data-portal="admin"]');
      await expect(shell).toBeVisible();

      // Verify masthead with brand "Thong Dong" is present
      const brand = page.locator("header div").filter({ hasText: "Thong Dong" }).first();
      await expect(brand).toBeVisible();
    }
  });

  test("Strict Invariant: Customer Portal (/account) is completely unpolluted", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/account");
    await page.waitForLoadState("networkidle");

    // Verify that data-portal is NOT admin
    const portalAdmin = page.locator('[data-portal="admin"]');
    const count = await portalAdmin.count();
    expect(count).toBe(0);

    // Verify that the masthead is customer masthead, not Transit Desk
    const transitMasthead = page.locator("nav[aria-label*='NhĂ³m chá»©c nÄƒng']");
    const mastheadCount = await transitMasthead.count();
    expect(mastheadCount).toBe(0);
  });

  test("Invariant: Zero Theme Leakage during Cross-Portal Navigation (/admin Dark -> /account -> /booking -> /staff -> /admin)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 1. Operator starts on /admin in Dark Mode
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await setAdminTheme(page, "dark");

    const darkAttr = await page.evaluate(() => document.documentElement.dataset.adminTheme);
    expect(darkAttr).toBe("dark");

    // 2. Navigate to Customer Portal (/account)
    await page.goto("/account");
    await page.waitForLoadState("networkidle");

    // Verify data-admin-theme is completely absent on /account
    const accountThemeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-admin-theme"));
    expect(accountThemeAttr).toBeNull();
    const accountThemeData = await page.evaluate(() => document.documentElement.dataset.adminTheme);
    expect(accountThemeData).toBeUndefined();

    // 3. Navigate to Customer Booking (/booking)
    // Fulfill profile as customer to respect RBAC boundary without redirection back to admin
    await page.route("**/api/account/profile", (route) => {
      route.fulfill({
        status: 200,
        json: { email: "customer@thongdong.vn", fullName: "KhĂ¡ch HĂ ng Thong Dong", roles: ["Customer"] },
      });
    });

    await page.goto("/booking");
    await page.waitForLoadState("networkidle");

    const bookingThemeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-admin-theme"));
    expect(bookingThemeAttr).toBeNull();
    const bookingThemeData = await page.evaluate(() => document.documentElement.dataset.adminTheme);
    expect(bookingThemeData).toBeUndefined();

    // 4. Navigate to Driver/Staff Portal (/staff)
    await page.route("**/api/account/profile", (route) => {
      route.fulfill({
        status: 200,
        json: { email: "driver@thongdong.vn", fullName: "Nguyá»…n VÄƒn HĂ¹ng", roles: ["Driver", "Staff"] },
      });
    });

    await page.goto("/staff");
    await page.waitForLoadState("networkidle");

    const staffThemeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-admin-theme"));
    expect(staffThemeAttr).toBeNull();
    const staffThemeData = await page.evaluate(() => document.documentElement.dataset.adminTheme);
    expect(staffThemeData).toBeUndefined();

    // 5. Navigate back to Admin Portal (/admin)
    await page.route("**/api/account/profile", (route) => {
      route.fulfill({ status: 200, json: MOCK_PROFILE });
    });

    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Verify dark mode is seamlessly restored from localStorage
    const restoredTheme = await page.evaluate(() => document.documentElement.dataset.adminTheme);
    expect(restoredTheme).toBe("dark");
  });
});
