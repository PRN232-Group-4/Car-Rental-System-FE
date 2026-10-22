"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvoiceById } from "@/features/invoices";
import { getOperationalRentalDetail, type OperationalRental } from "./api";

export function useRentalInvoice(rental: OperationalRental | null, allowed = true) {
  return useQuery({
    queryKey: ["operational-invoice", rental?.id, rental?.invoiceId, rental?.status],
    queryFn: async () => {
      if (!rental) return null;
      const invoiceId = rental.invoiceId ?? (await getOperationalRentalDetail(rental.id)).invoice?.id;
      return invoiceId ? getInvoiceById(invoiceId) : null;
    },
    enabled: allowed && !!rental && !rental.isSubscription && ["pending", "pre_inspection"].includes(rental.status),
    retry: false,
    staleTime: 5000,
    refetchInterval: state => state.state.data?.status === "paid" ? false : 5000,
  });
}
