import { describe, expect, it } from "vitest";
import { isPageNavigation } from "./navigation-target";

const current = "https://thongdong.vn/admin/vehicles?page=1";

describe("page navigation loading", () => {
  it("includes another route and query-only navigation", () => {
    expect(isPageNavigation("/admin", current)).toBe(true);
    expect(isPageNavigation("?page=2", current)).toBe(true);
  });

  it("ignores the current page and hash-only changes", () => {
    expect(isPageNavigation(current, current)).toBe(false);
    expect(isPageNavigation("#vehicle-form", current)).toBe(false);
    expect(isPageNavigation(`${current}#details`, current)).toBe(false);
  });

  it("ignores external URLs and non-page protocols", () => {
    expect(isPageNavigation("https://other.vn/admin", current)).toBe(false);
    expect(isPageNavigation("mailto:help@thongdong.vn", current)).toBe(false);
    expect(isPageNavigation("javascript:void(0)", current)).toBe(false);
  });
});
