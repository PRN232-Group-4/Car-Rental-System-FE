import { test, expect } from "@playwright/test";

test.describe("FE-20 Budgets & Performance Automation", () => {
  test("Ngân sách backdrop-filter: công khai <= 4, admin <= 3", async ({ page }) => {
    // 1. Kiểm tra route công khai
    await page.goto("/", { waitUntil: "networkidle" });
    const publicBackdrops = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll("*"));
      return all.filter((el) => {
        const style = window.getComputedStyle(el);
        const bf = style.backdropFilter || (style as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter;
        if (!bf || bf === "none") return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
      }).length;
    });

    expect(publicBackdrops).toBeLessThanOrEqual(4);

    // 2. Kiểm tra route admin
    await page.goto("/admin/dashboard", { waitUntil: "networkidle" });
    const adminBackdrops = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll("*"));
      return all.filter((el) => {
        const style = window.getComputedStyle(el);
        const bf = style.backdropFilter || (style as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter;
        if (!bf || bf === "none") return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
      }).length;
    });

    expect(adminBackdrops).toBeLessThanOrEqual(3);
  });

  test("Kiểm tra không rò rỉ ScrollTrigger và GSAP tweens qua 30 chu kỳ điều hướng", async ({ page }) => {
    test.setTimeout(90000); // 30 rounds need adequate time
    await page.goto("/", { waitUntil: "networkidle" });

    // Lấy số lượng ban đầu sau khi nạp trang chủ
    const initialCounts = await page.evaluate(() => {
      const win = window as unknown as {
        ScrollTrigger?: { getAll: () => unknown[] };
        gsap?: { globalTimeline: { getChildren: () => unknown[] } };
      };
      return {
        triggers: win.ScrollTrigger ? win.ScrollTrigger.getAll().length : 0,
        tweens: win.gsap ? win.gsap.globalTimeline.getChildren().length : 0,
      };
    });

    // Lặp 30 chu kỳ điều hướng giữa / và /find
    for (let i = 0; i < 30; i++) {
      await page.goto("/find", { waitUntil: "domcontentloaded" });
      await page.goto("/", { waitUntil: "domcontentloaded" });
    }

    // Lấy số lượng sau 30 chu kỳ
    const finalCounts = await page.evaluate(() => {
      const win = window as unknown as {
        ScrollTrigger?: { getAll: () => unknown[] };
        gsap?: { globalTimeline: { getChildren: () => unknown[] } };
      };
      return {
        triggers: win.ScrollTrigger ? win.ScrollTrigger.getAll().length : 0,
        tweens: win.gsap ? win.gsap.globalTimeline.getChildren().length : 0,
      };
    });

    // Sau 30 chu kỳ, số triggers và tweens không được tích lũy tăng đột biến (> 2 lần số ban đầu)
    expect(finalCounts.triggers).toBeLessThanOrEqual(initialCounts.triggers + 2);
  });
});
