import { describe, it, expect } from "vitest";
import { formatVnd, formatPercent, formatKm, formatDuration } from "./format";

describe("formatVnd", () => {
  it("formats positive numbers with dots and lower 'đ' suffix", () => {
    expect(formatVnd(900000)).toBe("900.000đ");
    expect(formatVnd(15000000)).toBe("15.000.000đ");
    expect(formatVnd(0)).toBe("0đ");
  });

  it("handles negative numbers and floats gracefully", () => {
    expect(formatVnd(-50000)).toBe("-50.000đ");
    expect(formatVnd(1234.56)).toBe("1.235đ");
  });

  it("handles NaN safely", () => {
    expect(formatVnd(NaN)).toBe("0đ");
  });
});

describe("formatPercent", () => {
  it("formats decimal ratios and direct numbers into percentages", () => {
    expect(formatPercent(0.15)).toBe("15%");
    expect(formatPercent(15)).toBe("15%");
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(0.085, 1)).toBe("8.5%");
  });

  it("handles negative values and NaN", () => {
    expect(formatPercent(-0.1)).toBe("-10%");
    expect(formatPercent(NaN)).toBe("0%");
  });
});

describe("formatKm", () => {
  it("formats kilometers with dots and 'km' suffix", () => {
    expect(formatKm(1250)).toBe("1.250 km");
    expect(formatKm(45)).toBe("45 km");
    expect(formatKm(0)).toBe("0 km");
    expect(formatKm(NaN)).toBe("0 km");
  });
});

describe("formatDuration", () => {
  it("formats minutes into readable days, hours, and minutes", () => {
    expect(formatDuration(45)).toBe("45 phút");
    expect(formatDuration(60)).toBe("1 giờ");
    expect(formatDuration(90)).toBe("1 giờ 30 phút");
    expect(formatDuration(1440)).toBe("1 ngày");
    expect(formatDuration(1500)).toBe("1 ngày 1 giờ");
    expect(formatDuration(1530)).toBe("1 ngày 1 giờ"); // Khi có cả ngày và giờ thì bỏ phút thừa để gọn
    expect(formatDuration(0)).toBe("0 phút");
    expect(formatDuration(-10)).toBe("0 phút");
  });
});
