import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });

for (const width of [1440, 375]) {
  for (const status of ["pending", "none"]) {
    test(`new customer can select gender and submit first license (${width}px, ${status})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      let profile = { fullName: "Khách mới", email: "new-customer@test.local", phone: "0901234567", gender: "", roles: ["Customer"] };
      const savedGenders: string[] = [];
      let submissions = 0;

      // Every API call is intercepted so these tests never modify real accounts.
      await page.route("**/api/**", async (route) => {
        const request = route.request();
        const path = new URL(request.url()).pathname;
        if (path === "/api/account/profile") {
          if (request.method() === "PUT") {
            const body = request.postDataJSON();
            savedGenders.push(body.gender);
            profile = { ...profile, ...body };
          }
          return route.fulfill({ json: envelope(profile) });
        }
        if (path === "/api/customer/license") {
          if (request.method() === "PUT") {
            expect(request.headers()["content-type"]).toContain("multipart/form-data");
            expect(request.postData()).toContain("FIRST-LICENSE");
            submissions += 1;
            return route.fulfill({ json: envelope({ number: "FIRST-LICENSE", type: "B1", issueDate: "2024-01-01", expiryDate: "2099-01-01", imageUrl: "https://example.test/license.png", status: "pending" }) });
          }
          return route.fulfill({ json: envelope({ number: null, type: null, issueDate: null, expiryDate: null, imageUrl: null, status }) });
        }
        return route.fulfill({ status: 404, json: { code: 404, status: "error", is_success: false, data: null, message: "Unexpected test request", error: null } });
      });

      await page.goto("/profile");
      const submitLicense = page.getByRole("button", { name: "Gửi giấy phép để xét duyệt", exact: true });
      await expect(submitLicense).toBeEnabled();
      const progress = page.getByRole("region", { name: "Tiến trình xác minh hồ sơ" });
      await expect(progress.getByText("Tải lên ảnh giấy phép", { exact: true })).toBeVisible();
      await expect(progress.getByText("Đã gửi tài liệu", { exact: true })).toHaveCount(0);
      await expect(page.getByText("Hồ sơ đang chờ phê duyệt", { exact: true })).toHaveCount(0);

      for (const gender of ["Male", "Female", "Other", ""]) {
        await page.getByLabel("Giới tính", { exact: true }).selectOption(gender);
        await expect(page.getByLabel("Giới tính", { exact: true })).toHaveValue(gender);
        await expect(page.getByText("Thông tin đã được lưu.", { exact: true })).toHaveCount(0);
        await page.getByRole("button", { name: "Lưu thông tin", exact: true }).click();
        await expect(page.getByText("Thông tin đã được lưu.", { exact: true })).toBeVisible();
      }
      expect(savedGenders).toEqual(["Male", "Female", "Other", ""]);

      await page.locator('[name="licenseNumber"]').fill("FIRST-LICENSE");
      await page.locator('[name="licenseType"]').fill("B1");
      await page.locator('[name="issueDate"]').fill("2024-01-01");
      await page.locator('[name="expiryDate"]').fill("2099-01-01");
      await page.locator("#license-file").setInputFiles({ name: "license.png", mimeType: "image/png", buffer: Buffer.from("test image") });
      await submitLicense.click();
      await expect(page.getByText("Hồ sơ đang chờ phê duyệt", { exact: true })).toBeVisible();
      await expect(progress.getByText("Đã gửi tài liệu", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Đang chờ phê duyệt", exact: true })).toBeDisabled();
      expect(submissions).toBe(1);
      expect(errors).toEqual([]);
    });
  }
}
