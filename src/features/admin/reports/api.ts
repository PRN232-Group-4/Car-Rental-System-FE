import { apiClient } from "@/api";
import { isSlaBreached } from "./report-status";
import type {
  ReportListItem,
  ReportDetail,
  ReportFilterParams,
  ReportStatus,
  CreateMaintenancePayload,
} from "./types";

// ----------------- MOCK DATASET (Xác định & đa dạng) ----------------- //

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;

export const MOCK_REPORTS: ReportDetail[] = [
  {
    id: 101,
    type: "vehicle_issue",
    status: "in_progress",
    descriptionPreview: "Xe báo lỗi cảm biến áp suất lốp bánh trước bên phải khi đang di chuyển trên cao tốc.",
    description: "Xe báo lỗi cảm biến áp suất lốp bánh trước bên phải khi đang di chuyển trên cao tốc. Xe có hiện tượng hơi nhao lái nhẹ. Đã dừng xe tại trạm dừng chân an toàn để nhân viên kỹ thuật hỗ trợ.",
    createdAt: new Date(NOW - 6 * HOUR).toISOString(),
    customer: {
      id: 1,
      fullName: "Nguyễn Văn An",
      phone: "0901234567",
      email: "an.nguyen@example.com",
    },
    rentalId: 201,
    rental: {
      id: 201,
      vehicleName: "VinFast VF 8 Plus",
      licensePlate: "51K-899.21",
      start: new Date(NOW - 12 * HOUR).toISOString(),
      end: new Date(NOW + 24 * HOUR).toISOString(),
      status: "renting",
      driverName: "Tự lái",
    },
    handledBy: "Trần Kỹ Thuật (Staff)",
    imageUrls: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800"],
    notes: [
      {
        id: 1,
        at: new Date(NOW - 5 * HOUR).toISOString(),
        by: "Trần Kỹ Thuật",
        kind: "internal",
        text: "Đã liên hệ trạm dịch vụ gần nhất cách khách 8km để điều phối cứu hộ lốp.",
      },
    ],
    history: [
      {
        at: new Date(NOW - 6 * HOUR).toISOString(),
        by: "Hệ thống",
        from: undefined,
        to: "new",
        reason: "Khách gửi báo cáo từ ứng dụng di động",
      },
      {
        at: new Date(NOW - 5 * HOUR).toISOString(),
        by: "Trần Kỹ Thuật",
        from: "new",
        to: "in_progress",
        reason: "Tiếp nhận và gọi điện xác nhận vị trí khách hàng",
      },
    ],
  },
  {
    id: 102,
    type: "vehicle_issue",
    status: "new",
    descriptionPreview: "Hệ thống điều hòa không mát, quạt gió phát ra tiếng kêu rít khó chịu.",
    description: "Hệ thống điều hòa không mát, chỉ ra gió nóng. Đồng thời khoang máy có tiếng rít lớn khi bật AC mức tối đa. Yêu cầu kiểm tra hoặc hỗ trợ đổi phương tiện.",
    createdAt: new Date(NOW - 32 * HOUR).toISOString(), // > 24h -> Quá hạn SLA
    customer: {
      id: 2,
      fullName: "Lê Hoàng Yến",
      phone: "0912345678",
      email: "yen.le@example.com",
    },
    rentalId: 202,
    rental: {
      id: 202,
      vehicleName: "Hyundai Santa Fe 2.5",
      licensePlate: "51H-678.90",
      start: new Date(NOW - 48 * HOUR).toISOString(),
      end: new Date(NOW - 10 * HOUR).toISOString(),
      status: "completed",
    },
    history: [
      {
        at: new Date(NOW - 32 * HOUR).toISOString(),
        by: "Hệ thống",
        to: "new",
        reason: "Khách gửi phản hồi sau chuyến đi",
      },
    ],
  },
  {
    id: 103,
    type: "accident",
    status: "resolved",
    descriptionPreview: "Va quẹt nhẹ gương chiếu hậu bên phụ khi lùi xe tại bãi đỗ xe trung tâm thương mại.",
    description: "Va quẹt nhẹ gương chiếu hậu bên phụ khi lùi xe tại bãi đỗ xe trung tâm thương mại. Vỏ ốp gương bị trầy xước nhẹ, mặt gương không vỡ, đèn báo rẽ trên gương vẫn hoạt động bình thường.",
    createdAt: new Date(NOW - 50 * HOUR).toISOString(),
    resolvedAt: new Date(NOW - 20 * HOUR).toISOString(),
    customer: {
      id: 3,
      fullName: "Phạm Quốc Bảo",
      phone: "0987654321",
      email: "bao.pham@example.com",
    },
    rentalId: 203,
    maintenanceId: 12,
    maintenance: {
      id: 12,
      type: "Sửa chữa thân vỏ",
      status: "completed",
      isSafe: true,
      cost: 850_000,
    },
    rental: {
      id: 203,
      vehicleName: "Mazda CX-5 Premium",
      licensePlate: "50E-123.45",
      start: new Date(NOW - 60 * HOUR).toISOString(),
      end: new Date(NOW - 24 * HOUR).toISOString(),
      status: "completed",
    },
    handledBy: "Lê Điều Phối (Manager)",
    history: [
      {
        at: new Date(NOW - 50 * HOUR).toISOString(),
        to: "new",
      },
      {
        at: new Date(NOW - 45 * HOUR).toISOString(),
        to: "in_progress",
        by: "Lê Điều Phối",
      },
      {
        at: new Date(NOW - 20 * HOUR).toISOString(),
        to: "resolved",
        by: "Lê Điều Phối",
        reason: "Đã làm thủ tục bảo hiểm và thay ốp gương mới tại xưởng",
      },
    ],
  },
  {
    id: 104,
    type: "staff_attitude",
    status: "new",
    descriptionPreview: "Góp ý về thái độ phục vụ của nhân viên tại quầy giao nhận xe sân bay.",
    description: "Góp ý về thái độ phục vụ của nhân viên tại quầy giao nhận xe sân bay. Nhân viên hỗ trợ thủ tục chậm trễ và không hướng dẫn kỹ về cách sạc pin ô tô điện.",
    createdAt: new Date(NOW - 4 * HOUR).toISOString(),
    customer: {
      id: 4,
      fullName: "Đỗ Minh Tuấn",
      phone: "0933334444",
      email: "tuan.do@example.com",
    },
    history: [
      {
        at: new Date(NOW - 4 * HOUR).toISOString(),
        to: "new",
        reason: "Khách phản ánh chất lượng dịch vụ chung",
      },
    ],
  },
  {
    id: 105,
    type: "other",
    status: "in_progress",
    descriptionPreview: '<script>alert("XSS_TEST")</script> Kiểm tra bảo mật chuỗi độc hại',
    description: '<script>alert("XSS_PAYLOAD")</script><b onmouseover="alert(1)">Nội dung chứa thẻ HTML</b>. Yêu cầu hiển thị an toàn tuyệt đối dưới dạng chuỗi thuần.',
    createdAt: new Date(NOW - 2 * HOUR).toISOString(),
    customer: {
      id: 5,
      fullName: "Trần Bảo Mật",
      phone: "0999888777",
      email: "security@example.com",
    },
  },
];

