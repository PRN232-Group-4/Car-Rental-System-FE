import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import VehicleMaintenanceTechnicians from "./VehicleMaintenanceTechnicians";

it("shows deduplicated email responsibility for a vehicle under maintenance", () => {
  render(<VehicleMaintenanceTechnicians vehicle={{ status: "maintenance", maintenanceTechnicianEmails: ["tech@example.com", " tech@example.com ", "other@example.com"] }} />);
  expect(screen.getByText("Kỹ thuật viên phụ trách")).toBeVisible();
  expect(screen.getAllByText("tech@example.com")).toHaveLength(1);
  expect(screen.getByText("other@example.com")).toBeVisible();
});

it.each([undefined, [], [""]])("truthfully reports missing current assignment: %s", (maintenanceTechnicianEmails) => {
  render(<VehicleMaintenanceTechnicians vehicle={{ status: "maintenance", maintenanceTechnicianEmails }} />);
  expect(screen.getByText("Chưa phân công kỹ thuật viên")).toBeVisible();
});

it("does not show stale maintenance responsibility for an available vehicle", () => {
  const { container } = render(<VehicleMaintenanceTechnicians vehicle={{ status: "available", maintenanceTechnicianEmails: ["historical@example.com"] }} />);
  expect(container).toBeEmptyDOMElement();
});
