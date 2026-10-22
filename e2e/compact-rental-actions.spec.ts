import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
for (const width of [1440, 390]) {
  for (const initialStatus of ["renting", "pre_inspection", "completed"]) {
    test(`compact actions ${initialStatus} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 950 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      let status = initialStatus;
      let returns = 0;
      let assignments = 0;
      const flat = () => ({ id: 111, vehicleId: 8, rentalType: "hourly", status, totalPrice: 100000, depositPrice: 10000, hasDriver: true, hasPassingPreInspection: true, hasPostInspection: false, endTime: "2027-01-01T10:00:00Z" });
      await page.route("**/api/**", async route => {
        const path = new URL(route.request().url()).pathname;
        if (route.request().method() === "POST") {
          if (path === "/api/rentals/111/assignments") {
            expect(route.request().postDataJSON()).toEqual({ driverStaffId: null });
            assignments++;
            return route.fulfill({ json: envelope({ rentalId: 111 }) });
          }
          expect(path).toBe("/api/rentals/111/return");
          returns++;
          status = "post_inspection";
          return route.fulfill({ json: envelope({ rentalId: 111, toStatus: status }) });
        }
        const data = path.endsWith("/account/profile") ? { email: "admin@test.local", roles: ["Admin"] } :
          path === "/api/rentals" ? { items: [flat()], totalCount: 1, page: 1, pageSize: 30 } :
          path === "/api/rentals/111" ? flat() :
          path === "/api/rentals/111/detail" ? { rental: { ...flat(), scheduledEnd: flat().endTime, returnedAt: ["completed", "post_inspection"].includes(status) ? "2027-01-01T09:00:00Z" : null }, settlement: null } :
          path === "/api/vehicles/8" ? { id: 8, model: "Vios", brand: "Toyota" } :
          path.endsWith("/inspection-assignment") ? null : { items: [], totalCount: 0 };
        return route.fulfill({ json: envelope(data) });
      });
      await page.goto("/admin/rentals?rentalId=111");
      const commands = page.getByRole("complementary", { name: "Bảng lệnh điều phối" });
      await expect(commands.getByText("Thao tác đơn thuê", { exact: true })).toBeVisible();
      expect(returns).toBe(0);
      if (initialStatus === "pre_inspection") {
        await expect(commands.getByRole("button", { name: "Bàn giao xe & Bắt đầu chuyến", exact: true })).toHaveText("Bàn giao xe");
        await expect(commands.getByRole("button", { name: "Xác nhận đã nhận lại xe", exact: true })).toHaveCount(0);
        await expect(commands.getByText(/Xe chưa bắt đầu thuê/)).toBeVisible();
        await commands.getByRole("button", { name: "Lưu phân công", exact: true }).click();
        await expect(commands.getByRole("button", { name: "Lưu phân công", exact: true })).toHaveCount(0);
        expect(assignments).toBe(1);
      } else if (initialStatus === "completed") {
        await expect(commands.getByRole("button", { name: "Lưu phân công", exact: true })).toHaveCount(0);
        await expect(commands.getByRole("button", { name: "Xác nhận đã nhận lại xe", exact: true })).toHaveCount(0);
      } else {
        const receive = commands.getByRole("button", { name: "Xác nhận đã nhận lại xe", exact: true });
        await expect(receive).toHaveText("Đã trả xe");
        await expect(commands.getByRole("button", { name: "Lưu phân công", exact: true })).toHaveCount(0);
        await commands.getByText("Phân xe và tài xế", { exact: true }).click();
        await commands.getByText("Thao tác khác", { exact: true }).click();
        if (width > 1200) {
          await page.mouse.move(width - 24, 850);
          await page.mouse.wheel(0, 800);
          await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
        }
        await page.getByRole("link", { name: "Đến nút Đã trả xe", exact: true }).click();
        await expect(receive).toBeInViewport();
        await page.screenshot({ path: `test-results/compact-return-${width}.png` });
        await receive.click();
        await expect(page.getByText("Đã nhận lại xe:", { exact: false })).toBeVisible();
        await expect(receive).toHaveCount(0);
        await expect(commands.getByRole("button", { name: "Quyết toán & Hoàn tất hợp đồng", exact: true })).toHaveText("Hoàn tất");
        expect(returns).toBe(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

