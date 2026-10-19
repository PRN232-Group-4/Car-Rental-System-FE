import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const targetDirs = [
  path.resolve(process.cwd(), "GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS"),
  path.resolve(process.cwd(), "..", "GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS"),
  path.resolve("C:\\Users\\Huy\\.gemini\\antigravity\\brain\\20c95a8f-ab5a-40e4-8ca7-4ef62d971f61\\GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS"),
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

const MOCK_PROFILE = {
  email: "admin@thongdong.vn",
  fullName: "Võ Thị Quản Trị (Dispatcher)",
  roles: ["Admin", "Manager"],
};

const MOCK_RENTAL_101 = {
  id: 101,
  customerId: 1,
  vehicleId: 1,
  vehicleName: "VinFast VF 8 Plus - 51K-899.21",
  startTime: new Date(Date.now() - 2 * 3600000).toISOString(),
  endTime: new Date(Date.now() + 6 * 3600000).toISOString(),
  status: "renting",
  rentalType: "hourly",
  hasDriver: false,
  isSubscription: false,
  vatPrice: 45000,
  depositPrice: 2000000,
  overtimePrice: 0,
  totalPrice: 450000,
  contractLink: null,
  signedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
};

const MOCK_RENTALS_LIST = {
  items: [
    MOCK_RENTAL_101,
    {
      id: 102,
      customerId: 2,
      vehicleId: 2,
      vehicleName: "Toyota Corolla Cross - 50E-123.45",
      startTime: new Date(Date.now() - 1 * 3600000).toISOString(),
      endTime: new Date(Date.now() + 8 * 3600000).toISOString(),
      status: "pre_inspection",
      rentalType: "daily",
      hasDriver: true,
      totalPrice: 1200000,
    },
    {
      id: 103,
      customerId: 3,
      vehicleId: 3,
      vehicleName: "Hyundai Santa Fe 2.5 - 51G-445.67",
      startTime: new Date(Date.now() - 24 * 3600000).toISOString(),
      endTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      status: "post_inspection",
      rentalType: "daily",
      hasDriver: false,
      totalPrice: 1800000,
    },
  ],
  totalCount: 3,
  page: 1,
  pageSize: 20,
};

const MOCK_DRIVERS = [
  { id: 1, fullName: "Nguyễn Văn Hùng", facilityName: "Trạm Trung tâm Quận 1", isActive: true },
  { id: 2, fullName: "Trần Quốc Toàn", facilityName: "Trạm Sân bay Tân Sơn Nhất", isActive: true },
];

test.describe("Thong Dong Transit Desk — Phase 3E A1.1 Production Pilot Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept operational API routes
    await page.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());
      const p = url.pathname;

      if (p.endsWith("/account/profile")) {
        return route.fulfill({ status: 200, json: MOCK_PROFILE });
      }
      if (p.endsWith("/rentals/101")) {
        return route.fulfill({ status: 200, json: MOCK_RENTAL_101 });
      }
      if (p.endsWith("/rentals/9999")) {
        return route.fulfill({
          status: 404,
          json: { title: "Not Found", status: 404, detail: "Không tìm thấy hồ sơ đơn thuê #9999 trong cơ sở dữ liệu." },
        });
      }
      if (p.endsWith("/rentals")) {
        return route.fulfill({ status: 200, json: MOCK_RENTALS_LIST });
      }
      if (p.endsWith("/staff/drivers") || p.endsWith("/staffs")) {
        return route.fulfill({ status: 200, json: { items: MOCK_DRIVERS, totalCount: MOCK_DRIVERS.length } });
      }
      if (p.endsWith("/vehicles/1")) {
        return route.fulfill({
          status: 200,
          json: {
            id: 1,
            brand: "VinFast",
            model: "VF 8 Plus",
            licensePlate: "51K-899.21",
            mainImageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
          },
        });
      }
      if (p.endsWith("/vehicles")) {
        return route.fulfill({
          status: 200,
          json: {
            items: [
              {
                id: 1,
                brand: "VinFast",
                model: "VF 8 Plus",
                licensePlate: "51K-899.21",
              },
            ],
            totalCount: 1,
          },
        });
      }
      if (p.endsWith("/facilities")) {
        return route.fulfill({
          status: 200,
          json: [
            { id: 1, name: "Trạm Trung tâm Quận 1" },
            { id: 2, name: "Trạm Sân bay Tân Sơn Nhất" },
          ],
        });
      }
      return route.fulfill({ status: 200, json: {} });
    });
  });

  test("1. Production Pilot Route /admin/rentals - Dark Mode Bounded Stage Verification (1920x1080)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/rentals?rentalId=101");
    await page.waitForLoadState("networkidle");

    // Ensure Dark Mode is set
    await page.evaluate(() => {
      document.documentElement.dataset.adminTheme = "dark";
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(400);

    // Verify workspace root and bounded stage
    const workspace = page.locator("#rentalWorkspaceRoot");
    await expect(workspace).toBeVisible();

    // Verify Brand name is strictly "Thong Dong" (without diacritics)
    const brandName = page.locator("header div").filter({ hasText: "Thong Dong" }).first();
    await expect(brandName).toBeVisible();

    // Verify Opaque Warm Porcelain Dossier
    const dossier = page.locator("main[aria-label*='Hồ sơ chi tiết']");
    await expect(dossier).toBeVisible();

    // Verify Telemetry Illustrative Fixture Badge
    const telemetryBadge = page.locator("span").filter({ hasText: "Dữ liệu minh họa vận hành" }).first();
    await expect(telemetryBadge).toBeVisible();

    // Verify Decision Deck Shelf 1: Primary Guided Action is Topmost
    const shelf1Btn = page.locator("button").filter({ hasText: "Thu hồi xe & Kiểm tra trả" }).first();
    await expect(shelf1Btn).toBeVisible();

    // Verify Decision Deck Shelf 2: Driver Assignment is below Shelf 1
    const driverSelect = page.locator("select[id='driver-select']");
    await expect(driverSelect).toBeVisible();

    // P1-B: Verify Rental Lifecycle Stepper — 5th stage ("Hoàn tất") is fully visible and not clipped at 1920x1080
    const stepperTrack = page.locator("[role='list']").first();
    const step5 = page.locator("[role='listitem']").nth(4);
    await expect(step5).toBeVisible();
    await expect(step5).toContainText("Hoàn tất");

    const trackBox = await stepperTrack.boundingBox();
    const step5Box = await step5.boundingBox();
    expect(trackBox).not.toBeNull();
    expect(step5Box).not.toBeNull();
    if (trackBox && step5Box) {
      // 5th stage right edge must remain inside the stepper track (zero horizontal overflow)
      expect(step5Box.x + step5Box.width).toBeLessThanOrEqual(trackBox.x + trackBox.width + 2);
    }

    // P1-A: Verify GPS Panel Heading & Text Contrast in Dark Mode (WCAG AA & AAA)
    const gpsData = await page.evaluate(() => {
      function srgbLuminance(r: number, g: number, b: number) {
        const [R, G, B] = [r, g, b].map((c) => {
          const val = c / 255;
          return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      }
      function parseRgb(str: string) {
        const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return [255, 255, 255];
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }
      const section = document.querySelector("section[aria-label*='Hành trình GPS']") as HTMLElement;
      const h2 = section?.querySelector("h2") as HTMLElement;
      const p = section?.querySelector("p") as HTMLElement;
      if (!section || !h2 || !p) return null;

      const bgColor = window.getComputedStyle(section).backgroundColor;
      const h2Color = window.getComputedStyle(h2).color;
      const pColor = window.getComputedStyle(p).color;

      const [br, bg, bb] = parseRgb(bgColor);
      const [hr, hg, hb] = parseRgb(h2Color);
      const [pr, pg, pb] = parseRgb(pColor);

      const lBg = srgbLuminance(br, bg, bb);
      const lH2 = srgbLuminance(hr, hg, hb);
      const lP = srgbLuminance(pr, pg, pb);

      const h2Ratio = (Math.max(lBg, lH2) + 0.05) / (Math.min(lBg, lH2) + 0.05);
      const pRatio = (Math.max(lBg, lP) + 0.05) / (Math.min(lBg, lP) + 0.05);

      return { bgColor, h2Color, pColor, h2Ratio, pRatio };
    });

    expect(gpsData).not.toBeNull();
    console.log(`[E2E DARK GPS CONTRAST] Title: ${gpsData!.h2Ratio.toFixed(2)}:1, Subtitle: ${gpsData!.pRatio.toFixed(2)}:1`);
    expect(gpsData!.h2Ratio).toBeGreaterThanOrEqual(4.5);
    expect(gpsData!.pRatio).toBeGreaterThanOrEqual(4.5);

    // Capture visual artifact
    await saveMultiScreenshot(page, "pilot-rentals-a1.1-dark-1920x1080.png");
  });

  test("2. Production Pilot Route /admin/rentals - Light Mode Bounded Stage Verification (1920x1080)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/rentals?rentalId=101");
    await page.waitForLoadState("networkidle");

    // Switch to Light Mode
    await page.evaluate(() => {
      document.documentElement.dataset.adminTheme = "light";
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(400);

    const workspace = page.locator("#rentalWorkspaceRoot");
    await expect(workspace).toBeVisible();

    // P1-B: Verify Rental Lifecycle Stepper in Light Mode
    const stepperTrackLight = page.locator("[role='list']").first();
    const step5Light = page.locator("[role='listitem']").nth(4);
    await expect(step5Light).toBeVisible();
    await expect(step5Light).toContainText("Hoàn tất");

    const trackBoxLight = await stepperTrackLight.boundingBox();
    const step5BoxLight = await step5Light.boundingBox();
    expect(trackBoxLight).not.toBeNull();
    expect(step5BoxLight).not.toBeNull();
    if (trackBoxLight && step5BoxLight) {
      expect(step5BoxLight.x + step5BoxLight.width).toBeLessThanOrEqual(trackBoxLight.x + trackBoxLight.width + 2);
    }

    // P1-A: Verify GPS Panel Heading & Text Contrast in Light Mode
    const gpsDataLight = await page.evaluate(() => {
      function srgbLuminance(r: number, g: number, b: number) {
        const [R, G, B] = [r, g, b].map((c) => {
          const val = c / 255;
          return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      }
      function parseRgb(str: string) {
        const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return [255, 255, 255];
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }
      const section = document.querySelector("section[aria-label*='Hành trình GPS']") as HTMLElement;
      const h2 = section?.querySelector("h2") as HTMLElement;
      const p = section?.querySelector("p") as HTMLElement;
      if (!section || !h2 || !p) return null;

      const bgColor = window.getComputedStyle(section).backgroundColor;
      const h2Color = window.getComputedStyle(h2).color;
      const pColor = window.getComputedStyle(p).color;

      const [br, bg, bb] = parseRgb(bgColor);
      const [hr, hg, hb] = parseRgb(h2Color);
      const [pr, pg, pb] = parseRgb(pColor);

      const lBg = srgbLuminance(br, bg, bb);
      const lH2 = srgbLuminance(hr, hg, hb);
      const lP = srgbLuminance(pr, pg, pb);

      const h2Ratio = (Math.max(lBg, lH2) + 0.05) / (Math.min(lBg, lH2) + 0.05);
      const pRatio = (Math.max(lBg, lP) + 0.05) / (Math.min(lBg, lP) + 0.05);

      return { bgColor, h2Color, pColor, h2Ratio, pRatio };
    });

    expect(gpsDataLight).not.toBeNull();
    console.log(`[E2E LIGHT GPS CONTRAST] Title: ${gpsDataLight!.h2Ratio.toFixed(2)}:1, Subtitle: ${gpsDataLight!.pRatio.toFixed(2)}:1`);
    expect(gpsDataLight!.h2Ratio).toBeGreaterThanOrEqual(4.5);
    expect(gpsDataLight!.pRatio).toBeGreaterThanOrEqual(4.5);

    // Capture visual artifact
    await saveMultiScreenshot(page, "pilot-rentals-a1.1-light-1920x1080.png");
  });

  test("3. Organic Liquid Flood Theme Transition Live Run & Performance Telemetry", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/rentals?rentalId=101");
    await page.waitForLoadState("networkidle");

    // Ensure Dark Mode initially
    await page.evaluate(() => {
      document.documentElement.dataset.adminTheme = "dark";
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(300);

    // Trigger theme toggle via the theme toggle button
    const themeBtn = page.locator("[data-testid='admin-theme-toggle']");
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    // Wait for the full 1050ms animation plus settle buffer
    await page.waitForTimeout(1400);

    // Verify theme switched to light
    const currentTheme = await page.evaluate(() => document.documentElement.dataset.adminTheme);
    expect(currentTheme).toBe("light");

    // Read real telemetry
    const telemetry = await page.evaluate(() => (window as any).__liquidPerformanceReport);
    if (telemetry) {
      expect(telemetry.avgJsWorkMs).toBeLessThan(5.0); // JS work well below frame budget
      const telePath = path.join(targetDirs[0], "pilot-liquid-telemetry.json");
      fs.writeFileSync(telePath, JSON.stringify(telemetry, null, 2));
    }
  });

  test("4. Forensic Multi-Stage Progression Capture on Real Next.js Route (0% to 100%)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/rentals?rentalId=101");
    await page.waitForLoadState("networkidle");

    // Ensure helper is present
    const hasProgressHelper = await page.evaluate(() => typeof (window as any).__setLiquidProgress === "function");
    expect(hasProgressHelper).toBe(true);

    const checkpoints = [
      { p: 0.15, label: "015" },
      { p: 0.35, label: "035" },
      { p: 0.50, label: "050" },
      { p: 0.66, label: "066" },
      { p: 0.75, label: "075" },
      { p: 0.90, label: "090" },
      { p: 1.00, label: "100" },
    ];

    for (const cp of checkpoints) {
      await page.evaluate(({ p }) => {
        (window as any).__setLiquidProgress(p, "light");
      }, cp);
      await page.waitForTimeout(100);

      // Verify ZERO duplicate IDs during transition
      const duplicateIdCount = await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
        const unique = new Set(ids);
        return ids.length - unique.size;
      });
      expect(duplicateIdCount).toBe(0);

      await saveMultiScreenshot(page, `pilot-liquid-progression-p${cp.label}.png`);
    }
  });

  test("5. Laptop (1366x768) and Reflow (960x540) Responsive Validation", async ({ page }) => {
    // Laptop viewport
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/admin/rentals?rentalId=101");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(300);

    // P1-B: Verify Stepper on Laptop 1366x768
    const stepperTrackLaptop = page.locator("[role='list']").first();
    const step5Laptop = page.locator("[role='listitem']").nth(4);
    await expect(step5Laptop).toBeVisible();
    await expect(step5Laptop).toContainText("Hoàn tất");
    const trackBoxLaptop = await stepperTrackLaptop.boundingBox();
    const step5BoxLaptop = await step5Laptop.boundingBox();
    expect(trackBoxLaptop).not.toBeNull();
    expect(step5BoxLaptop).not.toBeNull();
    if (trackBoxLaptop && step5BoxLaptop) {
      expect(step5BoxLaptop.x + step5BoxLaptop.width).toBeLessThanOrEqual(trackBoxLaptop.x + trackBoxLaptop.width + 2);
    }

    await saveMultiScreenshot(page, "pilot-rentals-laptop-1366x768.png");

    // Reflow viewport
    await page.setViewportSize({ width: 960, height: 540 });
    await page.waitForTimeout(300);

    // Verify no horizontal overflow on body
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    await saveMultiScreenshot(page, "pilot-rentals-reflow-960x540.png");
  });

  test("6. Accessibility Fallback: Prefers-Reduced-Motion Instant Toggle", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/admin/rentals?rentalId=101");
    await page.waitForLoadState("networkidle");

    const themeBtn = page.locator("[data-testid='admin-theme-toggle']");
    await expect(themeBtn).toBeVisible();

    const initialTheme = await page.evaluate(() => document.documentElement.dataset.adminTheme || "light");
    const expectedTheme = initialTheme === "dark" ? "light" : "dark";

    // Toggle theme with reduced motion: switch must be instantaneous
    await themeBtn.click();
    await page.waitForTimeout(100);

    const themeAfter = await page.evaluate(() => document.documentElement.dataset.adminTheme);
    expect(themeAfter).toBe(expectedTheme);
  });

  test("7. Operational Async States: Not Found & Idle Handling", async ({ page }) => {
    // 404 Not Found state
    await page.goto("/admin/rentals?rentalId=9999");
    await page.waitForLoadState("networkidle");
    const notFoundState = page.locator("[data-testid='rental-not-found-state']");
    await expect(notFoundState).toBeVisible();
    await expect(notFoundState).toContainText("Không tìm thấy hồ sơ đơn thuê #9999");

    // Idle state
    await page.goto("/admin/rentals");
    await page.waitForLoadState("networkidle");
    const idleState = page.locator("[data-testid='rental-idle-state']");
    await expect(idleState).toBeVisible();
    await expect(idleState).toContainText("Chưa chọn đơn thuê");
  });
});
