import { Suspense } from "react";
import RentalOperations from "@/features/operations/RentalOperations";

export default function RentalOperationsPage() {
  return <Suspense fallback={<p className="p-6">Đang tải màn hình vận hành...</p>}><RentalOperations /></Suspense>;
}
