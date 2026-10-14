import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import RentalInspections from "@/features/operations/RentalInspections";

export default function RentalInspectionsPage() {
  return <Suspense fallback={<PageFallback label="Đang tải màn hình kiểm tra xe..." />}><RentalInspections /></Suspense>;
}
