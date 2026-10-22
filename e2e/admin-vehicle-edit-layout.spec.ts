import { expect, test } from "@playwright/test";

const vehicleTypes = [
  { id: 1, name: "Ô tô xăng", type: "car", fuelType: "gasoline" },
  { id: 2, name: "Ô tô điện", type: "car", fuelType: "electric" },
  { id: 3, name: "Xe máy xăng", type: "motorbike", fuelType: "gasoline" },
  { id: 4, name: "Xe máy điện", type: "motorbike", fuelType: "electric" },
];
const vehicle = {
  id: 42, vehicleTypeId: 1, vehicleType: "Ô tô xăng", facilityId: 7,
  facility: "Chi nhánh trung tâm", status: "available", brand: "Toyota", model: "Vios",
  licensePlate: "51A-123.45", color: "Trắng", yearOfManufacture: 2024,
  hourlyPrice: 50000, longtermPrice: 12000000, description: "Xe dành cho gia đình.",
  mainImageUrl: null, location: "Bãi xe trung tâm",
  detail: { seatCount: 5, transmission: "Tự động", trunkCapacity: 500, galleryImages: [] },
};

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/account/profile")
      ? { email: "admin@test.local", fullName: "Quản trị viên", roles: ["Admin"] }
      : path.endsWith("/vehicle-types") ? vehicleTypes
      : path.endsWith("/facilities") ? [{ id: 7, name: "Chi nhánh trung tâm" }]
      : path.endsWith("/vehicles/42") ? vehicle
      : path.endsWith("/vehicles") ? { items: [vehicle], totalCount: 1 }
      : [];
    return route.fulfill({ status: 200, json });
  });
});

