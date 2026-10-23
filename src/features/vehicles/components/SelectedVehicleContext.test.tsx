import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VehicleCard } from "./VehicleCard";
import { StickyBookingCard } from "./StickyBookingCard";
import type { Vehicle } from "../types";

const mocks = vi.hoisted(() => ({ push: vi.fn(), available: vi.fn().mockResolvedValue({ available: true }), range: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("../api", () => ({ checkVehicleAvailability: mocks.available }));
vi.mock("./PriceBreakdown", () => ({ PriceBreakdown: () => null }));
vi.mock("@/components/ui/DateTimeRangePicker", () => ({ DateTimeRangePicker: (props: unknown) => { mocks.range(props); return null; } }));
const vehicle: Vehicle = { id: 8, facilityId: 2, name: "Xe đã chọn", category: "car", categoryLabel: "Ô tô", year: 2026, transmission: "Tự động", hourlyPrice: 125000, monthlyPrice: 3000000, facilityName: "Cơ sở hai", imageUrl: "/vehicle.jpg", badges: [], isAvailable: true, supportsSubscription: true };
const from = "2027-11-01T03:30:00.000Z";
const to = "2027-12-01T05:00:00.000Z";
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe("selected vehicle navigation", () => {
  it("transfers selected vehicle and booking context from the card to details", () => {
    render(<VehicleCard vehicle={vehicle} bookingContext={{ from, to, mode: "driver", rentalType: "longterm" }} />);
    const href = new URL(screen.getByRole("link", { name: "Chi tiết" }).getAttribute("href")!, "https://test.local");
    expect(href.pathname).toBe("/vehicles/detail");
    expect(Object.fromEntries(href.searchParams)).toEqual({ id: "8", facilityId: "2", from, to, mode: "driver", rentalType: "longterm" });
  });
  it("passes the canonical vehicle branch, exact dates and rental type to booking without reselecting", async () => {
    const { rerender } = render(<StickyBookingCard vehicle={vehicle} initialFrom={from} initialTo={to} initialMode="driver" initialRentalType="longterm" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Tiến hành đặt xe" })).toBeEnabled());
    expect(mocks.range).toHaveBeenLastCalledWith(expect.objectContaining({ value: expect.objectContaining({ from, to, startTime: "10:30", endTime: "12:00" }) }));
    fireEvent.click(screen.getByRole("button", { name: "Tiến hành đặt xe" }));
    const href = new URL(mocks.push.mock.calls[0][0], "https://test.local");
    expect(Object.fromEntries(href.searchParams)).toEqual({ vehicleId: "8", facilityId: "2", from, to, mode: "driver", rentalType: "longterm" });
    const calendarFrom = "2027-11-02T04:00:00.000Z";
    rerender(<StickyBookingCard vehicle={vehicle} initialFrom={calendarFrom} initialTo={to} initialMode="driver" initialRentalType="longterm" />);
    await waitFor(() => expect(mocks.available).toHaveBeenLastCalledWith(8, calendarFrom, to));
  });
});
