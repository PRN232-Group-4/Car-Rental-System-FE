import { expect, test } from "@playwright/test";
import { mockMapbox } from "./mapbox-helpers";

test("public facilities use live paginated data and update Mapbox when selected", async ({ page }) => {
  const addresses: string[] = [];
  await mockMapbox(page);
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.includes("/search/geocode/")) addresses.push(url.searchParams.get("q") || "");
  });
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/facilities")) return route.fulfill({ json: { items: [
      { id: 7, name: "Chi nhánh Quận 1", address: "12 Nguyễn Huệ & Lê Lợi, TP.HCM" },
      { id: 8, name: "Chi nhánh Quận 7", address: "123 Nguyễn Thị Thập, TP.HCM" },
    ], totalCount: 2 } });
    return route.fulfill({ json: null });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const facilities = page.locator("#chi-nhanh");
  await facilities.scrollIntoViewIfNeeded();
  const first = facilities.getByRole("button", { name: /Chi nhánh Quận 1/ });
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => addresses.at(-1)).toBe("12 Nguyễn Huệ & Lê Lợi, TP.HCM");
  await facilities.getByRole("button", { name: /Chi nhánh Quận 7/ }).click();
  await expect(first).toHaveAttribute("aria-pressed", "false");
  await expect(facilities.getByRole("heading", { name: "Vị trí Chi nhánh Quận 7", exact: true })).toBeVisible();
  await expect.poll(() => addresses.at(-1)).toBe("123 Nguyễn Thị Thập, TP.HCM");
  await expect(facilities.getByRole("region", { name: "Bản đồ Mapbox: Vị trí Chi nhánh Quận 7" })).toBeVisible();
  await expect(facilities.getByRole("region", { name: "Bản đồ Mapbox: Vị trí Chi nhánh Quận 7" })).toHaveAttribute("aria-busy", "false");
  await expect(facilities.getByRole("alert")).toHaveCount(0);
  await page.context().grantPermissions(["geolocation"]);
  await page.context().setGeolocation({ latitude: 10.7, longitude: 106.6 });
  await facilities.getByRole("button", { name: "Chỉ đường từ vị trí hiện tại" }).click();
  await expect(facilities.getByRole("status")).toHaveText(/Quãng đường: 1,2 km · Thời gian dự kiến: 3 phút/);
  await expect(facilities.getByText(/xe sẵn sàng/)).toHaveCount(0);
  await facilities.screenshot({ path: "test-results/public-facilities-map.png" });
});

test("mobile facilities show missing address honestly without a fabricated map", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: path.endsWith("/facilities") ? [{ id: 9, name: "Chi nhánh chưa có địa chỉ" }] : null });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const facilities = page.locator("#chi-nhanh");
  await facilities.scrollIntoViewIfNeeded();
  await expect(facilities.getByText("Chưa có địa chỉ hoặc tọa độ để hiển thị bản đồ.")).toBeVisible();
  await expect(facilities.locator("iframe")).toHaveCount(0);
  await expect(facilities.getByRole("link", { name: /Chỉ đường/ })).toHaveCount(0);
  expect(await facilities.evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(390);
  await facilities.screenshot({ path: "test-results/public-facilities-mobile-empty.png" });
});
