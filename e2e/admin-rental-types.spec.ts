import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

test("operational queue distinguishes hourly, longterm and missing rental types", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const rows = [
    { id: 111, rentalType: "hourly" },
    { id: 112, rentalType: "longterm" },
    { id: 113 }, // Older list responses omitted rentalType; never assume longterm.
  ].map((row) => ({ ...row, vehicleId: 8, status: "pending", vehicleModel: "Vios", startTime: "2027-01-01T08:00:00Z", endTime: "2027-01-01T12:00:00Z", totalPrice: 500000, hasDriver: false }));
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const id = Number(path.match(/\/rentals\/(\d+)$/)?.[1]);
    const row = rows.find((item) => item.id === id);
    const data = path.endsWith("/account/profile") ? { fullName: "Quản lý kiểm thử", email: "manager@test.local", roles: ["Manager"] } :
      path === "/api/rentals" ? { items: rows, page: 1, pageSize: 30, totalCount: rows.length } :
      row ? { ...row, rentalType: id === 112 ? "longterm" : "hourly", isSubscription: false, contractLink: null, signedAt: null } :
      path === "/api/vehicles/8" ? { id: 8, brand: "Toyota", model: "Vios", licensePlate: "51A-12345" } :
      path.endsWith("/staff/drivers") ? { items: [], totalCount: 0, page: 1, pageSize: 100 } : [];
    return route.fulfill({ json: envelope(data) });
  });
  await page.goto("/admin/rentals?rentalId=111");
  const queue = page.getByRole("complementary", { name: "Hàng đợi vận hành" });
  await expect(queue.getByRole("button").filter({ hasText: "#111" }).getByText("Thuê giờ", { exact: true })).toBeVisible();
  await expect(queue.getByRole("button").filter({ hasText: "#112" }).getByText("Dài hạn", { exact: true })).toBeVisible();
  await expect(queue.getByRole("button").filter({ hasText: "#113" }).getByText("Chưa rõ loại thuê", { exact: true })).toBeVisible();
  await queue.getByRole("button").filter({ hasText: "#112" }).click();
  await expect(page.getByText("Khách tự lái · Dài hạn", { exact: true })).toBeVisible();
  await queue.getByRole("button").filter({ hasText: "#113" }).click();
  await expect(page.getByText("Khách tự lái · Thuê giờ", { exact: true })).toBeVisible();
  await expect(queue.getByRole("button").filter({ hasText: "#113" }).getByText("Thuê giờ", { exact: true })).toBeVisible();
});