for (const width of [1600, 1280, 390, 320]) {
  for (const theme of ["light", "dark"] as const) {
    test(`vehicle edit fits the Transit Desk layout at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem("vrs-admin-theme", value), theme);
      await page.goto("/admin/vehicles/edit?vehicleId=42");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Chỉnh sửa");
      await expect(page.getByLabel("Hãng xe", { exact: true })).toHaveValue("Toyota");
      await expect(page.getByLabel("Số chỗ ngồi", { exact: true })).toHaveValue("5");
      const profile = page.getByRole("complementary", { name: "Hồ sơ phương tiện" });
      const information = page.getByRole("region", { name: "Thông tin phương tiện", exact: true });
      await expect(information).toBeVisible();
      await expect(profile).toContainText("Toyota Vios");
      await expect(profile).toContainText("51A-123.45");
      await expect(profile).toContainText("Chi nhánh trung tâm");
      await page.evaluate(() => document.fonts.ready);
      const [profileBox, informationBox] = await profile.evaluate((element) => {
        const information = document.querySelector('section[aria-labelledby="vehicle-general-title"]')!;
        return [element, information].map((section) => {
          const { x, y, width, height } = section.getBoundingClientRect();
          return { x, y, width, height };
        });
      });
      if (width >= 1024) {
        expect(informationBox.x).toBeGreaterThanOrEqual(profileBox.x + profileBox.width);
        expect(Math.abs(informationBox.y - profileBox.y)).toBeLessThanOrEqual(1);
      } else {
        expect(informationBox.y).toBeGreaterThanOrEqual(profileBox.y + profileBox.height);
      }
      for (const name of ["Thông tin phương tiện", "Thông số kỹ thuật", "Hình ảnh"]) {
        const section = page.getByRole("region", { name, exact: true });
        await expect(section).toHaveCSS("border-top-width", "1px");
        await expect(section).toHaveCSS("border-left-width", "0px");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const save = page.getByRole("button", { name: "Lưu thay đổi", exact: true });
      await save.scrollIntoViewIfNeeded();
      await expect(save).toBeInViewport();
      await expect(save).toBeEnabled();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `test-results/vehicle-edit-${width}-${theme}.png`, fullPage: true });
    });
  }
}

test("edit retains inline validation, API errors and upload error associations", async ({ page }) => {
  await page.goto("/admin/vehicles/edit?vehicleId=42");
  const brand = page.getByLabel("Hãng xe", { exact: true });
  const model = page.getByLabel("Dòng xe / mẫu xe", { exact: true });
  const seats = page.getByLabel("Số chỗ ngồi", { exact: true });
  const save = page.getByRole("button", { name: "Lưu thay đổi", exact: true });
  await expect(brand).toHaveValue("Toyota");
  await brand.fill("");
  await model.fill("");
  await seats.fill("0");
  await save.click();
  await expect(brand).toBeFocused();
  await expect(brand).toHaveAttribute("aria-invalid", "true");
  await expect(model).toHaveAttribute("aria-invalid", "true");
  await expect(seats).toHaveAttribute("aria-invalid", "true");
  await brand.fill("Toyota");
  await expect(brand).toHaveAttribute("aria-invalid", "false");
  await expect(model).toHaveAttribute("aria-invalid", "true");
  await model.fill("Vios");
  await seats.fill("5");

  await page.route("**/api/vehicles/42", (route) => route.fulfill({ status: 400, json: {
    errors: { Brand: ["Hãng xe không hợp lệ."], "Detail.SeatCount": ["Số chỗ chưa được chấp nhận."], VehicleState: ["Xe đang được bàn giao. Vui lòng thử lại sau."] },
  } }));
  await save.click();
  await expect(page.locator("#brand-error")).toHaveText("Hãng xe không hợp lệ.");
  await expect(page.locator("#seatCount-error")).toHaveText("Số chỗ chưa được chấp nhận.");
  await expect(page.getByRole("alert").filter({ hasText: "Xe đang được bàn giao" })).toBeVisible();
  await expect(model).toHaveValue("Vios");

  const upload = page.getByLabel("Tải ảnh lên (có thể chọn nhiều ảnh)", { exact: true });
  await upload.setInputFiles({ name: "invalid.gif", mimeType: "image/gif", buffer: Buffer.from("invalid") });
  await expect(upload).toHaveAttribute("aria-invalid", "true");
  await expect(upload).toHaveAttribute("aria-describedby", "vehicleImage-error");
  await expect(page.locator("#vehicleImage-error")).toHaveText("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
  await page.route("**/api/media/vehicle", (route) => route.abort("failed"));
  await upload.setInputFiles({ name: "vehicle.png", mimeType: "image/png", buffer: Buffer.from("image") });
  await expect(page.locator("#vehicleImage-error")).toHaveText("Không thể tải ảnh lên. Vui lòng kiểm tra kết nối mạng và thử lại.");
  await expect(upload).toHaveAttribute("aria-describedby", "vehicleImage-error");
  await expect(page.locator("#brand-error")).toHaveText("Hãng xe không hợp lệ.");
  await expect(page.locator("#seatCount-error")).toHaveText("Số chỗ chưa được chấp nhận.");
});

for (const type of vehicleTypes) {
  test(`save keeps the request contract for ${type.name}`, async ({ page }) => {
    await page.goto("/admin/vehicles/edit?vehicleId=42");
    await expect(page.getByLabel("Hãng xe", { exact: true })).toHaveValue("Toyota");
    await page.getByLabel("Loại phương tiện", { exact: true }).selectOption(String(type.id));
    const isCar = type.type === "car";
    const isElectric = type.fuelType === "electric";
    if (isCar) {
      await page.getByLabel("Số chỗ ngồi", { exact: true }).fill("7");
      await page.getByLabel("Hộp số", { exact: true }).fill("Tự động");
      await page.getByLabel("Dung tích cốp (lít)", { exact: true }).fill("450");
    } else {
      await page.getByLabel("Loại xe máy", { exact: true }).fill("Tay ga");
      await page.getByLabel("Có cốp chứa đồ", { exact: true }).selectOption("true");
    }
    if (isElectric) {
      await page.getByLabel("Dung lượng pin", { exact: true }).fill("60 kWh");
      await page.getByLabel("Loại pin", { exact: true }).fill("LFP");
      await page.getByLabel("Chuẩn sạc", { exact: true }).fill("Type 2");
      await page.getByLabel("Thời gian sạc (giờ)", { exact: true }).fill("6");
      await page.getByLabel("Quãng đường tối đa (km)", { exact: true }).fill("300");
    }
    const request = page.waitForRequest((request) => request.method() === "PUT" && new URL(request.url()).pathname === "/api/vehicles/42");
    await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
    expect((await request).postDataJSON()).toEqual({
      vehicleTypeId: type.id, facilityId: 7, licensePlate: vehicle.licensePlate,
      status: "available", brand: "Toyota", model: "Vios", color: "Trắng",
      yearOfManufacture: 2024, hourlyPrice: 50000, longtermPrice: 12000000,
      description: vehicle.description, mainImageUrl: null, location: vehicle.location,
      detail: {
        seatCount: isCar ? 7 : null, transmission: isCar ? "Tự động" : null,
        trunkCapacity: isCar ? 450 : null, bikeType: isCar ? null : "Tay ga",
        hasStorageBox: isCar ? null : true, batteryCapacity: isElectric ? "60 kWh" : null,
        chargingType: isElectric ? "Type 2" : null, chargingTimeHours: isElectric ? "6" : null,
        maxRangeKm: isElectric ? 300 : null, batteryType: isElectric ? "LFP" : null, galleryImages: [],
      },
    });
    await expect(page).toHaveURL(/\/admin\/vehicles$/);
  });
}

test("save network failure keeps the loaded vehicle and edited values", async ({ page }) => {
  await page.goto("/admin/vehicles/edit?vehicleId=42");
  const model = page.getByLabel("Dòng xe / mẫu xe", { exact: true });
  await expect(model).toHaveValue("Vios");
  await model.fill("Vios G");
  await page.route("**/api/vehicles/42", (route) => route.abort("failed"));
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Không thể lưu phương tiện. Vui lòng kiểm tra kết nối mạng và thử lại." })).toBeVisible();
  await expect(model).toHaveValue("Vios G");
  await expect(page).toHaveURL(/\/admin\/vehicles\/edit\?vehicleId=42$/);
  await expect(page.getByRole("button", { name: "Lưu thay đổi", exact: true })).toBeEnabled();
});
