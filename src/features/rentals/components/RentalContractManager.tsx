"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import { useQuery } from "@tanstack/react-query";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { formatAdminDateTime } from "@/lib/date-time";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import { getRentalById } from "../api";
import { getCustomerRentals, type CustomerRentalSummary } from "../customer-rentals-api";
import { signedContractDocumentHref } from "../signed-contract";
import RentalStatusTracker from "./RentalStatusTracker";
import ContractPreview from "./ContractPreview";

const errorText = (error: unknown) => error instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : error instanceof Error ? error.message : "Không tải được hợp đồng. Vui lòng thử lại.";

/** Gom mọi trang đơn thuê của khách rồi giữ lại đơn dài hạn (mỗi đơn dài hạn có một hợp đồng). */
async function getAllLongtermRentals(): Promise<CustomerRentalSummary[]> {
  const rentals: CustomerRentalSummary[] = [];
  for (let page = 1; ; page++) {
    const result = await getCustomerRentals(page, "", 100);
    const items = result?.items ?? [];
    rentals.push(...items);
    if (!items.length || rentals.length >= (result?.totalCount ?? 0)) break;
  }
  return rentals.filter((rental) => rental.rentalType === "longterm").sort((left, right) => right.id - left.id);
}

function ContractDetail({ rentalId }: { rentalId: number }) {
  const query = useQuery({ queryKey: ["rental-contract", String(rentalId)], queryFn: () => getRentalById(rentalId), retry: false });
  if (query.isPending) return <FormSkeleton label="Đang tải hợp đồng" fields={2} />;
  if (query.error) return <p role="alert" className="text-sm text-danger">{errorText(query.error)} <button type="button" className="underline" onClick={() => void query.refetch()}>Thử lại</button></p>;
  const contract = query.data;
  const href = signedContractDocumentHref(contract);
  if (!contract.hasUploadedContract) {
    return <p className="text-sm text-td-muted">Nhân viên chưa tải hợp đồng đã ký lên hệ thống. Hợp đồng sẽ hiển thị tại đây sau khi được cập nhật.{href && <> <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">Mở tài liệu hợp đồng</a></>}</p>;
  }
  return <div className="space-y-2">
    <p className="text-sm text-td-muted">Đã ký{contract.signedAt ? ` lúc ${formatAdminDateTime(contract.signedAt)}` : ""}.</p>
    {href && <ContractPreview href={href} title={`Hợp đồng đã ký của đơn #${contract.id}`} />}
  </div>;
}

export default function RentalContractManager() {
  const params = useSearchParams();
  const initial = Number(params.get("rentalId"));
  const [openId, setOpenId] = useState<number | null>(Number.isSafeInteger(initial) && initial > 0 ? initial : null);
  const list = useQuery({ queryKey: ["customer-longterm-contracts"], queryFn: getAllLongtermRentals, retry: false });

  return <section className="space-y-6">
    <TransitFolio
      title="Hợp đồng thuê dài hạn"
      description="Danh sách hợp đồng của các đơn thuê dài hạn. Hợp đồng đã ký do nhân viên tải lên; bạn có thể xem trước và tải về tại đây."
    />
    <div className="space-y-4" aria-busy={list.isFetching}>
      {list.isPending ? <FormSkeleton label="Đang tải danh sách hợp đồng" fields={4} />
        : list.error ? <p role="alert" className="text-sm text-danger">{errorText(list.error)} <button type="button" className="underline" onClick={() => void list.refetch()}>Thử lại</button></p>
          : !list.data.length ? <p className="text-sm text-td-muted">Bạn chưa có đơn thuê dài hạn nào.</p>
            : <div className="divide-y divide-td-rule border-y border-td-ink">{list.data.map((rental) => {
              const isOpen = openId === rental.id;
              return <article key={rental.id} className="space-y-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-bold">{rental.orderId ? `Đơn thuê #${rental.orderId}` : `Yêu cầu thuê #${rental.id}`}</h2>
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? null : rental.id)} className="text-sm font-semibold text-primary underline">{isOpen ? "Ẩn hợp đồng" : "Xem hợp đồng"}</button>
                </div>
                <p className="text-sm font-semibold text-td-ink">{rental.vehicleBrand} {rental.vehicleModel}</p>
                <p className="font-mono text-[11px] text-td-muted">{formatAdminDateTime(rental.startTime)} → {formatAdminDateTime(rental.endTime)}</p>
                <RentalStatusTracker status={rental.status} />
                {isOpen && <ContractDetail rentalId={rental.id} />}
              </article>;
            })}</div>}
    </div>
    <Link href="/booking?mode=longterm" className="inline-block text-primary underline">Đặt xe dài hạn</Link>
  </section>;
}
