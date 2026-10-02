import { defaultApiClient } from "@/api/default-api-client";
import { MOCK_INSPECTION_RECORD } from "@/api/mock/mock-grading";
import { InspectionRecord } from "./types";

export async function getLatestInspectionRecord(): Promise<InspectionRecord> {
  try {
    return await defaultApiClient.get<InspectionRecord>("inspections/latest");
  } catch (error) {
    console.warn("[Inspections API] Fallback to static mock:", error);
    return MOCK_INSPECTION_RECORD;
  }
}

export async function getInspectionByRentalId(rentalId: string): Promise<InspectionRecord> {
  try {
    return await defaultApiClient.get<InspectionRecord>(`rentals/${rentalId}/inspections`);
  } catch {
    return MOCK_INSPECTION_RECORD;
  }
}

export function getInitialInspectionRecord(): InspectionRecord {
  return MOCK_INSPECTION_RECORD;
}
