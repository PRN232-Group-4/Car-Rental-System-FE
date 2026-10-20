import { backendApiClient } from "@/api/backend-api-client";
import type { RentalContract } from "@/features/rentals/types";
import type { StaffDto, PagedResult } from "@/features/admin/api";

export type OperationalRental = RentalContract & { invoiceId?: number; customerName?: string | null; customerEmail?: string | null };
export interface InspectionRequest {
  staffId: number | null;
  isOk: boolean;
  odometerKm: number | null;
  fuelBatteryLevel: number | null;
  damageNotes: string | null;
  imageUrls: string | null;
}

export interface OperationalRentalDetail {
  rental: Omit<RentalContract, "startTime" | "endTime" | "status"> & { scheduledStart: string; scheduledEnd: string; status: string | number };
  orderId: number | null;
  customerName: string | null;
  customerEmail: string | null;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  licensePlate: string | null;
  driverName: string | null;
  invoice: { id: number; number: string; status: string; amount: number } | null;
}
export function flattenOperationalRental(detail: OperationalRentalDetail): OperationalRental {
  const status = typeof detail.rental.status === "number" ? ["pending", "pre_inspection", "renting", "post_inspection", "completed", "cancelled"][detail.rental.status] : detail.rental.status;
  return { ...detail.rental, status: status ?? "unknown", orderId: detail.orderId, startTime: detail.rental.scheduledStart, endTime: detail.rental.scheduledEnd, invoiceId: detail.invoice?.id, customerName: detail.customerName, customerEmail: detail.customerEmail, contractLink: detail.rental.contractLink ?? null, signedAt: detail.rental.signedAt ?? null };
}
export async function getOperationalRental(id: number): Promise<OperationalRental> {
  return flattenOperationalRental(await backendApiClient.get<OperationalRentalDetail>(`rentals/${id}/detail`));
}
export async function getOperationalDrivers(): Promise<StaffDto[]> {
  const drivers: StaffDto[] = [];
  for (let page = 1; ; page++) {
    const result = await backendApiClient.get<PagedResult<StaffDto>>("staff/drivers", { page, pageSize: 100 });
    drivers.push(...(result.items ?? []));
    if (!result.items?.length || drivers.length >= result.totalCount) return drivers;
  }
}
export interface AssignableDriver { staffId: number; fullName: string | null; eligible: boolean; reasons: string[] | null; rating: number | null }
export const getAssignableDrivers = (id: number | string) => backendApiClient.get<AssignableDriver[]>(`rentals/${id}/assignable-drivers`, { eligibleOnly: true });
export const confirmRental = (id: number | string) => backendApiClient.post<unknown>(`rentals/${id}/confirm`);
export const confirmHandover = (id: number | string) => backendApiClient.post<unknown>(`handovers/${id}/confirm`);
export interface RentalUpdate { vehicleId: number; startTime: string; endTime: string; hasDriver: boolean }
export const updateRental = (id: number | string, body: RentalUpdate) => backendApiClient.put<unknown>(`rentals/${id}`, body);

export function assignRental(id: number, driverStaffId: number | null) {
  return backendApiClient.post<unknown>(`rentals/${id}/assignments/driver`, { driverStaffId });
}

export function changeRentalStatus(id: number, status: string) {
  if (status === "pre_inspection") return confirmRental(id);
  if (status === "renting") return confirmHandover(id);
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
export const operationsInput = "admin-input mt-2 w-full";
export const operationsButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50";
export const operationsPanel = "space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-e1 sm:p-6";
export function operationalError(error: unknown) {
  return error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : error instanceof Error ? error.message : "Không thể lưu thông tin. Vui lòng thử lại.";
}
