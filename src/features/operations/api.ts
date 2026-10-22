import { backendApiClient } from "@/api/backend-api-client";
import type { RentalContract } from "@/features/rentals/types";
import type { StaffDto, PagedResult } from "@/features/admin/api";

export type OperationalRental = RentalContract & {
  invoiceId?: number;
  returnedAt?: string | null;
  isOverdue?: boolean;
  hasPassingPreInspection?: boolean;
  hasPostInspection?: boolean;
};

export const canAssignRental = (status: string) => ["pre_inspection", "renting"].includes(status);
export const isClosedRental = (status: string) => ["cancelled", "completed"].includes(status);

export function rentalTransitionBlocker(rental: Pick<OperationalRental, "status" | "hasPassingPreInspection" | "hasPostInspection">, status: string): string | null {
  if (isClosedRental(rental.status)) return "Đơn thuê đã kết thúc, không thể thay đổi trạng thái.";
  if (status === "cancelled" && !["pending", "pre_inspection"].includes(rental.status)) {
    return "Chỉ có thể hủy đơn trước khi chuyển sang Đang thuê.";
  }
  if (status === "renting" && rental.hasPassingPreInspection !== true) {
    return "Cần hoàn tất phiếu kiểm tra trước thuê với kết quả đạt trước khi bàn giao xe.";
  }
  if (status === "completed" && rental.hasPostInspection !== true) {
    return "Cần hoàn tất phiếu kiểm tra sau thuê trước khi quyết toán đơn thuê.";
  }
  return null;
}
export interface InspectionRequest {
  staffId: number | null;
  isOk: boolean;
  odometerKm: number | null;
  fuelBatteryLevel: number | null;
  damageNotes: string | null;
  imageUrls: string | null;
}

export function getOperationalRental(id: number): Promise<OperationalRental> {
  // Luôn fail closed: không trả dữ liệu mẫu cho hồ sơ đơn thuê.
  return backendApiClient.get<OperationalRental>(`rentals/${id}`);
}

export async function getOperationalDrivers(): Promise<StaffDto[]> {
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

export interface OperationalRentalDetail {
  rental: Omit<RentalContract, "startTime" | "endTime" | "status"> & { scheduledStart: string; scheduledEnd: string; status: string | number; returnedAt?: string | null; cancelReason?: string | null; cancelledAt?: string | null };
  history?: { toStatus: string; reason: string | null; createdAt: string }[];
  orderId: number | null;
  customerName: string | null;
  customerEmail: string | null;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  licensePlate: string | null;
  driverName: string | null;
  invoice: { id: number; number: string; status: string; amount: number } | null;
  hasPassingPreInspection?: boolean;
  hasPostInspection?: boolean;
  settlement?: { returnedAt: string; overtimeMinutes: number; overtimeHours: number; overtimeAmount: number; overtimeVat: number; depositDeducted: number; shortfallInvoiceId: number | null } | null;
}

export const getOperationalRentalDetail = (id: number | string) => backendApiClient.get<OperationalRentalDetail>(`rentals/${id}/detail`);
export const confirmHandover = (id: number | string) => backendApiClient.post<unknown>(`handovers/${id}/confirm`);
export interface RentalUpdate { vehicleId: number; startTime: string; endTime: string; hasDriver: boolean }
export const updateRental = (id: number | string, body: RentalUpdate) => backendApiClient.put<unknown>(`rentals/${id}`, body);

export function assignRental(id: number, driverStaffId: number | null) {
  return backendApiClient.post<unknown>(`rentals/${id}/assignments`, { driverStaffId });
}

export const cancelOperationalRental = (id: number | string, reason: string, initiator: "customer" | null = null) =>
  backendApiClient.post<unknown>(`rentals/${id}/cancel`, { reason: reason.trim(), initiator, waiveFee: false });

export const getRentalCancellationPreview = (id: number | string) => backendApiClient.get<{
  allowed: boolean; feeAmount: number; refundAmount: number; reasons?: string[]; freeUntil: string | null;
}>(`rentals/${id}/cancellation-preview`);

export async function changeRentalStatus(id: number, status: string) {
  const action = ({ pre_inspection: "confirm", renting: "start", post_inspection: "return", completed: "complete" } as Record<string, string>)[status];
  if (action) {
    if (action === "return") await backendApiClient.post(`rentals/${id}/return`, {});
    else await backendApiClient.post(`rentals/${id}/${action}`);
    return getOperationalRental(id);
  }
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
  overdue: "Quá hạn", post_inspection: "Kiểm tra sau thuê", completed: "Hoàn tất", cancelled: "Đã hủy",
};
export const operationsInput = "admin-input mt-2 w-full";
export const operationsButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded bg-td-oxide px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-td-oxide-hover disabled:cursor-not-allowed disabled:opacity-50";
export const operationsPanel = "space-y-4 rounded border border-td-rule bg-td-white p-5 sm:p-6";
export function listOperationalRentals(params?: { status?: string; page?: number; pageSize?: number }): Promise<PagedResult<OperationalRental>> {
  return backendApiClient.get<PagedResult<OperationalRental>>("rentals", params);
}

/** Một số endpoint trả mảng trực tiếp, một số trả envelope { items } — chuẩn hoá lại. */
export function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const items = (data as { items?: unknown } | null | undefined)?.items;
  return Array.isArray(items) ? (items as T[]) : [];
}

export function operationalError(error: unknown) {
  if (error instanceof Error) {
    const messages: Record<string, string> = {
      "A successful pre-rental inspection is required to start.": "Cần hoàn tất phiếu kiểm tra trước thuê với kết quả đạt trước khi bàn giao xe.",
      "A post-rental inspection is required to complete.": "Cần hoàn tất phiếu kiểm tra sau thuê trước khi quyết toán đơn thuê.",
      "Post-rental inspection must be recorded before completing rental.": "Cần hoàn tất phiếu kiểm tra sau thuê trước khi quyết toán đơn thuê.",
      "An unexpected server error occurred.": "Máy chủ gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại.",
    };
    if (messages[error.message]) return messages[error.message];
  }
  return error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : error instanceof Error ? error.message : "Không thể lưu thông tin. Vui lòng thử lại.";
}
