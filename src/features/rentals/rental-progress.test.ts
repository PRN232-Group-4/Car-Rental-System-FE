import { describe, expect, it } from "vitest";
import { getRentalProgress, rentalStatusLabel } from "./rental-progress";

describe("rental progress", () => {
  it.each([
    ["pending", ["current", "upcoming", "upcoming", "upcoming", "upcoming"]],
    ["pre_inspection", ["complete", "current", "upcoming", "upcoming", "upcoming"]],
    ["renting", ["complete", "complete", "current", "upcoming", "upcoming"]],
    ["post_inspection", ["complete", "complete", "complete", "current", "upcoming"]],
    ["completed", ["complete", "complete", "complete", "complete", "current"]],
  ])("maps %s to the actual lifecycle milestone", (status, states) => {
    const progress = getRentalProgress(status);
    expect(progress.known).toBe(true);
    expect(progress.steps.map((step) => step.state)).toEqual(states);
  });

  it("does not treat vehicle preparation as proof of payment", () => {
    const current = getRentalProgress("pre_inspection").steps.find((step) => step.state === "current");
    expect(current?.label).toBe("Chuẩn bị xe");
  });

  it("shows cancellation without inventing how far the request progressed", () => {
    const progress = getRentalProgress("cancelled");
    expect(progress.cancelled).toBe(true);
    expect(progress.steps.every((step) => step.state === "stopped")).toBe(true);
  });

  it("shows an expired request as stopped but not cancelled", () => {
    const progress = getRentalProgress("expired");
    expect(progress.expired).toBe(true);
    expect(progress.cancelled).toBe(false);
    expect(progress.known).toBe(true);
    expect(progress.steps.every((step) => step.state === "stopped")).toBe(true);
  });

  it.each([
    ["expired", "Hết hạn"],
    ["cancelled", "Đã hủy"],
    ["cancelled ", "Đã hủy"],
    ["renting", "Đang thuê"],
    [null, "Cập nhật trạng thái"],
    ["future_status", "Cập nhật trạng thái"],
  ])("labels %s as %s", (status, label) => {
    expect(rentalStatusLabel(status)).toBe(label);
  });

  it.each([null, undefined, "", "inactive", "confirmed", "ongoing", "future_status"])("does not invent a current milestone for %s", (status) => {
    const progress = getRentalProgress(status);
    expect(progress.known).toBe(false);
    expect(progress.steps.every((step) => step.state === "unknown")).toBe(true);
  });

  it("normalizes whitespace and case only", () => {
    expect(getRentalProgress(" RENTING ").steps[2].state).toBe("current");
  });
});
