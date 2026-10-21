import { test, expect } from "@playwright/test";

const envelope = (code: number, data: unknown = null, error: unknown = null) => ({ code, status: code < 400 ? "success" : "error", is_success: code < 400, data, message: code < 400 ? "Thành công." : "OTP không chính xác.", error });

for (const scenario of [
  { path: "/profile", role: "Customer", mobile: false },
  { path: "/admin/profile", role: "Admin", mobile: true },
]) {
  test(`đổi mật khẩu với OTP tại ${scenario.path}`, async ({ page }) => {
    if (scenario.mobile) await page.setViewportSize({ width: 390, height: 844 });
    let completed = false;
    let confirmations = 0;
    const requested: string[] = [];
    await page.route("**/api/**", async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (path.endsWith("/account/profile")) {
        if (completed) return route.fulfill({ status: 401, json: envelope(401) });
        return route.fulfill({ json: envelope(200, { email: "user@test.local", fullName: "Người dùng", roles: [scenario.role], facilityId: null, staffId: null }) });
      }
      if (path.endsWith("/account/password/otp")) {
        requested.push(path);
        expect(request.postDataJSON()).toEqual({ currentPassword: "current" });
        return route.fulfill({ status: 202, json: envelope(202) });
      }
      if (path.endsWith("/account/password")) {
        confirmations++;
        if (confirmations === 1) return route.fulfill({ status: 400, json: envelope(400, null, { errors: { Otp: ["OTP không chính xác."] } }) });
        expect(request.postDataJSON()).toEqual({ currentPassword: "current", newPassword: "newpass", otp: "012345" });
        completed = true;
        return route.fulfill({ json: envelope(200) });
      }
      if (path.endsWith("/customer/license")) return route.fulfill({ status: 404, json: envelope(404) });
      return route.fulfill({ json: envelope(200, { items: [], page: 1, pageSize: 20, totalCount: 0 }) });
    });
    await page.goto(scenario.path);
    const form = page.getByRole("region", { name: "Đổi mật khẩu", exact: true });
    await expect(form).toBeVisible();
    await form.getByRole("button", { name: "Gửi OTP xác nhận" }).click();
    await expect(form.getByLabel("Mật khẩu hiện tại")).toBeFocused();
    expect(requested).toHaveLength(0);
    await form.getByLabel("Mật khẩu hiện tại").fill("current");
    await form.getByRole("button", { name: "Gửi OTP xác nhận" }).click();
    await expect(form.getByLabel("Mã OTP", { exact: true })).toBeFocused();
    expect(requested).toHaveLength(1); expect(confirmations).toBe(0);
    await expect(form.getByRole("button", { name: /Gửi lại OTP/ })).toBeDisabled();
    await form.getByRole("button", { name: "Xác nhận đổi mật khẩu" }).click();
    await expect(form.getByLabel("Mã OTP", { exact: true })).toBeFocused();
    expect(confirmations).toBe(0);
    await form.getByLabel("Mã OTP", { exact: true }).fill("000000");
    await form.getByLabel("Mật khẩu mới", { exact: true }).fill("newpass");
    await form.getByLabel("Xác nhận mật khẩu mới").fill("newpass");
    await form.getByRole("button", { name: "Xác nhận đổi mật khẩu" }).click();
    await expect(form.getByText("OTP không chính xác.", { exact: true })).toBeVisible();
    await expect(form.getByLabel("Mã OTP", { exact: true })).toBeFocused();
    await expect(form.getByLabel("Mật khẩu mới", { exact: true })).toHaveValue("newpass");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/password-change-${scenario.role}.png`, fullPage: true });
    await form.getByLabel("Mã OTP", { exact: true }).fill("012345");
    await form.getByRole("button", { name: "Xác nhận đổi mật khẩu" }).click();
    await expect(page).toHaveURL(/\/login/);
    expect(confirmations).toBe(2);
  });
}
