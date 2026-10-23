import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RentalCountdown, { formatCountdown, remainingUntil } from "@/features/rentals/components/RentalCountdown";

const ISO = (value: string) => value;

describe("RentalCountdown", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("formats the remaining time as HH:MM:SS", () => {
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(1_000)).toBe("00:00:01");
    expect(formatCountdown(59 * 60_000 + 5_000)).toBe("00:59:05");
    expect(formatCountdown(3_600_000)).toBe("01:00:00");
    expect(formatCountdown(26 * 3_600_000 + 61_000)).toBe("26:01:01");
  });

  it("clamps the remaining time at zero for a deadline in the past", () => {
    const now = new Date("2026-10-10T09:00:00Z").getTime();
    expect(remainingUntil(ISO("2026-10-10T08:00:00Z"), now)).toBe(0);
    expect(remainingUntil(ISO("2026-10-10T09:30:00Z"), now)).toBe(30 * 60_000);
    expect(remainingUntil("không-phải-ngày-giờ", now)).toBe(0);
  });

  it("counts down every second and reports the deadline exactly once", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-10T07:00:00Z"));
    const onExpire = vi.fn();
    render(<RentalCountdown expireAt={ISO("2026-10-10T07:00:03Z")} onExpire={onExpire} />);

    expect(screen.getByText("00:00:03")).toBeVisible();
    expect(screen.getByText(/để đơn được duyệt và thanh toán/)).toBeVisible();

    await act(async () => { vi.advanceTimersByTime(1_000); });
    expect(screen.getByText("00:00:02")).toBeVisible();

    await act(async () => { vi.advanceTimersByTime(2_000); });
    expect(screen.getByText(/Đã quá thời hạn duyệt và thanh toán/)).toBeVisible();
    expect(onExpire).toHaveBeenCalledTimes(1);

    // Quá hạn thêm vài chu kỳ nữa cũng không gọi lại lần hai.
    await act(async () => { vi.advanceTimersByTime(5_000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("shows the expiry notice immediately when the deadline has already passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-10T07:30:00Z"));
    render(<RentalCountdown expireAt={ISO("2026-10-10T07:00:00Z")} />);
    expect(screen.getByText(/Đã quá thời hạn duyệt và thanh toán/)).toBeVisible();
  });
});
