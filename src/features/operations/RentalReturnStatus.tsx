"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "@/components/navigation/NavigationLink";
import { formatAdminDateTime } from "@/lib/date-time";
import { getOperationalRentalDetail, operationalError, type OperationalRental } from "./api";
import OvertimePaymentPanel from "./OvertimePaymentPanel";
import { rentalTimestamp } from "./rental-overdue";

const money = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

export default function RentalReturnStatus({ rental }: { rental: OperationalRental }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const visible = ["renting", "post_inspection", "completed"].includes(rental.status);
  const query = useQuery({ queryKey: ["rental-return-status", rental.id, rental.status], queryFn: () => getOperationalRentalDetail(rental.id), enabled: visible, retry: false });
  if (!visible) return null;
  const entity = query.data?.rental;
  const settlement = query.data?.settlement;
  const returnedAt = entity?.returnedAt ?? settlement?.returnedAt;
  const due = entity?.scheduledEnd;
  const overdue = rental.status === "renting" && !returnedAt && rentalTimestamp(due) < now;
  const returnedLate = rentalTimestamp(returnedAt) > rentalTimestamp(due);
  return <section aria-label="Trả xe và phí quá hạn" className="space-y-3 border-t border-td-rule pt-4 text-sm" aria-busy={query.isFetching}>
    <h3 className="font-bold text-td-ink">Trả xe và phí quá hạn</h3>
    {query.isPending ? <p role="status">Đang tải tình trạng trả xe...</p> : query.error || !entity ? <p role="alert" className="text-danger">{query.error ? operationalError(query.error) : "Chưa tải được thông tin trả xe."} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p> : <>
      <p>Hạn trả xe: {formatAdminDateTime(new Date(rentalTimestamp(due)))}</p>
      <p className="font-semibold">{returnedAt ? `Đã nhận lại xe: ${formatAdminDateTime(new Date(rentalTimestamp(returnedAt)))}` : rental.status === "renting" ? "Chưa xác nhận nhận lại xe" : "Chưa có thời điểm trả xe được ghi nhận"}</p>
      {overdue && <p role="status" className="text-danger">Đã quá hạn trả xe, chưa ghi nhận xe được trả. Phí quá giờ được tính đến thời điểm nhận lại xe và chốt theo chính sách khi quyết toán.</p>}
      {returnedLate && <p className="text-danger">Đã trả xe trễ so với hạn hợp đồng. Giờ trả thực tế và kết quả quyết toán được lưu trong hồ sơ đơn.</p>}
      {rental.status === "renting" && <p className="text-td-muted">Khi xe thực tế được trả, bấm “Xác nhận đã nhận lại xe” trong bảng lệnh. Máy chủ ghi thời điểm nhận và chuyển sang kiểm tra sau thuê.</p>}
      {rental.status === "post_inspection" && <p className="text-td-muted">Hoàn tất kiểm tra sau thuê, sau đó quyết toán để hệ thống tính phí quá giờ theo chính sách.</p>}
      {settlement && <dl className="grid gap-2 sm:grid-cols-2">
        <div><dt className="text-td-muted">Giờ quá hạn tính phí</dt><dd>{settlement.overtimeHours}</dd></div>
        <div><dt className="text-td-muted">Phí quá giờ</dt><dd>{money(settlement.overtimeAmount)}</dd></div>
        <div><dt className="text-td-muted">VAT phí quá giờ</dt><dd>{money(settlement.overtimeVat)}</dd></div>
        <div><dt className="text-td-muted">Đã trừ từ cọc</dt><dd>{money(settlement.depositDeducted)}</dd></div>
      </dl>}
      {settlement?.shortfallInvoiceId != null && <Link href={`/invoices/${settlement.shortfallInvoiceId}`} className="font-semibold text-td-oxide underline">Xem hóa đơn phí quá giờ còn thiếu</Link>}
      {settlement?.shortfallInvoiceId != null && <OvertimePaymentPanel key={settlement.shortfallInvoiceId} invoiceId={settlement.shortfallInvoiceId} />}
      {settlement && settlement.shortfallInvoiceId == null && <p>Không có hóa đơn phụ phí còn thiếu sau quyết toán.</p>}
    </>}
  </section>;
}
