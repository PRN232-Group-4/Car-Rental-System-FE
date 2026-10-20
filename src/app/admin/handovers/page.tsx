import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import AdminRentalsPage from "@/features/operations/AdminRentalsPage";
export default function HandoversPage() {
  return <Suspense fallback={<PageFallback label="Đang tải bàn giao xe..." />}><AdminRentalsPage handovers /></Suspense>;
}
