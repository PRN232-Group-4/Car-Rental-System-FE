import { backendApiClient } from "@/api/backend-api-client";
import type { DriverScheduleEntry } from "@/features/driver-portal/api";

export interface MaintenanceInput {
  vehicleId: number; facilityId: number | null; assignedStaffId: number | null;
  status: string | null; maintenanceType: string | null; scheduledDate: string | null;
  isSafe: boolean | null; description: string | null; cost: number | null;
}
export interface MaintenanceRecord extends MaintenanceInput { id: number; assignedStaffEmail?: string | null; facilityName?: string | null }
export interface ReportInput { type: string | null; description: string | null; imageUrls: string | null }
export interface IncidentReport extends ReportInput { id: number; rentalId: number; vehicleId: number; status: string | null; maintenanceId: number | null }
export interface ShiftInput { driverStaffId: number; startTime: string; endTime: string; cancelled: boolean }
export interface DriverShift extends Omit<ShiftInput, "cancelled"> { id: number; status: string | null }

export const getMaintenance = async (vehicleId?: number, status?: string) => {
  const result = await backendApiClient.get<MaintenanceRecord[] | { items?: MaintenanceRecord[] }>("maintenance", { vehicleId, status });
  return Array.isArray(result) ? result : (result.items ?? []);
};
export const saveMaintenance = (body: MaintenanceInput, id?: number) => id ? backendApiClient.put<unknown>(`maintenance/${id}`, body) : backendApiClient.post<unknown>("maintenance", body);
export const sendReport = (rentalId: number, body: ReportInput) => backendApiClient.post<unknown>(`rental/${rentalId}/reports`, body);
export const getReports = async (rentalId?: number) => {
  const result = await backendApiClient.get<IncidentReport[] | { items?: IncidentReport[] }>("reports", { rentalId });
  return Array.isArray(result) ? result : (result.items ?? []);
};
export const getDriverShifts = (from?: string, to?: string, driverStaffId?: number) => backendApiClient.get<DriverShift[]>("drivers/shifts", { from, to, driverStaffId });
export const saveDriverShift = (body: ShiftInput, id?: number) => id ? backendApiClient.put<unknown>(`drivers/shift/${id}`, body) : backendApiClient.post<unknown>("drivers/shifts", body);
export const getDispatchSchedule = async (from: string, to: string, driverStaffId?: number) => {
  const result = await backendApiClient.get<(DriverScheduleEntry & { driverName?: string | null })[] | { items?: (DriverScheduleEntry & { driverName?: string | null })[] }>("drivers/schedule", { from, to, driverStaffId });
  return Array.isArray(result) ? result : (result.items ?? []);
};
export async function uploadReportImage(file: File) {
  const body = new FormData(); body.append("file", file);
  const result = await backendApiClient.post<{ secureUrl: string | null }>("media/report", body);
  if (!result?.secureUrl || !/^https?:\/\//i.test(result.secureUrl)) throw new Error("Máy chủ chưa trả URL ảnh hợp lệ. Vui lòng chọn lại ảnh.");
  return result.secureUrl;
}
