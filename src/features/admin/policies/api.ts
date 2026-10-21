import { backendApiClient } from "@/api/backend-api-client";
import type { PlanInput, PolicyInput, RentalPolicy, SubscriptionPlan, VehicleTypeOption } from "./types";

export function fetchVehicleTypes(): Promise<VehicleTypeOption[]> {
  return backendApiClient.get<VehicleTypeOption[]>("vehicle-types");
}

export async function fetchRentalPolicies(): Promise<RentalPolicy[]> {
  const policies: RentalPolicy[] = [];
  let page = 1;
  while (true) {
    const result = await backendApiClient.get<{ items: RentalPolicy[]; totalCount: number }>("rental-policies", { page, pageSize: 100 });
    if (!result || !Array.isArray(result.items)) throw new Error("Dữ liệu chính sách không hợp lệ. Vui lòng thử lại.");
    policies.push(...result.items);
    if (policies.length >= result.totalCount) return policies;
    if (!result.items.length) throw new Error("Chưa tải đủ danh sách chính sách. Vui lòng thử lại.");
    page++;
  }
}

export function createRentalPolicy(input: PolicyInput): Promise<RentalPolicy> {
  return backendApiClient.post<RentalPolicy>("rental-policies", input);
}

export function fetchSubscriptionPlans(includeAll = true): Promise<SubscriptionPlan[]> {
  return backendApiClient.get<SubscriptionPlan[]>("subscription-plans", { all: includeAll });
}

export function createSubscriptionPlan(input: PlanInput): Promise<SubscriptionPlan> {
  return backendApiClient.post<SubscriptionPlan>("subscription-plans", input);
}

export function updateSubscriptionPlan(id: number, input: PlanInput): Promise<SubscriptionPlan> {
  return backendApiClient.put<SubscriptionPlan>(`subscription-plans/${id}`, input);
}

export function deleteSubscriptionPlan(id: number): Promise<void> {
  return backendApiClient.delete<void>(`subscription-plans/${id}`);
}
