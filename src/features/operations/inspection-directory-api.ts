import { backendApiClient } from "@/api/backend-api-client";
import type { PagedResult } from "@/features/admin/api";

export interface InspectionDirectoryRecord {
  id: number;
  rentalId: number;
  vehicleId: number | null;
  vehicleName: string | null;
  licensePlate: string | null;
  inspectionType: "pre_rental" | "post_rental";
  isOk: boolean | null;
  inspectorEmail: string | null;
  inspectedAt: string | null;
  odometerKm: number | null;
  fuelBatteryLevel: number | null;
  damageNotes: string | null;
  imageUrls: string | null;
  confirmationSource?: "technician" | "driver_default" | "admin_confirmation";
  confirmedBy?: string | null;
}

export function getInspectionDirectory(params: {
  inspectionType?: string;
  rentalId?: number;
  page: number;
  pageSize: number;
}, signal?: AbortSignal) {
  return backendApiClient.get<PagedResult<InspectionDirectoryRecord>>("inspections", params, { signal });
}

export function inspectionImages(raw: string | null): string[] {
  if (!raw) return [];
  let values: unknown = raw;
  try { values = JSON.parse(raw); } catch { /* Older records may store a single image URL. */ }
  const candidates = Array.isArray(values) ? values : [values];
  return [...new Set(candidates.filter((value): value is string => typeof value === "string" && /^https?:\/\//i.test(value)))];
}
