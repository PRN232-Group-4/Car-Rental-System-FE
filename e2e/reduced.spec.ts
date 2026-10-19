import { test, expect } from "@playwright/test";

test.describe("FE-20 User Preferences Automation", () => {
  test("prefers-reduced-motion: reduce vô hiệu hóa animation kéo dài", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });

    const isReduced = await page.evaluate(() => {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });
    expect(isReduced).toBe(true);

    // Kiểm tra style animation-duration của các phần tử được áp dụng rule 0.01ms
    const animDuration = await page.evaluate(() => {
      const el = document.querySelector(".phase-card") || document.body;
      return window.getComputedStyle(el).animationDuration;
    });

    // 0.01ms được Chromium serialize thành 1e-05s, 0.00001s hoặc 0s
    expect(["0s", "0.00001s", "0.01ms", "1e-05s"]).toContain(animDuration);
  });

  test("forced-colors: active chuyển đổi vật liệu kính sang CanvasText/Canvas", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/", { waitUntil: "networkidle" });

    const isForcedColors = await page.evaluate(() => {
      return window.matchMedia("(forced-colors: active)").matches;
    });
    expect(isForcedColors).toBe(true);

    const glassStyle = await page.evaluate(() => {
      const el = document.querySelector(".glass-1") || document.querySelector("nav");
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        borderWidth: s.borderTopWidth,
        backdropFilter: s.backdropFilter,
      };
    });

    if (glassStyle) {
      expect(glassStyle.borderWidth).not.toBe("0px");
      expect(glassStyle.backdropFilter).toBe("none");
    }
  });
});
