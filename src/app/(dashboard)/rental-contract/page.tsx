import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import RentalContractManager from "@/features/rentals/components/RentalContractManager";

export default function RentalContractPage() {
  return <Suspense fallback={<PageFallback label="Đang tải hợp đồng thuê..." />}><RentalContractManager /></Suspense>;
}
