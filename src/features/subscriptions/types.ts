export interface SubscriptionPlan {
  id: number | string;
  name: string;
  description?: string | null;
  price: number;
  hours: number; // mapped from includedHours or hours
  validityDays: number; // mapped from durationDays or validityDays
  popular?: boolean;
  isActive?: boolean;
  features: string[];
}

export type SubscriptionStatus = "active" | "expired" | "depleted";

export interface CustomerSubscription {
  id: number | string;
  customerId?: number | string;
  planId: number | string;
  planName?: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  remainingHours: number;
  /** Known values are typed for autocomplete; BE may return others. */
  status: SubscriptionStatus | (string & {});
}

export interface PlanCheckoutResult {
  orderCode: number;
  paymentLinkId: string;
  checkoutUrl: string;
}

export interface PlanPurchaseStatus {
  orderCode: number;
  status: string;
}
