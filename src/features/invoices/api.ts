import { defaultApiClient, isMockMode } from "@/api/default-api-client";
import { Invoice, CheckoutResult } from "./types";

const MOCK_INVOICES: Invoice[] = [
  {
    id: 1,
    rentalId: 101,
    invoiceNumber: "INV-2026-00101",
    amount: 3200000,
    vatAmount: 200000,
    status: "pending",
    issuedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    rentalId: 98,
    invoiceNumber: "INV-2026-00098",
    amount: 1980000,
    vatAmount: 180000,
    status: "paid",
    issuedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    dueAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
];

/** BE dùng 'unpaid' cho hoá đơn chưa trả, FE dùng 'pending' — quy về một giá trị để badge/filter khớp. */
function normalizeInvoiceStatus(status: string): string {
  const value = status.toLowerCase();
  return value === "unpaid" ? "pending" : value;
}

export function mapInvoiceFromBE(raw: Record<string, unknown>): Invoice {
  return {
    id: (raw.id ?? raw.Id) as number | string,
    rentalId: (raw.rentalId ?? raw.RentalId) as number | string,
    invoiceNumber: String(raw.invoiceNumber ?? raw.InvoiceNumber ?? `INV-${raw.id}`),
    amount: Number(raw.amount ?? raw.Amount ?? 0),
    vatAmount: Number(raw.vatAmount ?? raw.VatAmount ?? 0),
    status: normalizeInvoiceStatus(String(raw.status ?? raw.Status ?? "pending")),
    issuedAt: String(raw.issuedAt ?? raw.IssuedAt ?? new Date().toISOString()),
    dueAt: (raw.dueAt ?? raw.DueAt) as string | null | undefined,
  };
}

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const raw = await defaultApiClient.get<unknown[]>("invoices");
    if (Array.isArray(raw)) {
      return raw.map((item) => mapInvoiceFromBE(item as Record<string, unknown>));
    }
  } catch (err) {
    if (!isMockMode) throw err;
    console.warn("[Invoices API] Using fallback invoices:", err);
  }
  return MOCK_INVOICES;
}

export async function getInvoiceById(id: number | string): Promise<Invoice | null> {
  try {
    const raw = await defaultApiClient.get<unknown>(`invoices/${id}`);
    if (raw) {
      return mapInvoiceFromBE(raw as Record<string, unknown>);
    }
  } catch (err) {
    if (!isMockMode) throw err;
    console.warn(`[Invoices API] Falling back for invoice ${id}:`, err);
  }
  const found = MOCK_INVOICES.find((inv) => String(inv.id) === String(id));
  return found || null;
}

export async function checkoutInvoice(id: number | string): Promise<CheckoutResult> {
  try {
    const res = await defaultApiClient.post<CheckoutResult>(`invoices/${id}/checkout`);
    return res;
  } catch (err) {
    // Never fabricate a successful checkout in real mode — a failed PayOS
    // session must surface as an error, not as a redirect to "PAID".
    if (!isMockMode) throw err;
    console.warn("[Invoices API] Checkout endpoint fallback:", err);
    // In dev / mock mode fallback to return page
    return {
      orderCode: Number(id) || Date.now(),
      paymentLinkId: `payos_mock_${Date.now()}`,
      checkoutUrl: `/payment/result?orderCode=${id}&status=PAID`,
    };
  }
}