// In-memory reports store for mock operations
let reportsStore = [...MOCK_REPORTS];

export async function fetchReports(params: ReportFilterParams = {}): Promise<{
  items: ReportListItem[];
  totalCount: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
}> {
  try {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    const res = await apiClient.get<ReportListItem[]>(`/api/reports?${query.toString()}`);
    if (Array.isArray(res)) {
      return {
        items: res,
        totalCount: res.length,
        newCount: res.filter((r) => r.status === "new").length,
        inProgressCount: res.filter((r) => r.status === "in_progress").length,
        resolvedCount: res.filter((r) => r.status === "resolved").length,
      };
    }
  } catch {
    // fallback to mock
  }

  // Lọc phía client trên mock data
  let result = [...reportsStore];

  if (params.status) {
    result = result.filter((r) => r.status.toLowerCase() === params.status?.toLowerCase());
  }
  if (params.type) {
    result = result.filter((r) => r.type.toLowerCase() === params.type?.toLowerCase());
  }
  if (params.hasRental !== undefined) {
    result = result.filter((r) => (params.hasRental ? Boolean(r.rentalId) : !r.rentalId));
  }
  if (params.hasMaintenance !== undefined) {
    result = result.filter((r) => (params.hasMaintenance ? Boolean(r.maintenanceId) : !r.maintenanceId));
  }
  if (params.isOverdueSla) {
    result = result.filter((r) => isSlaBreached(r.createdAt, r.status));
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.id.toString().includes(q) ||
        r.customer.fullName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.rental?.licensePlate?.toLowerCase().includes(q)
    );
  }

  return {
    items: result,
    totalCount: result.length,
    newCount: reportsStore.filter((r) => r.status === "new").length,
    inProgressCount: reportsStore.filter((r) => r.status === "in_progress").length,
    resolvedCount: reportsStore.filter((r) => r.status === "resolved").length,
  };
}

