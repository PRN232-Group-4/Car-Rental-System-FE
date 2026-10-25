import { test, expect } from "@playwright/test";
import { mockMapbox } from "./mapbox-helpers";

const vehicle = { id: 10, brand: "Toyota", model: "Vios", vehicleTypeId: 1, status: "available", mainImageUrl: "/logo.jpg" };
const point = { lat: 10.7769, lng: 106.7009, recordedAt: "2026-10-15T03:04:00Z", accuracyM: 10 };

test.beforeEach(async ({ page }) => {
  await mockMapbox(page);
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/account/profile") ? { fullName: "Admin", email: "admin@test.local", roles: ["Admin"] }
      : path.endsWith("/vehicle/10") ? vehicle
        : path.endsWith("/vehicles") ? { items: [vehicle], totalCount: 1 }
          : path.endsWith("/vehicle-types") ? [{ id: 1, name: "Ô tô", type: "car", fuelType: "gasoline" }]
            : path.endsWith("/staff") || path.endsWith("/staff/drivers") ? { items: [], totalCount: 0 }
              : path.endsWith("/rental/52") ? { id: 52, vehicleId: 10, status: "renting", rentalType: "hourly", totalPrice: 100000 }
                : [];
    return route.fulfill({ json });
  });
});

test("vehicle GPS loads on demand, exposes a real point and never submits the edit form", async ({ page }) => {
  let trackingRequests = 0;
  let writes = 0;
  page.on("request", (request) => { if (request.method() !== "GET" && new URL(request.url()).pathname.startsWith("/api/")) writes++; });
  await page.route("**/api/tracking/vehicle/10/last-position", (route) => { trackingRequests++; return route.fulfill({ json: point }); });
  await page.goto("/admin/vehicles/edit?vehicleId=10");
  const panel = page.getByRole("region", { name: "Vị trí xe", exact: true });
  await expect(panel.getByRole("button", { name: "Xem vị trí xe", exact: true })).toBeVisible();
  expect(trackingRequests).toBe(0);
  await panel.getByRole("button", { name: "Xem vị trí xe", exact: true }).click();
  await expect(panel.getByText("15/10/2026 10:04", { exact: true })).toBeVisible();
  await expect(panel.getByRole("region", { name: "Bản đồ Mapbox: Vị trí GPS gần nhất của xe" })).toBeVisible();
  await expect(panel.getByText(/Độ chính xác GPS: khoảng 10 m/)).toBeVisible();
  expect(trackingRequests).toBe(1);
  expect(writes).toBe(0);
});

test("missing GPS stays empty and forbidden data shows a useful error with retry", async ({ page }) => {
  await page.route("**/api/tracking/vehicle/10/last-position", (route) => route.fulfill({ status: 404, json: { message: "No position" } }));
  await page.goto("/admin/vehicles/edit?vehicleId=10");
  await page.getByRole("button", { name: "Xem vị trí xe", exact: true }).click();
  const panel = page.getByRole("region", { name: "Vị trí xe", exact: true });
  await expect(panel.getByText("Xe chưa có vị trí GPS được ghi nhận.")).toBeVisible();
  await expect(panel.locator("iframe")).toHaveCount(0);
  await expect(panel.getByRole("link")).toHaveCount(0);
  await page.route("**/api/tracking/vehicle/10/last-position", (route) => route.fulfill({ status: 403, json: { message: "Forbidden" } }));
  await panel.getByRole("button", { name: "Cập nhật vị trí", exact: true }).click();
  await expect(panel.getByRole("alert")).toHaveText("Bạn không có quyền xem dữ liệu định vị này.");
});

test("rental GPS has a loading skeleton, truthful endpoint map and paginated history", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const points = Array.from({ length: 12 }, (_, index) => ({ ...point, lat: Number((10.77 + index / 100).toFixed(4)), recordedAt: `2026-10-15T03:${String(index).padStart(2, "0")}:00Z` }));
  await page.route("**/api/tracking/rental/52/route", async (route) => {
    await gate;
    return route.fulfill({ json: { rentalId: 52, vehicleId: 10, totalPoints: 12, totalDistanceMeters: 12500, durationSeconds: 660, startPosition: points[0], endPosition: points[11], routePoints: points } });
  });
  await page.goto("/admin/rentals?rentalId=52");
  await page.getByRole("button", { name: "Xem hành trình", exact: true }).click();
  await expect(page.getByRole("status", { name: "Đang tải hành trình GPS...", exact: true })).toBeVisible();
  release();
  const table = page.getByRole("table", { name: "Lịch sử điểm GPS", exact: true });
  await expect(table.locator("tbody tr")).toHaveCount(10);
  await expect(page.getByText(/Bản đồ hiển thị điểm GPS cuối cùng lúc 15\/10\/2026 10:11/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Bản đồ Mapbox: Điểm GPS cuối cùng trong hành trình thuê" })).toBeVisible();
  await page.getByRole("button", { name: "Trang sau", exact: true }).click();
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await expect(table.getByRole("cell", { name: "15/10/2026 10:11", exact: true })).toBeVisible();
});

test("facility form previews an explicit address snapshot without saving", async ({ page }) => {
  let writes = 0;
  const addresses: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() !== "GET" && url.pathname.startsWith("/api/")) writes++;
    if (url.pathname.includes("/search/geocode/")) addresses.push(url.searchParams.get("q") || "");
  });
  await page.goto("/admin/facilities");
  await page.getByRole("button", { name: "Thêm mới", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Xem địa chỉ trên bản đồ", exact: true })).toBeDisabled();
  await dialog.locator('[name="address"]').fill("123 Nguyễn Huệ & Lê Lợi, TP.HCM");
  await dialog.getByRole("button", { name: "Xem địa chỉ trên bản đồ", exact: true }).click();
  await expect.poll(() => addresses).toEqual(["123 Nguyễn Huệ & Lê Lợi, TP.HCM"]);
  await dialog.locator('[name="address"]').fill("Địa chỉ mới");
  expect(addresses).toHaveLength(1);
  await dialog.getByRole("button", { name: "Ẩn bản đồ", exact: true }).click();
  await dialog.getByRole("button", { name: "Xem địa chỉ trên bản đồ", exact: true }).click();
  await expect.poll(() => addresses.at(-1)).toBe("Địa chỉ mới");
  expect(writes).toBe(0);
});
