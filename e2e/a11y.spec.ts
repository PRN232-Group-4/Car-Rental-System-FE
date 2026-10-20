import { test, expect } from "@playwright/test";
import path from "node:path";

const axePath = path.resolve(process.cwd(), "node_modules/axe-core/axe.min.js");

declare global {
  interface Window {
    axe: {
      run: (options?: unknown) => Promise<{
        violations: Array<{
          id: string;
          impact: "minor" | "moderate" | "serious" | "critical";
          description: string;
          help: string;
          nodes: Array<{ html: string; target: string[]; failureSummary: string }>;
        }>;
      }>;
    };
  }
}

test.describe("FE-20 Accessibility Automation (WCAG 2.2 AA)", () => {
  const routes = [
    { name: "Trang chủ (Marketing)", path: "/" },
    { name: "Tìm xe (Find Catalog)", path: "/find" },
    { name: "Đăng nhập (Login)", path: "/login" },
    { name: "Đăng ký (Register)", path: "/register" },
    { name: "Không có quyền (Forbidden)", path: "/forbidden" },
  ];

  for (const r of routes) {
    test(`axe audit trên ${r.name} không có lỗi serious hoặc critical`, async ({ page }) => {
      await page.goto(r.path, { waitUntil: "networkidle" });
      await page.addScriptTag({ path: axePath });

      const results = await page.evaluate(async () => {
        return await window.axe.run({
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
          },
        });
      });

      const severeViolations = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );

      if (severeViolations.length > 0) {
        console.error(`Axe violations on ${r.path}:`, JSON.stringify(severeViolations, null, 2));
      }

      expect(severeViolations).toEqual([]);
    });
  }
});
