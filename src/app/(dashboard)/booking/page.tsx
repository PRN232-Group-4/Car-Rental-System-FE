import { Suspense } from "react";
import BookingForm from "@/features/rentals/components/BookingForm";

export const metadata = {
  title: "Tạo đơn thuê xe | Thong Dong",
  description: "Đặt xe theo giờ hoặc thuê dài hạn với quy trình bàn giao số hoá 3 phút.",
};

export default function BookingPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-sm font-semibold text-ink-3">Đang tải biểu mẫu đặt xe...</p>}>
      <BookingForm />
    </Suspense>
  );
}
