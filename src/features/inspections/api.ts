import { defaultApiClient } from "@/api/default-api-client";
import { InspectionRecord } from "./types";

export async function getLatestInspectionRecord(): Promise<InspectionRecord> {
  return defaultApiClient.get<InspectionRecord>("inspections/latest");
}

export async function getInspectionByRentalId(rentalId: string): Promise<InspectionRecord> {
  return defaultApiClient.get<InspectionRecord>(`rentals/${rentalId}/inspections`);
}

export function getInitialInspectionRecord(): InspectionRecord | null {
  return null;
}
