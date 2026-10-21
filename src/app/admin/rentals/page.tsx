import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import RentalAdminEntry from "@/features/operations/RentalAdminEntry";

export default function RentalOperationsPage() {
  return (
    <Suspense fallback={<PageFallback label="Đang tải buồng lái vận hành V4.1..." />}>
      <RentalAdminEntry />
    </Suspense>
  );
}
