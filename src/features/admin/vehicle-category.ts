import type { VehicleTypeDto } from "./api";
export function getVehicleKind(vehicleType: VehicleTypeDto | undefined) {
  const type = vehicleType?.type?.trim().toLowerCase();
  const fuel = vehicleType?.fuelType?.trim().toLowerCase();
  const isValid = (type === "car" || type === "motorbike") && (fuel === "gasoline" || fuel === "electric");
  return { isValid, isCar: isValid && type === "car", isMotorbike: isValid && type === "motorbike", isElectric: isValid && fuel === "electric" };
}
