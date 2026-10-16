import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import MaintenanceManager from "@/features/operations/MaintenanceManager";

export default function MaintenancePage() {
  return <Suspense fallback={<PageFallback label="Đang tải màn hình bảo trì..." />}><MaintenanceManager /></Suspense>;
}
