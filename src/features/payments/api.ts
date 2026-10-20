import { defaultApiClient } from "@/api/default-api-client";
import { PaymentSummary } from "./types";

export interface CheckoutCancellation {
  orderCode: number | string;
  status: string;
}

/**
 * Xác minh với BE (BE hỏi lại payOS) rồi mới đánh dấu giao dịch 'cancelled'. payOS không gửi
 * webhook khi khách huỷ link thanh toán nên đây là bước bắt buộc để hoá đơn/gói không treo ở
 * trạng thái chờ. Trả null khi không huỷ được (BE cũ chưa có endpoint, hoặc link vẫn hiệu lực).
 */
export async function cancelCheckout(orderCode: number | string): Promise<CheckoutCancellation | null> {
  try {
    return await defaultApiClient.post<CheckoutCancellation>(
      `payments/checkouts/${orderCode}/cancel`,
    );
  } catch (err) {
    console.warn("[Payments API] Cancel checkout warning:", err);
    return null;
  }
}

export function mapPaymentFromBE(raw: Record<string, unknown>): PaymentSummary {
  return {
    id: (raw.id ?? raw.Id) as number | string,
    rentalId: (raw.rentalId ?? raw.RentalId) as number | string,
    invoiceId: (raw.invoiceId ?? raw.InvoiceId) as number | string | null,
    type: (raw.type ?? raw.Type) as string | null,
    amount: Number(raw.amount ?? raw.Amount ?? 0),
    status: String(raw.status ?? raw.Status ?? "pending").toLowerCase(),
    method: (raw.method ?? raw.Method) as string | null,
    providerReference: (raw.providerReference ?? raw.ProviderReference) as string | null,
    paidAt: (raw.paidAt ?? raw.PaidAt) as string | null,
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString()),
  };
}

export async function getPayments(invoiceId?: number | string): Promise<PaymentSummary[]> {
  const raw = await defaultApiClient.get<unknown[]>("payments", {
    invoiceId: invoiceId ? Number(invoiceId) : undefined,
  });
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => mapPaymentFromBE(item as Record<string, unknown>));
}
