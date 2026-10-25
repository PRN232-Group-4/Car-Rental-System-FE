import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
for (const width of [1440, 1024, 390]) {
  for (const mode of ["cash", "cash-error", "online", "inspect-error", "approval-error", "driver", "subscription"] as const) {
    if (width === 1024 && mode !== "cash") continue;
    test(`approve then inspect and pay: ${mode} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 950 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      let status = "pending";
      let passing = mode === "driver";
      let paid = false;
      let driverReads = 0;
      const writes: string[] = [];
      const flat = () => ({ id: 112, invoiceId: 55, customerId: 1, vehicleId: 8, rentalType: "hourly", status, hasDriver: mode === "driver", isSubscription: mode === "subscription", hasPassingPreInspection: passing, hasPostInspection: false, totalPrice: 100000, depositPrice: 20000, startTime: "2027-01-10T08:00:00Z", endTime: "2027-01-10T10:00:00Z" });
      const invoice = () => ({ id: 55, rentalId: 112, invoiceNumber: "INV-112", amount: 100000, kind: "rental", status: paid ? "paid" : "unpaid", paymentMethod: mode === "online" ? "payos" : "cash", canPay: status === "pre_inspection" && !paid });
      const fail = (message: string) => ({ ...envelope(null), code: 409, status: "error", is_success: false, message, error: { detail: message } });
      await page.route("**/api/**", async route => {
        const path = new URL(route.request().url()).pathname;
        if (route.request().method() === "POST") {
          writes.push(path);
          if (path.endsWith("/confirm")) {
            expect(status).toBe("pending");
            if (mode === "approval-error") return route.fulfill({ status: 409, json: fail("Chưa duyệt được đơn. Vui lòng thử lại.") });
            status = "pre_inspection";
          } else if (path.endsWith("/inspection-assignment/checked")) {
            expect(status).toBe("pre_inspection");
            expect(route.request().postDataJSON()).toEqual({ technicianStaffId: 9 });
            if (mode === "inspect-error") return route.fulfill({ status: 409, json: fail("Chưa lưu được kiểm tra. Vui lòng thử lại.") });
            passing = true;
            return route.fulfill({ json: envelope({ technicianStaffId: 9 }) });
          } else if (path.endsWith("/cash-confirmation")) {
            expect(status).toBe("pre_inspection");
            expect(mode).not.toBe("online");
            if (mode === "cash-error") return route.fulfill({ status: 409, json: fail("Chưa ghi nhận được tiền. Vui lòng thử lại.") });
            paid = true;
          } else if (path.endsWith("/assignments")) {
            expect(mode).toBe("driver");
            expect(route.request().postDataJSON()).toEqual({ driverStaffId: 7 });
          } else {
            expect(path).toBe("/api/rental/112/start");
            expect(passing).toBe(true);
            expect(paid || mode === "subscription").toBe(true);
            status = "renting";
          }
          return route.fulfill({ json: envelope({ rentalId: 112, toStatus: status }) });
        }
        if (path === "/api/staff/drivers") driverReads++;
        const data = path.endsWith("/account/profile") ? { email: "admin@test.local", roles: ["Admin"] } :
          path === "/api/rental/112" ? flat() :
          path === "/api/rentals" ? { items: [flat()], totalCount: 1 } :
          path === "/api/invoice/55" ? invoice() :
          path === "/api/rental/112/detail" ? { rental: { ...flat(), scheduledEnd: flat().endTime }, invoice: invoice() } :
          path.endsWith("/inspection-assignment") ? null :
          path === "/api/staff" ? { items: [{ id: 9, email: "tech@test.local", isActive: true, roles: ["Maintenance"] }], totalCount: 1 } :
          path === "/api/staff/drivers" ? { items: [{ id: 7, email: "driver@test.local", isActive: true }], totalCount: 1 } :
          path === "/api/vehicle/8" ? { id: 8, model: "Vios", brand: "Toyota" } : { items: [], totalCount: 0 };
        return route.fulfill({ json: envelope(data) });
      });
      await page.goto("/admin/rentals?rentalId=112");
      const commands = page.getByRole("complementary", { name: "Bảng lệnh điều phối" });
      const inspection = page.getByRole("region", { name: "Phân công kiểm tra trước thuê" });
      const payment = page.getByRole("region", { name: "Thanh toán đơn thuê" });
      const primary = commands.locator("#rental-primary-action");
      await expect(primary).toHaveText("Xác nhận đơn thuê");
      await expect(inspection.getByRole("combobox")).toHaveCount(0);
      await expect(payment.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" })).toHaveCount(0);
      expect(writes).toEqual([]);
      await primary.click();
      if (mode === "approval-error") {
        await expect(commands.getByText("Chưa duyệt được đơn. Vui lòng thử lại.", { exact: true })).toBeVisible();
        await expect(primary).toHaveText("Xác nhận đơn thuê");
        await expect(inspection.getByRole("combobox")).toHaveCount(0);
        return;
      }
      await expect(primary).toHaveText("Bàn giao xe");
      if (mode !== "driver") {
        await expect(commands.getByLabel("Tài xế nhận lệnh")).toHaveCount(0);
        await inspection.getByLabel("Kỹ thuật viên phụ trách").selectOption("9");
        await inspection.getByLabel("Thao tác kiểm tra").selectOption("checked");
        await inspection.getByRole("button", { name: "Đã inspect", exact: true }).click();
        if (mode === "inspect-error") {
          await expect(inspection.getByRole("alert")).toContainText("Chưa lưu được kiểm tra");
          await expect(primary).toBeDisabled();
          expect(writes).not.toContain("/api/rental/112/start");
          return;
        }
        await expect(inspection).toContainText("Đã đạt kiểm tra trước thuê.");
      } else {
        await commands.getByLabel("Tài xế nhận lệnh").selectOption("7");
        await commands.getByRole("button", { name: "Lưu phân công", exact: true }).click();
      }
      if (mode === "subscription") {
        await expect(payment).toHaveCount(0);
      } else {
        await expect(primary).toBeDisabled();
        if (mode === "online") {
          await expect(payment.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" })).toHaveCount(0);
          paid = true;
          await payment.getByRole("button", { name: "Cập nhật trạng thái thanh toán" }).click();
        } else {
          await payment.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" }).scrollIntoViewIfNeeded();
          if (mode === "cash") await page.screenshot({ path: `test-results/rental-cash-control-${width}.png` });
          await payment.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" }).click();
          const dialog = page.getByRole("dialog");
          if (mode === "cash") {
            await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
            await dialog.getByRole("button", { name: "Đóng", exact: true }).click();
            await expect(dialog).toHaveCount(0);
            expect(await page.locator("body").evaluate(element => getComputedStyle(element).overflowY)).not.toBe("hidden");
            const before = await page.evaluate(() => scrollY);
            if (before > 0) {
              await page.mouse.move(width - 24, 400);
              await page.mouse.wheel(0, -400);
              await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(before);
            }
            await payment.getByRole("button", { name: "Xác nhận đã thanh toán tiền mặt" }).click();
          }
          await dialog.getByRole("button", { name: "Xác nhận đã nhận đủ tiền" }).click();
          if (mode === "cash-error") {
            await expect(dialog).toContainText("Chưa ghi nhận được tiền");
            await expect(payment).toContainText("Chưa thanh toán");
            await expect(primary).toBeDisabled();
            expect(writes).not.toContain("/api/rental/112/start");
            return;
          }
        }
        await expect(payment.getByText("Đã thanh toán", { exact: true })).toBeVisible();
      }
      await expect(primary).toBeEnabled();
      await primary.scrollIntoViewIfNeeded();
      if (mode === "cash") await page.screenshot({ path: `test-results/rental-payment-ready-${width}.png` });
      await primary.click();
      await expect(primary).toHaveText("Đã trả xe");
      expect(writes.filter(path => path.endsWith("/start"))).toHaveLength(1);
      if (mode !== "driver") { expect(driverReads).toBe(0); expect(writes).not.toContain("/api/rental/112/assignments"); }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
