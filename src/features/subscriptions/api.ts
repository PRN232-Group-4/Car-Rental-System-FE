import { defaultApiClient } from "@/api/default-api-client";
import { SubscriptionPlan, CustomerSubscription, PlanCheckoutResult, PlanPurchaseStatus } from "./types";
import { mapSubscriptionPlanFromBE, mapCustomerSubscriptionFromBE } from "./mappers";

export async function getSubscriptionPlans(activeOnly = true): Promise<SubscriptionPlan[]> {
  const rawList = await defaultApiClient.get<unknown[]>("subscription-plans", { activeOnly });
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item) => mapSubscriptionPlanFromBE(item as Record<string, unknown>));
}

export async function getSubscriptionPlanById(id: number | string): Promise<SubscriptionPlan | undefined> {
  const raw = await defaultApiClient.get<unknown>(`subscription-plan/${id}`);
  return raw ? mapSubscriptionPlanFromBE(raw as Record<string, unknown>) : undefined;
}

export async function purchaseSubscriptionPlan(planId: number | string): Promise<PlanCheckoutResult> {
  // BE creates a pending payment and returns the PayOS checkout link; the subscription is
  // activated by the PayOS webhook once payment succeeds.
  return defaultApiClient.post<PlanCheckoutResult>(`subscription-plan/${planId}/purchase`);
}

export async function getPlanPurchaseStatus(orderCode: number | string): Promise<PlanPurchaseStatus> {
  return defaultApiClient.get<PlanPurchaseStatus>(`subscription-plans/purchase/${orderCode}`);
}

export async function getMySubscriptions(): Promise<CustomerSubscription[]> {
  const raw = await defaultApiClient.get<unknown[]>("customer-subscriptions");
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => mapCustomerSubscriptionFromBE(item as Record<string, unknown>));
}

export function getInitialSubscriptionPlans(): SubscriptionPlan[] {
  return [];
}
