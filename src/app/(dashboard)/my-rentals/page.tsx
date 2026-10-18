import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import CustomerRentals from "@/features/rentals/components/CustomerRentals";

export default function MyRentalsPage() {
  return <Suspense fallback={<PageFallback label="Đang tải đơn thuê của bạn..." />}><CustomerRentals /></Suspense>;
}
