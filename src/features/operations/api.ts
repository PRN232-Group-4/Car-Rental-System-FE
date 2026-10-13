import { backendApiClient } from "@/api/backend-api-client";
import type { RentalContract } from "@/features/rentals/types";
import type { StaffDto, PagedResult } from "@/features/admin/api";

export type OperationalRental = RentalContract;
export interface InspectionRequest {
  staffId: number | null;
  isOk: boolean;
  odometerKm: number | null;
  fuelBatteryLevel: number | null;
  damageNotes: string | null;
  imageUrls: string | null;
}

export function getOperationalRental(id: number) {
  return backendApiClient.get<OperationalRental>(`rentals/${id}`);
}

export async function getOperationalDrivers() {
  const drivers: StaffDto[] = [];
  let page = 1;
  while (true) {
    const result = await backendApiClient.get<PagedResult<StaffDto>>("staff/drivers", { page, pageSize: 100 });
    drivers.push(...(result.items ?? []));
    if (!result.items?.length || drivers.length >= result.totalCount) break;
    page += 1;
  }
  return drivers;
}

export function assignRental(id: number, driverStaffId: number | null) {
  return backendApiClient.post<unknown>(`rentals/${id}/assignments`, { driverStaffId });
}

export function changeRentalStatus(id: number, status: string) {
  return backendApiClient.post<OperationalRental>(`rentals/${id}/status/${encodeURIComponent(status)}`);
}

export function saveInspection(id: number, type: "pre" | "post", body: InspectionRequest) {
  return backendApiClient.post<unknown>(`rentals/${id}/inspections/${type}`, body);
}

export async function uploadInspectionImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  const result = await backendApiClient.post<{ secureUrl: string | null }>("media/inspection", body);
  if (!result?.secureUrl || !/^https?:\/\//i.test(result.secureUrl)) {
    throw new Error("Máy chủ chưa trả đường dẫn ảnh hợp lệ. Vui lòng tải lại ảnh.");
  }
  return result.secureUrl;
}

export const rentalStatuses: Record<string, string> = {
  pending: "Chờ xử lý", pre_inspection: "Kiểm tra trước thuê", renting: "Đang thuê",
  post_inspection: "Kiểm tra sau thuê", completed: "Hoàn tất", cancelled: "Đã hủy",
};
export const operationsInput = "admin-input mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm";
export const operationsButton = "rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50";
export const operationsPanel = "space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6";
export function operationalError(error: unknown) {
  return error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : error instanceof Error ? error.message : "Không thể lưu thông tin. Vui lòng thử lại.";
}
