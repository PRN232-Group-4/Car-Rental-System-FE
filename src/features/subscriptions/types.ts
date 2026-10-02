export interface SubscriptionPlan {
  id: string;
  name: string;
  hours: number;
  validityDays: number;
  price: number;
  popular?: boolean;
  features: string[];
}
