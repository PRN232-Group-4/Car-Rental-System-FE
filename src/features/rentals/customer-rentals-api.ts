import { backendApiClient } from "@/api/backend-api-client";
import type { PagedResult } from "@/features/admin/api";

export interface CustomerRentalSummary {
  id: number;
  orderId?: number | null;
  status: string;
  rentalType: string;
  isSubscription: boolean;
  vehicleId: number;
  vehicleImageUrl?: string | null;
  vehicleBrand: string;
  vehicleModel: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  canCancel?: boolean;
  /** VEHICLE_CHANGE_REQUIRED khi xe hiện tại không đạt kiểm tra trước thuê. */
  nextAction?: string | null;
  /** FR-042: hạn duyệt + thanh toán của yêu cầu. */
  expireAt?: string | null;
}

export interface CustomerRentalDetail {
  id: number;
  orderId?: number | null;
  status: string;
  rentalType: string;
  isSubscription: boolean;
  vehicle: { id: number; brand: string; model: string; mainImageUrl?: string | null; color?: string | null };
  facility: { id: number; name: string; phone: string | null } | null;
  start: string;
  end: string;
  hasDriver: boolean;
  driver: { fullName: string; avatarUrl?: string | null; rating?: number | null } | null;
  price: { rent: number; total: number; deposit: number; vat: number; overtime: number };
  invoice: { id: number; number: string; status: string; amount: number } | null;
  timeline: { to: string; at: string; actor: string; reason: string | null }[];
  canCancel: boolean;
  pickup?: { method?: string; location?: string } | null;
  inspections?: { type: string; isOk: boolean; odometerKm: number | null; fuelBatteryLevel: number | null; damageNotes: string | null; imgUrls: string | null; inspectedAt: string }[] | null;
  settlement?: { overtimeHours: number; depositHeld: number; depositDeducted: number; shortfallInvoiceId: number | null } | null;
  cancellation?: { allowed: boolean; feeAmount: number; refundAmount: number; reasons: string[] | null; freeUntil: string | null } | null;
  nextAction: string | null;
  /** FR-042: hạn duyệt + thanh toán của yêu cầu. */
  expireAt?: string | null;
}

export function getCustomerRentals(page = 1, tab = "", pageSize = 20) {
  return backendApiClient.get<PagedResult<CustomerRentalSummary>>("rentals/mine", { page, pageSize, tab: tab || undefined });
}

export function getCustomerRental(id: number) {
  return backendApiClient.get<CustomerRentalDetail>(`rental/mine/${id}`);
}
