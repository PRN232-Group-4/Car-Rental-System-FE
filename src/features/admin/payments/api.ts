import { backendApiClient } from "@/api/backend-api-client";
import { mapPaymentFromBE } from "@/features/payments/api";
import type { PaymentSummary } from "@/features/payments/types";

/** GET /payments currently returns a complete ledger array, scoped by the backend. */
export async function getAdminPayments(): Promise<PaymentSummary[]> {
  const raw = await backendApiClient.get<unknown>("payments");
  if (!Array.isArray(raw) || raw.some((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return true;
    const row = item as Record<string, unknown>;
    const id = row.id ?? row.Id;
    return (typeof id !== "number" && typeof id !== "string") ||
      typeof (row.status ?? row.Status) !== "string" ||
      !Number.isFinite(Number(row.amount ?? row.Amount ?? NaN)) ||
      typeof (row.createdAt ?? row.CreatedAt) !== "string";
  })) {
    throw new Error("Dữ liệu thanh toán không hợp lệ. Vui lòng thử tải lại.");
  }
  // Preserve the backend's stable newest-ID-first ledger order.
  return raw.map((item) => {
    const payment = mapPaymentFromBE(item as Record<string, unknown>);
    return { ...payment, type: payment.type?.toLowerCase() ?? null, method: payment.method?.toLowerCase() ?? null };
  });
}
