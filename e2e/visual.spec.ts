import { test, expect } from "@playwright/test";

test.describe("FE-20 Responsive & Visual Regression Smoke", () => {
  const viewports = [
    { name: "Mobile (375px)", width: 375, height: 667 },
    { name: "Tablet (768px)", width: 768, height: 1024 },
    { name: "Desktop (1280px)", width: 1280, height: 800 },
    { name: "Ultra-wide (1536px)", width: 1536, height: 960 },
  ];

  const targetRoutes = [
    { name: "Trang chủ", path: "/" },
    { name: "Tìm kiếm xe", path: "/find" },
    { name: "Đăng nhập", path: "/login" },
    { name: "Admin Dashboard", path: "/admin/dashboard" },
  ];

  for (const vp of viewports) {
    test.describe(`Độ phân giải ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const r of targetRoutes) {
        test(`Không có lỗi cuộn ngang trên ${r.name}`, async ({ page }) => {
          await page.goto(r.path, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(500);

          const hasOverflow = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            return docWidth > winWidth + 1; // Dung sai 1px subpixel
          });

          expect(hasOverflow).toBe(false);
        });
      }
    });
  }
});
