import { backendApiClient } from "@/api/backend-api-client";
import { ApiClientError } from "@/api/api-client";
import type { PagedResult, StaffDto } from "@/features/admin/api";

export interface InspectionAssignment {
  rentalId: number;
  vehicleId: number;
  technicianStaffId: number;
  technicianName: string | null;
  technicianEmail?: string | null;
  assignedAt: string;
  assignedBy: string;
}

export function getInspectionAssignment(rentalId: number) {
  return backendApiClient.get<InspectionAssignment | null>(`rentals/${rentalId}/inspection-assignment`);
}

export function inspectionAssignmentError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 404 && error.code !== "RENTAL_NOT_FOUND" && (!error.detail || error.detail === "Not Found")) {
      return "Backend đang kết nối chưa có API phân công kiểm tra. Cần cập nhật backend cùng phiên bản frontend rồi tải lại.";
    }
    if (error.status === 403) return "Tài khoản không có quyền xem phân công kiểm tra. Vui lòng kiểm tra vai trò được cấp.";
    if (error.status === 404) return "Không tìm thấy đơn thuê để xem phân công. Vui lòng tải lại hồ sơ đơn.";
  }
  return error instanceof TypeError
    ? "Không kết nối được máy chủ để tải phân công. Vui lòng kiểm tra mạng rồi thử lại."
    : "Không thể tải phân công kiểm tra. Vui lòng thử lại.";
}

export function assignInspectionTechnician(rentalId: number, technicianStaffId: number) {
  return backendApiClient.put<InspectionAssignment>(`rentals/${rentalId}/inspection-assignment`, { technicianStaffId });
}

export function isInspectionTechnician(staff: StaffDto): boolean {
  return staff.isActive && (staff.roles
    ? staff.roles.some((role) => role.toLowerCase() === "maintenance")
    : staff.staffRole === "Maintenance");
}

export async function getInspectionTechnicians(): Promise<StaffDto[]> {
  const technicians: StaffDto[] = [];
  let loaded = 0;
  for (let page = 1; ; page += 1) {
    const result = await backendApiClient.get<PagedResult<StaffDto>>("staff", { page, pageSize: 100 });
    const items = result.items ?? [];
    technicians.push(...items.filter(isInspectionTechnician));
    loaded += items.length;
    if (!items.length || loaded >= result.totalCount) return technicians;
  }
}
