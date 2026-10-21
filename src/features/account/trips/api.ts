import { backendApiClient } from "@/api/backend-api-client";
import type { CancellationPreview, CancelTripInput, TripDetail, TripListItem, TripTab } from "./types";

export interface PagedTripsResult {
  items: TripListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface RentalSummary {
  id: number;
  status: TripListItem["status"];
  rentalType: TripListItem["rentalType"];
  isSubscription: boolean;
  vehicleId: number;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  vehicleImageUrl: string | null;
  startTime: string;
  endTime: string;
  totalPrice: number;
}

interface CancellationResponse {
  allowed: boolean;
  feeAmount: number;
  refundAmount: number;
  reasons: string[];
  freeUntil?: string;
}

type TripResponse = Omit<TripDetail, "facility" | "totalPrice" | "inspections" | "settlement" | "cancellation"> & {
  facility?: string | null;
  inspections: (Omit<TripDetail["inspections"][number], "imgUrls"> & { imgUrls?: string | null })[];
  settlement?: {
    overtimeHours: number;
    depositHeld: number;
    depositDeducted: number;
    refundPaymentId?: number | null;
    shortfallInvoiceId?: number;
  } | null;
  cancellation?: CancellationResponse;
};

export async function fetchMyTrips(tab: TripTab = "upcoming", page = 1, pageSize = 12): Promise<PagedTripsResult> {
  const result = await backendApiClient.get<{ items: RentalSummary[]; totalCount: number; page: number; pageSize: number }>("rentals/mine", { tab, page, pageSize });
  if (!result || !Array.isArray(result.items)) throw new Error("Dữ liệu chuyến đi không hợp lệ. Vui lòng thử lại.");
  return {
    ...result,
    items: result.items.map((r) => ({
      id: r.id, status: r.status, rentalType: r.rentalType, isSubscription: r.isSubscription,
      vehicle: { id: r.vehicleId, brand: r.vehicleBrand ?? "", model: r.vehicleModel ?? "", mainImageUrl: r.vehicleImageUrl ?? undefined },
      start: r.startTime, end: r.endTime, totalPrice: r.totalPrice,
      // Summary does not include cancellation eligibility; use the detail API before offering it.
      canCancel: false, nextAction: "view",
    })),
  };
}

export async function fetchMyTripDetail(id: number): Promise<TripDetail> {
  const r = await backendApiClient.get<TripResponse>(`rentals/mine/${id}`);
  if (!r || r.id !== id || !r.price || !Array.isArray(r.inspections) || !Array.isArray(r.timeline)) {
    throw new Error("Dữ liệu chi tiết chuyến đi không hợp lệ. Vui lòng thử lại.");
  }
  let refundAmount: number | undefined;
  let refundStatus: "requested" | "paid" | "rejected" | undefined;
  if (r.settlement?.refundPaymentId) {
    const payments = await backendApiClient.get<{ id: number; amount: number; status: string }[]>("payments", { invoiceId: r.invoice?.id });
    const refund = payments.find((payment) => payment.id === r.settlement?.refundPaymentId);
    if (refund) {
      refundAmount = refund.amount;
      if (["requested", "paid", "rejected"].includes(refund.status)) refundStatus = refund.status as typeof refundStatus;
    }
  }
  return {
    ...r,
    totalPrice: r.price.total,
    facility: r.facility ? { name: r.facility } : undefined,
    inspections: r.inspections.map((inspection) => {
      const urls: unknown = inspection.imgUrls ? (inspection.imgUrls.trim().startsWith("[") ? JSON.parse(inspection.imgUrls) : [inspection.imgUrls]) : [];
      if (!Array.isArray(urls) || urls.some((url) => typeof url !== "string")) throw new Error("Danh sách ảnh kiểm định không hợp lệ.");
      return { ...inspection, imgUrls: urls as string[] };
    }),
    settlement: r.settlement ? { ...r.settlement, refundAmount, refundStatus } : null,
    cancellation: r.cancellation,
  };
}

export async function fetchCancellationPreview(rentalId: number): Promise<CancellationPreview> {
  const r = await backendApiClient.get<CancellationResponse>(`rentals/${rentalId}/cancellation-preview`);
  if (!r || typeof r.allowed !== "boolean" || !Number.isFinite(r.feeAmount) || !Number.isFinite(r.refundAmount)) {
    throw new Error("Chưa có thông tin phí hủy hợp lệ. Vui lòng thử lại.");
  }
  const total = r.feeAmount + r.refundAmount;
  return {
    rentalId, canCancel: r.allowed, cancellationFee: r.feeAmount, refundAmount: r.refundAmount,
    refundPercentage: total > 0 ? Math.round(r.refundAmount / total * 100) : 0,
    freeUntil: r.freeUntil, rulesExplanation: r.reasons.join(". "),
  };
}

export async function cancelTrip({ rentalId, reason }: CancelTripInput): Promise<TripDetail> {
  await backendApiClient.post(`rentals/${rentalId}/cancel`, { reason, initiator: "customer", waiveFee: false });
  return fetchMyTripDetail(rentalId);
}
