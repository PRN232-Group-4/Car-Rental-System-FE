import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Vehicle } from "../types";
import { VehicleLicenseRequirement } from "./VehicleLicenseRequirement";
import { VehicleCard } from "./VehicleCard";
import { VehicleDetailView } from "./VehicleDetailView";
import BookingVehicleCards from "@/features/rentals/components/BookingVehicleCards";
import MultiFleetCatalog from "@/features/landing/components/MultiFleetCatalog";

const mocks = vi.hoisted(() => ({ fleet: vi.fn() }));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("./VehicleGallery", () => ({ VehicleGallery: () => null }));
vi.mock("./VehicleSpecs", () => ({ VehicleSpecs: () => null }));
vi.mock("./AvailabilityCalendar", () => ({ AvailabilityCalendar: () => null }));
vi.mock("./RentalPolicyPanel", () => ({ RentalPolicyPanel: () => null }));
vi.mock("./StickyBookingCard", () => ({ StickyBookingCard: () => null }));
vi.mock("@/features/landing/use-fleet-vehicles", () => ({ useFleetVehicles: mocks.fleet }));
vi.mock("@/features/rentals/components/BookingModal", () => ({ default: () => null }));
vi.mock("@/features/rentals", () => ({ BookingModal: () => null }));

const vehicle: Vehicle = {
  id: 8, facilityId: 2, name: "Xe số 8", category: "car", categoryLabel: "Ô tô",
  year: 2026, transmission: "Tự động", hourlyPrice: 125000, monthlyPrice: 3000000,
  facilityName: "Cơ sở hai", imageUrl: "/vehicle.jpg", badges: [], isAvailable: true,
  supportsSubscription: true, allowedLicenseTypes: ["B", "B2"],
};

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("vehicle license requirement", () => {
  it("shows the configured alternatives, without implying that all licenses are needed", () => {
    render(<VehicleLicenseRequirement allowedLicenseTypes={["B", "B2", "C1"]} detailed />);
    expect(screen.getByTestId("vehicle-license-requirement")).toHaveTextContent("Tự lái: GPLX B hoặc B2 hoặc C1");
    expect(screen.getByText("Chỉ cần một trong các hạng bằng lái trên khi thuê tự lái.")).toBeVisible();
  });

  it("normalizes whitespace, casing and duplicate classes without adding an inferred class", () => {
    render(<VehicleLicenseRequirement allowedLicenseTypes={[" a1 ", "A1", " "]} detailed />);
    expect(screen.getByTestId("vehicle-license-requirement")).toHaveTextContent(/^Tự lái: GPLX A1$/);
    expect(screen.queryByText(/A2|một trong/)).not.toBeInTheDocument();
  });

  it.each([undefined, [], [" "]])("shows an explicit fallback for missing configuration (%j)", (allowedLicenseTypes) => {
    render(<VehicleLicenseRequirement allowedLicenseTypes={allowedLicenseTypes} detailed />);
    expect(screen.getByTestId("vehicle-license-requirement")).toHaveTextContent(/^Tự lái: đang cập nhật yêu cầu GPLX$/);
    expect(screen.queryByText(/mọi hạng|không cần|một trong/i)).not.toBeInTheDocument();
  });
});

describe("vehicle license requirement placement", () => {
  it("shows the actual requirement on the search card beside the vehicle information", () => {
    render(<VehicleCard vehicle={vehicle} />);
    const card = screen.getByTestId("vehicle-card");
    expect(within(card).getByTestId("vehicle-license-requirement")).toHaveTextContent("Tự lái: GPLX B hoặc B2");
    expect(within(card).getByRole("link", { name: "Chi tiết" })).toHaveAttribute("href", expect.stringContaining("id=8"));
  });

  it("shows the selected vehicle requirement on detail and each similar car's own requirement", () => {
    render(<VehicleDetailView vehicle={vehicle} similarVehicles={[{ ...vehicle, id: 9, name: "Xe số 9", allowedLicenseTypes: ["A1"] }]} />);
    expect(screen.getByRole("heading", { level: 1, name: vehicle.name })).toBeVisible();
    const requirements = screen.getAllByTestId("vehicle-license-requirement");
    expect(requirements[0]).toHaveTextContent("Tự lái: GPLX B hoặc B2");
    expect(requirements[0]).toHaveTextContent("Chỉ cần một trong các hạng bằng lái trên khi thuê tự lái.");
    expect(requirements[1]).toHaveTextContent(/^Tự lái: GPLX A1$/);
  });

  it("includes license requirements in the booking radio's accessible description", () => {
    const onChange = vi.fn();
    render(<BookingVehicleCards vehicles={[vehicle]} value="" onChange={onChange} rentalType="hourly" isPending={false} isFetching={false} onRetry={vi.fn()} />);
    const radio = screen.getByRole("radio", { name: vehicle.name });
    expect(radio).toHaveAccessibleDescription(expect.stringContaining("Tự lái: GPLX B hoặc B2"));
    fireEvent.click(radio);
    expect(onChange).toHaveBeenCalledWith("8");
  });

  it("uses each real fleet vehicle's configured licenses on landing cards", () => {
    mocks.fleet.mockReturnValue({ data: [vehicle, { ...vehicle, id: 9, name: "Xe số 9", allowedLicenseTypes: ["A2"] }] });
    render(<MultiFleetCatalog />);
    const requirements = screen.getAllByTestId("vehicle-license-requirement");
    expect(requirements[0]).toHaveTextContent(/^Tự lái: GPLX B hoặc B2$/);
    expect(requirements[1]).toHaveTextContent(/^Tự lái: GPLX A2$/);
  });
});
