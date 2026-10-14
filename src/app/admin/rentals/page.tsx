import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import RentalOperations from "@/features/operations/RentalOperations";

export default function RentalOperationsPage() {
  return <Suspense fallback={<PageFallback label="Đang tải màn hình vận hành..." />}><RentalOperations /></Suspense>;
}
