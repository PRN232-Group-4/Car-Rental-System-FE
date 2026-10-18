import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import AdminRentalsPage from "@/features/operations/AdminRentalsPage";

export default function RentalOperationsPage() {
  return <Suspense fallback={<PageFallback label="Đang tải danh sách đơn thuê..." />}><AdminRentalsPage /></Suspense>;
}
