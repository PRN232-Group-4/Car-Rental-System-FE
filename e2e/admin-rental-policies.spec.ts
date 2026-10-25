import { expect, test } from "@playwright/test";

const initialPolicy = {
  id: 1, vehicleTypeId: null, name: "Chính sách chung", vatRate: 10,
  overtimeFeeRate: 20, depositPercentage: 20, isActive: true, rentalCount: 7,
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/account/profile")
      ? { fullName: "Quản lý", email: "manager@test.local", roles: ["Manager"] }
      : path.endsWith("/vehicle-types")
        ? [{ id: 4, name: "Ô tô điện", type: "car", fuelType: "electric" }]
        : path.endsWith("/rental-policies") ? { items: [initialPolicy], page: 1, pageSize: 20, totalCount: 1 } : [];
    await route.fulfill({ json: { code: 200, status: "success", is_success: true, data, message: "Đã tải dữ liệu.", error: null } });
  });
});

for (const width of [1280, 390]) {
  test(`policy history explains versions and has a status action at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/admin/policies");
    await expect(page.getByRole("cell", { name: "Chính sách chung", exact: true })).toBeVisible();
    await expect(page.getByText("Tất cả loại phương tiện", { exact: true })).toBeVisible();
    await expect(page.getByText("Mỗi chính sách là một phiên bản", { exact: false })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Thao tác" })).toHaveCount(1);
    const action = page.getByRole("button", { name: "Tạm ngưng Chính sách chung", exact: true });
    await expect(action).toHaveText("");
    await expect(action).toHaveAttribute("title", "Tạm ngưng Chính sách chung");
    await expect(action.locator("svg")).toHaveClass(/lucide-circle-pause|lucide-pause-circle/);
    await expect(page.getByRole("columnheader")).toHaveCount(8);
    await expect(page.getByRole("columnheader", { name: "Số lần thuê", exact: true })).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: "Chính sách chung" }).getByRole("cell", { name: "7", exact: true })).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width);
  });
}

for (const width of [1280, 390]) {
  test(`policy status confirms, locks pending requests and changes only after success at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const requests: { id: string; body: unknown }[] = [];
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => { finish = resolve; });
    await page.route("**/api/rental-policy/1/status", async (route) => {
      expect(route.request().method()).toBe("PATCH");
      const body = route.request().postDataJSON();
      requests.push({ id: new URL(route.request().url()).pathname, body });
      if (requests.length === 1) await pending;
      await route.fulfill({ json: { code: 200, status: "success", is_success: true, data: { ...initialPolicy, ...body }, message: "Đã cập nhật trạng thái.", error: null } });
    });
    await page.goto("/admin/policies");
    const row = page.getByRole("row").filter({ hasText: "Chính sách chung" });
    const deactivate = page.getByRole("button", { name: "Tạm ngưng Chính sách chung", exact: true });
    page.once("dialog", (dialog) => dialog.dismiss());
    await deactivate.click();
    expect(requests).toHaveLength(0);
    await expect(row.getByText("Đang hoạt động", { exact: true })).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await deactivate.click();
    await expect(deactivate).toBeDisabled();
    await expect(deactivate).toHaveAttribute("aria-busy", "true");
    await expect(row.getByText("Đang hoạt động", { exact: true })).toBeVisible();
    await expect.poll(() => requests.length).toBe(1);
    expect(requests[0]).toEqual({ id: "/api/rental-policy/1/status", body: { isActive: false } });
    finish();
    const activate = page.getByRole("button", { name: "Kích hoạt Chính sách chung", exact: true });
    await expect(activate).toBeEnabled();
    await expect(row.getByText("Tạm ngưng", { exact: true })).toBeVisible();
    await expect(activate).toHaveText("");
    await expect(row.getByText("10%", { exact: true })).toBeVisible();
    await expect(row.getByRole("cell", { name: "7", exact: true })).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await activate.click();
    await expect(deactivate).toBeEnabled();
    await expect(row.getByText("Đang hoạt động", { exact: true })).toBeVisible();
    expect(requests[1].body).toEqual({ isActive: true });
    await page.screenshot({ path: `test-results/policy-status/status-${width}.png`, fullPage: true });
  });
}

