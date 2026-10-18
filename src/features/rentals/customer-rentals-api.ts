import { backendApiClient } from "@/api/backend-api-client";
import type { PagedResult } from "@/features/admin/api";

export interface CustomerRentalSummary {
  id: number;
  orderId?: number | null;
  status: string;
  rentalType: string;
  isSubscription: boolean;
  vehicleBrand: string;
  vehicleModel: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}

export interface CustomerRentalDetail {
  id: number;
  orderId?: number | null;
  status: string;
  rentalType: string;
  isSubscription: boolean;
  vehicle: { id: number; brand: string; model: string };
  facility: string;
  start: string;
  end: string;
  hasDriver: boolean;
  driver: { fullName: string } | null;
  price: { total: number; deposit: number; vat: number; overtime: number };
  invoice: { id: number; number: string; status: string; amount: number } | null;
  timeline: { to: string; at: string; actor: string; reason: string | null }[];
  nextAction: string | null;
}

export function getCustomerRentals(page = 1, tab = "") {
  return backendApiClient.get<PagedResult<CustomerRentalSummary>>("rentals/mine", { page, pageSize: 20, tab: tab || undefined });
}

export function getCustomerRental(id: number) {
  return backendApiClient.get<CustomerRentalDetail>(`rentals/mine/${id}`);
}
