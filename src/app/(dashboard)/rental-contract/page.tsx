import { Suspense } from "react";
import RentalContractManager from "@/features/rentals/components/RentalContractManager";

export default function RentalContractPage() {
  return <Suspense fallback={<p className="p-6 text-center">Đang tải hợp đồng...</p>}><RentalContractManager /></Suspense>;
}
