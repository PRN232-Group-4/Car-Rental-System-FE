import { SubscriptionPlan, CustomerSubscription } from "./types";
import { components } from "@/api/generated/schema";

type BESubscriptionPlan = components["schemas"]["SubscriptionPlan"];
type BECustomerSubscription = Record<string, unknown>;

export function mapSubscriptionPlanFromBE(raw: BESubscriptionPlan | Record<string, unknown>): SubscriptionPlan {
  const r = raw as Record<string, unknown>;
  const id = (r.id ?? r.Id) as number | string;
  const name = String(r.name ?? r.Name ?? "");
  const price = Number(r.price ?? r.Price ?? 0);
  const hours = Number(r.includedHours ?? r.IncludedHours ?? r.hours ?? 0);
  const validityDays = Number(r.durationDays ?? r.DurationDays ?? r.validityDays ?? 0);
  const description = (r.description ?? r.Description ?? null) as string | null;
  const isActive = Boolean(r.isActive ?? r.IsActive ?? true);

  // Derive feature bullets from plan stats if not provided
  let features: string[] = [];
  if (Array.isArray(r.features)) {
    features = r.features as string[];
  } else {
    features = [
      `${hours} giờ sử dụng linh hoạt`,
      `Thời hạn ${validityDays} ngày`,
    ];
  }

  // Chỉ BE quyết định gói nổi bật — không tự suy ra từ số giờ (tránh 2 thẻ cùng "PRIORITY SELECTION").
  const popular = Boolean(r.popular ?? r.Popular ?? false);

  return {
    id,
    name,
    description,
    price,
    hours,
    validityDays,
    popular,
    isActive,
    features,
  };
}

export function mapCustomerSubscriptionFromBE(raw: BECustomerSubscription | Record<string, unknown>): CustomerSubscription {
  const r = raw as Record<string, unknown>;
  const id = (r.id ?? r.Id) as number | string;
  const customerId = (r.customerId ?? r.CustomerId) as number | string;
  const planId = (r.planId ?? r.PlanId) as number | string;
  const planName = (r.planName ?? r.PlanName ?? "Gói thuê bao") as string;
  const startDate = String(r.startDate ?? r.StartDate ?? "");
  const endDate = String(r.endDate ?? r.EndDate ?? "");
  const totalHours = Number(r.totalHours ?? r.TotalHours ?? 0);
  const remainingHours = Number(r.remainingHours ?? r.RemainingHours ?? 0);

  // Derive active/expired based on endDate and remainingHours
  let status = String(r.status ?? r.Status ?? "unknown").toLowerCase();
  const end = new Date(endDate);
  if (end < new Date()) {
    status = "expired";
  } else if (endDate && remainingHours <= 0) {
    status = "depleted";
  }

  return {
    id,
    customerId,
    planId,
    planName,
    startDate,
    endDate,
    totalHours,
    remainingHours,
    status,
  };
}
