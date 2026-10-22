import { backendApiClient } from "@/api/backend-api-client";
import { getCustomerRental } from "@/features/rentals/customer-rentals-api";
import type { CustomerRentalSummary } from "@/features/rentals/customer-rentals-api";
import type { PagedResult } from "@/features/admin/api";
import type { TripListItem, TripDetail, TripTab, CancellationPreview, CancelTripInput, TripStatus, TripTimelineItem } from "./types";

export interface PagedTripsResult { items: TripListItem[]; totalCount: number; page: number; pageSize: number }
function mapSummary(item: CustomerRentalSummary): TripListItem {
  return { id: item.id, orderId: item.orderId, status: item.status as TripStatus, rentalType: item.rentalType as TripListItem["rentalType"], isSubscription: item.isSubscription, vehicle: { id: item.vehicleId, brand: item.vehicleBrand ?? "", model: item.vehicleModel ?? "", mainImageUrl: item.vehicleImageUrl ?? undefined }, start: item.startTime, end: item.endTime, totalPrice: item.totalPrice, canCancel: item.canCancel === true && ["pending", "pre_inspection"].includes(item.status) };
}
export async function fetchMyTrips(tab: TripTab = "upcoming", page = 1, pageSize = 12): Promise<PagedTripsResult> {
  const result = await backendApiClient.get<PagedResult<CustomerRentalSummary>>("rentals/mine", { tab, page, pageSize });
  return { ...result, items: (result.items ?? []).map(mapSummary) };
}
function imageList(value: string | null) {
  if (!value) return [];
  const text = value.trim();
  if (text.startsWith("[")) {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.some((url) => typeof url !== "string")) throw new Error("Danh sách ảnh kiểm định không hợp lệ.");
    return parsed;
  }
  return text.split(/[\n,;]/).map((url) => url.trim()).filter((url) => /^https?:\/\//i.test(url));
}
export async function fetchMyTripDetail(id: number): Promise<TripDetail> {
  const item = await getCustomerRental(id);
  if (!item || item.id !== id || !item.price || !Number.isFinite(item.price.total) || !Array.isArray(item.timeline) || (item.inspections != null && !Array.isArray(item.inspections))) {
    throw new Error("Dữ liệu chi tiết chuyến đi không hợp lệ. Vui lòng thử lại.");
  }
  return {
    id: item.id, orderId: item.orderId, status: item.status as TripStatus, rentalType: item.rentalType as TripDetail["rentalType"], isSubscription: item.isSubscription,
    vehicle: { ...item.vehicle, mainImageUrl: item.vehicle.mainImageUrl ?? undefined, brand: item.vehicle.brand ?? "", model: item.vehicle.model ?? "" },
    color: item.vehicle.color ?? undefined,
    start: item.start, end: item.end, totalPrice: item.price.total, canCancel: item.canCancel,
    facility: item.facility ? { ...item.facility, phone: item.facility.phone ?? undefined } : undefined, hasDriver: item.hasDriver, pickup: item.pickup ?? undefined, driver: item.driver ? { ...item.driver, avatarUrl: item.driver.avatarUrl ?? undefined, rating: item.driver.rating ?? undefined } : null,
    price: item.price, invoice: item.invoice,
    inspections: (item.inspections ?? []).map((inspection) => ({ ...inspection, type: (inspection.type === "pre" ? "pre_rental" : inspection.type === "post" ? "post_rental" : inspection.type) as "pre_rental" | "post_rental", odometerKm: inspection.odometerKm ?? undefined, fuelBatteryLevel: inspection.fuelBatteryLevel ?? undefined, damageNotes: inspection.damageNotes ?? undefined, imgUrls: imageList(inspection.imgUrls) })),
    timeline: (item.timeline ?? []).map((event) => ({ ...event, to: event.to as TripStatus, actor: event.actor as TripTimelineItem["actor"], reason: event.reason ?? undefined })),
    cancellation: item.cancellation ? { ...item.cancellation, reasons: item.cancellation.reasons ?? undefined, freeUntil: item.cancellation.freeUntil ?? undefined } : undefined,
    settlement: item.settlement ? { ...item.settlement, shortfallInvoiceId: item.settlement.shortfallInvoiceId ?? undefined } : null,
  };
}
export async function fetchCancellationPreview(rentalId: number): Promise<CancellationPreview> {
  const result = await backendApiClient.get<{ allowed: boolean; feeAmount: number; refundAmount: number; freeUntil: string | null }>(`rentals/${rentalId}/cancellation-preview`);
  const total = result.refundAmount + result.feeAmount;
  return { rentalId, canCancel: result.allowed, cancellationFee: result.feeAmount, refundAmount: result.refundAmount, refundPercentage: total ? Math.round(result.refundAmount / total * 100) : 0, freeUntil: result.freeUntil ?? undefined };
}
export async function cancelTrip({ rentalId, reason }: CancelTripInput): Promise<TripDetail> {
  await backendApiClient.post<unknown>(`rentals/${rentalId}/cancel`, { reason, initiator: "customer", waiveFee: false });
  return fetchMyTripDetail(rentalId);
}
