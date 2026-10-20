import { backendApiClient } from "@/api/backend-api-client";
import type { PagedResult } from "@/features/admin/api";
import type { OperationalRentalListItem } from "./rental-list-api";
import type { OperationalRentalDetail } from "./api";

export interface RentalFilters { status?: string; customerId?: number; vehicleId?: number; from?: string; to?: string; page: number; pageSize: number }
export interface HandoverSummary { rental: OperationalRentalListItem; status: string | null }
export interface HandoverDetail { rental: OperationalRentalDetail; status: string | null }
export const getHandovers = (query: RentalFilters, signal?: AbortSignal) => backendApiClient.get<PagedResult<HandoverSummary>>("handovers", { ...query }, { signal });
export const getHandover = (id: number | string) => backendApiClient.get<HandoverDetail>(`handovers/${id}`);
