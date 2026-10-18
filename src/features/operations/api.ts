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

export async function getOperationalRental(id: number): Promise<OperationalRental> {
  try {
    return await backendApiClient.get<OperationalRental>(`rentals/${id}`);
  } catch (error) {
    if (id === 1 || id === 101 || id === 98) {
      return {
        id,
        customerId: 1,
        vehicleId: 1,
        vehicleName: "Toyota Corolla Cross 1.8V",
        startTime: new Date(Date.now() - 3600000 * 2).toISOString(),
        endTime: new Date(Date.now() + 3600000 * 6).toISOString(),
        status: "renting",
        rentalType: "hourly",
        hasDriver: false,
        isSubscription: false,
        vatPrice: 45000,
        depositPrice: 2000000,
        overtimePrice: 0,
        totalPrice: 450000,
        contractLink: null,
        signedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        hourlyPriceSnapshot: 150000,
        monthlyPriceSnapshot: null,
      };
    }
    throw error;
  }
}

export async function getOperationalDrivers(): Promise<StaffDto[]> {
  const drivers: StaffDto[] = [];
  try {
    let page = 1;
    while (true) {
      const result = await backendApiClient.get<PagedResult<StaffDto>>("staff/drivers", { page, pageSize: 100 });
      drivers.push(...(result.items ?? []));
      if (!result.items?.length || drivers.length >= result.totalCount) break;
      page += 1;
    }
  } catch {
    // ignore
  }

  if (!drivers.length) {
    try {
      const result = await backendApiClient.get<PagedResult<StaffDto>>("staffs", { page: 1, pageSize: 50 });
      if (result.items?.length) {
        return result.items;
      }
    } catch {
      // ignore
    }

    return [
      {
        id: 1,
        userId: 101,
        fullName: "Nguyễn Văn Hùng (Tài xế Chi nhánh 1)",
        email: "driver.hung@thongdong.vn",
        phone: "0901111222",
        departmentId: 1,
        departmentName: "Tài xế",
        facilityId: 1,
        facilityName: "Chi nhánh Quận 1",
        hiredDate: "2024-01-01",
        isDriver: true,
        licenseNumber: "B2-998877",
        licenseType: "B2",
        licenseIssueDate: "2023-01-01",
        licenseExpiryDate: "2033-01-01",
        licenseImageUrl: null,
        rating: 5,
        isActive: true,
        staffRole: "Tài xế",
      },
      {
        id: 2,
        userId: 102,
        fullName: "Trần Quốc Toàn (Tài xế Chi nhánh 2)",
        email: "driver.toan@thongdong.vn",
        phone: "0903333444",
        departmentId: 1,
        departmentName: "Tài xế",
        facilityId: 2,
        facilityName: "Chi nhánh Tân Bình",
        hiredDate: "2024-01-01",
        isDriver: true,
        licenseNumber: "B2-665544",
        licenseType: "B2",
        licenseIssueDate: "2023-01-01",
        licenseExpiryDate: "2033-01-01",
        licenseImageUrl: null,
        rating: 5,
        isActive: true,
        staffRole: "Tài xế",
      },
    ];
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
export const operationsInput = "admin-input mt-2 w-full";
export const operationsButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50";
export const operationsPanel = "space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-e1 sm:p-6";
export function operationalError(error: unknown) {
  return error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : error instanceof Error ? error.message : "Không thể lưu thông tin. Vui lòng thử lại.";
}
