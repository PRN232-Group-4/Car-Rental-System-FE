import { expect, test } from "@playwright/test";

for (const width of [390, 1280]) {
  test(`landing shows six rentable vehicles and links to booking at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const requests: URL[] = [];
    const vehicles = Array.from({ length: 9 }, (_, i) => ({
      id: i + 1, brand: "Honda", model: `City ${i + 1}`, vehicleType: "Ô tô xăng", status: "available",
      hourlyPrice: 100000, longtermPrice: 3000000, facilityId: 5, facility: "Chi nhánh trung tâm",
    }));
    await page.route("**/api/**", (route) => {
      const url = new URL(route.request().url());
      let data: unknown = [];
      if (url.pathname.endsWith("/account/profile")) data = null;
      else if (url.pathname.endsWith("/vehicles")) {
        requests.push(url);
        const pageSize = Number(url.searchParams.get("pageSize") || 20);
        data = { items: vehicles.slice(0, pageSize), page: 1, pageSize, totalCount: vehicles.length };
      }
      return route.fulfill({ json: { code: 200, status: "success", is_success: true, data, message: "OK", error: null } });
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const catalog = page.locator("section#doi-xe");
    await catalog.scrollIntoViewIfNeeded();
    await expect(catalog.getByRole("heading", { level: 3 })).toHaveCount(6);
    await expect(catalog.getByRole("button", { name: "Đặt xe", exact: true })).toHaveCount(6);
    for (const button of await catalog.getByRole("button", { name: "Đặt xe", exact: true }).all()) await expect(button).toBeEnabled();
    await expect(catalog.getByRole("button", { name: "Tất cả (6)", exact: true })).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(requests[0].searchParams.get("status")).toBe("available");
    expect(requests[0].searchParams.get("pageSize")).toBe("6");
    const more = catalog.getByRole("link", { name: "Xem thêm", exact: true });
    await expect(more).toHaveCount(1);
    await expect(more.locator("..").getByRole("button", { name: "Tất cả (6)", exact: true })).toBeVisible();
    await expect(catalog.getByRole("checkbox", { name: "Chỉ xe có tài xế riêng" })).toHaveCount(0);
    await expect(more).toHaveAttribute("href", "/find");
    await more.scrollIntoViewIfNeeded();
    await catalog.screenshot({ path: `test-results/landing-fleet-preview-${width}.png` });
    await more.click();
    await expect(page).toHaveURL(/\/find\/?$/);
  });
}
