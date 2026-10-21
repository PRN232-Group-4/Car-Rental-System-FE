import { expect, test } from "@playwright/test";

for (const [width, reducedMotion] of [
  [320, "no-preference"],
  [768, "no-preference"],
  [1024, "no-preference"],
  [1440, "no-preference"],
  [1920, "no-preference"],
  [1440, "reduce"],
] as const) {
  test(`journey stays within its section after late fleet loading at ${width}px (${reducedMotion})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion });
    await page.route(/api\.mapbox\.com|events\.mapbox\.com/, (route) => route.abort());
    let releaseVehicles!: () => void;
    const vehiclesReady = new Promise<void>((resolve) => { releaseVehicles = resolve; });
    const vehicles = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1, brand: "Honda", model: `City ${i + 1}`, vehicleType: "Ô tô xăng", status: "available",
      hourlyPrice: 100000, longtermPrice: 3000000, facilityId: 5, facility: "Chi nhánh trung tâm",
    }));
    await page.route("**/api/**", async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      let data: unknown = pathname.endsWith("/account/profile") ? null : [];
      if (pathname.endsWith("/vehicles")) {
        await vehiclesReady;
        data = { items: vehicles, page: 1, pageSize: 6, totalCount: 6 };
      }
      await route.fulfill({ json: { code: 200, status: "success", is_success: true, data, message: "OK", error: null } });
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#hanh-trinh h2")).toBeAttached();
    await page.evaluate(() => document.fonts.ready);
    if (width >= 1024 && reducedMotion === "no-preference") {
      await expect(page.locator("#hanh-trinh .phase-card").first()).toHaveAttribute("style", /transform/);
    }
    releaseVehicles();
    await expect(page.locator("section#doi-xe").getByRole("heading", { level: 3 })).toHaveCount(6);
    const positions = await page.evaluate(() => {
      const inspection = document.querySelector("#kiem-dinh")!.getBoundingClientRect();
      const journey = document.querySelector("#hanh-trinh")!.getBoundingClientRect();
      return [inspection.top + scrollY - 140, inspection.top + scrollY + inspection.height / 2,
        journey.top + scrollY - 240, journey.top + scrollY + 250,
        journey.top + scrollY + 500, journey.bottom + scrollY - 200];
    });
    for (const y of [...positions, ...positions.toReversed()]) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await expect.poll(() => page.evaluate(() => {
        const section = document.querySelector("#hanh-trinh")!.getBoundingClientRect();
        const narrative = document.querySelector("#hanh-trinh h2")!.parentElement!.getBoundingClientRect();
        return narrative.top >= section.top - 1 && narrative.bottom <= section.bottom + 1;
      }), { message: "Journey narrative must not overlap inspection or membership sections" }).toBe(true);
    }
    if (width >= 1024 && reducedMotion === "no-preference") {
      await page.evaluate(() => {
        const section = document.querySelector("#hanh-trinh")!.getBoundingClientRect();
        window.scrollTo({ top: section.top + scrollY + 400, behavior: "instant" });
      });
      await expect.poll(() => page.locator("#hanh-trinh h2").evaluate((e) => Math.round(e.getBoundingClientRect().top))).toBe(120);
    }
    await page.locator("#kiem-dinh").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/landing-journey-${width}-${reducedMotion}.png` });
  });
}
