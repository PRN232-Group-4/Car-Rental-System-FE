import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { backendApiClient } from "@/api/backend-api-client";
import { fetchReports, resolveReport, updateReportStatus, createMaintenanceFromReport } from "@/features/admin/reports/api";
import { ReportDetailView } from "@/features/admin/reports/components/ReportDetailView";
import type { ReportDetail } from "@/features/admin/reports/types";

vi.mock("@/features/auth/AuthContext", () => ({ useAuth: () => ({ hasAnyRole: () => true }) }));
beforeEach(() => vi.restoreAllMocks());

const report: ReportDetail = {
  id: 901, rentalId: 71, vehicleId: 40, status: "new", type: "incident", createdAt: "",
  customer: { fullName: "API chưa cung cấp thông tin khách hàng" },
  description: '<script>alert("XSS")</script>', descriptionPreview: "Va chạm nhẹ",
};

function renderDetail() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><ReportDetailView report={report} /></QueryClientProvider>);
}

describe("Reports use the deployed incident API", () => {
  it("maps flat responses without invented customer identities or timestamps", async () => {
    vi.spyOn(backendApiClient, "get").mockResolvedValue([{ id: 901, rentalId: 71, vehicleId: 40, reporterStaffId: 2, status: "open", type: "incident", description: "Va chạm nhẹ", maintenanceId: null, imageUrls: '["https://example.com/image.jpg"]' }]);
    const result = await fetchReports();
    expect(result.items[0]).toMatchObject({ id: 901, status: "new", createdAt: "", imageUrls: ["https://example.com/image.jpg"] });
    expect(result.items[0].customer.id).toBeUndefined();
  });
  it("never returns a fallback list or successful resolve after a network error", async () => {
    const error = new Error("Mất kết nối");
    vi.spyOn(backendApiClient, "get").mockRejectedValue(error);
    vi.spyOn(backendApiClient, "post").mockRejectedValue(error);
    await expect(fetchReports()).rejects.toBe(error);
    await expect(resolveReport(901)).rejects.toBe(error);
  });
  it("does not invent status endpoints and sends the technician to maintenance", async () => {
    const post = vi.spyOn(backendApiClient, "post").mockResolvedValue({ id: 22 });
    await expect(updateReportStatus(901, "rejected")).rejects.toMatchObject({ status: 501 });
    expect(post).not.toHaveBeenCalled();
    await createMaintenanceFromReport({ reportId: 901, assignedStaffId: 17, facilityId: 5, scheduledDate: "2027-01-01" });
    expect(post).toHaveBeenCalledWith("reports/901/maintenance", { assignedStaffId: 17, facilityId: 5, scheduledDate: "2027-01-01" });
  });
  it("renders XSS as plain text and omits unsupported rejection", () => {
    const { container } = renderDetail();
    expect(screen.getByText('<script>alert("XSS")</script>')).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByRole("button", { name: "Từ chối" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("API chỉ hỗ trợ");
  });
  it("keeps the confirmation open and displays the API error on resolve failure", async () => {
    vi.spyOn(backendApiClient, "post").mockRejectedValue(new Error("Không thể cập nhật báo cáo"));
    renderDetail();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Giải quyết sự cố" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Không thể cập nhật báo cáo"));
    expect(screen.getByText('<script>alert("XSS")</script>')).toBeInTheDocument();
  });
});
