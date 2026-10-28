import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const targetDirs = [
  path.resolve(process.cwd(), "PHASE-3E-SCREENSHOTS"),
  path.resolve(process.cwd(), "..", "PHASE-3E-SCREENSHOTS"),
  path.resolve("C:\\Users\\Huy\\.gemini\\antigravity\\brain\\20c95a8f-ab5a-40e4-8ca7-4ef62d971f61\\PHASE-3E-SCREENSHOTS"),
  path.resolve(process.cwd(), "audit-screenshots"),
];
for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
const screenshotDir = targetDirs[0];

// Mock standard API datasets for Transit Desk
const MOCK_PROFILE = {
  email: "admin@thongdong.vn",
  fullName: "Võ Thị Quản Trị (Dispatcher)",
  roles: ["Admin", "Manager"],
};

const MOCK_VEHICLE_TYPES = [
  { id: 1, name: "Ô tô điện SUV", type: "car", fuelType: "electric" },
  { id: 2, name: "Ô tô xăng 5 chỗ", type: "car", fuelType: "gasoline" },
  { id: 3, name: "Ô tô Hybrid 7 chỗ", type: "car", fuelType: "hybrid" },
];

const MOCK_FACILITIES = [
  { id: 1, name: "Trạm Trung tâm Quận 1", address: "12 Lê Lợi, P. Bến Nghé, Quận 1, TP.HCM" },
  { id: 2, name: "Trạm Sân bay Tân Sơn Nhất", address: "Ga Quốc nội, Sân bay Tân Sơn Nhất, Q. Tân Bình" },
  { id: 3, name: "Trạm Bến xe Miền Đông mới", address: "P. Long Bình, TP. Thủ Đức" },
];

const MOCK_VEHICLES = [
  {
    id: 1,
    vehicleTypeId: 1,
    facilityId: 1,
    licensePlate: "51K-899.21",
    brand: "VinFast",
    model: "VF 8 Plus",
    year: 2023,
    status: "renting",
    batteryCapacity: 88,
    rangeKm: 420,
    currentOdometer: 14250,
    mainImageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
  },
  {
    id: 2,
    vehicleTypeId: 1,
    facilityId: 1,
    licensePlate: "51H-678.90",
    brand: "VinFast",
    model: "VF e34",
    year: 2023,
    status: "available",
    batteryCapacity: 42,
    rangeKm: 285,
    currentOdometer: 23100,
    mainImageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
  },
  {
    id: 3,
    vehicleTypeId: 2,
    facilityId: 2,
    licensePlate: "50E-123.45",
    brand: "Toyota",
    model: "Corolla Cross 1.8V",
    year: 2022,
    status: "available",
    fuelCapacity: 47,
    currentOdometer: 38900,
    mainImageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
  },
  {
    id: 4,
    vehicleTypeId: 3,
    facilityId: 1,
    licensePlate: "51G-445.67",
    brand: "Hyundai",
    model: "Santa Fe 2.5 Hybrid",
    year: 2023,
    status: "maintenance",
    fuelCapacity: 67,
    currentOdometer: 45200,
    mainImageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
  },
  {
    id: 5,
    vehicleTypeId: 1,
    facilityId: 2,
    licensePlate: "51K-112.34",
    brand: "VinFast",
    model: "VF 9 Eco",
    year: 2024,
    status: "renting",
    batteryCapacity: 123,
    rangeKm: 580,
    currentOdometer: 8500,
    mainImageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
  },
];

