import { expect, test } from "@playwright/test";

const revenue = { bucket: "01/01", dateIso: "2027-01-01", total: 250000, byGroup: { "Ô tô điện": 250000 } };
const vehicle = { vehicleId: 12, name: "VinFast VF 8", category: "Ô tô điện", revenue: 250000, rentals: 1, hours: 4, utilization: 25 };
const maintenance = { vehicleId: 12, name: "VinFast VF 8", maintenanceCost: 300000, revenue: 250000 };

function envelope(data: unknown) {
  return { code: 200, status: "success", is_success: true, data, message: "OK", error: null };
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const current = Number(url.searchParams.get("page") || 1);
    let data: unknown = [];
    if (path.endsWith("/account/profile")) data = { email: "admin@test.local", fullName: "Quản trị viên", roles: ["Admin"] };
    else if (path.endsWith("/dashboard/revenue-series")) data = { items: [{ ...revenue, bucket: "day", dateIso: current === 1 ? "2027-01-01" : "2027-01-02" }], page: current, pageSize: 1, totalCount: 2 };
    else if (path.endsWith("/dashboard/top-vehicles")) data = { items: [vehicle], page: 1, pageSize: 100, totalCount: 1 };
    else if (path.endsWith("/dashboard/maintenance-vs-revenue")) data = { items: [maintenance], page: 1, pageSize: 100, totalCount: 1 };
    else if (path.endsWith("/dashboard/plan-usage")) data = { items: [
      { planId: 3, name: "Gói đô thị", usedHours: 25, includedHours: 100, activeSubscribers: 5, usagePercentage: 25 },
      { planId: 4, name: "Gói không giới hạn", usedHours: 30, includedHours: null, activeSubscribers: 2, usagePercentage: null },
    ], page: 1, pageSize: 100, totalCount: 2 };
    else if (path.endsWith("/dashboard")) data = { revenue: 500000, renting: 1, maintenance: 1, activeSubscriptions: 1 };
    else if (path.endsWith("/vehicles") || path.endsWith("/rentals")) data = { items: [], page: 1, pageSize: 1, totalCount: 1 };
    else if (path.endsWith("/facilities")) data = { items: [{ id: 5, name: "Chi nhánh trung tâm", address: "12 Nguyễn Huệ, TP.HCM" }], page: 1, pageSize: 100, totalCount: 1 };
    return route.fulfill({ json: envelope(data) });
  });
});

for (const width of [390, 1280]) {
  test(`dashboard loads the four new paginated APIs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/admin/dashboard");
    const revenueCard = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Doanh thu theo thời gian", exact: true }) });
    const maintenanceCard = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Chi phí bảo dưỡng vs Doanh thu", exact: true }) });
    await expect(revenueCard.getByRole("img", { name: /^Biểu đồ cột doanh thu/ })).toHaveAttribute("aria-label", /500\.000 đ/);
    await expect(revenueCard.locator(".recharts-xAxis").getByText("01/01", { exact: true })).toBeVisible();
    await expect(revenueCard.locator(".recharts-xAxis").getByText("02/01", { exact: true })).toBeVisible();
    await expect(revenueCard.getByText("day", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("table", { name: "Bảng xếp hạng top 10 xe theo doanh thu và tỉ lệ khai thác" }).getByText("VinFast VF 8", { exact: true })).toBeVisible();
    await expect(maintenanceCard.getByRole("img", { name: "Biểu đồ cột đôi so sánh chi phí bảo dưỡng và doanh thu của từng xe", exact: true })).toBeVisible();
    await expect(maintenanceCard.getByRole("alert")).toContainText("VinFast VF 8");
    await revenueCard.getByRole("button", { name: "Chuyển sang xem dạng bảng" }).click();
    await expect(revenueCard.getByRole("row", { name: /02\/01/ })).toBeVisible();
    await maintenanceCard.getByRole("button", { name: "Chuyển sang xem dạng bảng" }).click();
    await expect(maintenanceCard.getByRole("cell", { name: "300.000", exact: true })).toBeVisible();
    const plans = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Hiệu quả gói thuê bao", exact: true }) });
    await expect(plans.getByText("Gói đô thị", { exact: true })).toBeVisible();
    await expect(plans.getByText("25%", { exact: true })).toBeVisible();
    await expect(plans.getByText("Không áp dụng", { exact: true })).toBeVisible();
    await plans.getByRole("button", { name: "Chuyển sang xem dạng bảng" }).click();
    await expect(plans.getByRole("cell", { name: "Không giới hạn", exact: true })).toBeVisible();
    await expect(page.getByText("Không thể tải dữ liệu hiệu quả gói thuê bao.", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Không thể tải biểu đồ doanh thu.", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Không thể tải bảng xếp hạng phương tiện.", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Không thể tải dữ liệu bảo dưỡng vs doanh thu.", { exact: true })).toHaveCount(0);
  });
}

test("facility Mapbox preview remains available with paginated facilities", async ({ page }) => {
  let writes = 0;
  page.on("request", (request) => {
    if (request.method() !== "GET" && new URL(request.url()).pathname.startsWith("/api/")) writes++;
  });
  await page.route("https://api.mapbox.com/**", (route) => route.abort());
  await page.route("https://events.mapbox.com/**", (route) => route.abort());
  await page.goto("/admin/facilities");
  await page.getByRole("button", { name: "Sửa Chi nhánh trung tâm", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator('[name="address"]')).toHaveValue("12 Nguyễn Huệ, TP.HCM");
  await dialog.getByRole("button", { name: "Xem địa chỉ trên bản đồ", exact: true }).click();
  await expect(dialog.getByRole("heading", { level: 3, name: /vị trí|địa chỉ|bản đồ/i })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Ẩn bản đồ", exact: true })).toBeVisible();
  expect(writes).toBe(0);
});