test("failed status update keeps current badge and permits retry", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/rental-policy/1/status", async (route) => {
    requests++;
    return requests === 1
      ? route.fulfill({ status: 500, json: { code: 500, status: "error", is_success: false, data: null, message: "Không thể đổi trạng thái. Vui lòng thử lại.", error: null } })
      : route.fulfill({ json: { code: 200, status: "success", is_success: true, data: { ...initialPolicy, isActive: false }, message: "Đã cập nhật trạng thái.", error: null } });
  });
  await page.goto("/admin/policies");
  const action = page.getByRole("button", { name: "Tạm ngưng Chính sách chung", exact: true });
  page.once("dialog", (dialog) => dialog.accept());
  await action.click();
  await expect(page.locator('p[role="alert"]')).toHaveText("Không thể đổi trạng thái. Vui lòng thử lại.");
  await expect(action).toBeEnabled();
  await expect(page.getByRole("table").getByText("Đang hoạt động", { exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await action.click();
  await expect(page.getByRole("button", { name: "Kích hoạt Chính sách chung", exact: true })).toBeEnabled();
  await expect(page.locator('p[role="alert"]')).toHaveCount(0);
  expect(requests).toBe(2);
});

test("policy creation validates rates inline, maps API errors, and sends optional global scope as null", async ({ page }) => {
  await page.route("**/api/rental-policies?**", (route) => route.fulfill({ json: { items: [{ ...initialPolicy, isActive: false }], page: 1, pageSize: 20, totalCount: 1 } }));
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/rental-policies", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    const body = route.request().postDataJSON();
    requests.push(body);
    if (requests.length === 1) {
      return route.fulfill({ status: 400, json: {
        code: 400, status: "error", is_success: false, data: null,
        message: "Thông tin không hợp lệ.",
        error: { errors: { Name: ["Tên chính sách đã tồn tại. Vui lòng chọn tên khác."] } },
      } });
    }
    return route.fulfill({ status: 201, json: {
      code: 201, status: "success", is_success: true,
      data: { id: 2, ...body }, message: "Đã tạo chính sách.", error: null,
    } });
  });
  await page.goto("/admin/policies");
  await page.getByRole("button", { name: "Thêm chính sách", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const name = dialog.getByRole("textbox", { name: /^Tên chính sách/ });
  const vat = dialog.getByRole("spinbutton", { name: /^Thuế VAT/ });
  const overtime = dialog.getByRole("spinbutton", { name: /^Phí trễ giờ/ });
  const deposit = dialog.getByRole("spinbutton", { name: /^Tỷ lệ đặt cọc/ });
  const scope = dialog.getByRole("combobox", { name: /^Loại phương tiện/ });
  const save = dialog.getByRole("button", { name: "Lưu thay đổi", exact: true });
  await save.click();
  await expect(name).toBeFocused();
  await expect(dialog.getByRole("alert")).toHaveCount(4);
  await expect(scope).toHaveValue("");
  await name.fill("Chính sách mới");
  await vat.fill("101");
  await overtime.fill("-1");
  await deposit.fill("101");
  await save.click();
  await expect(vat).toBeFocused();
  await expect(dialog.getByRole("alert")).toHaveCount(3);
  expect(requests).toHaveLength(0);
  await vat.fill("8.5");
  await overtime.fill("0");
  await deposit.fill("100");
  await save.click();
  await expect(dialog.getByText("Tên chính sách đã tồn tại. Vui lòng chọn tên khác.")).toBeVisible();
  await expect(name).toBeFocused();
  await expect(vat).toHaveValue("8.5");
  await name.fill("Chính sách mới tháng 10");
  await save.click();
  await expect(dialog).toHaveCount(0);
  expect(requests[1]).toEqual({ name: "Chính sách mới tháng 10", vehicleTypeId: null, vatRate: 8.5, overtimeFeeRate: 0, depositPercentage: 100, isActive: true });

  await page.getByRole("button", { name: "Thêm chính sách", exact: true }).click();
  await name.fill("Chính sách ô tô điện");
  await scope.selectOption("4");
  await vat.fill("0");
  await overtime.fill("100");
  await deposit.fill("0");
  await save.click();
  await expect(dialog).toHaveCount(0);
  expect(requests[2]).toMatchObject({ vehicleTypeId: 4, vatRate: 0, overtimeFeeRate: 100, depositPercentage: 0, isActive: true });
});

test("creating another policy in an active scope is blocked inline before sending", async ({ page }) => {
  let posts = 0;
  await page.route("**/api/rental-policies", (route) => {
    if (route.request().method() === "POST") posts++;
    return route.fallback();
  });
  await page.goto("/admin/policies");
  await page.getByRole("button", { name: "Thêm chính sách", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: /^Tên chính sách/ }).fill("Bản mới");
  for (const label of [/^Thuế VAT/, /^Phí trễ giờ/, /^Tỷ lệ đặt cọc/]) await dialog.getByRole("spinbutton", { name: label }).fill("10");
  await dialog.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(dialog.getByRole("combobox", { name: /^Loại phương tiện/ })).toBeFocused();
  await expect(dialog.getByRole("alert")).toContainText("đã có chính sách đang hoạt động");
  expect(posts).toBe(0);
  await expect(dialog).toBeVisible();
});

test("server validation for a deleted type or an active scope on another page stays inline", async ({ page }) => {
  await page.route("**/api/rental-policies", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    return route.fulfill({ status: 400, json: { code: 400, status: "error", is_success: false, data: null, message: "Thông tin không hợp lệ.", error: { errors: { VehicleTypeId: ["Loại phương tiện không tồn tại hoặc đã có chính sách hoạt động. Vui lòng chọn lại."] } } } });
  });
  await page.goto("/admin/policies");
  await page.getByRole("button", { name: "Thêm chính sách", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: /^Tên chính sách/ }).fill("Bản cho ô tô");
  const type = dialog.getByRole("combobox", { name: /^Loại phương tiện/ });
  await type.selectOption("4");
  for (const label of [/^Thuế VAT/, /^Phí trễ giờ/, /^Tỷ lệ đặt cọc/]) await dialog.getByRole("spinbutton", { name: label }).fill("10");
  await dialog.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(type).toBeFocused();
  await expect(type).toHaveAttribute("aria-invalid", "true");
  await expect(dialog.getByRole("alert")).toContainText("Vui lòng chọn lại");
  await expect(dialog.getByRole("textbox", { name: /^Tên chính sách/ })).toHaveValue("Bản cho ô tô");
});

test("policy pagination renders server usage counts including zero", async ({ page }) => {
  await page.route("**/api/rental-policies?**", (route) => {
    const current = Number(new URL(route.request().url()).searchParams.get("page"));
    return route.fulfill({ json: { items: [{ ...initialPolicy, id: current, name: `Phiên bản ${current}`, rentalCount: current === 1 ? 1234 : 0 }], page: current, pageSize: 20, totalCount: 21 } });
  });
  await page.goto("/admin/policies");
  await expect(page.getByRole("cell", { name: "1.234", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Trang chính sách sau", exact: true }).click();
  await expect(page.getByRole("cell", { name: "Phiên bản 2", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "0", exact: true })).toBeVisible();
  await expect(page.getByText("Trang 2 / 2 · 21 chính sách", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Trang chính sách sau", exact: true })).toBeDisabled();
});
