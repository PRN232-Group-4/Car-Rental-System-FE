import { describe, it, expect } from "vitest";
import { calculatePercentageChange, getPresetDateRange } from "@/features/admin/dashboard/api";

describe("Dashboard Math & Helpers", () => {
  describe("calculatePercentageChange", () => {
    it("tính đúng % tăng trưởng và hướng 'up'", () => {
      const result = calculatePercentageChange(112, 100);
      expect(result.percent).toBe(12);
      expect(result.direction).toBe("up");
      expect(result.text).toBe("+12%");
    });

    it("tính đúng % sụt giảm và hướng 'down'", () => {
      const result = calculatePercentageChange(80, 100);
      expect(result.percent).toBe(20);
      expect(result.direction).toBe("down");
      expect(result.text).toBe("-20%");
    });

    it("xử lý kỳ trước bằng 0 hoặc âm an toàn (tránh NaN, chia 0)", () => {
      const resZero = calculatePercentageChange(100, 0);
      expect(resZero.percent).toBeNull();
      expect(resZero.direction).toBe("neutral");
      expect(resZero.text).toBe("—");

      const resNegative = calculatePercentageChange(100, -10);
      expect(resNegative.percent).toBeNull();
      expect(resNegative.direction).toBe("neutral");
      expect(resNegative.text).toBe("—");
    });

    it("xử lý giá trị null an toàn", () => {
      const resNullCurrent = calculatePercentageChange(null, 100);
      expect(resNullCurrent.percent).toBeNull();
      expect(resNullCurrent.text).toBe("—");

      const resNullPrevious = calculatePercentageChange(100, null);
      expect(resNullPrevious.percent).toBeNull();
      expect(resNullPrevious.text).toBe("—");
    });

    it("xử lý hai giá trị bằng nhau", () => {
      const result = calculatePercentageChange(100, 100);
      expect(result.percent).toBe(0);
      expect(result.direction).toBe("neutral");
      expect(result.text).toBe("0%");
    });
  });

  describe("getPresetDateRange", () => {
    it("trả về mốc ngày hợp lệ cho preset 7d", () => {
      const range = getPresetDateRange("7d");
      expect(range.from).toBeDefined();
      expect(range.to).toBeDefined();
      expect(new Date(range.from).getTime()).toBeLessThan(new Date(range.to).getTime());
    });

    it("trả về mốc ngày hợp lệ cho preset 30d", () => {
      const range = getPresetDateRange("30d");
      expect(range.from).toBeDefined();
      expect(range.to).toBeDefined();
      expect(new Date(range.from).getTime()).toBeLessThan(new Date(range.to).getTime());
    });

    it("trả về mốc ngày hợp lệ cho preset this_month và last_month", () => {
      const thisMonth = getPresetDateRange("this_month");
      const lastMonth = getPresetDateRange("last_month");
      expect(thisMonth.from).toBeDefined();
      expect(lastMonth.from).toBeDefined();
      expect(new Date(lastMonth.from).getTime()).toBeLessThan(new Date(thisMonth.from).getTime());
    });
  });
});
