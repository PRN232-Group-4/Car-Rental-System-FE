export default function RentalIdentifiers({ rentalId, orderId }: { rentalId: number | string; orderId?: number | string | null }) {
  return <dl aria-label="Mã hồ sơ thuê xe" className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
    <div className="flex flex-wrap gap-x-2"><dt className="text-td-muted">Mã yêu cầu</dt><dd className="font-mono font-semibold text-td-ink">#{rentalId}</dd></div>
    <div className="flex flex-wrap gap-x-2"><dt className="text-td-muted">Mã đơn chính thức</dt><dd className="font-mono font-semibold text-td-ink">{orderId ? `#${orderId}` : orderId === null ? "Chưa phát hành" : "Chưa có thông tin"}</dd></div>
  </dl>;
}
