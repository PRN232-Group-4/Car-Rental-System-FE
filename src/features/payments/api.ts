import { defaultApiClient, isMockMode } from "@/api/default-api-client";
import { PaymentSummary } from "./types";

const MOCK_PAYMENTS: PaymentSummary[] = [
  {
    id: 1,
    rentalId: 98,
    invoiceId: 2,
    type: "rental",
    amount: 1980000,
    status: "paid",
    method: "payos",
    providerReference: "PAYOS-9812401",
    paidAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    rentalId: 98,
    invoiceId: 2,
    type: "refund",
    amount: 2000000,
    status: "paid",
    method: "deposit",
    providerReference: "REFUND-DEP-98",
    paidAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 3,
    rentalId: 101,
    invoiceId: 1,
    type: "deposit",
    amount: 2000000,
    status: "requested",
    method: "deposit",
    providerReference: null,
    paidAt: null,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

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
  try {
    const raw = await defaultApiClient.get<unknown[]>("payments", {
      invoiceId: invoiceId ? Number(invoiceId) : undefined,
    });
    if (Array.isArray(raw)) {
      return raw.map((item) => mapPaymentFromBE(item as Record<string, unknown>));
    }
  } catch (err) {
    if (!isMockMode) throw err;
    console.warn("[Payments API] Using fallback payments:", err);
  }

  let list = MOCK_PAYMENTS;
  if (invoiceId) {
    list = list.filter((p) => String(p.invoiceId) === String(invoiceId));
  }
  return list;
}
