export type PaymentStatus = "pending" | "paid" | "requested" | "refunded" | "rejected";
export type PaymentType = "deposit" | "rental" | "refund" | "overtime" | "subscription";

export interface PaymentSummary {
  id: number | string;
  rentalId?: number | string | null;
  invoiceId?: number | string | null;
  /** Known values are typed for autocomplete; BE may return others. */
  type?: PaymentType | (string & {}) | null;
  amount: number;
  /** Known values are typed for autocomplete; BE may return others. */
  status: PaymentStatus | (string & {});
  method?: string | null;
  providerReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
}
