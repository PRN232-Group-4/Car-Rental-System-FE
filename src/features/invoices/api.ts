import { defaultApiClient } from "@/api/default-api-client";
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
    invoiceNumber: String(raw.invoiceNumber ?? raw.InvoiceNumber ?? `INV-${raw.id}`),
    amount: Number(raw.amount ?? raw.Amount ?? 0),
    vatAmount: Number(raw.vatAmount ?? raw.VatAmount ?? 0),
    status: normalizeInvoiceStatus(String(raw.status ?? raw.Status ?? "pending")),
    issuedAt: String(raw.issuedAt ?? raw.IssuedAt ?? new Date().toISOString()),
    dueAt: (raw.dueAt ?? raw.DueAt) as string | null | undefined,
    canPay: (raw.canPay ?? raw.CanPay) === true,
    paymentBlockedReason: (raw.paymentBlockedReason ?? raw.PaymentBlockedReason ?? null) as string | null,
    paymentMethod: String(raw.paymentMethod ?? raw.PaymentMethod ?? "payos"),
    orderId: (raw.orderId ?? raw.OrderId ?? null) as number | string | null,
  };
}

export async function getInvoices(): Promise<Invoice[]> {
  const raw = await defaultApiClient.get<unknown[]>("invoices");
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => mapInvoiceFromBE(item as Record<string, unknown>));
}

export async function getInvoiceById(id: number | string): Promise<Invoice | null> {
  const raw = await defaultApiClient.get<unknown>(`invoices/${id}`);
  return raw ? mapInvoiceFromBE(raw as Record<string, unknown>) : null;
}

export async function checkoutInvoice(id: number | string): Promise<CheckoutResult> {
  // Một phiên PayOS lỗi phải nổi lên thành lỗi, không bao giờ giả lập "đã thanh toán".
  return defaultApiClient.post<CheckoutResult>(`invoices/${id}/checkout`);
}

export function confirmCashReceipt(id: number | string) {
  return defaultApiClient.post<{ paymentId: number; invoiceId: number; status: string; orderId: number | null }>(`invoices/${encodeURIComponent(id)}/cash-confirmation`);
}
