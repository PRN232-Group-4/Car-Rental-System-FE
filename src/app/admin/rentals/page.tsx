import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import RentalWorkspaceV4 from "@/features/admin/transit-desk/RentalWorkspaceV4";

export default function RentalOperationsPage() {
  return (
    <Suspense fallback={<PageFallback label="Đang tải buồng lái vận hành V4.1..." />}>
      <RentalWorkspaceV4 />
    </Suspense>
  );
}
