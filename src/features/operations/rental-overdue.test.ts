import { describe, expect, it } from "vitest";
import { rentalDisplayStatus, rentalTimestamp } from "./rental-overdue";

describe("overdue presentation without changing lifecycle", () => {
  const now = Date.parse("2026-10-22T10:00:00Z");
  it.each(["hourly", "longterm"])("marks a %s rental overdue only after its deadline", () => {
    expect(rentalDisplayStatus({ status: "renting", endTime: "2026-10-22T09:59:59Z" }, now)).toBe("overdue");
    expect(rentalDisplayStatus({ status: "renting", endTime: "2026-10-22T10:00:00Z" }, now)).toBe("renting");
  });
  it.each(["pending", "pre_inspection", "post_inspection", "completed", "cancelled"])("never reclassifies %s as overdue", status => {
    expect(rentalDisplayStatus({ status, endTime: "2020-01-01", isOverdue: true }, now)).toBe(status);
  });
  it("ignores stale overdue flags after return and does not infer an unknown deadline", () => {
    expect(rentalDisplayStatus({ status: "renting", endTime: "2020-01-01", returnedAt: "2020-01-02", isOverdue: true }, now)).toBe("renting");
    expect(rentalDisplayStatus({ status: "renting", endTime: "bad" }, now)).toBe("renting");
  });
  it("treats legacy zone-less backend timestamps as UTC", () => {
    expect(rentalTimestamp("2026-10-22T10:00:00")).toBe(now);
    expect(rentalTimestamp("2026-10-22T17:00:00+07:00")).toBe(now);
    expect(rentalDisplayStatus({ status: "renting", endTime: "2026-10-22T10:00:00" }, now)).toBe("renting");
  });
});
