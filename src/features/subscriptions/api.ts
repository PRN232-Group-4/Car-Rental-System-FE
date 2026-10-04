import { defaultApiClient, isMockMode } from "@/api/default-api-client";
import { MOCK_SUBSCRIPTION_PLANS } from "@/api/mock/mock-catalog";
import { SubscriptionPlan, CustomerSubscription, PlanCheckoutResult, PlanPurchaseStatus } from "./types";
import { mapSubscriptionPlanFromBE, mapCustomerSubscriptionFromBE } from "./mappers";

const MOCK_MY_SUBSCRIPTIONS: CustomerSubscription[] = [
  {
    id: 1,
    customerId: 1,
    planId: 2,
    planName: "Gói Đô Thị 20 Giờ",
    startDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(),
    totalHours: 20,
    remainingHours: 14.5,
    status: "active",
  },
];

export async function getSubscriptionPlans(activeOnly = true): Promise<SubscriptionPlan[]> {
  try {
    const rawList = await defaultApiClient.get<unknown[]>("subscription-plans", {
      activeOnly,
    });
    if (Array.isArray(rawList)) {
      return rawList.map((item) => mapSubscriptionPlanFromBE(item as Record<string, unknown>));
    }
  } catch (error) {
    if (!isMockMode) throw error;
    console.warn("[Subscriptions API] Error fetching subscription-plans, using fallback:", error);
  }
  return MOCK_SUBSCRIPTION_PLANS.map((item) => mapSubscriptionPlanFromBE(item as unknown as Record<string, unknown>));
}

export async function getSubscriptionPlanById(id: number | string): Promise<SubscriptionPlan | undefined> {
  try {
    const raw = await defaultApiClient.get<unknown>(`subscription-plans/${id}`);
    if (raw) {
      return mapSubscriptionPlanFromBE(raw as Record<string, unknown>);
    }
  } catch (error) {
    if (!isMockMode) throw error;
  }
  const found = MOCK_SUBSCRIPTION_PLANS.find((p) => String(p.id) === String(id));
  return found ? mapSubscriptionPlanFromBE(found as unknown as Record<string, unknown>) : undefined;
}

export async function purchaseSubscriptionPlan(planId: number | string): Promise<PlanCheckoutResult> {
  // BE creates a pending payment and returns the PayOS checkout link; the subscription is
  // activated by the PayOS webhook once payment succeeds.
  return defaultApiClient.post<PlanCheckoutResult>(`subscription-plans/${planId}/purchase`);
}

export async function getPlanPurchaseStatus(orderCode: number | string): Promise<PlanPurchaseStatus> {
  return defaultApiClient.get<PlanPurchaseStatus>(`subscription-plans/purchases/${orderCode}`);
}

export async function getMySubscriptions(): Promise<CustomerSubscription[]> {
  try {
    const raw = await defaultApiClient.get<unknown[]>("customer-subscriptions");
    if (Array.isArray(raw)) {
      return raw.map((item) => mapCustomerSubscriptionFromBE(item as Record<string, unknown>));
    }
  } catch (error) {
    if (!isMockMode) throw error;
    console.info("[Subscriptions API] GET /customer-subscriptions not yet available on BE, using client session fallback.");
  }
  return MOCK_MY_SUBSCRIPTIONS;
}

export function getInitialSubscriptionPlans(): SubscriptionPlan[] {
  if (!isMockMode) return [];
  return MOCK_SUBSCRIPTION_PLANS.map((item) => mapSubscriptionPlanFromBE(item as unknown as Record<string, unknown>));
}
