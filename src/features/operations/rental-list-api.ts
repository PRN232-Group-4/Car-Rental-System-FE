import { backendApiClient } from "@/api/backend-api-client";
import type { PagedResult } from "@/features/admin/api";

export interface OperationalRentalListItem {
  id: number;
  orderId?: number | null;
  customerId: number;
  customerName: string;
  customerEmail: string;
  vehicleId: number;
  licensePlate: string | null;
  vehicleModel: string;
  status: string;
  isOverdue?: boolean;
  startTime: string;
  endTime: string;
  totalPrice: number;
  hasDriver: boolean;
  driverName: string | null;
}

export function getOperationalRentals(query: import("./handover-api").RentalFilters, signal?: AbortSignal) {
  return backendApiClient.get<PagedResult<OperationalRentalListItem>>("rentals", { ...query }, { signal });
}
