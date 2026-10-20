import { backendApiClient } from "@/api/backend-api-client";
import { unsupportedApi } from "@/api/unsupported";
import type { CreateMaintenancePayload, ReportDetail, ReportFilterParams, ReportStatus } from "./types";

interface IncidentReport {
  id: number; rentalId: number; vehicleId: number; reporterStaffId: number;
  type: string | null; description: string | null; status: string | null;
  maintenanceId: number | null; imageUrls: string | null;
}

function mapReport(record: IncidentReport): ReportDetail {
  const images: unknown = record.imageUrls ? (record.imageUrls.trim().startsWith("[") ? JSON.parse(record.imageUrls) : [record.imageUrls]) : [];
  if (!Array.isArray(images) || images.some((url) => typeof url !== "string")) throw new Error("Danh sách ảnh báo cáo không hợp lệ.");
  return {
    id: record.id, rentalId: record.rentalId, vehicleId: record.vehicleId, maintenanceId: record.maintenanceId,
    type: record.type ?? "other", status: record.status === "open" ? "new" : record.status === "assigned" ? "in_progress" : record.status ?? "unavailable",
    description: record.description ?? "", descriptionPreview: record.description ?? "",
    // IncidentReport does not expose customer identity or timestamps; never invent them.
    createdAt: "", customer: { fullName: "API chưa cung cấp thông tin khách hàng" }, imageUrls: images as string[],
  };
}

async function loadReports(): Promise<ReportDetail[]> {
  const result = await backendApiClient.get<IncidentReport[]>("reports");
  if (!Array.isArray(result)) throw new Error("Dữ liệu báo cáo không hợp lệ. Vui lòng thử lại.");
  return result.map(mapReport);
}

export async function fetchReports(params: ReportFilterParams = {}) {
  if (params.isOverdueSla || params.from || params.to) return unsupportedApi("lọc thời gian/SLA báo cáo (IncidentReport chưa trả createdAt, resolvedAt)");
  const reports = await loadReports();
  let items = reports;
  if (params.status) items = items.filter((r) => r.status === params.status);
  if (params.type) items = items.filter((r) => r.type === params.type);
  if (params.hasRental !== undefined) items = items.filter((r) => Boolean(r.rentalId) === params.hasRental);
  if (params.hasMaintenance !== undefined) items = items.filter((r) => Boolean(r.maintenanceId) === params.hasMaintenance);
  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    items = items.filter((r) => `${r.id} ${r.description}`.toLowerCase().includes(q));
  }
  return {
    items, totalCount: items.length, newCount: reports.filter((r) => r.status === "new").length,
    inProgressCount: reports.filter((r) => r.status === "in_progress").length, resolvedCount: reports.filter((r) => r.status === "resolved").length,
  };
}

export async function fetchReportDetail(id: number): Promise<ReportDetail> {
  const report = (await loadReports()).find((r) => r.id === id);
  if (!report) throw new Error("Không tìm thấy báo cáo. Vui lòng tải lại danh sách.");
  return report;
}

export function resolveReport(id: number): Promise<void> {
  return backendApiClient.post<void>(`reports/${id}/resolve`);
}

export async function updateReportStatus(id: number, status: ReportStatus): Promise<ReportDetail> {
  if (status !== "resolved") return unsupportedApi("tiếp nhận hoặc từ chối báo cáo (cần PATCH /api/reports/{id}/status)");
  await resolveReport(id);
  return fetchReportDetail(id);
}

export async function createMaintenanceFromReport(payload: CreateMaintenancePayload): Promise<void> {
  await backendApiClient.post(`reports/${payload.reportId}/maintenance`, {
    assignedStaffId: payload.assignedStaffId, facilityId: payload.facilityId, scheduledDate: payload.scheduledDate,
  });
}