export async function fetchReportDetail(id: number): Promise<ReportDetail> {
  try {
    const res = await apiClient.get<ReportDetail>(`/api/reports/${id}`);
    if (res && res.id) return res;
  } catch {
    // fallback
  }

  const found = reportsStore.find((r) => r.id === id);
  if (!found) {
    throw new Error(`Không tìm thấy báo cáo #${id}`);
  }
  return found;
}

export async function resolveReport(id: number): Promise<void> {
  try {
    await apiClient.post(`/api/reports/${id}/resolve`, {});
  } catch {
    // Update local mock
  }

  reportsStore = reportsStore.map((r) =>
    r.id === id
      ? {
          ...r,
          status: "resolved",
          resolvedAt: new Date().toISOString(),
          history: [
            ...(r.history || []),
            {
              at: new Date().toISOString(),
              from: r.status,
              to: "resolved",
              reason: "Đã xử lý và đóng báo cáo sự cố",
            },
          ],
        }
      : r
  );
}

export async function updateReportStatus(
  id: number,
  newStatus: ReportStatus,
  reason?: string
): Promise<ReportDetail> {
  if (newStatus === "resolved") {
    await resolveReport(id);
    return fetchReportDetail(id);
  }

  if (newStatus === "rejected" && (!reason || reason.trim().length === 0)) {
    throw new Error("Lý do từ chối báo cáo là bắt buộc.");
  }

  try {
    await apiClient.patch(`/api/reports/${id}/status`, { status: newStatus, reason });
  } catch {
    // Update local mock
  }

  reportsStore = reportsStore.map((r) =>
    r.id === id
      ? {
          ...r,
          status: newStatus,
          history: [
            ...(r.history || []),
            {
              at: new Date().toISOString(),
              from: r.status,
              to: newStatus,
              reason: reason || `Cập nhật trạng thái sang ${newStatus}`,
            },
          ],
        }
      : r
  );

  return fetchReportDetail(id);
}

export async function createMaintenanceFromReport(payload: CreateMaintenancePayload): Promise<void> {
  try {
    await apiClient.post(`/api/reports/${payload.reportId}/maintenance`, {
      assignedStaffId: payload.assignedStaffId,
      facilityId: payload.facilityId,
      scheduledDate: payload.scheduledDate,
    });
  } catch {
    // Update local mock
  }

  reportsStore = reportsStore.map((r) =>
    r.id === payload.reportId
      ? {
          ...r,
          status: "in_progress",
          maintenanceId: 999,
          maintenance: {
            id: 999,
            type: payload.type,
            status: "scheduled",
            isSafe: false,
            scheduledDate: payload.scheduledDate,
          },
          history: [
            ...(r.history || []),
            {
              at: new Date().toISOString(),
              from: r.status,
              to: "in_progress",
              reason: `Đã tạo phiếu bảo dưỡng #${payload.type}`,
            },
          ],
        }
      : r
  );
}
