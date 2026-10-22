import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
const vehicle = { id: 8, brand: "Toyota", model: "Vios", facility: { id: 5, name: "Quận 1" }, vehicleType: { id: 1, name: "Ô tô" }, priceHourly: 100000 };

for (const width of [1440, 390]) {
  for (const result of ["available", "empty", "error"] as const) {
    test(`booking does not claim an assigned driver (${width}px, ${result})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      let releaseSearch!: () => void;
      const searchReady = new Promise<void>((resolve) => { releaseSearch = resolve; });
      let payload: Record<string, unknown> | undefined;
      // Intercept every API; no real booking, customer or driver is modified.
      await page.route("**/api/**", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.pathname.endsWith("/account/profile")) return route.fulfill({ json: envelope({ fullName: "Khách kiểm thử", email: "customer@test.local", roles: ["Customer"] }) });
        if (url.pathname.endsWith("/customer/license")) return route.fulfill({ json: envelope({ number: "TEST-LICENSE", status: "approved" }) });
        if (url.pathname.endsWith("/facilities")) return route.fulfill({ json: envelope([{ id: 5, name: "Quận 1" }]) });
        if (url.pathname.endsWith("/vehicles/search")) {
          expect(url.searchParams.get("hasDriver")).toBe("true");
          await searchReady;
          if (result === "error") return route.fulfill({ status: 503, json: { ...envelope(null), code: 503, status: "error", is_success: false, message: "Không kiểm tra được xe và tài xế." } });
          return route.fulfill({ json: envelope({ items: result === "available" ? [vehicle] : [], totalCount: result === "available" ? 1 : 0, page: 1, pageSize: 100 }) });
        }
        if (url.pathname.endsWith("/rentals/hourly")) {
          payload = request.postDataJSON();
          return route.fulfill({ json: envelope({ id: 111, vehicleId: 8, rentalType: "hourly", status: "pending" }) });
        }
        return route.fulfill({ json: envelope([]) });
      });
      await page.goto("/booking?facilityId=5");
      const summary = page.getByRole("complementary");
      await expect(summary.getByText("Tài xế: Chưa phân công", { exact: true })).toBeVisible();
      await expect(page.getByText("Có tài xế phục vụ", { exact: false })).toHaveCount(0);
      releaseSearch();
      if (result === "available") {
        await page.getByRole("radio", { name: "Toyota Vios", exact: true }).check();
        await expect(summary.getByText("Tài xế: Chưa phân công", { exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Xác nhận đặt xe", exact: true }).click();
        await expect(page.getByRole("heading", { name: "Đã gửi yêu cầu đặt xe", exact: true })).toBeVisible();
        expect(payload?.hasDriver).toBe(true);
      } else {
        if (result === "empty") await expect(page.getByText("Chưa có xe và tài xế khả dụng tại cơ sở trong thời gian này. Vui lòng chọn thời gian hoặc cơ sở khác.", { exact: true })).toBeVisible();
        else await expect(page.getByRole("alert").filter({ hasText: "Không kiểm tra được xe và tài xế." })).toBeVisible();
        await expect(summary.getByText("Tài xế: Chưa phân công", { exact: true })).toBeVisible();
        expect(payload).toBeUndefined();
      }
    });
  }
}
