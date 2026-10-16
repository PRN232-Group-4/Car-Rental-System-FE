import { describe, it, expect } from "vitest";
import {
  GMT7_TIMEZONE,
  nowGmt7,
  toUtcIso,
  fromUtcIso,
  parseGmt7Input,
  formatDateTime,
  formatDate,
  formatTime,
  formatRange,
  combineDateAndTimeGmt7,
  diffHours,
  generateTimeSlots,
  isBeforeTodayGmt7,
} from "./time";

describe("time utilities (GMT+7 Asia/Ho_Chi_Minh)", () => {
  it("enforces GMT7_TIMEZONE constant as Asia/Ho_Chi_Minh", () => {
    expect(GMT7_TIMEZONE).toBe("Asia/Ho_Chi_Minh");
  });

  describe("toUtcIso", () => {
    it("converts Date and valid string to ISO UTC", () => {
      const date = new Date("2026-10-15T08:30:00+07:00");
      expect(toUtcIso(date)).toBe("2026-10-15T01:30:00.000Z");
    });

    it("throws on invalid date input", () => {
      expect(() => toUtcIso("invalid-date")).toThrow("Giá trị ngày giờ không hợp lệ");
    });
  });

  describe("fromUtcIso & formatDateTime across midnight and day change", () => {
    it("handles time within the same day", () => {
      const utcIso = "2026-10-15T01:30:00.000Z";
      expect(formatDateTime(utcIso)).toBe("08:30 15/10/2026");
      expect(formatDate(utcIso)).toBe("15/10/2026");
      expect(formatTime(utcIso)).toBe("08:30");
    });

    it("correctly shifts date forward across midnight (23:30Z Oct 14 -> 06:30 Oct 15)", () => {
      const utcIso = "2026-10-14T23:30:00.000Z";
      const tzDate = fromUtcIso(utcIso);
      expect(formatDateTime(tzDate)).toBe("06:30 15/10/2026");
      expect(formatDate(tzDate)).toBe("15/10/2026");
    });

    it("correctly handles month end and leap year transitions", () => {
      // Leap year Feb 28 23:00Z 2024 -> Feb 29 06:00 2024 GMT+7
      const leapIso = "2024-02-28T23:00:00.000Z";
      expect(formatDateTime(leapIso)).toBe("06:00 29/02/2024");

      // Non-leap year Feb 28 23:00Z 2026 -> Mar 01 06:00 2026 GMT+7
      const nonLeapIso = "2026-02-28T23:00:00.000Z";
      expect(formatDateTime(nonLeapIso)).toBe("06:00 01/03/2026");
    });

    it("proves Vietnam has no Daylight Saving Time (DST) shift", () => {
      // Winter vs Summer: both remain precisely +7 hours
      const summerUtc = "2026-06-15T00:00:00.000Z";
      const winterUtc = "2026-12-15T00:00:00.000Z";
      expect(formatTime(summerUtc)).toBe("07:00");
      expect(formatTime(winterUtc)).toBe("07:00");
    });
  });

  describe("parseGmt7Input", () => {
    it("parses user input strings in GMT+7", () => {
      const date = parseGmt7Input("2026-10-15 08:30");
      expect(formatDateTime(date)).toBe("08:30 15/10/2026");
    });

    it("parses slash date format dd/MM/yyyy HH:mm", () => {
      const date = parseGmt7Input("15/10/2026 14:00");
      expect(formatDateTime(date)).toBe("14:00 15/10/2026");
    });

    it("throws on completely unrecognizable input", () => {
      expect(() => parseGmt7Input("invalid input string")).toThrow("Không thể nhận diện");
    });
  });

  describe("formatRange", () => {
    it("formats same-day range with shared date part", () => {
      const start = "2026-10-15T01:00:00.000Z"; // 08:00
      const end = "2026-10-15T10:00:00.000Z";   // 17:00
      expect(formatRange(start, end)).toBe("08:00 – 17:00 15/10/2026");
    });

    it("formats multi-day range with distinct start and end dates", () => {
      const start = "2026-10-15T01:00:00.000Z"; // 08:00 15/10/2026
      const end = "2026-10-18T10:00:00.000Z";   // 17:00 18/10/2026
      expect(formatRange(start, end)).toBe("08:00 15/10/2026 – 17:00 18/10/2026");
    });
  });

  describe("nowGmt7", () => {
    it("returns a valid TZDate with current time", () => {
      const now = nowGmt7();
      expect(now.getTime()).toBeGreaterThan(0);
      expect(formatDateTime(now)).toBeTruthy();
    });
  });

  describe("combineDateAndTimeGmt7", () => {
    it("combines Date object and HH:mm string in GMT+7", () => {
      const date = new Date(2026, 9, 15); // Oct 15, 2026
      const combined = combineDateAndTimeGmt7(date, "14:30");
      expect(formatDateTime(combined)).toBe("14:30 15/10/2026");
    });
  });

  describe("diffHours", () => {
    it("accurately calculates hour difference between dates and strings", () => {
      const start = "2026-10-15T01:00:00.000Z";
      const end = "2026-10-16T01:00:00.000Z";
      expect(diffHours(start, end)).toBe(24);
      expect(diffHours(start, "2026-10-15T03:30:00.000Z")).toBe(2.5);
    });
  });

  describe("generateTimeSlots", () => {
    it("generates 48 30-min slots from 00:00 to 23:30", () => {
      const slots = generateTimeSlots(30);
      expect(slots).toHaveLength(48);
      expect(slots[0]).toBe("00:00");
      expect(slots[1]).toBe("00:30");
      expect(slots[47]).toBe("23:30");
    });
  });

  describe("isBeforeTodayGmt7", () => {
    it("correctly identifies past vs today/future dates", () => {
      const past = new Date(2020, 0, 1);
      const future = new Date(2030, 0, 1);
      expect(isBeforeTodayGmt7(past)).toBe(true);
      expect(isBeforeTodayGmt7(future)).toBe(false);
    });
  });
});

