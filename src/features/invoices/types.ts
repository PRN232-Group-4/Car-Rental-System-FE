export type InvoiceStatus = "pending" | "paid" | "cancelled" | "overdue";

export interface Invoice {
  id: number | string;
  rentalId: number | string;
  invoiceNumber: string;
  amount: number;
  vatAmount: number;
  /** Known values are typed for autocomplete; BE may return others. */
  status: InvoiceStatus | (string & {});
  issuedAt: string;
  dueAt?: string | null;
  /** Returned by the detail endpoint; omitted on invoice summaries. */
  canPay?: boolean;
  paymentBlockedReason?: string | null;
  paymentMethod?: "payos" | "cash" | string;
  orderId?: number | string | null;
}

export interface CheckoutResult {
  orderCode: number;
  paymentLinkId: string;
  checkoutUrl: string;
}
