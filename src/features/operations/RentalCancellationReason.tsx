"use client";

import { useQuery } from "@tanstack/react-query";
import CancellationReason from "@/features/rentals/components/CancellationReason";
import { getOperationalRentalDetail, operationalError, type OperationalRental } from "./api";

/**
 * Khối lý do dừng đơn cho Admin/Staff: đơn bị hủy và đơn hết hạn (FR-042)
 * đều lấy lý do từ lịch sử trạng thái của chính đơn đó.
 */
export default function RentalCancellationReason({ rental }: { rental: OperationalRental }) {
  const stopped = rental.status === "cancelled" || rental.status === "expired";
  const query = useQuery({
    queryKey: ["rental-cancellation-reason", rental.id, rental.status],
    queryFn: () => getOperationalRentalDetail(rental.id),
    enabled: stopped,
    retry: false,
  });
  if (!stopped) return null;
  if (query.isPending) return <p role="status" className="text-sm text-td-muted">{rental.status === "expired" ? "Đang tải lý do hết hạn..." : "Đang tải lý do hủy đơn..."}</p>;
  if (query.isError || !query.data?.rental) return <p role="alert" className="text-sm text-danger">{query.isError ? operationalError(query.error) : "Chưa tải được lý do dừng đơn."} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p>;
  const event = [...(query.data.history ?? [])].reverse().find(entry => entry.toStatus === rental.status);
  const reason = query.data.rental.cancelReason?.trim() || event?.reason;
  if (rental.status === "expired") {
    return <CancellationReason
      title="Lý do hết hạn"
      timestampLabel="Thời điểm hết hạn"
      emptyMessage="Đơn hết hạn vì chưa được duyệt hoặc chưa thanh toán trong thời hạn."
      reason={reason}
      cancelledAt={event?.createdAt}
    />;
  }
  return <CancellationReason reason={reason} cancelledAt={query.data.rental.cancelledAt || event?.createdAt} />;
}
