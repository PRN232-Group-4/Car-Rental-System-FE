import { defaultApiClient } from "@/api/default-api-client";
import { MOCK_SUBSCRIPTION_PLANS } from "@/api/mock/mock-catalog";
import { SubscriptionPlan } from "./types";

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    return await defaultApiClient.get<SubscriptionPlan[]>("subscription-plans");
  } catch (error) {
    console.warn("[Subscriptions API] Fallback to static mock:", error);
    return MOCK_SUBSCRIPTION_PLANS;
  }
}

export async function getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | undefined> {
  try {
    return await defaultApiClient.get<SubscriptionPlan>(`subscription-plans/${id}`);
  } catch {
    return MOCK_SUBSCRIPTION_PLANS.find((p) => p.id === id);
  }
}

export function getInitialSubscriptionPlans(): SubscriptionPlan[] {
  return MOCK_SUBSCRIPTION_PLANS;
}
