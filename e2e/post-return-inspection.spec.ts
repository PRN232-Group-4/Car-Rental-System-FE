import { expect, test } from "@playwright/test";
const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
for (const width of [1440, 1024, 390]) {
  for (const mode of ["checked", "assign", "error", "existing", "manager"] as const) {
    test(`post-return inspection ${mode} at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 950 });
      let status = "renting", inspected = mode === "existing";
      let assignment: unknown = null;
      const writes: string[] = [];
      const rental = () => ({ id: 112, vehicleId: 8, customerId: 1, status, rentalType: "hourly", hasDriver: true, hasPassingPreInspection: true, hasPostInspection: inspected, totalPrice: 100000, isSubscription: true, endTime: "2027-01-10T10:00:00Z" });
      await page.route("**/api/**", async route => {
        const url = new URL(route.request().url());
        const path = url.pathname;
        const method = route.request().method();
        if (["POST", "PUT"].includes(method)) {
          writes.push(path);
          if (path.endsWith("/return")) status = "post_inspection";
          else if (path.includes("/inspection-assignment")) {
            expect(url.searchParams.get("inspectionType")).toBe("post_rental");
            expect(route.request().postDataJSON()).toEqual({ technicianStaffId: 9 });
            if (mode === "error") return route.fulfill({ status: 409, json: { ...envelope(null), code: 409, status: "error", is_success: false, message: "Chưa lưu được kiểm tra sau trả xe.", error: { detail: "Chưa lưu được kiểm tra sau trả xe." } } });
            assignment = { technicianStaffId: 9, technicianEmail: "tech@test.local", assignedAt: "2026-10-22T04:00:00Z" };
            if (path.endsWith("/checked")) inspected = true;
            return route.fulfill({ json: envelope(assignment) });
          } else if (path.endsWith("/complete")) { expect(inspected).toBe(true); status = "completed"; }
          else throw new Error("Unexpected write " + path);
          return route.fulfill({ json: envelope({ rentalId: 112 }) });
        }
        const data = path.endsWith("/account/profile") ? { email: "admin@test.local", roles: [mode === "manager" ? "Manager" : "Admin"] } :
          path === "/api/rental/112" ? rental() :
          path === "/api/rentals" ? { items: [rental()], totalCount: 1 } :
          path === "/api/rental/112/detail" ? { rental: { ...rental(), returnedAt: status === "renting" ? null : "2027-01-10T09:00:00Z" }, settlement: null } :
          path.endsWith("/inspection-assignment") ? url.searchParams.get("inspectionType") === "post_rental" ? assignment : { technicianStaffId: 7, technicianEmail: "pre@test.local" } :
          path === "/api/staff" ? { items: [{ id: 9, email: "tech@test.local", isActive: true, roles: ["Maintenance"] }], totalCount: 1 } :
          path === "/api/vehicle/8" ? { id: 8, brand: "Toyota", model: "Vios" } : { items: [], totalCount: 0 };
        return route.fulfill({ json: envelope(data) });
      });
      await page.goto("/admin/rentals?rentalId=112");
      const commands = page.getByRole("complementary", { name: "Bảng lệnh điều phối" });
      await commands.getByRole("button", { name: "Xác nhận đã nhận lại xe", exact: true }).click();
      const section = page.getByRole("region", { name: "Phân công kiểm tra sau trả xe" });
      await expect(section).toBeVisible();
      const complete = commands.getByRole("button", { name: "Quyết toán & Hoàn tất hợp đồng", exact: true });
      if (mode === "existing") {
        await expect(section).toContainText("Đã có biên bản kiểm tra sau trả xe.");
        await expect(section.getByRole("combobox")).toHaveCount(0);
        await expect(complete).toBeEnabled();
        return;
      }
      await expect(complete).toBeDisabled();
      await section.getByLabel("Kỹ thuật viên phụ trách").selectOption("9");
      if (mode !== "manager") await section.getByLabel("Thao tác kiểm tra").selectOption(mode === "assign" ? "assign" : "checked");
      else await expect(section.getByLabel("Thao tác kiểm tra")).toHaveCount(0);
      if (mode === "checked") {
        await section.scrollIntoViewIfNeeded();
        await page.screenshot({ path: `test-results/post-inspection-form-${width}.png` });
      }
      await section.getByRole("button", { name: mode === "assign" || mode === "manager" ? "Xác nhận" : "Đã inspect", exact: true }).click();
      if (mode === "error") {
        await expect(section.getByRole("alert")).toContainText("Chưa lưu được kiểm tra sau trả xe.");
        await expect(section.getByLabel("Kỹ thuật viên phụ trách")).toHaveValue("9");
        await expect(complete).toBeDisabled();
      } else if (mode === "assign" || mode === "manager") {
        await expect(section).toContainText("Đã giao: tech@test.local");
        await expect(section.getByLabel("Kỹ thuật viên phụ trách")).toHaveValue("9");
        await expect(complete).toBeDisabled();
      } else {
        await expect(section).toContainText("Đã có biên bản kiểm tra sau trả xe.");
        await expect(complete).toBeEnabled();
        await page.screenshot({ path: `test-results/post-inspection-${width}.png` });
        await complete.click();
        await page.getByRole("button", { name: "Xác nhận hoàn tất", exact: true }).click();
        await expect(commands).toContainText("Hồ sơ hợp đồng đã ở trạng thái kết thúc (completed)");
      }
      expect(writes).not.toContain("/api/rental/112/start");
      expect(writes).not.toContain("/api/rental/112/confirm");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
