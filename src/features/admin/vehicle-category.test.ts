import { expect, it } from "vitest";
import { getVehicleKind } from "./vehicle-category";

it.each([
  ["car", "gasoline", true, false, false],
  ["car", "electric", true, false, true],
  ["motorbike", "gasoline", false, true, false],
  ["motorbike", "electric", false, true, true],
])("maps %s + %s independently of name", (type, fuelType, isCar, isMotorbike, isElectric) => {
  expect(getVehicleKind({ id: 1, name: "Misleading electric car motorbike", type, fuelType })).toEqual({ isValid: true, isCar, isMotorbike, isElectric });
});
it("rejects missing metadata instead of guessing from the name", () => {
  expect(getVehicleKind({ id: 1, name: "Electric car", type: null, fuelType: "electric" }).isValid).toBe(false);
  expect(getVehicleKind(undefined).isCar).toBe(false);
});
it("normalizes metadata and rejects unsupported fuel", () => {
  expect(getVehicleKind({ id: 1, name: null, type: " Motorbike ", fuelType: " ELECTRIC " }).isElectric).toBe(true);
  expect(getVehicleKind({ id: 1, name: null, type: "car", fuelType: "diesel" }).isValid).toBe(false);
});
