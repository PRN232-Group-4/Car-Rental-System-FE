import { describe, expect, it } from "vitest";
import { formatAdminDate, formatAdminDateTime, formatLocalDateTime } from "./date-time";

describe("Admin date display", () => {
  it("formats timestamps in Vietnam time with padded fields and no seconds", () => {
    expect(formatAdminDateTime("2026-01-02T03:04:59Z")).toBe("02/01/2026 10:04");
    expect(formatAdminDateTime("2026-01-02T03:04:00+07:00")).toBe("02/01/2026 03:04");
  });

  it("handles a timezone rollover and midnight as 00:00", () => {
    expect(formatAdminDateTime(new Date("2026-12-31T17:00:00Z"))).toBe("01/01/2027 00:00");
  });

  it("keeps date-only values independent of time zones", () => {
    expect(formatAdminDate("2026-10-15")).toBe("15/10/2026");
    expect(formatAdminDate("2026-10-15T23:00:00Z")).toBe("15/10/2026");
    expect(formatAdminDate("2024-02-29")).toBe("29/02/2024");
    expect(formatAdminDate("2026-02-29")).toBe("—");
  });

  it("previews datetime-local values without shifting the entered time", () => {
    expect(formatLocalDateTime("2026-10-15T09:05")).toBe("15/10/2026 09:05");
    expect(formatLocalDateTime("2026-10-15T24:00")).toBe("—");
  });

  it("uses a safe empty label for missing and invalid dates", () => {
    for (const value of [undefined, null, "", "invalid"]) {
      expect(formatAdminDateTime(value)).toBe("—");
      expect(formatAdminDate(value)).toBe("—");
      expect(formatLocalDateTime(value)).toBe("—");
    }
  });
});
