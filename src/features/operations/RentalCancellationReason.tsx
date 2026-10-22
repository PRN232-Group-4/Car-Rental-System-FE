"use client";

import { useQuery } from "@tanstack/react-query";
import CancellationReason from "@/features/rentals/components/CancellationReason";
import { getOperationalRentalDetail, operationalError, type OperationalRental } from "./api";

export default function RentalCancellationReason({ rental }: { rental: OperationalRental }) {
  const query = useQuery({
    queryKey: ["rental-cancellation-reason", rental.id, rental.status],
    queryFn: () => getOperationalRentalDetail(rental.id),
    enabled: rental.status === "cancelled",
    retry: false,
  });
  if (rental.status !== "cancelled") return null;
  if (query.isPending) return <p role="status" className="text-sm text-td-muted">Đang tải lý do hủy đơn...</p>;
  if (query.isError || !query.data?.rental) return <p role="alert" className="text-sm text-danger">{query.isError ? operationalError(query.error) : "Chưa tải được lý do hủy đơn."} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p>;
  const cancellation = [...(query.data.history ?? [])].reverse().find(event => event.toStatus === "cancelled");
  return <CancellationReason reason={query.data.rental.cancelReason?.trim() || cancellation?.reason} cancelledAt={query.data.rental.cancelledAt || cancellation?.createdAt} />;
}
