import { backendApiClient as defaultApiClient } from "@/api/backend-api-client";
import { Invoice, CheckoutResult } from "./types";

/** BE dùng 'unpaid' cho hoá đơn chưa trả, FE dùng 'pending' — quy về một giá trị để badge/filter khớp. */
function normalizeInvoiceStatus(status: string): string {
  const value = status.toLowerCase();
  return value === "unpaid" ? "pending" : value;
}

export function mapInvoiceFromBE(raw: Record<string, unknown>): Invoice {
  return {
    id: (raw.id ?? raw.Id) as number | string,
    rentalId: (raw.rentalId ?? raw.RentalId) as number | string,
    invoiceNumber: String(raw.invoiceNumber ?? raw.InvoiceNumber ?? "Chưa có số hóa đơn"),
    amount: Number(raw.amount ?? raw.Amount ?? 0),
    vatAmount: Number(raw.vatAmount ?? raw.VatAmount ?? 0),
    status: normalizeInvoiceStatus(String(raw.status ?? raw.Status ?? "pending")),
    issuedAt: String(raw.issuedAt ?? raw.IssuedAt ?? ""),
    dueAt: (raw.dueAt ?? raw.DueAt) as string | null | undefined,
    canPay: (raw.canPay ?? raw.CanPay) === true,
    paymentBlockedReason: (raw.paymentBlockedReason ?? raw.PaymentBlockedReason ?? null) as string | null,
    paymentMethod: String(raw.paymentMethod ?? raw.PaymentMethod ?? "payos"),
    orderId: (raw.orderId ?? raw.OrderId ?? null) as number | string | null,
  };
}

export async function getInvoices(): Promise<Invoice[]> {
  const records: Invoice[] = [];
  for (let page = 1; ; page++) {
    const raw = await defaultApiClient.get<Record<string, unknown>[] | { items: Record<string, unknown>[] | null; totalCount: number }>("invoices", { page, pageSize: 100 });
    if (Array.isArray(raw)) return raw.map(mapInvoiceFromBE);
    if (!raw || !("items" in raw)) throw new Error("Máy chủ trả danh sách hóa đơn không đúng định dạng.");
    records.push(...(raw.items ?? []).map(mapInvoiceFromBE));
    if (!raw.items?.length || records.length >= raw.totalCount) return records;
  }
}
export async function getInvoiceById(id: number | string): Promise<Invoice | null> {
  const raw = await defaultApiClient.get<Record<string, unknown>>(`invoices/${id}`);
  return raw ? mapInvoiceFromBE(raw) : null;
}
export const checkoutInvoice = (id: number | string) => defaultApiClient.post<CheckoutResult>(`invoices/${id}/checkout`);
export function confirmCashReceipt(id: number | string) {
  return defaultApiClient.post<{ paymentId: number; invoiceId: number; status: string; orderId: number | null }>(`invoices/${encodeURIComponent(id)}/cash-confirmation`);
}
