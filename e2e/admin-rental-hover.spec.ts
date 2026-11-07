import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
for (const width of [1600, 1280, 390]) {
  test(`rental controls stay still on hover at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    let status = "renting";
    let returns = 0;
    let assignments = 0;
    const flat = () => ({ id: 111, vehicleId: 8, rentalType: "hourly", status, totalPrice: 100000, depositPrice: 10000, hasDriver: true, hasPassingPreInspection: true, hasPostInspection: false, endTime: "2027-01-01T10:00:00Z" });
    await page.route("**/api/**", async route => {
      const path = new URL(route.request().url()).pathname;
      if (route.request().method() === "POST") {
        if (path === "/api/rental/111/assignments") {
          expect(route.request().postDataJSON()).toEqual({ driverStaffId: null });
          assignments++;
          return route.fulfill({ json: envelope({ rentalId: 111 }) });
        }
        expect(path).toBe("/api/rental/111/return");
        returns++;
        status = "post_inspection";
        return route.fulfill({ json: envelope({ rentalId: 111, toStatus: status }) });
      }
      const data = path.endsWith("/account/profile") ? { email: "admin@test.local", roles: ["Admin"] } :
        path === "/api/rentals" ? { items: [flat()], totalCount: 1, page: 1, pageSize: 30 } :
        path === "/api/rental/111" ? flat() :
        path === "/api/rental/111/detail" ? { rental: { ...flat(), scheduledEnd: flat().endTime, returnedAt: ["completed", "post_inspection"].includes(status) ? "2027-01-01T09:00:00Z" : null }, settlement: null } :
        path === "/api/vehicle/8" ? { id: 8, model: "Vios", brand: "Toyota" } :
        path.endsWith("/inspection-assignment") ? null : /\/(assignable-drivers|assignable-vehicles|assignments|inspections|history)$/.test(path) ? [] : { items: [], page: 1, pageSize: 100, totalCount: 0 };
      return route.fulfill({ json: envelope(data) });
    });
    await page.goto("/admin/rentals?rentalId=111");
    const commands = page.getByRole("complementary", { name: "Bảng lệnh điều phối" });
    const receive = commands.getByRole("button", { name: "Xác nhận đã nhận lại xe", exact: true });
    await expect(receive).toBeEnabled();
    await receive.scrollIntoViewIfNeeded();
    const before = await receive.boundingBox();
    if (!before) throw new Error("Return action has no bounds");
    const background = await receive.evaluate(el => getComputedStyle(el).backgroundColor);
    await page.mouse.move(before.x + 2, before.y + 2);
    // Longer than the former 500ms pointer tilt tween: the target must not drift away.
    await page.waitForTimeout(650);
    expect(await receive.boundingBox()).toEqual(before);
    expect(await receive.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(background);
    await expect(receive).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/rental-hover-${width}.png` });
    await page.mouse.click(before.x + 2, before.y + 2);
    await expect(page.getByText("Đã nhận lại xe:", { exact: false })).toBeVisible();
    expect(returns).toBe(1);
  });
}
