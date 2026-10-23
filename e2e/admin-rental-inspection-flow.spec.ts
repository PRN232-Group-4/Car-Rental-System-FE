import { expect, test } from "@playwright/test";

const rentalBase = {
  id: 101, customerId: 1, vehicleId: 8, vehicleName: "Hyundai Accent", rentalType: "longterm",
  hasDriver: false, isSubscription: false, vatPrice: 1800000, depositPrice: 4500000,
  overtimePrice: 0, totalPrice: 19800000, startTime: "2026-10-20T00:00:00Z", endTime: "2026-11-20T00:00:00Z",
  contractLink: null, signedAt: null, hasPostInspection: false,
};
const technician = { id: 9, userId: 19, fullName: "Nguyễn Văn Kỹ", email: "ky@example.test", staffRole: "Maintenance", isActive: true };

for (const width of [1600, 1280, 390]) {
  test(`inspection assignment and successful handover at ${width}px`, async ({ page }) => {
    let passing = false;
    let started = false;
    let startRequests = 0;
    let assigned: Record<string, unknown> | null = null;
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => localStorage.setItem("vrs-admin-theme", "light"));
    const rental = () => ({ ...rentalBase, status: started ? "renting" : "pre_inspection", hasPassingPreInspection: passing });
    await page.route("**/api/**", async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      let data: unknown = { items: [], page: 1, pageSize: 100, totalCount: 0 };
      if (path.endsWith("/account/profile")) data = { fullName: "Quản trị viên", email: "admin@example.test", roles: ["Admin"] };
      else if (path.endsWith("/rentals/101/inspection-assignment")) {
        if (request.method() === "PUT") {
          expect(request.postDataJSON()).toEqual({ technicianStaffId: 9 });
          assigned = { rentalId: 101, vehicleId: 8, technicianStaffId: 9, technicianName: technician.fullName, assignedAt: "2026-10-21T03:00:00Z", assignedBy: "admin@example.test" };
        }
        data = assigned;
      } else if (path.endsWith("/rentals/101/start")) {
        startRequests += 1;
        expect(passing).toBe(true);
        started = true;
        data = rental();
      } else if (path.endsWith("/rentals/101")) data = rental();
      else if (path.endsWith("/rentals")) data = { items: [rental()], page: 1, pageSize: 30, totalCount: 1 };
      else if (path.endsWith("/staff")) data = { items: [technician], page: 1, pageSize: 100, totalCount: 1 };
      else if (path.endsWith("/vehicles/8")) data = { id: 8, brand: "Hyundai", model: "Accent", licensePlate: "51F-010.02", detail: null };
      await route.fulfill({ json: { code: 200, status: "success", is_success: true, data, message: "Đã tải dữ liệu.", error: null } });
    });
    await page.goto("/admin/rentals?rentalId=101");
    const handover = page.getByRole("button", { name: "Bàn giao xe & Bắt đầu chuyến", exact: true });
    await expect(handover).toBeDisabled();
    await expect(page.getByText("Cần hoàn tất phiếu kiểm tra trước thuê với kết quả đạt trước khi bàn giao xe.").first()).toBeVisible();
    await page.getByLabel("Kỹ thuật viên phụ trách", { exact: true }).selectOption("9");
    await page.getByRole("region", {name:"Phân công kiểm tra trước thuê"}).getByRole("button", { name: "Xác nhận", exact: true }).click();
    await expect(page.getByText("Đã giao:")).toBeVisible();
    expect(startRequests).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const theme of ["light", "dark"]) {
      if (theme === "dark") await page.locator("#admin-theme-toggle").click();
      await page.screenshot({ path: `test-results/inspection-assignment-${width}-${theme}.png` });
    }
    passing = true;
    await page.getByText("Hướng dẫn kiểm tra", {exact:true}).click();
    await page.getByRole("button", { name: "Tải lại kết quả kiểm tra", exact: true }).click();
    await expect(handover).toBeEnabled();
    await handover.click();
    await expect(page.getByRole("complementary", { name: "Bảng lệnh điều phối" }).getByRole("status").filter({ hasText: "Đã cập nhật đơn thuê sang trạng thái: Đang thuê" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Xác nhận đã nhận lại xe", exact: true })).toBeVisible();
    expect(startRequests).toBe(1);
  });
}

test("admin account profile stays usable when facility directory fails", async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/facilities")) return route.fulfill({ status: 500, json: { code: 500, status: "error", is_success: false, data: null, message: "Không tải được cơ sở.", error: {} } });
    return route.fulfill({ json: { code: 200, status: "success", is_success: true, data: {
      fullName: "Quản trị viên", email: "admin@example.test", roles: ["Admin"], facilityId: 101, gender: "male", phone: "0901234567",
    }, message: "Đã tải hồ sơ.", error: null } });
  });
  await page.goto("/admin/profile");
  await expect(page.getByLabel("Họ và tên", { exact: true })).toHaveValue("Quản trị viên");
  await expect(page.getByText("(intermediate value).find is not a function")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Lưu/ })).toBeEnabled();
});
