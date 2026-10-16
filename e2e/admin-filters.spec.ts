import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/account/profile") ? { fullName: "Admin", email: "admin@test.local", roles: ["Admin"] }
      : path.endsWith("/vehicle-types") ? [{ id: 1, name: "Ô tô", type: "car", fuelType: "gasoline" }]
        : path.endsWith("/vehicles") || path.endsWith("/staff") || path.endsWith("/staff/drivers") ? { items: [], totalCount: 0 }
          : [];
    return route.fulfill({ json });
  });
});

test("maintenance applies draft filters and reset clears the request and controls", async ({ page }) => {
  await page.route("**/api/maintenance*", (route) => {
    const filtered = new URL(route.request().url()).searchParams.has("vehicleId");
    return route.fulfill({ json: (filtered ? [1] : [1, 2]).map((id) => ({ id, vehicleId: 42, status: "in_progress" })) });
  });
  await page.route("**/api/vehicles/42", (route) => route.fulfill({ json: { id: 42, brand: "Toyota", model: "Vios" } }));
  await page.goto("/admin/maintenance");
  const bar = page.locator("[data-admin-filters]");
  const vehicle = bar.getByLabel("Mã phương tiện", { exact: true });
  const status = bar.getByLabel("Trạng thái", { exact: true });
  await vehicle.fill("42");
  await status.selectOption("in_progress");
  await expect(page.getByText("2 phiếu", { exact: true })).toBeVisible();
  const filtered = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === "/api/maintenance" && url.searchParams.get("vehicleId") === "42" && url.searchParams.get("status") === "in_progress";
  });
  await bar.getByRole("button", { name: "Lọc danh sách", exact: true }).click();
  await filtered;
  await expect(page.getByText("1 phiếu", { exact: true })).toBeVisible();
  await bar.getByRole("button", { name: "Đặt lại", exact: true }).click();
  // Reset may restore the fresh unfiltered query from React Query's cache.
  await expect(page.getByText("2 phiếu", { exact: true })).toBeVisible();
  await expect(vehicle).toHaveValue("");
  await expect(status).toHaveValue("");
  await expect(bar.getByRole("button", { name: "Đặt lại", exact: true })).toBeDisabled();
  await page.screenshot({ path: "test-results/admin-filters-maintenance-desktop.png", fullPage: true });
});

test("dispatch validation stays inline and reset restores a valid date range", async ({ page }) => {
  await page.goto("/admin/dispatch");
  const bar = page.locator("[data-admin-filters]").first();
  const start = bar.getByLabel("Từ ngày giờ", { exact: true });
  const end = bar.getByLabel("Đến ngày giờ", { exact: true });
  await start.fill("");
  await end.fill("");
  await bar.getByRole("button", { name: "Xem lịch", exact: true }).click();
  await expect(start).toBeFocused();
  await expect(start).toHaveAttribute("aria-invalid", "true");
  await expect(end).toHaveAttribute("aria-invalid", "true");
  await expect(bar.getByRole("alert")).toHaveCount(2);
  await bar.getByRole("button", { name: "Đặt lại", exact: true }).click();
  await expect(bar.getByRole("alert")).toHaveCount(0);
  await expect(start).not.toHaveValue("");
  await expect(end).not.toHaveValue("");
});

test("vehicle reset clears immediate filters", async ({ page }) => {
  await page.goto("/admin/vehicles");
  const bar = page.locator("[data-admin-filters]");
  const search = bar.getByLabel("Tìm phương tiện", { exact: true });
  await search.fill("Toyota");
  await bar.getByLabel("Loại phương tiện", { exact: true }).selectOption("1");
  await bar.getByLabel("Trạng thái", { exact: true }).selectOption("maintenance");
  await bar.getByRole("button", { name: "Đặt lại", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(bar.getByLabel("Loại phương tiện", { exact: true })).toHaveValue("all");
  await expect(bar.getByLabel("Trạng thái", { exact: true })).toHaveValue("all");
});

test("lookup keeps required field errors and reset clears them", async ({ page }) => {
  await page.goto("/admin/rentals");
  const bar = page.locator("[data-admin-filters]");
  const input = bar.getByLabel("Mã đơn thuê", { exact: true });
  await bar.getByRole("button", { name: "Tra cứu đơn thuê", exact: true }).click();
  await expect(input).toBeFocused();
  await expect(bar.getByRole("alert")).toBeVisible();
  await bar.getByRole("button", { name: "Đặt lại", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(bar.getByRole("alert")).toHaveCount(0);
});

test("all Admin filters have matching controls and fit desktop and mobile", async ({ page }) => {
  test.setTimeout(60_000);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["maintenance", "dispatch", "vehicles", "staffs", "rentals", "inspections"]) {
      await page.goto(`/admin/${route}`);
      const bars = page.locator("[data-admin-filters]");
      await expect(bars.first()).toBeVisible();
      for (const bar of await bars.all()) {
        const bounds = await bar.boundingBox();
        for (const control of await bar.locator("input, select").all()) {
          const metrics = await control.evaluate((element) => {
            const css = getComputedStyle(element);
            const bounds = element.getBoundingClientRect();
            return { height: bounds.height, font: css.fontSize, radius: css.borderRadius, left: bounds.left, right: bounds.right, labelled: !!document.querySelector(`label[for="${element.id}"]`) };
          });
          expect(metrics.height).toBe(44);
          expect(metrics.font).toBe("14px");
          expect(metrics.radius).toBe("10px");
          expect(metrics.labelled).toBe(true);
          expect(metrics.left).toBeGreaterThanOrEqual(bounds!.x);
          expect(metrics.right).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
        }
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      }
      if (route === "maintenance" || route === "dispatch") await page.screenshot({ path: `test-results/admin-filters-${route}-${width}.png`, fullPage: true });
    }
  }
});
