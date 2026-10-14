import { Suspense } from "react";
import RentalInspections from "@/features/operations/RentalInspections";

export default function RentalInspectionsPage() {
  return <Suspense fallback={<p className="p-6">Đang tải màn hình kiểm tra xe...</p>}><RentalInspections /></Suspense>;
}
