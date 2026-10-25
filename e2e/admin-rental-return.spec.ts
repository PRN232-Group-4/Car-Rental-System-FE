import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

for (const fails of [false, true]) {
test(`admin return and policy settlement ${fails ? "keeps state on failure" : "succeeds after inspection"}`, async ({ page }) => {
  if (fails) await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  let status = "renting";
  let returnedAt: string | null = null;
  let postInspection = false;
  const mutations: string[] = [];
  const flat = () => ({ id: 111, vehicleId: 8, rentalType: "hourly", status, startTime: "2020-01-01T08:00:00Z", endTime: "2020-01-01T12:00:00Z", hasDriver: false, isSubscription: false, totalPrice: 500000, depositPrice: 100000, overtimePrice: status === "completed" ? 240000 : 0, hasPassingPreInspection: true, hasPostInspection: postInspection });
  await page.route("**/api/**", (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() === "POST") {
      mutations.push(path);
      if (fails && path === "/api/rental/111/return") return route.fulfill({ status: 503, json: { ...envelope(null), code: 503, status: "error", is_success: false, message: "Không thể xác nhận trả xe. Vui lòng thử lại." } });
      if (path === "/api/rental/111/return") { returnedAt = "2020-01-01T14:00:00Z"; status = "post_inspection"; }
      else if (path === "/api/rental/111/complete" && postInspection) status = "completed";
      else return route.fulfill({ status: 400, json: { ...envelope(null), code: 400, is_success: false, status: "error", message: "Unexpected mutation" } });
      return route.fulfill({ json: envelope({ rentalId: 111, toStatus: status }) });
    }
    const data = path.endsWith("/account/profile") ? { fullName: "Quản lý", email: "manager@test.local", roles: ["Manager"] } :
      path === "/api/rentals" ? { items: [flat()], page: 1, pageSize: 30, totalCount: 1 } :
      path === "/api/rental/111" ? flat() :
      path === "/api/rental/111/detail" ? { rental: { ...flat(), scheduledStart: flat().startTime, scheduledEnd: flat().endTime, returnedAt }, settlement: status === "completed" ? { returnedAt, overtimeHours: 2, overtimeMinutes: 120, overtimeAmount: 240000, overtimeVat: 24000, depositDeducted: 100000, shortfallInvoiceId: 99 } : null } :
      path === "/api/vehicle/8" ? { id: 8, brand: "Toyota", model: "Vios" } :
      path.endsWith("/staff/drivers") ? { items: [], totalCount: 0 } : [];
    return route.fulfill({ json: envelope(data) });
  });
  await page.goto("/admin/rentals?rentalId=111");
  const returns = page.getByRole("region", { name: "Trả xe và phí quá hạn" });
  await expect(returns.getByText("Chưa xác nhận nhận lại xe", { exact: true })).toBeVisible();
  await expect(returns.getByRole("status")).toContainText("Đã quá hạn trả xe");
  expect(mutations).toEqual([]); // Viewing an overdue rental must not charge or return it.
  await page.getByRole("button", { name: "Xác nhận đã nhận lại xe", exact: true }).click();
  if (fails) {
    await expect(page.getByRole("complementary", { name: "Bảng lệnh điều phối" }).getByText("Không thể xác nhận trả xe. Vui lòng thử lại.", { exact: true })).toBeVisible();
    await expect(returns.getByText("Chưa xác nhận nhận lại xe", { exact: true })).toBeVisible();
    await expect(returns.getByText("Phí quá giờ", { exact: true })).toHaveCount(0);
    expect(mutations).toEqual(["/api/rental/111/return"]);
    return;
  }
  await expect(returns.getByText("Đã nhận lại xe:", { exact: false })).toBeVisible();
  await expect(returns.getByText("Đã quá hạn trả xe", { exact: false })).toHaveCount(0);
  const complete = page.getByRole("button", { name: "Quyết toán & Hoàn tất hợp đồng", exact: true });
  await expect(complete).toBeDisabled();
  postInspection = true;
  await page.getByText("Hướng dẫn kiểm tra", {exact:true}).click();
  await page.getByRole("button", { name: "Tải lại kết quả kiểm tra", exact: true }).click();
  await expect(complete).toBeEnabled();
  await complete.click();
  await page.getByRole("button", { name: "Xác nhận hoàn tất", exact: true }).click();
  await expect(returns.getByText("240.000 đ", { exact: true })).toBeVisible();
  await expect(returns.getByText("24.000 đ", { exact: true })).toBeVisible();
  await expect(returns.getByRole("link", { name: "Xem hóa đơn phí quá giờ còn thiếu" })).toHaveAttribute("href", "/invoices/99");
  expect(mutations).toEqual(["/api/rental/111/return", "/api/rental/111/complete"]);
});
}
