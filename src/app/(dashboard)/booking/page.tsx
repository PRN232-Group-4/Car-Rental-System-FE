import { Suspense } from "react";
import BookingForm from "@/features/rentals/components/BookingForm";

export default function BookingPage() {
  return <Suspense fallback={<p className="p-6 text-center">Đang tải biểu mẫu đặt xe...</p>}><BookingForm /></Suspense>;
}