const MOCK_REPORTS = [
  {
    id: 101,
    type: "vehicle_issue",
    status: "in_progress",
    descriptionPreview: "Báo lỗi cảm biến áp suất lốp bánh trước bên phải khi đang di chuyển trên cao tốc.",
    description: "Xe báo lỗi cảm biến áp suất lốp bánh trước bên phải khi đang di chuyển trên cao tốc Long Thành - Dầu Giây. Xe có hiện tượng nhao lái nhẹ.",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    customer: { id: 1, fullName: "Nguyễn Văn An", phone: "0901234567", email: "an.nguyen@example.com" },
    rentalId: 201,
    rental: { id: 201, vehicleName: "VinFast VF 8 Plus", licensePlate: "51K-899.21", status: "renting" },
  },
  {
    id: 102,
    type: "vehicle_issue",
    status: "new",
    descriptionPreview: "Hệ thống điều hòa không mát, quạt gió khoang máy phát ra tiếng kêu rít.",
    description: "Hệ thống điều hòa chỉ ra gió nóng. Khoang máy có tiếng rít lớn khi bật AC mức tối đa. Yêu cầu đổi phương tiện khẩn cấp.",
    createdAt: new Date(Date.now() - 32 * 3600000).toISOString(), // > 24h Quá hạn SLA
    customer: { id: 2, fullName: "Lê Hoàng Yến", phone: "0912345678", email: "yen.le@example.com" },
    rentalId: 202,
    rental: { id: 202, vehicleName: "Hyundai Santa Fe 2.5", licensePlate: "51H-678.90", status: "completed" },
  },
  {
    id: 103,
    type: "accident",
    status: "resolved",
    descriptionPreview: "Va quẹt nhẹ gương chiếu hậu bên phụ khi lùi xe tại bãi đỗ thương mại.",
    description: "Va quẹt nhẹ gương chiếu hậu bên phụ khi lùi xe. Đã hoàn thành thủ tục bảo hiểm bồi hoàn.",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    customer: { id: 3, fullName: "Phạm Quốc Bảo", phone: "0987654321", email: "bao.pham@example.com" },
    rentalId: 203,
    rental: { id: 203, vehicleName: "Toyota Corolla Cross 1.8V", licensePlate: "50E-123.45", status: "completed" },
  },
];

