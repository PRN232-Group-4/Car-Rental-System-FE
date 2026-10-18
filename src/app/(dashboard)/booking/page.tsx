import { Suspense } from "react";
import BookingForm from "@/features/rentals/components/BookingForm";
import BookingLicenseGate from "@/features/rentals/components/BookingLicenseGate";

export default function BookingPage() {
<<<<<<< Updated upstream
  return <Suspense fallback={<p className="p-6 text-center">Đang tải biểu mẫu đặt xe...</p>}><BookingForm /></Suspense>;
=======
  return (
    <Suspense fallback={<p className="p-6 text-center text-sm font-semibold text-ink-3">Đang tải biểu mẫu đặt xe...</p>}>
      <BookingLicenseGate><BookingForm /></BookingLicenseGate>
    </Suspense>
  );
>>>>>>> Stashed changes
}
