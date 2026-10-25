import { expect, test } from "@playwright/test";

const currentFacility = "Cơ sở Đà Nẵng";
const profile = { email: "admin@example.test", fullName: "Quản trị viên", roles: ["Admin"], facilityId: 7, facilityName: currentFacility, staffId: null };
const users = [
  { id: 201, email: "maintenance@example.test", fullName: "Nguyễn Kỹ", roles: ["Maintenance"], isActive: true, staffId: null },
  { id: 202, email: "driver@example.test", fullName: "Trần Tài", roles: ["Driver"], isActive: true, staffId: null },
];
const technician = { id: 9, userId: 201, email: "maintenance@example.test", fullName: "Nguyễn Kỹ", roles: ["Maintenance"], staffRole: "Maintenance", isActive: true, isDriver: false };

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("vrs-admin-theme", "light"));
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = { items: [], totalCount: 0, page: 1, pageSize: 100 };
    if (path.endsWith("/account/profile")) data = profile;
    else if (path.endsWith("/users")) data = { items: users, totalCount: users.length, page: 1, pageSize: 100 };
    else if (path.endsWith("/departments")) data = [{ id: 3, name: "Đội tài xế" }];
    else if (path.endsWith("/facilities")) data = { items: [{ id: 7, name: currentFacility }], totalCount: 1, page: 1, pageSize: 100 };
    else if (path.endsWith("/staff")) data = { items: [technician], totalCount: 1, page: 1, pageSize: 100 };
    else if (path.endsWith("/vehicles")) data = { items: [{ id: 8, brand: "Hyundai", model: "Accent", licensePlate: "51F-010.02" }], totalCount: 1, page: 1, pageSize: 100 };
    else if (path.endsWith("/vehicle/8")) data = { id: 8, brand: "Hyundai", model: "Accent", licensePlate: "51F-010.02" };
    return route.fulfill({ json: { code: 200, status: "success", is_success: true, data, message: "Thành công.", error: null } });
  });
});

for (const width of [1600, 1280, 390]) {
  test(`staff email selection and role-based license at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto("/admin/staffs/new");
    const facility = page.getByRole("status", { name: "Cơ sở công tác hiện tại" });
    await expect(facility).toContainText(currentFacility);
    await expect(facility).toContainText(profile.email);
    const email = page.getByRole("combobox", { name: "Email tài khoản", exact: true });
    await email.selectOption("201");
    await expect(page.getByRole("textbox", { name: "Số GPLX", exact: true })).toHaveCount(0);
    await email.selectOption("202");
    await expect(page.getByRole("textbox", { name: "Số GPLX", exact: true })).toBeVisible();
    await expect(page.getByText("Mã tài khoản người dùng (User ID)")).toHaveCount(0);
    await page.getByRole("combobox", { name: "Phòng ban trực thuộc", exact: true }).selectOption("3");
    await page.getByRole("combobox", { name: "Trạm / Cơ sở công tác", exact: true }).selectOption("7");
    await page.getByRole("textbox", { name: "Số GPLX", exact: true }).fill("790123456789");
    await page.getByRole("textbox", { name: "Ngày hết hạn", exact: true }).fill("2030-10-21");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const theme of ["light", "dark"]) {
      if (theme === "dark") await page.locator("#admin-theme-toggle").click();
      await page.screenshot({ path: `test-results/staff-email-${width}-${theme}.png`, fullPage: true });
    }
  });
}

test("maintenance assignment offers technician emails and facility names", async ({ page }) => {
  await page.goto("/admin/maintenance");
  await page.getByRole("button", { name: "Tạo phiếu bảo trì", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Phiếu bảo trì mới" });
  const email = dialog.getByLabel("Email kỹ thuật viên phụ trách (tùy chọn)", { exact: true });
  await expect(email.getByRole("option", { name: "maintenance@example.test", exact: true })).toHaveCount(1);
  await email.selectOption("9");
  await dialog.getByLabel("Cơ sở phụ trách (tùy chọn)", { exact: true }).selectOption("7");
  await expect(dialog.getByText("Mã nhân viên phụ trách (tùy chọn)", { exact: true })).toHaveCount(0);
  await page.screenshot({ path: "test-results/maintenance-email.png" });
});

test("policies no longer show duplicate or missing policy banners", async ({ page }) => {
  await page.goto("/admin/policies");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Chính sách thuê");
  await expect(page.getByText(/Cảnh báo: Có/)).toHaveCount(0);
  await expect(page.getByText(/Chặn nghiệp vụ:/)).toHaveCount(0);
});

for (const role of ["Manager", "CustomerService", "Maintenance"]) {
  test(`logged-in ${role} sees own assigned facility without staff directory access`, async ({ page }) => {
    const forbiddenRequests: string[] = [];
    await page.route("**/api/account/profile", (route) => route.fulfill({ json: {
      code: 200, status: "success", is_success: true, error: null, message: "Hồ sơ.",
      data: { ...profile, email: `${role.toLowerCase()}@example.test`, roles: [role], staffId: 88 },
    } }));
    await page.route("**/api/staff/**", (route) => {
      forbiddenRequests.push(route.request().url());
      return route.fulfill({ status: 403, json: { code: 403, status: "error", is_success: false, data: null, message: "Không có quyền.", error: {} } });
    });
    await page.goto("/admin");
    await expect(page.getByRole("status", { name: "Cơ sở công tác hiện tại" })).toContainText(currentFacility);
    expect(forbiddenRequests).toEqual([]);
    await expect(page.getByText("Trạm Trung Tâm", { exact: true })).toHaveCount(0);
  });
}