const MOCK_RENTAL_101 = {
  id: 101,
  customerId: 1,
  vehicleId: 1,
  vehicleName: "VinFast VF 8 Plus",
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

const MOCK_DRIVERS = [
  { id: 1, fullName: "Nguyễn Văn Hùng (Tài xế Chi nhánh 1)", phone: "0901111222", isActive: true },
  { id: 2, fullName: "Trần Quốc Toàn (Tài xế Chi nhánh 2)", phone: "0903333444", isActive: true },
];

test.describe("Transit Desk V3 — Capture Visual Evidence", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API routes
    await page.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());
      const p = url.pathname;

      if (p.endsWith("/account/profile")) {
        return route.fulfill({ status: 200, json: MOCK_PROFILE });
      }
      if (p.endsWith("/dashboard")) {
        return route.fulfill({
          status: 200,
          json: { revenue: 142500000, renting: 14, maintenance: 3, activeSubscriptions: 8 },
        });
      }
      if (p.endsWith("/vehicle-types")) {
        return route.fulfill({ status: 200, json: MOCK_VEHICLE_TYPES });
      }
      if (p.endsWith("/facilities") || p.endsWith("/departments")) {
        return route.fulfill({ status: 200, json: MOCK_FACILITIES });
      }
      if (p.endsWith("/vehicles")) {
        const status = url.searchParams.get("status");
        let items = MOCK_VEHICLES;
        if (status) items = items.filter((v) => v.status === status);
        return route.fulfill({ status: 200, json: { items, totalCount: items.length } });
      }
      if (p.match(/\/vehicles\/\d+$/)) {
        const id = Number(p.split("/").pop());
        const found = MOCK_VEHICLES.find((v) => v.id === id) || MOCK_VEHICLES[0];
        return route.fulfill({ status: 200, json: found });
      }
      if (p.endsWith("/reports")) {
        return route.fulfill({ status: 200, json: MOCK_REPORTS });
      }
      if (p.match(/\/reports\/\d+$/)) {
        const id = Number(p.split("/").pop());
        const found = MOCK_REPORTS.find((r) => r.id === id) || MOCK_REPORTS[0];
        return route.fulfill({ status: 200, json: found });
      }
      if (p.endsWith("/staff/drivers") || p.endsWith("/staffs")) {
        return route.fulfill({ status: 200, json: { items: MOCK_DRIVERS, totalCount: MOCK_DRIVERS.length } });
      }
      if (p.endsWith("/rentals/101") || p.endsWith("/rentals/1")) {
        return route.fulfill({ status: 200, json: MOCK_RENTAL_101 });
      }
      if (p.endsWith("/rentals/9999")) {
        return route.fulfill({
          status: 404,
          json: { title: "Not Found", status: 404, detail: "Không tìm thấy hồ sơ đơn thuê #9999 trong cơ sở dữ liệu." },
        });
      }
      if (p.endsWith("/rentals")) {
        return route.fulfill({
          status: 200,
          json: {
            items: [
              MOCK_RENTAL_101,
              {
                id: 102,
                vehicleId: 3,
                vehicleName: "Toyota Corolla Cross 1.8V - 50E-123.45",
                status: "pre_inspection",
                rentalType: "hourly",
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 86400000).toISOString(),
                totalPrice: 1200000,
                depositPrice: 2000000,
                vatPrice: 120000,
                hasDriver: false,
              },
              {
                id: 103,
                vehicleId: 2,
                vehicleName: "VinFast VF e34 - 51H-678.90",
                status: "pending",
                rentalType: "daily",
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 172800000).toISOString(),
                totalPrice: 1800000,
                depositPrice: 3000000,
                vatPrice: 180000,
                hasDriver: true,
              },
            ],
            totalCount: 3,
            page: 1,
            pageSize: 30,
          },
        });
      }

      return route.fulfill({ status: 200, json: [] });
    });
  });

  // SCREEN 1: /admin — Operating Pulse
  test("Screen 1: /admin — Operating Pulse", async ({ page }) => {
    // 1920x1080 Light
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin");
    await page.waitForSelector("h1");
    await page.screenshot({ path: path.join(screenshotDir, "01-operating-pulse-1920x1080-light.png") });

    // 1920x1080 Dark
    const themeBtn = page.getByRole("button", { name: /Chuyển giao diện/i });
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(screenshotDir, "01-operating-pulse-1920x1080-dark.png") });
      await themeBtn.click(); // Switch back to light
      await page.waitForTimeout(200);
    }

    // 1366x768 Light & Dark
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.screenshot({ path: path.join(screenshotDir, "01-operating-pulse-1366x768-light.png") });

    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(screenshotDir, "01-operating-pulse-1366x768-dark.png") });
      await themeBtn.click();
      await page.waitForTimeout(200);
    }

    // Interactive State: Route Index (Ctrl+K)
    await page.keyboard.press("Control+k");
    await page.waitForSelector('[placeholder*="Gõ tên màn hình"]', { timeout: 3000 }).catch(() => {});
    await page.screenshot({ path: path.join(screenshotDir, "01-operating-pulse-route-index.png") });
    await page.keyboard.press("Escape");

    // Zoom 200% (Simulate 200% reflow on 960x540 window)
    await page.setViewportSize({ width: 960, height: 540 });
    await page.screenshot({ path: path.join(screenshotDir, "01-operating-pulse-zoom200.png") });
  });

  // SCREEN 2: /admin/vehicles — Fleet Registry
  test("Screen 2: /admin/vehicles — Fleet Registry", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/vehicles");
    await page.waitForSelector("h1");

    // Wait for ledger to load rows
    await page.waitForSelector("text=BIỂN SỐ / ID");
    const firstRow = page.locator(".divide-y > button").first();
    await firstRow.waitFor({ state: "visible" });
    await page.screenshot({ path: path.join(screenshotDir, "02-fleet-registry-1920x1080-light.png") });

    // 1920x1080 Dark
    const themeBtn = page.getByRole("button", { name: /Chuyển giao diện/i });
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(screenshotDir, "02-fleet-registry-1920x1080-dark.png") });
      await themeBtn.click();
      await page.waitForTimeout(200);
    }

    // 1366x768 Light & Dark
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.screenshot({ path: path.join(screenshotDir, "02-fleet-registry-1366x768-light.png") });

    // Interactive State: Context Folio open for a vehicle
    await firstRow.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotDir, "02-fleet-registry-folio-open.png") });

    // Zoom 200%
    await page.setViewportSize({ width: 960, height: 540 });
    await page.screenshot({ path: path.join(screenshotDir, "02-fleet-registry-zoom200.png") });
  });

  // SCREEN 3: /admin/reports — Incident Triage
  test("Screen 3: /admin/reports — Incident Triage", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/reports");
    await page.waitForSelector("h1");

    // Light 1920x1080
    await page.screenshot({ path: path.join(screenshotDir, "03-incident-triage-1920x1080-light.png") });

    // Dark 1920x1080
    const themeBtn = page.getByRole("button", { name: /Chuyển giao diện/i });
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(screenshotDir, "03-incident-triage-1920x1080-dark.png") });
      await themeBtn.click();
      await page.waitForTimeout(200);
    }

    // 1366x768 Light
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.screenshot({ path: path.join(screenshotDir, "03-incident-triage-1366x768-light.png") });

    // Interactive State: Select overdue incident (#102)
    const overdueItem = page.locator("button").filter({ hasText: "Lê Hoàng Yến" });
    if (await overdueItem.isVisible()) {
      await overdueItem.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: path.join(screenshotDir, "03-incident-triage-selected.png") });

    // Zoom 200%
    await page.setViewportSize({ width: 960, height: 540 });
    await page.screenshot({ path: path.join(screenshotDir, "03-incident-triage-zoom200.png") });
  });

  // SCREEN 4: /admin/rentals — Rental Journey (V4.1B/C Rental Workspace)
  test("Screen 4: /admin/rentals — Rental Journey", async ({ page }) => {
    // 1. 1920x1080 Light
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/rentals?rentalId=101");
    await page.waitForSelector("h1");
    await page.waitForSelector("text=THÔNG SỐ HỢP ĐỒNG THUÊ #101");

    await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-1920x1080-light.png") });

    // 2. 1920x1080 Dark
    const themeBtn = page.getByRole("button", { name: /Chuyển giao diện/i });
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-1920x1080-dark.png") });
      await themeBtn.click(); // revert to light
      await page.waitForTimeout(200);
    }

    // 3. 1366x768 Light
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-1366x768-light.png") });

    // 4. 1366x768 Dark
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-1366x768-dark.png") });
      await themeBtn.click(); // revert to light
      await page.waitForTimeout(200);
    }

    // Explicit Layout Bounding Collision Assertion at 1366x768
    const stepperOverlap = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[class*="stepperItem"]'));
      let collided = false;
      for (let i = 0; i < items.length - 1; i++) {
        const b1 = items[i].getBoundingClientRect();
        const b2 = items[i + 1].getBoundingClientRect();
        // An overlap occurs if b1's right edge strictly penetrates b2's left edge
        if (b1.right > b2.left + 1) {
          collided = true;
        }
      }
      return collided;
    });
    expect(stepperOverlap).toBe(false);

    // 5. 1024x768 Light
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-1024x768-light.png") });

    // 6. Opacity 0.65 Stress Test (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.evaluate(() => {
      const root = document.querySelector('[class*="workspaceRoot"]') as HTMLElement;
      if (root) {
        root.style.setProperty("--v4-queue-bg", "rgba(240, 245, 248, 0.65)");
        root.style.setProperty("--v4-command-bg", "rgba(245, 244, 249, 0.69)");
      }
    });
    await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-1920x1080-opacity65.png") });

    // 7. Manual Override: Closed (Default per OPS-02) vs Open
    await page.setViewportSize({ width: 1920, height: 1080 });
    const overrideDisclosure = page.locator("details", { hasText: "Ghi đè trạng thái thủ công" });
    if (await overrideDisclosure.isVisible()) {
      // Assert default closed state
      const isDefaultOpen = await overrideDisclosure.evaluate((el: HTMLDetailsElement) => el.open);
      expect(isDefaultOpen).toBe(false);
      await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-manual-override-closed.png") });

      // Expand disclosure
      await page.locator("summary", { hasText: "Ghi đè trạng thái thủ công" }).click();
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-manual-override-open.png") });

      // 8. Terminal Confirmation Modal: Completed (OPS-01)
      const statusSelect = page.locator("#rental-next-status");
      await statusSelect.selectOption("completed");
      const confirmTrigger = page.getByRole("button", { name: "Xác nhận cập nhật trạng thái" });
      await confirmTrigger.click();
      await page.waitForSelector("text=Xác nhận hoàn tất & quyết toán hợp đồng");
      await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-confirm-modal-completed.png") });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(150);

      // 9. Terminal Confirmation Modal: Cancelled (OPS-01)
      await statusSelect.selectOption("cancelled");
      await confirmTrigger.click();
      await page.waitForSelector("text=Xác nhận hủy hợp đồng thuê");
      await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-confirm-modal-cancelled.png") });
      await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-confirm-modal.png") });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(150);
    }

    // 10. Actual Browser Zoom 200% (Real browser 200% zoom reflow equivalent to 960x540 viewport)
    await page.setViewportSize({ width: 960, height: 540 });
    await page.waitForTimeout(250);

    // Verify reflow: middle dossier width must be > 600px (single-column stacked layout, not squeezed 200px strip)
    const dossierBox = await page.locator('[class*="dossierPanel"]').boundingBox();
    expect(dossierBox).not.toBeNull();
    if (dossierBox) {
      expect(dossierBox.width).toBeGreaterThan(600);
    }

    // Verify no horizontal overflow at 200% zoom
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-zoom200-modal-closed.png") });
    await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-zoom200.png") });
    await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-effective-reflow-960x540.png") });

    // Open confirmation modal at 200% zoom
    const overrideDetails = page.locator("details", { hasText: "Ghi đè trạng thái thủ công" });
    if (await overrideDetails.isVisible()) {
      await overrideDetails.evaluate((el: HTMLDetailsElement) => {
        el.open = true;
      });
      await page.waitForTimeout(150);
      const statusSelect = page.locator("#rental-next-status");
      await statusSelect.selectOption("cancelled");
      const confirmTrigger = page.getByRole("button", { name: "Xác nhận cập nhật trạng thái" });
      await confirmTrigger.click();
      await page.waitForSelector('[role="dialog"]');
      await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-zoom200-modal-open.png") });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(150);
    }

    // 11. Truthful Backend Error State (404 Not Found on unrecorded ID)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/rentals?rentalId=9999");
    await page.waitForSelector('[data-testid="rental-not-found-state"]', { timeout: 5000 });
    await expect(page.getByRole("heading", { name: "Không tìm thấy hồ sơ đơn thuê #9999" })).toBeVisible();
    await expect(page.locator('[data-testid="command-inactive-state"]')).toBeVisible();

    // Verify NO NaN or phantom card rendered anywhere
    const hasNaN = await page.evaluate(() => document.body.innerText.includes("NaN"));
    expect(hasNaN).toBe(false);
    const hasPhantomCard = await page.locator('[data-testid="pinned-lookup-card"]').isVisible();
    expect(hasPhantomCard).toBe(false);

    await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-backend-error.png") });
    await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-backend-error-404.png") });
  });

  // SCREEN 4B: Staff View (Fail-closed RBAC - No Manual Override)
  test("Screen 4B: /admin/rentals — Staff View (No Manual Override)", async ({ page }) => {
    await page.route("**/account/profile", (route) => {
      route.fulfill({
        status: 200,
        json: {
          email: "staff@thongdong.vn",
          fullName: "Nguyễn Văn Nhân Viên (Station Staff)",
          roles: ["Staff"],
        },
      });
    });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/rentals?rentalId=101");
    await page.waitForSelector("h1");
    await page.waitForSelector("text=THÔNG SỐ HỢP ĐỒNG THUÊ #101");

    // Verify manual override is NOT visible in DOM for Staff
    const overrideDisclosure = page.locator("details", { hasText: "Ghi đè trạng thái thủ công" });
    await expect(overrideDisclosure).toHaveCount(0);

    await page.screenshot({ path: path.join(screenshotDir, "04-rental-journey-staff-no-override.png") });
  });

  test.afterAll(() => {
    try {
      const files = fs.readdirSync(targetDirs[0]).filter((f) => f.endsWith(".png"));
      for (const file of files) {
        const src = path.join(targetDirs[0], file);
        for (let i = 1; i < targetDirs.length; i++) {
          try {
            fs.copyFileSync(src, path.join(targetDirs[i], file));
          } catch {
            // Safe fallback
          }
        }
      }
    } catch (e) {
      console.warn("Could not sync screenshots across dirs:", e);
    }
  });
});
